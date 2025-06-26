import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AgentRequest {
  room: string
  figure: string
  topic: string
  prompt: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { room, figure, topic, prompt }: AgentRequest = await req.json()

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get figure and topic specific prompts from database
    const { data: figureData, error: figureError } = await supabaseClient
      .from('figure_prompts')
      .select('*')
      .eq('name', figure)
      .single()

    if (figureError) {
      throw new Error(`Figure not found: ${figureError.message}`)
    }

    const { data: topicData, error: topicError } = await supabaseClient
      .from('figure_topic_prompts')
      .select('*')
      .eq('figure_name', figure)
      .eq('topic', topic)
      .single()

    if (topicError) {
      throw new Error(`Topic prompt not found: ${topicError.message}`)
    }

    // Construct the complete agent prompt
    const systemPrompt = `
You are ${figure}, the historical figure. ${figureData.description || ''}

CONVERSATION CONTEXT:
- Topic: ${topic}
- Specific Instructions: ${topicData.prompt}

PERSONALITY AND BEHAVIOR:
- Speak as ${figure} would have spoken, using language and references appropriate to your era
- Draw from your actual life experiences, achievements, and historical context
- Stay in character throughout the conversation
- Be engaging, educational, and authentic to your historical persona
- If asked about events after your death, acknowledge your historical limitations
- Focus the conversation on ${topic} as requested by the user

CONVERSATION GUIDELINES:
- Keep responses conversational and engaging (2-3 sentences typically)
- Ask follow-up questions to maintain dialogue
- Share personal anecdotes and experiences when relevant
- Maintain historical accuracy while being accessible to modern audiences
- Express curiosity about the user's perspective and modern developments related to ${topic}

Remember: You are having a real-time voice conversation, so keep responses natural and conversational.
`

    // In a real implementation, you would:
    // 1. Connect to LiveKit room
    // 2. Initialize the AI agent with the system prompt
    // 3. Set up STT (Speech-to-Text) pipeline
    // 4. Configure LLM with the system prompt
    // 5. Set up TTS (Text-to-Speech) pipeline
    // 6. Handle real-time audio streaming

    // For now, return the configuration that would be used
    const agentConfig = {
      room,
      figure,
      topic,
      systemPrompt,
      voiceSettings: {
        // Configure voice to match historical figure
        voice: getVoiceForFigure(figure),
        speed: 1.0,
        pitch: 1.0,
      },
      llmSettings: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 150, // Keep responses concise for voice
      },
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Agent configured successfully',
        config: agentConfig 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error configuring agent:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

function getVoiceForFigure(figure: string): string {
  // Map historical figures to appropriate voice characteristics
  const voiceMap: Record<string, string> = {
    'Albert Einstein': 'male-elderly-german-accent',
    'Cleopatra': 'female-regal-mediterranean',
    'Leonardo da Vinci': 'male-renaissance-italian',
    'Marie Curie': 'female-french-accent',
    'William Shakespeare': 'male-elizabethan-english',
    'Napoleon Bonaparte': 'male-french-commanding',
    'Socrates': 'male-ancient-greek-wise',
    'Nikola Tesla': 'male-serbian-inventor',
    'Maya Angelou': 'female-african-american-warm',
    'Winston Churchill': 'male-british-authoritative',
    'Benjamin Franklin': 'male-colonial-american',
    'Cleopatra VII': 'female-ancient-egyptian-royal',
    'Joan of Arc': 'female-french-medieval-determined',
    'Mahatma Gandhi': 'male-indian-gentle-wise',
  }

  return voiceMap[figure] || 'male-neutral'
}