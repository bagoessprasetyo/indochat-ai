'use client'

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
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const { user, profile } = useRequireAuth()

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Selamat datang, {profile.business_name}! 👋
        </h1>
        <p className="text-blue-100 mb-4">
          Kelola customer service WhatsApp Anda dengan kecerdasan buatan
        </p>
        <div className="flex flex-wrap gap-4">
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-blue-100">Chatbot Aktif</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-blue-100">Pesan Hari Ini</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-blue-100">Pelanggan Aktif</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buat Chatbot Baru</CardTitle>
            <PlusIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">+</div>
            <p className="text-xs text-muted-foreground">
              Setup AI assistant untuk WhatsApp
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Percakapan</CardTitle>
            <ChatBubbleLeftRightIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Lihat semua chat aktif
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analytics</CardTitle>
            <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">📊</div>
            <p className="text-xs text-muted-foreground">
              Laporan performa bisnis
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengaturan</CardTitle>
            <CogIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">⚙️</div>
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
            
            <Button className="w-full mt-4">
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
            <div className="text-center py-8 text-muted-foreground">
              <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada aktivitas</p>
              <p className="text-sm">Aktivitas akan muncul setelah Anda setup WhatsApp</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Bisnis</CardTitle>
          <CardDescription>
            Detail bisnis Anda yang terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nama Bisnis</label>
              <p className="font-medium">{profile.business_name || 'Belum diatur'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Jenis Bisnis</label>
              <p className="font-medium">{profile.business_type || 'Belum diatur'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nomor Telepon</label>
              <p className="font-medium">{profile.phone_number || 'Belum diatur'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Alamat</label>
              <p className="font-medium">{profile.address || 'Belum diatur'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Paket Berlangganan</label>
              <Badge variant="outline">
                {profile.subscription_plan || 'Free'}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Badge variant={profile.subscription_status === 'active' ? 'default' : 'secondary'}>
                {profile.subscription_status || 'inactive'}
              </Badge>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline">
              Edit Informasi Bisnis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}