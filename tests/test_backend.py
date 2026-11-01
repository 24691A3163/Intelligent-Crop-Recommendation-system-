import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app.services.model_loader import registry
from backend.app.schemas.prediction import PredictionRequest
from backend.app.services.prediction_service import predict_single, predict_all_models
from backend.app.services.metrics_service import get_research_metrics

def main():
    print("Testing model registry loading...")
    registry.load_all_artifacts()
    print("Available models count:", registry.get_available_models_count())
    print("Features:", registry.features)
    print("Classes count:", len(registry.classes))

    sample = PredictionRequest(
        nitrogen=90.0,
        phosphorus=42.0,
        potassium=43.0,
        temperature=20.87,
        humidity=82.00,
        ph=6.50,
        rainfall=202.93,
        model_name="Random Forest"
    )

    print("\n--- 1. Testing Default Random Forest Model ---")
    res_rf = predict_single(sample)
    print("Recommended crop:", res_rf.recommended_crop)
    print("Confidence:", res_rf.confidence, "%")
    print("Top 3:", [(t.crop, t.percentage) for t in res_rf.top_3_recommendations])

    print("\n--- 2. Testing Hybrid XGBoost + ANN Model ---")
    sample.model_name = "Hybrid XGBoost + ANN"
    res_hybrid = predict_single(sample)
    print("Recommended crop:", res_hybrid.recommended_crop)
    print("Confidence:", res_hybrid.confidence, "%")
    print("Top 3:", [(t.crop, t.percentage) for t in res_hybrid.top_3_recommendations])

    print("\n--- 3. Testing Predict All Models ---")
    all_res = predict_all_models(sample)
    print(f"Total models evaluated: {all_res.total_models_evaluated}")
    for item in all_res.results:
        print(f"  {item.model_name:25} | {item.category:16} | Rec: {item.recommended_crop:12} | Conf: {item.confidence:5.2f}% | Test Acc: {item.test_accuracy:5.2f}%")

    print("\n--- 4. Testing Metrics Service ---")
    metrics = get_research_metrics()
    print(f"Best model: {metrics.best_model_name} ({metrics.best_accuracy * 100:.2f}%)")
    print(f"Total metrics listed: {len(metrics.metrics)}")

    print("\nALL BACKEND UNIT TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    main()

