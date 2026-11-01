from fastapi import APIRouter
from typing import List, Dict, Any
from backend.app.services.model_loader import registry

router = APIRouter(tags=["Models"])

@router.get("/models")
def get_models() -> List[Dict[str, Any]]:
    """Returns the list of all available trained models with metadata."""
    if not registry.loaded:
        registry.load_all_artifacts()
    return registry.get_model_list()

