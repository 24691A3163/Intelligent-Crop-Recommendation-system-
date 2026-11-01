-- ==============================================================================
-- Intelligent Crop Recommendation System - Supabase PostgreSQL Schema & RLS
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Row Level Security for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Trigger to automatically create a profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. PREDICTIONS TABLE
CREATE TABLE IF NOT EXISTS public.predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nitrogen DOUBLE PRECISION NOT NULL,
    phosphorus DOUBLE PRECISION NOT NULL,
    potassium DOUBLE PRECISION NOT NULL,
    temperature DOUBLE PRECISION NOT NULL,
    humidity DOUBLE PRECISION NOT NULL,
    ph DOUBLE PRECISION NOT NULL,
    rainfall DOUBLE PRECISION NOT NULL,
    recommended_crop TEXT NOT NULL,
    selected_model TEXT NOT NULL,
    confidence DOUBLE PRECISION,
    prediction_probabilities JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for fast query and filtering
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON public.predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON public.predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_crop ON public.predictions(recommended_crop);

-- Row Level Security for predictions
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view only their own predictions"
    ON public.predictions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own predictions"
    ON public.predictions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete only their own predictions"
    ON public.predictions
    FOR DELETE
    USING (auth.uid() = user_id);


-- 3. MODEL METRICS TABLE
CREATE TABLE IF NOT EXISTS public.model_metrics (
    id SERIAL PRIMARY KEY,
    model_name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    accuracy DOUBLE PRECISION NOT NULL,
    precision DOUBLE PRECISION NOT NULL,
    recall DOUBLE PRECISION NOT NULL,
    f1_score DOUBLE PRECISION NOT NULL,
    roc_auc DOUBLE PRECISION,
    cross_val_mean DOUBLE PRECISION,
    cross_val_std DOUBLE PRECISION,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Row Level Security for model_metrics
ALTER TABLE public.model_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for model metrics"
    ON public.model_metrics
    FOR SELECT
    USING (true);

-- Pre-populate model_metrics with exact research experiment results
INSERT INTO public.model_metrics 
    (model_name, category, accuracy, precision, recall, f1_score, roc_auc, cross_val_mean, cross_val_std)
VALUES
    ('Random Forest', 'Machine Learning', 0.995455, 0.995671, 0.995455, 0.995452, 1.0000, 0.993750, 0.004545),
    ('Extra Trees', 'Machine Learning', 0.995455, 0.995671, 0.995455, 0.995452, 1.0000, 0.991477, 0.003593),
    ('Hybrid XGBoost + ANN', 'Hybrid', 0.995455, 0.995671, 0.995455, 0.995452, 1.0000, NULL, NULL),
    ('DNN', 'Deep Learning', 0.993182, 0.993703, 0.993182, 0.993169, 0.9998, NULL, NULL),
    ('XGBoost', 'Machine Learning', 0.993182, 0.993506, 0.993182, 0.993116, 0.9999, NULL, NULL),
    ('SVM', 'Machine Learning', 0.988636, 0.989571, 0.988636, 0.988674, 0.9997, 0.982386, 0.004888),
    ('ANN', 'Deep Learning', 0.988636, 0.990260, 0.988636, 0.988543, 0.9996, NULL, NULL),
    ('Gradient Boosting', 'Machine Learning', 0.988636, 0.989571, 0.988636, 0.988674, 0.9997, NULL, NULL),
    ('1D-CNN', 'Deep Learning', 0.988636, 0.989245, 0.988636, 0.988735, 0.9995, NULL, NULL),
    ('KNN', 'Machine Learning', 0.981818, 0.982881, 0.981818, 0.981609, 0.9965, 0.965341, 0.012106),
    ('Decision Tree', 'Machine Learning', 0.981818, 0.982979, 0.981818, 0.981694, 0.9905, 0.985227, 0.006818),
    ('Logistic Regression', 'Machine Learning', 0.972727, 0.974022, 0.972727, 0.972464, 0.9982, 0.968182, 0.006577)
ON CONFLICT (model_name) DO UPDATE SET
    accuracy = EXCLUDED.accuracy,
    precision = EXCLUDED.precision,
    recall = EXCLUDED.recall,
    f1_score = EXCLUDED.f1_score,
    roc_auc = EXCLUDED.roc_auc,
    cross_val_mean = EXCLUDED.cross_val_mean,
    cross_val_std = EXCLUDED.cross_val_std,
    updated_at = NOW();

