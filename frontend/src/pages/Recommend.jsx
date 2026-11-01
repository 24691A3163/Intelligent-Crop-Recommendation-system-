import React, { useState, useEffect } from 'react'
import { 
  Sprout, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  HelpCircle, 
  Layers, 
  Compass,
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react'
import { api } from '../services/api'
import { dbService } from '../services/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { PRESET_SAMPLES } from '../services/cropData'

export const Recommend = ({ onPredictionComplete }) => {
  const { user } = useAuth()
  const { addToast } = useToast()

  // Form parameters in exact feature order
  const [formData, setFormData] = useState({
    nitrogen: 90,
    phosphorus: 42,
    potassium: 43,
    temperature: 20.87,
    humidity: 82.0,
    ph: 6.5,
    rainfall: 202.93
  })

  const [selectedModel, setSelectedModel] = useState("Random Forest")
  const [compareAll, setCompareAll] = useState(false)
  const [availableModels, setAvailableModels] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    async function loadModels() {
      try {
        const list = await api.getModels()
        setAvailableModels(list)
      } catch (err) {
        console.warn('Using default model list:', err)
      }
    }
    loadModels()
  }, [])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }))
    if (errors[field]) {
      setErrors(prev => {
        const updated = { ...prev }
        delete updated[field]
        return updated
      })
    }
  }

  const handlePresetSelect = (preset) => {
    setFormData(preset.values)
    setErrors({})
    addToast(`Applied preset: ${preset.name} (${preset.crop})`, 'info')
  }

  const handleReset = () => {
    setFormData({
      nitrogen: 50,
      phosphorus: 50,
      potassium: 50,
      temperature: 25.0,
      humidity: 70.0,
      ph: 6.5,
      rainfall: 100.0
    })
    setErrors({})
    addToast('Inputs reset to baseline values', 'info')
  }

  const validate = () => {
    const errs = {}
    if (formData.nitrogen < 0 || formData.nitrogen > 200) errs.nitrogen = 'Nitrogen should be between 0 and 200 kg/ha'
    if (formData.phosphorus < 0 || formData.phosphorus > 200) errs.phosphorus = 'Phosphorus should be between 0 and 200 kg/ha'
    if (formData.potassium < 0 || formData.potassium > 250) errs.potassium = 'Potassium should be between 0 and 250 kg/ha'
    if (formData.temperature < -10 || formData.temperature > 55) errs.temperature = 'Temperature should be between -10°C and 55°C'
    if (formData.humidity < 5 || formData.humidity > 100) errs.humidity = 'Humidity should be between 5% and 100%'
    if (formData.ph < 3.0 || formData.ph > 10.0) errs.ph = 'Soil pH must be between 3.0 and 10.0'
    if (formData.rainfall < 0 || formData.rainfall > 500) errs.rainfall = 'Rainfall should be between 0 and 500 mm'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) {
      addToast('Please correct highlighted input parameter values', 'error')
      return
    }

    setLoading(true)

    try {
      const payload = {
        ...formData,
        model_name: selectedModel
      }

      let result = null
      let allModelsResult = null

      if (compareAll) {
        allModelsResult = await api.predictAllModels(payload)
        // Also get single prediction with selected model for full probability view
        result = await api.predictCrop(payload)
      } else {
        result = await api.predictCrop(payload)
      }

      // Save to Supabase predictions table
      try {
        await dbService.savePrediction({
          user_id: user?.id || 'demo-user-12345',
          nitrogen: formData.nitrogen,
          phosphorus: formData.phosphorus,
          potassium: formData.potassium,
          temperature: formData.temperature,
          humidity: formData.humidity,
          ph: formData.ph,
          rainfall: formData.rainfall,
          recommended_crop: result.recommended_crop,
          selected_model: result.selected_model,
          confidence: result.confidence,
          prediction_probabilities: result.all_probabilities
        })
      } catch (dbErr) {
        console.warn('Note: Record saved locally or Supabase:', dbErr)
      }

      addToast(`Recommended Crop: ${result.recommended_crop} (${result.confidence}%)`, 'success')
      onPredictionComplete({
        single: result,
        allModels: allModelsResult,
        inputParams: formData,
        selectedModel
      })
    } catch (err) {
      addToast(`Prediction error: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Multi-Model Inference Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Soil Nutrient & Environmental Profiler
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
            Input soil chemical parameters and weather factors. Features are scaled via calibrated StandardScalers and evaluated using your selected model.
          </p>
        </div>

        {/* Quick Presets Pills */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Field Presets</span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_SAMPLES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-xs font-medium border border-slate-200/70 transition-colors"
              >
                {preset.name.split(' ')[0]} ({preset.crop})
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Model Selection Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-600" />
                <span>Select Inference Model</span>
              </label>
              <p className="text-xs text-slate-500">
                Choose from your 12 trained Machine Learning, Deep Learning, or Hybrid models
              </p>
            </div>

            {/* Compare All Toggle */}
            <label className="inline-flex items-center gap-2.5 cursor-pointer bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 transition-colors">
              <input
                type="checkbox"
                checked={compareAll}
                onChange={(e) => setCompareAll(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span className="text-xs font-semibold text-slate-700">
                Compare All 12 Models Simultaneously
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: "Random Forest", tag: "ML", acc: "99.55%", isDefault: true, desc: "300 trees, top test accuracy" },
              { name: "Hybrid XGBoost + ANN", tag: "Hybrid", acc: "99.55%", isDefault: false, desc: "Probability fusion (alpha=0.5)" },
              { name: "Extra Trees", tag: "ML", acc: "99.55%", isDefault: false, desc: "Randomized ensemble trees" },
              { name: "DNN", tag: "DL", acc: "99.32%", isDefault: false, desc: "4 layers with BatchNorm" },
              { name: "XGBoost", tag: "ML", acc: "99.32%", isDefault: false, desc: "Extreme Gradient Boosting" },
              { name: "SVM", tag: "ML", acc: "98.86%", isDefault: false, desc: "Support Vector Machine RBF" },
              { name: "ANN", tag: "DL", acc: "98.86%", isDefault: false, desc: "Dual hidden layer neural net" },
              { name: "1D-CNN", tag: "DL", acc: "98.86%", isDefault: false, desc: "1D Convolutional Neural Net" },
              { name: "Gradient Boosting", tag: "ML", acc: "98.86%", isDefault: false, desc: "Sequential boosted ensemble" },
              { name: "KNN", tag: "ML", acc: "98.18%", isDefault: false, desc: "Distance-weighted neighbors" },
              { name: "Decision Tree", tag: "ML", acc: "98.18%", isDefault: false, desc: "Interpretable tree (depth 15)" },
              { name: "Logistic Regression", tag: "ML", acc: "97.27%", isDefault: false, desc: "Multinomial baseline" },
            ].map((m) => {
              const isSelected = selectedModel === m.name
              return (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => setSelectedModel(m.name)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                    isSelected 
                      ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">{m.name}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      m.tag === 'Hybrid' ? 'bg-purple-100 text-purple-700' :
                      m.tag === 'DL' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {m.tag}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px]">
                    <span className="text-slate-500 truncate">{m.desc}</span>
                    <span className="font-semibold text-emerald-700 shrink-0 ml-1">{m.acc}</span>
                  </div>
                  {m.isDefault && (
                    <span className="absolute -top-2 right-3 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-600 text-white shadow-xs">
                      Default Best
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* 7 Soil & Climatic Parameters Grid */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Input Soil Nutrients & Environmental Parameters</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Exact 7 Feature Order (N, P, K, Temp, Hum, pH, Rain)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Nitrogen */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-extrabold">1</span>
                  <span>Nitrogen (N)</span>
                  <span className="text-slate-400 font-normal text-[11px]">(kg/ha)</span>
                </label>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {formData.nitrogen}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Key soil macronutrient for leaf growth and protein synthesis (0 - 140+)</p>
              <input
                type="range"
                min="0"
                max="140"
                step="1"
                value={formData.nitrogen}
                onChange={(e) => handleChange('nitrogen', e.target.value)}
                className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
              {errors.nitrogen && <p className="text-xs text-rose-500 font-medium">{errors.nitrogen}</p>}
            </div>

            {/* 2. Phosphorus */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-extrabold">2</span>
                  <span>Phosphorus (P)</span>
                  <span className="text-slate-400 font-normal text-[11px]">(kg/ha)</span>
                </label>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {formData.phosphorus}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Crucial for root architecture and flowering (5 - 145)</p>
              <input
                type="range"
                min="5"
                max="145"
                step="1"
                value={formData.phosphorus}
                onChange={(e) => handleChange('phosphorus', e.target.value)}
                className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
              {errors.phosphorus && <p className="text-xs text-rose-500 font-medium">{errors.phosphorus}</p>}
            </div>

            {/* 3. Potassium */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-extrabold">3</span>
                  <span>Potassium (K)</span>
                  <span className="text-slate-400 font-normal text-[11px]">(kg/ha)</span>
                </label>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {formData.potassium}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Enzyme activation, drought tolerance and fruit quality (5 - 205)</p>
              <input
                type="range"
                min="5"
                max="205"
                step="1"
                value={formData.potassium}
                onChange={(e) => handleChange('potassium', e.target.value)}
                className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
              {errors.potassium && <p className="text-xs text-rose-500 font-medium">{errors.potassium}</p>}
            </div>

            {/* 4. Temperature */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-extrabold">4</span>
                  <span>Temperature</span>
                  <span className="text-slate-400 font-normal text-[11px]">(°C)</span>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => handleChange('temperature', e.target.value)}
                    className="w-20 px-2 py-0.5 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded text-right outline-none"
                  />
                  <span className="text-xs text-slate-500">°C</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">Ambient field temperature (8.8°C - 44°C)</p>
              <input
                type="range"
                min="8"
                max="44"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => handleChange('temperature', e.target.value)}
                className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
              {errors.temperature && <p className="text-xs text-rose-500 font-medium">{errors.temperature}</p>}
            </div>

            {/* 5. Humidity */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-extrabold">5</span>
                  <span>Relative Humidity</span>
                  <span className="text-slate-400 font-normal text-[11px]">(%)</span>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.5"
                    value={formData.humidity}
                    onChange={(e) => handleChange('humidity', e.target.value)}
                    className="w-20 px-2 py-0.5 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded text-right outline-none"
                  />
                  <span className="text-xs text-slate-500">%</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">Atmospheric relative humidity percentage (14% - 100%)</p>
              <input
                type="range"
                min="14"
                max="100"
                step="0.5"
                value={formData.humidity}
                onChange={(e) => handleChange('humidity', e.target.value)}
                className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
              {errors.humidity && <p className="text-xs text-rose-500 font-medium">{errors.humidity}</p>}
            </div>

            {/* 6. Soil pH */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-extrabold">6</span>
                  <span>Soil pH Level</span>
                  <span className="text-slate-400 font-normal text-[11px]">(0 - 14 scale)</span>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="3"
                    max="10"
                    value={formData.ph}
                    onChange={(e) => handleChange('ph', e.target.value)}
                    className="w-20 px-2 py-0.5 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded text-right outline-none"
                  />
                  <span className="text-xs text-slate-500">pH</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">Acidity/alkalinity measure (Acidic &lt; 6.5, Neutral 6.5-7.5, Alkaline &gt; 7.5)</p>
              <input
                type="range"
                min="3.5"
                max="9.9"
                step="0.1"
                value={formData.ph}
                onChange={(e) => handleChange('ph', e.target.value)}
                className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
              {errors.ph && <p className="text-xs text-rose-500 font-medium">{errors.ph}</p>}
            </div>

            {/* 7. Rainfall */}
            <div className="space-y-1.5 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-extrabold">7</span>
                  <span>Rainfall Precipitation</span>
                  <span className="text-slate-400 font-normal text-[11px]">(mm)</span>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="1"
                    min="20"
                    max="300"
                    value={formData.rainfall}
                    onChange={(e) => handleChange('rainfall', e.target.value)}
                    className="w-24 px-2 py-0.5 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded text-right outline-none"
                  />
                  <span className="text-xs text-slate-500">mm</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">Total average seasonal rainfall precipitation (20mm - 300mm)</p>
              <input
                type="range"
                min="20"
                max="300"
                step="1"
                value={formData.rainfall}
                onChange={(e) => handleChange('rainfall', e.target.value)}
                className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
              {errors.rainfall && <p className="text-xs text-rose-500 font-medium">{errors.rainfall}</p>}
            </div>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold text-xs sm:text-sm bg-white hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Form</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sprout className="w-4 h-4" />
                <span>Get Crop Recommendation</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

