import React from 'react'
import { 
  LayoutDashboard, 
  Sprout, 
  BarChart3, 
  History, 
  UserCircle2, 
  LogOut, 
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const Sidebar = ({ currentTab, setCurrentTab, isMobileOpen, setIsMobileOpen }) => {
  const { user, profile, signOut, isConfigured } = useAuth()

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'recommend', label: 'Crop Recommendation', icon: Sprout, highlight: true },
    { id: 'comparison', label: 'Model Comparison', icon: BarChart3 },
    { id: 'history', label: 'Prediction History', icon: History },
    { id: 'profile', label: 'Profile', icon: UserCircle2 },
  ]

  const handleSelect = (id) => {
    setCurrentTab(id)
    if (setIsMobileOpen) setIsMobileOpen(false)
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-72 bg-white border-r border-slate-200/80 flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div>
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 leading-tight tracking-tight flex items-center gap-1.5">
                  AgriCrops <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">AI</span>
                </h1>
                <p className="text-xs text-slate-500 font-medium">Intelligent Crop Engine</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Main Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group
                    ${isActive 
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200/60 font-semibold' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`} />
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          {/* Research Model Badge */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
            <div className="flex items-center gap-2 font-medium text-slate-700 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Random Forest & Hybrid</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Research accuracy: <span className="font-semibold text-emerald-700">99.55%</span> with 12 ML/DL algorithms.
            </p>
          </div>

          {/* User Profile Card */}
          <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shrink-0">
                {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {profile?.full_name || 'Guest Researcher'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {user?.email || 'Demo Session'}
                </p>
              </div>
            </div>
            <button
              onClick={signOut}
              title="Sign Out"
              className="p-1.5 hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

