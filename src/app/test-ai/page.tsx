'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function TestAIPage() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [tokensUsed, setTokensUsed] = useState(0)
  const [cost, setCost] = useState(0)

  const testAI = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message')
      return
    }

    try {
      setIsLoading(true)
      setResponse('')
      
      const res = await fetch('/api/test-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          chatbotId: 'test', // Using a test ID
          testType: 'basic'
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get AI response')
      }

      setResponse(data.response)
      setTokensUsed(data.tokensUsed || 0)
      setCost(data.cost || 0)
      toast.success('AI response generated successfully!')
    } catch (error) {
      console.error('Error testing AI:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to test AI')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test AI Integration</CardTitle>
            <CardDescription>
              Test the OpenAI integration directly without needing a chatbot setup.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            
            <Button 
              onClick={testAI} 
              disabled={isLoading || !message.trim()}
              className="w-full"
            >
              {isLoading ? 'Testing AI...' : 'Test AI'}
            </Button>
            
            {response && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  AI Response
                </label>
                <div className="bg-gray-50 p-4 rounded-md border">
                  <p className="text-gray-800 whitespace-pre-wrap">{response}</p>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Tokens used: {tokensUsed}</p>
                  <p>Cost: Rp {cost.toFixed(4)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}