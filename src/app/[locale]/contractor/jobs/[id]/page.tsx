'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi, milestonesApi } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Alert from '@/components/ui/Alert';
import { PageSpinner } from '@/components/ui/Spinner';
import type { Milestone, ChecklistItem } from '@/types/api';

/* ─── Evidence submission form ──────────────────────────────────────── */
function EvidenceForm({
  milestone,
  onSuccess,
}: {
  milestone: Milestone;
  onSuccess: () => void;
}) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [photoUrlsRaw, setPhotoUrlsRaw] = useState(
    milestone.evidence?.photoUrls.join('\n') ?? '',
  );
  const [notes, setNotes] = useState(milestone.evidence?.notes ?? '');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    milestone.evidence?.checklistItems ?? [],
  );
  const [newItem, setNewItem] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      milestonesApi.submitEvidence(milestone.id, {
        photoUrls: photoUrlsRaw.split('\n').map((u) => u.trim()).filter(Boolean),
        notes: notes.trim() || undefined,
        checklistItems: checklist,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', milestone.jobId] });
      onSuccess();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? t('common.error'));
    },
  });

  const addItem = () => {
    if (!newItem.trim()) return;
    setChecklist((p) => [...p, { label: newItem.trim(), checked: false }]);
    setNewItem('');
  };

  return (
    <div className="flex flex-col gap-4">
      <Textarea
        label={t('evidence.photoUrls')}
        rows={3}
        placeholder="https://…"
        hint="One URL per line"
        value={photoUrlsRaw}
        onChange={(e) => setPhotoUrlsRaw(e.target.value)}
      />
      <Textarea
        label={t('evidence.notes')}
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {/* Checklist */}
      <div>
        <p className="mb-2 text-sm font-medium text-ink-700">{t('evidence.checklist')}</p>
        {checklist.map((item, i) => (
          <div key={i} className="mb-1 flex items-center gap-2">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() =>
                setChecklist((p) =>
                  p.map((x, idx) => (idx === i ? { ...x, checked: !x.checked } : x)),
                )
              }
              className="h-4 w-4 rounded border-ink-300 accent-primary-600"
            />
            <span className="flex-1 text-sm text-ink-700">{item.label}</span>
            <button
              type="button"
              onClick={() => setChecklist((p) => p.filter((_, idx) => idx !== i))}
              className="text-xs text-red-600 hover:opacity-80"
            >
              ✕
            </button>
          </div>
        ))}
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
            placeholder={t('evidence.addItem')}
            className="h-9 flex-1 rounded border border-ink-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
          <Button type="button" variant="secondary" size="sm" onClick={addItem}>+</Button>
        </div>
      </div>

      {error && <Alert variant="error" message={error} />}
      <div className="flex justify-end">
        <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>
          {t('evidence.submit')}
        </Button>
      </div>
    </div>
  );
}

/* ─── Evidence read-only view ────────────────────────────────────────── */
function EvidenceView({ milestone, t }: { milestone: Milestone; t: ReturnType<typeof useTranslations> }) {
  if (!milestone.evidence) return null;
  const ev = milestone.evidence;
  return (
    <div className="flex flex-col gap-2">
      {ev.notes && <p className="text-sm text-ink-700">{ev.notes}</p>}
      {ev.photoUrls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ev.photoUrls.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noreferrer"
              className="text-xs font-medium text-primary-600 hover:underline">
              Photo {i + 1}
            </a>
          ))}
        </div>
      )}
      {ev.checklistItems.length > 0 && (
        <ul className="flex flex-col gap-1">
          {ev.checklistItems.map((item, i) => (
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
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────── */
export default function ContractorJobDetailPage() {
  const t = useTranslations();
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsApi.get(id),
  });

  if (isLoading) return <PageSpinner />;
  if (!job) return <Alert variant="error" message={t('common.error')} />;

  return (
    <div className="max-w-2xl">
      {/* Back */}
      <button
        onClick={() => router.push(`/${locale}/contractor/jobs`)}
        className="mb-6 flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline"
      >
        ← {t('common.back')}
      </button>

      {/* ─── Job summary card ──────────────────────────────────────── */}
      <div className="mb-6 rounded-lg border border-ink-300 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-ink-900">{t('common.by')} {job.client.name}</p>
            <p className="text-sm text-ink-500">{job.client.phone}</p>
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

      {/* ─── Milestone cards ──────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {job.milestones.map((milestone: Milestone) => {
          const isExpanded = expandedMilestone === milestone.id;
          const canSubmit = milestone.status === 'PENDING' || milestone.status === 'REJECTED';
          const isPaid = milestone.status === 'PAID';

          return (
            <div key={milestone.id} className="rounded-lg border border-ink-300 bg-white overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-ink-900">{t(`milestones.${milestone.type}`)}</p>
                  <p className="text-sm text-ink-500">
                    {milestone.percentage}% — {Number(milestone.amount).toLocaleString()} {t('common.sar')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={milestone.status} label={t(`milestones.status.${milestone.status}`)} />
                  {canSubmit && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
                    >
                      {t('milestone.submitEvidence')}
                    </Button>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="border-t border-ink-200 px-6 py-4">
                {/* Payment receipt */}
                {isPaid && milestone.paymentIntentId && (
                  <Alert
                    variant="success"
                    message={`${t('payment.status.PAID')} — ${t('payment.receipt')}: ${milestone.paymentIntentId}`}
                    className="mb-3"
                  />
                )}

                {/* Evidence form (expanded) or read-only view */}
                {isExpanded ? (
                  <EvidenceForm
                    milestone={milestone}
                    onSuccess={() => setExpandedMilestone(null)}
                  />
                ) : !isPaid && milestone.evidence ? (
                  <>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                      {t('evidence.title')}
                    </p>
                    <EvidenceView milestone={milestone} t={t} />
                  </>
                ) : isPaid ? null : (
                  <p className="text-sm text-ink-500">{t('evidence.noEvidence')}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
