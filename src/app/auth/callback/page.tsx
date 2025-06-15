'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { toast } from 'sonner'

export default function AuthCallback() {
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔍 Auth callback started')
        console.log('🔍 Current URL:', window.location.href)
        console.log('🔍 URL search params:', window.location.search)
        
        // Check if we have a code in the URL (PKCE flow)
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const error = urlParams.get('error')
        const errorDescription = urlParams.get('error_description')
        
        console.log('🔍 Code from URL:', code)
        console.log('🔍 Error from URL:', error)
        console.log('🔍 Error description:', errorDescription)
        
        if (error) {
          console.error('❌ OAuth error:', error, errorDescription)
          toast.error(`OAuth Error: ${errorDescription || error}`)
          router.push('/auth/login')
          return
        }
        
        if (code) {
          console.log('✅ Found auth code, exchanging for session...')
          
          // Exchange the code for a session using PKCE flow
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          console.log('🔍 Exchange result:', { data, error: exchangeError })
          
          if (exchangeError) {
            console.error('❌ Error exchanging code for session:', exchangeError)
            toast.error('Terjadi kesalahan saat login dengan Google. Silakan coba lagi.')
            router.push('/auth/login')
            return
          }

          if (data.session && data.user) {
            console.log('✅ Session created successfully!')
            console.log('🔍 User data:', data.user)
            console.log('🔍 Session data:', data.session)
            
            // Verify the session is actually set
            const { data: sessionCheck } = await supabase.auth.getSession()
            console.log('🔍 Session check after exchange:', sessionCheck)
            
            // Check if this is a new user (first time Google login)
            console.log('🔍 Checking for existing profile...')
            const { data: profile, error: profileFetchError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single()

            console.log('🔍 Profile fetch result:', { profile, error: profileFetchError })

            if (profileFetchError && profileFetchError.code !== 'PGRST116') {
              console.error('❌ Error fetching profile:', profileFetchError)
            }

            if (!profile) {
              console.log('🔄 Creating new profile for user...')
              
              const profileData = {
                id: data.user.id,
                business_name: data.user.user_metadata?.full_name || 'Bisnis Baru',
                email: data.user.email,
                full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
                avatar_url: data.user.user_metadata?.avatar_url || '',
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
                trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                onboarding_completed: false,
              }
              
              console.log('🔍 Profile data to insert:', profileData)
              
              const { data: insertedProfile, error: profileError } = await supabase
                .from('profiles')
                .insert(profileData)
                .select()
                .single()

              console.log('🔍 Profile creation result:', { insertedProfile, error: profileError })

              if (profileError) {
                console.error('❌ Error creating profile:', profileError)
                toast.error('Gagal membuat profil pengguna. Silakan coba lagi.')
                router.push('/auth/login')
                return
              }
              
              console.log('✅ Profile created successfully')
              toast.success('Akun berhasil dibuat! Selamat datang di IndoChat AI.')
            } else {
              console.log('✅ Existing user logged in')
              toast.success('Login dengan Google berhasil!')
            }

            // Final session check before redirect
            const { data: finalSessionCheck } = await supabase.auth.getSession()
            console.log('🔍 Final session check before redirect:', finalSessionCheck)
            
            if (finalSessionCheck.session) {
              console.log('✅ Session confirmed, redirecting to dashboard...')
              // Small delay to ensure session is properly set
              setTimeout(() => {
                router.push('/dashboard')
              }, 100)
            } else {
              console.error('❌ No session found after successful exchange')
              router.push('/auth/login')
            }
          } else {
            console.error('❌ No session or user data after code exchange')
            router.push('/auth/login')
          }
        } else {
          console.log('🔍 No code found, checking for existing session...')
          
          // Handle other auth callbacks (like direct sessions)
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
          
          console.log('🔍 Session check result:', { sessionData, error: sessionError })
          
          if (sessionError) {
            console.error('❌ Auth callback error:', sessionError)
            toast.error('Terjadi kesalahan saat login dengan Google. Silakan coba lagi.')
            router.push('/auth/login')
            return
          }

          if (sessionData.session) {
            console.log('✅ Existing session found, redirecting to dashboard')
            router.push('/dashboard')
          } else {
            console.log('❌ No session found, redirecting to login')
            router.push('/auth/login')
          }
        }
      } catch (error) {
        console.error('❌ Unexpected error in auth callback:', error)
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