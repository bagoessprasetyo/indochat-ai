import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // Update the request cookies for server components
          request.cookies.set({
            name,
            value,
            ...options,
          })
          // Update the response cookies for the browser
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          // Update the request cookies for server components
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          // Update the response cookies for the browser
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // IMPORTANT: Calling getUser() refreshes the auth token and updates cookies
  // This is essential for maintaining authentication across requests
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Handle route protection and redirects
  // If user is signed in and the current path is /auth/login or /auth/register redirect the user to /dashboard
  if (user && (request.nextUrl.pathname === '/auth/login' || request.nextUrl.pathname === '/auth/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If user is not signed in and the current path is /dashboard/* redirect the user to /auth/login
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return supabaseResponse
}