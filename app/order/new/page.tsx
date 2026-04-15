'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Package, Calendar, Flag, FileText, CheckCircle2, ChevronRight, Loader2, Trash2, Plus } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

const PART1_VARIANTS = [
  { label: 'A', src: '/hull_image/hull_01_a.png' },
  { label: 'B', src: '/hull_image/hull_01_b.png' },
  { label: 'C', src: '/hull_image/hull_01_c.png' },
];

const PART2_VARIANTS = [
  { label: 'A', src: '/hull_image/hull_02_a.png' },
  { label: 'B', src: '/hull_image/hull_02_b.png' },
  { label: 'C', src: '/hull_image/hull_02_c.png' },
];

const SHIP_TYPES: { value: string; labelKey: string; images: string[] }[] = [
  { value: 'Bulk Carrier',      labelKey: 'shipTypeBulkCarrier',      images: ['/ship_type/bulk_carrier.png'] },
  { value: 'Container Ship',    labelKey: 'shipTypeContainerShip',    images: ['/ship_type/container_ship.png'] },
  { value: 'Tanker',            labelKey: 'shipTypeTanker',           images: ['/ship_type/tanker.png'] },
  { value: 'LNG Carrier',       labelKey: 'shipTypeLNGCarrier',       images: ['/ship_type/lng_carrier.png'] },
  { value: 'Naval Vessel',      labelKey: 'shipTypeNavalVessel',      images: ['/ship_type/naval_vessel.png'] },
  { value: 'Offshore Platform', labelKey: 'shipTypeOffshorePlatform', images: ['/ship_type/offshore_platform.png'] },
  { value: 'Ferry',             labelKey: 'shipTypeFerry',            images: ['/ship_type/ferry.png'] },
];

interface Part {
  partId:   string;
  name:     string;
  category: string;
  unitCost: number;
  sortBin:  number;
}

interface CartItem {
  id:    string;
  part1: Part;
  part2: Part;
}

