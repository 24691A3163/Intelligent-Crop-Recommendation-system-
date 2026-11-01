from typing import Dict, Any, List
from backend.app.schemas.models import MetricsResponse, ModelMetricItem
from backend.app.services.model_loader import registry

# Actual experiment results recorded in notebook:
# Random Forest: 99.55%, Extra Trees: 99.55%, Hybrid: 99.55%, DNN: 99.32%, XGBoost: 99.32%
# SVM: 98.86%, ANN: 98.86%, Gradient Boosting: 98.86%, 1D-CNN: 98.86%, KNN: 98.18%, Decision Tree: 98.18%, Logistic Regression: 97.27%
RESEARCH_METRICS: List[Dict[str, Any]] = [
    {
        "model": "Random Forest",
        "accuracy": 0.995455,
        "precision": 0.995671,
        "recall": 0.995455,
        "f1_score": 0.995452,
        "roc_auc": 1.0,
        "category": "Machine Learning",
        "cross_val_mean": 0.993750,
        "cross_val_std": 0.004545
    },
    {
        "model": "Extra Trees",
        "accuracy": 0.995455,
        "precision": 0.995671,
        "recall": 0.995455,
        "f1_score": 0.995452,
        "roc_auc": 1.0,
        "category": "Machine Learning",
        "cross_val_mean": 0.991477,
        "cross_val_std": 0.003593
    },
    {
        "model": "Hybrid XGBoost + ANN",
        "accuracy": 0.995455,
        "precision": 0.995671,
        "recall": 0.995455,
        "f1_score": 0.995452,
        "roc_auc": 1.0,
        "category": "Hybrid",
        "cross_val_mean": None,
        "cross_val_std": None
    },
    {
        "model": "DNN",
        "accuracy": 0.993182,
        "precision": 0.993703,
        "recall": 0.993182,
        "f1_score": 0.993169,
        "roc_auc": 0.9998,
        "category": "Deep Learning",
        "cross_val_mean": None,
        "cross_val_std": None
    },
    {
        "model": "XGBoost",
        "accuracy": 0.993182,
        "precision": 0.993506,
        "recall": 0.993182,
        "f1_score": 0.993116,
        "roc_auc": 0.9999,
        "category": "Machine Learning",
        "cross_val_mean": None,
        "cross_val_std": None
    },
    {
        "model": "SVM",
        "accuracy": 0.988636,
        "precision": 0.989571,
        "recall": 0.988636,
        "f1_score": 0.988674,
        "roc_auc": 0.9997,
        "category": "Machine Learning",
        "cross_val_mean": 0.982386,
        "cross_val_std": 0.004888
    },
    {
        "model": "ANN",
        "accuracy": 0.988636,
        "precision": 0.990260,
        "recall": 0.988636,
        "f1_score": 0.988543,
        "roc_auc": 0.9996,
        "category": "Deep Learning",
        "cross_val_mean": None,
        "cross_val_std": None
    },
    {
        "model": "Gradient Boosting",
        "accuracy": 0.988636,
        "precision": 0.989571,
        "recall": 0.988636,
        "f1_score": 0.988674,
        "roc_auc": 0.9997,
        "category": "Machine Learning",
        "cross_val_mean": None,
        "cross_val_std": None
    },
    {
        "model": "1D-CNN",
        "accuracy": 0.988636,
        "precision": 0.989245,
        "recall": 0.988636,
        "f1_score": 0.988735,
        "roc_auc": 0.9995,
        "category": "Deep Learning",
        "cross_val_mean": None,
        "cross_val_std": None
    },
    {
        "model": "KNN",
        "accuracy": 0.981818,
        "precision": 0.982881,
        "recall": 0.981818,
        "f1_score": 0.981609,
        "roc_auc": 0.9965,
        "category": "Machine Learning",
        "cross_val_mean": 0.965341,
        "cross_val_std": 0.012106
    },
    {
        "model": "Decision Tree",
        "accuracy": 0.981818,
        "precision": 0.982979,
        "recall": 0.981818,
        "f1_score": 0.981694,
        "roc_auc": 0.9905,
        "category": "Machine Learning",
        "cross_val_mean": 0.985227,
        "cross_val_std": 0.006818
    },
    {
        "model": "Logistic Regression",
        "accuracy": 0.972727,
        "precision": 0.974022,
        "recall": 0.972727,
        "f1_score": 0.972464,
        "roc_auc": 0.9982,
        "category": "Machine Learning",
        "cross_val_mean": 0.968182,
        "cross_val_std": 0.006577
    }
]

def get_research_metrics() -> MetricsResponse:
    if not registry.loaded:
        registry.load_all_artifacts()

    items = [ModelMetricItem(**m) for m in RESEARCH_METRICS]

    return MetricsResponse(
        dataset_records=2200,
        features_count=7,
        classes_count=len(registry.classes) if registry.classes else 22,
        best_model_name="Random Forest",
        best_accuracy=0.995455,
        metrics=items,
        classes=[c.capitalize() for c in registry.classes],
        features=registry.features
    )

