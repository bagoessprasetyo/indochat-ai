'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Send, MessageSquare, AlertCircle } from 'lucide-react'

export default function QuickWhatsAppTest() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [message, setMessage] = useState('🎉 Hello! This is a test message from your Twilio WhatsApp chatbot. If you received this, your integration is working perfectly!')
  const [isSending, setIsSending] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)

  const sendTestMessage = async () => {
    if (!phoneNumber || !message) {
      toast.error('Please enter both phone number and message')
      return
    }

    setIsSending(true)
    setLastResult(null)

    try {
      const response = await fetch('/api/whatsapp/test-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phoneNumber,
          message: message
        }),
      })

      const data = await response.json()
      setLastResult({ success: response.ok, data, status: response.status })

      if (response.ok) {
        toast.success('✅ Message sent successfully!')
        console.log('✅ Send result:', data)
      } else {
        toast.error(`❌ Failed to send: ${data.error}`)
        console.error('❌ Send error:', data)
      }
    } catch (error) {
      const errorResult = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      setLastResult(errorResult)
      toast.error('❌ Network error sending message')
      console.error('❌ Network error:', error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <div className="text-center">
          <h1 className="text-3xl font-bold flex items-center justify-center">
            <MessageSquare className="mr-3" />
            Quick WhatsApp Test
          </h1>
          <p className="text-muted-foreground mt-2">
            Send a test message to verify your Twilio WhatsApp integration
          </p>
        </div>

        {/* Important Notice */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Make sure you've joined the Twilio WhatsApp sandbox by sending 
            "join [code]" to +1 415 523 8886 first. Only joined numbers can receive messages.
          </AlertDescription>
        </Alert>

        {/* Test Form */}
        <Card>
          <CardHeader>
            <CardTitle>Send Test Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="phone">Your WhatsApp Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Include country code (e.g., +1 for US, +62 for Indonesia)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Test Message</Label>
              <textarea
                id="message"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <Button
              onClick={sendTestMessage}
              disabled={isSending || !phoneNumber || !message}
              className="w-full"
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending Message...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Message
                </>
              )}
            </Button>

          </CardContent>
        </Card>

        {/* Result Display */}
        {lastResult && (
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center ${lastResult.success ? 'text-green-600' : 'text-red-600'}`}>
                {lastResult.success ? '✅ Success!' : '❌ Failed'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                
                {lastResult.success ? (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-green-800 font-medium">Message sent successfully!</p>
                    <p className="text-green-700 text-sm mt-1">
                      Check your WhatsApp - you should receive the test message shortly.
                    </p>
                    {lastResult.data?.messageId && (
                      <p className="text-green-600 text-xs mt-2 font-mono">
                        Message ID: {lastResult.data.messageId}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-red-800 font-medium">Failed to send message</p>
                    <p className="text-red-700 text-sm mt-1">
                      {lastResult.data?.error || lastResult.error || 'Unknown error occurred'}
                    </p>
                  </div>
                )}

                {/* Debug Info */}
                <details className="text-xs">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                    Debug Info (click to expand)
                  </summary>
                  <pre className="bg-gray-100 p-2 rounded mt-2 overflow-auto">
                    {JSON.stringify(lastResult, null, 2)}
                  </pre>
                </details>

              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <p><strong>If the test message works:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Set up webhook URL in Twilio Console</li>
                <li>Test receiving messages (AI auto-replies)</li>
                <li>Connect to your chatbots</li>
              </ul>
              
              <p className="pt-2"><strong>If it doesn't work:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Check you've joined the WhatsApp sandbox</li>
                <li>Verify your phone number format (+country code)</li>
                <li>Check Twilio Console for error logs</li>
                <li>Verify your credentials are correct</li>
              </ul>
            </div>
            
            <div className="flex space-x-2 pt-3">
              <Button asChild variant="outline">
                <a href="/test-twilio">Check Credentials</a>
              </Button>
              <Button asChild>
                <a href="/dashboard/whatsapp">WhatsApp Management</a>
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}