'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Menu, X, ShoppingCart, User, LogOut, Sun, Moon, Globe } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { signOut } from 'next-auth/react';
import { useLanguage } from '@/hooks/use-language';
import { useTheme } from '@/hooks/use-theme';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  const isHome = pathname === '/';

  React.useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  const navItems = [
    { name: t('home'), href: '/' },
    { name: t('about'), href: '/about' },
    { name: t('savings'), href: '/savings' },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const transparent = isHome && !scrolled;

  return (
    <nav className={cn(
      'top-0 z-50 w-full transition-all duration-300',
      isHome ? 'fixed' : 'sticky',
      transparent
        ? 'border-b border-transparent bg-transparent'
        : 'border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md'
    )}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/twosung_logo_v2.svg"
                alt="Twosung"
                width={120}
                height={42}
                className={cn('h-9 w-auto', transparent ? 'hidden' : 'block dark:hidden')}
                priority
              />
              <Image
                src="/twosung_logo_white_v2.svg"
                alt="Twosung"
                width={120}
                height={42}
                className={cn('h-9 w-auto', transparent ? 'block' : 'hidden dark:block')}
                priority
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-brand-500',
                    pathname === item.href
                      ? 'text-brand-500'
                      : transparent ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'
                  )}
                >
                  {item.name}
                </Link>
              ))}
              {user && (
                <Link
                  href="/my"
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-brand-500',
                    pathname.startsWith('/my')
                      ? 'text-brand-500'
                      : transparent ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'
                  )}
                >
                  {t('dashboard')}
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={cn(
                'p-2 rounded-full transition-colors',
                transparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'
              )}
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ko' : 'en')}
              className={cn(
                'flex items-center gap-1 p-2 rounded-full transition-colors text-sm font-bold',
                transparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'
              )}
              title="Switch Language"
            >
              <Globe className="h-5 w-5" />
              <span className="uppercase">{language}</span>
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/order/new"
                  className="flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600 transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {t('newOrder')}
                </Link>
                <div className={cn(
                  'flex items-center gap-2 text-sm',
                  transparent ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'
                )}>
                  <User className="h-4 w-4" />
                  <span>{profile?.contactName || user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className={cn(
                    'transition-colors',
                    transparent ? 'text-white/60 hover:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                  )}
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-brand-500',
                    transparent ? 'text-white/80' : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
                  )}
                >
                  {t('login')}
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600 transition-colors"
                >
                  {t('getStarted')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button onClick={toggleTheme} className="p-2 text-gray-400">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white dark:bg-black border-b border-black/10 dark:border-white/10"
        >
          <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'block rounded-md px-3 py-2 text-base font-medium',
                  pathname === item.href ? 'bg-brand-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                {item.name}
              </Link>
            ))}
            {user && (
              <Link
                href="/my"
                onClick={() => setIsOpen(false)}
                className={cn(
                  'block rounded-md px-3 py-2 text-base font-medium',
                  pathname.startsWith('/my') ? 'bg-brand-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                {t('dashboard')}
              </Link>
            )}
            <div className="mt-4 border-t border-black/10 dark:border-white/10 pt-4">
              <button
                onClick={() => setLanguage(language === 'en' ? 'ko' : 'en')}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300"
              >
                <Globe className="h-5 w-5" />
                {language === 'en' ? '한국어' : 'English'}
              </button>
              {user ? (
                <>
                  <Link
                    href="/order/new"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-md px-3 py-2 text-base font-medium text-brand-500"
                  >
                    {t('newOrder')}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="mt-2 block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {t('logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="mt-2 block rounded-md bg-brand-500 px-3 py-2 text-base font-bold text-white text-center"
                  >
                    {t('getStarted')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
