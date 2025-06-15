'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/toast-context'

export default function AuthCallback() {
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          toast({
            title: 'Error',
            description: 'Terjadi kesalahan saat login dengan Google. Silakan coba lagi.',
            variant: 'destructive',
          })
          router.push('/auth/login')
          return
        }

        if (data.session) {
          // Check if this is a new user (first time Google login)
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single()

          if (!profile) {
            // Create profile for new Google user
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.session.user.id,
                email: data.session.user.email!,
                full_name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || '',
                avatar_url: data.session.user.user_metadata?.avatar_url || '',
                business_name: '',
                business_type: 'lainnya',
                phone_number: '',
                whatsapp_number: '',
                address: '',
                business_description: '',
                target_audience: '',
                business_goals: [],
                preferred_language: 'id',
                timezone: 'Asia/Jakarta',
                subscription_plan: 'free',
                subscription_status: 'active',
                onboarding_completed: false,
              })

            if (profileError) {
              console.error('Error creating profile:', profileError)
            }
          }

          toast({
            title: 'Berhasil!',
            description: 'Login dengan Google berhasil.',
            variant: 'default',
          })

          // Redirect to dashboard or onboarding
          router.push('/dashboard')
        } else {
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        toast({
          title: 'Error',
          description: 'Terjadi kesalahan yang tidak terduga.',
          variant: 'destructive',
        })
        router.push('/auth/login')
      }
    }

    handleAuthCallback()
  }, [router, toast])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Memproses login...</p>
      </div>
    </div>
  )
}