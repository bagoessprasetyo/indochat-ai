// src/components/whatsapp-status-widget.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, CheckCircle, XCircle, AlertCircle, Settings, Phone } from 'lucide-react'
import Link from 'next/link'

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

export function WhatsAppStatusWidget() {
  const [status, setStatus] = useState<TwilioStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkWhatsAppStatus()
  }, [])

  const checkWhatsAppStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/send')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Error checking WhatsApp status:', error)
      setStatus({
        configured: false,
        provider: 'twilio',
        status: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = () => {
    if (loading) return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
    
    switch (status?.status) {
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'not_configured':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusBadge = () => {
    if (loading) return <Badge variant="secondary">Checking...</Badge>
    
    switch (status?.status) {
      case 'ready':
        return (
          <div className="flex items-center space-x-2">
            <Badge variant="default">Ready</Badge>
            {status?.whatsappNumber === '+14155238886' && (
              <Badge variant="secondary">Sandbox</Badge>
            )}
          </div>
        )
      case 'not_configured':
        return <Badge variant="destructive">Not Configured</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getStatusMessage = () => {
    if (loading) return 'Checking Twilio WhatsApp integration...'
    
    switch (status?.status) {
      case 'ready':
        const isSandbox = status?.whatsappNumber === '+14155238886'
        return `Twilio WhatsApp integration is ready. ${isSandbox ? 'Using sandbox for testing.' : 'Production number active.'}`
      case 'not_configured':
        const missing = []
        if (status?.missing?.accountSid) missing.push('Account SID')
        if (status?.missing?.authToken) missing.push('Auth Token')
        if (status?.missing?.whatsappNumber) missing.push('WhatsApp Number')
        return `Missing: ${missing.join(', ')}`
      default:
        return 'Unable to determine Twilio WhatsApp status.'
    }
  }

  const getMissingCount = () => {
    if (!status?.missing) return 0
    return Object.values(status.missing).filter(Boolean).length
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <MessageSquare className="h-4 w-4 mr-2" />
          WhatsApp (Twilio)
        </CardTitle>
        {getStatusIcon()}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">
                  {status?.configured ? 'Connected' : 'Not Connected'}
                </span>
                {getStatusBadge()}
              </div>
              
              {status?.whatsappNumber && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span className="font-mono">{status.whatsappNumber}</span>
                </div>
              )}
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            {getStatusMessage()}
          </p>
          
          {!status?.configured && getMissingCount() > 0 && (
            <div className="text-xs">
              <span className="text-red-600 font-medium">
                {getMissingCount()} credential(s) missing
              </span>
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/whatsapp">
                <Settings className="h-3 w-3 mr-1" />
                Configure
              </Link>
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={checkWhatsAppStatus}
              disabled={loading}
            >
              {loading ? 'Checking...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}