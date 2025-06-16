'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'

export default function SimpleTestAIPage() {
  const { user, loading } = useAuth()
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [tokensUsed, setTokensUsed] = useState(0)
  const [cost, setCost] = useState(0)
  const [testType, setTestType] = useState('basic')

  const testAI = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message')
      return
    }

    if (!user) {
      toast.error('You must be logged in')
      return
    }

    try {
      setIsLoading(true)
      setResponse('')
      
      // Get the access token directly from the client session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session?.access_token) {
        toast.error('Could not get authentication token. Please try logging in again.')
        console.error('Session error:', sessionError)
        return
      }

      console.log('🔑 Got access token, making API call...')

      // Call the simple API endpoint
      const res = await fetch('/api/test-ai-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          testType: testType,
          userToken: session.access_token
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}: ${data.details || 'Request failed'}`)
      }

      setResponse(data.response)
      setTokensUsed(data.tokensUsed || 0)
      setCost(data.cost || 0)
      toast.success('✅ AI response generated successfully!')
      
    } catch (error) {
      console.error('Error testing AI:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to test AI')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>❌ Not Authenticated</CardTitle>
              <CardDescription>
                You need to be logged in to test the AI integration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>Please log in to your account first.</p>
              </div>
              <Button onClick={() => window.location.href = '/auth/login'}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>✅ Simple Test AI (Working Solution)</CardTitle>
            <CardDescription>
              Simplified AI testing that bypasses cookie authentication issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-green-600 font-medium">✅ Authenticated</span>
              </div>
              <div className="flex justify-between">
                <span>User:</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span>User ID:</span>
                <span className="font-mono text-xs">{user.id}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button onClick={handleSignOut} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Test AI Integration</CardTitle>
            <CardDescription>
              This version sends the auth token directly and should work reliably
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Test Type Selection */}
            <div>
              <label htmlFor="testType" className="block text-sm font-medium text-gray-700 mb-2">
                Test Type
              </label>
              <select
                id="testType"
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="basic">Basic Assistant</option>
                <option value="customer_service">Customer Service</option>
                <option value="sales">Sales Assistant</option>
              </select>
            </div>

            {/* Message Input */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Test Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter a message to test the AI response..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={4}
              />
            </div>
            
            {/* Test Button */}
            <Button 
              onClick={testAI} 
              disabled={isLoading || !message.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Testing AI...
                </>
              ) : (
                '🚀 Test AI'
              )}
            </Button>
            
            {/* Response Display */}
            {response && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  AI Response
                </label>
                <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                  <p className="text-gray-800 whitespace-pre-wrap">{response}</p>
                </div>
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  <p>✅ Tokens used: {tokensUsed}</p>
                  <p>💰 Cost: Rp {cost.toFixed(4)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}