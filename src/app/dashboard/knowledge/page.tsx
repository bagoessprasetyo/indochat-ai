'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/use-require-auth'
import { supabase } from '@/lib/supabase'
// import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Plus, Search, Edit, Trash2, Download, Upload, BarChart3, BookOpen, Tag, Filter } from 'lucide-react'

interface KnowledgeBase {
  id: string
  chatbot_id: string | null
  question: string
  answer: string
  category: string | null
  keywords: string[] | null
  is_active: boolean | null
  usage_count: number | null
  created_at: string | null
  updated_at: string | null
}

interface Chatbot {
  id: string
  name: string
  is_active: boolean | null
}

const CATEGORIES = [
  'General',
  'Products',
  'Services',
  'Pricing',
  'Support',
  'Shipping',
  'Returns',
  'Technical',
  'Business Hours',
  'Contact Info'
]

export default function KnowledgeBasePage() {
  const { user } = useRequireAuth()
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeBase[]>([])
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [selectedChatbot, setSelectedChatbot] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<KnowledgeBase | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    keywords: '',
    chatbot_id: ''
  })

  // const supabase = createClient()
  

  useEffect(() => {
    if (user?.id) {
      fetchChatbots()
    }
  }, [user?.id])

  useEffect(() => {
    if (selectedChatbot) {
      fetchKnowledgeItems()
    }
  }, [selectedChatbot])

  const fetchChatbots = async () => {
    try {
      const { data, error } = await supabase
        .from('chatbots')
        .select('id, name, is_active')
        .eq('user_id', user?.id || '')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setChatbots(data || [])
      if (data && data.length > 0) {
        setSelectedChatbot(data[0].id)
      }
    } catch (error: any) {
      toast.error('Failed to fetch chatbots: ' + error.message)
    }
  }

  const fetchKnowledgeItems = async () => {
    if (!selectedChatbot) return
    
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('chatbot_id', selectedChatbot)
        .order('created_at', { ascending: false })

      if (error) throw error
      setKnowledgeItems(data || [])
    } catch (error: any) {
      toast.error('Failed to fetch knowledge base: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateItem = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Question and answer are required')
      return
    }

    try {
      setIsSubmitting(true)
      const keywords = formData.keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0)

      const { error } = await supabase
        .from('knowledge_base')
        .insert({
          chatbot_id: selectedChatbot,
          question: formData.question.trim(),
          answer: formData.answer.trim(),
          category: formData.category || null,
          keywords: keywords.length > 0 ? keywords : null,
          is_active: true,
          usage_count: 0
        })

      if (error) throw error

      toast.success('Knowledge item created successfully')
      setIsCreateDialogOpen(false)
      setFormData({ question: '', answer: '', category: '', keywords: '', chatbot_id: '' })
      fetchKnowledgeItems()
    } catch (error: any) {
      toast.error('Failed to create knowledge item: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditItem = async () => {
    if (!editingItem || !formData.question.trim() || !formData.answer.trim()) {
      toast.error('Question and answer are required')
      return
    }

    try {
      setIsSubmitting(true)
      const keywords = formData.keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0)

      const { error } = await supabase
        .from('knowledge_base')
        .update({
          question: formData.question.trim(),
          answer: formData.answer.trim(),
          category: formData.category || null,
          keywords: keywords.length > 0 ? keywords : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingItem.id)

      if (error) throw error

      toast.success('Knowledge item updated successfully')
      setIsEditDialogOpen(false)
      setEditingItem(null)
      setFormData({ question: '', answer: '', category: '', keywords: '', chatbot_id: '' })
      fetchKnowledgeItems()
    } catch (error: any) {
      toast.error('Failed to update knowledge item: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this knowledge item?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Knowledge item deleted successfully')
      fetchKnowledgeItems()
    } catch (error: any) {
      toast.error('Failed to delete knowledge item: ' + error.message)
    }
  }

  const toggleItemStatus = async (id: string, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      toast.success('Knowledge item status updated')
      fetchKnowledgeItems()
    } catch (error: any) {
      toast.error('Failed to update status: ' + error.message)
    }
  }

  const openEditDialog = (item: KnowledgeBase) => {
    setEditingItem(item)
    setFormData({
      question: item.question,
      answer: item.answer,
      category: item.category || '',
      keywords: item.keywords?.join(', ') || '',
      chatbot_id: item.chatbot_id || ''
    })
    setIsEditDialogOpen(true)
  }

  const exportKnowledgeBase = async () => {
    try {
      const dataStr = JSON.stringify(knowledgeItems, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `knowledge-base-${selectedChatbot}-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
      toast.success('Knowledge base exported successfully')
    } catch (error) {
      toast.error('Failed to export knowledge base')
    }
  }

  const filteredItems = knowledgeItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keywords?.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const stats = {
    total: knowledgeItems.length,
    active: knowledgeItems.filter(item => item.is_active).length,
    categories: new Set(knowledgeItems.map(item => item.category).filter(Boolean)).size,
    totalUsage: knowledgeItems.reduce((sum, item) => sum + (item.usage_count || 0), 0)
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Manage your chatbot's knowledge base with Q&A pairs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportKnowledgeBase}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Knowledge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Knowledge Item</DialogTitle>
                <DialogDescription>
                  Create a new Q&A pair for your chatbot's knowledge base
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="question">Question</Label>
                  <Input
                    id="question"
                    placeholder="Enter the question..."
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="answer">Answer</Label>
                  <Textarea
                    id="answer"
                    placeholder="Enter the answer..."
                    rows={4}
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                  <Input
                    id="keywords"
                    placeholder="keyword1, keyword2, keyword3"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateItem} disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Chatbot Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Select Chatbot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedChatbot} onValueChange={setSelectedChatbot}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a chatbot" />
            </SelectTrigger>
            <SelectContent>
              {chatbots.map((chatbot) => (
                <SelectItem key={chatbot.id} value={chatbot.id}>
                  {chatbot.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedChatbot && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Items</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.categories}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsage}</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search questions, answers, or keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Knowledge Items */}
          <div className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">Loading knowledge base...</div>
                </CardContent>
              </Card>
            ) : filteredItems.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    {searchQuery || selectedCategory !== 'all' 
                      ? 'No knowledge items match your search criteria'
                      : 'No knowledge items found. Create your first Q&A pair to get started.'
                    }
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredItems.map((item) => (
                <Card key={item.id} className={!item.is_active ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{item.question}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          {item.category && (
                            <Badge variant="secondary">{item.category}</Badge>
                          )}
                          <Badge variant={item.is_active ? 'default' : 'destructive'}>
                            {item.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {item.usage_count !== null && (
                            <Badge variant="outline">Used {item.usage_count} times</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleItemStatus(item.id, item.is_active)}
                        >
                          {item.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-3">{item.answer}</p>
                    {item.keywords && item.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Knowledge Item</DialogTitle>
            <DialogDescription>
              Update the Q&A pair in your chatbot's knowledge base
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-question">Question</Label>
              <Input
                id="edit-question"
                placeholder="Enter the question..."
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-answer">Answer</Label>
              <Textarea
                id="edit-answer"
                placeholder="Enter the answer..."
                rows={4}
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-keywords">Keywords (comma-separated)</Label>
              <Input
                id="edit-keywords"
                placeholder="keyword1, keyword2, keyword3"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditItem} disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}