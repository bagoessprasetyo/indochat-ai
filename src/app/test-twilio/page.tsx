'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'

interface CredentialStatus {
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

export default function TwilioTestPage() {
  const [credentialStatus, setCredentialStatus] = useState<CredentialStatus | null>(null)
  const [loading, setLoading] = useState(false)

  const checkCredentials = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'GET'
      })
      
      const data = await response.json()
      setCredentialStatus(data)
      
      if (data.configured) {
        toast.success('✅ Twilio credentials are properly configured!')
      } else {
        toast.error('❌ Twilio credentials are missing or incorrect')
      }
    } catch (error) {
      toast.error('❌ Error checking credentials')
      console.error('Credential check error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="h-5 w-5 animate-spin" />
    if (!credentialStatus) return <AlertCircle className="h-5 w-5 text-gray-400" />
    
    return credentialStatus.configured 
      ? <CheckCircle className="h-5 w-5 text-green-600" />
      : <XCircle className="h-5 w-5 text-red-600" />
  }

  const getStatusBadge = () => {
    if (loading) return <Badge variant="secondary">Checking...</Badge>
    if (!credentialStatus) return <Badge variant="outline">Not Checked</Badge>
    
    return credentialStatus.configured 
      ? <Badge variant="default">✅ Ready</Badge>
      : <Badge variant="destructive">❌ Not Configured</Badge>
  }

  const getMissingCredentials = () => {
    if (!credentialStatus?.missing) return []
    
    const missing = []
    if (credentialStatus.missing.accountSid) missing.push('Account SID')
    if (credentialStatus.missing.authToken) missing.push('Auth Token')
    if (credentialStatus.missing.whatsappNumber) missing.push('WhatsApp Number')
    
    return missing
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Twilio WhatsApp Test</h1>
          <p className="text-muted-foreground mt-2">
            Check if your Twilio credentials are properly configured
          </p>
        </div>

        {/* Credential Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Credential Status</span>
              {getStatusIcon()}
            </CardTitle>
            <CardDescription>
              Verify your Twilio WhatsApp API configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Configuration Status:</span>
              {getStatusBadge()}
            </div>

            {credentialStatus && (
              <div className="space-y-3">
                
                {/* Credential Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Account SID:</span>
                      <span className={credentialStatus.missing?.accountSid ? 'text-red-600' : 'text-green-600'}>
                        {credentialStatus.missing?.accountSid ? '❌ Missing' : '✅ Set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Auth Token:</span>
                      <span className={credentialStatus.missing?.authToken ? 'text-red-600' : 'text-green-600'}>
                        {credentialStatus.missing?.authToken ? '❌ Missing' : '✅ Set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>WhatsApp Number:</span>
                      <span className={credentialStatus.missing?.whatsappNumber ? 'text-red-600' : 'text-green-600'}>
                        {credentialStatus.missing?.whatsappNumber ? '❌ Missing' : '✅ Set'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    {credentialStatus.whatsappNumber && (
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 mb-1">WhatsApp Number:</p>
                        <p className="font-mono text-sm">{credentialStatus.whatsappNumber}</p>
                        {credentialStatus.whatsappNumber === '+14155238886' && (
                          <Badge variant="secondary" className="mt-1 text-xs">Sandbox</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Missing Credentials Warning */}
                {!credentialStatus.configured && getMissingCredentials().length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <h4 className="text-red-800 font-medium text-sm">Missing Credentials:</h4>
                    <ul className="text-red-700 text-sm mt-1">
                      {getMissingCredentials().map((cred) => (
                        <li key={cred}>• {cred}</li>
                      ))}
                    </ul>
                    <p className="text-red-600 text-xs mt-2">
                      Add these to your .env.local file and restart your development server.
                    </p>
                  </div>
                )}

                {/* Success Message */}
                {credentialStatus.configured && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <h4 className="text-green-800 font-medium text-sm">✅ All Set!</h4>
                    <p className="text-green-700 text-sm mt-1">
                      Your Twilio WhatsApp integration is properly configured and ready to use.
                    </p>
                    {credentialStatus.whatsappNumber === '+14155238886' && (
                      <p className="text-green-600 text-xs mt-2">
                        📱 You're using the sandbox number. Perfect for testing!
                      </p>
                    )}
                  </div>
                )}

              </div>
            )}

            <Button 
              onClick={checkCredentials} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Checking Credentials...
                </>
              ) : (
                'Check Twilio Credentials'
              )}
            </Button>

          </CardContent>
        </Card>

        {/* Next Steps Card */}
        {credentialStatus?.configured && (
          <Card>
            <CardHeader>
              <CardTitle>🎉 Next Steps</CardTitle>
              <CardDescription>
                Your credentials work! Now let's test the full integration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                  <span>Join WhatsApp Sandbox (if not done already)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                  <span>Set up webhook URL in Twilio Console</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                  <span>Test sending and receiving messages</span>
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <Button asChild className="w-full">
                  <a href="/dashboard/whatsapp">
                    Go to WhatsApp Management
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Environment Variables Reference */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables Reference</CardTitle>
            <CardDescription>
              Your .env.local should have these variables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm">
              <pre>{`# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+14155238886`}</pre>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}