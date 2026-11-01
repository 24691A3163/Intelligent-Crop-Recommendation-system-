import React, { useEffect, useState } from 'react'
import { 
  BarChart3, 
  Award, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  TrendingUp, 
  Filter 
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell 
} from 'recharts'
import { api } from '../services/api'

export const ModelComparison = () => {
  const [metricsData, setMetricsData] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await api.getModelMetrics()
        setMetricsData(data)
      } catch (err) {
        console.error('Failed to load metrics:', err)
      } finally {
        setLoading(false)
      }
    }
    loadMetrics()
  }, [])

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold">Loading research evaluation benchmarks...</p>
      </div>
    )
  }

  const allMetrics = metricsData?.metrics || []

  // Filter models by category
  const filteredMetrics = selectedCategory === 'All'
    ? allMetrics
    : allMetrics.filter(m => m.category === selectedCategory)

  // Chart data: Accuracies
  const accuracyChartData = filteredMetrics.map(m => ({
    name: m.model,
    accuracy: Number((m.accuracy * 100).toFixed(2)),
    category: m.category
  }))

  // Chart data: Precision, Recall, F1
  const multiMetricChartData = filteredMetrics.map(m => ({
    name: m.model,
    precision: Number((m.precision * 100).toFixed(2)),
    recall: Number((m.recall * 100).toFixed(2)),
    f1_score: Number((m.f1_score * 100).toFixed(2))
  }))

  const cvModels = allMetrics.filter(m => m.cross_val_mean !== null)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Research Experiment Benchmarks</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            12-Model Comparative Evaluation
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
            Systematic benchmark across 8 Machine Learning algorithms, 3 Deep Neural Architectures, and the proposed XGBoost + ANN Hybrid probability fusion on 2,200 agricultural samples.
          </p>
        </div>

        {/* Best Model Highlight Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg min-w-[220px] shrink-0">
          <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-300" />
            <span>Best Model</span>
          </div>
          <h3 className="text-xl font-black mt-1">Random Forest</h3>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-black text-emerald-200">99.55%</span>
            <span className="text-xs text-emerald-100">Test Accuracy</span>
          </div>
          <p className="text-[11px] text-emerald-100/80 mt-1">
            Equal best with Hybrid XGBoost + ANN (99.55%)
          </p>
        </div>
      </div>

      {/* Category Filter Controls */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs w-fit">
        {['All', 'Machine Learning', 'Deep Learning', 'Hybrid'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accuracy Comparison Chart */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Test Accuracy Comparison (%)</h3>
            <p className="text-xs text-slate-500">Evaluated on independent 20% stratified test set</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Top: 99.55%
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={accuracyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
              <XAxis 
                dataKey="name" 
                angle={-35} 
                textAnchor="end" 
                interval={0} 
                tick={{ fontSize: 11, fill: '#475569' }} 
              />
              <YAxis domain={[95, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip formatter={(value) => [`${value}%`, 'Test Accuracy']} />
              <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                {accuracyChartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.accuracy >= 99.5 ? '#059669' :
                      entry.accuracy >= 99.0 ? '#0d9488' :
                      entry.accuracy >= 98.5 ? '#0284c7' : '#64748b'
                    } 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Precision, Recall, F1 Comparison Grouped Bar Chart */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Precision, Recall & F1-Score Metrics</h3>
            <p className="text-xs text-slate-500">Weighted averages across all 22 crop classes</p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={multiMetricChartData} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
              <XAxis 
                dataKey="name" 
                angle={-35} 
                textAnchor="end" 
                interval={0} 
                tick={{ fontSize: 11, fill: '#475569' }} 
              />
              <YAxis domain={[95, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip formatter={(value) => [`${value}%`]} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="precision" name="Precision" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recall" name="Recall" fill="#0284c7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="f1_score" name="F1 Score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full Metrics Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">Detailed Research Evaluation Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Model</th>
                <th className="py-3 px-3">Architecture Type</th>
                <th className="py-3 px-3">Accuracy</th>
                <th className="py-3 px-3">Precision</th>
                <th className="py-3 px-3">Recall</th>
                <th className="py-3 px-3">F1 Score</th>
                <th className="py-3 px-3">Macro ROC-AUC</th>
                <th className="py-3 px-3">5-Fold CV Mean</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMetrics.map((m) => {
                const isBest = m.model === 'Random Forest' || m.model === 'Hybrid XGBoost + ANN'
                return (
                  <tr key={m.model} className={`hover:bg-slate-50/70 transition-colors ${isBest ? 'bg-emerald-50/30' : ''}`}>
                    <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                      {isBest && <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      <span>{m.model}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.category === 'Hybrid' ? 'bg-purple-100 text-purple-700' :
                        m.category === 'Deep Learning' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {m.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-700">
                      {(m.accuracy * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {(m.precision * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {(m.recall * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">
                      {(m.f1_score * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {m.roc_auc !== null ? m.roc_auc.toFixed(4) : 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono">
                      {m.cross_val_mean !== null ? `${(m.cross_val_mean * 100).toFixed(2)}% (±${(m.cross_val_std * 100).toFixed(2)}%)` : 'N/A'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Learning & Hybrid Architecture Technical Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Hybrid Probability Fusion</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Combines tree-based non-linear partitioning from XGBoost with smooth manifold activations from PyTorch ANN:
          </p>
          <code className="block p-2 rounded-lg bg-slate-50 text-[11px] text-purple-800 font-mono">
            P = 0.5 * P_xgb + 0.5 * P_ann
          </code>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">DNN with Batch Normalization</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            4-layer neural network (256-128-64-22) with BatchNorm1d and 30% dropout to prevent co-adaptation of features.
          </p>
          <span className="inline-block text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
            99.32% Test Accuracy
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">1D-Convolutional Network</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Applies sequential 1D convolutions (kernel size 3) over soil-climate channels followed by AdaptiveAvgPool1d.
          </p>
          <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            98.86% Test Accuracy
          </span>
        </div>
      </div>
    </div>
  )
}

