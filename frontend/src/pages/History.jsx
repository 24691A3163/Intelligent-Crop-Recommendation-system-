import React, { useEffect, useState } from 'react'
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  Trash2, 
  Download, 
  Calendar, 
  Sprout, 
  ArrowRight, 
  Eye, 
  AlertTriangle,
  X
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { dbService } from '../services/supabaseClient'
import { CROP_DETAILS } from '../services/cropData'

export const History = ({ onViewPrediction, onNavigateToRecommend }) => {
  const { user } = useAuth()
  const { addToast } = useToast()

  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCrop, setFilterCrop] = useState('All')
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [selectedPrediction, setSelectedPrediction] = useState(null)

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const data = await dbService.getPredictions(user?.id)
      setPredictions(data || [])
    } catch (err) {
      console.error('Error fetching history:', err)
      addToast('Failed to load prediction history', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [user])

  const handleDelete = async (id) => {
    try {
      await dbService.deletePrediction(id, user?.id)
      setPredictions(prev => prev.filter(p => p.id !== id))
      addToast('Prediction record deleted successfully', 'success')
      setDeleteTargetId(null)
    } catch (err) {
      addToast(`Error deleting record: ${err.message}`, 'error')
    }
  }

  const exportCSV = () => {
    if (predictions.length === 0) {
      addToast('No records to export', 'info')
      return
    }

    const headers = ['Prediction ID', 'Date', 'Crop', 'Model', 'Confidence (%)', 'N', 'P', 'K', 'Temperature', 'Humidity', 'pH', 'Rainfall']
    const rows = predictions.map(p => [
      p.id,
      new Date(p.created_at).toISOString(),
      p.recommended_crop,
      p.selected_model,
      p.confidence || '',
      p.nitrogen,
      p.phosphorus,
      p.potassium,
      p.temperature,
      p.humidity,
      p.ph,
      p.rainfall
    ])

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `crop_prediction_history_${new Date().toISOString().slice(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    addToast('History exported to CSV', 'success')
  }

  // Crop list for filter
  const uniqueCrops = Array.from(new Set(predictions.map(p => p.recommended_crop).filter(Boolean)))

  // Filtering
  const filtered = predictions.filter(p => {
    const matchesSearch = 
      (p.recommended_crop || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.selected_model || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCrop = filterCrop === 'All' || p.recommended_crop === filterCrop
    return matchesSearch && matchesCrop
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-emerald-600" />
            <span>Prediction History</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse, filter, and inspect past soil nutrient evaluations and crop recommendations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onNavigateToRecommend}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
          >
            New Recommendation
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by crop name or model..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-emerald-500 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterCrop}
            onChange={(e) => setFilterCrop(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-700 font-medium outline-none focus:border-emerald-500"
          >
            <option value="All">All Crops ({predictions.length})</option>
            {uniqueCrops.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading records...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Recommended Crop</th>
                  <th className="py-3 px-4">Model</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">N-P-K</th>
                  <th className="py-3 px-4">Climate</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 capitalize">
                        <span>{CROP_DETAILS[item.recommended_crop?.toLowerCase()]?.emoji || '🌱'}</span>
                        <span>{item.recommended_crop}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {item.selected_model || 'Random Forest'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-600">
                      {item.confidence ? `${item.confidence}%` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.nitrogen}-{item.phosphorus}-{item.potassium}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {item.temperature}°C / {item.humidity}% / {item.rainfall}mm
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPrediction(item)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                          title="Inspect details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(item.id)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <Sprout className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No prediction history found</p>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery ? 'Try clearing your search filters' : 'Start your first crop recommendation'}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Delete Prediction Record?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete this prediction record from your history? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTargetId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm shadow-rose-600/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Inspection Modal */}
      {selectedPrediction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 relative">
            <button
              onClick={() => setSelectedPrediction(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 text-2xl flex items-center justify-center">
                {CROP_DETAILS[selectedPrediction.recommended_crop?.toLowerCase()]?.emoji || '🌱'}
              </div>
              <div>
                <h3 className="text-xl font-bold capitalize text-slate-900">
                  {selectedPrediction.recommended_crop}
                </h3>
                <p className="text-xs text-slate-500">
                  Model: {selectedPrediction.selected_model} • Confidence: {selectedPrediction.confidence || 'N/A'}%
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 text-xs space-y-2">
              <div className="flex justify-between text-slate-500 font-mono text-[11px]">
                <span>Record ID: {selectedPrediction.id}</span>
                <span>{new Date(selectedPrediction.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Soil & Climate Inputs</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500 block">Nitrogen (N):</span>
                  <span className="font-bold text-slate-900">{selectedPrediction.nitrogen} kg/ha</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500 block">Phosphorus (P):</span>
                  <span className="font-bold text-slate-900">{selectedPrediction.phosphorus} kg/ha</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500 block">Potassium (K):</span>
                  <span className="font-bold text-slate-900">{selectedPrediction.potassium} kg/ha</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500 block">Temperature:</span>
                  <span className="font-bold text-slate-900">{selectedPrediction.temperature} °C</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500 block">Humidity:</span>
                  <span className="font-bold text-slate-900">{selectedPrediction.humidity} %</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500 block">Soil pH:</span>
                  <span className="font-bold text-slate-900">{selectedPrediction.ph} pH</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 col-span-2">
                  <span className="text-slate-500 block">Rainfall:</span>
                  <span className="font-bold text-slate-900">{selectedPrediction.rainfall} mm</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  onViewPrediction({
                    single: {
                      recommended_crop: selectedPrediction.recommended_crop,
                      selected_model: selectedPrediction.selected_model,
                      confidence: selectedPrediction.confidence || 95.0,
                      top_3_recommendations: [
                        { crop: selectedPrediction.recommended_crop, percentage: selectedPrediction.confidence || 95.0, probability: 0.95 }
                      ],
                      all_probabilities: selectedPrediction.prediction_probabilities || {},
                      timestamp: selectedPrediction.created_at
                    },
                    inputParams: {
                      nitrogen: selectedPrediction.nitrogen,
                      phosphorus: selectedPrediction.phosphorus,
                      potassium: selectedPrediction.potassium,
                      temperature: selectedPrediction.temperature,
                      humidity: selectedPrediction.humidity,
                      ph: selectedPrediction.ph,
                      rainfall: selectedPrediction.rainfall
                    },
                    selectedModel: selectedPrediction.selected_model
                  })
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Open Full Advisory Report</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

