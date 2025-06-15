'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { PlusIcon } from '@heroicons/react/24/outline'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useRequireAuth } from '@/contexts/auth-context'
import { z } from 'zod'
import { Bot, CheckCircle, MessageCircle, TrendingUp, Plus, PauseIcon, PlayIcon, PencilIcon, TrashIcon, MessageSquare } from 'lucide-react'

// Validation schema for chatbot form
const chatbotSchema = z.object({
  name: z.string().min(1, 'Nama chatbot wajib diisi').max(100, 'Nama terlalu panjang'),
  whatsapp_number: z.string().min(1, 'Nomor WhatsApp wajib diisi').regex(/^\+?[1-9]\d{1,14}$/, 'Format nomor WhatsApp tidak valid'),
  business_description: z.string().min(1, 'Deskripsi bisnis wajib diisi').max(500, 'Deskripsi terlalu panjang'),
  ai_personality: z.string().min(1, 'Kepribadian AI wajib diisi').max(1000, 'Kepribadian terlalu panjang'),
})

type ChatbotFormData = z.infer<typeof chatbotSchema>

// Updated interface to match actual database schema
interface Chatbot {
  id: string
  user_id: string | null
  name: string
  whatsapp_number: string | null
  whatsapp_business_account_id: string | null
  business_description: string | null
  ai_personality: string | null
  business_hours: any | null
  auto_reply_enabled: boolean | null
  human_handover_keywords: string[] | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
}

