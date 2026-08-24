import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('barber_token')?.value;
  const { pathname } = request.nextUrl;

  if ((pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/profile')) && !token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/dashboard', '/admin/:path*', '/admin', '/profile/:path*', '/profile'],
};
