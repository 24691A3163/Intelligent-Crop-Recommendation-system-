from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class PredictionRequest(BaseModel):
    nitrogen: float = Field(..., ge=0.0, le=250.0, description="Nitrogen content in soil (N) ratio / kg/ha")
    phosphorus: float = Field(..., ge=0.0, le=250.0, description="Phosphorus content in soil (P) ratio / kg/ha")
    potassium: float = Field(..., ge=0.0, le=250.0, description="Potassium content in soil (K) ratio / kg/ha")
    temperature: float = Field(..., ge=-10.0, le=60.0, description="Temperature in degree Celsius (°C)")
    humidity: float = Field(..., ge=0.0, le=100.0, description="Relative humidity in percentage (%)")
    ph: float = Field(..., ge=0.0, le=14.0, description="Soil pH value (0.0 to 14.0)")
    rainfall: float = Field(..., ge=0.0, le=600.0, description="Rainfall in millimeters (mm)")
    model_name: Optional[str] = Field("Random Forest", description="Name of the model to use for inference")

    class Config:
        json_schema_extra = {
            "example": {
                "nitrogen": 90.0,
                "phosphorus": 42.0,
                "potassium": 43.0,
                "temperature": 20.87,
                "humidity": 82.00,
                "ph": 6.50,
                "rainfall": 202.93,
                "model_name": "Random Forest"
            }
        }


class CropProbability(BaseModel):
    crop: str
    probability: float
    percentage: float


class PredictionResponse(BaseModel):
    success: bool = True
    recommended_crop: str
    selected_model: str
    confidence: float
    top_3_recommendations: List[CropProbability]
    all_probabilities: Dict[str, float]
    input_parameters: Dict[str, float]
    timestamp: str
    calibrated: bool = True
    notes: Optional[str] = None


class ModelComparisonItem(BaseModel):
    model_name: str
    category: str
    recommended_crop: str
    confidence: float
    test_accuracy: float
    top_3: List[CropProbability]


class AllModelsPredictionResponse(BaseModel):
    success: bool = True
    input_parameters: Dict[str, float]
    timestamp: str
    total_models_evaluated: int
    results: List[ModelComparisonItem]

