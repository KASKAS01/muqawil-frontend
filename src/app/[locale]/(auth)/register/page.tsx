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
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(9),
  role: z.enum(['CLIENT', 'CONTRACTOR']),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { login } = useAuth();
  const [error, setError] = useState('');

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { role: 'CLIENT' } });

  const selectedRole = watch('role');

  async function onSubmit(data: FormData) {
    setError('');
    try {
      const res = await authApi.register(data);
      login(res.access_token);
      if (res.role === 'CLIENT') router.push(`/${locale}/client/quotes`);
      else router.push(`/${locale}/contractor/quotes`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Registration failed');
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-50 px-6 py-8">
      <p className="mb-8 text-2xl font-semibold text-primary-600">MOUQAWEL AI</p>

      <div className="w-full max-w-sm rounded-lg border border-ink-300 bg-white p-6">
        <h1 className="mb-6 text-lg font-semibold text-ink-900">{t('auth.register')}</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label={t('auth.name')} autoComplete="name" {...register('name')} error={errors.name?.message} />
          <Input label={t('auth.email')} type="email" autoComplete="email" {...register('email')} error={errors.email?.message} />
          <Input label={t('auth.password')} type="password" autoComplete="new-password" {...register('password')} error={errors.password?.message} />
          <Input label={t('auth.phone')} type="tel" autoComplete="tel" {...register('phone')} error={errors.phone?.message} />

          {/* DGA role toggle — pill segmented control */}
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-ink-700">{t('auth.role')}</p>
            <div className="flex overflow-hidden rounded-lg border border-ink-300">
              {(['CLIENT', 'CONTRACTOR'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setValue('role', r)}
                  className={[
                    'flex-1 py-2 text-base font-medium transition-colors',
                    selectedRole === r
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-ink-700 hover:bg-primary-50',
                  ].join(' ')}
                >
                  {r === 'CLIENT' ? t('auth.roleClient') : t('auth.roleContractor')}
                </button>
              ))}
            </div>
            {errors.role && <p className="text-sm text-red-600">{errors.role.message}</p>}
          </div>

          {error && <Alert variant="error" message={error} />}
          <Button type="submit" loading={isSubmitting} size="lg" className="mt-2 w-full">
            {t('auth.register')}
          </Button>
        </form>

        <p className="mt-6 text-center text-base text-ink-500">
          {t('auth.hasAccount')}{' '}
          <Link href={`/${locale}/login`} className="font-medium text-primary-600 hover:underline">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
