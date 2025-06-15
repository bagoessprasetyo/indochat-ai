import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { generateAIResponse } from '@/lib/ai-service'
import type { Database } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const { message, chatbotId, customerPhone } = await request.json()

    if (!message || !chatbotId) {
      return NextResponse.json(
        { error: 'Message and chatbot ID are required' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get chatbot configuration
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select('*')
      .eq('id', chatbotId)
      .single()

    if (chatbotError || !chatbot) {
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404 }
      )
    }

    // Prepare context for AI
    const businessContext = `
Business: ${chatbot.business_description || 'No description available'}
Personality: ${chatbot.ai_personality || 'Friendly and helpful'}
Business Hours: ${chatbot.business_hours ? JSON.stringify(chatbot.business_hours) : 'Not specified'}
`

    // Generate AI response
    const aiResponse = await generateAIResponse(
      message,
      businessContext,
      {
        tone: chatbot.ai_personality?.includes('formal') ? 'formal' : 
              chatbot.ai_personality?.includes('casual') ? 'casual' : 'friendly',
        maxTokens: 300,
        temperature: 0.7
      }
    )

    // Store conversation in database
    if (customerPhone) {
      const { error: conversationError } = await supabase
        .from('conversations')
        .insert({
          chatbot_id: chatbotId,
          customer_phone: customerPhone,
          message_type: 'incoming',
          content: message,
          created_at: new Date().toISOString()
        })

      if (!conversationError) {
        // Store AI response
        await supabase
          .from('conversations')
          .insert({
            chatbot_id: chatbotId,
            customer_phone: customerPhone,
            message_type: 'outgoing',
            content: aiResponse.content,
            ai_generated: true,
            tokens_used: aiResponse.tokensUsed,
            ai_cost: aiResponse.cost,
            created_at: new Date().toISOString()
          })
      }
    }

    return NextResponse.json({
      response: aiResponse.content,
      tokensUsed: aiResponse.tokensUsed,
      cost: aiResponse.cost,
      model: aiResponse.model
    })

  } catch (error) {
    console.error('Chatbot message error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}