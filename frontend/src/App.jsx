import React, { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Navbar } from './components/Navbar'
import { Landing } from './pages/Landing'
import { Dashboard } from './pages/Dashboard'
import { Recommend } from './pages/Recommend'
import { Results } from './pages/Results'
import { ModelComparison } from './pages/ModelComparison'
import { History } from './pages/History'
import { Profile } from './pages/Profile'
import { AuthModal } from './pages/AuthModal'
import { useAuth } from './context/AuthContext'

export function App() {
  const { user } = useAuth()
  const [currentTab, setCurrentTab] = useState('landing') // 'landing', 'dashboard', 'recommend', 'results', 'comparison', 'history', 'profile'
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [activeResult, setActiveResult] = useState(null)

  const handlePredictionComplete = (resultData) => {
    setActiveResult(resultData)
    setCurrentTab('results')
  }

  const handleViewPastPrediction = (predictionRecord) => {
    // If it's already structured or from history
    if (predictionRecord.single) {
      setActiveResult(predictionRecord)
    } else {
      setActiveResult({
        single: {
          recommended_crop: predictionRecord.recommended_crop,
          selected_model: predictionRecord.selected_model || 'Random Forest',
          confidence: predictionRecord.confidence || 95.0,
          top_3_recommendations: [
            { crop: predictionRecord.recommended_crop, percentage: predictionRecord.confidence || 95.0, probability: 0.95 }
          ],
          all_probabilities: predictionRecord.prediction_probabilities || {},
          timestamp: predictionRecord.created_at
        },
        inputParams: {
          nitrogen: predictionRecord.nitrogen,
          phosphorus: predictionRecord.phosphorus,
          potassium: predictionRecord.potassium,
          temperature: predictionRecord.temperature,
          humidity: predictionRecord.humidity,
          ph: predictionRecord.ph,
          rainfall: predictionRecord.rainfall
        },
        selectedModel: predictionRecord.selected_model || 'Random Forest'
      })
    }
    setCurrentTab('results')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar for Application Views */}
      {currentTab !== 'landing' && (
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${currentTab !== 'landing' ? 'lg:pl-72' : ''}`}>
        {/* Navigation Bar */}
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          setIsMobileOpen={setIsMobileOpen}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {currentTab === 'landing' && (
            <Landing
              onGetStarted={() => setCurrentTab('recommend')}
              onLogin={() => setIsAuthModalOpen(true)}
            />
          )}

          {currentTab === 'dashboard' && (
            <Dashboard
              onNavigateToRecommend={() => setCurrentTab('recommend')}
              onNavigateToHistory={() => setCurrentTab('history')}
              onNavigateToComparison={() => setCurrentTab('comparison')}
              onViewPrediction={handleViewPastPrediction}
            />
          )}

          {currentTab === 'recommend' && (
            <Recommend
              onPredictionComplete={handlePredictionComplete}
            />
          )}

          {currentTab === 'results' && (
            <Results
              resultData={activeResult}
              onBackToRecommend={() => setCurrentTab('recommend')}
            />
          )}

          {currentTab === 'comparison' && (
            <ModelComparison />
          )}

          {currentTab === 'history' && (
            <History
              onViewPrediction={handleViewPastPrediction}
              onNavigateToRecommend={() => setCurrentTab('recommend')}
            />
          )}

          {currentTab === 'profile' && (
            <Profile
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  )
}

export default App
