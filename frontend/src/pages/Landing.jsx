import React from 'react'
import { 
  Sprout, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Cpu, 
  Database, 
  BarChart2, 
  CheckCircle2, 
  Droplets, 
  Thermometer, 
  Compass, 
  Leaf, 
  ShieldCheck, 
  LineChart 
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const Landing = ({ onGetStarted, onLogin }) => {
  const { user } = useAuth()

  const benefits = [
    {
      title: "Maximizing Agricultural Yield",
      desc: "Matches exact chemical soil profiles (N, P, K) with crop nutrient uptakes to unlock maximum biological potential.",
      icon: LineChart,
      color: "from-emerald-500 to-teal-600"
    },
    {
      title: "Optimizing Resource & Fertilizer Usage",
      desc: "Prevents excessive synthetic fertilizer expenditure by selecting crops naturally attuned to existing soil nitrogen and phosphorus.",
      icon: Droplets,
      color: "from-teal-500 to-cyan-600"
    },
    {
      title: "Climate & Rainfall Risk Mitigation",
      desc: "Factors in localized temperature, humidity and rainfall variations to shield farmers from erratic monsoon and drought shocks.",
      icon: Thermometer,
      color: "from-amber-500 to-emerald-600"
    },
    {
      title: "Sustainable Soil Stewardship",
      desc: "Prevents severe soil degradation and pH acidification through intelligent rotational crop choices and balanced land use.",
      icon: Leaf,
      color: "from-emerald-600 to-green-700"
    }
  ]

  const workflowSteps = [
    {
      num: "01",
      title: "Soil & Microclimate Input",
      desc: "Enter 7 measurable soil and climatic attributes: Nitrogen, Phosphorus, Potassium, Temperature, Relative Humidity, Soil pH, and Rainfall."
    },
    {
      num: "02",
      title: "Feature Scaling & Neural Processing",
      desc: "Inputs are standardized through research-calibrated scalers and fed into 12 trained Machine Learning and Deep Learning architectures."
    },
    {
      num: "03",
      title: "Hybrid Probability Fusion",
      desc: "XGBoost soft probabilities and ANN neural activations undergo calibrated probability fusion (alpha=0.5) to achieve 99.55% accuracy."
    },
    {
      num: "04",
      title: "Actionable Agronomy Recommendations",
      desc: "Receive top recommended crops, ranked prediction confidences, growth durations, fertilizer recommendations, and downloadable advisory reports."
    }
  ]

  const benchmarkStats = [
    { value: "99.55%", label: "Peak Model Accuracy", sub: "Random Forest & Hybrid XGBoost+ANN" },
    { value: "12", label: "Models Benchmarked", sub: "8 ML, 3 DL, 1 Hybrid Fusion" },
    { value: "22", label: "Crop Varieties", sub: "Cereals, Pulses, Fruits, Cash Crops" },
    { value: "2,200", label: "Validated Soil Profiles", sub: "Precision Agriculture Dataset" }
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-emerald-950 via-slate-950 to-slate-900 text-white">
        {/* Soft atmospheric glowing orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Top research badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-6 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Research Project • Hybrid ML & DL Architecture</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-tight">
              Intelligent Crop <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400">
                Recommendation System
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Empowering farmers, agronomists, and researchers with state-of-the-art hybrid machine learning and deep neural networks. Predict optimal crop choices tailored to precise soil chemistry and climate conditions with 99.55% benchmark accuracy.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Launch Crop Engine</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {!user && (
                <button
                  onClick={onLogin}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-sm backdrop-blur-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Sign In with Supabase</span>
                </button>
              )}
            </div>

            {/* Research stats bar */}
            <div className="mt-14 pt-10 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
              {benchmarkStats.map((stat, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{stat.value}</div>
                  <div className="text-xs font-semibold text-slate-200 mt-1">{stat.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Scientific Pipeline</h2>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">How Intelligent Recommendation Works</h3>
            <p className="mt-3 text-sm text-slate-600">
              Transforming raw agro-climatic measurements into high-confidence crop guidance through multi-stage inference.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow group">
                <span className="text-3xl font-black text-emerald-600/30 group-hover:text-emerald-600/60 transition-colors">
                  {step.num}
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-3 mb-2">{step.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Agronomic Benefits */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Precision Agriculture</h2>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Benefits of Data-Driven Crop Selection</h3>
            <p className="mt-3 text-sm text-slate-600">
              Traditional farming often relies on historical intuition alone. AI-driven precision agriculture delivers concrete, measurable impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((b, idx) => {
              const Icon = b.icon
              return (
                <div key={idx} className="p-7 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-5 hover:border-emerald-300 transition-colors">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${b.color} text-white flex items-center justify-center shrink-0 shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{b.title}</h4>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Ready to Test CTA */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <Sprout className="w-12 h-12 mx-auto text-emerald-200 mb-4" />
          <h3 className="text-2xl sm:text-3xl font-bold">Ready to Analyze Soil & Climate?</h3>
          <p className="mt-2 text-sm text-emerald-100 max-w-xl mx-auto">
            Try with your own local measurements or select one of our curated field presets to see real model probabilities immediately.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={onGetStarted}
              className="px-8 py-3.5 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-sm shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              Get Crop Recommendation Now
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

