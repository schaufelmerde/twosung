'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Github, Linkedin, Twitter } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-black/10 dark:border-white/10 bg-white dark:bg-black py-12 text-gray-500 dark:text-gray-400 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center">
              <Image
                src="/twosung_logo_v2.svg"
                alt="Twosung"
                width={120}
                height={42}
                className="h-9 w-auto block dark:hidden"
              />
              <Image
                src="/twosung_logo_white_v2.svg"
                alt="Twosung"
                width={120}
                height={42}
                className="h-9 w-auto hidden dark:block"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              {t('footerDesc')}
            </p>
            <div className="mt-6 flex space-x-4">
              <Link href="#" className="hover:text-black dark:hover:text-white transition-colors"><Twitter className="h-5 w-5" /></Link>
              <Link href="#" className="hover:text-black dark:hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></Link>
              <Link href="#" className="hover:text-black dark:hover:text-white transition-colors"><Github className="h-5 w-5" /></Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white">{t('company')}</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-brand-500 transition-colors">{t('about')}</Link></li>
              <li><Link href="/savings" className="hover:text-brand-500 transition-colors">{t('savings')}</Link></li>
              <li><Link href="#" className="hover:text-brand-500 transition-colors">{t('technology')}</Link></li>
              <li><Link href="#" className="hover:text-brand-500 transition-colors">{t('careers')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white">{t('contact')}</h3>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-brand-500 shrink-0" />
                <span>{t('address')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-brand-500 shrink-0" />
                <span>+82 51-123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-brand-500 shrink-0" />
                <span>contact@smartfactory.com</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-black/10 dark:border-white/10 pt-8 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} Twosung Co. {t('allRightsReserved')} {t('supportedBy')}</p>
        </div>
      </div>
    </footer>
  );
}
