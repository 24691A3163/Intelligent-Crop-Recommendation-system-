from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import CORS_ORIGINS
from backend.app.services.model_loader import registry
from backend.app.routes import health, models, predict, metrics

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing Intelligent Crop Recommendation Inference Engine...")
    registry.load_all_artifacts()
    print("Engine initialization complete.")
    yield
    print("Shutting down Crop Recommendation Inference Engine.")

app = FastAPI(
    title="Intelligent Crop Recommendation API",
    description="Full-stack Machine Learning & Deep Learning Inference Engine for Intelligent Crop Recommendation",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "service": "Intelligent Crop Recommendation System API",
        "status": "online",
        "docs_url": "/docs",
        "best_model": "Random Forest (99.55% test accuracy)"
    }

# Include Routers
app.include_router(health.router)
app.include_router(models.router)
app.include_router(predict.router)
app.include_router(metrics.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
