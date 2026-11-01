import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root or backend folder
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Detect models directory (works both from backend/ or project root)
POSSIBLE_MODEL_DIRS = [
    BASE_DIR.parent / "models",
    BASE_DIR / "models",
    Path("models").resolve(),
]

MODEL_DIR = None
for d in POSSIBLE_MODEL_DIRS:
    if d.exists() and (d / "random_forest.pkl").exists():
        MODEL_DIR = d
        break

if MODEL_DIR is None:
    # Default fallback
    MODEL_DIR = BASE_DIR.parent / "models"

# Supabase Configurations
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")

# CORS settings
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:8000",
    "*"
]

