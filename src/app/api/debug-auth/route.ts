// src/app/api/debug-auth/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    // Get all cookies
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    
    console.log('All cookies:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })))
    
    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Check session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('Session debug:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      sessionError: sessionError?.message,
      accessToken: session?.access_token ? 'present' : 'missing',
      refreshToken: session?.refresh_token ? 'present' : 'missing'
    })
    
    // Try to get user directly
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    console.log('User debug:', {
      hasUser: !!user,
      userId: user?.id,
      userError: userError?.message
    })
    
    return NextResponse.json({
      debug: {
        cookies: allCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
        session: {
          exists: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          error: sessionError?.message
        },
        user: {
          exists: !!user,
          userId: user?.id,
          error: userError?.message
        },
        headers: {
          cookie: request.headers.get('cookie') ? 'present' : 'missing',
          authorization: request.headers.get('authorization') ? 'present' : 'missing'
        }
      }
    })
    
  } catch (error) {
    console.error('Debug auth error:', error)
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}