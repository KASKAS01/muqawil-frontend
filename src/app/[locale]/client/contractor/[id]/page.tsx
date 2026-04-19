'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import Alert from '@/components/ui/Alert';
import type { ContractorProfileJob } from '@/types/api';

export default function ContractorProfilePage() {
  const t = useTranslations();
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: profile, isLoading } = useQuery({
    queryKey: ['contractor', id],
    queryFn: () => usersApi.getContractorProfile(id),
  });

  if (isLoading) return <PageSpinner />;
  if (!profile) return <Alert variant="error" message={t('common.error')} />;

  return (
    <div className="max-w-2xl">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline"
      >
        ← {t('common.back')}
      </button>

      {/* ─── Profile header card ──────────────────────────────────── */}
      <div className="mb-6 rounded-lg border border-ink-300 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-ink-900">{profile.name}</h1>
            <p className="mt-1 text-base text-ink-500">{profile.phone}</p>
            <p className="mt-1 text-sm text-ink-400">
              {t('contractor.memberSince')}{' '}
              {new Date(profile.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-GB', {
                year: 'numeric',
                month: 'long',
              })}
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-semibold text-primary-600">{profile.completedJobsCount}</p>
              <p className="text-xs text-ink-500">{t('contractor.completedJobs')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-ink-700">{profile.activeJobsCount}</p>
              <p className="text-xs text-ink-500">{t('contractor.activeJobs')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Completed job history ────────────────────────────────── */}
      <div className="rounded-lg border border-ink-300 bg-white p-4">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-500">
          {t('contractor.jobHistory')}
        </p>

        {profile.completedJobs.length === 0 ? (
          <p className="text-base text-ink-500">{t('contractor.noHistory')}</p>
        ) : (
          <div className="flex flex-col divide-y divide-ink-100">
            {profile.completedJobs.map((job: ContractorProfileJob) => (
              <div key={job.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge status="COMPLETED" label={t(`category.${job.category}`)} />
                  <span className="text-base text-ink-700">{job.district}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-base font-semibold text-ink-900">
                    {Number(job.price).toLocaleString()}{' '}
                    <span className="text-sm font-normal text-ink-500">{t('common.sar')}</span>
                  </span>
                  <span className="text-sm text-ink-400">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
