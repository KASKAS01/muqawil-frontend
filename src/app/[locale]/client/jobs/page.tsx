'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import type { Job, Milestone } from '@/types/api';

function MilestoneRow({ milestone, t }: { milestone: Milestone; t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-ink-200 last:border-0">
      <div>
        <p className="text-sm font-medium text-ink-900">{t(`milestones.${milestone.type}`)}</p>
        <p className="text-xs text-ink-500">{milestone.percentage}%</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-ink-900">
          {Number(milestone.amount).toLocaleString()}{' '}
          <span className="font-normal text-ink-500">{t('common.sar')}</span>
        </span>
        <Badge status={milestone.status} label={t(`milestones.status.${milestone.status}`)} />
      </div>
    </div>
  );
}

export default function ClientJobsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: jobsApi.list,
  });

  if (isLoading) return <PageSpinner />;

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold text-ink-900">{t('jobs.title')}</h1>

      {jobs.length === 0 ? (
        <p className="text-sm text-ink-500">{t('jobs.noJobs')}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {jobs.map((job: Job) => (
            <div key={job.id} className="rounded-lg border border-ink-300 bg-white p-4">
              {/* Card header */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Link
                    href={`/${locale}/client/contractor/${job.contractor.id}`}
                    className="font-medium text-primary-600 hover:underline"
                  >
                    {job.contractor.name}
                  </Link>
                  <p className="text-sm text-ink-500">{job.contractor.phone}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-ink-900">
                    {Number(job.quoteResponse.price).toLocaleString()}{' '}
                    <span className="text-sm font-normal text-ink-500">{t('common.sar')}</span>
                  </span>
                  <Badge status={job.status} label={t(`jobs.status.${job.status}`)} />
                </div>
              </div>

              {/* Milestones */}
              <div className="rounded border border-ink-200 px-4">
                {job.milestones.map((m) => (
                  <MilestoneRow key={m.id} milestone={m} t={t} />
                ))}
              </div>

              {/* Action */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => router.push(`/${locale}/client/jobs/${job.id}`)}
                  className="text-sm font-medium text-primary-600 hover:underline"
                >
                  {t('jobs.viewDetail')} →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
