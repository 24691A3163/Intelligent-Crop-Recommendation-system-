from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd
import torch
from fastapi import HTTPException

from backend.app.services.model_loader import registry
from backend.app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
    CropProbability,
    ModelComparisonItem,
    AllModelsPredictionResponse
)

def _get_input_df(req: PredictionRequest) -> pd.DataFrame:
    """Builds dataframe in exact feature order expected by scalers and models."""
    data = {
        "N": req.nitrogen,
        "P": req.phosphorus,
        "K": req.potassium,
        "temperature": req.temperature,
        "humidity": req.humidity,
        "ph": req.ph,
        "rainfall": req.rainfall
    }
    # Ensure exact column order as saved in selected_features
    df = pd.DataFrame([[data[f] for f in registry.features]], columns=registry.features)
    return df

def predict_single(req: PredictionRequest) -> PredictionResponse:
    if not registry.loaded:
        registry.load_all_artifacts()

    input_df = _get_input_df(req)
    model_name = req.model_name.strip() if req.model_name else "Random Forest"

    # Map aliases or lowercase
    normalized_name = None
    for m in registry.get_model_list():
        if m["name"].lower() == model_name.lower() or m["id"].lower() == model_name.lower():
            normalized_name = m["name"]
            break

    if not normalized_name:
        normalized_name = "Random Forest"

    # Execute prediction based on model type
    probs_dict, top_3, recommended_crop, confidence = _run_inference(normalized_name, input_df)

    input_params = {
        "nitrogen": req.nitrogen,
        "phosphorus": req.phosphorus,
        "potassium": req.potassium,
        "temperature": req.temperature,
        "humidity": req.humidity,
        "ph": req.ph,
        "rainfall": req.rainfall
    }

    return PredictionResponse(
        success=True,
        recommended_crop=recommended_crop,
        selected_model=normalized_name,
        confidence=round(confidence, 2),
        top_3_recommendations=top_3,
        all_probabilities=probs_dict,
        input_parameters=input_params,
        timestamp=datetime.now(timezone.utc).isoformat(),
        calibrated=True,
        notes=None
    )


def predict_all_models(req: PredictionRequest) -> AllModelsPredictionResponse:
    if not registry.loaded:
        registry.load_all_artifacts()

    input_df = _get_input_df(req)
    all_models = registry.get_model_list()
    results: List[ModelComparisonItem] = []

    for model_meta in all_models:
        if not model_meta.get("available", False):
            continue
        m_name = model_meta["name"]
        try:
            probs_dict, top_3, recommended_crop, confidence = _run_inference(m_name, input_df)
            results.append(ModelComparisonItem(
                model_name=m_name,
                category=model_meta["category"],
                recommended_crop=recommended_crop,
                confidence=round(confidence, 2),
                test_accuracy=round(model_meta["accuracy"] * 100, 2),
                top_3=top_3
            ))
        except Exception as e:
            print(f"Error predicting with {m_name}: {e}")

    # Sort results by test accuracy descending
    results.sort(key=lambda x: x.test_accuracy, reverse=True)

    input_params = {
        "nitrogen": req.nitrogen,
        "phosphorus": req.phosphorus,
        "potassium": req.potassium,
        "temperature": req.temperature,
        "humidity": req.humidity,
        "ph": req.ph,
        "rainfall": req.rainfall
    }

    return AllModelsPredictionResponse(
        success=True,
        input_parameters=input_params,
        timestamp=datetime.now(timezone.utc).isoformat(),
        total_models_evaluated=len(results),
        results=results
    )


def _run_inference(model_name: str, input_df: pd.DataFrame) -> Tuple[Dict[str, float], List[CropProbability], str, float]:
    """Runs inference with the specified model and computes probabilities."""
    classes = registry.classes

    if model_name == "Hybrid XGBoost + ANN":
        if "XGBoost" not in registry.ml_models or "ANN" not in registry.dl_models:
            raise HTTPException(status_code=500, detail="Hybrid model components not available")

        # 1. XGBoost Probabilities
        X_ml = registry.ml_scaler.transform(input_df)
        xgb_probs = registry.ml_models["XGBoost"].predict_proba(X_ml)[0]

        # 2. ANN Probabilities
        X_dl = registry.dl_scaler.transform(input_df)
        tensor_dl = torch.tensor(X_dl, dtype=torch.float32).to(registry.device)
        ann = registry.dl_models["ANN"]
        ann.eval()
        with torch.no_grad():
            ann_out = ann(tensor_dl)
            ann_probs = torch.softmax(ann_out, dim=1).cpu().numpy()[0]

        # 3. Probability Fusion (alpha = 0.5 as in research notebook)
        alpha = 0.5
        probs = alpha * xgb_probs + (1.0 - alpha) * ann_probs

    elif model_name in registry.dl_models:
        # Deep Learning PyTorch Model
        X_dl = registry.dl_scaler.transform(input_df)
        tensor_dl = torch.tensor(X_dl, dtype=torch.float32).to(registry.device)
        dl_model = registry.dl_models[model_name]
        dl_model.eval()
        with torch.no_grad():
            out = dl_model(tensor_dl)
            probs = torch.softmax(out, dim=1).cpu().numpy()[0]

    elif model_name in registry.ml_models:
        # Scikit-learn or XGBoost ML Model
        X_ml = registry.ml_scaler.transform(input_df)
        m = registry.ml_models[model_name]
        if hasattr(m, "predict_proba"):
            probs = m.predict_proba(X_ml)[0]
        else:
            # Fallback for models without predict_proba
            pred_idx = m.predict(X_ml)[0]
            probs = np.zeros(len(classes))
            probs[pred_idx] = 1.0
    else:
        raise HTTPException(status_code=400, detail=f"Model '{model_name}' is not recognized or not loaded.")

    # Sort probabilities
    top_indices = np.argsort(probs)[::-1]
    top_3_indices = top_indices[:3]

    top_3: List[CropProbability] = []
    for idx in top_3_indices:
        crop_name = registry.label_encoder.inverse_transform([idx])[0]
        prob_val = float(probs[idx])
        top_3.append(CropProbability(
            crop=crop_name.capitalize(),
            probability=round(prob_val, 4),
            percentage=round(prob_val * 100, 2)
        ))

    recommended_crop = top_3[0].crop
    confidence = top_3[0].percentage

    # Full probabilities dictionary
    probs_dict = {
        registry.label_encoder.inverse_transform([i])[0].capitalize(): round(float(probs[i]), 4)
        for i in range(len(classes))
    }

    return probs_dict, top_3, recommended_crop, confidence

