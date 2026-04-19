'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { quotesApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

const CATEGORIES = [
  'PLUMBING', 'ELECTRICAL', 'PAINTING',
  'TILING', 'CARPENTRY', 'HVAC', 'GENERAL',
] as const;

const schema = z.object({
  category: z.enum(CATEGORIES),
  district: z.string().min(2),
  description: z.string().min(10),
  photoUrlsRaw: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function NewQuotePage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'GENERAL' },
  });

  async function onSubmit(data: FormData) {
    setError('');
    try {
      const photoUrls = data.photoUrlsRaw
        ? data.photoUrlsRaw.split('\n').map((u) => u.trim()).filter(Boolean)
        : [];
      await quotesApi.create({
        category: data.category,
        district: data.district,
        description: data.description,
        photoUrls,
      });
      await queryClient.invalidateQueries({ queryKey: ['quotes', 'mine'] });
      router.push(`/${locale}/client/quotes`);
    } catch {
      setError('Failed to create quote request');
    }
  }

  return (
    <div className="max-w-lg">
      {/* ─── Page header ──────────────────────────────────────────── */}
      <h1 className="mb-8 text-2xl font-semibold text-ink-900">{t('quotes.new')}</h1>

      {/* ─── DGA Form Card ────────────────────────────────────────── */}
      <div className="rounded-lg border border-ink-300 bg-white p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Select
            label={t('quotes.category')}
            {...register('category')}
            error={errors.category?.message}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{t(`category.${c}`)}</option>
            ))}
          </Select>

          <Input
            label={t('quotes.district')}
            placeholder="e.g. Al Olaya, Al Malqa"
            {...register('district')}
            error={errors.district?.message}
          />

          <Textarea
            label={t('quotes.description')}
            rows={4}
            placeholder="Describe the work needed…"
            {...register('description')}
            error={errors.description?.message}
          />

          <Textarea
            label={t('quotes.photoUrls')}
            rows={3}
            hint="One URL per line"
            placeholder="https://…"
            {...register('photoUrlsRaw')}
          />

          {error && <Alert variant="error" message={error} />}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push(`/${locale}/client/quotes`)}
            >
              {t('common.back')}
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {t('quotes.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
