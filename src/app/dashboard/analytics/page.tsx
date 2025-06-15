'use client'

import { useState } from 'react'
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

// Mock data - will be replaced with real analytics from Supabase
const mockAnalytics = {
  overview: {
    totalMessages: 1247,
    totalConversations: 89,
    aiResolutionRate: 87,
    avgResponseTime: 2.3,
    customerSatisfaction: 4.2,
    activeUsers: 156,
  },
  trends: {
    messages: { current: 1247, previous: 1089, change: 14.5 },
    conversations: { current: 89, previous: 76, change: 17.1 },
    resolution: { current: 87, previous: 82, change: 6.1 },
    satisfaction: { current: 4.2, previous: 4.0, change: 5.0 },
  },
  hourlyData: [
    { hour: '00:00', messages: 12, conversations: 3 },
    { hour: '01:00', messages: 8, conversations: 2 },
    { hour: '02:00', messages: 5, conversations: 1 },
    { hour: '03:00', messages: 3, conversations: 1 },
    { hour: '04:00', messages: 7, conversations: 2 },
    { hour: '05:00', messages: 15, conversations: 4 },
    { hour: '06:00', messages: 28, conversations: 8 },
    { hour: '07:00', messages: 45, conversations: 12 },
    { hour: '08:00', messages: 67, conversations: 18 },
    { hour: '09:00', messages: 89, conversations: 24 },
    { hour: '10:00', messages: 95, conversations: 26 },
    { hour: '11:00', messages: 87, conversations: 23 },
    { hour: '12:00', messages: 76, conversations: 20 },
    { hour: '13:00', messages: 82, conversations: 22 },
    { hour: '14:00', messages: 91, conversations: 25 },
    { hour: '15:00', messages: 88, conversations: 24 },
    { hour: '16:00', messages: 79, conversations: 21 },
    { hour: '17:00', messages: 65, conversations: 17 },
    { hour: '18:00', messages: 52, conversations: 14 },
    { hour: '19:00', messages: 41, conversations: 11 },
    { hour: '20:00', messages: 33, conversations: 9 },
    { hour: '21:00', messages: 25, conversations: 7 },
    { hour: '22:00', messages: 18, conversations: 5 },
    { hour: '23:00', messages: 14, conversations: 4 },
  ],
  topQuestions: [
    { question: 'Bagaimana cara melakukan pembayaran?', count: 45, category: 'Payment' },
    { question: 'Kapan pesanan saya akan dikirim?', count: 38, category: 'Shipping' },
    { question: 'Apakah produk ini masih tersedia?', count: 32, category: 'Product' },
    { question: 'Bagaimana cara mengembalikan barang?', count: 28, category: 'Returns' },
    { question: 'Berapa ongkos kirim ke Jakarta?', count: 24, category: 'Shipping' },
  ],
  chatbotPerformance: [
    { name: 'Customer Service Bot', messages: 756, resolution_rate: 89, satisfaction: 4.3 },
    { name: 'Sales Assistant', messages: 491, resolution_rate: 84, satisfaction: 4.1 },
  ],
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d')
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

  const getMaxValue = () => {
    const values = mockAnalytics.hourlyData.map(d => 
      selectedMetric === 'messages' ? d.messages : d.conversations
    )
    return Math.max(...values)
  }

  const maxValue = getMaxValue()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-gray-600">Monitor performa chatbot dan analisis percakapan pelanggan</p>
        </div>
        
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
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
          
          <Button variant="outline">
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
            <div className="text-2xl font-bold">{mockAnalytics.overview.totalMessages.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(mockAnalytics.trends.messages.change)}
              <span className={getTrendColor(mockAnalytics.trends.messages.change)}>
                {formatChange(mockAnalytics.trends.messages.change)} dari periode sebelumnya
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
            <div className="text-2xl font-bold">{mockAnalytics.overview.totalConversations}</div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(mockAnalytics.trends.conversations.change)}
              <span className={getTrendColor(mockAnalytics.trends.conversations.change)}>
                {formatChange(mockAnalytics.trends.conversations.change)} dari periode sebelumnya
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
            <div className="text-2xl font-bold">{mockAnalytics.overview.aiResolutionRate}%</div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(mockAnalytics.trends.resolution.change)}
              <span className={getTrendColor(mockAnalytics.trends.resolution.change)}>
                {formatChange(mockAnalytics.trends.resolution.change)} dari periode sebelumnya
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
            <div className="text-2xl font-bold">{mockAnalytics.overview.avgResponseTime}s</div>
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
            <div className="text-2xl font-bold">{mockAnalytics.overview.customerSatisfaction}/5</div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(mockAnalytics.trends.satisfaction.change)}
              <span className={getTrendColor(mockAnalytics.trends.satisfaction.change)}>
                {formatChange(mockAnalytics.trends.satisfaction.change)} dari periode sebelumnya
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
            <div className="text-2xl font-bold">{mockAnalytics.overview.activeUsers}</div>
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
              {mockAnalytics.hourlyData.map((data, index) => {
                const value = selectedMetric === 'messages' ? data.messages : data.conversations
                const height = (value / maxValue) * 100
                
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
              {mockAnalytics.topQuestions.map((item, index) => (
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
              ))}
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
              {mockAnalytics.chatbotPerformance.map((bot, index) => (
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
              ))}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-900">Performa Bagus</h4>
              </div>
              <p className="text-sm text-green-800">
                AI resolution rate Anda 87% - di atas rata-rata industri (75%). 
                Chatbot berhasil menangani sebagian besar pertanyaan pelanggan.
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <ClockIcon className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Peak Hours</h4>
              </div>
              <p className="text-sm text-blue-800">
                Aktivitas tertinggi terjadi pukul 09:00-15:00. 
                Pertimbangkan untuk menambah kapasitas AI pada jam tersebut.
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-yellow-600" />
                <h4 className="font-medium text-yellow-900">Opportunity</h4>
              </div>
              <p className="text-sm text-yellow-800">
                45 pertanyaan tentang pembayaran menunjukkan kebutuhan FAQ yang lebih detail. 
                Tambahkan informasi pembayaran di knowledge base.
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <UserIcon className="h-5 w-5 text-purple-600" />
                <h4 className="font-medium text-purple-900">Customer Satisfaction</h4>
              </div>
              <p className="text-sm text-purple-800">
                Rating 4.2/5 menunjukkan kepuasan tinggi. 
                Pertahankan kualitas respon dan tingkatkan personalisasi.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}