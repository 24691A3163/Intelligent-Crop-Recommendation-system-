import os
import joblib
import torch
import numpy as np
from pathlib import Path
from typing import Dict, Any, List, Optional
from backend.app.core.config import MODEL_DIR
from backend.app.models.dl_architectures import ANN, DNN, CNN1D

class ModelRegistry:
    """
    Central repository for all loaded ML and DL model artifacts.
    Loads models once at startup and provides unified inference methods.
    """
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.features: List[str] = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        self.classes: List[str] = []
        self.label_encoder = None
        self.ml_scaler = None
        self.dl_scaler = None
        self.ml_models: Dict[str, Any] = {}
        self.dl_models: Dict[str, torch.nn.Module] = {}
        self.loaded: bool = False
        self.model_metadata: Dict[str, Dict[str, Any]] = {}

    def load_all_artifacts(self, model_dir_override: Optional[Path] = None):
        target_dir = model_dir_override or MODEL_DIR
        print(f"Loading model artifacts from: {target_dir}")

        if not target_dir.exists():
            raise FileNotFoundError(f"Model directory not found at {target_dir}")

        # 1. Load Preprocessing Artifacts
        feat_path = target_dir / "selected_features.pkl"
        if feat_path.exists():
            self.features = joblib.load(feat_path)
            if hasattr(self.features, "tolist"):
                self.features = self.features.tolist()

        le_path = target_dir / "label_encoder.pkl"
        if le_path.exists():
            self.label_encoder = joblib.load(le_path)
            self.classes = list(self.label_encoder.classes_)

        ml_scaler_path = target_dir / "ml_scaler.pkl"
        if ml_scaler_path.exists():
            self.ml_scaler = joblib.load(ml_scaler_path)

        dl_scaler_path = target_dir / "dl_scaler.pkl"
        if dl_scaler_path.exists():
            self.dl_scaler = joblib.load(dl_scaler_path)

        # 2. Load ML Models
        ml_mapping = {
            "Logistic Regression": "logistic_regression.pkl",
            "KNN": "knn.pkl",
            "Decision Tree": "decision_tree.pkl",
            "Random Forest": "random_forest.pkl",
            "SVM": "svm.pkl",
            "Gradient Boosting": "gradient_boosting.pkl",
            "Extra Trees": "extra_trees.pkl",
            "XGBoost": "xgboost.pkl",
        }

        for model_name, filename in ml_mapping.items():
            path = target_dir / filename
            if path.exists():
                try:
                    self.ml_models[model_name] = joblib.load(path)
                    print(f"  Loaded ML Model: {model_name}")
                except Exception as e:
                    print(f"  Warning: Failed to load {model_name} from {filename}: {e}")

        # 3. Load Deep Learning PyTorch Models
        num_classes = len(self.classes) if self.classes else 22
        input_size = len(self.features) if self.features else 7

        # ANN
        ann_path = target_dir / "ann_model.pt"
        if ann_path.exists():
            try:
                ann = ANN(input_size=input_size, num_classes=num_classes).to(self.device)
                checkpoint = torch.load(ann_path, map_location=self.device)
                state_dict = checkpoint["model_state_dict"] if "model_state_dict" in checkpoint else checkpoint
                ann.load_state_dict(state_dict)
                ann.eval()
                self.dl_models["ANN"] = ann
                print("  Loaded DL Model: ANN")
            except Exception as e:
                print(f"  Warning: Failed to load ANN: {e}")

        # DNN
        dnn_path = target_dir / "dnn_model.pt"
        if dnn_path.exists():
            try:
                dnn = DNN(input_size=input_size, num_classes=num_classes).to(self.device)
                checkpoint = torch.load(dnn_path, map_location=self.device)
                state_dict = checkpoint["model_state_dict"] if "model_state_dict" in checkpoint else checkpoint
                dnn.load_state_dict(state_dict)
                dnn.eval()
                self.dl_models["DNN"] = dnn
                print("  Loaded DL Model: DNN")
            except Exception as e:
                print(f"  Warning: Failed to load DNN: {e}")

        # 1D-CNN
        cnn_path = target_dir / "cnn_model.pt"
        if cnn_path.exists():
            try:
                cnn = CNN1D(num_classes=num_classes).to(self.device)
                checkpoint = torch.load(cnn_path, map_location=self.device)
                state_dict = checkpoint["model_state_dict"] if "model_state_dict" in checkpoint else checkpoint
                cnn.load_state_dict(state_dict)
                cnn.eval()
                self.dl_models["1D-CNN"] = cnn
                print("  Loaded DL Model: 1D-CNN")
            except Exception as e:
                print(f"  Warning: Failed to load 1D-CNN: {e}")

        self.loaded = True
        print(f"All models successfully registered! Total models available: {self.get_available_models_count()}")

    def get_available_models_count(self) -> int:
        count = len(self.ml_models) + len(self.dl_models)
        if "XGBoost" in self.ml_models and "ANN" in self.dl_models:
            count += 1  # Hybrid XGBoost + ANN
        return count

    def get_model_list(self) -> List[Dict[str, Any]]:
        """Returns catalog of all supported models with metadata."""
        catalog = [
            {
                "id": "random_forest",
                "name": "Random Forest",
                "category": "Machine Learning",
                "description": "Ensemble of 300 decision trees. Highest test accuracy (99.55%) in research experiments.",
                "is_default": True,
                "accuracy": 0.995455,
                "precision": 0.995671,
                "recall": 0.995455,
                "f1_score": 0.995452,
                "roc_auc": 1.0,
                "available": "Random Forest" in self.ml_models
            },
            {
                "id": "hybrid_xgb_ann",
                "name": "Hybrid XGBoost + ANN",
                "category": "Hybrid",
                "description": "Probability fusion (alpha=0.5) of Gradient Boosted Trees and Artificial Neural Network.",
                "is_default": False,
                "accuracy": 0.995455,
                "precision": 0.995671,
                "recall": 0.995455,
                "f1_score": 0.995452,
                "roc_auc": 1.0,
                "available": ("XGBoost" in self.ml_models and "ANN" in self.dl_models)
            },
            {
                "id": "extra_trees",
                "name": "Extra Trees",
                "category": "Machine Learning",
                "description": "Extremely Randomized Trees with 300 estimators, offering top-tier generalization.",
                "is_default": False,
                "accuracy": 0.995455,
                "precision": 0.995671,
                "recall": 0.995455,
                "f1_score": 0.995452,
                "roc_auc": 1.0,
                "available": "Extra Trees" in self.ml_models
            },
            {
                "id": "dnn",
                "name": "DNN",
                "category": "Deep Learning",
                "description": "4-layer Deep Neural Network with Batch Normalization and Dropout regularization.",
                "is_default": False,
                "accuracy": 0.993182,
                "precision": 0.993703,
                "recall": 0.993182,
                "f1_score": 0.993169,
                "roc_auc": 0.9998,
                "available": "DNN" in self.dl_models
            },
            {
                "id": "xgboost",
                "name": "XGBoost",
                "category": "Machine Learning",
                "description": "Extreme Gradient Boosting multi:softprob classifier with 300 boosting rounds.",
                "is_default": False,
                "accuracy": 0.993182,
                "precision": 0.993506,
                "recall": 0.993182,
                "f1_score": 0.993116,
                "roc_auc": 0.9999,
                "available": "XGBoost" in self.ml_models
            },
            {
                "id": "svm",
                "name": "SVM",
                "category": "Machine Learning",
                "description": "Support Vector Machine with RBF kernel and calibrated probability estimates.",
                "is_default": False,
                "accuracy": 0.988636,
                "precision": 0.989571,
                "recall": 0.988636,
                "f1_score": 0.988674,
                "roc_auc": 0.9997,
                "available": "SVM" in self.ml_models
            },
            {
                "id": "ann",
                "name": "ANN",
                "category": "Deep Learning",
                "description": "Artificial Neural Network with two hidden layers (128, 64) and ReLU activations.",
                "is_default": False,
                "accuracy": 0.988636,
                "precision": 0.990260,
                "recall": 0.988636,
                "f1_score": 0.988543,
                "roc_auc": 0.9996,
                "available": "ANN" in self.dl_models
            },
            {
                "id": "gradient_boosting",
                "name": "Gradient Boosting",
                "category": "Machine Learning",
                "description": "Sequential boosting ensemble model with 150 gradient-boosted trees.",
                "is_default": False,
                "accuracy": 0.988636,
                "precision": 0.989571,
                "recall": 0.988636,
                "f1_score": 0.988674,
                "roc_auc": 0.9997,
                "available": "Gradient Boosting" in self.ml_models
            },
            {
                "id": "cnn1d",
                "name": "1D-CNN",
                "category": "Deep Learning",
                "description": "1D Convolutional Neural Network capturing local nutrient & environmental interactions.",
                "is_default": False,
                "accuracy": 0.988636,
                "precision": 0.989245,
                "recall": 0.988636,
                "f1_score": 0.988735,
                "roc_auc": 0.9995,
                "available": "1D-CNN" in self.dl_models
            },
            {
                "id": "knn",
                "name": "KNN",
                "category": "Machine Learning",
                "description": "K-Nearest Neighbors classifier (k=5, distance-weighted metric).",
                "is_default": False,
                "accuracy": 0.981818,
                "precision": 0.982881,
                "recall": 0.981818,
                "f1_score": 0.981609,
                "roc_auc": 0.9965,
                "available": "KNN" in self.ml_models
            },
            {
                "id": "decision_tree",
                "name": "Decision Tree",
                "category": "Machine Learning",
                "description": "Interpretable single decision tree with max depth 15.",
                "is_default": False,
                "accuracy": 0.981818,
                "precision": 0.982979,
                "recall": 0.981818,
                "f1_score": 0.981694,
                "roc_auc": 0.9905,
                "available": "Decision Tree" in self.ml_models
            },
            {
                "id": "logistic_regression",
                "name": "Logistic Regression",
                "category": "Machine Learning",
                "description": "Multinomial Logistic Regression baseline model with standard scaling.",
                "is_default": False,
                "accuracy": 0.972727,
                "precision": 0.974022,
                "recall": 0.972727,
                "f1_score": 0.972464,
                "roc_auc": 0.9982,
                "available": "Logistic Regression" in self.ml_models
            }
        ]
        return catalog

# Singleton instance
registry = ModelRegistry()

