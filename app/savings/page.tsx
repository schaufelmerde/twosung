'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Calculator, TrendingDown, Clock, ShieldAlert, DollarSign, RefreshCw, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';

// Benchmark Data from PRD
const BENCHMARKS = {
  CONVENTIONAL: {
    labourHours: 120,           // ~3 weeks per sub-assembly
    labourCostPerHour: 45000,   // KRW/hr incl. overhead
    defectRate: 0.08,
    reworkCost: 5000000,        // KRW per rework incident
    cycleTime: '14 months',
  },
  SMART_FACTORY: {
    labourHours: 6,             // automated — minimal oversight
    labourCostPerHour: 45000,
    defectRate: 0.01,
    reworkCost: 500000,
    cycleTime: '3 months',
  },
};

const EXCHANGE_RATE = 1350; // 1 USD = 1350 KRW

const SHIP_TYPES = [
  { id: 'bulk',      labelKey: 'shipTypeBulkCarrier',      baseMaterialCost: 32000000 },
  { id: 'container', labelKey: 'shipTypeContainerShip',     baseMaterialCost: 35000000 },
  { id: 'tanker',    labelKey: 'shipTypeTanker',            baseMaterialCost: 42000000 },
  { id: 'lng',       labelKey: 'shipTypeLNGCarrier',        baseMaterialCost: 50000000 },
  { id: 'naval',     labelKey: 'shipTypeNavalVessel',       baseMaterialCost: 68000000 },
  { id: 'offshore',  labelKey: 'shipTypeOffshorePlatform',  baseMaterialCost: 75000000 },
  { id: 'ferry',     labelKey: 'shipTypeFerry',             baseMaterialCost: 28000000 },
];

export default function SavingsCalculator() {
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(10);
  const [shipType, setShipType] = useState(SHIP_TYPES[0]);
  const [currency, setCurrency] = useState<'USD' | 'KRW'>('USD');

  const formatValue = (val: number) => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val / EXCHANGE_RATE);
    }
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val);
  };

  const results = useMemo(() => {
    const materialCost = shipType.baseMaterialCost;

    const conventionalLabour = BENCHMARKS.CONVENTIONAL.labourHours * BENCHMARKS.CONVENTIONAL.labourCostPerHour;
    const conventionalRework = BENCHMARKS.CONVENTIONAL.defectRate * BENCHMARKS.CONVENTIONAL.reworkCost;
    const conventionalTotalPerUnit = conventionalLabour + conventionalRework + materialCost;
    const conventionalTotal = conventionalTotalPerUnit * quantity;

    const smartLabour = BENCHMARKS.SMART_FACTORY.labourHours * BENCHMARKS.SMART_FACTORY.labourCostPerHour;
    const smartRework = BENCHMARKS.SMART_FACTORY.defectRate * BENCHMARKS.SMART_FACTORY.reworkCost;
    const smartTotalPerUnit = smartLabour + smartRework + materialCost;
    const smartTotal = smartTotalPerUnit * quantity;

    const savings = conventionalTotal - smartTotal;
    const savingsPct = (savings / conventionalTotal) * 100;

    return {
      conventional: {
        total: conventionalTotal,
        labour: conventionalLabour * quantity,
        defectRate: '6%',
      },
      smart: {
        total: smartTotal,
        labour: smartLabour * quantity,
        defectRate: '<1%',
      },
      savings,
      savingsPct,
    };
  }, [quantity, shipType]);

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="mb-16 text-center">
        <h1 className="font-display text-5xl font-bold tracking-tighter sm:text-7xl text-black dark:text-white uppercase">
          {t('savings')}
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">{t('savingsPageDesc')}</p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Controls */}
        <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-8 backdrop-blur-sm transition-colors">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2 text-black dark:text-white">
              <Calculator className="h-5 w-5 text-brand-500" />
              {t('parameters')}
            </h3>
            <button
              onClick={() => setCurrency(currency === 'USD' ? 'KRW' : 'USD')}
              className="flex items-center gap-2 rounded-full bg-black/10 dark:bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider hover:bg-black/20 dark:hover:bg-white/20 transition-colors text-black dark:text-white"
            >
              <RefreshCw className="h-3 w-3" />
              {currency}
            </button>
          </div>

          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
                {t('numAssemblies')}: <span className="text-black dark:text-white font-bold">{quantity}</span>
              </label>
              <input
                type="range"
                min="1"
                max="500"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full accent-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">{t('shipType')}</label>
              <div className="grid grid-cols-1 gap-2">
                {SHIP_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setShipType(type)}
                    className={`rounded-xl p-4 text-left border transition-all ${
                      shipType.id === type.id
                        ? 'border-brand-500 bg-brand-500/10 text-brand-500'
                        : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:border-brand-500/50'
                    }`}
                  >
                    <p className="font-bold">{t(type.labelKey)}</p>
                    <p className="text-xs opacity-60">{t('baseMaterial')}: {formatValue(type.baseMaterialCost)}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Conventional */}
            <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-8 transition-colors">
              <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6">{t('conventionalMethod')}</h4>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2"><DollarSign className="h-4 w-4" /> {t('totalCost')}</span>
                  <span className="text-xl font-bold text-black dark:text-white">{formatValue(results.conventional.total)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2"><Clock className="h-4 w-4" /> {t('cycleTime')}</span>
                  <span className="font-medium text-black dark:text-white">{t('cycleTimeConventional')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> {t('defectRate')}</span>
                  <span className="font-medium text-red-500">{results.conventional.defectRate}</span>
                </div>
              </div>
            </div>

            {/* Smart Factory */}
            <div className="rounded-3xl border border-brand-500/30 bg-brand-500/5 p-8 transition-colors">
              <h4 className="text-sm font-bold uppercase tracking-widest text-brand-500 mb-6">{t('smartFactory')}</h4>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2"><DollarSign className="h-4 w-4 text-brand-500" /> {t('totalCost')}</span>
                  <span className="text-xl font-bold text-brand-500">{formatValue(results.smart.total)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2"><Clock className="h-4 w-4 text-brand-500" /> {t('cycleTime')}</span>
                  <span className="font-medium text-brand-500">{t('cycleTimeSmart')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-brand-500" /> {t('defectRate')}</span>
                  <span className="font-medium text-green-500">{results.smart.defectRate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Savings Summary */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={quantity + shipType.id}
            className="rounded-3xl bg-brand-500 p-8 text-white"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-6 w-6" />
                  <h3 className="text-2xl font-bold uppercase tracking-tight">{t('totalSavings')}</h3>
                </div>
                <p className="text-black/70 font-medium">{t('savingsSummaryDesc').replace('{qty}', String(quantity)).replace('{ship}', t(shipType.labelKey))}</p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-5xl font-black tracking-tighter">{formatValue(results.savings)}</p>
                <p className="text-xl font-bold opacity-80">{results.savingsPct.toFixed(1)}% {t('costReductionTitle')}</p>
              </div>
            </div>
          </motion.div>

          <div className="text-center pt-8">
            <p className="text-gray-600 dark:text-gray-400 mb-6 italic">{t('readyToSave')}</p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-black dark:bg-white px-8 py-4 text-lg font-bold text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all"
            >
              {t('placeOrder')}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
