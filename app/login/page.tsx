'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'motion/react';
import { useLanguage } from '@/hooks/use-language';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Initialise Google Sign-In once the GSI script is ready
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const init = () => {
      const google = (window as any).google;
      if (!google?.accounts?.id) return;

      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential: string }) => {
          setLoading(true);
          setError(null);
          const result = await signIn('credentials', {
            googleToken: response.credential,
            redirect: false,
          });
          setLoading(false);
          if (result?.error) {
            setError(t('loginError') || 'Google sign-in failed');
          } else {
            router.push('/my');
          }
        },
      });

      google.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        { theme: 'outline', size: 'large', width: 400, text: 'continue_with' }
      );
    };

    if ((window as any).google?.accounts?.id) {
      init();
    } else {
      const script = document.querySelector('script[src*="gsi/client"]');
      script?.addEventListener('load', init);
      return () => script?.removeEventListener('load', init);
    }
  }, [router, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email:    formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('loginError') || 'Invalid email or password');
      } else {
        router.push('/my');
      }
    } catch (err) {
      setError(t('loginError') || 'Invalid email or password');
      console.error('Login error:', err);
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
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-black dark:text-white">{t('welcomeBack')}</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('loginDesc')}</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                {t('login')}
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

        {/* GSI renders the official Google button here */}
        <div id="google-signin-btn" className="flex justify-center" />

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          {t('noAccount')}{' '}
          <Link href="/register" className="font-bold text-brand-500 hover:text-brand-400">
            {t('registerHere')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
