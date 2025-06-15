'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon,
  CogIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { useRequireAuth } from '@/contexts/auth-context'

interface Integration {
  id: string
  name: string
  description: string
  icon: string
  status: 'connected' | 'disconnected' | 'error'
  category: 'messaging' | 'crm' | 'analytics' | 'automation' | 'storage'
  features: string[]
  setupUrl?: string
}

interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  status: 'active' | 'inactive'
  created_at: string
  last_triggered?: string
}

export default function IntegrationsPage() {
  useRequireAuth()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false)
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as string[],
  })

  // Mock integrations data
  const integrations: Integration[] = [
    {
      id: 'whatsapp',
      name: 'WhatsApp Business API',
      description: 'Kirim dan terima pesan WhatsApp secara otomatis',
      icon: '💬',
      status: 'connected',
      category: 'messaging',
      features: ['Send Messages', 'Receive Messages', 'Media Support', 'Templates'],
    },
    {
      id: 'telegram',
      name: 'Telegram Bot',
      description: 'Integrasikan chatbot dengan Telegram',
      icon: '✈️',
      status: 'disconnected',
      category: 'messaging',
      features: ['Bot API', 'Inline Keyboards', 'File Sharing'],
    },
    {
      id: 'shopify',
      name: 'Shopify',
      description: 'Sinkronisasi produk dan pesanan dari toko Shopify',
      icon: '🛍️',
      status: 'disconnected',
      category: 'crm',
      features: ['Product Sync', 'Order Management', 'Customer Data'],
    },
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      description: 'Export data percakapan ke Google Sheets',
      icon: '📊',
      status: 'connected',
      category: 'storage',
      features: ['Data Export', 'Real-time Sync', 'Custom Reports'],
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Otomatisasi workflow dengan 5000+ aplikasi',
      icon: '⚡',
      status: 'disconnected',
      category: 'automation',
      features: ['Workflow Automation', '5000+ Apps', 'Triggers & Actions'],
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Lacak performa chatbot dan konversi',
      icon: '📈',
      status: 'error',
      category: 'analytics',
      features: ['Conversion Tracking', 'User Behavior', 'Custom Events'],
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Terima notifikasi dan alert di Slack',
      icon: '💬',
      status: 'connected',
      category: 'messaging',
      features: ['Notifications', 'Team Collaboration', 'Custom Alerts'],
    },
    {
      id: 'hubspot',
      name: 'HubSpot CRM',
      description: 'Sinkronisasi lead dan customer data',
      icon: '🎯',
      status: 'disconnected',
      category: 'crm',
      features: ['Lead Management', 'Contact Sync', 'Deal Tracking'],
    },
  ]

  // Mock webhooks data
  const webhooks: Webhook[] = [
    {
      id: '1',
      name: 'Order Notifications',
      url: 'https://api.example.com/webhooks/orders',
      events: ['message.received', 'order.created'],
      status: 'active',
      created_at: '2024-01-15',
      last_triggered: '2024-01-20 14:30:00',
    },
    {
      id: '2',
      name: 'Customer Support',
      url: 'https://support.example.com/webhook',
      events: ['message.received', 'conversation.ended'],
      status: 'active',
      created_at: '2024-01-10',
      last_triggered: '2024-01-20 15:45:00',
    },
  ]

  const categories = [
    { id: 'all', name: 'Semua', count: integrations.length },
    { id: 'messaging', name: 'Messaging', count: integrations.filter(i => i.category === 'messaging').length },
    { id: 'crm', name: 'CRM', count: integrations.filter(i => i.category === 'crm').length },
    { id: 'analytics', name: 'Analytics', count: integrations.filter(i => i.category === 'analytics').length },
    { id: 'automation', name: 'Automation', count: integrations.filter(i => i.category === 'automation').length },
    { id: 'storage', name: 'Storage', count: integrations.filter(i => i.category === 'storage').length },
  ]

  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(integration => integration.category === selectedCategory)

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Terhubung</Badge>
      case 'disconnected':
        return <Badge variant="secondary">Tidak Terhubung</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
    }
  }

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'disconnected':
        return <XCircleIcon className="h-5 w-5 text-gray-400" />
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
    }
  }

  const handleConnect = (integrationId: string) => {
    // TODO: Implement integration connection
    console.log('Connecting to:', integrationId)
  }

  const handleDisconnect = (integrationId: string) => {
    // TODO: Implement integration disconnection
    console.log('Disconnecting from:', integrationId)
  }

  const handleCreateWebhook = () => {
    // TODO: Implement webhook creation
    console.log('Creating webhook:', newWebhook)
    setIsWebhookDialogOpen(false)
    setNewWebhook({ name: '', url: '', events: [] })
  }

  const handleDeleteWebhook = (webhookId: string) => {
    // TODO: Implement webhook deletion
    console.log('Deleting webhook:', webhookId)
  }

  const availableEvents = [
    'message.received',
    'message.sent',
    'conversation.started',
    'conversation.ended',
    'order.created',
    'order.updated',
    'customer.created',
    'ai.response.generated',
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Integrasi</h1>
        <p className="text-gray-600">Hubungkan IndoChat AI dengan platform dan tools favorit Anda</p>
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="integrations">Integrasi</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
        </TabsList>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center space-x-2"
              >
                <span>{category.name}</span>
                <Badge variant="secondary" className="ml-1">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => (
              <Card key={integration.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{integration.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusIcon(integration.status)}
                          {getStatusBadge(integration.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-2">
                    {integration.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Fitur:</h4>
                      <div className="flex flex-wrap gap-1">
                        {integration.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {integration.status === 'connected' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDisconnect(integration.id)}
                          >
                            Putuskan
                          </Button>
                          <Button variant="outline" size="sm">
                            <CogIcon className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          className="flex-1"
                          size="sm"
                          onClick={() => handleConnect(integration.id)}
                        >
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Hubungkan
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Webhooks</h2>
              <p className="text-sm text-gray-600">Konfigurasi webhook untuk menerima notifikasi real-time</p>
            </div>
            
            <Dialog open={isWebhookDialogOpen} onOpenChange={setIsWebhookDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Tambah Webhook
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Buat Webhook Baru</DialogTitle>
                  <DialogDescription>
                    Webhook akan mengirim data ke URL yang Anda tentukan saat event terjadi
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhook_name">Nama Webhook</Label>
                    <Input
                      id="webhook_name"
                      value={newWebhook.name}
                      onChange={(e) => setNewWebhook({...newWebhook, name: e.target.value})}
                      placeholder="Contoh: Order Notifications"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="webhook_url">URL Endpoint</Label>
                    <Input
                      id="webhook_url"
                      value={newWebhook.url}
                      onChange={(e) => setNewWebhook({...newWebhook, url: e.target.value})}
                      placeholder="https://api.example.com/webhook"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Events</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableEvents.map((event) => (
                        <label key={event} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newWebhook.events.includes(event)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewWebhook({
                                  ...newWebhook,
                                  events: [...newWebhook.events, event]
                                })
                              } else {
                                setNewWebhook({
                                  ...newWebhook,
                                  events: newWebhook.events.filter(e => e !== event)
                                })
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{event}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsWebhookDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleCreateWebhook}>
                    Buat Webhook
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{webhook.name}</h3>
                        <Badge 
                          className={webhook.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        >
                          {webhook.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{webhook.url}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {webhook.events.map((event, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Dibuat: {webhook.created_at}
                        {webhook.last_triggered && (
                          <span className="ml-4">Terakhir dipicu: {webhook.last_triggered}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <CogIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteWebhook(webhook.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Kelola API keys untuk mengakses IndoChat AI API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Production API Key</h4>
                    <p className="text-sm text-gray-500">sk-prod-••••••••••••••••••••••••••••••••</p>
                    <p className="text-xs text-gray-400 mt-1">Dibuat: 15 Jan 2024</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Copy</Button>
                    <Button variant="outline" size="sm">Regenerate</Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Development API Key</h4>
                    <p className="text-sm text-gray-500">sk-dev-••••••••••••••••••••••••••••••••</p>
                    <p className="text-xs text-gray-400 mt-1">Dibuat: 10 Jan 2024</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Copy</Button>
                    <Button variant="outline" size="sm">Regenerate</Button>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Generate New API Key
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>
                Pelajari cara menggunakan IndoChat AI API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Getting Started Guide</h4>
                    <p className="text-sm text-gray-500">Panduan lengkap untuk memulai dengan API</p>
                  </div>
                  <Button variant="outline" size="sm">Lihat Docs</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">API Reference</h4>
                    <p className="text-sm text-gray-500">Dokumentasi lengkap semua endpoint</p>
                  </div>
                  <Button variant="outline" size="sm">Lihat Docs</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Code Examples</h4>
                    <p className="text-sm text-gray-500">Contoh implementasi dalam berbagai bahasa</p>
                  </div>
                  <Button variant="outline" size="sm">Lihat Examples</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}