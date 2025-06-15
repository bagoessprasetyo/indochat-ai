import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { generateAIResponse, generateProductRecommendation } from '@/lib/ai-service'
import type { Database } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const { message, chatbotId, testType = 'basic' } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Initialize Supabase client for API route
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get user session
    const { data: { user }, error: sessionError } = await supabase.auth.getUser()
    console.log('dataaa',user);
    if (sessionError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let aiResponse
    let context = ''

    // If chatbotId is provided, get chatbot configuration
    if (chatbotId) {
      const { data: chatbot, error: chatbotError } = await supabase
        .from('chatbots')
        .select('*')
        .eq('id', chatbotId)
        .eq('user_id', user.id) // Ensure user owns the chatbot
        .single()

      if (chatbotError || !chatbot) {
        return NextResponse.json(
          { error: 'Chatbot not found or access denied' },
          { status: 404 }
        )
      }

      context = `
Business: ${chatbot.business_description || 'No description available'}
Personality: ${chatbot.ai_personality || 'Friendly and helpful'}
Business Hours: ${chatbot.business_hours ? JSON.stringify(chatbot.business_hours) : 'Not specified'}
`
    }

    // Handle different test types
    switch (testType) {
      case 'product_recommendation':
        // Example products for testing
        const sampleProducts = [
          { name: 'Kopi Arabica Premium', description: 'Kopi arabica berkualitas tinggi dari Aceh', price: 85000 },
          { name: 'Kopi Robusta Original', description: 'Kopi robusta asli dengan rasa yang kuat', price: 65000 },
          { name: 'Kopi Luwak Special', description: 'Kopi luwak premium dengan cita rasa unik', price: 250000 },
        ]
        
        aiResponse = await generateProductRecommendation(
          message,
          sampleProducts,
          {
            tone: 'friendly',
            maxTokens: 300,
            temperature: 0.7
          }
        )
        break

      case 'customer_service':
        const customerServiceContext = context + `
You are a customer service representative. Help the customer with their inquiry professionally and helpfully.`
        
        aiResponse = await generateAIResponse(
          message,
          customerServiceContext,
          {
            tone: 'formal',
            maxTokens: 300,
            temperature: 0.6
          }
        )
        break

      case 'sales':
        const salesContext = context + `
You are a sales assistant. Help the customer understand products and guide them towards making a purchase.`
        
        aiResponse = await generateAIResponse(
          message,
          salesContext,
          {
            tone: 'friendly',
            maxTokens: 300,
            temperature: 0.8
          }
        )
        break

      default: // basic
        aiResponse = await generateAIResponse(
          message,
          context,
          {
            tone: 'friendly',
            maxTokens: 300,
            temperature: 0.7
          }
        )
        break
    }

    return NextResponse.json({
      response: aiResponse.content,
      tokensUsed: aiResponse.tokensUsed,
      cost: aiResponse.cost,
      model: aiResponse.model,
      testType,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Test AI error:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured. Please check your environment variables.' },
          { status: 500 }
        )
      }
      
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'OpenAI API quota exceeded. Please check your billing.' },
          { status: 429 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}