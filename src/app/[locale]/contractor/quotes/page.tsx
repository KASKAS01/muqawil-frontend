'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { quotesApi } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import type { QuoteRequest } from '@/types/api';

export default function ContractorQuotesPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['quotes', 'open'],
    queryFn: quotesApi.listOpen,
  });

  if (isLoading) return <PageSpinner />;

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold text-ink-900">{t('quotes.openQuotes')}</h1>

      {quotes.length === 0 ? (
        <p className="text-sm text-ink-500">{t('quotes.noQuotes')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quotes.map((q: QuoteRequest) => (
            <Link key={q.id} href={`/${locale}/contractor/quotes/${q.id}`}>
              {/* ─── DGA Card ─── */}
              <div className="flex h-full flex-col rounded-lg border border-ink-300 bg-white p-4 transition-colors hover:border-primary-600 hover:bg-primary-50">
                <div className="mb-3 flex items-center gap-2">
                  <Badge status={q.status} label={t(`quotes.status.${q.status}`)} />
                  <span className="text-sm font-medium text-ink-900">{t(`category.${q.category}`)}</span>
                </div>
                <p className="mb-1 text-sm font-medium text-ink-700">{q.district}</p>
                <p className="flex-1 text-sm text-ink-500 line-clamp-2">{q.description}</p>
                <p className="mt-4 text-xs text-ink-400">
                  {new Date(q.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
