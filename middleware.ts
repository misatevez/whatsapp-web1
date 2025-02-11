import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get saved phone from cookie
  const savedPhone = request.cookies.get('whatsapp_phone')?.value
  
  console.log("[Middleware] Request:", {
    url: request.url,
    pathname: request.nextUrl.pathname,
    savedPhone,
    cookies: request.cookies.toString()
  })

  // If accessing chat route without authentication
  if (request.nextUrl.pathname.startsWith('/chat')) {
    if (!savedPhone) {
      console.log("[Middleware] No session found, redirecting to home")
      return NextResponse.redirect(new URL('/', request.url))
    }
    console.log("[Middleware] Session found for chat route, proceeding")
  }

  // If accessing home page with authentication
  if (request.nextUrl.pathname === '/') {
    if (savedPhone) {
      console.log("[Middleware] Session found on home, redirecting to chat")
      return NextResponse.redirect(new URL(`/chat?phone=${savedPhone}`, request.url))
    }
    console.log("[Middleware] No session on home, proceeding")
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/chat/:path*']
}