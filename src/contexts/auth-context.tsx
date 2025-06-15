'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signUp: (email: string, password: string, userData: Partial<Profile>) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('🔍 AuthContext: Getting initial session...')
      
      const { data: { session }, error } = await supabase.auth.getSession()
      
      console.log('🔍 AuthContext: Initial session result:', { session, error })
      
      if (error) {
        console.error('❌ AuthContext: Error getting session:', error)
      } else {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('✅ AuthContext: Found user, fetching profile...')
          await fetchProfile(session.user.id)
        } else {
          console.log('ℹ️ AuthContext: No user found in initial session')
        }
      }
      
      setLoading(false)
      console.log('✅ AuthContext: Initial session setup complete')
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 AuthContext: Auth state changed:', event, 'User ID:', session?.user?.id)
        console.log('🔍 AuthContext: New session data:', session)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('✅ AuthContext: User found in state change, fetching profile...')
          await fetchProfile(session.user.id)
        } else {
          console.log('ℹ️ AuthContext: No user in state change, clearing profile')
          setProfile(null)
        }
        
        // Only set loading to false after processing is complete
        setLoading(false)
      }
    )

    return () => {
      console.log('🔄 AuthContext: Cleaning up auth subscription')
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    console.log('🔍 AuthContext: Fetching profile for user:', userId)
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('🔍 AuthContext: Profile fetch result:', { data, error })

      if (error) {
        // PGRST116 means no rows found - this is expected for new users
        if (error.code !== 'PGRST116') {
          console.error('❌ AuthContext: Error fetching profile:', error)
        } else {
          console.log('ℹ️ AuthContext: No profile found (new user)')
        }
        return
      }

      setProfile(data)
      console.log('✅ AuthContext: Profile set successfully')
    } catch (error) {
      console.error('❌ AuthContext: Error fetching profile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔍 AuthContext: Signing in with email/password')
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log('🔍 AuthContext: Email/password sign in result:', { error })
    return { error }
  }

  const signInWithGoogle = async () => {
    console.log('🔍 AuthContext: Starting Google OAuth')
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    console.log('🔍 AuthContext: Google OAuth initiation result:', { error })
    return { error }
  }

  const signUp = async (email: string, password: string, userData: Partial<Profile>) => {
    console.log('🔍 AuthContext: Signing up new user')
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: (userData as any).full_name || '',
          business_name: userData.business_name,
          business_type: userData.business_type,
        },
      },
    })

    console.log('🔍 AuthContext: Sign up result:', { data, error })

    if (error) {
      return { error }
    }

    return { error: null }
  }

  const signOut = async () => {
    console.log('🔍 AuthContext: Signing out')
    
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('❌ AuthContext: Error signing out:', error)
    } else {
      console.log('✅ AuthContext: Signed out successfully')
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      console.error('❌ AuthContext: No user logged in for profile update')
      return { error: new Error('No user logged in') }
    }

    console.log('🔍 AuthContext: Updating profile for user:', user.id)

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    console.log('🔍 AuthContext: Profile update result:', { data, error })

    if (error) {
      console.error('❌ AuthContext: Error updating profile:', error)
      return { error }
    }

    setProfile(data)
    console.log('✅ AuthContext: Profile updated successfully')
    return { error: null }
  }

  const refreshProfile = async () => {
    if (user) {
      console.log('🔄 AuthContext: Refreshing profile')
      await fetchProfile(user.id)
    }
  }

  // Log current state changes
  useEffect(() => {
    console.log('🔍 AuthContext: State update:', {
      hasUser: !!user,
      hasProfile: !!profile,
      hasSession: !!session,
      loading,
      userId: user?.id
    })
  }, [user, profile, session, loading])

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook for protected routes
export function useRequireAuth() {
  const { user, profile, loading } = useAuth()
  
  useEffect(() => {
    console.log('🔍 useRequireAuth: Check auth state:', { hasUser: !!user, loading })
    
    if (!loading && !user) {
      console.log('❌ useRequireAuth: No user found, redirecting to login')
      window.location.href = '/auth/login'
    }
  }, [user, loading])
  
  return { user, profile, loading }
}