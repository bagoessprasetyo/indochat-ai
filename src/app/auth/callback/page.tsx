'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { toast } from 'sonner' // Use the same toast system as the chatbots page

export default function AuthCallback() {
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the auth callback
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          toast.error('Terjadi kesalahan saat login dengan Google. Silakan coba lagi.')
          router.push('/auth/login')
          return
        }

        if (data.session) {
          console.log('Session found:', data.session.user.id)
          
          // Check if this is a new user (first time Google login)
          const { data: profile, error: profileFetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single()

          if (profileFetchError && profileFetchError.code !== 'PGRST116') {
            console.error('Error fetching profile:', profileFetchError)
          }

          if (!profile) {
            console.log('Creating new profile for user:', data.session.user.id)
            
            // Create profile for new Google user - match the database schema
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.session.user.id,
                business_name: data.session.user.user_metadata?.full_name || 'Bisnis Baru',
                email: data.session.user.email,
                full_name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || '',
                avatar_url: data.session.user.user_metadata?.avatar_url || '',
                phone: null,
                business_type: 'lainnya',
                phone_number: null,
                whatsapp_number: null,
                address: null,
                business_description: null,
                target_audience: null,
                business_goals: null,
                preferred_language: 'id',
                timezone: 'Asia/Jakarta',
                subscription_plan: 'free',
                subscription_tier: 'starter',
                subscription_status: 'trial',
                trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
                onboarding_completed: false,
              })

            if (profileError) {
              console.error('Error creating profile:', profileError)
              toast.error('Gagal membuat profil pengguna. Silakan coba lagi.')
              router.push('/auth/login')
              return
            }
            
            console.log('Profile created successfully')
            toast.success('Akun berhasil dibuat! Selamat datang di IndoChat AI.')
          } else {
            console.log('Existing user logged in')
            toast.success('Login dengan Google berhasil!')
          }

          // Redirect to dashboard
          router.push('/dashboard')
        } else {
          console.log('No session found, redirecting to login')
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        toast.error('Terjadi kesalahan yang tidak terduga.')
        router.push('/auth/login')
      }
    }

    handleAuthCallback()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Memproses login...</p>
        <p className="text-sm text-gray-500 mt-2">Mohon tunggu sebentar...</p>
      </div>
    </div>
  )
}