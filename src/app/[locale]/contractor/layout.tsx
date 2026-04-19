'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import Navbar from '@/components/layout/Navbar';
import { PageSpinner } from '@/components/ui/Spinner';

export default function ContractorLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  useEffect(() => {
    if (!isLoading && !user) router.replace(`/${locale}/login`);
    if (!isLoading && user && user.role !== 'CONTRACTOR') {
      router.replace(`/${locale}/client/quotes`);
    }
  }, [user, isLoading, locale, router]);

  if (isLoading || !user) return <PageSpinner />;

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <Navbar />
      <main className="mx-auto w-full max-w-page flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}
