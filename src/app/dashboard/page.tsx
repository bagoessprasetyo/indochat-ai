'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  ChartBarIcon,
  CogIcon,
  DevicePhoneMobileIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { WhatsAppStatusWidget } from '@/components/whatsapp-status-widget'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface DashboardStats {
  activeChatbots: number
  todayMessages: number
  activeCustomers: number
  totalConversations: number
}

interface RecentActivity {
  id: string
  type: 'message' | 'conversation' | 'chatbot'
  title: string
  description: string
  timestamp: Date
  chatbot_name?: string
}

interface Chatbot {
  id: string
  name: string
  created_at: string | null
}

interface UserProfile {
  business_name?: string | null
  business_type?: string | null
  phone_number?: string | null
  address?: string | null
  subscription_plan?: string | null
  subscription_status?: string | null
}

export default function DashboardPage() {
  const { user, profile } = useRequireAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    activeChatbots: 0,
    todayMessages: 0,
    activeCustomers: 0,
    totalConversations: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    if (!user?.id) return
    
    try {
      const supabase = createSupabaseClient()
      
      // Get user's chatbots
      const { data: userChatbots, error: chatbotsError } = await supabase
        .from('chatbots')
        .select('id, name, created_at')
        .eq('user_id', user.id)
      
      if (chatbotsError) throw chatbotsError
      
      setChatbots((userChatbots || []).filter((chatbot): chatbot is Chatbot => 
        chatbot.created_at !== null
      ))
      const chatbotIds = userChatbots?.map(c => c.id) || []
      const activeChatbots = userChatbots?.length || 0
      
      // Get today's date range
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      // Fetch conversations for user's chatbots
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select('id, created_at, customer_phone')
        .in('chatbot_id', chatbotIds)
      
      if (conversationsError) throw conversationsError
      
      const totalConversations = conversations?.length || 0
      
      // Get today's messages count
      const { data: todayMessages, error: messagesError } = await supabase
        .from('messages')
        .select('id')
        .in('conversation_id', conversations?.map(c => c.id) || [])
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())
      
      if (messagesError) throw messagesError
      
      // Get unique customers (unique phone numbers)
      const uniqueCustomers = new Set(conversations?.map(c => c.customer_phone) || []).size
      
      setStats({
        activeChatbots,
        todayMessages: todayMessages?.length || 0,
        activeCustomers: uniqueCustomers,
        totalConversations,
      })
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      setError('Failed to load dashboard statistics')
    }
  }
  
  // Fetch recent activity
  const fetchRecentActivity = async () => {
    if (!user?.id) return
    
    try {
      const supabase = createSupabaseClient()
      
      // Get user's chatbots
      const { data: userChatbots } = await supabase
        .from('chatbots')
        .select('id, name')
        .eq('user_id', user.id)
      
      const chatbotIds = userChatbots?.map(c => c.id) || []
      
      if (chatbotIds.length === 0) {
        setRecentActivity([])
        return
      }
      
      // Get recent conversations
      const { data: recentConversations } = await supabase
        .from('conversations')
        .select(`
          id,
          created_at,
          customer_phone,
          chatbot_id,
          chatbots!inner(name)
        `)
        .in('chatbot_id', chatbotIds)
        .order('created_at', { ascending: false })
        .limit(5)
      
      // Get recent messages
      const { data: recentMessages } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          conversation_id,
          conversations!inner(
            chatbot_id,
            customer_phone,
            chatbots!inner(name)
          )
        `)
        .in('conversations.chatbot_id', chatbotIds)
        .order('created_at', { ascending: false })
        .limit(5)
      
      const activities: RecentActivity[] = []
      
      // Add conversation activities
      recentConversations?.forEach(conv => {
        if (conv.created_at) {
          activities.push({
            id: `conv-${conv.id}`,
            type: 'conversation',
            title: 'New conversation started',
            description: `Customer ${conv.customer_phone} started a conversation`,
            timestamp: new Date(conv.created_at),
            chatbot_name: (conv.chatbots as any)?.name,
          })
        }
      })
      
      // Add message activities
      recentMessages?.forEach(msg => {
        if (msg.created_at && msg.content) {
          activities.push({
            id: `msg-${msg.id}`,
            type: 'message',
            title: 'New message received',
            description: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : ''),
            timestamp: new Date(msg.created_at),
            chatbot_name: (msg.conversations as any)?.chatbots?.name,
          })
        }
      })
      
      // Sort by timestamp and take latest 5
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      setRecentActivity(activities.slice(0, 5))
      
    } catch (error) {
      console.error('Error fetching recent activity:', error)
    }
  }
  
  // Fetch user profile
  const fetchUserProfile = async () => {
    if (!user?.id) return
    
    try {
      const supabase = createSupabaseClient()
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('business_name, business_type, phone_number, address, subscription_plan, subscription_status')
        .eq('id', user.id)
        .single()
      
      if (profileData) {
        setUserProfile(profileData)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }
  
  // Refresh all data
  const refreshData = async () => {
    setIsRefreshing(true)
    setError(null)
    
    await Promise.all([
      fetchDashboardStats(),
      fetchRecentActivity(),
      fetchUserProfile(),
    ])
    
    setIsRefreshing(false)
  }
  
  // Initial data fetch
  useEffect(() => {
    if (user?.id) {
      const loadData = async () => {
        setIsLoading(true)
        await refreshData()
        setIsLoading(false)
      }
      loadData()
    }
  }, [user?.id])
  
  // Navigation handlers
  const handleCreateChatbot = () => {
    router.push('/dashboard/chatbots')
  }
  
  const handleViewConversations = () => {
    router.push('/dashboard/conversations')
  }
  
  const handleViewAnalytics = () => {
    router.push('/dashboard/analytics')
  }
  
  const handleViewSettings = () => {
    router.push('/dashboard/settings')
  }

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show error state
  if (error && !isLoading) {
    return (
      <div className="space-y-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={refreshData} disabled={isRefreshing}>
                {isRefreshing ? (
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                )}
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white relative">
        {isRefreshing && (
          <div className="absolute top-4 right-4">
            <ArrowPathIcon className="h-5 w-5 animate-spin" />
          </div>
        )}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Selamat datang, {profile.business_name}! 👋
            </h1>
            <p className="text-blue-100">
              Kelola customer service WhatsApp Anda dengan kecerdasan buatan
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={isRefreshing}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {isRefreshing ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowPathIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="bg-white/20 rounded-lg p-3 min-w-[120px]">
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="animate-pulse bg-white/30 h-8 w-8 rounded"></div>
              ) : (
                stats.activeChatbots
              )}
            </div>
            <div className="text-sm text-blue-100">Chatbot Aktif</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 min-w-[120px]">
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="animate-pulse bg-white/30 h-8 w-8 rounded"></div>
              ) : (
                stats.todayMessages
              )}
            </div>
            <div className="text-sm text-blue-100">Pesan Hari Ini</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 min-w-[120px]">
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="animate-pulse bg-white/30 h-8 w-8 rounded"></div>
              ) : (
                stats.activeCustomers
              )}
            </div>
            <div className="text-sm text-blue-100">Pelanggan Aktif</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 min-w-[120px]">
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="animate-pulse bg-white/30 h-8 w-8 rounded"></div>
              ) : (
                stats.totalConversations
              )}
            </div>
            <div className="text-sm text-blue-100">Total Percakapan</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-blue-200 hover:border-blue-300"
          onClick={handleCreateChatbot}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buat Chatbot Baru</CardTitle>
            <PlusIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">+</div>
            <p className="text-xs text-muted-foreground">
              Setup AI assistant untuk WhatsApp
            </p>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-green-200 hover:border-green-300"
          onClick={handleViewConversations}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Percakapan</CardTitle>
            <ChatBubbleLeftRightIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-8 rounded"></div>
              ) : (
                stats.totalConversations
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Lihat semua chat aktif
            </p>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-purple-200 hover:border-purple-300"
          onClick={handleViewAnalytics}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analytics</CardTitle>
            <ChartBarIcon className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">📊</div>
            <p className="text-xs text-muted-foreground">
              Laporan performa bisnis
            </p>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-orange-200 hover:border-orange-300"
          onClick={handleViewSettings}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengaturan</CardTitle>
            <CogIcon className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">⚙️</div>
            <p className="text-xs text-muted-foreground">
              Konfigurasi WhatsApp API
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Setup Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Setup Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DevicePhoneMobileIcon className="h-5 w-5" />
              Panduan Setup
            </CardTitle>
            <CardDescription>
              Langkah-langkah untuk memulai dengan IndoChat AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <div>
                <div className="font-medium">Akun dibuat</div>
                <div className="text-sm text-muted-foreground">Profile Anda sudah siap</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <div className="font-medium">Setup WhatsApp Business API</div>
                <div className="text-sm text-muted-foreground">Hubungkan nomor WhatsApp bisnis</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <div className="font-medium">Buat Chatbot Pertama</div>
                <div className="text-sm text-muted-foreground">Konfigurasi AI assistant</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                4
              </div>
              <div>
                <div className="font-medium">Test & Launch</div>
                <div className="text-sm text-muted-foreground">Uji coba dan mulai melayani pelanggan</div>
              </div>
            </div>
            
            <Button 
              className="w-full mt-4"
              onClick={() => router.push('/dashboard/integrations')}
              disabled={isLoading}
            >
              Mulai Setup WhatsApp
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserGroupIcon className="h-5 w-5" />
              Aktivitas Terbaru
            </CardTitle>
            <CardDescription>
              Percakapan dan interaksi terbaru
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="animate-pulse bg-gray-200 h-10 w-10 rounded-full"></div>
                    <div className="flex-1">
                      <div className="animate-pulse bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
                      <div className="animate-pulse bg-gray-200 h-3 w-1/2 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada aktivitas</p>
                <p className="text-sm">Aktivitas akan muncul setelah Anda setup WhatsApp</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      {activity.type === 'conversation' ? (
                        <ChatBubbleLeftRightIcon className="h-5 w-5" />
                      ) : (
                        <UserIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{activity.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {activity.description} • {activity.timestamp.toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <WhatsAppStatusWidget />
      {/* Business Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Bisnis</CardTitle>
          <CardDescription>
            Detail bisnis Anda yang terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  <div className="animate-pulse bg-gray-200 h-4 w-20 rounded mb-2"></div>
                  <div className="animate-pulse bg-gray-200 h-5 w-32 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nama Bisnis</label>
                <p className="font-medium">{userProfile.business_name || 'Belum diatur'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Jenis Bisnis</label>
                <p className="font-medium">{userProfile.business_type || 'Belum diatur'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nomor Telepon</label>
                <p className="font-medium">{userProfile.phone_number || 'Belum diatur'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Alamat</label>
                <p className="font-medium">{userProfile.address || 'Belum diatur'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Paket Berlangganan</label>
                <Badge variant="outline">
                  {userProfile.subscription_plan || 'Free'}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Badge variant={userProfile.subscription_status === 'active' ? 'default' : 'secondary'}>
                  {userProfile.subscription_status || 'inactive'}
                </Badge>
              </div>
            </div>
          )}
          <div className="mt-4">
            <Button 
              variant="outline"
              onClick={() => router.push('/dashboard/settings')}
              disabled={isLoading}
            >
              Edit Informasi Bisnis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}