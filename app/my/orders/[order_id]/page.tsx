'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { motion } from 'motion/react';
import { Package, Clock, CheckCircle2, AlertCircle, ChevronLeft, Loader2, BarChart3, Info } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/hooks/use-language';

interface OrderItem {
  id: string;
  itemId: string;
  part1Name: string;
  part2Name: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETE' | 'NG';
  completedAt?: string | null;
  ngReason?: string | null;
  sortBin?: number | null;
}

interface Order {
  id: string;
  orderId: string;
  shipType: string;
  status: 'PENDING' | 'QUEUED' | 'IN_PROGRESS' | 'COMPLETE' | 'CANCELLED';
  priority: number;
  dueDate: string;
  notes?: string | null;
  totalItems: number;
  estimatedCost: number;
  createdAt: string;
}

export default function OrderDetailPage() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const orderId = params.order_id as string;

  const fetchData = useCallback(async () => {
    if (!user || !orderId) return;

    const [orderRes, itemsRes] = await Promise.all([
      fetch(`/api/orders/${orderId}`),
      fetch(`/api/orders/${orderId}/items`),
    ]);

    if (orderRes.status === 404) {
      router.push('/my');
      return;
    }

    if (orderRes.ok) setOrder(await orderRes.json());
    if (itemsRes.ok) setItems(await itemsRes.json());
    setLoading(false);
  }, [user, orderId, router]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleCancel = async () => {
    if (!order || !['PENDING', 'QUEUED'].includes(order.status)) return;
    if (!window.confirm(t('confirmCancel') || 'Are you sure you want to cancel this order?')) return;

    const res = await fetch(`/api/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CANCELLED' }),
    });

    if (res.ok) {
      setOrder((prev) => prev ? { ...prev, status: 'CANCELLED' } : prev);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!order) return null;

  const completedItems = items.filter(i => i.status === 'COMPLETE').length;
  const progress = order.totalItems > 0 ? (completedItems / order.totalItems) * 100 : 0;

  const steps = ['PENDING', 'QUEUED', 'IN_PROGRESS', 'COMPLETE'];
  const currentStepIndex = steps.indexOf(order.status);

  return (
    <div className="container mx-auto px-4 py-12">
      <button
        onClick={() => router.back()}
        className="mb-8 flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        {t('backToDashboard')}
      </button>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Order Header */}
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">{order.orderId}</h1>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    order.status === 'COMPLETE' ? 'bg-green-500/10 text-green-500' :
                    order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                    'bg-brand-500/10 text-brand-500'
                  }`}>
                    {t(order.status.toLowerCase())}
                  </span>
                </div>
                <p className="text-gray-500 dark:text-gray-400">{order.shipType} • {t('priority')} {t('level')} {order.priority}</p>
              </div>
              {['PENDING', 'QUEUED'].includes(order.status) && (
                <button
                  onClick={handleCancel}
                  className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-all"
                >
                  {t('cancelOrder')}
                </button>
              )}
            </div>

            {/* Progress Tracker */}
            <div className="mt-12">
              <div className="relative flex justify-between">
                <div className="absolute top-1/2 left-0 h-0.5 w-full -translate-y-1/2 bg-black/10 dark:bg-white/10"></div>
                <div
                  className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-brand-500 transition-all duration-1000"
                  style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
                ></div>
                {steps.map((step, i) => (
                  <div key={step} className="relative z-10 flex flex-col items-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                      currentStepIndex >= i ? 'border-brand-500 bg-white dark:bg-black text-brand-500' : 'border-black/10 dark:border-white/10 bg-white dark:bg-black text-gray-500'
                    }`}>
                      {currentStepIndex > i ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                    </div>
                    <span className={`mt-2 text-[10px] font-bold uppercase tracking-widest ${
                      currentStepIndex >= i ? 'text-black dark:text-white' : 'text-gray-500'
                    }`}>{t(step.toLowerCase())}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sub-Assembly Progress */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2 text-black dark:text-white">
              <BarChart3 className="h-5 w-5 text-brand-500" />
              {t('productionProgress')}
            </h3>
            <div className="overflow-hidden rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <tr>
                    <th className="px-6 py-4">{t('itemNo')}</th>
                    <th className="px-6 py-4">{t('part1')}</th>
                    <th className="px-6 py-4">{t('part2')}</th>
                    <th className="px-6 py-4">{t('status')}</th>
                    <th className="px-6 py-4">{t('sortBin')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {items.map((item, i) => (
                    <tr key={item.id} className="group hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-gray-500">{i + 1}</td>
                      <td className="px-6 py-4 font-medium text-black dark:text-white">{item.part1Name}</td>
                      <td className="px-6 py-4 font-medium text-black dark:text-white">{item.part2Name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          item.status === 'COMPLETE' ? 'text-green-500' :
                          item.status === 'NG' ? 'text-red-500' :
                          'text-brand-500'
                        }`}>
                          {item.status === 'COMPLETE' ? <CheckCircle2 className="h-3 w-3" /> :
                           item.status === 'NG' ? <AlertCircle className="h-3 w-3" /> :
                           <Clock className="h-3 w-3" />}
                          {t(item.status.toLowerCase())}
                        </span>
                        {item.ngReason && (
                          <p className="mt-1 text-[10px] text-red-400 italic">{t('reason')}: {item.ngReason}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {item.sortBin ? `${t('bin')} ${item.sortBin}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-8">
            <h3 className="mb-6 text-lg font-bold text-black dark:text-white">{t('assemblyProgress')}</h3>
            <div className="relative h-4 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full bg-brand-500"
              />
            </div>
            <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
              <span className="text-black dark:text-white font-bold">{completedItems}</span> {t('of')} <span className="text-black dark:text-white font-bold">{order.totalItems}</span> {t('subAssembliesComplete')} ({progress.toFixed(0)}%)
            </p>
          </div>

          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-8">
            <h3 className="mb-6 text-lg font-bold text-black dark:text-white">{t('orderDetails')}</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{t('placedOn')}</span>
                <span className="font-medium text-black dark:text-white">
                  {order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy') : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{t('dueDate')}</span>
                <span className="font-medium text-black dark:text-white">
                  {order.dueDate ? format(new Date(order.dueDate), 'MMM dd, yyyy') : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{t('totalEstCost')}</span>
                <span className="font-bold text-brand-500">${(order.estimatedCost * 0.6).toLocaleString()}</span>
              </div>
            </div>
            {order.notes && (
              <div className="mt-8 border-t border-black/10 dark:border-white/10 pt-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{t('notes')}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed italic">&quot;{order.notes}&quot;</p>
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-blue-500/10 p-6 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2 text-blue-500">
              <Info className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">{t('realTimeTracking')}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {t('realTimeTrackingDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
