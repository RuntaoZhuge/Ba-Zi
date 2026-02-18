'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { MeihuaInput } from '@bazi/domain';

interface DivinationFormProps {
  onSubmit: (input: MeihuaInput) => void;
  isLoading?: boolean;
}

export function DivinationForm({ onSubmit, isLoading }: DivinationFormProps) {
  const t = useTranslations('meihua.form');
  const tc = useTranslations('common');

  const [method, setMethod] = useState<'time' | 'number'>('time');
  const [question, setQuestion] = useState('');

  // Time fields — default to current date/time
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [day, setDay] = useState(now.getDate());
  const [hour, setHour] = useState(now.getHours());

  // Number fields
  const [upperNumber, setUpperNumber] = useState('');
  const [lowerNumber, setLowerNumber] = useState('');

  const handleUseCurrentTime = () => {
    const n = new Date();
    setYear(n.getFullYear());
    setMonth(n.getMonth() + 1);
    setDay(n.getDate());
    setHour(n.getHours());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (method === 'time') {
      onSubmit({
        method: 'time',
        year,
        month,
        day,
        hour,
        question: question || undefined,
      });
    } else {
      const upper = parseInt(upperNumber, 10);
      const lower = parseInt(lowerNumber, 10);
      if (isNaN(upper) || isNaN(lower) || upper <= 0 || lower <= 0) return;
      onSubmit({
        method: 'number',
        upperNumber: upper,
        lowerNumber: lower,
        question: question || undefined,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Method Toggle */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {t('method')}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMethod('time')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              method === 'time'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('timeMethod')}
          </button>
          <button
            type="button"
            onClick={() => setMethod('number')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              method === 'number'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('numberMethod')}
          </button>
        </div>
      </div>

      {/* Time Fields */}
      {method === 'time' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="mb-1 block text-xs text-gray-500">{t('year')}</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                min={1900}
                max={2100}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">{t('month')}</label>
              <input
                type="number"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                min={1}
                max={12}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">{t('day')}</label>
              <input
                type="number"
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                min={1}
                max={31}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">{t('hour')}</label>
              <input
                type="number"
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                min={0}
                max={23}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleUseCurrentTime}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {t('useCurrentTime')}
          </button>
        </div>
      )}

      {/* Number Fields */}
      {method === 'number' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('upperNumber')}
            </label>
            <input
              type="number"
              value={upperNumber}
              onChange={(e) => setUpperNumber(e.target.value)}
              placeholder={t('upperNumberPlaceholder')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              min={1}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('lowerNumber')}
            </label>
            <input
              type="number"
              value={lowerNumber}
              onChange={(e) => setLowerNumber(e.target.value)}
              placeholder={t('lowerNumberPlaceholder')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              min={1}
              required
            />
          </div>
        </div>
      )}

      {/* Question */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t('question')}
        </label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t('questionPlaceholder')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
      >
        {isLoading ? tc('loading') : t('startDivination')}
      </button>
    </form>
  );
}
