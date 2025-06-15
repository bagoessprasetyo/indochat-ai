'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

// Mock data - will be replaced with real data from Supabase
const mockConversations = [
  {
    id: '1',
    customer_name: 'Ahmad Rizki',
    customer_phone: '+62812345678',
    chatbot_name: 'Customer Service Bot',
    last_message: 'Terima kasih atas bantuannya! Sangat membantu.',
    last_message_time: '2024-01-20T10:30:00Z',
    status: 'resolved',
    message_count: 12,
    ai_handled: true,
    satisfaction_score: 5,
  },
  {
    id: '2',
    customer_name: 'Siti Nurhaliza',
    customer_phone: '+62812345679',
    chatbot_name: 'Sales Assistant',
    last_message: 'Apakah produk ini masih tersedia?',
    last_message_time: '2024-01-20T09:15:00Z',
    status: 'pending',
    message_count: 5,
    ai_handled: false,
    satisfaction_score: null,
  },
  {
    id: '3',
    customer_name: 'Budi Santoso',
    customer_phone: '+62812345680',
    chatbot_name: 'Customer Service Bot',
    last_message: 'Bot: Baik, saya akan bantu Anda dengan masalah tersebut.',
    last_message_time: '2024-01-20T08:45:00Z',
    status: 'active',
    message_count: 8,
    ai_handled: true,
    satisfaction_score: null,
  },
  {
    id: '4',
    customer_name: 'Maya Putri',
    customer_phone: '+62812345681',
    chatbot_name: 'Sales Assistant',
    last_message: 'Saya butuh bantuan manusia untuk ini.',
    last_message_time: '2024-01-20T07:20:00Z',
    status: 'escalated',
    message_count: 15,
    ai_handled: false,
    satisfaction_score: 3,
  },
]

const mockMessages = {
  '1': [
    { id: '1', sender: 'customer', message: 'Halo, saya butuh bantuan dengan pesanan saya', timestamp: '2024-01-20T10:00:00Z' },
    { id: '2', sender: 'bot', message: 'Halo! Saya siap membantu Anda. Bisa berikan nomor pesanan Anda?', timestamp: '2024-01-20T10:01:00Z' },
    { id: '3', sender: 'customer', message: 'Nomor pesanan: ORD-12345', timestamp: '2024-01-20T10:02:00Z' },
    { id: '4', sender: 'bot', message: 'Terima kasih. Saya cek dulu ya... Pesanan Anda sedang dalam proses pengiriman dan akan tiba besok.', timestamp: '2024-01-20T10:03:00Z' },
    { id: '5', sender: 'customer', message: 'Terima kasih atas bantuannya! Sangat membantu.', timestamp: '2024-01-20T10:30:00Z' },
  ]
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState(mockConversations)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [chatbotFilter, setChatbotFilter] = useState('all')

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.customer_phone.includes(searchTerm) ||
                         conv.last_message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter
    const matchesChatbot = chatbotFilter === 'all' || conv.chatbot_name === chatbotFilter
    
    return matchesSearch && matchesStatus && matchesChatbot
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Aktif', variant: 'default', icon: ChatBubbleLeftRightIcon },
      pending: { label: 'Menunggu', variant: 'secondary', icon: ClockIcon },
      resolved: { label: 'Selesai', variant: 'outline', icon: CheckCircleIcon },
      escalated: { label: 'Escalated', variant: 'destructive', icon: ExclamationTriangleIcon },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant as "default" | "secondary" | "outline" | "destructive"} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const formatTime = (timestamp: string | number | Date) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)} menit lalu`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} jam lalu`
    } else {
      return date.toLocaleDateString('id-ID')
    }
  }

const uniqueChatbots = Array.from(new Set(conversations.map(conv => conv.chatbot_name)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Percakapan</h1>
          <p className="text-gray-600">Monitor dan kelola semua percakapan WhatsApp dengan pelanggan</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Percakapan</CardTitle>
            <ChatBubbleLeftRightIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversations.length}</div>
            <p className="text-xs text-muted-foreground">
              {conversations.filter(c => c.status === 'active').length} sedang aktif
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Resolution Rate</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((conversations.filter(c => c.ai_handled).length / conversations.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {conversations.filter(c => c.ai_handled).length} dari {conversations.length} percakapan
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3s</div>
            <p className="text-xs text-muted-foreground">
              -15% dari minggu lalu
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conversations.filter(c => c.satisfaction_score).length > 0
                ? (conversations.reduce((sum, c) => sum + (c.satisfaction_score || 0), 0) / 
                   conversations.filter(c => c.satisfaction_score).length).toFixed(1)
                : '0.0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Dari {conversations.filter(c => c.satisfaction_score).length} rating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari berdasarkan nama, nomor, atau pesan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="resolved">Selesai</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={chatbotFilter} onValueChange={setChatbotFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Chatbot</SelectItem>
                  {uniqueChatbots.map(chatbot => (
                    <SelectItem key={chatbot} value={chatbot}>{chatbot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredConversations.map((conversation) => (
          <Card key={conversation.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <CardTitle className="text-base">{conversation.customer_name}</CardTitle>
                </div>
                {getStatusBadge(conversation.status)}
              </div>
              <CardDescription className="text-sm">
                {conversation.customer_phone} • {conversation.chatbot_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {conversation.last_message}
                  </p>
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{formatTime(conversation.last_message_time)}</span>
                  <span>{conversation.message_count} pesan</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    {conversation.ai_handled ? (
                      <Badge variant="outline" className="text-xs">
                        AI Handled
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Human Required
                      </Badge>
                    )}
                    {conversation.satisfaction_score && (
                      <span className="text-xs text-gray-500">
                        ⭐ {conversation.satisfaction_score}/5
                      </span>
                    )}
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Lihat
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Percakapan dengan {conversation.customer_name}</DialogTitle>
                        <DialogDescription>
                          {conversation.customer_phone} • {conversation.chatbot_name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {mockMessages[conversation.id as keyof typeof mockMessages]?.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                message.sender === 'customer'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.message}</p>
                              <p className="text-xs mt-1 opacity-70">
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        )) || (
                          <div className="text-center text-gray-500 py-8">
                            <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>Pesan tidak tersedia untuk preview</p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredConversations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada percakapan ditemukan</h3>
            <p className="text-gray-600 text-center">
              {searchTerm || statusFilter !== 'all' || chatbotFilter !== 'all'
                ? 'Coba ubah filter pencarian Anda'
                : 'Percakapan akan muncul di sini ketika pelanggan mulai chat dengan chatbot Anda'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}