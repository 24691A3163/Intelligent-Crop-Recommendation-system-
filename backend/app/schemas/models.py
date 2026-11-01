from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class ModelInfo(BaseModel):
    id: str
    name: str
    category: str  # "Machine Learning", "Deep Learning", "Hybrid"
    description: str
    is_default: bool = False
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: Optional[float] = None
    supports_probabilities: bool = True


class ModelMetricItem(BaseModel):
    model: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: Optional[float] = None
    category: str
    cross_val_mean: Optional[float] = None
    cross_val_std: Optional[float] = None


class MetricsResponse(BaseModel):
    dataset_records: int
    features_count: int
    classes_count: int
    best_model_name: str
    best_accuracy: float
    metrics: List[ModelMetricItem]
    classes: List[str]
    features: List[str]