export default function ChatbotsPage() {
  const { user, profile } = useRequireAuth()
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testingChatbot, setTestingChatbot] = useState<string | null>(null)
  const [testMessage, setTestMessage] = useState('')
  const [testResponse, setTestResponse] = useState<string | null>(null)
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [formData, setFormData] = useState<ChatbotFormData>({
    name: '',
    whatsapp_number: '',
    business_description: '',
    ai_personality: 'Asisten customer service yang ramah dan profesional. Selalu menjawab dalam Bahasa Indonesia dengan sopan dan membantu.',
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ChatbotFormData, string>>>({})

  // Use the global authenticated supabase client

  // Fetch chatbots from database
  const fetchChatbots = async () => {
    if (!user?.id) {
      console.log('No user ID available for fetching chatbots')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      console.log('Fetching chatbots for user:', user.id)
      
      const { data, error } = await supabase
        .from('chatbots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching chatbots:', error)
        toast.error('Gagal memuat data chatbot: ' + error.message)
        return
      }

      console.log('Fetched chatbots:', data)
      setChatbots(data || [])
    } catch (error) {
      console.error('Error fetching chatbots:', error)
      toast.error('Gagal memuat data chatbot')
    } finally {
      setIsLoading(false)
    }
  }

  // Load chatbots on component mount
  useEffect(() => {
    if (user?.id) {
      fetchChatbots()
    }
  }, [user?.id])

  // Validate form data
  const validateForm = (data: ChatbotFormData): boolean => {
    try {
      chatbotSchema.parse(data)
      setFormErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof ChatbotFormData, string>> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as keyof ChatbotFormData] = err.message
          }
        })
        setFormErrors(errors)
      }
      return false
    }
  }

  // Handle form input changes
  const handleInputChange = (field: keyof ChatbotFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Create new chatbot
  const handleCreateChatbot = async () => {
    if (!user?.id) {
      toast.error('Tidak ada user yang terautentikasi')
      return
    }

    if (!validateForm(formData)) {
      toast.error('Mohon perbaiki kesalahan pada form')
      return
    }

    try {
      setIsSubmitting(true)
      
      console.log('Creating chatbot for user:', user.id)
      console.log('Form data:', formData)
      
      const insertData = {
        user_id: user.id, // Use the authenticated user's ID
        name: formData.name,
        whatsapp_number: formData.whatsapp_number,
        business_description: formData.business_description,
        ai_personality: formData.ai_personality,
        is_active: false, // Start as inactive
      }
      
      console.log('Insert data:', insertData)
      
      const { data, error } = await supabase
        .from('chatbots')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error('Error creating chatbot:', error)
        toast.error('Gagal membuat chatbot: ' + error.message)
        return
      }

      console.log('Created chatbot:', data)
      
      // Add new chatbot to state
      setChatbots(prev => [data, ...prev])
      
      // Reset form
      setFormData({
        name: '',
        whatsapp_number: '',
        business_description: '',
        ai_personality: 'Asisten customer service yang ramah dan profesional. Selalu menjawab dalam Bahasa Indonesia dengan sopan dan membantu.',
      })
      setFormErrors({})
      setIsCreateDialogOpen(false)
      
      toast.success('Chatbot berhasil dibuat!')
    } catch (error) {
      console.error('Error creating chatbot:', error)
      toast.error('Gagal membuat chatbot')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Toggle chatbot status
  const toggleChatbotStatus = async (id: string) => {
    const chatbot = chatbots.find(bot => bot.id === id)
    if (!chatbot) return

    try {
      const newStatus = !chatbot.is_active
      
      const { error } = await supabase
        .from('chatbots')
        .update({ 
          is_active: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('user_id', user?.id || '') // Ensure user owns this chatbot

      if (error) {
        console.error('Error updating chatbot status:', error)
        toast.error('Gagal mengubah status chatbot: ' + error.message)
        return
      }

      // Update state
      setChatbots(prev => prev.map(bot => 
        bot.id === id ? { ...bot, is_active: newStatus } : bot
      ))
      
      toast.success(`Chatbot ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`)
    } catch (error) {
      console.error('Error updating chatbot status:', error)
      toast.error('Gagal mengubah status chatbot')
    }
  }

  // Delete chatbot
  const deleteChatbot = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus chatbot ini? Tindakan ini tidak dapat dibatalkan.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('chatbots')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id || '') // Ensure user owns this chatbot

      if (error) {
        console.error('Error deleting chatbot:', error)
        toast.error('Gagal menghapus chatbot: ' + error.message)
        return
      }

      // Remove from state
      setChatbots(prev => prev.filter(bot => bot.id !== id))
      toast.success('Chatbot berhasil dihapus')
    } catch (error) {
      console.error('Error deleting chatbot:', error)
      toast.error('Gagal menghapus chatbot')
    }
  }

  const testAI = async (chatbotId: string) => {
    if (!testMessage.trim()) {
      toast.error('Masukkan pesan untuk ditest')
      return
    }

    try {
      setTestingChatbot(chatbotId)
      setTestResponse(null)
      
      const response = await fetch('/api/test-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: testMessage,
          chatbotId: chatbotId,
          testType: 'basic'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to test AI')
      }

      setTestResponse(data.response)
      toast.success(`AI Response generated! Tokens used: ${data.tokensUsed}, Cost: Rp ${(data.cost || 0).toFixed(2)}`)
    } catch (error) {
      console.error('Error testing AI:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal menguji AI')
    } finally {
      setTestingChatbot(null)
    }
  }

  const openTestDialog = (chatbotId: string) => {
    setTestingChatbot(chatbotId)
    setTestMessage('')
    setTestResponse(null)
    setIsTestDialogOpen(true)
  }

  // Show auth debug info if not authenticated
  // if (!user) {
  //   return (
  //     <div className="space-y-6">
  //       <div className="flex justify-between items-center">
  //         <div>
  //           <h1 className="text-3xl font-bold tracking-tight">Chatbots</h1>
  //           <p className="text-muted-foreground">
  //             Kelola chatbot AI untuk WhatsApp Business Anda
  //           </p>
  //         </div>
  //       </div>
  //       <Card>
  //         <CardHeader>
  //           <CardTitle>Authentication Required</CardTitle>
  //           <CardDescription>
  //             Anda perlu login untuk mengakses halaman ini.
  //           </CardDescription>
  //         </CardHeader>
  //         <CardContent>
  //           <div className="space-y-2">
  //             <p><strong>Auth Debug Info:</strong></p>
  //             <pre className="text-xs bg-gray-100 p-2 rounded">
  //               {JSON.stringify(authDebug, null, 2)}
  //             </pre>
  //           </div>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   )
  // }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chatbots</h1>
            <p className="text-muted-foreground">
              Kelola chatbot AI untuk WhatsApp Business Anda
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Memuat data chatbot...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        {/* <div> */}
          <h1 className="text-3xl font-bold tracking-tight">Chatbots</h1>
          <p className="text-muted-foreground">
            Kelola chatbot AI untuk WhatsApp Business Anda
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Buat Chatbot Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Buat Chatbot Baru</DialogTitle>
              <DialogDescription>
                Buat chatbot AI untuk melayani pelanggan Anda di WhatsApp
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Chatbot *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Contoh: Customer Service Bot"
                  className={formErrors.name ? 'border-red-500' : ''}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="whatsapp_number">Nomor WhatsApp *</Label>
                <Input
                  id="whatsapp_number"
                  value={formData.whatsapp_number}
                  onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                  placeholder="+628123456789"
                  className={formErrors.whatsapp_number ? 'border-red-500' : ''}
                />
                {formErrors.whatsapp_number && (
                  <p className="text-sm text-red-500">{formErrors.whatsapp_number}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="business_description">Deskripsi Bisnis *</Label>
                <Textarea
                  id="business_description"
                  value={formData.business_description}
                  onChange={(e) => handleInputChange('business_description', e.target.value)}
                  placeholder="Jelaskan bisnis Anda, produk/layanan yang ditawarkan, dan informasi penting lainnya"
                  rows={3}
                  className={formErrors.business_description ? 'border-red-500' : ''}
                />
                {formErrors.business_description && (
                  <p className="text-sm text-red-500">{formErrors.business_description}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="ai_personality">Kepribadian AI *</Label>
                <Textarea
                  id="ai_personality"
                  value={formData.ai_personality}
                  onChange={(e) => handleInputChange('ai_personality', e.target.value)}
                  placeholder="Jelaskan bagaimana AI harus berperilaku dan merespons pelanggan"
                  rows={4}
                  className={formErrors.ai_personality ? 'border-red-500' : ''}
                />
                {formErrors.ai_personality && (
                  <p className="text-sm text-red-500">{formErrors.ai_personality}</p>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button 
                onClick={handleCreateChatbot}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Membuat...
                  </>
                ) : (
                  'Buat Chatbot'
                )}
              </Button>
            </div>
          </DialogContent>
      </Dialog>

      {/* Test AI Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Test AI Chatbot</DialogTitle>
            <DialogDescription>
              Test your chatbot's AI responses with a sample message.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="test-message" className="block text-sm font-medium text-gray-700 mb-2">
                Test Message
              </label>
              <textarea
                id="test-message"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Enter a message to test the AI response..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
            
            {testResponse && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Response
                </label>
                <div className="bg-gray-50 p-3 rounded-md border">
                  <p className="text-gray-800 whitespace-pre-wrap">{testResponse}</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsTestDialogOpen(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => testingChatbot && testAI(testingChatbot)}
                disabled={!testMessage.trim() }
              >
                {testingChatbot ? 'Test AI' : 'Test AI'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chatbots</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chatbots.length}</div>
            <p className="text-xs text-muted-foreground">
              {chatbots.length === 0 ? 'Belum ada chatbot' : `${chatbots.length} chatbot terdaftar`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chatbots Aktif</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chatbots.filter(bot => bot.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {chatbots.length > 0 
                ? `${Math.round((chatbots.filter(bot => bot.is_active).length / chatbots.length) * 100)}% dari total`
                : 'Tidak ada yang aktif'
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pesan Hari Ini</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Fitur akan segera hadir
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Fitur akan segera hadir
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chatbots List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Chatbots</CardTitle>
          <CardDescription>
            Kelola semua chatbot WhatsApp Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chatbots.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Belum ada chatbot
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Buat chatbot pertama Anda untuk mulai melayani pelanggan di WhatsApp
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Buat Chatbot Pertama
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {chatbots.map((chatbot) => (
                <div
                  key={chatbot.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Bot className="h-8 w-8 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium truncate">{chatbot.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {chatbot.whatsapp_number}
                      </p>
                      {chatbot.business_description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {chatbot.business_description}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge
                          variant={chatbot.is_active ? "default" : "secondary"}
                        >
                          {chatbot.is_active ? "Aktif" : "Nonaktif"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Dibuat {chatbot.created_at ? new Date(chatbot.created_at).toLocaleDateString('id-ID') : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openTestDialog(chatbot.id)}
                      disabled={isSubmitting}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Test AI
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleChatbotStatus(chatbot.id)}
                      disabled={isSubmitting}
                    >
                      {chatbot.is_active ? (
                        <>
                          <PauseIcon className="h-4 w-4 mr-1" />
                          Jeda
                        </>
                      ) : (
                        <>
                          <PlayIcon className="h-4 w-4 mr-1" />
                          Aktifkan
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm">
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteChatbot(chatbot.id)}
                      disabled={isSubmitting}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}