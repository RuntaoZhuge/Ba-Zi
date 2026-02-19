'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { BaZiResult } from '@bazi/domain';
import { getHistory } from '@/lib/bazi-history';
import type { BaZiHistoryEntry } from '@/lib/bazi-history';
import Link from 'next/link';

interface DailyFortuneSelectorProps {
  onSelect: (result: BaZiResult) => void;
  refreshKey?: number;
}

export function DailyFortuneSelector({ onSelect, refreshKey }: DailyFortuneSelectorProps) {
  const t = useTranslations('baziDaily');
  const [entries, setEntries] = useState<BaZiHistoryEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const history = getHistory();
    setEntries(history);
    // Auto-select most recent if none selected
    if (history.length > 0 && !selectedId) {
      setSelectedId(history[0].id);
      onSelect(history[0].result);
    }
  }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (entry: BaZiHistoryEntry) => {
    setSelectedId(entry.id);
    onSelect(entry.result);
  };

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
        <p className="mb-4 text-sm text-gray-500">{t('noHistory')}</p>
        <Link
          href="/workspace/bazi-calculate"
          className="inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          {t('goToCalculate')}
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="mb-2 text-sm font-semibold text-gray-700">{t('selectChart')}</h3>
      <p className="mb-4 text-xs text-gray-400">{t('selectChartDesc')}</p>

      <div className="space-y-2">
        {entries.map((entry) => {
          const isSelected = entry.id === selectedId;
          const fp = entry.result.chart.fourPillars;
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => handleSelect(entry)}
              className={`w-full rounded-lg border p-3 text-left transition ${
                isSelected
                  ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-sm font-medium text-gray-900">{entry.label}</div>
              <div className="mt-0.5 text-xs text-gray-500">
                {fp.year.stemBranch.ganZhi}{' '}
                {fp.month.stemBranch.ganZhi}{' '}
                {fp.day.stemBranch.ganZhi}{' '}
                {fp.hour?.stemBranch.ganZhi ?? '??'}
              </div>
              <div className="mt-0.5 text-xs text-gray-400">
                {entry.result.chart.dayMaster} · {entry.result.chart.mingge}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
