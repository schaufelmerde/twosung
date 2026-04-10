'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'motion/react';
import { useLanguage } from '@/hooks/use-language';
import { Building, User, Phone, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function RegisterPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Create customer + user_auth records in MySQL
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: formData.companyName,
          contactName: formData.contactName,
          phone:       formData.phone || undefined,
          email:       formData.email,
          password:    formData.password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create account');
        return;
      }

      // 2. Auto-login after successful registration
      const result = await signIn('credentials', {
        email:    formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        // Registration succeeded but login failed — send to login page
        router.push('/login');
      } else {
        router.push('/my');
      }
    } catch (err) {
      setError('Failed to create account');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8 rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-8 shadow-2xl dark:shadow-none backdrop-blur-xl"
      >
        <div className="text-center">
          <div className="mx-auto">
            <Image src="/twosung_logo_v2.svg" alt="Twosung" width={140} height={50} className="h-12 w-auto block dark:hidden" />
            <Image src="/twosung_logo_white_v2.svg" alt="Twosung" width={140} height={50} className="h-12 w-auto hidden dark:block" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-black dark:text-white">{t('createAccount')}</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('registerDesc')}</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <Building className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="text"
                required
                placeholder={t('companyName')}
                className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/40 py-3 pl-10 pr-4 text-sm text-black dark:text-white focus:border-brand-500 focus:outline-none transition-colors"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="text"
                required
                placeholder={t('contactName')}
                className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/40 py-3 pl-10 pr-4 text-sm text-black dark:text-white focus:border-brand-500 focus:outline-none transition-colors"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="tel"
                placeholder={t('phoneNumber')}
                className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/40 py-3 pl-10 pr-4 text-sm text-black dark:text-white focus:border-brand-500 focus:outline-none transition-colors"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="email"
                required
                placeholder={t('emailAddress')}
                className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/40 py-3 pl-10 pr-4 text-sm text-black dark:text-white focus:border-brand-500 focus:outline-none transition-colors"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="password"
                required
                placeholder={t('password')}
                className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/40 py-3 pl-10 pr-4 text-sm text-black dark:text-white focus:border-brand-500 focus:outline-none transition-colors"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-4 text-sm font-bold text-white transition-all hover:bg-brand-600 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {t('getStarted')}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="relative flex items-center gap-3">
          <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
          <span className="text-xs text-gray-400">{t('orDivider')}</span>
          <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
        </div>

        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/my' })}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 py-3 text-sm font-medium text-black dark:text-white transition-all hover:bg-black/5 dark:hover:bg-white/10"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {t('continueWithGoogle')}
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          {t('alreadyHaveAccount')}{' '}
          <Link href="/login" className="font-bold text-brand-500 hover:text-brand-400">
            {t('login')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
