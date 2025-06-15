'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EyeIcon, EyeSlashIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/contexts/toast-context'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface RegisterFormProps {
  className?: string
}

const businessTypes = [
  { value: 'warung', label: 'Warung/Kedai Makan' },
  { value: 'toko', label: 'Toko/Retail' },
  { value: 'restoran', label: 'Restoran/Cafe' },
  { value: 'jasa', label: 'Jasa/Service' },
  { value: 'online_shop', label: 'Toko Online' },
  { value: 'manufaktur', label: 'Manufaktur/Produksi' },
  { value: 'lainnya', label: 'Lainnya' },
]

const languages = [
  { value: 'id', label: 'Bahasa Indonesia' },
  { value: 'jv', label: 'Bahasa Jawa' },
  { value: 'su', label: 'Bahasa Sunda' },
  { value: 'ms', label: 'Bahasa Melayu' },
]

const timezones = [
  { value: 'Asia/Jakarta', label: 'WIB (Jakarta, Bandung, Surabaya)' },
  { value: 'Asia/Makassar', label: 'WITA (Makassar, Denpasar, Balikpapan)' },
  { value: 'Asia/Jayapura', label: 'WIT (Jayapura, Manokwari)' },
]

export function RegisterForm({ className }: RegisterFormProps) {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    businessName: '',
    businessType: '',
    businessAddress: '',
    businessDescription: '',
    whatsappNumber: '',
    targetAudience: '',
    preferredLanguage: 'id',
    timezone: 'Asia/Jakarta',
  })
  
  const { signUp, signInWithGoogle } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName) {
      setError('Semua field wajib diisi.')
      return false
    }
    
    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter.')
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak sama.')
      return false
    }
    
    return true
  }

  const validateStep2 = () => {
    if (!formData.businessName || !formData.businessType || !formData.whatsappNumber) {
      setError('Semua field wajib diisi.')
      return false
    }
    
    return true
  }

  const handleNext = () => {
    setError('')
    
    if (step === 1 && validateStep1()) {
      setStep(2)
    }
  }

  const handleBack = () => {
    setStep(1)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validateStep2()) return
    
    setIsLoading(true)

    try {
      const { error } = await signUp(formData.email, formData.password, {
        // name: formData.fullName || '',
        // phone: formData.phone,
        business_name: formData.businessName,
        business_type: formData.businessType as any,
        // business_address: formData.businessAddress,
        // business_description: formData.businessDescription,
        // whatsapp_number: formData.whatsappNumber,
        // target_audience: formData.targetAudience,
        // preferred_language: formData.preferredLanguage as any,
        // timezone: formData.timezone as any,
      })
      
      if (error) {
        if (error.message.includes('already registered')) {
          setError('Email sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.')
        } else {
          setError(error.message)
        }
        return
      }

      toast({
        title: 'Pendaftaran berhasil!',
        description: 'Silakan cek email Anda untuk konfirmasi akun.',
        variant: 'default',
      })
      
      router.push('/auth/verify-email')
    } catch (err) {
      console.error('Registration error:', err)
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setError('')

    try {
      const { error } = await signInWithGoogle()
      
      if (error) {
        setError('Gagal login dengan Google. Silakan coba lagi.')
        return
      }

      // The redirect will be handled by the OAuth flow
    } catch (err) {
      console.error('Google login error:', err)
      setError('Terjadi kesalahan saat login dengan Google.')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const passwordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 6) strength++
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++
    if (password.match(/[0-9]/)) strength++
    if (password.match(/[^a-zA-Z0-9]/)) strength++
    return strength
  }

  const getPasswordStrengthText = (strength: number) => {
    switch (strength) {
      case 0:
      case 1:
        return { text: 'Lemah', color: 'text-red-500' }
      case 2:
        return { text: 'Sedang', color: 'text-yellow-500' }
      case 3:
        return { text: 'Kuat', color: 'text-green-500' }
      case 4:
        return { text: 'Sangat Kuat', color: 'text-green-600' }
      default:
        return { text: '', color: '' }
    }
  }

  return (
    <Card className={cn('w-full max-w-2xl', className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Daftar IndoChat AI
        </CardTitle>
        <CardDescription className="text-center">
          Langkah {step} dari 2: {step === 1 ? 'Informasi Akun' : 'Informasi Bisnis'}
        </CardDescription>
        
        {/* Progress indicator */}
        <div className="flex items-center justify-center mt-4">
          <div className="flex items-center space-x-2">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            )}>
              {step > 1 ? <CheckIcon className="w-4 h-4" /> : '1'}
            </div>
            <div className={cn(
              'w-16 h-1 rounded',
              step >= 2 ? 'bg-blue-600' : 'bg-gray-200'
            )} />
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            )}>
              2
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {step === 1 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap *</Label>
                <Input
                  id="fullName"
                  placeholder="Nama lengkap Anda"
                  value={formData.fullName}
                  onChange={(e) => updateFormData('fullName', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input
                  id="phone"
                  placeholder="08123456789"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@contoh.com"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 6 karakter"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {formData.password && (
                <div className="text-sm">
                  <span className="text-gray-600">Kekuatan password: </span>
                  <span className={getPasswordStrengthText(passwordStrength(formData.password)).color}>
                    {getPasswordStrengthText(passwordStrength(formData.password)).text}
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Ulangi password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="mt-4">
              <Button 
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleGoogleLogin}
                disabled={isLoading || isGoogleLoading}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {isGoogleLoading ? 'Memproses...' : 'Daftar dengan Google'}
              </Button>
            </div>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Atau</span>
              </div>
            </div>
            
            <Button 
              type="button" 
              onClick={handleNext}
              className="w-full" 
              disabled={isLoading || isGoogleLoading}
            >
              Lanjutkan dengan Email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Nama Bisnis *</Label>
                <Input
                  id="businessName"
                  placeholder="Nama toko/bisnis Anda"
                  value={formData.businessName}
                  onChange={(e) => updateFormData('businessName', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="businessType">Jenis Bisnis *</Label>
                <Select 
                  value={formData.businessType} 
                  onValueChange={(value) => updateFormData('businessType', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis bisnis" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">Nomor WhatsApp Bisnis *</Label>
              <Input
                id="whatsappNumber"
                placeholder="08123456789 (yang akan digunakan untuk customer service)"
                value={formData.whatsappNumber}
                onChange={(e) => updateFormData('whatsappNumber', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="businessAddress">Alamat Bisnis</Label>
              <Textarea
                id="businessAddress"
                placeholder="Alamat lengkap bisnis Anda"
                value={formData.businessAddress}
                onChange={(e) => updateFormData('businessAddress', e.target.value)}
                disabled={isLoading}
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="businessDescription">Deskripsi Bisnis</Label>
              <Textarea
                id="businessDescription"
                placeholder="Ceritakan tentang produk/layanan yang Anda tawarkan"
                value={formData.businessDescription}
                onChange={(e) => updateFormData('businessDescription', e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Pelanggan</Label>
              <Input
                id="targetAudience"
                placeholder="Contoh: Ibu rumah tangga, mahasiswa, pekerja kantoran"
                value={formData.targetAudience}
                onChange={(e) => updateFormData('targetAudience', e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preferredLanguage">Bahasa Utama</Label>
                <Select 
                  value={formData.preferredLanguage} 
                  onValueChange={(value) => updateFormData('preferredLanguage', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">Zona Waktu</Label>
                <Select 
                  value={formData.timezone} 
                  onValueChange={(value) => updateFormData('timezone', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={handleBack}
                className="flex-1" 
                disabled={isLoading}
              >
                Kembali
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isLoading}
              >
                {isLoading ? 'Mendaftar...' : 'Daftar Sekarang'}
              </Button>
            </div>
          </form>
        )}
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Sudah punya akun?{' '}
            <Link 
              href="/auth/login" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Dengan mendaftar, Anda menyetujui{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-500">
              Syarat & Ketentuan
            </Link>{' '}
            dan{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
              Kebijakan Privasi
            </Link>{' '}
            kami.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}