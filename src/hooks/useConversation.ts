import { useState, useEffect, useCallback } from 'react'
import { TavusService, TavusConversation } from '../lib/tavus'

export interface ConversationState {
  isConnected: boolean
  isRecording: boolean
  isVideoEnabled: boolean
  sessionDuration: number
  agentConnected: boolean
  avatarUrl?: string
  error?: string
  conversationId?: string
}

export interface ConversationConfig {
  figure: string
  topic: string
  prompt: string
  userId: string
}

export interface ConversationMessage {
  timestamp: number
  speaker: 'user' | 'agent'
  content: string
}

export function useConversation() {
  const [state, setState] = useState<ConversationState>({
    isConnected: false,
    isRecording: false,
    isVideoEnabled: true,
    sessionDuration: 0,
    agentConnected: false,
  })

  const [tavusService] = useState(() => new TavusService())
  const [tavusConversation, setTavusConversation] = useState<TavusConversation | null>(null)
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([])
  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null)

  // Session duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (state.isConnected && state.isRecording) {
      interval = setInterval(() => {
        setState(prev => ({ ...prev, sessionDuration: prev.sessionDuration + 1 }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [state.isConnected, state.isRecording])

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      
      recognition.onresult = (event) => {
        const results = Array.from(event.results)
        const transcript = results
          .map(result => result[0].transcript)
          .join('')
        
        // Only add final results to avoid duplicates
        if (event.results[event.results.length - 1].isFinal && transcript.trim()) {
          addConversationMessage('user', transcript.trim())
        }
      }
      
      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error)
      }
      
      setSpeechRecognition(recognition)
    }
  }, [])

  const addConversationMessage = useCallback((speaker: 'user' | 'agent', content: string) => {
    setConversationMessages(prev => [...prev, {
      timestamp: Date.now(),
      speaker,
      content
    }])
  }, [])

  const startConversation = useCallback(async (config: ConversationConfig) => {
    try {
      setState(prev => ({ ...prev, error: undefined }))
      setConversationMessages([])

      // Create Tavus conversation for avatar
      const avatarId = tavusService.getAvatarForFigure(config.figure)
      const tavusConv = await tavusService.createConversation({
        replica_id: avatarId,
        conversation_name: `${config.figure} - ${config.topic}`,
        custom_greeting: `Hello! I'm ${config.figure}. I'm excited to discuss ${config.topic} with you today.`,
      })

      setTavusConversation(tavusConv)
      setState(prev => ({ 
        ...prev, 
        avatarUrl: tavusConv.conversation_url,
        isConnected: true,
        sessionDuration: 0,
        conversationId: tavusConv.conversation_id
      }))

      // Simulate agent connection after a short delay
      setTimeout(() => {
        setState(prev => ({ 
          ...prev, 
          agentConnected: true,
          isRecording: true // Auto-start recording when agent connects
        }))
        
        // Add initial greeting to conversation log
        addConversationMessage('agent', `Hello! I'm ${config.figure}. I'm excited to discuss ${config.topic} with you today.`)
      }, 2000)

    } catch (error) {
      console.error('Error starting conversation:', error)
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to start conversation' 
      }))
    }
  }, [tavusService, addConversationMessage])

  const toggleRecording = useCallback(async () => {
    try {
      const newRecordingState = !state.isRecording
      
      if (newRecordingState && speechRecognition) {
        // Start speech recognition when recording starts
        speechRecognition.start()
      } else if (!newRecordingState && speechRecognition) {
        // Stop speech recognition when recording stops
        speechRecognition.stop()
      }
      
      setState(prev => ({ ...prev, isRecording: newRecordingState }))
    } catch (error) {
      console.error('Error toggling recording:', error)
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to toggle recording' 
      }))
    }
  }, [state.isRecording, speechRecognition])

  const toggleVideo = useCallback(() => {
    setState(prev => ({ ...prev, isVideoEnabled: !prev.isVideoEnabled }))
  }, [])

  const endConversation = useCallback(async () => {
    try {
      // Stop speech recognition
      if (speechRecognition) {
        speechRecognition.stop()
      }
      
      // End Tavus conversation
      if (tavusConversation) {
        await tavusService.endConversation(tavusConversation.conversation_id)
        setTavusConversation(null)
      }

      setState({
        isConnected: false,
        isRecording: false,
        isVideoEnabled: true,
        sessionDuration: 0,
        agentConnected: false,
        avatarUrl: undefined,
        error: undefined,
        conversationId: undefined,
      })

    } catch (error) {
      console.error('Error ending conversation:', error)
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to end conversation' 
      }))
    }
  }, [tavusService, tavusConversation, speechRecognition])

  const generateConversationSummary = useCallback(async (figure: string, topic: string) => {
    // Generate summary based on captured conversation messages
    if (conversationMessages.length > 0) {
      return generateSummaryFromMessages(conversationMessages, figure, topic, state.sessionDuration)
    }
    
    // Fallback to Tavus API if no messages captured
    if (tavusConversation) {
      try {
        return await tavusService.generateConversationSummary(
          tavusConversation.conversation_id,
          figure,
          topic,
          state.sessionDuration
        )
      } catch (error) {
        console.warn('Tavus summary failed, using fallback')
      }
    }
    
    return null
  }, [conversationMessages, tavusService, tavusConversation, state.sessionDuration])

  const generateSummaryFromMessages = (messages: ConversationMessage[], figure: string, topic: string, duration: number): string => {
    const conversationLength = Math.floor(duration / 60)
    return `Had a ${conversationLength} minute conversation with ${figure} about ${topic}.`
  }

  return {
    state,
    tavusConversation,
    conversationMessages,
    startConversation,
    toggleRecording,
    toggleVideo,
    endConversation,
    generateConversationSummary,
  }
}