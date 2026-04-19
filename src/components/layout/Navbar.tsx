'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@/components/ui/Button';

interface NavLink { href: string; label: string }

export default function Navbar() {
  const t = useTranslations();
  const { user, logout } = useAuth();
  const params   = useParams();
  const router   = useRouter();
  const pathname = usePathname();
  const locale   = params.locale as string;
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleLogout() {
    logout();
    router.push(`/${locale}/login`);
  }

  function toggleLocale() {
    const next = locale === 'en' ? 'ar' : 'en';
    const segments = window.location.pathname.split('/');
    segments[1] = next;
    router.push(segments.join('/'));
  }

  const navLinks: NavLink[] =
    user?.role === 'CLIENT'
      ? [
          { href: `/${locale}/client/quotes`, label: t('nav.myQuotes') },
          { href: `/${locale}/client/jobs`,   label: t('nav.myJobs') },
        ]
      : user?.role === 'CONTRACTOR'
      ? [
          { href: `/${locale}/contractor/quotes`, label: t('nav.browseQuotes') },
          { href: `/${locale}/contractor/jobs`,   label: t('nav.jobs') },
        ]
      : [];

  return (
    <>
      {/* ─── Header — 64px, DGA primary-600 ─────────────────────── */}
      <header className="sticky top-0 z-40 h-16 bg-primary-600 text-white">
        <div className="mx-auto flex h-full max-w-page items-center justify-between px-6">

          {/* Logo */}
          <Link href={`/${locale}`} className="text-lg font-semibold tracking-tight text-white hover:opacity-90">
            MOUQAWEL AI
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
            {navLinks.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    'text-base font-medium transition-colors',
                    active ? 'text-white underline underline-offset-4' : 'text-white/75 hover:text-white',
                  ].join(' ')}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLocale}
              className="hidden rounded-lg border border-white/40 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10 transition-colors md:block"
            >
              {locale === 'en' ? 'عربي' : 'English'}
            </button>

            {user ? (
              <>
                <span className="hidden text-sm text-white/70 md:block">{user.email}</span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                  className="border-white/40 text-white hover:bg-white/10"
                >
                  {t('nav.logout')}
                </Button>
              </>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link href={`/${locale}/login`}>
                  <Button variant="tertiary" size="sm" className="text-white hover:bg-white/10">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link href={`/${locale}/register`}>
                  <Button size="sm" className="bg-white text-primary-600 hover:bg-primary-50">
                    {t('nav.register')}
                  </Button>
                </Link>
              </div>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="rounded-lg p-2 hover:bg-white/10 md:hidden"
              aria-label="Open navigation menu"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Mobile Drawer ───────────────────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-ink-900/50" onClick={() => setDrawerOpen(false)} />

          {/* Panel — slides from inline-start (left LTR, right RTL) */}
          <div className="absolute inset-y-0 start-0 flex w-72 flex-col bg-white">
            {/* Drawer header */}
            <div className="flex h-16 items-center justify-between bg-primary-600 px-4">
              <span className="text-lg font-semibold text-white">MOUQAWEL AI</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-1 text-white hover:bg-white/10"
                aria-label="Close navigation menu"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nav links — spec: active = border-s-4 border-primary-600 */}
            <nav className="flex-1 overflow-y-auto p-4" aria-label="Drawer navigation">
              <ul className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  const active = pathname.startsWith(link.href);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setDrawerOpen(false)}
                        className={[
                          'flex h-10 items-center rounded-lg px-3 text-base font-medium transition-colors',
                          active
                            ? 'border-s-4 border-primary-600 bg-primary-50 text-primary-600 ps-2'
                            : 'text-ink-700 hover:bg-primary-50 hover:text-primary-600',
                        ].join(' ')}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer */}
            <div className="border-t border-ink-300 p-4 flex flex-col gap-3">
              <button
                onClick={toggleLocale}
                className="flex h-10 w-full items-center justify-center rounded-lg border border-ink-300 text-base font-medium text-ink-700 hover:bg-ink-100"
              >
                {locale === 'en' ? 'عربي' : 'English'}
              </button>
              {user ? (
                <>
                  <p className="text-sm text-ink-500 text-center truncate">{user.email}</p>
                  <Button variant="secondary" onClick={handleLogout} className="w-full">
                    {t('nav.logout')}
                  </Button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link href={`/${locale}/login`} className="flex-1" onClick={() => setDrawerOpen(false)}>
                    <Button variant="secondary" className="w-full">{t('nav.login')}</Button>
                  </Link>
                  <Link href={`/${locale}/register`} className="flex-1" onClick={() => setDrawerOpen(false)}>
                    <Button className="w-full">{t('nav.register')}</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
