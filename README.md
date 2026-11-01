# Intelligent Crop Recommendation System
## Full-Stack Hybrid Machine Learning & Deep Learning Model Integration

A production-grade, full-stack agricultural decision support system powered by **12 trained Machine Learning and Deep Neural Network architectures**, including a state-of-the-art **Hybrid XGBoost + ANN probability fusion model** with **99.55% test accuracy**.

Integrated with a high-performance **FastAPI inference backend**, **Supabase Authentication & PostgreSQL with Row Level Security (RLS)**, and a modern **React (Vite + Tailwind CSS + Recharts)** dashboard.

---

## 🌟 Key Features

1. **Production Model Serving via FastAPI**:
   - Safe model preloading at server startup (models are cached in memory, not reloaded per request).
   - Supports 12 distinct trained model configurations across Machine Learning, Deep Learning, and Hybrid architectures.
   - Default recommendation engine: **Random Forest (99.55% test accuracy)**.
   - Novel research model: **Hybrid XGBoost + ANN probability fusion** ($\alpha = 0.5$).
   - One-click **12-Model Consensus Evaluation** (`/predict/all`) to compare predictions across all algorithms simultaneously.

2. **Full-Stack Supabase Integration**:
   - User authentication: Sign up, Sign in, Password recovery, and profile metadata.
   - PostgreSQL schema with **Row Level Security (RLS)** ensuring users only access their own prediction history.
   - Pre-populated `model_metrics` table with verified research benchmark metrics.
   - Zero-friction demo fallback: Evaluators can test full UI and inference without immediate Supabase credential setup.

3. **Modern Agricultural UI/UX Dashboard**:
   - Clean white and soft emerald green palette designed for farmers, agronomists, and researchers.
   - 7-Parameter soil & climate profiler (Nitrogen, Phosphorus, Potassium, Temperature, Relative Humidity, Soil pH, Rainfall).
   - Quick one-click agro-climatic presets (Subtropical Rice Field, Highland Coffee Estate, Black Soil Cotton Belt, Temperate Apple Valley, Semi-Arid Chickpea Field).
   - Interactive Recharts probability graphs, crop distribution analytics, and detailed agronomic advisory guides.
   - Printable / Downloadable advisory report with print-optimized CSS.

---

## 🔬 Trained Research Models & Benchmarks

All models and scalers were trained and validated on the 2,200 sample precision agriculture dataset (`Crop_recommendation.csv`) across **22 crop varieties**:

| Rank | Model Name | Category | Test Accuracy | Precision | Recall | F1-Score | Macro ROC-AUC |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| 🥇 | **Random Forest** *(Default)* | Machine Learning | **99.55%** | 0.9957 | 0.9955 | 0.9955 | 1.0000 |
| 🥇 | **Extra Trees** | Machine Learning | **99.55%** | 0.9957 | 0.9955 | 0.9955 | 1.0000 |
| 🥇 | **Hybrid XGBoost + ANN** | Hybrid Fusion | **99.55%** | 0.9957 | 0.9955 | 0.9955 | 1.0000 |
| 4 | **DNN (BatchNorm1d)** | Deep Learning | **99.32%** | 0.9937 | 0.9932 | 0.9932 | 0.9998 |
| 5 | **XGBoost** | Machine Learning | **99.32%** | 0.9935 | 0.9932 | 0.9931 | 0.9999 |
| 6 | **SVM (RBF Kernel)** | Machine Learning | **98.86%** | 0.9896 | 0.9886 | 0.9887 | 0.9997 |
| 7 | **ANN (Dual Dense)** | Deep Learning | **98.86%** | 0.9903 | 0.9886 | 0.9885 | 0.9996 |
| 8 | **Gradient Boosting** | Machine Learning | **98.86%** | 0.9896 | 0.9886 | 0.9887 | 0.9997 |
| 9 | **1D-CNN** | Deep Learning | **98.86%** | 0.9892 | 0.9886 | 0.9887 | 0.9995 |
| 10 | **KNN (k=5)** | Machine Learning | **98.18%** | 0.9829 | 0.9818 | 0.9816 | 0.9965 |
| 11 | **Decision Tree** | Machine Learning | **98.18%** | 0.9830 | 0.9818 | 0.9817 | 0.9905 |
| 12 | **Logistic Regression** | Machine Learning | **97.27%** | 0.9740 | 0.9727 | 0.9725 | 0.9982 |

