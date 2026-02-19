'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { LiurenInput, LiurenResult } from '@bazi/domain';
import {
  getLiurenHistory,
  removeFromLiurenHistory,
  clearLiurenHistory,
} from '@/lib/liuren-history';
import type { LiurenHistoryEntry } from '@/lib/liuren-history';

interface LiurenHistoryPanelProps {
  onSelect: (input: LiurenInput, result: LiurenResult) => void;
  refreshKey?: number;
}

export function LiurenHistoryPanel({ onSelect, refreshKey }: LiurenHistoryPanelProps) {
  const t = useTranslations('liuren.history');
  const [entries, setEntries] = useState<LiurenHistoryEntry[]>([]);

  useEffect(() => {
    setEntries(getLiurenHistory());
  }, [refreshKey]);

  const handleRemove = (id: string) => {
    removeFromLiurenHistory(id);
    setEntries(getLiurenHistory());
  };

  const handleClear = () => {
    clearLiurenHistory();
    setEntries([]);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t('title')}</h3>
        {entries.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-gray-400 hover:text-red-500"
          >
            {t('clearAll')}
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="text-xs text-gray-400">{t('empty')}</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="group flex items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-gray-50"
            >
              <button
                type="button"
                onClick={() => onSelect(entry.input, entry.result)}
                className="flex-1 truncate text-left text-gray-700 hover:text-gray-900"
              >
                {entry.label}
              </button>
              <button
                type="button"
                onClick={() => handleRemove(entry.id)}
                className="ml-2 hidden text-gray-300 hover:text-red-500 group-hover:block"
              >
                {t('remove')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
