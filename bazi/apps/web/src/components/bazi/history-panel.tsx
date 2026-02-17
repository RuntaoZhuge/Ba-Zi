'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import type { BaZiResult, BirthInput } from '@bazi/domain';
import { getHistory, removeFromHistory, clearHistory } from '@/lib/bazi-history';
import type { BaZiHistoryEntry } from '@/lib/bazi-history';

interface HistoryPanelProps {
  onSelect: (input: BirthInput, result: BaZiResult) => void;
  /** Incremented externally whenever a new entry is saved */
  refreshKey?: number;
}

export function HistoryPanel({ onSelect, refreshKey }: HistoryPanelProps) {
  const t = useTranslations('bazi.history');
  const [entries, setEntries] = useState<BaZiHistoryEntry[]>([]);

  const reload = useCallback(() => {
    setEntries(getHistory());
  }, []);

  useEffect(() => {
    reload();
  }, [reload, refreshKey]);

  const handleRemove = (id: string) => {
    removeFromHistory(id);
    reload();
  };

  const handleClear = () => {
    clearHistory();
    reload();
  };

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">{t('title')}</h3>
        <p className="text-xs text-gray-400">{t('empty')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">{t('title')}</h3>
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-gray-400 hover:text-red-500 transition"
        >
          {t('clearAll')}
        </button>
      </div>
      <ul className="space-y-2">
        {entries.map((entry) => (
          <li key={entry.id} className="group relative">
            <button
              type="button"
              onClick={() => onSelect(entry.input, entry.result)}
              className="w-full rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-left text-xs transition hover:border-gray-300 hover:bg-gray-100"
            >
              <div className="font-medium text-gray-800">{entry.label}</div>
              <div className="mt-0.5 text-gray-400">
                {entry.result.chart.fourPillars.year.stemBranch.ganZhi}{' '}
                {entry.result.chart.fourPillars.month.stemBranch.ganZhi}{' '}
                {entry.result.chart.fourPillars.day.stemBranch.ganZhi}{' '}
                {entry.result.chart.fourPillars.hour?.stemBranch.ganZhi ?? '??'}
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleRemove(entry.id)}
              className="absolute right-1 top-1 hidden rounded p-1 text-gray-300 hover:text-red-500 group-hover:block"
              title={t('remove')}
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
