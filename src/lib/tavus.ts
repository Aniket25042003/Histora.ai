const TAVUS_API_KEY = import.meta.env.VITE_TAVUS_API_KEY || ''
const TAVUS_API_BASE = 'https://tavusapi.com'

export interface TavusAvatar {
  avatar_id: string
  avatar_name: string
  avatar_url?: string
}

export interface TavusConversation {
  conversation_id: string
  conversation_url: string
  status: 'active' | 'ended' | 'error'
}

export interface CreateConversationRequest {
  replica_id: string
  persona_id?: string
  callback_url?: string
  conversation_name?: string
  custom_greeting?: string
  max_call_duration?: number
}

export class TavusService {
  private apiKey: string

  constructor() {
    this.apiKey = TAVUS_API_KEY
    if (!this.apiKey) {
      console.warn('Tavus API key not found. Avatar features will be disabled.')
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${TAVUS_API_BASE}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Tavus API error: ${response.status} - ${error}`)
    }

    // Handle responses that don't return JSON (like 204 No Content)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null
    }

    // Only parse JSON if there's content to parse
    return response.json()
  }

  async getAvailableAvatars(): Promise<TavusAvatar[]> {
    try {
      const response = await this.makeRequest('/v2/avatars')
      return response.data || []
    } catch (error) {
      console.error('Error fetching Tavus avatars:', error)
      return []
    }
  }

  async createConversation(request: CreateConversationRequest): Promise<TavusConversation> {
    try {
      // First, try to end any existing conversations to avoid concurrent limit issues
      await this.endAllActiveConversations()
      
      const response = await this.makeRequest('/v2/conversations', {
        method: 'POST',
        body: JSON.stringify(request),
      })
      
      return {
        conversation_id: response.conversation_id,
        conversation_url: response.conversation_url,
        status: response.status || 'active',
      }
    } catch (error) {
      console.error('Error creating Tavus conversation:', error)
      throw error
    }
  }

  async getAllConversations(): Promise<any[]> {
    try {
      const response = await this.makeRequest('/v2/conversations')
      return response.data || []
    } catch (error) {
      console.error('Error fetching conversations:', error)
      return []
    }
  }

  async endAllActiveConversations(): Promise<void> {
    try {
      const conversations = await this.getAllConversations()
      const activeConversations = conversations.filter(conv => 
        conv.status === 'active' || conv.status === 'starting'
      )
      
      // End all active conversations
      await Promise.all(
        activeConversations.map(conv => 
          this.endConversation(conv.conversation_id).catch(err => 
            console.warn(`Failed to end conversation ${conv.conversation_id}:`, err)
          )
        )
      )
      
      if (activeConversations.length > 0) {
        console.log(`Ended ${activeConversations.length} active conversations`)
      }
    } catch (error) {
      console.warn('Error ending active conversations:', error)
      // Don't throw here - we want to continue with creating new conversation
    }
  }

  async endConversation(conversationId: string): Promise<void> {
    try {
      await this.makeRequest(`/v2/conversations/${conversationId}`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.error('Error ending Tavus conversation:', error)
      throw error
    }
  }

  async getConversationStatus(conversationId: string): Promise<TavusConversation> {
    try {
      const response = await this.makeRequest(`/v2/conversations/${conversationId}`)
      return {
        conversation_id: response.conversation_id,
        conversation_url: response.conversation_url,
        status: response.status,
      }
    } catch (error) {
      console.error('Error getting conversation status:', error)
      throw error
    }
  }

  async getConversationTranscript(conversationId: string): Promise<string | null> {
    try {
      // Try to get the conversation transcript from Tavus
      const response = await this.makeRequest(`/v2/conversations/${conversationId}/transcript`)
      
      if (response && response.transcript) {
        return response.transcript
      }
      
      // If no transcript field, try to get conversation details
      const details = await this.makeRequest(`/v2/conversations/${conversationId}`)
      if (details && details.transcript) {
        return details.transcript
      }
      
      return null
    } catch (error) {
      console.warn('Could not fetch conversation transcript:', error)
      return null
    }
  }

  async generateConversationSummary(conversationId: string, figure: string, topic: string, duration: number): Promise<string> {
    try {
      // First, try to get the actual transcript
      const transcript = await this.getConversationTranscript(conversationId)
      
      if (transcript && transcript.length > 50) {
        // If we have a substantial transcript, create a summary based on it
        return this.createSummaryFromTranscript(transcript, figure, topic, duration)
      }
      
      // If no transcript available, create a personalized summary based on the session
      return this.createPersonalizedSummary(figure, topic, duration)
      
    } catch (error) {
      console.warn('Error generating conversation summary:', error)
      return this.createPersonalizedSummary(figure, topic, duration)
    }
  }

  private createSummaryFromTranscript(transcript: string, figure: string, topic: string, duration: number): string {
    const conversationLength = Math.floor(duration / 60)
    return `Had a ${conversationLength} minute conversation with ${figure} about ${topic}.`
  }

  private createPersonalizedSummary(figure: string, topic: string, duration: number): string {
    const conversationLength = Math.floor(duration / 60)
    return `Had a ${conversationLength} minute conversation with ${figure} about ${topic}.`
  }

  // Helper method to get avatar for historical figure
  getAvatarForFigure(figureName: string): string {
    // Map specific figures to their replica IDs
    const figureReplicaMap: Record<string, string> = {
      'Albert Einstein': 'r6c7e7156930',
      'Mahatma Gandhi': 'r9f04e5ba2d4',
    }

    // Check if we have a specific replica ID for this figure
    if (figureReplicaMap[figureName]) {
      return figureReplicaMap[figureName]
    }

    // Fall back to default replica ID for other figures
    const defaultReplicaId = import.meta.env.VITE_TAVUS_DEFAULT_REPLICA_ID || ''

    if (!defaultReplicaId) {
      throw new Error('Tavus replica ID not configured. Please set VITE_TAVUS_DEFAULT_REPLICA_ID in your environment variables.')
    }

    return defaultReplicaId
  }
}