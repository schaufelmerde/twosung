'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Factory, Cpu, Settings, Trophy } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="relative h-[50vh] overflow-hidden">
        <Image
          src="/about/about-hero.png"
          alt="About Us Hero"
          fill
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-white dark:from-black/60 dark:to-black"></div>
        <div className="container relative z-10 mx-auto flex h-full flex-col justify-center px-4">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display text-5xl font-bold tracking-tighter sm:text-7xl text-black dark:text-white uppercase"
          >
            {t('aboutUs')}
          </motion.h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-600 dark:text-gray-400">
            {t('aboutDesc')}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-brand-500">{t('mission')}</h2>
            <h3 className="mt-4 font-display text-4xl font-bold tracking-tight text-black dark:text-white uppercase">{t('missionTitle')}</h3>
            <p className="mt-6 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
              {t('missionDesc1')}
            </p>
            <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
              {t('missionDesc2')}
            </p>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-3xl border border-black/10 dark:border-white/10">
            <Image
              src="/about/team.jpg"
              alt="Team"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Project Overview */}
      <section className="bg-black/5 dark:bg-white/5 py-24 transition-colors">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="font-display text-4xl font-bold tracking-tight text-black dark:text-white uppercase">{t('sortingSystem')}</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">{t('sortingDesc')}</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-2xl bg-white dark:bg-black p-8 border border-black/5 dark:border-white/5 transition-colors">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                <Cpu className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-black dark:text-white">{t('aiVision')}</h4>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t('aiVisionDesc')}
              </p>
            </div>
            <div className="rounded-2xl bg-white dark:bg-black p-8 border border-black/5 dark:border-white/5 transition-colors">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                <Settings className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-black dark:text-white">{t('robotArm')}</h4>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t('robotArmDesc')}
              </p>
            </div>
            <div className="rounded-2xl bg-white dark:bg-black p-8 border border-black/5 dark:border-white/5 transition-colors">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                <Factory className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-black dark:text-white">{t('smartWelding')}</h4>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t('smartWeldingDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Acknowledgement */}
      <section className="container mx-auto px-4 py-24">
        <div className="rounded-3xl bg-brand-500 p-8 text-white md:p-16">
          <div className="flex flex-col items-center gap-8 text-center md:flex-row md:text-left">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-black/10">
              <Trophy className="h-10 w-10" />
            </div>
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight uppercase">{t('creditTitle')}</h2>
              <p className="mt-4 text-lg font-medium opacity-80">
                {t('creditDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
