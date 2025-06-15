'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RegisterForm } from '@/components/auth/register-form'
import Link from 'next/link'
import { Metadata } from 'next'
import { useAuth } from '@/contexts/auth-context'

// export const metadata: Metadata = {
//   title: 'Daftar - IndoChat AI',
//   description: 'Daftar akun IndoChat AI gratis dan mulai otomatisasi customer service WhatsApp dengan AI.',
// }

export default function RegisterPage() {
  const { user, session, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (!loading && (user || session)) {
      console.log('🔍 RegisterPage: User already authenticated, redirecting to dashboard')
      router.push('/dashboard')
    }
  }, [user, session, loading, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Memeriksa status login...</p>
        </div>
      </div>
    )
  }

  // Don't render register form if user is authenticated (will redirect)
  if (user || session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-blue-600">IndoChat AI</h1>
          </Link>
          <p className="text-gray-600 mt-2">
            AI Customer Service untuk WhatsApp Business
          </p>
        </div>
        
        <RegisterForm />
        
        <div className="mt-8 text-center">
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
      </div>
    </div>
  )
}