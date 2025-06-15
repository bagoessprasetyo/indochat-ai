// import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'
import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Masuk - IndoChat AI',
  description: 'Masuk ke akun IndoChat AI Anda untuk mengelola customer service WhatsApp dengan AI.',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-blue-600">IndoChat AI</h1>
          </Link>
          <p className="text-gray-600 mt-2">
            AI Customer Service untuk WhatsApp Business
          </p>
        </div>
        
        <LoginForm />
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Belum punya akun?{' '}
            <Link 
              href="/auth/register" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Daftar gratis sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}