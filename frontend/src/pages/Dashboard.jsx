import React, { useEffect, useState } from 'react'
import { 
  Sprout, 
  Sparkles, 
  Award, 
  History, 
  TrendingUp, 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  BarChart3, 
  Layers,
  ChevronRight
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { dbService } from '../services/supabaseClient'
import { CROP_DETAILS } from '../services/cropData'

const CHART_COLORS = ['#059669', '#0d9488', '#0284c7', '#6366f1', '#8b5cf6', '#d97706', '#e11d48']

export const Dashboard = ({ onNavigateToRecommend, onNavigateToHistory, onNavigateToComparison, onViewPrediction }) => {
  const { user, profile } = useAuth()
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const data = await dbService.getPredictions(user?.id)
        setPredictions(data || [])
      } catch (err) {
        console.error('Error fetching dashboard predictions:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [user])

  // Compute analytics
  const totalPredictions = predictions.length

  // Crop frequencies
  const cropCounts = {}
  predictions.forEach(p => {
    const crop = p.recommended_crop
    cropCounts[crop] = (cropCounts[crop] || 0) + 1
  })

  let mostFrequentCrop = 'None yet'
  let maxCount = 0
  Object.entries(cropCounts).forEach(([crop, count]) => {
    if (count > maxCount) {
      maxCount = count
      mostFrequentCrop = crop
    }
  })

  // Average confidence
  const validConfidences = predictions.filter(p => typeof p.confidence === 'number')
  const avgConfidence = validConfidences.length > 0
    ? (validConfidences.reduce((acc, curr) => acc + curr.confidence, 0) / validConfidences.length).toFixed(1)
    : '95.0'

  // Chart data: Top crops
  const cropChartData = Object.entries(cropCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Chart data: Models used
  const modelCounts = {}
  predictions.forEach(p => {
    const m = p.selected_model || 'Random Forest'
    modelCounts[m] = (modelCounts[m] || 0) + 1
  })
  const modelChartData = Object.entries(modelCounts).map(([name, value]) => ({ name, value }))

  const recentPredictions = predictions.slice(0, 5)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intelligent Agricultural Dashboard</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'Researcher'}!
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Your soil analysis and crop recommendation models are fully trained and loaded. Enter farm soil nutrients to infer optimal crop varieties using our 99.55% benchmarked Random Forest & Hybrid models.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateToRecommend}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Sprout className="w-4 h-4" />
              <span>Get Crop Recommendation</span>
            </button>
            <button
              onClick={onNavigateToComparison}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs sm:text-sm border border-white/15 transition-all flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Compare 12 Models</span>
            </button>
          </div>
        </div>

        {/* Decorative background leaf */}
        <Sprout className="absolute -right-8 -bottom-8 w-64 h-64 text-emerald-700/20 pointer-events-none" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Predictions */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <History className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Predictions</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalPredictions}</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Across active seasons</p>
          </div>
        </div>

        {/* Most Recommended Crop */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Frequent Crop</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5 capitalize">{mostFrequentCrop}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Highest field compatibility</p>
          </div>
        </div>

        {/* Best Model */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Default Model</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">Random Forest</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">99.55% Test Accuracy</p>
          </div>
        </div>

        {/* Average Model Confidence */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Confidence</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{avgConfidence}%</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Calibrated probabilities</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Most Recommended Crops Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Crop Recommendation Overview</h3>
              <p className="text-xs text-slate-500">Distribution of recommended crops based on your history</p>
            </div>
            <button
              onClick={onNavigateToRecommend}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Add Data</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="h-64 w-full">
            {cropChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cropChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" name="Recommendations" fill="#059669" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <Sprout className="w-8 h-8 mb-2 text-slate-300" />
                <span>No predictions recorded yet. Run your first prediction!</span>
              </div>
            )}
          </div>
        </div>

        {/* Selected Model Breakdown */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Inference Models</h3>
            <p className="text-xs text-slate-500 mb-4">Active algorithms used for recommendations</p>
            <div className="h-44 w-full flex items-center justify-center">
              {modelChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={modelChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {modelChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-400 text-xs text-center">
                  <span>Models ready for inference</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
            <div className="flex items-center justify-between">
              <span className="font-medium">Top Performer:</span>
              <span className="font-bold text-emerald-700">Random Forest (99.55%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Hybrid Engine:</span>
              <span className="font-bold text-teal-700">XGBoost + ANN (99.55%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Prediction History Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Prediction History</h3>
            <p className="text-xs text-slate-500">Your latest crop recommendations and input soil parameters</p>
          </div>
          {predictions.length > 5 && (
            <button
              onClick={onNavigateToHistory}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>View All History</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {recentPredictions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Recommended Crop</th>
                  <th className="py-3 px-3">Model Used</th>
                  <th className="py-3 px-3">Confidence</th>
                  <th className="py-3 px-3">Soil (N-P-K)</th>
                  <th className="py-3 px-3">Climate (T / H / pH / Rain)</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPredictions.map((pred) => (
                  <tr key={pred.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(pred.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                        <span>{CROP_DETAILS[pred.recommended_crop?.toLowerCase()]?.emoji || '🌱'}</span>
                        <span>{pred.recommended_crop}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {pred.selected_model || 'Random Forest'}
                    </td>
                    <td className="py-3 px-3 font-semibold text-emerald-600">
                      {pred.confidence ? `${pred.confidence}%` : 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {pred.nitrogen}-{pred.phosphorus}-{pred.potassium}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {pred.temperature}°C / {pred.humidity}% / {pred.ph} pH / {pred.rainfall}mm
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onViewPrediction(pred)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <Sprout className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">No predictions made yet</p>
            <p className="text-xs text-slate-400 mt-1">Start by analyzing your soil and climate data</p>
            <button
              onClick={onNavigateToRecommend}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
            >
              Make First Prediction
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

