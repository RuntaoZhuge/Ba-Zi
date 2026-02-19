'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { LiuyaoInput, LiuyaoMethod, YaoValue } from '@bazi/domain';

interface LiuyaoFormProps {
  onSubmit: (input: LiuyaoInput) => void;
  isLoading: boolean;
}

const LINE_LABELS = ['初爻', '二爻', '三爻', '四爻', '五爻', '六爻'];

const YAO_OPTIONS: { value: YaoValue; label: string }[] = [
  { value: 6, label: '老阴 (6)' },
  { value: 7, label: '少阳 (7)' },
  { value: 8, label: '少阴 (8)' },
  { value: 9, label: '老阳 (9)' },
];

export function LiuyaoForm({ onSubmit, isLoading }: LiuyaoFormProps) {
  const t = useTranslations('liuyao.form');

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [day, setDay] = useState(now.getDate());
  const [hour, setHour] = useState(now.getHours());
  const [minute, setMinute] = useState(now.getMinutes());
  const [question, setQuestion] = useState('');
  const [method, setMethod] = useState<LiuyaoMethod>('random');
  const [manualLines, setManualLines] = useState<YaoValue[]>([7, 7, 7, 7, 7, 7]);

  const useCurrentTime = () => {
    const n = new Date();
    setYear(n.getFullYear());
    setMonth(n.getMonth() + 1);
    setDay(n.getDate());
    setHour(n.getHours());
    setMinute(n.getMinutes());
  };

  const handleManualLineChange = (index: number, value: YaoValue) => {
    setManualLines((prev) => {
      const next = [...prev];
      next[index] = value;
      return next as YaoValue[];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input: LiuyaoInput = {
      year,
      month,
      day,
      hour,
      minute,
      question: question || undefined,
      method,
    };
    if (method === 'manual') {
      input.manualLines = manualLines;
    }
    onSubmit(input);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date & Time */}
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">{t('dateTime')}</label>
          <button
            type="button"
            onClick={useCurrentTime}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            {t('useCurrentTime')}
          </button>
        </div>
        <div className="mt-1 grid grid-cols-5 gap-2">
          <div>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              min={1900}
              max={2100}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
            />
            <span className="mt-0.5 block text-xs text-gray-400">{t('year')}</span>
          </div>
          <div>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <span className="mt-0.5 block text-xs text-gray-400">{t('month')}</span>
          </div>
          <div>
            <select
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <span className="mt-0.5 block text-xs text-gray-400">{t('day')}</span>
          </div>
          <div>
            <select
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
            >
              {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
              ))}
            </select>
            <span className="mt-0.5 block text-xs text-gray-400">{t('hour')}</span>
          </div>
          <div>
            <select
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
            >
              {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </select>
            <span className="mt-0.5 block text-xs text-gray-400">{t('minute')}</span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('question')}</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t('questionPlaceholder')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
        />
      </div>

      {/* Method selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('method')}</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="liuyaoMethod"
              value="random"
              checked={method === 'random' || method === 'coin'}
              onChange={() => setMethod('random')}
              className="border-gray-300"
            />
            {t('methodRandom')}
          </label>
          <label className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="liuyaoMethod"
              value="manual"
              checked={method === 'manual'}
              onChange={() => setMethod('manual')}
              className="border-gray-300"
            />
            {t('methodManual')}
          </label>
        </div>
      </div>

      {/* Manual line inputs */}
      {method === 'manual' && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
          <p className="text-xs text-gray-500 mb-3">{t('manualHint')}</p>
          {LINE_LABELS.map((label, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-10 text-sm text-gray-600">{label}</span>
              <select
                value={manualLines[i]}
                onChange={(e) => handleManualLineChange(i, Number(e.target.value) as YaoValue)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
              >
                {YAO_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
      >
        {isLoading ? '...' : t('startCalculation')}
      </button>
    </form>
  );
}
