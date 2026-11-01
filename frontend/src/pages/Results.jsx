import React, { useState } from 'react'
import { 
  Sprout, 
  Printer, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Droplets, 
  Clock, 
  Leaf, 
  Cpu, 
  HelpCircle, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Share2,
  FileText
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts'
import { CROP_DETAILS } from '../services/cropData'

export const Results = ({ resultData, onBackToRecommend }) => {
  const [showAllProbs, setShowAllProbs] = useState(false)

  if (!resultData || !resultData.single) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-600">No prediction data found.</p>
        <button
          onClick={onBackToRecommend}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm"
        >
          Go to Recommendation Form
        </button>
      </div>
    )
  }

  const { single, allModels, inputParams, selectedModel } = resultData
  const cropKey = single.recommended_crop?.toLowerCase() || ''
  const details = CROP_DETAILS[cropKey] || {
    emoji: "🌱",
    category: "Agricultural Crop",
    season: "Regional Seasonal",
    waterRequirement: "Standard irrigation",
    growthDuration: "90 - 120 days",
    soilPreference: "Fertile agricultural loam",
    fertilizerAdvice: "Standard balanced N-P-K according to soil testing.",
    tip: "Maintain optimal moisture and weed control during early establishment."
  }

  const top3ChartData = (single.top_3_recommendations || []).map((item) => ({
    name: item.crop,
    percentage: item.percentage
  }))

  const allProbsSorted = Object.entries(single.all_probabilities || {})
    .map(([crop, prob]) => ({ crop, prob, pct: (prob * 100).toFixed(2) }))
    .sort((a, b) => b.prob - a.prob)

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={onBackToRecommend}
          className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>New Recommendation</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Container */}
      <div id="printable-report" className="space-y-6">
        {/* Main Recommendation Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-4xl sm:text-5xl shadow-inner shrink-0">
                {details.emoji}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    Optimal Recommended Crop
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-medium">
                    {details.category}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight capitalize text-white">
                  {single.recommended_crop}
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-emerald-100/80">
                  Evaluated using <span className="font-semibold text-white">{single.selected_model}</span>
                </p>
                <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Report Timestamp: {new Date(single.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Model Confidence Box */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 min-w-[180px] text-center md:text-right shrink-0">
              <span className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider block">
                Model Confidence
              </span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 mt-0.5">
                {single.confidence}%
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(single.confidence, 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-300 mt-1 block">
                Research calibrated probability
              </span>
            </div>
          </div>
        </div>

        {/* Agronomic Guide Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Growth Cycle</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">{details.growthDuration}</p>
            <p className="text-xs text-slate-500 mt-0.5">Season: {details.season}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1">
              <Droplets className="w-4 h-4 text-teal-600" />
              <span>Water Requirement</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">{details.waterRequirement}</p>
            <p className="text-xs text-slate-500 mt-0.5">Irrigation schedule</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 text-sky-700 font-bold text-xs uppercase tracking-wider mb-1">
              <Leaf className="w-4 h-4 text-sky-600" />
              <span>Soil Preference</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">{details.soilPreference}</p>
            <p className="text-xs text-slate-500 mt-0.5">Soil texture match</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Yield Potential</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">High Biological Match</p>
            <p className="text-xs text-slate-500 mt-0.5">Balanced N-P-K uptake</p>
          </div>
        </div>

        {/* Detailed Agronomic Advice Box */}
        <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-200/70 shadow-sm space-y-3">
          <h3 className="font-bold text-emerald-950 text-sm sm:text-base flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-600" />
            <span>Agronomic & Fertilizer Recommendations</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-white border border-emerald-100">
              <span className="font-bold text-slate-900 block mb-1">Nutrient Management:</span>
              <p>{details.fertilizerAdvice}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-emerald-100">
              <span className="font-bold text-slate-900 block mb-1">Field Best Practice Tip:</span>
              <p>{details.tip}</p>
            </div>
          </div>
        </div>

        {/* Top 3 Recommendations & Probabilities */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Top 3 Crop Candidates</h3>
              <p className="text-xs text-slate-500">Relative model probabilities calculated from current soil inputs</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Model: {single.selected_model}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {(single.top_3_recommendations || []).map((item, idx) => (
              <div
                key={item.crop}
                className={`p-4 rounded-2xl border transition-all ${
                  idx === 0 
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/10' 
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Rank #{idx + 1}</span>
                  <span className="text-xs font-black text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {item.percentage}%
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 capitalize mt-1">
                  {item.crop}
                </h4>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${idx === 0 ? 'bg-emerald-600' : 'bg-slate-500'}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Visual Probability Comparison Bar Chart */}
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top3ChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }} />
                <Tooltip formatter={(value) => [`${value}%`, 'Probability Score']} />
                <Bar dataKey="percentage" fill="#059669" radius={[0, 6, 6, 0]}>
                  {top3ChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#059669' : index === 1 ? '#0d9488' : '#0284c7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Input Parameters Summary */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            Tested Soil & Climatic Parameters
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: 'Nitrogen (N)', val: `${inputParams.nitrogen} kg/ha` },
              { label: 'Phosphorus (P)', val: `${inputParams.phosphorus} kg/ha` },
              { label: 'Potassium (K)', val: `${inputParams.potassium} kg/ha` },
              { label: 'Temperature', val: `${inputParams.temperature} °C` },
              { label: 'Humidity', val: `${inputParams.humidity} %` },
              { label: 'Soil pH', val: `${inputParams.ph} pH` },
              { label: 'Rainfall', val: `${inputParams.rainfall} mm` },
            ].map((p, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-center">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">{p.label}</span>
                <span className="text-xs font-bold text-slate-900 mt-1 block">{p.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* All Models Comparison Consensus Table (if compareAll was selected) */}
        {allModels && allModels.results && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-emerald-600" />
                  <span>12-Model Consensus Comparison</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Real predictions from all 12 trained models evaluated on this exact input
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                12 Models Evaluated
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Model Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Predicted Crop</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3">Test Accuracy</th>
                    <th className="py-2.5 px-3">Second Pick</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allModels.results.map((m) => (
                    <tr key={m.model_name} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {m.model_name}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.category === 'Hybrid' ? 'bg-purple-100 text-purple-700' :
                          m.category === 'Deep Learning' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {m.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-emerald-700 capitalize">
                          {m.recommended_crop}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">
                        {m.confidence}%
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-600">
                        {m.test_accuracy}%
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 capitalize">
                        {m.top_3?.[1]?.crop ? `${m.top_3[1].crop} (${m.top_3[1].percentage}%)` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Full 22 Crops Probabilities Breakdown Accordion */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm no-print">
          <button
            onClick={() => setShowAllProbs(!showAllProbs)}
            className="w-full flex items-center justify-between text-left"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                View All 22 Crop Probabilities
              </h3>
              <p className="text-xs text-slate-500">
                Full model softmax / probability distribution across entire class catalog
              </p>
            </div>
            {showAllProbs ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {showAllProbs && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
              {allProbsSorted.map((item) => (
                <div key={item.crop} className="p-2 rounded-xl bg-slate-50 flex items-center justify-between">
                  <span className="font-semibold text-slate-700 capitalize">{item.crop}</span>
                  <span className="font-mono text-emerald-600 font-bold">{item.pct}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

