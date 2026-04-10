'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { motion } from 'motion/react';
import { Package, Clock, CheckCircle2, AlertCircle, ChevronRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/hooks/use-language';

interface Order {
  id: string;
  orderId: string;
  shipType: string;
  status: 'PENDING' | 'QUEUED' | 'IN_PROGRESS' | 'COMPLETE' | 'CANCELLED';
  priority: number;
  dueDate: string;
  totalItems: number;
  estimatedCost: number;
  createdAt: string;
}

export default function MyDashboardPage() {
  const { t } = useLanguage();
  const { user, profile, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          setOrders(await res.json());
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 30_000);
    return () => clearInterval(interval);
  }, [user]);

  const filteredOrders = orders.filter(o => filter === 'ALL' || o.status === filter);

  const stats = {
    total:      orders.length,
    inProgress: orders.filter(o => o.status === 'IN_PROGRESS' || o.status === 'QUEUED').length,
    complete:   orders.filter(o => o.status === 'COMPLETE').length,
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-black dark:text-white uppercase">MY <span className="text-brand-500">DASHBOARD</span></h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">{t('welcomeBack')}, {profile?.contactName || user?.email}</p>
        </div>
        <Link
          href="/order/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-bold text-white hover:bg-brand-600 transition-all"
        >
          <Package className="h-4 w-4" />
          {t('newOrder')}
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-12">
        <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{t('totalOrders')}</p>
          <p className="mt-2 text-4xl font-bold text-black dark:text-white">{stats.total}</p>
        </div>
        <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-500">{t('inProgress')}</p>
          <p className="mt-2 text-4xl font-bold text-black dark:text-white">{stats.inProgress}</p>
        </div>
        <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-green-500">{t('completed')}</p>
          <p className="mt-2 text-4xl font-bold text-black dark:text-white">{stats.complete}</p>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h3 className="text-xl font-bold text-black dark:text-white">{t('recentOrders')}</h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETE', 'CANCELLED'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  filter === s ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              >
                {t(s.toLowerCase()) || s}
              </button>
            ))}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-black/10 dark:border-white/10 p-20 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-500">{t('noOrdersFound')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.map((order) => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative overflow-hidden rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 p-6 transition-all hover:border-brand-500/30"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      order.status === 'COMPLETE' ? 'bg-green-500/10 text-green-500' :
                      order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                      'bg-brand-500/10 text-brand-500'
                    }`}>
                      {order.status === 'COMPLETE' ? <CheckCircle2 className="h-6 w-6" /> :
                       order.status === 'CANCELLED' ? <AlertCircle className="h-6 w-6" /> :
                       <Clock className="h-6 w-6" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-black dark:text-white">{order.orderId}</p>
                      <p className="text-xs text-gray-500">{order.shipType} • {order.totalItems} {t('items')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
                    <div className="hidden md:block">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('status')}</p>
                      <p className={`mt-1 text-xs font-bold ${
                        order.status === 'COMPLETE' ? 'text-green-500' :
                        order.status === 'CANCELLED' ? 'text-red-500' :
                        'text-brand-500'
                      }`}>{t(order.status.toLowerCase())}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('dueDate')}</p>
                      <p className="mt-1 text-xs font-bold text-gray-600 dark:text-gray-300">
                        {order.dueDate ? format(new Date(order.dueDate), 'MMM dd, yyyy') : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right md:text-left">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('estCost')}</p>
                      <p className="mt-1 text-xs font-bold text-black dark:text-white">${(order.estimatedCost * 0.6).toLocaleString()}</p>
                    </div>
                  </div>

                  <Link
                    href={`/my/orders/${order.id}`}
                    className="flex items-center justify-center gap-2 rounded-xl bg-black/5 dark:bg-white/5 px-4 py-2 text-xs font-bold text-black dark:text-white transition-all hover:bg-black/10 dark:hover:bg-white/10"
                  >
                    {t('viewDetails')}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
