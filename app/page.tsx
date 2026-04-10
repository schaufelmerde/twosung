'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ArrowRight, Zap, ShieldCheck, Cpu, BarChart3, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 pt-20 pb-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://picsum.photos/seed/factory/1920/1080?blur=2"
            alt="Smart Factory Hero"
            fill
            className="object-cover opacity-30"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white dark:from-black dark:via-black/80 dark:to-black"></div>
        </div>

        <div className="container relative z-10 mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-5xl font-bold tracking-tighter sm:text-7xl md:text-8xl text-black dark:text-white">
              {t('heroTitle')} <br />
              <span className="text-brand-500">{t('heroSubtitle')}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400 md:text-xl">
              {t('heroDesc')}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="group flex items-center gap-2 rounded-full bg-brand-500 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-brand-600"
              >
                {t('placeOrder')}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/savings"
                className="rounded-full border border-black/10 dark:border-white/20 bg-black/5 dark:bg-white/5 px-8 py-4 text-lg font-bold text-black dark:text-white backdrop-blur-sm transition-all hover:bg-black/10 dark:hover:bg-white/10"
              >
                {t('calculateSavings')}
              </Link>
            </div>
          </motion.div>
        </div>

      </section>

      {/* Stats Bar */}
      <div className="hidden md:block border-t border-black/10 dark:border-white/10 bg-white dark:bg-black">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-brand-500">{t('efficiency')}</p>
              <p className="mt-2 text-3xl font-bold text-black dark:text-white">{t('precision')}</p>
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-brand-500">{t('costReduction')}</p>
              <p className="mt-2 text-3xl font-bold text-black dark:text-white">{t('average')}</p>
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-brand-500">{t('defectRate')}</p>
              <p className="mt-2 text-3xl font-bold text-black dark:text-white">{t('ngRate')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="bg-white dark:bg-black py-24 transition-colors">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl text-black dark:text-white uppercase">{t('techTitle')}</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">{t('techDesc')}</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <Cpu className="h-8 w-8 text-brand-500" />,
                title: t('aiVision'),
                desc: t('aiVisionDesc')
              },
              {
                icon: <Zap className="h-8 w-8 text-brand-500" />,
                title: t('robotArm'),
                desc: t('robotArmDesc')
              },
              {
                icon: <ShieldCheck className="h-8 w-8 text-brand-500" />,
                title: t('smartWelding'),
                desc: t('smartWeldingDesc')
              },
              {
                icon: <BarChart3 className="h-8 w-8 text-brand-500" />,
                title: t('plcIntegration'),
                desc: t('plcIntegrationDesc')
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 p-8 transition-colors hover:border-brand-500/50"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="mb-2 text-xl font-bold text-black dark:text-white">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Savings Teaser */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://picsum.photos/seed/welding/1920/1080?grayscale"
            alt="Welding Background"
            fill
            className="object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="rounded-3xl border border-white/10 bg-black/60 p-8 backdrop-blur-xl md:p-16">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="font-display text-4xl font-bold tracking-tight sm:text-6xl text-white">
                  {t('shipsBuiltWithUs')} <br />
                  <span className="text-brand-500">{t('costLess')}</span>
                </h2>
                <p className="mt-6 text-lg text-gray-300">
                  {t('savingsTeaserDesc')}
                </p>
                <Link
                  href="/savings"
                  className="mt-10 inline-flex items-center gap-2 text-lg font-bold text-brand-500 hover:text-brand-400"
                >
                  {t('seeBreakdown')}
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/5 p-6 text-center">
                  <p className="text-4xl font-bold text-white">4.5h</p>
                  <p className="mt-2 text-xs uppercase tracking-widest text-gray-500">{t('conventionalTime')}</p>
                </div>
                <div className="rounded-2xl bg-brand-500 p-6 text-center">
                  <p className="text-4xl font-bold text-white">65s</p>
                  <p className="mt-2 text-xs uppercase tracking-widest text-white/60">{t('smartFactoryTime')}</p>
                </div>
                <div className="col-span-2 rounded-2xl bg-white/5 p-6 text-center">
                  <p className="text-4xl font-bold text-white">{t('labourSavings')}</p>
                  <p className="mt-2 text-xs uppercase tracking-widest text-gray-500">{t('onLabourCosts')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
