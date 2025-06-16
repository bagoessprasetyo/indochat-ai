'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChartBarIcon,
  ClockIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'
import { createSupabaseClient } from '@/lib/supabase'
import { useRequireAuth } from '@/contexts/auth-context'
import type { Database } from '@/types/database'

// Types for analytics data
type AnalyticsOverview = {
  totalMessages: number
  totalConversations: number
  aiResolutionRate: number
  avgResponseTime: number
  customerSatisfaction: number
  activeUsers: number
}

type AnalyticsTrends = {
  messages: { current: number; previous: number; change: number }
  conversations: { current: number; previous: number; change: number }
  resolution: { current: number; previous: number; change: number }
  satisfaction: { current: number; previous: number; change: number }
}

type HourlyData = {
  hour: string
  messages: number
  conversations: number
}

type TopQuestion = {
  question: string
  count: number
  category: string
}

type ChatbotPerformance = {
  name: string
  messages: number
  resolution_rate: number
  satisfaction: number
}

export default function AnalyticsPage() {
  const { user } = useRequireAuth()
  const [timeRange, setTimeRange] = useState('7d')
  const [isLoading, setIsLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null)
  const [trends, setTrends] = useState<AnalyticsTrends | null>(null)
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([])
  const [topQuestions, setTopQuestions] = useState<TopQuestion[]>([])
  const [chatbotPerformance, setChatbotPerformance] = useState<ChatbotPerformance[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedMetric, setSelectedMetric] = useState('messages')

  const getTrendIcon = (change: number) => {
    if (change > 0) {
      return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
    } else if (change < 0) {
      return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
    }
    return null
  }

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const formatChange = (change: number) => {
    const sign = change > 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}%`
  }

  // Fetch analytics data from Supabase
  const fetchAnalytics = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      setError(null)
      const supabase = createSupabaseClient()
      
      // Get user's chatbots
      const { data: chatbots, error: chatbotsError } = await supabase
        .from('chatbots')
        .select('id, name')
        .eq('user_id', user.id)
      
      if (chatbotsError) throw chatbotsError
      if (!chatbots || chatbots.length === 0) {
        setAnalytics({
          totalMessages: 0,
          totalConversations: 0,
          aiResolutionRate: 0,
          avgResponseTime: 0,
          customerSatisfaction: 0,
          activeUsers: 0
        })
        setIsLoading(false)
        return
      }
      
      const chatbotIds = chatbots.map(bot => bot.id)
      
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      startDate.setDate(endDate.getDate() - days)
      
      // Fetch conversation analytics
      const { data: conversationAnalytics, error: analyticsError } = await supabase
        .from('conversation_analytics')
        .select('*')
        .in('chatbot_id', chatbotIds)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
      
      if (analyticsError) throw analyticsError
      
      // Aggregate analytics data
      const totalMessages = conversationAnalytics?.reduce((sum, item) => sum + (item.total_messages || 0), 0) || 0
      const totalConversations = conversationAnalytics?.reduce((sum, item) => sum + (item.total_conversations || 0), 0) || 0
      const avgResolution = conversationAnalytics?.length > 0 
        ? conversationAnalytics.reduce((sum, item) => sum + (item.ai_resolution_rate || 0), 0) / conversationAnalytics.length
        : 0
      const avgResponseTime = conversationAnalytics?.length > 0
        ? conversationAnalytics.reduce((sum, item) => sum + (item.avg_response_time_seconds || 0), 0) / conversationAnalytics.length / 60
        : 0
      const avgSatisfaction = conversationAnalytics?.length > 0
        ? conversationAnalytics.reduce((sum, item) => sum + (item.customer_satisfaction_avg || 0), 0) / conversationAnalytics.length
        : 0
      
      // Get active users count (unique customers in conversations)
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select('customer_phone')
        .in('chatbot_id', chatbotIds)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
      
      if (conversationsError) throw conversationsError
      
      const uniqueCustomers = new Set(conversations?.map(conv => conv.customer_phone) || []).size
      
      setAnalytics({
        totalMessages,
        totalConversations,
        aiResolutionRate: Math.round(avgResolution),
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
        customerSatisfaction: Math.round(avgSatisfaction * 10) / 10,
        activeUsers: uniqueCustomers
      })
      
      // Calculate trends (compare with previous period)
      const previousStartDate = new Date(startDate)
      previousStartDate.setDate(previousStartDate.getDate() - days)
      const previousEndDate = new Date(startDate)
      
      const { data: previousAnalytics } = await supabase
        .from('conversation_analytics')
        .select('*')
        .in('chatbot_id', chatbotIds)
        .gte('date', previousStartDate.toISOString().split('T')[0])
        .lt('date', startDate.toISOString().split('T')[0])
      
      const prevTotalMessages = previousAnalytics?.reduce((sum, item) => sum + (item.total_messages || 0), 0) || 0
      const prevTotalConversations = previousAnalytics?.reduce((sum, item) => sum + (item.total_conversations || 0), 0) || 0
      const prevAvgResolution = previousAnalytics && previousAnalytics.length > 0
        ? previousAnalytics.reduce((sum, item) => sum + (item.ai_resolution_rate || 0), 0) / previousAnalytics.length
        : 0
      const prevAvgSatisfaction = previousAnalytics && previousAnalytics.length > 0
        ? previousAnalytics.reduce((sum, item) => sum + (item.customer_satisfaction_avg || 0), 0) / previousAnalytics.length
        : 0
      
      setTrends({
        messages: {
          current: totalMessages,
          previous: prevTotalMessages,
          change: prevTotalMessages > 0 ? ((totalMessages - prevTotalMessages) / prevTotalMessages) * 100 : 0
        },
        conversations: {
          current: totalConversations,
          previous: prevTotalConversations,
          change: prevTotalConversations > 0 ? ((totalConversations - prevTotalConversations) / prevTotalConversations) * 100 : 0
        },
        resolution: {
          current: Math.round(avgResolution),
          previous: Math.round(prevAvgResolution),
          change: prevAvgResolution > 0 ? ((avgResolution - prevAvgResolution) / prevAvgResolution) * 100 : 0
        },
        satisfaction: {
          current: Math.round(avgSatisfaction * 10) / 10,
          previous: Math.round(prevAvgSatisfaction * 10) / 10,
          change: prevAvgSatisfaction > 0 ? ((avgSatisfaction - prevAvgSatisfaction) / prevAvgSatisfaction) * 100 : 0
        }
      })
      
      // Fetch hourly data for the chart
      await fetchHourlyData(chatbotIds, startDate, endDate)
      
      // Fetch top questions
      await fetchTopQuestions(chatbotIds, startDate, endDate)
      
      // Fetch chatbot performance
      await fetchChatbotPerformance(chatbots, startDate, endDate)
      
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setError('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }
  
  const fetchHourlyData = async (chatbotIds: string[], startDate: Date, endDate: Date) => {
    const supabase = createSupabaseClient()
    
    // Generate hourly data for the last 24 hours
    const hourlyStats: HourlyData[] = []
    const now = new Date()
    
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now)
      hour.setHours(now.getHours() - i, 0, 0, 0)
      const nextHour = new Date(hour)
      nextHour.setHours(hour.getHours() + 1)
      
      // Get conversations for this hour first
      const { data: hourConversations } = await supabase
        .from('conversations')
        .select('id')
        .in('chatbot_id', chatbotIds)
        .gte('created_at', hour.toISOString())
        .lt('created_at', nextHour.toISOString())
      
      const conversationIds = hourConversations?.map(conv => conv.id) || []
      
      // Get messages count for this hour
      const { data: messages } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .in('conversation_id', conversationIds)
        .gte('created_at', hour.toISOString())
        .lt('created_at', nextHour.toISOString())
      
      hourlyStats.push({
        hour: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        messages: messages?.length || 0,
        conversations: hourConversations?.length || 0
      })
    }
    
    setHourlyData(hourlyStats)
  }
  
  const fetchTopQuestions = async (chatbotIds: string[], startDate: Date, endDate: Date) => {
    const supabase = createSupabaseClient()
    
    // Get conversations in the date range first
    const { data: dateConversations } = await supabase
      .from('conversations')
      .select('id')
      .in('chatbot_id', chatbotIds)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
    
    const conversationIds = dateConversations?.map(conv => conv.id) || []
    
    // Get messages from conversations in the date range
    const { data: messages } = await supabase
      .from('messages')
      .select('content')
      .eq('sender_type', 'customer')
      .in('conversation_id', conversationIds)
      .limit(1000)
    
    // Simple question analysis (in a real app, you might use AI for better categorization)
    const questionCounts: { [key: string]: { count: number; category: string } } = {}
    
    messages?.forEach(message => {
      if (message.content && message.content.includes('?')) {
        const question = message.content.toLowerCase().trim()
        if (question.length > 10) { // Filter out very short questions
          if (questionCounts[question]) {
            questionCounts[question].count++
          } else {
            // Simple categorization based on keywords
            let category = 'General'
            if (question.includes('bayar') || question.includes('payment') || question.includes('harga')) {
              category = 'Payment'
            } else if (question.includes('kirim') || question.includes('shipping') || question.includes('ongkir')) {
              category = 'Shipping'
            } else if (question.includes('produk') || question.includes('product') || question.includes('tersedia')) {
              category = 'Product'
            } else if (question.includes('return') || question.includes('kembali') || question.includes('tukar')) {
              category = 'Returns'
            }
            
            questionCounts[question] = { count: 1, category }
          }
        }
      }
    })
    
    // Convert to array and sort by count
    const topQuestionsArray = Object.entries(questionCounts)
      .map(([question, data]) => ({
        question: question.charAt(0).toUpperCase() + question.slice(1),
        count: data.count,
        category: data.category
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    
    setTopQuestions(topQuestionsArray)
  }
  
  const fetchChatbotPerformance = async (chatbots: any[], startDate: Date, endDate: Date) => {
    const supabase = createSupabaseClient()
    
    const performance: ChatbotPerformance[] = []
    
    for (const chatbot of chatbots) {
      // Get analytics for this chatbot
      const { data: analytics } = await supabase
        .from('conversation_analytics')
        .select('*')
        .eq('chatbot_id', chatbot.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
      
      const totalMessages = analytics?.reduce((sum, item) => sum + (item.total_messages || 0), 0) || 0
      const avgResolution = analytics && analytics.length > 0
        ? analytics.reduce((sum, item) => sum + (item.ai_resolution_rate || 0), 0) / analytics.length
        : 0
      const avgSatisfaction = analytics && analytics.length > 0
        ? analytics.reduce((sum, item) => sum + (item.customer_satisfaction_avg || 0), 0) / analytics.length
        : 0
      
      performance.push({
        name: chatbot.name,
        messages: totalMessages,
        resolution_rate: Math.round(avgResolution),
        satisfaction: Math.round(avgSatisfaction * 10) / 10
      })
    }
    
    setChatbotPerformance(performance)
  }
  
  // Fetch data when component mounts or time range changes
  useEffect(() => {
    if (user) {
      fetchAnalytics()
    }
  }, [user, timeRange])

  const getMaxValue = () => {
    const values = hourlyData.map(d => 
      selectedMetric === 'messages' ? d.messages : d.conversations
    )
    return Math.max(...values)
  }

  const maxValue = getMaxValue()

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="h-12 w-12 text-red-500 mx-auto mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analytics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchAnalytics}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-gray-600">Monitor performa chatbot dan analisis percakapan pelanggan</p>
        </div>
        
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange} disabled={isLoading}>
            <SelectTrigger className="w-[140px]">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">24 Jam</SelectItem>
              <SelectItem value="7d">7 Hari</SelectItem>
              <SelectItem value="30d">30 Hari</SelectItem>
              <SelectItem value="90d">90 Hari</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" disabled={isLoading}>
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pesan</CardTitle>
            <ChatBubbleLeftRightIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : analytics?.totalMessages.toLocaleString() || 0}</div>
            <div className="flex items-center space-x-1 text-xs">
              {!isLoading && trends && getTrendIcon(trends.messages.change)}
              <span className={!isLoading && trends ? getTrendColor(trends.messages.change) : 'text-gray-600'}>
                {!isLoading && trends ? formatChange(trends.messages.change) : '...'} dari periode sebelumnya
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Percakapan</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : analytics?.totalConversations || 0}</div>
            <div className="flex items-center space-x-1 text-xs">
              {!isLoading && trends && getTrendIcon(trends.conversations.change)}
              <span className={!isLoading && trends ? getTrendColor(trends.conversations.change) : 'text-gray-600'}>
                {!isLoading && trends ? formatChange(trends.conversations.change) : '...'} dari periode sebelumnya
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Resolution</CardTitle>
            <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : analytics?.aiResolutionRate || 0}%</div>
            <div className="flex items-center space-x-1 text-xs">
              {!isLoading && trends && getTrendIcon(trends.resolution.change)}
              <span className={!isLoading && trends ? getTrendColor(trends.resolution.change) : 'text-gray-600'}>
                {!isLoading && trends ? formatChange(trends.resolution.change) : '...'} dari periode sebelumnya
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : analytics?.avgResponseTime || 0}s</div>
            <p className="text-xs text-muted-foreground">
              Waktu respon rata-rata
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : analytics?.customerSatisfaction || 0}/5</div>
            <div className="flex items-center space-x-1 text-xs">
              {!isLoading && trends && getTrendIcon(trends.satisfaction.change)}
              <span className={!isLoading && trends ? getTrendColor(trends.satisfaction.change) : 'text-gray-600'}>
                {!isLoading && trends ? formatChange(trends.satisfaction.change) : '...'} dari periode sebelumnya
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : analytics?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Pengguna aktif {timeRange === '1d' ? 'hari ini' : 'periode ini'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Aktivitas per Jam</CardTitle>
              <CardDescription>Distribusi pesan dan percakapan sepanjang hari</CardDescription>
            </div>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="messages">Pesan</SelectItem>
                <SelectItem value="conversations">Percakapan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-24 gap-1 h-32">
              {hourlyData.map((data, index) => {
                const value = selectedMetric === 'messages' ? data.messages : data.conversations
                const height = maxValue > 0 ? (value / maxValue) * 100 : 0
                
                return (
                  <div key={index} className="flex flex-col justify-end">
                    <div
                      className="bg-blue-500 rounded-t transition-all hover:bg-blue-600 cursor-pointer"
                      style={{ height: `${height}%` }}
                      title={`${data.hour}: ${value} ${selectedMetric === 'messages' ? 'pesan' : 'percakapan'}`}
                    />
                  </div>
                )
              })}
            </div>
            <div className="grid grid-cols-6 text-xs text-gray-500">
              <span>00:00</span>
              <span>04:00</span>
              <span>08:00</span>
              <span>12:00</span>
              <span>16:00</span>
              <span>20:00</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Pertanyaan Paling Sering</CardTitle>
            <CardDescription>Topik yang paling banyak ditanyakan pelanggan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-4 text-gray-500">Loading...</div>
              ) : topQuestions.length > 0 ? (
                topQuestions.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.question}</p>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{item.count}</p>
                      <p className="text-xs text-gray-500">kali</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">Tidak ada data pertanyaan</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chatbot Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performa Chatbot</CardTitle>
            <CardDescription>Statistik masing-masing chatbot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-4 text-gray-500">Loading...</div>
              ) : chatbotPerformance.length > 0 ? (
                chatbotPerformance.map((bot, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">{bot.name}</h4>
                      <span className="text-sm text-gray-500">{bot.messages} pesan</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Resolution Rate</span>
                        <span className="font-medium">{bot.resolution_rate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${bot.resolution_rate}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Satisfaction</span>
                        <span className="font-medium">⭐ {bot.satisfaction}/5</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">Tidak ada data chatbot</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Insights & Rekomendasi</CardTitle>
          <CardDescription>Analisis otomatis dan saran untuk meningkatkan performa</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-gray-500">Loading insights...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics && analytics.aiResolutionRate >= 75 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-green-900">Performa Bagus</h4>
                  </div>
                  <p className="text-sm text-green-800">
                    AI resolution rate Anda {analytics.aiResolutionRate}% - di atas rata-rata industri (75%). 
                    Chatbot berhasil menangani sebagian besar pertanyaan pelanggan.
                  </p>
                </div>
              )}
              
              {hourlyData.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <ClockIcon className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-blue-900">Peak Hours</h4>
                  </div>
                  <p className="text-sm text-blue-800">
                    Aktivitas tertinggi terjadi pada jam-jam tertentu. 
                    Pertimbangkan untuk menambah kapasitas AI pada jam tersebut.
                  </p>
                </div>
              )}
              
              {topQuestions.length > 0 && topQuestions[0] && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-medium text-yellow-900">Opportunity</h4>
                  </div>
                  <p className="text-sm text-yellow-800">
                    {topQuestions[0].count} pertanyaan tentang {topQuestions[0].category.toLowerCase()} menunjukkan kebutuhan FAQ yang lebih detail. 
                    Tambahkan informasi {topQuestions[0].category.toLowerCase()} di knowledge base.
                  </p>
                </div>
              )}
              
              {analytics && analytics.customerSatisfaction > 0 && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <UserIcon className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium text-purple-900">Customer Satisfaction</h4>
                  </div>
                  <p className="text-sm text-purple-800">
                    Rating {analytics.customerSatisfaction}/5 {analytics.customerSatisfaction >= 4 ? 'menunjukkan kepuasan tinggi' : 'perlu ditingkatkan'}. 
                    {analytics.customerSatisfaction >= 4 ? 'Pertahankan kualitas respon dan tingkatkan personalisasi.' : 'Fokus pada peningkatan kualitas respon chatbot.'}
                  </p>
                </div>
              )}
              
              {!analytics && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Tidak ada data untuk menampilkan insights. Mulai gunakan chatbot untuk melihat analisis.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}