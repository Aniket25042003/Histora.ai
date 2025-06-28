import React from 'react'
import { useState } from 'react'
import { Clock, Lock, Sparkles, Users, BookOpen, ArrowRight, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { AuthModal } from '../components/AuthModal'

export function LandingPage() {
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const historicalFigures = [
    { name: 'Albert Einstein', era: '1879-1955', image: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Albert_Einstein_Head.jpg' },
    { name: 'Nikola Tesla', era: '1856-1943', image: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Tesla_Sarony.jpg' },
    { name: 'Maya Angelou', era: '1928-2014', image: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Maya_angelou.jpg' },
    { name: 'Marie Curie', era: '1867-1934', image: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Mariecurie.jpg' },
  ]

  const additionalFigures = [
    { name: 'William Shakespeare', era: '1564-1616', image: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Shakespeare.jpg' },
    { name: 'Napoleon Bonaparte', era: '1769-1821', image: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Bonaparte_premier_Consul_G%C3%A9rard_Chantilly.jpg' },
    { name: 'Mahatma Gandhi', era: '1869-1948', image: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Mahatma-Gandhi%2C_studio%2C_1931.jpg' },
    { name: 'Benjamin Franklin', era: '1706-1790', image: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Benjamin_Franklin_by_Joseph_Siffrein_Duplessis.jpg' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Background Stars */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>

      {/* Hero & Previews */}
      <div className="relative z-10">
        <header className="container mx-auto px-6 pt-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-amber-400" />
              <span className="text-xl font-bold font-serif">Histora</span>
            </div>
            <div className="flex items-center space-x-4">
              {/* Bolt.new Badge */}
              <a
                href="https://bolt.new/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-amber-400/50 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105"
              >
                <img 
                  src="/bolt.svg" 
                  alt="Built with Bolt.new" 
                  className="h-5 w-auto"
                />
                <span className="text-xs text-slate-300 group-hover:text-white transition-colors">
                  Built with Bolt
                </span>
                <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-amber-400 transition-colors" />
              </a>
              <button
                onClick={() => setShowAuthModal(true)}
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Get Started'}
              </button>
            </div>
          </nav>
        </header>

        <main className="container mx-auto px-6 pt-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl font-bold font-serif mb-6 bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent leading-tight">
              Talk to the Past.
              <br />
              Learn for the Future.
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed max-w-3xl mx-auto">
              Chat with historical legends like Einstein, Cleopatra, or Shakespeare using AI.
              Experience history through immersive voice conversations and build your personal journal of wisdom.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
              <button
                onClick={() => setShowAuthModal(true)}
                disabled={loading}
                className="group bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 flex items-center space-x-2 shadow-2xl disabled:opacity-50"
              >
                <span>Begin Your Journey</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center space-x-2 text-slate-400">
                <Users className="h-5 w-5" />
                <span>Join thousands of time travelers</span>
              </div>
            </div>

            {/* Historical Figures Preview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {historicalFigures.map((figure, index) => (
                <div
                  key={figure.name}
                  className="group relative overflow-hidden rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-amber-400/50 transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={figure.image}
                      alt={figure.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-semibold text-white mb-1">{figure.name}</h3>
                    <p className="text-sm text-slate-300">{figure.era}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Additional Figures (no gap above) */}
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {additionalFigures.map((figure, index) => (
              <div
                key={figure.name}
                className="group relative overflow-hidden rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-amber-400/50 transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={figure.image}
                    alt={figure.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-semibold text-white mb-1">{figure.name}</h3>
                  <p className="text-sm text-slate-300">{figure.era}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 font-serif">AI-Powered Conversations</h3>
              <p className="text-slate-300 leading-relaxed">
                Experience realistic voice conversations with historical figures powered by advanced AI and voice synthesis.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 font-serif">Time Travel Experience</h3>
              <p className="text-slate-300 leading-relaxed">
                Immerse yourself in different historical eras through authentic conversations and period-appropriate responses.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-slate-900 to-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 font-serif">Personal Journal</h3>
              <p className="text-slate-300 leading-relaxed">
                Automatically capture and organize your conversations into a beautiful personal journal of historical wisdom.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-8 border-t border-slate-700/50">
          <div className="flex flex-col items-center space-y-6">
            {/* Partner Logos */}
            <div className="flex flex-col items-center space-y-4">
              <p className="text-slate-400 text-sm">Powered by</p>
              <div className="flex items-center justify-center space-x-8 md:space-x-12">
                <a
                  href="https://bolt.new/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group transition-all duration-300 hover:scale-110"
                >
                  <img 
                    src="/bolt.svg" 
                    alt="Bolt.new" 
                    className="h-8 w-auto opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                </a>
                <a
                  href="https://supabase.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group transition-all duration-300 hover:scale-110"
                >
                  <img 
                    src="/supabase.svg" 
                    alt="Supabase" 
                    className="h-8 w-auto opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                </a>
                <a
                  href="https://www.netlify.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group transition-all duration-300 hover:scale-110"
                >
                  <img 
                    src="/netlify.svg" 
                    alt="Netlify" 
                    className="h-8 w-auto opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                </a>
                <a
                  href="https://www.tavus.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group transition-all duration-300 hover:scale-110"
                >
                  <img 
                    src="/tavus.svg" 
                    alt="Tavus" 
                    className="h-8 w-auto opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                </a>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="text-center text-slate-400">
              <p>© 2025 Histora. Experience history through conversation.</p>
            </div>
          </div>
        </footer>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}