### Input Features & Order
Input parameters strictly preserve the training order:
1. `N` - Soil Nitrogen content ratio (kg/ha)
2. `P` - Soil Phosphorus content ratio (kg/ha)
3. `K` - Soil Potassium content ratio (kg/ha)
4. `temperature` - Temperature in degree Celsius (°C)
5. `humidity` - Relative atmospheric humidity (%)
6. `ph` - Soil pH level (0 - 14 scale)
7. `rainfall` - Total rainfall precipitation (mm)

---

## 📁 Project Architecture

```
WORK/
├── models/                               # Actual trained model artifacts & scalers
│   ├── ann_model.pt                      # PyTorch ANN checkpoint
│   ├── cnn_model.pt                      # PyTorch 1D-CNN checkpoint
│   ├── dnn_model.pt                      # PyTorch DNN with BatchNorm checkpoint
│   ├── decision_tree.pkl                 # Scikit-learn Decision Tree
│   ├── dl_scaler.pkl                     # StandardScaler for DL inputs
│   ├── extra_trees.pkl                   # Extra Trees Classifier
│   ├── gradient_boosting.pkl             # Gradient Boosting Classifier
│   ├── knn.pkl                           # K-Nearest Neighbors Classifier
│   ├── label_encoder.pkl                 # LabelEncoder (22 crop classes)
│   ├── logistic_regression.pkl           # Logistic Regression model
│   ├── ml_scaler.pkl                     # StandardScaler for ML inputs
│   ├── random_forest.pkl                 # Random Forest Classifier (99.55%)
│   ├── selected_features.pkl             # 7 feature names in order
│   ├── svm.pkl                           # Support Vector Classifier
│   └── xgboost.pkl                       # XGBoost Multi:Softprob Classifier
│
├── backend/                              # FastAPI Inference Service
│   ├── app/
│   │   ├── main.py                       # FastAPI application & lifespan loader
│   │   ├── core/
│   │   │   ├── config.py                 # Configuration and environment loaders
│   │   │   └── security.py               # Supabase JWT token verification
│   │   ├── models/
│   │   │   └── dl_architectures.py       # PyTorch ANN, DNN, CNN1D network classes
│   │   ├── schemas/
│   │   │   ├── prediction.py             # Pydantic request & response schemas
│   │   │   └── models.py                 # Model catalog & metrics schemas
│   │   ├── services/
│   │   │   ├── model_loader.py           # ModelRegistry (safe startup loader)
│   │   │   ├── prediction_service.py     # Preprocessing, inference & hybrid fusion
│   │   │   └── metrics_service.py        # Research experimental benchmarks
│   │   └── routes/
│   │       ├── health.py                 # GET /health
│   │       ├── models.py                 # GET /models
│   │       ├── predict.py                # POST /predict, POST /predict/all
│   │       └── metrics.py                # GET /model-metrics
│   └── requirements.txt
│
├── frontend/                             # React (Vite + Tailwind CSS) Dashboard
│   ├── src/
│   │   ├── components/                   # Navbar, Sidebar, Modals, Cards
│   │   ├── context/                      # AuthContext, ToastContext
│   │   ├── pages/                        # Landing, Dashboard, Recommend, Results,
│   │   │                                 # ModelComparison, History, Profile, AuthModal
│   │   ├── services/                     # FastAPI client, Supabase client, crop guide
│   │   ├── App.jsx                       # Main router & state manager
│   │   ├── main.jsx
│   │   └── index.css                     # Tailwind styling & print layouts
│   └── package.json
│
├── supabase/
│   └── migrations/
│       └── 20261101_initial_schema.sql   # PostgreSQL DDL, triggers & RLS policies
│
├── tests/
│   ├── test_backend.py                   # Backend unit tests
│   └── test_full_system.py               # End-to-end ground truth validation suite
│
├── .env.example                          # Root backend environment template
├── requirements.txt                      # Python dependencies
└── README.md                             # Documentation
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Python**: 3.10, 3.11, 3.12, or 3.13
- **Node.js**: v18+ (tested on v24.13)
- **npm**: v9+

---

### 2. Backend Setup & Startup (FastAPI)

1. Open a terminal in the project root:
   ```bash
   pip install -r requirements.txt
   ```

2. (Optional) Configure environment variables:
   Copy `.env.example` to `.env` and fill in Supabase credentials if available:
   ```bash
   cp .env.example .env
   ```

3. Run the automated test suite to verify model integrity:
   ```bash
   python tests/test_full_system.py
   ```

4. Start the FastAPI inference server:
   ```bash
   python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   - API Docs will be available at: **http://localhost:8000/docs**
   - Health check: **http://localhost:8000/health**

