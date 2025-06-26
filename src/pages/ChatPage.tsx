import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mic, MicOff, Video, VideoOff, Clock, Save, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase, FigurePrompt, FigureTopicPrompt } from '../lib/supabase'
import { useConversation } from '../hooks/useConversation'
import { AvatarDisplay } from '../components/AvatarDisplay'

export function ChatPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { state, tavusConversation, conversationMessages, startConversation, toggleRecording, toggleVideo, endConversation, generateConversationSummary } = useConversation()
  const [figurePrompt, setFigurePrompt] = useState<FigurePrompt | null>(null)
  const [figureTopicPrompt, setFigureTopicPrompt] = useState<FigureTopicPrompt | null>(null)
  const [conversationSummary, setConversationSummary] = useState('')
  const [isEnding, setIsEnding] = useState(false)

  const figure = searchParams.get('figure') || ''
  const topic = searchParams.get('topic') || ''

  useEffect(() => {
    if (figure) {
      loadFigurePrompt()
      if (topic) {
        loadFigureTopicPrompt()
      }
    }
  }, [figure, topic])

  const loadFigurePrompt = async () => {
    try {
      const { data, error } = await supabase
        .from('figure_prompts')
        .select('*')
        .eq('name', figure)
        .single()

      if (error) throw error
      setFigurePrompt(data)
    } catch (error) {
      console.error('Error loading figure prompt:', error)
    }
  }

  const loadFigureTopicPrompt = async () => {
    try {
      const { data, error } = await supabase
        .from('figure_topic_prompts')
        .select('*')
        .eq('figure_name', figure)
        .eq('topic', topic)
        .single()

      if (error) throw error
      setFigureTopicPrompt(data)
    } catch (error) {
      console.error('Error loading figure topic prompt:', error)
    }
  }

  const handleStartConversation = async () => {
    if (!user || !figureTopicPrompt) return

    try {
      await startConversation({
        figure,
        topic,
        prompt: figureTopicPrompt.prompt,
        userId: user.id,
      })
    } catch (error) {
      console.error('Failed to start conversation:', error)
    }
  }

  const handleEndConversation = async () => {
    setIsEnding(true)
    
    try {
      // Generate conversation summary from Tavus if available
      let summary = ''
      try {
        const generatedSummary = await generateConversationSummary(figure, topic)
        summary = generatedSummary || generateFallbackSummary(figure, topic, state.sessionDuration)
      } catch (error) {
        console.warn('Could not generate Tavus summary, using fallback:', error)
        summary = generateFallbackSummary(figure, topic, state.sessionDuration)
      }
      
      // End the conversation after getting the summary
      await endConversation()
      
      setConversationSummary(summary)
      
      // Save to diary entries
      if (user) {
        try {
          const { error } = await supabase
            .from('diary_entries')
            .insert({
              user_id: user.id,
              figure,
              subject: topic,
              summary: summary
            })

          if (error) throw error
          
          // Navigate back to dashboard after a delay
          setTimeout(() => {
            navigate('/dashboard')
          }, 3000)
        } catch (error) {
          console.error('Error saving diary entry:', error)
        }
      }
    } catch (error) {
      console.error('Error ending conversation:', error)
    } finally {
      setIsEnding(false)
    }
  }

  const handleToggleRecording = async () => {
    try {
      await toggleRecording()
    } catch (error) {
      console.error('Error toggling recording:', error)
    }
  }

  const handleToggleVideo = () => {
    toggleVideo()
  }

  const generateFallbackSummary = (figure: string, topic: string, duration: number) => {
    return `Had a ${Math.floor(duration / 60)} minute conversation with ${figure} about ${topic}.`
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (conversationSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden flex items-center justify-center">
        {/* Background Stars */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="stars"></div>
          <div className="twinkling"></div>
        </div>
        <div className="relative z-10 max-w-2xl mx-auto p-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 text-center">
            <Save className="h-16 w-16 text-amber-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold font-serif mb-4">Conversation Saved!</h2>
            <p className="text-slate-300 mb-6">Your conversation with {figure} has been added to your journal.</p>
            <div className="bg-slate-700/50 rounded-lg p-4 text-left text-sm text-slate-200 mb-6">
              {conversationSummary}
            </div>
            <p className="text-slate-400">Returning to dashboard...</p>
          </div>
        </div>
      </div>
    )
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
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>

              <div className="flex items-center space-x-6">
                {state.isConnected && (
                  <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700/50">
                    <Clock className="h-4 w-4 text-amber-400" />
                    <span className="text-sm font-mono">{formatDuration(state.sessionDuration)}</span>
                  </div>
                )}
                
                <div className="text-right">
                  <h1 className="text-lg font-semibold">{figure}</h1>
                  <p className="text-sm text-slate-400">{topic}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {!state.isConnected ? (
              // Pre-conversation Setup
              <div className="text-center">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 mb-8">
                  <h2 className="text-3xl font-bold font-serif mb-4">
                    Ready to meet {figure}?
                  </h2>
                  <p className="text-xl text-slate-300 mb-6">
                    You'll be discussing <span className="text-amber-400">{topic}</span> together
                  </p>
                  
                  {figurePrompt && (
                    <div className="bg-slate-700/50 rounded-lg p-4 mb-6 text-left">
                      <h3 className="font-semibold mb-2">About this conversation:</h3>
                      <p className="text-sm text-slate-300">{figurePrompt.description}</p>
                     {figureTopicPrompt && (
                       <div className="mt-3 pt-3 border-t border-slate-600/50">
                         <h4 className="font-medium text-amber-400 mb-1">Conversation Focus:</h4>
                         <p className="text-xs text-slate-400">
                           This conversation will focus specifically on {topic.toLowerCase()} from {figure}'s unique perspective and expertise.
                         </p>
                       </div>
                     )}
                    </div>
                  )}

                  <button
                    onClick={handleStartConversation}
                    disabled={!figureTopicPrompt}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-slate-600 disabled:to-slate-700 text-slate-900 disabled:text-slate-400 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 disabled:scale-100"
                  >
                    Begin Conversation
                  </button>

                  {state.error && (
                    <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <div className="flex items-center space-x-2 text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">{state.error}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Avatar Preview */}
                <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700/50">
                  <div className="w-48 h-48 bg-gradient-to-r from-amber-500/20 to-slate-500/20 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-amber-400/30">
                    <span className="text-6xl">🎭</span>
                  </div>
                  <p className="text-slate-400">AI Avatar will appear here during conversation</p>
                </div>
              </div>
            ) : (
              // Active Conversation
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Video/Avatar Section */}
                <div className="lg:col-span-2">
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 h-96 flex items-center justify-center">
                    <AvatarDisplay
                      avatarUrl={state.avatarUrl}
                      isVideoEnabled={state.isVideoEnabled}
                      agentConnected={state.agentConnected}
                      figureName={figure}
                    />
                  </div>
                </div>

                {/* Controls Section */}
                <div className="space-y-6">
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                    <h3 className="font-semibold mb-4">Conversation Controls</h3>
                    
                    <div className="space-y-4">
                      <button
                        onClick={handleToggleRecording}
                        disabled={!state.agentConnected}
                        className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                          state.isRecording
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {state.isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        <span>{state.isRecording ? 'Mute' : 'Unmute'}</span>
                      </button>

                      <button
                        onClick={handleToggleVideo}
                        className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-medium bg-slate-600 hover:bg-slate-700 text-white transition-colors"
                      >
                        {state.isVideoEnabled ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                        <span>{state.isVideoEnabled ? 'Turn Off Video' : 'Turn On Video'}</span>
                      </button>

                      <button
                        onClick={handleEndConversation}
                        disabled={isEnding}
                        className="w-full py-3 rounded-lg font-medium bg-amber-500 hover:bg-amber-600 disabled:bg-amber-700 text-slate-900 disabled:text-slate-500 transition-colors"
                      >
                        {isEnding ? 'Ending...' : 'End Conversation'}
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                    <h3 className="font-semibold mb-4">Session Info</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Duration:</span>
                        <span className="font-mono">{formatDuration(state.sessionDuration)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Status:</span>
                        <span className={state.isRecording ? 'text-green-400' : 'text-red-400'}>
                          {state.isRecording ? 'Recording' : 'Paused'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Agent:</span>
                        <span className={state.agentConnected ? 'text-green-400' : 'text-yellow-400'}>
                          {state.agentConnected ? 'Connected' : 'Connecting...'}
                        </span>
                      </div>
                    </div>

                    {state.error && (
                      <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <div className="flex items-center space-x-2 text-red-400">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-xs">{state.error}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Instructions for user */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <h4 className="font-medium text-blue-400 mb-2">How to use:</h4>
                    <ul className="text-xs text-blue-300 space-y-1">
                      <li>• Click the Tavus avatar iframe to interact</li>
                      <li>• Use your microphone to speak with {figure}</li>
                      <li>• The conversation will be automatically saved</li>
                      <li>• Click "End Conversation" when finished</li>
                    </ul>
                  </div>

                  {/* Conversation Log */}
                  {conversationMessages.length > 0 && (
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 max-h-48 overflow-y-auto">
                      <h4 className="font-medium text-slate-300 mb-3">Conversation Log</h4>
                      <div className="space-y-2">
                        {conversationMessages.slice(-5).map((message, index) => (
                          <div key={index} className="text-xs">
                            <span className={`font-medium ${message.speaker === 'user' ? 'text-blue-400' : 'text-amber-400'}`}>
                              {message.speaker === 'user' ? 'You' : figure}:
                            </span>
                            <span className="text-slate-300 ml-2">{message.content}</span>
                          </div>
                        ))}
                      </div>
                      {conversationMessages.length > 5 && (
                        <p className="text-xs text-slate-500 mt-2">Showing last 5 messages...</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}