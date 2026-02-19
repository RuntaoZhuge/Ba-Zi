'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { LiurenInput } from '@bazi/domain';
import { CitySelector } from '@/components/bazi/city-selector';
import type { City } from '@/data/cities';

interface LiurenFormProps {
  onSubmit: (input: LiurenInput) => void;
  isLoading: boolean;
}

export function LiurenForm({ onSubmit, isLoading }: LiurenFormProps) {
  const t = useTranslations('liuren.form');

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [day, setDay] = useState(now.getDate());
  const [hour, setHour] = useState(now.getHours());
  const [minute, setMinute] = useState(now.getMinutes());
  const [question, setQuestion] = useState('');

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [useTrueSolarTime, setUseTrueSolarTime] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [longitude, setLongitude] = useState('');

  const useCurrentTime = () => {
    const n = new Date();
    setYear(n.getFullYear());
    setMonth(n.getMonth() + 1);
    setDay(n.getDate());
    setHour(n.getHours());
    setMinute(n.getMinutes());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input: LiurenInput = { year, month, day, hour, minute, question: question || undefined };
    if (useTrueSolarTime && longitude) {
      input.useTrueSolarTime = true;
      input.longitude = parseFloat(longitude);
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

      {/* Advanced Options Toggle */}
      <div className="rounded-lg border border-gray-200">
        <button
          type="button"
          onClick={() => setShowAdvanced((prev) => !prev)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          <span>{t('advancedOptions')}</span>
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showAdvanced && (
          <div className="space-y-3 border-t border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="liurenTrueSolarTime"
                checked={useTrueSolarTime}
                onChange={(e) => setUseTrueSolarTime(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="liurenTrueSolarTime" className="text-sm text-gray-700">
                {t('useTrueSolarTime')}
              </label>
            </div>

            {useTrueSolarTime && (
              <>
                <div>
                  <label className="mb-1 block text-sm text-gray-700">
                    {t('city')}
                  </label>
                  <CitySelector
                    value={selectedCity}
                    onChange={(city) => {
                      setSelectedCity(city);
                      if (city) {
                        setLongitude(String(city.longitude));
                      }
                    }}
                    placeholder={t('cityPlaceholder')}
                    noResultsText={t('cityNoResults')}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-700">
                    {t('longitude')}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="-180"
                    max="180"
                    value={longitude}
                    onChange={(e) => {
                      setLongitude(e.target.value);
                      setSelectedCity(null);
                    }}
                    placeholder={t('longitudePlaceholder')}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

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
