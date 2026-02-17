'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { BirthInput, Gender, CalendarType, ZiHourMode } from '@bazi/domain';
import { CitySelector } from './city-selector';
import type { City } from '@/data/cities';

interface BirthFormProps {
  onSubmit: (input: BirthInput) => void;
  isLoading?: boolean;
  onNameChange?: (name: string) => void;
}

export function BirthForm({ onSubmit, isLoading, onNameChange }: BirthFormProps) {
  const t = useTranslations();

  const currentYear = new Date().getFullYear();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [calendarType, setCalendarType] = useState<CalendarType>('solar');
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [hourUnknown, setHourUnknown] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [useTrueSolarTime, setUseTrueSolarTime] = useState(false);
  const [ziHourMode, setZiHourMode] = useState<ZiHourMode | ''>('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [longitude, setLongitude] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input: BirthInput = {
      year,
      month,
      day,
      hour,
      minute,
      gender,
      calendarType,
      ...(calendarType === 'lunar' && isLeapMonth ? { isLeapMonth: true } : {}),
      ...(hourUnknown ? { hourUnknown: true } : {}),
      ...(useTrueSolarTime ? { useTrueSolarTime: true, ...(longitude ? { longitude: parseFloat(longitude) } : {}) } : {}),
      ...(ziHourMode ? { ziHourMode: ziHourMode as ZiHourMode } : {}),
    };
    onSubmit(input);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t('bazi.form.name')}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); onNameChange?.(e.target.value); }}
          placeholder={t('bazi.form.namePlaceholder')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>

      {/* Gender */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t('bazi.form.gender')}
        </label>
        <div className="flex gap-3">
          {(['male', 'female', 'unknown'] as Gender[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`rounded-lg border px-4 py-2 text-sm transition ${
                gender === g
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              {t(`common.${g}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Type */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t('bazi.form.calendarType')}
        </label>
        <div className="flex gap-3">
          {(['solar', 'lunar'] as CalendarType[]).map((ct) => (
            <button
              key={ct}
              type="button"
              onClick={() => setCalendarType(ct)}
              className={`rounded-lg border px-4 py-2 text-sm transition ${
                calendarType === ct
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              {t(`bazi.form.${ct}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Birth Date */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t('bazi.form.birthDate')}
        </label>
        <div className="flex gap-2">
          <div className="flex-1">
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            >
              {Array.from({ length: 150 }, (_, i) => currentYear - i).map(
                (y) => (
                  <option key={y} value={y}>
                    {y} {t('bazi.form.year')}
                  </option>
                ),
              )}
            </select>
          </div>
          <div className="w-24">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m} {t('bazi.form.month')}
                </option>
              ))}
            </select>
          </div>
          <div className="w-24">
            <select
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d} {t('bazi.form.day')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leap Month (for lunar calendar) */}
      {calendarType === 'lunar' && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="leapMonth"
            checked={isLeapMonth}
            onChange={(e) => setIsLeapMonth(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="leapMonth" className="text-sm text-gray-700">
            {t('bazi.form.isLeapMonth')}
          </label>
        </div>
      )}

      {/* Birth Time */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t('bazi.form.birthTime')}
        </label>
        <div className="mb-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="hourUnknown"
            checked={hourUnknown}
            onChange={(e) => setHourUnknown(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="hourUnknown" className="text-sm text-gray-600">
            {t('bazi.form.hourUnknown')}
          </label>
        </div>
        {!hourUnknown && (
          <div className="flex gap-2">
            <div className="w-24">
              <select
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
              >
                {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                  <option key={h} value={h}>
                    {h.toString().padStart(2, '0')} {t('bazi.form.hour')}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <select
                value={minute}
                onChange={(e) => setMinute(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
              >
                {[0, 15, 30, 45].map((m) => (
                  <option key={m} value={m}>
                    {m.toString().padStart(2, '0')} {t('bazi.form.minute')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Options Toggle */}
      <div className="rounded-lg border border-gray-200">
        <button
          type="button"
          onClick={() => setShowAdvanced((prev) => !prev)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          <span>{t('bazi.form.advancedOptions')}</span>
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
              id="trueSolarTime"
              checked={useTrueSolarTime}
              onChange={(e) => setUseTrueSolarTime(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="trueSolarTime" className="text-sm text-gray-700">
              {t('bazi.form.useTrueSolarTime')}
            </label>
          </div>

          {/* City selector + Longitude (shown when true solar time is enabled) */}
          {useTrueSolarTime && (
            <>
              <div>
                <label className="mb-1 block text-sm text-gray-700">
                  {t('bazi.form.birthCity')}
                </label>
                <CitySelector
                  value={selectedCity}
                  onChange={(city) => {
                    setSelectedCity(city);
                    if (city) {
                      setLongitude(String(city.longitude));
                    }
                  }}
                  placeholder={t('bazi.form.cityPlaceholder')}
                  noResultsText={t('bazi.form.cityNoResults')}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">
                  {t('bazi.form.longitude')}
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
                  placeholder={t('bazi.form.longitudePlaceholder')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                />
              </div>
            </>
          )}

          {/* Zi Hour Mode */}
          <div>
            <label className="mb-1 block text-sm text-gray-700">
              {t('bazi.form.ziHourMode')}
            </label>
            <select
              value={ziHourMode}
              onChange={(e) =>
                setZiHourMode(e.target.value as ZiHourMode | '')
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            >
              <option value="">--</option>
              <option value="early">{t('bazi.form.earlyZi')}</option>
              <option value="late">{t('bazi.form.lateZi')}</option>
            </select>
          </div>
        </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
      >
        {isLoading ? t('common.loading') : t('common.calculate')}
      </button>
    </form>
  );
}
