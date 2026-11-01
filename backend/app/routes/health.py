from fastapi import APIRouter
from backend.app.services.model_loader import registry

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Intelligent Crop Recommendation Inference API",
        "models_loaded": registry.loaded,
        "available_models_count": registry.get_available_models_count(),
        "device": str(registry.device),
        "total_crop_classes": len(registry.classes),
        "features": registry.features
    }

