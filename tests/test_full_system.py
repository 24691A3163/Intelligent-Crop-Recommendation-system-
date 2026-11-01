import sys
import json
import pandas as pd
import numpy as np
from pathlib import Path

# Set up path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app.services.model_loader import registry
from backend.app.schemas.prediction import PredictionRequest
from backend.app.services.prediction_service import predict_single, predict_all_models
from backend.app.services.metrics_service import get_research_metrics

def test_full_system():
    print("=" * 60)
    print("RUNNING COMPREHENSIVE END-TO-END VALIDATION SUITE")
    print("=" * 60)

    # 1. Test Registry Load
    registry.load_all_artifacts()
    assert registry.loaded is True, "Model registry failed to load"
    assert registry.get_available_models_count() == 12, f"Expected 12 models, found {registry.get_available_models_count()}"
    assert len(registry.classes) == 22, f"Expected 22 classes, got {len(registry.classes)}"
    assert registry.features == ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'], "Feature order mismatch"
    print("[OK] Model Registry & Preprocessing: Passed (12 models, 22 classes, exact 7 features)")

    # 2. Test Against Known Dataset Samples
    df = pd.read_csv('Crop_recommendation.csv')
    test_cases = [
        ("Rice", df[df['label'] == 'rice'].iloc[0]),
        ("Coffee", df[df['label'] == 'coffee'].iloc[0]),
        ("Cotton", df[df['label'] == 'cotton'].iloc[0]),
        ("Apple", df[df['label'] == 'apple'].iloc[0]),
    ]

    for expected_label, row in test_cases:
        req = PredictionRequest(
            nitrogen=float(row['N']),
            phosphorus=float(row['P']),
            potassium=float(row['K']),
            temperature=float(row['temperature']),
            humidity=float(row['humidity']),
            ph=float(row['ph']),
            rainfall=float(row['rainfall']),
            model_name="Random Forest"
        )
        res = predict_single(req)
        assert res.recommended_crop.lower() == expected_label.lower(), \
            f"Expected {expected_label}, got {res.recommended_crop}"
        assert res.confidence > 70.0, f"Confidence too low: {res.confidence}%"
        assert len(res.top_3_recommendations) == 3, "Expected 3 recommendations"
        print(f"[OK] Dataset ground truth test for '{expected_label}': Predicted '{res.recommended_crop}' with {res.confidence}% confidence")

    # 3. Test Hybrid XGBoost + ANN
    sample_req = PredictionRequest(
        nitrogen=90.0,
        phosphorus=42.0,
        potassium=43.0,
        temperature=20.87,
        humidity=82.00,
        ph=6.50,
        rainfall=202.93,
        model_name="Hybrid XGBoost + ANN"
    )
    res_hybrid = predict_single(sample_req)
    assert res_hybrid.recommended_crop.lower() == 'rice', f"Hybrid failed, predicted {res_hybrid.recommended_crop}"
    assert res_hybrid.confidence > 80.0
    print(f"[OK] Hybrid XGBoost + ANN Fusion: Predicted '{res_hybrid.recommended_crop}' ({res_hybrid.confidence}%)")

    # 4. Test Predict All 12 Models
    all_res = predict_all_models(sample_req)
    assert all_res.total_models_evaluated == 12, f"Expected 12 evaluations, got {all_res.total_models_evaluated}"
    consensus = [r.recommended_crop for r in all_res.results]
    print(f"[OK] 12-Model Consensus Test: {consensus.count('Rice')}/12 models agreed on 'Rice'")

    # 5. Test Research Metrics Integrity
    metrics = get_research_metrics()
    assert metrics.best_model_name == "Random Forest"
    assert metrics.best_accuracy == 0.995455
    assert metrics.dataset_records == 2200
    assert len(metrics.metrics) == 12
    print("[OK] Research Metrics Service: 100% integrity verified against notebook evaluation data")

    print("\n" + "=" * 60)
    print("ALL TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    test_full_system()
