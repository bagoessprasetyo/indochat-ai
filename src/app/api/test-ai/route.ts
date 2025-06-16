import { createServerClient } from '@supabase/ssr'
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
    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Debug request headers
    console.log('Request debug:', {
      hasCookie: !!request.headers.get('cookie'),
      hasAuth: !!request.headers.get('authorization'),
      userAgent: request.headers.get('user-agent')
    })

    // Get authenticated user - use getUser() for server-side auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('❌ Authentication error:', authError.message)
    }
    
    if (user) {
      console.log('✅ User authenticated via cookies:', { userId: user.id })
    } else {
      console.log('❌ No authenticated user found')
    }

    if (!user) {
      console.log('❌ Authentication failed')
      return NextResponse.json(
        { 
          error: 'User not authenticated. Please log in first.',
          debug: {
            authError: authError?.message,
            hasCookie: !!request.headers.get('cookie')
          }
        },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', { userId: user.id })

    let aiResponse
    let context = ''

    // If chatbotId is provided and not 'test', get chatbot configuration
    if (chatbotId && chatbotId !== 'test') {
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
          context || 'You are a helpful AI assistant for a business in Indonesia. Always respond in Indonesian.',
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
      timestamp: new Date().toISOString(),
      debug: {
        userId: user.id
      }
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