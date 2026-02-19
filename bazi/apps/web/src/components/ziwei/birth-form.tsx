'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ZiweiInput } from '@bazi/domain';
import { CitySelector } from '@/components/bazi/city-selector';
import type { City } from '@/data/cities';

interface BirthFormProps {
  onSubmit: (input: ZiweiInput) => void;
  isLoading: boolean;
}

const HOUR_OPTIONS = [
  { label: '子时 (23:00-01:00)', value: 0 },
  { label: '丑时 (01:00-03:00)', value: 2 },
  { label: '寅时 (03:00-05:00)', value: 4 },
  { label: '卯时 (05:00-07:00)', value: 6 },
  { label: '辰时 (07:00-09:00)', value: 8 },
  { label: '巳时 (09:00-11:00)', value: 10 },
  { label: '午时 (11:00-13:00)', value: 12 },
  { label: '未时 (13:00-15:00)', value: 14 },
  { label: '申时 (15:00-17:00)', value: 16 },
  { label: '酉时 (17:00-19:00)', value: 18 },
  { label: '戌时 (19:00-21:00)', value: 20 },
  { label: '亥时 (21:00-23:00)', value: 22 },
];

export function ZiweiBirthForm({ onSubmit, isLoading }: BirthFormProps) {
  const t = useTranslations('ziwei.form');

  const now = new Date();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [year, setYear] = useState(now.getFullYear() - 30);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [hour, setHour] = useState(12);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [useTrueSolarTime, setUseTrueSolarTime] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [longitude, setLongitude] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input: ZiweiInput = { year, month, day, hour, gender, name: name || undefined };
    if (useTrueSolarTime && longitude) {
      input.useTrueSolarTime = true;
      input.longitude = parseFloat(longitude);
    }
    onSubmit(input);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('name')}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('namePlaceholder')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
        />
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('gender')}</label>
        <div className="mt-1 flex gap-4">
          {(['male', 'female'] as const).map((g) => (
            <label key={g} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value={g}
                checked={gender === g}
                onChange={() => setGender(g)}
                className="h-4 w-4 text-gray-900 focus:ring-gray-500"
              />
              <span className="text-sm">{t(g)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('birthDate')}</label>
        <div className="mt-1 grid grid-cols-3 gap-2">
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
        </div>
      </div>

      {/* Hour */}
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('birthTime')}</label>
        <select
          value={hour}
          onChange={(e) => setHour(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
        >
          {HOUR_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
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
            {/* True Solar Time */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ziweiTrueSolarTime"
                checked={useTrueSolarTime}
                onChange={(e) => setUseTrueSolarTime(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="ziweiTrueSolarTime" className="text-sm text-gray-700">
                {t('useTrueSolarTime')}
              </label>
            </div>

            {/* City selector + Longitude */}
            {useTrueSolarTime && (
              <>
                <div>
                  <label className="mb-1 block text-sm text-gray-700">
                    {t('birthCity')}
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