---

### 3. Frontend Setup & Startup (React + Vite)

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   npm install
   ```

2. (Optional) Configure frontend environment:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   - Open your browser at: **http://localhost:5173**

---

### 4. Supabase Database Setup (Optional for Live DB)

If you are using Supabase for cloud PostgreSQL and Authentication:

1. Create a new project in your [Supabase Dashboard](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard.
3. Open `supabase/migrations/20261101_initial_schema.sql` and execute the script.
   - This creates `profiles`, `predictions`, and `model_metrics` tables.
   - It sets up automated profile generation on signup.
   - It configures Row Level Security (RLS) policies ensuring users can only read and delete their own records.
4. Copy your **Project URL** and **Anon Key** into `frontend/.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Copy your **JWT Secret** into the root `.env` for backend token validation:
   ```env
   SUPABASE_JWT_SECRET=your-jwt-secret
   ```

---

## 📡 API Reference

### 1. `GET /health`
Returns system status, active PyTorch computing device, and number of loaded models.

### 2. `GET /models`
Returns the complete catalog of all 12 models with category tags, descriptions, and research test accuracies.

### 3. `POST /predict`
Infers optimal crop for 7 given parameters with the selected model.

**Request Body:**
```json
{
  "nitrogen": 90.0,
  "phosphorus": 42.0,
  "potassium": 43.0,
  "temperature": 20.87,
  "humidity": 82.00,
  "ph": 6.50,
  "rainfall": 202.93,
  "model_name": "Random Forest"
}
```

**Response Body:**
```json
{
  "success": true,
  "recommended_crop": "Rice",
  "selected_model": "Random Forest",
  "confidence": 95.0,
  "top_3_recommendations": [
    {"crop": "Rice", "probability": 0.95, "percentage": 95.0},
    {"crop": "Jute", "probability": 0.05, "percentage": 5.0},
    {"crop": "Pomegranate", "probability": 0.0, "percentage": 0.0}
  ],
  "input_parameters": { ... },
  "timestamp": "2026-11-01T12:00:00Z"
}
```

### 4. `POST /predict/all`
Runs the input through all 12 trained models simultaneously, providing a side-by-side consensus comparison.

### 5. `GET /model-metrics`
Returns verified experimental research evaluation metrics (Accuracy, Precision, Recall, F1-Score, ROC-AUC, 5-Fold Cross Validation) extracted directly from the research notebook.

---

## 🧪 Testing and Verification

Run the full end-to-end verification suite anytime:
```bash
python tests/test_full_system.py
```
This script validates:
- [x] All 15 model and scaler artifacts load correctly
- [x] Ground truth predictions match across diverse test crops (Rice, Coffee, Cotton, Apple)
- [x] Hybrid probability fusion ($\alpha = 0.5$) calculates correctly
- [x] 12-model consensus test achieves unanimous agreement on standard field profiles
- [x] Research metrics match experimental outputs
- [x] Preprocessing pipelines and feature ordering remain 100% faithful to the original research implementation

