'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  UserIcon,
  CogIcon,
  KeyIcon,
  BellIcon,
  ShieldCheckIcon,
  LinkIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline'
import { useRequireAuth } from '@/contexts/auth-context'

export default function SettingsPage() {
  const { user, profile } = useRequireAuth()
  const [showApiKey, setShowApiKey] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    business_name: profile?.business_name || '',
    phone_number: profile?.phone_number || '',
    business_type: profile?.business_type || '',
    address: profile?.address || '',
    city: profile?.city || '',
    province: profile?.province || '',
    postal_code: profile?.postal_code || '',
  })
  
  // Notification settings state
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    marketing_emails: false,
    new_message_alerts: true,
    daily_reports: true,
    weekly_reports: false,
  })
  
  // API settings state
  const [apiSettings, setApiSettings] = useState({
    whatsapp_token: '••••••••••••••••••••••••••••••••',
    whatsapp_phone_id: '••••••••••••••••',
    webhook_url: 'https://your-app.com/webhook',
    verify_token: '••••••••••••••••',
  })
  
  // AI settings state
  const [aiSettings, setAiSettings] = useState({
    default_language: 'indonesian',
    response_tone: 'friendly',
    max_response_length: 500,
    enable_learning: true,
    fallback_to_human: true,
    confidence_threshold: 0.8,
  })

  const handleSaveProfile = () => {
    // TODO: Implement profile update
    console.log('Saving profile:', profileForm)
  }
  
  const handleSaveNotifications = () => {
    // TODO: Implement notification settings update
    console.log('Saving notifications:', notifications)
  }
  
  const handleSaveApiSettings = () => {
    // TODO: Implement API settings update
    console.log('Saving API settings:', apiSettings)
  }
  
  const handleSaveAiSettings = () => {
    // TODO: Implement AI settings update
    console.log('Saving AI settings:', aiSettings)
  }
  
  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    console.log('Deleting account')
    setIsDeleteDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-gray-600">Kelola akun, chatbot, dan integrasi Anda</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <UserIcon className="h-4 w-4" />
            <span>Profil</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <BellIcon className="h-4 w-4" />
            <span>Notifikasi</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center space-x-2">
            <KeyIcon className="h-4 w-4" />
            <span>API & Integrasi</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center space-x-2">
            <CogIcon className="h-4 w-4" />
            <span>AI Settings</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <ShieldCheckIcon className="h-4 w-4" />
            <span>Keamanan</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Profil</CardTitle>
              <CardDescription>
                Update informasi profil dan bisnis Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Nama Bisnis</Label>
                  <Input
                    id="business_name"
                    value={profileForm.business_name}
                    onChange={(e) => setProfileForm({...profileForm, business_name: e.target.value})}
                    placeholder="Masukkan nama bisnis"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Nomor Telepon</Label>
                  <Input
                    id="phone_number"
                    value={profileForm.phone_number}
                    onChange={(e) => setProfileForm({...profileForm, phone_number: e.target.value})}
                    placeholder="+62812345678"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="business_type">Jenis Bisnis</Label>
                  <Select
                    value={profileForm.business_type}
                    onValueChange={(value) => setProfileForm({...profileForm, business_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis bisnis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="service">Jasa/Service</SelectItem>
                      <SelectItem value="restaurant">Restoran/F&B</SelectItem>
                      <SelectItem value="education">Pendidikan</SelectItem>
                      <SelectItem value="healthcare">Kesehatan</SelectItem>
                      <SelectItem value="other">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Alamat</Label>
                  <Input
                    id="address"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                    placeholder="Masukkan alamat lengkap"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">Kota</Label>
                  <Input
                    id="city"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
                    placeholder="Masukkan kota"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="province">Provinsi</Label>
                  <Input
                    id="province"
                    value={profileForm.province}
                    onChange={(e) => setProfileForm({...profileForm, province: e.target.value})}
                    placeholder="Masukkan provinsi"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Kode Pos</Label>
                  <Input
                    id="postal_code"
                    value={profileForm.postal_code}
                    onChange={(e) => setProfileForm({...profileForm, postal_code: e.target.value})}
                    placeholder="Masukkan kode pos"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile}>
                  Simpan Perubahan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Notifikasi</CardTitle>
              <CardDescription>
                Atur bagaimana Anda ingin menerima notifikasi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">Terima notifikasi melalui email</p>
                  </div>
                  <Switch
                    checked={notifications.email_notifications}
                    onCheckedChange={(checked) => setNotifications({...notifications, email_notifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-gray-500">Terima notifikasi melalui SMS</p>
                  </div>
                  <Switch
                    checked={notifications.sms_notifications}
                    onCheckedChange={(checked) => setNotifications({...notifications, sms_notifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-500">Terima notifikasi push di browser</p>
                  </div>
                  <Switch
                    checked={notifications.push_notifications}
                    onCheckedChange={(checked) => setNotifications({...notifications, push_notifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-gray-500">Terima email tentang fitur baru dan tips</p>
                  </div>
                  <Switch
                    checked={notifications.marketing_emails}
                    onCheckedChange={(checked) => setNotifications({...notifications, marketing_emails: checked})}
                  />
                </div>
              </div>
              
              <hr />
              
              <div className="space-y-4">
                <h4 className="font-medium">Notifikasi Chatbot</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alert Pesan Baru</Label>
                    <p className="text-sm text-gray-500">Notifikasi saat ada pesan baru dari pelanggan</p>
                  </div>
                  <Switch
                    checked={notifications.new_message_alerts}
                    onCheckedChange={(checked) => setNotifications({...notifications, new_message_alerts: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Laporan Harian</Label>
                    <p className="text-sm text-gray-500">Ringkasan aktivitas chatbot setiap hari</p>
                  </div>
                  <Switch
                    checked={notifications.daily_reports}
                    onCheckedChange={(checked) => setNotifications({...notifications, daily_reports: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Laporan Mingguan</Label>
                    <p className="text-sm text-gray-500">Analisis performa chatbot setiap minggu</p>
                  </div>
                  <Switch
                    checked={notifications.weekly_reports}
                    onCheckedChange={(checked) => setNotifications({...notifications, weekly_reports: checked})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications}>
                  Simpan Pengaturan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API & Integration Settings */}
        <TabsContent value="api">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>WhatsApp Business API</CardTitle>
                <CardDescription>
                  Konfigurasi koneksi dengan WhatsApp Business API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp_token">Access Token</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="whatsapp_token"
                      type={showApiKey ? 'text' : 'password'}
                      value={apiSettings.whatsapp_token}
                      onChange={(e) => setApiSettings({...apiSettings, whatsapp_token: e.target.value})}
                      placeholder="Masukkan WhatsApp Access Token"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="whatsapp_phone_id">Phone Number ID</Label>
                  <Input
                    id="whatsapp_phone_id"
                    value={apiSettings.whatsapp_phone_id}
                    onChange={(e) => setApiSettings({...apiSettings, whatsapp_phone_id: e.target.value})}
                    placeholder="Masukkan Phone Number ID"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhook_url">Webhook URL</Label>
                  <Input
                    id="webhook_url"
                    value={apiSettings.webhook_url}
                    onChange={(e) => setApiSettings({...apiSettings, webhook_url: e.target.value})}
                    placeholder="https://your-app.com/webhook"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="verify_token">Verify Token</Label>
                  <Input
                    id="verify_token"
                    type="password"
                    value={apiSettings.verify_token}
                    onChange={(e) => setApiSettings({...apiSettings, verify_token: e.target.value})}
                    placeholder="Masukkan Verify Token"
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSaveApiSettings}>
                    Simpan Konfigurasi
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Integrasi Lainnya</CardTitle>
                <CardDescription>
                  Hubungkan dengan platform dan tools lainnya
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <LinkIcon className="h-8 w-8 text-gray-400" />
                      <div>
                        <h4 className="font-medium">Google Sheets</h4>
                        <p className="text-sm text-gray-500">Export data percakapan ke Google Sheets</p>
                      </div>
                    </div>
                    <Button variant="outline">Hubungkan</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <LinkIcon className="h-8 w-8 text-gray-400" />
                      <div>
                        <h4 className="font-medium">Zapier</h4>
                        <p className="text-sm text-gray-500">Otomatisasi workflow dengan 5000+ apps</p>
                      </div>
                    </div>
                    <Button variant="outline">Hubungkan</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <LinkIcon className="h-8 w-8 text-gray-400" />
                      <div>
                        <h4 className="font-medium">Slack</h4>
                        <p className="text-sm text-gray-500">Terima notifikasi di channel Slack</p>
                      </div>
                    </div>
                    <Button variant="outline">Hubungkan</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Settings */}
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan AI</CardTitle>
              <CardDescription>
                Kustomisasi perilaku dan respons AI chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default_language">Bahasa Default</Label>
                  <Select
                    value={aiSettings.default_language}
                    onValueChange={(value) => setAiSettings({...aiSettings, default_language: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="indonesian">Bahasa Indonesia</SelectItem>
                      <SelectItem value="javanese">Bahasa Jawa</SelectItem>
                      <SelectItem value="sundanese">Bahasa Sunda</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="response_tone">Tone Respons</Label>
                  <Select
                    value={aiSettings.response_tone}
                    onValueChange={(value) => setAiSettings({...aiSettings, response_tone: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendly">Ramah & Santai</SelectItem>
                      <SelectItem value="professional">Profesional</SelectItem>
                      <SelectItem value="enthusiastic">Antusias</SelectItem>
                      <SelectItem value="helpful">Sangat Membantu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max_response_length">Panjang Respons Maksimal</Label>
                  <Input
                    id="max_response_length"
                    type="number"
                    value={aiSettings.max_response_length}
                    onChange={(e) => setAiSettings({...aiSettings, max_response_length: parseInt(e.target.value)})}
                    placeholder="500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confidence_threshold">Confidence Threshold</Label>
                  <Input
                    id="confidence_threshold"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={aiSettings.confidence_threshold}
                    onChange={(e) => setAiSettings({...aiSettings, confidence_threshold: parseFloat(e.target.value)})}
                    placeholder="0.8"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Learning</Label>
                    <p className="text-sm text-gray-500">AI akan belajar dari percakapan untuk meningkatkan respons</p>
                  </div>
                  <Switch
                    checked={aiSettings.enable_learning}
                    onCheckedChange={(checked) => setAiSettings({...aiSettings, enable_learning: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Fallback to Human</Label>
                    <p className="text-sm text-gray-500">Alihkan ke manusia jika AI tidak yakin dengan respons</p>
                  </div>
                  <Switch
                    checked={aiSettings.fallback_to_human}
                    onCheckedChange={(checked) => setAiSettings({...aiSettings, fallback_to_human: checked})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveAiSettings}>
                  Simpan Pengaturan AI
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Keamanan Akun</CardTitle>
                <CardDescription>
                  Kelola keamanan dan privasi akun Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password">Password Saat Ini</Label>
                  <Input
                    id="current_password"
                    type="password"
                    placeholder="Masukkan password saat ini"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new_password">Password Baru</Label>
                  <Input
                    id="new_password"
                    type="password"
                    placeholder="Masukkan password baru"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Konfirmasi Password Baru</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    placeholder="Konfirmasi password baru"
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button>Update Password</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>
                  Tindakan yang tidak dapat dibatalkan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-red-600">Hapus Akun</h4>
                    <p className="text-sm text-gray-500">
                      Hapus akun dan semua data secara permanen. Tindakan ini tidak dapat dibatalkan.
                    </p>
                  </div>
                  
                  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Hapus Akun
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus Akun</DialogTitle>
                        <DialogDescription>
                          Apakah Anda yakin ingin menghapus akun? Semua data termasuk chatbot, 
                          percakapan, dan pengaturan akan dihapus secara permanen.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="delete_confirmation">Ketik "DELETE" untuk konfirmasi</Label>
                          <Input
                            id="delete_confirmation"
                            placeholder="DELETE"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                          Batal
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteAccount}>
                          Hapus Akun Permanen
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}