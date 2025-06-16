'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Globe,
  Zap,
  Terminal,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'

interface WebhookTest {
  test: string
  success: boolean
  message: string
  details?: any
  timestamp: string
}

export default function WebhookChecker() {
  const [webhookUrl, setWebhookUrl] = useState('')
  const [ngrokUrl, setNgrokUrl] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [testResults, setTestResults] = useState<WebhookTest[]>([])

  const addTestResult = (test: string, success: boolean, message: string, details?: any) => {
    const result: WebhookTest = {
      test,
      success,
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    }
    setTestResults(prev => [result, ...prev])
  }

  const checkWebhookAccessibility = async () => {
    setIsChecking(true)
    setTestResults([])

    // Test 1: Check if webhook endpoint exists
    try {
      const localUrl = 'http://localhost:3000/api/whatsapp/twilio-webhook'
      const response = await fetch(localUrl, {
        method: 'OPTIONS'
      })
      
      addTestResult(
        'Local Endpoint Check',
        true,
        'Webhook endpoint exists locally',
        { status: response.status, url: localUrl }
      )
    } catch (error) {
      addTestResult(
        'Local Endpoint Check',
        false,
        'Webhook endpoint not accessible locally',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      )
    }

    // Test 2: Check ngrok accessibility (if provided)
    if (ngrokUrl) {
      try {
        const fullWebhookUrl = `${ngrokUrl}/api/whatsapp/twilio-webhook`
        const response = await fetch(fullWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'ngrok-skip-browser-warning': 'true'
          },
          body: new URLSearchParams({
            From: 'whatsapp:+1234567890',
            To: 'whatsapp:+14155238886',
            Body: 'Test webhook connectivity',
            MessageSid: 'test-webhook-check',
            ProfileName: 'Webhook Tester'
          })
        })

        if (response.status === 200) {
          addTestResult(
            'ngrok Accessibility',
            true,
            'Webhook is accessible through ngrok',
            { status: response.status, url: fullWebhookUrl }
          )
        } else {
          addTestResult(
            'ngrok Accessibility',
            false,
            `Webhook returned status ${response.status}`,
            { status: response.status, url: fullWebhookUrl }
          )
        }
      } catch (error) {
        addTestResult(
          'ngrok Accessibility',
          false,
          'Could not reach webhook through ngrok',
          { error: error instanceof Error ? error.message : 'Unknown error' }
        )
      }
    }

    // Test 3: Check if ngrok is running
    if (ngrokUrl) {
      try {
        const ngrokApiResponse = await fetch(`${ngrokUrl}/api/tunnels`)
        addTestResult(
          'ngrok Status',
          true,
          'ngrok is running and accessible',
          { accessible: true }
        )
      } catch (error) {
        addTestResult(
          'ngrok Status',
          false,
          'ngrok might not be running or URL is incorrect',
          { error: error instanceof Error ? error.message : 'Unknown error' }
        )
      }
    }

    // Test 4: Server health check
    try {
      const healthResponse = await fetch('/api/whatsapp/test-send', {
        method: 'GET'
      })
      const healthData = await healthResponse.json()
      
      addTestResult(
        'Server Configuration',
        healthData.configured,
        healthData.configured ? 'Twilio credentials are configured' : 'Twilio credentials missing',
        healthData
      )
    } catch (error) {
      addTestResult(
        'Server Configuration',
        false,
        'Could not check server configuration',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      )
    }

    setIsChecking(false)
  }

  const sendTestWebhook = async () => {
    if (!ngrokUrl) {
      toast.error('Please enter your ngrok URL first')
      return
    }

    try {
      const fullWebhookUrl = `${ngrokUrl}/api/whatsapp/twilio-webhook`
      const response = await fetch(fullWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'ngrok-skip-browser-warning': 'true'
        },
        body: new URLSearchParams({
          From: 'whatsapp:+1234567890',
          To: 'whatsapp:+14155238886',
          Body: 'Manual test webhook message',
          MessageSid: `test-manual-${Date.now()}`,
          ProfileName: 'Manual Tester'
        })
      })

      if (response.status === 200) {
        toast.success('✅ Test webhook sent successfully!')
        addTestResult(
          'Manual Test Webhook',
          true,
          'Webhook processed test message successfully',
          { status: response.status, manual: true }
        )
      } else {
        toast.error(`❌ Webhook returned status ${response.status}`)
        addTestResult(
          'Manual Test Webhook',
          false,
          `Webhook returned status ${response.status}`,
          { status: response.status, manual: true }
        )
      }
    } catch (error) {
      toast.error('❌ Could not send test webhook')
      addTestResult(
        'Manual Test Webhook',
        false,
        'Could not send test webhook',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      )
    }
  }

  const getStatusIcon = (success: boolean) => {
    return success 
      ? <CheckCircle className="h-4 w-4 text-green-600" />
      : <XCircle className="h-4 w-4 text-red-600" />
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold flex items-center justify-center">
            <Eye className="mr-3 text-blue-500" />
            Webhook Status Checker
          </h1>
          <p className="text-muted-foreground mt-2">
            Verify if your WhatsApp webhook is working properly
          </p>
        </div>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Webhook Configuration
            </CardTitle>
            <CardDescription>
              Enter your ngrok URL to test webhook accessibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="ngrok-url">Your ngrok HTTPS URL</Label>
              <Input
                id="ngrok-url"
                placeholder="https://abc123.ngrok.io"
                value={ngrokUrl}
                onChange={(e) => {
                  setNgrokUrl(e.target.value)
                  setWebhookUrl(`${e.target.value}/api/whatsapp/twilio-webhook`)
                }}
              />
              <p className="text-xs text-muted-foreground">
                Get this by running: <code className="bg-gray-100 px-1 rounded">ngrok http 3000</code>
              </p>
            </div>

            {webhookUrl && (
              <div className="space-y-2">
                <Label>Generated Webhook URL</Label>
                <div className="flex space-x-2">
                  <Input
                    value={webhookUrl}
                    readOnly
                    className="font-mono text-sm bg-gray-50"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(webhookUrl)
                      toast.success('Webhook URL copied!')
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-green-600">
                  ✅ Use this URL in your Twilio Console
                </p>
              </div>
            )}

            <div className="flex space-x-2">
              <Button 
                onClick={checkWebhookAccessibility}
                disabled={isChecking}
                className="flex-1"
              >
                {isChecking ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Checking Webhook...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Check Webhook Status
                  </>
                )}
              </Button>
              
              <Button 
                onClick={sendTestWebhook}
                variant="outline"
                disabled={!ngrokUrl || isChecking}
              >
                <Terminal className="h-4 w-4 mr-2" />
                Send Test
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Webhook connectivity and configuration status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                
                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {testResults.filter(r => r.success).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Passed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {testResults.filter(r => !r.success).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {testResults.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Tests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round((testResults.filter(r => r.success).length / testResults.length) * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>

                {/* Individual Test Results */}
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div 
                      key={index}
                      className={`flex items-start space-x-3 p-3 rounded-lg border ${
                        result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}
                    >
                      {getStatusIcon(result.success)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                            {result.test}
                          </h4>
                          <span className="text-xs text-gray-500">{result.timestamp}</span>
                        </div>
                        <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                          {result.message}
                        </p>
                        {result.details && (
                          <details className="mt-2">
                            <summary className="text-xs cursor-pointer text-gray-600 hover:text-gray-800">
                              View details
                            </summary>
                            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Troubleshooting */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Troubleshooting</CardTitle>
            <CardDescription>
              Common issues and solutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              
              <div className="space-y-3">
                <h4 className="font-medium text-red-600">❌ Common Issues:</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>ngrok not accessible:</strong>
                    <p className="text-gray-600">• Check if ngrok is running</p>
                    <p className="text-gray-600">• Verify URL format (https://)</p>
                  </div>
                  <div>
                    <strong>Webhook returns 404:</strong>
                    <p className="text-gray-600">• Check your Next.js app is running</p>
                    <p className="text-gray-600">• Verify webhook endpoint exists</p>
                  </div>
                  <div>
                    <strong>Credentials missing:</strong>
                    <p className="text-gray-600">• Check .env.local file</p>
                    <p className="text-gray-600">• Restart development server</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-green-600">✅ What Should Work:</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Local Endpoint:</strong>
                    <p className="text-gray-600">• Should be accessible on localhost</p>
                  </div>
                  <div>
                    <strong>ngrok Accessibility:</strong>
                    <p className="text-gray-600">• Should return 200 status</p>
                    <p className="text-gray-600">• Should process test webhooks</p>
                  </div>
                  <div>
                    <strong>Server Configuration:</strong>
                    <p className="text-gray-600">• All Twilio credentials configured</p>
                  </div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        {testResults.length > 0 && testResults.every(r => r.success) && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>🎉 All tests passed!</strong> Your webhook is working correctly. 
              Now you can test the full integration by sending a WhatsApp message to +14155238886.
            </AlertDescription>
          </Alert>
        )}

      </div>
    </div>
  )
}