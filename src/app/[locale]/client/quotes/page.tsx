'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotesApi } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import Alert from '@/components/ui/Alert';
import type { QuoteRequest } from '@/types/api';

export default function ClientQuotesPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['quotes', 'mine'],
    queryFn: quotesApi.listMine,
  });

  const hireMutation = useMutation({
    mutationFn: ({ quoteId, responseId }: { quoteId: string; responseId: string }) =>
      quotesApi.hire(quoteId, responseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes', 'mine'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  if (isLoading) return <PageSpinner />;

  return (
    <div>
      {/* Page header — section spacing 32px */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink-900">{t('quotes.myRequests')}</h1>
        <Link href={`/${locale}/client/quotes/new`}>
          <Button>{t('quotes.new')}</Button>
        </Link>
      </div>

      {quotes.length === 0 ? (
        <p className="text-base text-ink-500">{t('quotes.noQuotes')}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {quotes.map((q: QuoteRequest) => (
            /* DGA card — p-4 per spec */
            <div key={q.id} className="rounded-lg border border-ink-300 bg-white p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge status={q.status} label={t(`quotes.status.${q.status}`)} />
                  <span className="text-base font-medium text-ink-900">{t(`category.${q.category}`)}</span>
                  <span className="text-base text-ink-500">{q.district}</span>
                </div>
                <span className="text-sm text-ink-500">{new Date(q.createdAt).toLocaleDateString()}</span>
              </div>

              <p className="mb-4 text-base text-ink-700">{q.description}</p>

              {q.responses && q.responses.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium uppercase tracking-wide text-ink-500">
                    {t('quotes.responses')}
                  </p>
                  <div className="flex flex-col gap-2">
                    {q.responses.map((r) => (
                      <div
                        key={r.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink-300 bg-ink-50 px-4 py-3"
                      >
                        <div>
                          <button
                            onClick={() => router.push(`/${locale}/client/contractor/${r.contractor.id}`)}
                            className="text-base font-medium text-primary-600 hover:underline"
                          >
                            {r.contractor.name}
                          </button>
                          <p className="text-base text-ink-700">
                            {Number(r.price).toLocaleString()}{' '}
                            <span className="text-ink-500">{t('common.sar')}</span>
                          </p>
                          {r.notes && <p className="mt-1 text-sm text-ink-500">{r.notes}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge status={r.status} label={r.status} />
                          {q.status === 'OPEN' && r.status === 'PENDING' && (
                            <Button
                              size="sm"
                              loading={hireMutation.isPending}
                              onClick={() => hireMutation.mutate({ quoteId: q.id, responseId: r.id })}
                            >
                              {t('quotes.hire')}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {hireMutation.isError && (
                <Alert variant="error" message={t('common.error')} className="mt-3" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
