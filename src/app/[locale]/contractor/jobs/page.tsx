'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import type { Job, Milestone } from '@/types/api';

export default function ContractorJobsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: jobsApi.list,
  });

  if (isLoading) return <PageSpinner />;

  const grouped: Record<string, Job[]> = { ACTIVE: [], COMPLETED: [], DISPUTED: [] };
  jobs.forEach((j: Job) => grouped[j.status]?.push(j));

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold text-ink-900">{t('jobs.title')}</h1>

      {jobs.length === 0 ? (
        <p className="text-sm text-ink-500">{t('jobs.noJobs')}</p>
      ) : (
        /* ─── Kanban columns ── */
        <div className="grid gap-6 md:grid-cols-3">
          {(['ACTIVE', 'COMPLETED', 'DISPUTED'] as const).map((status) => (
            <div key={status}>
              {/* Column header */}
              <div className="mb-3 flex items-center gap-2">
                <Badge status={status} label={t(`jobs.status.${status}`)} />
                <span className="text-xs text-ink-500">({grouped[status].length})</span>
              </div>

              {/* Column cards */}
              <div className="flex flex-col gap-3">
                {grouped[status].map((job) => {
                  const total = job.milestones.length;
                  const paid  = job.milestones.filter((m: Milestone) => m.status === 'PAID').length;
                  const pct   = total ? Math.round((paid / total) * 100) : 0;

                  return (
                    <button
                      key={job.id}
                      onClick={() => router.push(`/${locale}/contractor/jobs/${job.id}`)}
                      className="w-full rounded-lg border border-ink-300 bg-white p-4 text-start transition-colors hover:border-primary-600 hover:bg-primary-50"
                    >
                      <p className="text-sm font-medium text-ink-900">{job.client.name}</p>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-ink-900">
                        {Number(job.quoteResponse.price).toLocaleString()}{' '}
                        <span className="font-normal text-ink-500">{t('common.sar')}</span>
                      </p>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="mb-1 flex justify-between text-xs text-ink-500">
                          <span>Milestones</span>
                          <span>{paid}/{total}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-200">
                          <div
                            className="h-full rounded-full bg-primary-600 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
