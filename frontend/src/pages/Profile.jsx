import React, { useState } from 'react'
import { 
  UserCircle2, 
  Mail, 
  Database, 
  ShieldCheck, 
  KeyRound, 
  Calendar, 
  CheckCircle2, 
  LogOut, 
  Sparkles,
  Cpu
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export const Profile = ({ onOpenAuth }) => {
  const { user, profile, isConfigured, signOut, resetPassword } = useAuth()
  const { addToast } = useToast()
  const [resetting, setResetting] = useState(false)

  const handlePasswordReset = async () => {
    if (!user?.email) return
    setResetting(true)
    try {
      await resetPassword(user.email)
      addToast('Password reset link sent to your email address.', 'info')
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
              {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  {profile?.full_name || 'Agricultural Researcher'}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{user?.email || 'researcher@agricrop.ai'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <button
                onClick={signOut}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Security & Authentication Info */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Supabase Connection */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Backend Services</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {isConfigured ? 'Supabase PostgreSQL' : 'Local Storage Fallback'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {isConfigured
                ? 'Your predictions and user profiles are secured with Supabase Row Level Security (RLS).'
                : 'Using local storage for immediate demo testing. Configure VITE_SUPABASE_URL to connect live PostgreSQL.'}
            </p>
          </div>

          {/* Model Engine Status */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-600" />
                <span>FastAPI Inference Engine</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                12 Trained Models
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Random Forest (99.55%), Hybrid XGBoost+ANN (99.55%), PyTorch ANN, DNN, 1D-CNN all active.
            </p>
          </div>
        </div>

        {/* Password Reset Action */}
        {user && (
          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Security Credentials</h4>
              <p className="text-xs text-slate-500">Request a secure password reset link sent to your registered email</p>
            </div>
            <button
              onClick={handlePasswordReset}
              disabled={resetting}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold bg-white hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <KeyRound className="w-4 h-4 text-slate-500" />
              <span>{resetting ? 'Sending...' : 'Reset Password'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