export default function NewOrderPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPart1, setSelectedPart1] = useState<Part | null>(null);
  const [selectedPart2, setSelectedPart2] = useState<Part | null>(null);

  const [orderDetails, setOrderDetails] = useState({
    shipType: 'LNG Carrier',
    dueDate:  '',
    priority: 3,
    notes:    '',
  });

  useEffect(() => {
    fetch('/api/parts')
      .then(r => r.json())
      .then((data: any[]) => {
        setParts(data.map(p => ({
          partId:   p.part_id,
          name:     p.part_name,
          category: p.part_category,
          unitCost: Number(p.unit_cost) * 100,
          sortBin:  p.sort_bin,
        })));
      })
      .catch(err => console.error('Failed to fetch parts:', err))
      .finally(() => setLoading(false));
  }, []);

  const part1Options = parts;
  const part2Options = parts;

  const addToCart = () => {
    if (selectedPart1 && selectedPart2) {
      setCart([...cart, {
        id:    Math.random().toString(36).slice(2, 9),
        part1: selectedPart1,
        part2: selectedPart2,
      }]);
      setSelectedPart1(null);
      setSelectedPart2(null);
    }
  };

  const removeFromCart = (id: string) => setCart(cart.filter(item => item.id !== id));

  const totalCost = cart.reduce((sum, item) => sum + item.part1.unitCost + item.part2.unitCost, 0);

  const handleSubmit = async () => {
    if (!user || cart.length === 0) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/orders', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipType: orderDetails.shipType,
          dueDate:  orderDetails.dueDate,
          priority: Number(orderDetails.priority),
          notes:    orderDetails.notes || undefined,
          items: cart.map(item => ({
            part1Id: item.part1.partId,
            part2Id: item.part2.partId,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setSubmitError(data.detail || data.error || 'Failed to place order');
        return;
      }

      router.push('/my');
    } catch (err) {
      setSubmitError('Failed to place order');
      console.error('Submit order error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="font-display text-4xl font-bold tracking-tight text-black dark:text-white uppercase">{t('placeNewOrder')}</h1>
        <div className="mt-6 flex items-center gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                step >= i ? 'bg-brand-500 text-white' : 'bg-black/10 dark:bg-white/10 text-gray-500'
              }`}>
                {i}
              </div>
              <span className={`text-sm font-medium ${step >= i ? 'text-black dark:text-white' : 'text-gray-500'}`}>
                {i === 1 ? t('configure') : i === 2 ? t('details') : t('review')}
              </span>
              {i < 3 && <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-700" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                {/* Ship type selection */}
                <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-8">
                  <h3 className="mb-6 text-xl font-bold flex items-center gap-2 text-black dark:text-white">
                    <Package className="h-5 w-5 text-brand-500" />
                    {t('shipType')}
                  </h3>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {SHIP_TYPES.map((type) => {
                      const selected = orderDetails.shipType === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setOrderDetails({ ...orderDetails, shipType: type.value })}
                          className={`rounded-2xl overflow-hidden border-2 transition-all ${
                            selected
                              ? 'border-brand-500 shadow-lg shadow-brand-500/20'
                              : 'border-black/10 dark:border-white/10 hover:border-brand-400'
                          }`}
                        >
                          <img src={type.images[0]} alt={t(type.labelKey as any)} className="w-full h-24 object-cover" />
                          <div className={`px-2 py-2 text-xs font-semibold text-center transition-colors leading-tight ${
                            selected ? 'bg-brand-500 text-white' : 'bg-white dark:bg-black/40 text-black dark:text-white'
                          }`}>
                            {t(type.labelKey as any)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hull block (part) selection */}
                <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-8">
                  <h3 className="mb-6 text-xl font-bold flex items-center gap-2 text-black dark:text-white">
                    <Package className="h-5 w-5 text-brand-500" />
                    {t('buildSubAssembly')}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Part 1 — hull_01 variants */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-500 dark:text-gray-400">{t('selectPart1')}</label>
                      <select
                        className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/40 p-4 text-sm text-black dark:text-white focus:border-brand-500 focus:outline-none"
                        value={selectedPart1 ? PART1_VARIANTS.findIndex((_, i) => part1Options[i]?.partId === selectedPart1.partId) : ''}
                        onChange={(e) => {
                          const idx = Number(e.target.value);
                          setSelectedPart1(part1Options[idx] ?? null);
                        }}
                      >
                        <option value="">{t('choosePart')}</option>
                        {PART1_VARIANTS.map((v, i) => part1Options[i] && (
                          <option key={v.label} value={i}>{part1Options[i].name} ({v.label})</option>
                        ))}
                      </select>
                      {selectedPart1 && (() => {
                        const idx = part1Options.findIndex(p => p.partId === selectedPart1.partId);
                        const variant = PART1_VARIANTS[idx];
                        return variant ? (
                          <img src={variant.src} alt={selectedPart1.name} className="mt-3 w-full h-56 object-cover rounded-xl" />
                        ) : null;
                      })()}
                    </div>

                    {/* Part 2 — hull_02 variants */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-500 dark:text-gray-400">{t('selectPart2')}</label>
                      <select
                        className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/40 p-4 text-sm text-black dark:text-white focus:border-brand-500 focus:outline-none"
                        value={selectedPart2 ? PART2_VARIANTS.findIndex((_, i) => part2Options[i]?.partId === selectedPart2.partId) : ''}
                        onChange={(e) => {
                          const idx = Number(e.target.value);
                          setSelectedPart2(part2Options[idx] ?? null);
                        }}
                      >
                        <option value="">{t('choosePart')}</option>
                        {PART2_VARIANTS.map((v, i) => part2Options[i] && (
                          <option key={v.label} value={i}>{part2Options[i].name} ({v.label})</option>
                        ))}
                      </select>
                      {selectedPart2 && (() => {
                        const idx = part2Options.findIndex(p => p.partId === selectedPart2.partId);
                        const variant = PART2_VARIANTS[idx];
                        return variant ? (
                          <img src={variant.src} alt={selectedPart2.name} className="mt-3 w-full h-56 object-cover rounded-xl" />
                        ) : null;
                      })()}
                    </div>
                  </div>

                  <button
                    onClick={addToCart}
                    disabled={!selectedPart1 || !selectedPart2}
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-black dark:bg-white py-4 text-sm font-bold text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 transition-all"
                  >
                    <Plus className="h-5 w-5" />
                    {t('addToOrder')}
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-black dark:text-white">{t('subAssemblies')} ({cart.length})</h3>
                  {cart.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-black/10 dark:border-white/10 p-12 text-center text-gray-500">
                      {t('cartEmpty')}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                              <Package className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-bold text-black dark:text-white">{item.part1.name} + {item.part2.name}</p>
                              <p className="text-xs text-gray-500">{t('materialCost')}: ${(item.part1.unitCost + item.part2.unitCost).toLocaleString()}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-8 space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> {t('dueDate')}
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/40 p-4 text-sm text-black dark:text-white focus:border-brand-500 focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
                      value={orderDetails.dueDate}
                      onChange={(e) => setOrderDetails({ ...orderDetails, dueDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <Flag className="h-4 w-4" /> {t('priority')} (1 {t('urgent')} - 5 {t('low')})
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      className="w-full accent-brand-500"
                      value={orderDetails.priority}
                      onChange={(e) => setOrderDetails({ ...orderDetails, priority: parseInt(e.target.value) })}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>{t('urgent')}</span>
                      <span>{t('high')}</span>
                      <span>{t('medium')}</span>
                      <span>{t('low')}</span>
                      <span>{t('veryLow')}</span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <FileText className="h-4 w-4" /> {t('notes')}
                    </label>
                    <textarea
                      rows={4}
                      className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/40 p-4 text-sm text-black dark:text-white focus:border-brand-500 focus:outline-none"
                      placeholder={t('specialInstructions')}
                      value={orderDetails.notes}
                      onChange={(e) => setOrderDetails({ ...orderDetails, notes: e.target.value })}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-8">
                  <h3 className="mb-8 text-xl font-bold text-black dark:text-white">{t('orderSummary')}</h3>

                  <div className="grid grid-cols-2 gap-8 border-b border-black/10 dark:border-white/10 pb-8 mb-8">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-500">{t('shipType')}</p>
                      <p className="mt-1 font-bold text-black dark:text-white">{orderDetails.shipType}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-500">{t('dueDate')}</p>
                      <p className="mt-1 font-bold text-black dark:text-white">{orderDetails.dueDate || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-500">{t('priority')}</p>
                      <p className="mt-1 font-bold text-black dark:text-white">{t('level')} {orderDetails.priority}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-500">{t('totalItems')}</p>
                      <p className="mt-1 font-bold text-black dark:text-white">{cart.length} {t('subAssemblies')}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs uppercase tracking-widest text-gray-500">{t('itemBreakdown')}</p>
                    {cart.map((item, i) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">{i + 1}. {item.part1.name} + {item.part2.name}</span>
                        <span className="font-mono text-black dark:text-white">${(item.part1.unitCost + item.part2.unitCost).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {submitError && (
                    <div className="mt-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
                      {submitError}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar / Summary */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-8">
            <h3 className="mb-6 text-lg font-bold text-black dark:text-white">{t('costSummary')}</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t('subtotal')}</span>
                <span className="text-black dark:text-white">${totalCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t('estSavings')}</span>
                <span className="text-green-500">-${(totalCost * 0.4).toLocaleString()}</span>
              </div>
              <div className="border-t border-black/10 dark:border-white/10 pt-4 flex justify-between items-end">
                <span className="text-sm font-bold text-black dark:text-white">{t('totalEst')}</span>
                <span className="text-2xl font-bold text-brand-500">${(totalCost * 0.6).toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 && cart.length === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-4 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-50 transition-all"
                >
                  {t('continue')}
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-4 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-50 transition-all"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : t('placeOrder')}
                </button>
              )}
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="w-full py-2 text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                >
                  {t('goBack')}
                </button>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-brand-500/10 p-6 border border-brand-500/20">
            <div className="flex items-center gap-2 mb-2 text-brand-500">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">{t('smartAdvantage')}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {t('smartAdvantageDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
