'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useRequireAuth } from '@/contexts/auth-context'
import { z } from 'zod'
import { Package, DollarSign, Archive, TrendingUp, Eye, EyeOff } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// Validation schema for product form
const productSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi').max(200, 'Nama terlalu panjang'),
  description: z.string().optional(),
  price: z.number().min(0, 'Harga harus lebih dari 0'),
  original_price: z.number().optional(),
  sku: z.string().optional(),
  category: z.string().optional(),
  stock_quantity: z.number().min(0, 'Stok tidak boleh negatif').optional(),
  min_stock_alert: z.number().min(0, 'Alert stok minimum tidak boleh negatif').optional(),
  weight: z.number().min(0, 'Berat tidak boleh negatif').optional(),
  is_active: z.boolean().default(true),
})

type ProductFormData = z.infer<typeof productSchema>

// Product interface based on database schema
interface Product {
  id: string
  chatbot_id: string | null
  name: string
  description: string | null
  price: number
  original_price: number | null
  sku: string | null
  category: string | null
  stock_quantity: number | null
  min_stock_alert: number | null
  weight: number | null
  images: string[] | null
  tags: string[] | null
  dimensions: any | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
}

interface Chatbot {
  id: string
  name: string
}

export default function ProductsPage() {
  const { user } = useRequireAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [selectedChatbot, setSelectedChatbot] = useState<string>('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    original_price: undefined,
    sku: '',
    category: '',
    stock_quantity: 0,
    min_stock_alert: 5,
    weight: 0,
    is_active: true,
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({})

  // Fetch user's chatbots
  const fetchChatbots = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('chatbots')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('Error fetching chatbots:', error)
        toast.error('Gagal memuat data chatbot')
        return
      }

      setChatbots(data || [])
      if (data && data.length > 0 && !selectedChatbot) {
        setSelectedChatbot(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching chatbots:', error)
      toast.error('Gagal memuat data chatbot')
    }
  }

  // Fetch products from database
  const fetchProducts = async () => {
    if (!user?.id || !selectedChatbot) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('chatbot_id', selectedChatbot)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching products:', error)
        toast.error('Gagal memuat data produk: ' + error.message)
        return
      }

      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Gagal memuat data produk')
    } finally {
      setIsLoading(false)
    }
  }

  // Load data on component mount and when chatbot changes
  useEffect(() => {
    fetchChatbots()
  }, [user?.id])

  useEffect(() => {
    if (selectedChatbot) {
      fetchProducts()
    }
  }, [selectedChatbot])

  // Validate form data
  const validateForm = (data: ProductFormData): boolean => {
    try {
      productSchema.parse(data)
      setFormErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof ProductFormData, string>> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as keyof ProductFormData] = err.message
          }
        })
        setFormErrors(errors)
      }
      return false
    }
  }

  // Handle form submission for creating product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm(formData) || !selectedChatbot) {
      return
    }

    try {
      setIsSubmitting(true)
      
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...formData,
          chatbot_id: selectedChatbot,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating product:', error)
        toast.error('Gagal membuat produk: ' + error.message)
        return
      }

      toast.success('Produk berhasil dibuat!')
      setIsCreateDialogOpen(false)
      resetForm()
      fetchProducts()
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error('Gagal membuat produk')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle form submission for editing product
  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm(formData) || !editingProduct) {
      return
    }

    try {
      setIsSubmitting(true)
      
      const { error } = await supabase
        .from('products')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingProduct.id)

      if (error) {
        console.error('Error updating product:', error)
        toast.error('Gagal mengupdate produk: ' + error.message)
        return
      }

      toast.success('Produk berhasil diupdate!')
      setIsEditDialogOpen(false)
      setEditingProduct(null)
      resetForm()
      fetchProducts()
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Gagal mengupdate produk')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) {
        console.error('Error deleting product:', error)
        toast.error('Gagal menghapus produk: ' + error.message)
        return
      }

      toast.success('Produk berhasil dihapus!')
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Gagal menghapus produk')
    }
  }

  // Toggle product active status
  const toggleProductStatus = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          is_active: !product.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id)

      if (error) {
        console.error('Error updating product status:', error)
        toast.error('Gagal mengupdate status produk: ' + error.message)
        return
      }

      toast.success(`Produk ${!product.is_active ? 'diaktifkan' : 'dinonaktifkan'}!`)
      fetchProducts()
    } catch (error) {
      console.error('Error updating product status:', error)
      toast.error('Gagal mengupdate status produk')
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      original_price: undefined,
      sku: '',
      category: '',
      stock_quantity: 0,
      min_stock_alert: 5,
      weight: 0,
      is_active: true,
    })
    setFormErrors({})
  }

  // Open edit dialog
  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      original_price: product.original_price || undefined,
      sku: product.sku || '',
      category: product.category || '',
      stock_quantity: product.stock_quantity || 0,
      min_stock_alert: product.min_stock_alert || 5,
      weight: product.weight || 0,
      is_active: product.is_active ?? true,
    })
    setIsEditDialogOpen(true)
  }

  // Calculate statistics
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.is_active).length
  const totalValue = products.reduce((sum, p) => sum + (p.price * (p.stock_quantity || 0)), 0)
  const lowStockProducts = products.filter(p => 
    p.stock_quantity !== null && 
    p.min_stock_alert !== null && 
    p.stock_quantity <= p.min_stock_alert
  ).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Produk</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola produk untuk chatbot Anda
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {/* Chatbot Selector */}
          {chatbots.length > 0 && (
            <Select value={selectedChatbot} onValueChange={setSelectedChatbot}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Pilih Chatbot" />
              </SelectTrigger>
              <SelectContent>
                {chatbots.map((chatbot) => (
                  <SelectItem key={chatbot.id} value={chatbot.id}>
                    {chatbot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedChatbot}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Tambah Produk
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Produk Baru</DialogTitle>
                <DialogDescription>
                  Buat produk baru untuk chatbot Anda
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="name">Nama Produk *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Masukkan nama produk"
                      className={formErrors.name ? 'border-red-500' : ''}
                    />
                    {formErrors.name && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Deskripsi produk"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="price">Harga *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      className={formErrors.price ? 'border-red-500' : ''}
                    />
                    {formErrors.price && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.price}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="original_price">Harga Asli</Label>
                    <Input
                      id="original_price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.original_price || ''}
                      onChange={(e) => setFormData({ ...formData, original_price: parseFloat(e.target.value) || undefined })}
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="Kode produk"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Kategori</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Kategori produk"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="stock_quantity">Stok</Label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      min="0"
                      value={formData.stock_quantity || ''}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="min_stock_alert">Alert Stok Minimum</Label>
                    <Input
                      id="min_stock_alert"
                      type="number"
                      min="0"
                      value={formData.min_stock_alert || ''}
                      onChange={(e) => setFormData({ ...formData, min_stock_alert: parseInt(e.target.value) || 0 })}
                      placeholder="5"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="weight">Berat (gram)</Label>
                    <Input
                      id="weight"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.weight || ''}
                      onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Produk Aktif</Label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false)
                      resetForm()
                    }}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* No chatbot selected */}
      {!selectedChatbot && chatbots.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Pilih Chatbot</h3>
            <p className="text-gray-500 text-center">
              Pilih chatbot untuk melihat dan mengelola produk
            </p>
          </CardContent>
        </Card>
      )}

      {/* No chatbots */}
      {chatbots.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Chatbot</h3>
            <p className="text-gray-500 text-center mb-4">
              Anda perlu membuat chatbot terlebih dahulu sebelum mengelola produk
            </p>
            <Button asChild>
              <a href="/dashboard/chatbots">Buat Chatbot</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      {selectedChatbot && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {activeProducts} aktif
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nilai Inventori</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                Total nilai stok
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stok Rendah</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{lowStockProducts}</div>
              <p className="text-xs text-muted-foreground">
                Perlu restok
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produk Aktif</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeProducts}</div>
              <p className="text-xs text-muted-foreground">
                Dari {totalProducts} total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Products List */}
      {selectedChatbot && (
        <Card>
          <CardHeader>
            <CardTitle>Daftar Produk</CardTitle>
            <CardDescription>
              Kelola produk untuk chatbot yang dipilih
            </CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Produk</h3>
                <p className="text-gray-500 text-center mb-4">
                  Mulai dengan menambahkan produk pertama Anda
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Tambah Produk
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <PhotoIcon className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{product.name}</h3>
                          <Badge variant={product.is_active ? 'default' : 'secondary'}>
                            {product.is_active ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                          {product.stock_quantity !== null && 
                           product.min_stock_alert !== null && 
                           product.stock_quantity <= product.min_stock_alert && (
                            <Badge variant="destructive">Stok Rendah</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span>Harga: {formatCurrency(product.price)}</span>
                          {product.original_price && product.original_price > product.price && (
                            <span className="line-through">{formatCurrency(product.original_price)}</span>
                          )}
                          {product.sku && <span>SKU: {product.sku}</span>}
                          {product.stock_quantity !== null && (
                            <span>Stok: {product.stock_quantity}</span>
                          )}
                          {product.category && (
                            <Badge variant="outline">{product.category}</Badge>
                          )}
                        </div>
                        
                        {product.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleProductStatus(product)}
                        title={product.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        {product.is_active ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(product)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Produk</DialogTitle>
            <DialogDescription>
              Update informasi produk
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="edit-name">Nama Produk *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama produk"
                  className={formErrors.name ? 'border-red-500' : ''}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="edit-description">Deskripsi</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi produk"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-price">Harga *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  className={formErrors.price ? 'border-red-500' : ''}
                />
                {formErrors.price && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.price}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="edit-original_price">Harga Asli</Label>
                <Input
                  id="edit-original_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.original_price || ''}
                  onChange={(e) => setFormData({ ...formData, original_price: parseFloat(e.target.value) || undefined })}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-sku">SKU</Label>
                <Input
                  id="edit-sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Kode produk"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-category">Kategori</Label>
                <Input
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Kategori produk"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-stock_quantity">Stok</Label>
                <Input
                  id="edit-stock_quantity"
                  type="number"
                  min="0"
                  value={formData.stock_quantity || ''}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-min_stock_alert">Alert Stok Minimum</Label>
                <Input
                  id="edit-min_stock_alert"
                  type="number"
                  min="0"
                  value={formData.min_stock_alert || ''}
                  onChange={(e) => setFormData({ ...formData, min_stock_alert: parseInt(e.target.value) || 0 })}
                  placeholder="5"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-weight">Berat (gram)</Label>
                <Input
                  id="edit-weight"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.weight || ''}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="edit-is_active">Produk Aktif</Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingProduct(null)
                  resetForm()
                }}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Update Produk'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}