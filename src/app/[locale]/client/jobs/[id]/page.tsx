'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { jobsApi, milestonesApi, paymentsApi } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { PageSpinner } from '@/components/ui/Spinner';
import type { Milestone } from '@/types/api';

export default function ClientJobDetailPage() {
  const t = useTranslations();
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<Record<string, string>>({});

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsApi.get(id),
  });

  const clearError = (mid: string) =>
    setActionError((p) => ({ ...p, [mid]: '' }));

  const onErr = (err: unknown, mid: string) => {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
    setActionError((p) => ({ ...p, [mid]: msg ?? t('common.error') }));
  };

  const approveMutation = useMutation({
    mutationFn: (mid: string) => milestonesApi.approve(mid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['job', id] }),
    onError: (e, mid) => onErr(e, mid),
  });
  const rejectMutation = useMutation({
    mutationFn: (mid: string) => milestonesApi.reject(mid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['job', id] }),
    onError: (e, mid) => onErr(e, mid),
  });
  const payMutation = useMutation({
    mutationFn: (mid: string) => paymentsApi.pay(mid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['job', id] }),
    onError: (e, mid) => onErr(e, mid),
  });

  if (isLoading) return <PageSpinner />;
  if (!job) return <Alert variant="error" message={t('common.error')} />;

  const isBusy = approveMutation.isPending || rejectMutation.isPending || payMutation.isPending;

  return (
    <div className="max-w-2xl">
      {/* Back link */}
      <button
        onClick={() => router.push(`/${locale}/client/jobs`)}
        className="mb-6 flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline"
      >
        ← {t('common.back')}
      </button>

      {/* ─── Job summary card ───────────────────────────────────────── */}
      <div className="mb-6 rounded-lg border border-ink-300 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href={`/${locale}/client/contractor/${job.contractor.id}`}
              className="font-semibold text-primary-600 hover:underline"
            >
              {job.contractor.name}
            </Link>
            <p className="text-sm text-ink-500">{job.contractor.phone}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-semibold text-ink-900">
              {Number(job.quoteResponse.price).toLocaleString()}{' '}
              <span className="text-sm font-normal text-ink-500">{t('common.sar')}</span>
            </span>
            <Badge status={job.status} label={t(`jobs.status.${job.status}`)} />
          </div>
        </div>
      </div>

      {/* ─── Milestone cards ────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {job.milestones.map((milestone: Milestone) => (
          <div key={milestone.id} className="rounded-lg border border-ink-300 bg-white overflow-hidden">
            {/* Milestone header */}
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-medium text-ink-900">{t(`milestones.${milestone.type}`)}</p>
                <p className="text-sm text-ink-500">
                  {milestone.percentage}% —{' '}
                  {Number(milestone.amount).toLocaleString()} {t('common.sar')}
                </p>
              </div>
              <Badge status={milestone.status} label={t(`milestones.status.${milestone.status}`)} />
            </div>

            {/* Milestone body */}
            <div className="border-t border-ink-200 px-6 py-4">
              {/* Payment receipt */}
              {milestone.status === 'PAID' && milestone.paymentIntentId && (
                <Alert
                  variant="success"
                  message={`${t('payment.receipt')}: ${milestone.paymentIntentId}`}
                  className="mb-4"
                />
              )}

              {/* Evidence section */}
              {milestone.evidence ? (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                    {t('evidence.title')}
                  </p>
                  {milestone.evidence.notes && (
                    <p className="text-sm text-ink-700">{milestone.evidence.notes}</p>
                  )}
                  {milestone.evidence.photoUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {milestone.evidence.photoUrls.map((url, i) => (
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
                  {milestone.evidence.checklistItems.length > 0 && (
                    <ul className="flex flex-col gap-1">
                      {milestone.evidence.checklistItems.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <span className={item.checked ? 'text-green-600' : 'text-ink-300'}>
                            {item.checked ? '✓' : '○'}
                          </span>
                          <span className={item.checked ? 'line-through text-ink-500' : 'text-ink-700'}>
                            {item.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Approve / Reject */}
                  {milestone.status === 'SUBMITTED' && (
                    <div className="mt-2 flex gap-2">
                      <Button
                        onClick={() => { clearError(milestone.id); approveMutation.mutate(milestone.id); }}
                        loading={isBusy}
                        className="flex-1"
                      >
                        {t('milestone.approve')}
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => { clearError(milestone.id); rejectMutation.mutate(milestone.id); }}
                        disabled={isBusy}
                        className="flex-1"
                      >
                        {t('milestone.reject')}
                      </Button>
                    </div>
                  )}

                  {/* Pay Now */}
                  {milestone.status === 'APPROVED' && (
                    <Button
                      onClick={() => { clearError(milestone.id); payMutation.mutate(milestone.id); }}
                      loading={isBusy}
                      className="mt-2 w-full bg-green-600 hover:bg-green-700 focus:ring-green-600"
                    >
                      {t('payment.payNow')} — {Number(milestone.amount).toLocaleString()} {t('common.sar')}
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-ink-500">{t('evidence.noEvidence')}</p>
              )}

              {actionError[milestone.id] && (
                <Alert variant="error" message={actionError[milestone.id]} className="mt-3" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
