// middleware.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Redirigir a login si no hay sesión y el usuario no está en la página de inicio o de login
  if (path !== '/' && !request.cookies.get('supabase-auth-token')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Restricción para rutas protegidas con INGEST_ADMIN_SECRET
  const isAdminRoute = path.startsWith('/api/ingest-pdf')
  if (isAdminRoute) {
    const adminSecret = process.env.INGEST_ADMIN_SECRET
    if (!adminSecret || request.headers.get('x-admin-secret') !== adminSecret) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  // Actualizar sesión usando el middleware de Supabase
  const response = await updateSession(request)

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/api/:path*',
  ],
}
