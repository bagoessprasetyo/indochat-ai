'use client'

import { useState, useEffect } from 'react'
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
import { createSupabaseClient } from '@/lib/supabase'
import { useRequireAuth } from '@/contexts/auth-context'
import type { Database } from '@/types/database'

// Types for our conversation data
type ConversationRow = Database['public']['Tables']['conversations']['Row']
type MessageRow = Database['public']['Tables']['messages']['Row']
type ChatbotRow = Database['public']['Tables']['chatbots']['Row']

interface ConversationWithDetails extends ConversationRow {
  chatbot_name?: string
  last_message?: string
  last_message_time?: string | null
  message_count?: number
  ai_handled?: boolean
  satisfaction_score?: number | null
}

interface MessageWithDetails extends MessageRow {
  sender: 'customer' | 'bot'
  message: string
  timestamp: string
}

export default function ConversationsPage() {
  const { user } = useRequireAuth()
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null)
  const [messages, setMessages] = useState<MessageWithDetails[]>([])
  const [chatbots, setChatbots] = useState<ChatbotRow[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [chatbotFilter, setChatbotFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const supabase = createSupabaseClient()

  // Fetch conversations from database
  const fetchConversations = async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      
      // First, get user's chatbots
      const { data: userChatbots, error: chatbotsError } = await supabase
        .from('chatbots')
        .select('*')
        .eq('user_id', user.id)
      
      if (chatbotsError) {
        console.error('Error fetching chatbots:', chatbotsError)
        return
      }
      
      setChatbots(userChatbots || [])
      const chatbotIds = userChatbots?.map(bot => bot.id) || []
      
      if (chatbotIds.length === 0) {
        setConversations([])
        return
      }

      // Fetch conversations for user's chatbots with last message
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          *,
          chatbots!inner(name)
        `)
        .in('chatbot_id', chatbotIds)
        .order('last_message_at', { ascending: false })
        .limit(50)
      
      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError)
        return
      }

      // Get message counts and last messages for each conversation
      const conversationsWithDetails = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          // Get message count
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
          
          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, is_from_customer, ai_generated')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
          
          // Check if conversation is AI handled (has AI generated messages)
          const { data: aiMessages } = await supabase
            .from('messages')
            .select('id')
            .eq('conversation_id', conv.id)
            .eq('ai_generated', true)
            .limit(1)

          return {
            ...conv,
            chatbot_name: (conv.chatbots as any)?.name || 'Unknown Bot',
            last_message: lastMessage?.content || 'No messages yet',
            message_count: count || 0,
            ai_handled: (aiMessages?.length || 0) > 0
          }
        })
      )
      
      setConversations(conversationsWithDetails)
    } catch (error) {
      console.error('Error in fetchConversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch messages for a specific conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      setIsLoadingMessages(true)
      
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Error fetching messages:', error)
        return
      }
      
      // Transform messages to match our interface
      const transformedMessages: MessageWithDetails[] = (messagesData || []).map(msg => ({
        ...msg,
        sender: msg.is_from_customer ? 'customer' : 'bot',
        message: msg.content,
        timestamp: msg.created_at || msg.timestamp || new Date().toISOString()
      }))
      
      setMessages(transformedMessages)
    } catch (error) {
      console.error('Error in fetchMessages:', error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  // Load conversations on component mount
  useEffect(() => {
    fetchConversations()
  }, [user?.id])

  // Handle conversation selection
  const handleConversationSelect = (conversation: ConversationWithDetails) => {
    setSelectedConversation(conversation)
    fetchMessages(conversation.id)
  }

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = (conv.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         conv.customer_phone.includes(searchTerm) ||
                         (conv.last_message?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter
    const matchesChatbot = chatbotFilter === 'all' || conv.chatbot_name === chatbotFilter
    
    return matchesSearch && matchesStatus && matchesChatbot
  })

  const getStatusBadge = (status: string | null) => {
    const statusConfig = {
      active: { label: 'Aktif', variant: 'default' as const, icon: ChatBubbleLeftRightIcon },
      pending: { label: 'Menunggu', variant: 'secondary' as const, icon: ClockIcon },
      resolved: { label: 'Selesai', variant: 'outline' as const, icon: CheckCircleIcon },
      escalated: { label: 'Eskalasi', variant: 'destructive' as const, icon: ExclamationTriangleIcon },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const formatTime = (timestamp: string | number | Date | null) => {
    if (!timestamp) return 'Tidak diketahui'
    
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
                    <SelectItem key={chatbot} value={chatbot || ''}>{chatbot || 'Unknown Bot'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversations List */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-5 w-5 bg-gray-200 rounded"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="h-3 w-32 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-3 w-20 bg-gray-200 rounded"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
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
                  <span>{formatTime(conversation.last_message_time ?? null)}</span>
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
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleConversationSelect(conversation)}
                      >
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
                        {selectedConversation?.id === conversation.id ? (
                          isLoadingMessages ? (
                            <div className="space-y-4">
                              {[...Array(5)].map((_, i) => (
                                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                                  <div className="max-w-[80%] p-3 rounded-lg bg-gray-200 animate-pulse">
                                    <div className="h-4 w-32 bg-gray-300 rounded mb-2"></div>
                                    <div className="h-3 w-16 bg-gray-300 rounded"></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            messages.length > 0 ? (
                              messages.map((message) => (
                                <div
                                  key={message.id}
                                  className={`flex ${message.is_from_customer ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`max-w-[80%] p-3 rounded-lg ${
                                      message.is_from_customer
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-900'
                                    }`}
                                  >
                                    <p className="text-sm">{message.content}</p>
                                    <p className="text-xs mt-1 opacity-70">
                                      {formatTime(message.created_at)}
                                    </p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center text-gray-500 py-8">
                                <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>Tidak ada pesan dalam percakapan ini</p>
                              </div>
                            )
                          )
                        ) : (
                          <div className="text-center text-gray-500 py-8">
                            <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>Klik untuk memuat pesan...</p>
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
      )}

      {!isLoading && filteredConversations.length === 0 && (
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