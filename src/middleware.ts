import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/api')
  ) {
    return;
  }

  // Supported locales
  const locales = ['en', 'ar'];

  // Check if the pathname already has a locale
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}`)
  );

  if (pathnameIsMissingLocale) {
    const locale = 'en'; // default locale
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }
}
