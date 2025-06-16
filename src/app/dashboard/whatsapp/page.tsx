'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { useRequireAuth } from '@/contexts/auth-context'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  MessageSquare, 
  Settings, 
  Send,
  ExternalLink,
  Copy,
  Phone
} from 'lucide-react'

interface TwilioStatus {
  configured: boolean
  provider: string
  status: string
  missing?: {
    accountSid: boolean
    authToken: boolean
    whatsappNumber: boolean
  }
  whatsappNumber?: string
}

export default function TwilioWhatsAppManagementPage() {
  const { user } = useRequireAuth()
  const [webhookUrl, setWebhookUrl] = useState('')
  const [testPhone, setTestPhone] = useState('')
  const [testMessage, setTestMessage] = useState('Hello! This is a test message from your WhatsApp chatbot.')
  const [isTestingSend, setIsTestingSend] = useState(false)
  const [twilioStatus, setTwilioStatus] = useState<TwilioStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set webhook URL based on current domain
    const baseUrl = window.location.origin
    setWebhookUrl(`${baseUrl}/api/whatsapp/twilio-webhook`)
    
    // Check Twilio status
    checkTwilioStatus()
  }, [])

  const checkTwilioStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/send')
      const data = await response.json()
      setTwilioStatus(data)
    } catch (error) {
      console.error('Error checking Twilio status:', error)
      setTwilioStatus({
        configured: false,
        provider: 'twilio',
        status: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const testWebhook = async () => {
    try {
      const response = await fetch('/api/whatsapp/twilio-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: 'whatsapp:+1234567890',
          To: `whatsapp:${twilioStatus?.whatsappNumber || '+14155238886'}`,
          Body: 'Test webhook message',
          MessageSid: 'test-sid-123'
        })
      })
      
      if (response.ok) {
        toast.success('Webhook endpoint is working correctly!')
      } else {
        toast.error('Webhook endpoint returned an error')
      }
    } catch (error) {
      toast.error('Could not reach webhook endpoint')
    }
  }

  const testSendMessage = async () => {
    if (!testPhone || !testMessage) {
      toast.error('Please enter both phone number and message')
      return
    }

    setIsTestingSend(true)
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: testPhone,
          message: testMessage
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('✅ Test message sent successfully!')
        console.log('Message sent:', data)
      } else {
        toast.error(`❌ Failed to send: ${data.error}`)
        console.error('Send error:', data)
      }
    } catch (error) {
      toast.error('❌ Error sending test message')
      console.error('Send error:', error)
    } finally {
      setIsTestingSend(false)
    }
  }

  const getStatusDisplay = () => {
    if (loading) return { icon: <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />, text: 'Checking...', variant: 'secondary' as const }
    
    if (!twilioStatus) return { icon: <XCircle className="h-5 w-5" />, text: 'Error', variant: 'destructive' as const }
    
    switch (twilioStatus.status) {
      case 'ready':
        return { icon: <CheckCircle className="h-5 w-5 text-green-600" />, text: 'Ready', variant: 'default' as const }
      case 'not_configured':
        return { icon: <XCircle className="h-5 w-5 text-red-600" />, text: 'Not Configured', variant: 'destructive' as const }
      default:
        return { icon: <AlertCircle className="h-5 w-5 text-yellow-600" />, text: 'Unknown', variant: 'secondary' as const }
    }
  }

  const status = getStatusDisplay()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Integration (Twilio)</h1>
          <p className="text-muted-foreground">
            Connect your chatbots to WhatsApp using Twilio's API
          </p>
        </div>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Integration Status
            </div>
            <div className="flex items-center space-x-2">
              {status.icon}
              <Badge variant={status.variant}>{status.text}</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Configuration Status</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Account SID:</span>
                  <span className={twilioStatus?.missing?.accountSid ? 'text-red-600' : 'text-green-600'}>
                    {twilioStatus?.missing?.accountSid ? '❌ Missing' : '✅ Set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Auth Token:</span>
                  <span className={twilioStatus?.missing?.authToken ? 'text-red-600' : 'text-green-600'}>
                    {twilioStatus?.missing?.authToken ? '❌ Missing' : '✅ Set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>WhatsApp Number:</span>
                  <span className={twilioStatus?.missing?.whatsappNumber ? 'text-red-600' : 'text-green-600'}>
                    {twilioStatus?.missing?.whatsappNumber ? '❌ Missing' : '✅ Set'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Current WhatsApp Number</h4>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span className="font-mono">
                  {twilioStatus?.whatsappNumber || 'Not configured'}
                </span>
                {twilioStatus?.whatsappNumber === '+14155238886' && (
                  <Badge variant="secondary">Sandbox</Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex space-x-2">
            <Button onClick={checkTwilioStatus} variant="outline" size="sm">
              Refresh Status
            </Button>
            <Button 
              asChild
              size="sm"
            >
              <a 
                href="https://console.twilio.com/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Twilio Console
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Setup Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Setup Guide</CardTitle>
          <CardDescription>
            Follow these simple steps to get WhatsApp working with Twilio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            
            {/* Step 1 */}
            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-sm">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Create Twilio Account</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Sign up for a free Twilio account if you don't have one
                </p>
                <Button asChild variant="outline" size="sm">
                  <a href="https://www.twilio.com/try-twilio" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Sign Up for Twilio
                  </a>
                </Button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-sm">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Enable WhatsApp Sandbox</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Activate the WhatsApp sandbox for testing (no verification needed)
                </p>
                <Button asChild variant="outline" size="sm">
                  <a href="https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    WhatsApp Sandbox
                  </a>
                </Button>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-sm">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Get Credentials</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Copy your Account SID and Auth Token from Twilio Console
                </p>
                <Button asChild variant="outline" size="sm">
                  <a href="https://console.twilio.com/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Get Credentials
                  </a>
                </Button>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-sm">
                4
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Configure Webhook</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Set the webhook URL in your Twilio WhatsApp sandbox
                </p>
                <div className="flex space-x-2 mt-2">
                  <Input
                    value={webhookUrl}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyToClipboard(webhookUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>
            Add these to your .env.local file with your Twilio credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm">
            <pre>{`# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+14155238886`}</pre>
          </div>
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The sandbox number +14155238886 is for testing. Get your own number after account verification.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Send className="h-5 w-5 mr-2" />
            Test Your Integration
          </CardTitle>
          <CardDescription>
            Send a test message to verify everything is working
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-phone">Your WhatsApp Number</Label>
              <Input
                id="test-phone"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+1234567890"
              />
              <p className="text-xs text-muted-foreground">
                Must be connected to Twilio sandbox first
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-message">Test Message</Label>
              <Input
                id="test-message"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Hello from your chatbot!"
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={testSendMessage}
              disabled={isTestingSend || !testPhone || !testMessage || !twilioStatus?.configured}
              className="flex-1"
            >
              {isTestingSend ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Message
                </>
              )}
            </Button>
            
            <Button 
              onClick={testWebhook}
              variant="outline"
              disabled={loading}
            >
              Test Webhook
            </Button>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>To connect to sandbox:</strong> Send "join {twilioStatus?.whatsappNumber?.replace('+', '').replace('1', '')}" to +14155238886 on WhatsApp first.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

    </div>
  )
}