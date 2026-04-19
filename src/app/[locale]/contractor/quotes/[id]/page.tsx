'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { quotesApi } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Alert from '@/components/ui/Alert';
import { PageSpinner } from '@/components/ui/Spinner';

const schema = z.object({
  price: z.number().min(1),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function ContractorQuoteDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState('');

  const { data: quote, isLoading } = useQuery({
    queryKey: ['quotes', id],
    queryFn: () => quotesApi.get(id),
  });

  const myResponse = quote?.responses?.find((r) => r.contractorId === user?.id);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const respondMutation = useMutation({
    mutationFn: (data: FormData) => quotesApi.respond(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes', id] });
      reset();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSubmitError(msg ?? t('common.error'));
    },
  });

  if (isLoading) return <PageSpinner />;
  if (!quote) return <Alert variant="error" message={t('common.error')} />;

  return (
    <div className="max-w-2xl">
      {/* ─── Quote details card ──────────────────────────────────────── */}
      <div className="mb-6 rounded-lg border border-ink-300 bg-white p-4">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge status={quote.status} label={t(`quotes.status.${quote.status}`)} />
          <span className="font-medium text-ink-900">{t(`category.${quote.category}`)}</span>
          <span className="text-ink-500">—</span>
          <span className="text-ink-500">{quote.district}</span>
        </div>
        <p className="mb-4 text-sm text-ink-700">{quote.description}</p>
        {quote.photoUrls.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {quote.photoUrls.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-primary-600 hover:underline"
              >
                Photo {i + 1}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* ─── My offer or submit form ─────────────────────────────────── */}
      {myResponse ? (
        <div className="rounded-lg border border-primary-600 bg-primary-50 p-4">
          <p className="mb-3 text-sm font-semibold text-primary-600">Your Offer</p>
          <p className="text-sm text-ink-900">
            {Number(myResponse.price).toLocaleString()}{' '}
            <span className="text-ink-500">{t('common.sar')}</span>
          </p>
          {myResponse.notes && (
            <p className="mt-1 text-sm text-ink-700">{myResponse.notes}</p>
          )}
          <div className="mt-3">
            <Badge status={myResponse.status} label={myResponse.status} />
          </div>
        </div>
      ) : quote.status === 'OPEN' ? (
        <div className="rounded-lg border border-ink-300 bg-white p-4">
          <h2 className="mb-4 text-base font-semibold text-ink-900">{t('quotes.respond')}</h2>
          <form
            onSubmit={handleSubmit((data) => {
              setSubmitError('');
              respondMutation.mutate(data);
            })}
            className="flex flex-col gap-4"
          >
            <Input
              label={t('quotes.price')}
              type="number"
              min={1}
              {...register('price', { valueAsNumber: true })}
              error={errors.price?.message}
            />
            <Textarea
              label={t('quotes.notes')}
              rows={3}
              {...register('notes')}
            />
            {submitError && <Alert variant="error" message={submitError} />}
            <div className="flex justify-end">
              <Button type="submit" loading={isSubmitting || respondMutation.isPending}>
                {t('quotes.respond')}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="rounded-lg border border-ink-200 bg-ink-50 p-6">
          <p className="text-sm text-ink-500">This quote is no longer accepting offers.</p>
        </div>
      )}
    </div>
  );
}
