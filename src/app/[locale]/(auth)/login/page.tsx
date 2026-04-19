'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { login } = useAuth();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setError('');
    try {
      const res = await authApi.login(data);
      login(res.access_token);
      if (res.role === 'CLIENT') router.push(`/${locale}/client/quotes`);
      else if (res.role === 'CONTRACTOR') router.push(`/${locale}/contractor/quotes`);
      else router.push(`/${locale}`);
    } catch {
      setError('Invalid email or password');
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-50 px-6 py-8">
      <p className="mb-8 text-2xl font-semibold text-primary-600">MOUQAWEL AI</p>

      {/* DGA auth card — p-6 for form breathing room */}
      <div className="w-full max-w-sm rounded-lg border border-ink-300 bg-white p-6">
        <h1 className="mb-6 text-lg font-semibold text-ink-900">{t('auth.login')}</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label={t('auth.email')} type="email" autoComplete="email"
            {...register('email')} error={errors.email?.message} />
          <Input label={t('auth.password')} type="password" autoComplete="current-password"
            {...register('password')} error={errors.password?.message} />
          {error && <Alert variant="error" message={error} />}
          <Button type="submit" loading={isSubmitting} size="lg" className="mt-2 w-full">
            {t('auth.login')}
          </Button>
        </form>

        <p className="mt-6 text-center text-base text-ink-500">
          {t('auth.noAccount')}{' '}
          <Link href={`/${locale}/register`} className="font-medium text-primary-600 hover:underline">
            {t('auth.register')}
          </Link>
        </p>
      </div>
    </div>
  );
}
