from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, Header
from backend.app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
    AllModelsPredictionResponse
)
from backend.app.services.prediction_service import predict_single, predict_all_models
from backend.app.core.security import verify_supabase_token

router = APIRouter(tags=["Prediction"])

@router.post("/predict", response_model=PredictionResponse)
def get_prediction(
    req: PredictionRequest,
    user_payload: Optional[Dict[str, Any]] = Depends(verify_supabase_token)
):
    """
    Predict optimal crop recommendation using selected trained model.
    If authenticated via Supabase JWT, request is associated with user.
    """
    response = predict_single(req)
    if user_payload and "sub" in user_payload:
        response.notes = f"Authenticated user: {user_payload.get('email', user_payload['sub'])}"
    return response


@router.post("/predict/all", response_model=AllModelsPredictionResponse)
def get_all_models_prediction(
    req: PredictionRequest,
    user_payload: Optional[Dict[str, Any]] = Depends(verify_supabase_token)
):
    """
    Run the same 7 soil & climate parameters across all 12 trained models
    to compare recommendations and model consensus.
    """
    return predict_all_models(req)

