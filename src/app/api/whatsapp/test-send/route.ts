// src/app/api/whatsapp/test-send/route.ts
import { NextRequest, NextResponse } from 'next/server'

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json()

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      )
    }

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
      return NextResponse.json(
        { 
          error: 'Twilio WhatsApp API not configured',
          missing: {
            accountSid: !TWILIO_ACCOUNT_SID,
            authToken: !TWILIO_AUTH_TOKEN,
            whatsappNumber: !TWILIO_WHATSAPP_NUMBER
          }
        },
        { status: 500 }
      )
    }

    // Ensure phone number is in correct format
    const phoneNumber = to.startsWith('+') ? to : `+${to}`

    console.log('🚀 Sending test WhatsApp message:', {
      from: TWILIO_WHATSAPP_NUMBER,
      to: phoneNumber,
      messageLength: message.length
    })

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
      console.error('❌ Twilio API error:', result)
      return NextResponse.json(
        { 
          error: `Twilio API error: ${result.message || result.error_message || 'Unknown error'}`,
          twilioError: result,
          requestDetails: {
            from: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:${phoneNumber}`,
            status: response.status
          }
        },
        { status: response.status }
      )
    }

    console.log('✅ Twilio WhatsApp message sent successfully:', result.sid)

    return NextResponse.json({
      success: true,
      messageId: result.sid,
      status: result.status,
      to: result.to,
      from: result.from,
      dateCreated: result.date_created,
      twilioResponse: result
    })

  } catch (error) {
    console.error('❌ Error sending Twilio WhatsApp message:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
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
    testEndpoint: true,
    authRequired: false,
    missing: {
      accountSid: !TWILIO_ACCOUNT_SID,
      authToken: !TWILIO_AUTH_TOKEN,
      whatsappNumber: !TWILIO_WHATSAPP_NUMBER
    },
    whatsappNumber: TWILIO_WHATSAPP_NUMBER || null
  })
}