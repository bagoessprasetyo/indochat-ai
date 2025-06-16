import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateAIResponse } from '@/lib/ai-service'
import type { Database } from '@/types/database'

// Initialize Supabase with service role for webhook access
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Verify webhook (GET request)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified')
    return new NextResponse(challenge)
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// Handle incoming messages (POST request)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Process webhook data
    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    
    if (!value?.messages) {
      return NextResponse.json({ status: 'no_messages' })
    }

    const message = value.messages[0]
    const customerPhone = message.from
    const messageText = message.text?.body
    const phoneNumberId = value.metadata?.phone_number_id

    if (!messageText || !customerPhone || !phoneNumberId) {
      return NextResponse.json({ status: 'invalid_message' })
    }

    console.log(`Received message from ${customerPhone}: ${messageText}`)

    // Find chatbot by phone number ID
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select('*')
      .eq('whatsapp_phone_number_id', phoneNumberId)
      .single()

    if (chatbotError || !chatbot) {
      console.error('Chatbot not found for phone number ID:', phoneNumberId)
      return NextResponse.json({ status: 'chatbot_not_found' })
    }

    // Check if auto-reply is enabled
    if (!chatbot.auto_reply_enabled) {
      console.log('Auto-reply disabled for chatbot:', chatbot.id)
      return NextResponse.json({ status: 'auto_reply_disabled' })
    }

    // Check business hours if configured
    if (chatbot.business_hours) {
      const now = new Date()
      const currentHour = now.getHours()
      const businessHours = chatbot.business_hours as any
      
      if (businessHours.enabled) {
        const startHour = parseInt(businessHours.start?.split(':')[0] || '9')
        const endHour = parseInt(businessHours.end?.split(':')[0] || '17')
        
        if (currentHour < startHour || currentHour >= endHour) {
          // Send out-of-hours message
          const outOfHoursMessage = businessHours.outOfHoursMessage || 
            'Terima kasih atas pesan Anda. Kami sedang di luar jam operasional. Kami akan merespons segera pada jam kerja.'
          
          await sendWhatsAppMessage(customerPhone, outOfHoursMessage, phoneNumberId)
          return NextResponse.json({ status: 'out_of_hours' })
        }
      }
    }

    // Check for human handover keywords
    if (chatbot.human_handover_keywords?.length) {
      const lowerMessage = messageText.toLowerCase()
      const hasHandoverKeyword = chatbot.human_handover_keywords.some(
        keyword => lowerMessage.includes(keyword.toLowerCase())
      )
      
      if (hasHandoverKeyword) {
        const handoverMessage = 'Terima kasih, kami akan menghubungkan Anda dengan tim customer service kami.'
        await sendWhatsAppMessage(customerPhone, handoverMessage, phoneNumberId)
        
        // Mark conversation for human handover
        await supabase
          .from('conversations')
          .insert({
            chatbot_id: chatbot.id,
            customer_phone: customerPhone,
            message_type: 'incoming',
            content: messageText,
            requires_human_handover: true,
            created_at: new Date().toISOString()
          })
        
        return NextResponse.json({ status: 'human_handover' })
      }
    }

    // Prepare context for AI
    const businessContext = `
Business: ${chatbot.business_description || 'No description available'}
Personality: ${chatbot.ai_personality || 'Friendly and helpful'}
Business Hours: ${chatbot.business_hours ? JSON.stringify(chatbot.business_hours) : 'Not specified'}
`

    // Generate AI response with knowledge base integration
    const aiResponse = await generateAIResponse(
      messageText,
      businessContext,
      {
        tone: chatbot.ai_personality?.includes('formal') ? 'formal' : 
              chatbot.ai_personality?.includes('casual') ? 'casual' : 'friendly',
        maxTokens: 300,
        temperature: 0.7,
        chatbotId: chatbot.id,
        useKnowledgeBase: true
      }
    )

    // Send response via WhatsApp
    await sendWhatsAppMessage(customerPhone, aiResponse.content, phoneNumberId)

    // Store conversation in database
    await supabase
      .from('conversations')
      .insert([
        {
          chatbot_id: chatbot.id,
          customer_phone: customerPhone,
          message_type: 'incoming',
          content: messageText,
          created_at: new Date().toISOString()
        },
        {
          chatbot_id: chatbot.id,
          customer_phone: customerPhone,
          message_type: 'outgoing',
          content: aiResponse.content,
          ai_generated: true,
          tokens_used: aiResponse.tokensUsed,
          ai_cost: aiResponse.cost,
          metadata: {
            knowledgeUsed: aiResponse.knowledgeUsed,
            knowledgeSource: aiResponse.knowledgeSource
          },
          created_at: new Date().toISOString()
        }
      ])

    return NextResponse.json({ status: 'success' })

  } catch (error) {
    console.error('WhatsApp webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to send WhatsApp message
async function sendWhatsAppMessage(
  to: string,
  message: string,
  phoneNumberId: string
) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          text: { body: message },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('WhatsApp API error:', error)
      throw new Error(`WhatsApp API error: ${response.status}`)
    }

    console.log(`Message sent to ${to}: ${message}`)
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error)
    throw error
  }
}