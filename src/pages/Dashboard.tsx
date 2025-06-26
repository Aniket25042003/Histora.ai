import React, { useState, useEffect } from 'react'
import { Clock, LogOut, MessageCircle, Trash2, Calendar, User, BookOpen } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase, DiaryEntry, FigurePrompt } from '../lib/supabase'
import { getAllowedTopicsForFigure } from '../lib/figureTopics'

export function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [selectedFigure, setSelectedFigure] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([])
  const [figures, setFigures] = useState<FigurePrompt[]>([])
  const [loading, setLoading] = useState(true)

  // Get available topics based on selected figure
  const getAvailableTopics = () => {
    if (!selectedFigure) return []
    return getAllowedTopicsForFigure(selectedFigure)
  }

  useEffect(() => {
    if (user) {
      loadDiaryEntries()
      loadFigures()
    }
  }, [user])

  // Reset topic when figure changes
  useEffect(() => {
    if (selectedFigure) {
      const allowedTopics = getAllowedTopicsForFigure(selectedFigure)
      if (selectedTopic && !allowedTopics.includes(selectedTopic)) {
        setSelectedTopic('')
      }
    }
  }, [selectedFigure, selectedTopic])

  const loadDiaryEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDiaryEntries(data || [])
    } catch (error) {
      console.error('Error loading diary entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFigures = async () => {
    try {
      // Check if supabase client is properly initialized
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }

      const { data, error } = await supabase
        .from('figure_prompts')
        .select('*')
        .order('name')

      if (error) throw error
      setFigures(data || [])
    } catch (error) {
      console.error('Error loading figures:', error)
      // Show more detailed error information
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
          hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
        })
      }
    }
  }

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id)

      if (error) throw error
      setDiaryEntries(entries => entries.filter(entry => entry.id !== id))
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const startConversation = () => {
    if (selectedFigure && selectedTopic) {
      navigate(`/chat?figure=${encodeURIComponent(selectedFigure)}&topic=${encodeURIComponent(selectedTopic)}`)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Background Stars */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/20">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-amber-400" />
              <span className="text-xl font-bold font-serif">Histora.ai</span>
            </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700/50">
                  <User className="h-4 w-4 text-amber-400" />
                  <span className="text-sm">{user?.user_metadata?.full_name || user?.email}</span>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-12">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4 bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Time Traveler'}!
            </h1>
            <p className="text-xl text-slate-300">
              Ready to explore history through conversation?
            </p>
          </div>

          {/* Conversation Setup */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-semibold mb-6 font-serif text-center">Start a New Conversation</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Choose a Historical Figure
                  </label>
                  <select
                    value={selectedFigure}
                    onChange={(e) => setSelectedFigure(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  >
                    <option value="">Select a figure...</option>
                    {figures.map((figure) => (
                      <option key={figure.id} value={figure.name}>
                        {figure.name} {figure.era && `(${figure.era})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Choose a Topic
                  </label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    disabled={!selectedFigure}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  >
                    <option value="">
                      {!selectedFigure ? 'Select a figure first...' : 'Select a topic...'}
                    </option>
                    {getAvailableTopics().map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                  {selectedFigure && (
                    <p className="text-xs text-slate-400 mt-2">
                      Available topics for {selectedFigure}: {getAvailableTopics().join(', ')}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={startConversation}
                disabled={!selectedFigure || !selectedTopic}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-slate-600 disabled:to-slate-700 text-slate-900 disabled:text-slate-400 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Start Conversation</span>
              </button>
            </div>
          </div>

          {/* Diary Entries */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold font-serif mb-8 text-center">Your Histora.ai Journal</h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto"></div>
                <p className="text-slate-300 mt-4">Loading your journal entries...</p>
              </div>
            ) : diaryEntries.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                <BookOpen className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Your journal is empty</h3>
                <p className="text-slate-400">Start your first conversation to begin your time travel journey!</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {diaryEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-amber-400/30 transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-amber-400">{entry.figure}</h3>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-300 text-sm">{entry.subject}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-400">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(entry.created_at)}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-all duration-200 p-2 hover:bg-slate-700/50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <p className="text-slate-200 leading-relaxed">{entry.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}