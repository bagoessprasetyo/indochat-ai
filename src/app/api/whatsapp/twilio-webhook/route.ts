// src/app/api/whatsapp/twilio-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { generateAIResponse } from '@/lib/ai-service'
import type { Database } from '@/types/database'

// Twilio configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER

// Handle incoming WhatsApp messages from Twilio
export async function POST(request: NextRequest) {
  try {
    // Parse form data from Twilio webhook
    const formData = await request.formData()
    const webhookData = Object.fromEntries(formData)
    
    console.log('📨 Twilio WhatsApp webhook received:', webhookData)

    // Extract message details
    const messageBody = webhookData.Body as string
    const fromNumber = webhookData.From as string // Format: whatsapp:+1234567890
    const toNumber = webhookData.To as string     // Format: whatsapp:+1234567890
    const messageSid = webhookData.MessageSid as string
    const profileName = webhookData.ProfileName as string

    // Clean phone numbers (remove 'whatsapp:' prefix)
    const customerPhone = fromNumber?.replace('whatsapp:', '')
    const businessPhone = toNumber?.replace('whatsapp:', '')

    if (!messageBody || !customerPhone || !businessPhone) {
      console.log('ℹ️ Incomplete webhook data, skipping')
      return new NextResponse('', { status: 200 })
    }

    console.log('🔄 Processing message:', {
      from: customerPhone,
      to: businessPhone,
      message: messageBody.substring(0, 100),
      profileName
    })

    await processWhatsAppMessage({
      messageBody,
      customerPhone,
      businessPhone,
      messageSid,
      profileName: profileName || 'Unknown'
    })

    // Respond with empty 200 to acknowledge receipt
    return new NextResponse('', { status: 200 })

  } catch (error) {
    console.error('❌ Twilio webhook error:', error)
    return new NextResponse('', { status: 200 }) // Always return 200 to Twilio
  }
}

async function processWhatsAppMessage({
  messageBody,
  customerPhone,
  businessPhone,
  messageSid,
  profileName
}: {
  messageBody: string
  customerPhone: string
  businessPhone: string
  messageSid: string
  profileName: string
}) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Find matching chatbot for this business phone number
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select('*')
      .eq('whatsapp_number', businessPhone)
      .eq('is_active', true)
      .single()

    if (chatbotError || !chatbot) {
      console.log('❌ No active chatbot found for number:', businessPhone)
      return
    }

    console.log('✅ Found chatbot:', chatbot.name)

    // Store incoming message
    await storeConversation(supabase, {
      chatbot_id: chatbot.id,
      customer_phone: customerPhone,
      customer_name: profileName,
      message_type: 'incoming',
      content: messageBody,
      ai_generated: false,
      message_sid: messageSid
    })

    // Check if auto-reply is enabled
    if (!chatbot.auto_reply_enabled) {
      console.log('ℹ️ Auto-reply disabled for chatbot:', chatbot.name)
      return
    }

    // Check business hours
    if (chatbot.business_hours && !isWithinBusinessHours(chatbot.business_hours)) {
      console.log('ℹ️ Outside business hours')
      
      const outOfHoursMessage = (chatbot.business_hours as { out_of_hours_message?: string })?.out_of_hours_message ||
        'Terima kasih atas pesan Anda. Kami sedang tidak dalam jam operasional. Kami akan membalas pesan Anda sesegera mungkin.'
      
      await sendTwilioWhatsAppMessage(customerPhone, outOfHoursMessage)
      await storeConversation(supabase, {
        chatbot_id: chatbot.id,
        customer_phone: customerPhone,
        customer_name: profileName,
        message_type: 'outgoing',
        content: outOfHoursMessage,
        ai_generated: false
      })
      return
    }

    // Check for human handover keywords
    if (Array.isArray(chatbot.human_handover_keywords) && chatbot.human_handover_keywords.length > 0) {
      const lowerMessage = messageBody.toLowerCase()
      const hasHandoverKeyword = chatbot.human_handover_keywords.some(keyword => 
        lowerMessage.includes(keyword.toLowerCase())
      )

      if (hasHandoverKeyword) {
        console.log('🤝 Human handover keyword detected')
        
        const handoverMessage = 'Terima kasih, permintaan Anda sedang kami teruskan ke tim customer service kami. Mohon tunggu sebentar.'
        await sendTwilioWhatsAppMessage(customerPhone, handoverMessage)
        await storeConversation(supabase, {
          chatbot_id: chatbot.id,
          customer_phone: customerPhone,
          customer_name: profileName,
          message_type: 'outgoing',
          content: handoverMessage,
          ai_generated: false
        })
        return
      }
    }

    // Generate AI response
    const businessContext = `
Business: ${chatbot.business_description || 'No description available'}
Personality: ${chatbot.ai_personality || 'Friendly and helpful'}
Customer Name: ${profileName}
Business Hours: ${chatbot.business_hours ? JSON.stringify(chatbot.business_hours) : 'Not specified'}
`

    console.log('🤖 Generating AI response...')
    const aiResponse = await generateAIResponse(
      messageBody,
      businessContext,
      {
        tone: chatbot.ai_personality?.includes('formal') ? 'formal' : 
              chatbot.ai_personality?.includes('casual') ? 'casual' : 'friendly',
        maxTokens: 300,
        temperature: 0.7
      }
    )

    console.log('✅ AI response generated:', aiResponse.content.substring(0, 100))

    // Send response via Twilio WhatsApp
    await sendTwilioWhatsAppMessage(customerPhone, aiResponse.content)

    // Store AI response
    await storeConversation(supabase, {
      chatbot_id: chatbot.id,
      customer_phone: customerPhone,
      customer_name: profileName,
      message_type: 'outgoing',
      content: aiResponse.content,
      ai_generated: true,
      tokens_used: aiResponse.tokensUsed,
      ai_cost: aiResponse.cost
    })

    console.log('✅ Message processed successfully')

  } catch (error) {
    console.error('❌ Error processing WhatsApp message:', error)
  }
}

async function sendTwilioWhatsAppMessage(to: string, message: string) {
  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
      throw new Error('Twilio credentials not configured')
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
          To: `whatsapp:${to}`,
          Body: message
        })
      }
    )

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(`Twilio API error: ${JSON.stringify(result)}`)
    }

    console.log('✅ Twilio WhatsApp message sent successfully:', result.sid)
    return result

  } catch (error) {
    console.error('❌ Error sending Twilio WhatsApp message:', error)
    throw error
  }
}

async function storeConversation(
  supabase: any,
  data: {
    chatbot_id: string
    customer_phone: string
    customer_name?: string
    message_type: 'incoming' | 'outgoing'
    content: string
    ai_generated: boolean
    tokens_used?: number
    ai_cost?: number
    message_sid?: string
  }
) {
  try {
    const { error } = await supabase
      .from('conversations')
      .insert({
        ...data,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('❌ Error storing conversation:', error)
    } else {
      console.log('✅ Conversation stored')
    }
  } catch (error) {
    console.error('❌ Error storing conversation:', error)
  }
}

function isWithinBusinessHours(businessHours: any): boolean {
  if (!businessHours || !businessHours.enabled) {
    return true
  }

  const now = new Date()
  const currentDay = now.getDay()
  const currentTime = now.getHours() * 100 + now.getMinutes()

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const todayHours = businessHours[dayNames[currentDay]]

  if (!todayHours || !todayHours.open) {
    return false
  }

  const openTime = parseInt(todayHours.start.replace(':', ''))
  const closeTime = parseInt(todayHours.end.replace(':', ''))

  return currentTime >= openTime && currentTime <= closeTime
}