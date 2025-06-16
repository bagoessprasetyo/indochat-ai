// src/app/api/whatsapp/send/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER

export async function POST(request: NextRequest) {
  try {
    const { to, message, chatbotId } = await request.json()

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      )
    }

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
      return NextResponse.json(
        { error: 'Twilio WhatsApp API not configured. Please check environment variables.' },
        { status: 500 }
      )
    }

    // Authenticate user
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Validate chatbot ownership if chatbotId is provided
    if (chatbotId) {
      const { data: chatbot, error: chatbotError } = await supabase
        .from('chatbots')
        .select('*')
        .eq('id', chatbotId)
        .eq('user_id', session.user.id)
        .single()

      if (chatbotError || !chatbot) {
        return NextResponse.json(
          { error: 'Chatbot not found or access denied' },
          { status: 404 }
        )
      }
    }

    // Ensure phone number is in correct format
    const phoneNumber = to.startsWith('+') ? to : `+${to}`

    // Send message via Twilio WhatsApp API
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
          To: `whatsapp:${phoneNumber}`,
          Body: message
        })
      }
    )

    const result = await response.json()

    if (!response.ok) {
      console.error('Twilio API error:', result)
      return NextResponse.json(
        { 
          error: `Twilio API error: ${result.message || result.error_message || 'Unknown error'}`,
          details: result
        },
        { status: response.status }
      )
    }

    console.log('✅ Twilio WhatsApp message sent successfully:', result.sid)

    // Store message in database if chatbotId provided
    if (chatbotId) {
      await supabase
        .from('conversations')
        .insert({
          chatbot_id: chatbotId,
          customer_phone: phoneNumber,
          message_type: 'outgoing',
          content: message,
          ai_generated: false,
          message_sid: result.sid,
          created_at: new Date().toISOString()
        })
    }

    return NextResponse.json({
      success: true,
      messageId: result.sid,
      status: result.status,
      twilioResponse: result
    })

  } catch (error) {
    console.error('❌ Error sending Twilio WhatsApp message:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  const isConfigured = !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_NUMBER)
  
  return NextResponse.json({
    configured: isConfigured,
    provider: 'twilio',
    status: isConfigured ? 'ready' : 'not_configured',
    missing: {
      accountSid: !TWILIO_ACCOUNT_SID,
      authToken: !TWILIO_AUTH_TOKEN,
      whatsappNumber: !TWILIO_WHATSAPP_NUMBER
    },
    whatsappNumber: TWILIO_WHATSAPP_NUMBER || null
  })
}