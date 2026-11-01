import React, { useEffect, useState } from 'react'
import { 
  Menu, 
  Activity, 
  Database, 
  Sparkles, 
  User, 
  PlusCircle, 
  Wifi, 
  WifiOff 
} from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

export const Navbar = ({ currentTab, setCurrentTab, setIsMobileOpen, onOpenAuth }) => {
  const { user, profile, isConfigured } = useAuth()
  const [engineHealthy, setEngineHealthy] = useState(null)
  const [modelsCount, setModelsCount] = useState(12)

  useEffect(() => {
    let interval = null
    const checkApi = async () => {
      try {
        const res = await api.getHealth()
        setEngineHealthy(res.status === 'healthy')
        if (res.available_models_count) setModelsCount(res.available_models_count)
      } catch (e) {
        setEngineHealthy(false)
      }
    }

    checkApi()
    interval = setInterval(checkApi, 25000)
    return () => clearInterval(interval)
  }, [])

  const titles = {
    landing: 'Overview',
    dashboard: 'Dashboard',
    recommend: 'Intelligent Crop Recommendation',
    comparison: 'Machine Learning & Deep Learning Model Comparison',
    history: 'Prediction History',
    profile: 'User Profile & Settings'
  }

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Left: Mobile hamburger & breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {titles[currentTab] || 'Dashboard'}
          </h2>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Hybrid Machine Learning & Deep Learning Model Inference Platform
          </p>
        </div>
      </div>

      {/* Right: Engine Status & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* API Engine Health Badge */}
        <div className={`
          flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors
          ${engineHealthy === true 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : engineHealthy === false 
            ? 'bg-rose-50 text-rose-700 border-rose-200' 
            : 'bg-slate-100 text-slate-600 border-slate-200'
          }
        `} title={engineHealthy ? 'FastAPI Inference API is online and models are loaded' : 'Backend offline'}>
          <span className={`w-2 h-2 rounded-full ${engineHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="hidden md:inline">
            {engineHealthy ? `FastAPI (${modelsCount} Models Loaded)` : 'Engine Offline'}
          </span>
          <span className="md:hidden">{engineHealthy ? 'API Online' : 'API Offline'}</span>
        </div>

        {/* Supabase Status Badge */}
        <div className={`
          hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
          ${isConfigured 
            ? 'bg-teal-50 text-teal-700 border-teal-200' 
            : 'bg-amber-50 text-amber-700 border-amber-200'
          }
        `} title={isConfigured ? 'Supabase PostgreSQL connected' : 'Local storage demo mode active'}>
          <Database className="w-3.5 h-3.5" />
          <span>{isConfigured ? 'Supabase Auth' : 'Demo Storage'}</span>
        </div>

        {/* Quick New Recommendation Button */}
        {currentTab !== 'recommend' && (
          <button
            onClick={() => setCurrentTab('recommend')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">New Prediction</span>
          </button>
        )}

        {/* Auth CTA or Avatar */}
        {user ? (
          <button
            onClick={() => setCurrentTab('profile')}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs transition-colors"
            title="Profile"
          >
            {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  )
}

