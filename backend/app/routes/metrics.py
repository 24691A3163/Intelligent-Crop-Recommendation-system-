from fastapi import APIRouter
from backend.app.schemas.models import MetricsResponse
from backend.app.services.metrics_service import get_research_metrics

router = APIRouter(tags=["Metrics"])

@router.get("/model-metrics", response_model=MetricsResponse)
def get_model_metrics():
    """
    Returns authentic experimental metrics recorded in the research project
    (Accuracy, Precision, Recall, F1-Score, ROC-AUC, 5-Fold Cross Validation).
    """
    return get_research_metrics()

