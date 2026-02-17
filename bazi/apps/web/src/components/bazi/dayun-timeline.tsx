'use client';

import { useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { BaZiResult, DaYunCycle, LiuNianFortune, YunInfo } from '@bazi/domain';
import { streamFetch } from '@/lib/stream-fetch';

type Status = 'idle' | 'loading' | 'streaming' | 'done' | 'error';

interface DaYunTimelineProps {
  yun: YunInfo;
  liuNian: LiuNianFortune[];
  result: BaZiResult;
}

export function DaYunTimeline({ yun, liuNian, result }: DaYunTimelineProps) {
  const t = useTranslations('bazi.result');
  const tDim = useTranslations('bazi.dimensions');
  const tAnalysis = useTranslations('bazi.analysis');
  const locale = useLocale();
  const currentYear = new Date().getFullYear();

  const [selectedDaYun, setSelectedDaYun] = useState<DaYunCycle | null>(null);
  const [selectedLiuNian, setSelectedLiuNian] = useState<LiuNianFortune | null>(null);
  const [text, setText] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const startPeriodAnalysis = useCallback(async (
    period: { type: 'dayun' | 'liunian'; ganZhi: string; startAge?: number; endAge?: number; startYear?: number; endYear?: number; year?: number; age?: number },
  ) => {
    setText('');
    setStatus('loading');

    try {
      const res = await streamFetch(
        '/api/bazi/analysis',
        { result, locale, period },
        (acc) => { setText(acc); setStatus('streaming'); },
      );

      if (!res.ok) {
        setStatus('error');
        return;
      }
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }, [result, locale]);

  const handleDaYunClick = (dy: DaYunCycle) => {
    if (selectedDaYun === dy && status !== 'idle') {
      // Toggle off
      setSelectedDaYun(null);
      setSelectedLiuNian(null);
      setText('');
      setStatus('idle');
      return;
    }
    setSelectedDaYun(dy);
    setSelectedLiuNian(null);
    startPeriodAnalysis({
      type: 'dayun',
      ganZhi: dy.stemBranch.ganZhi,
      startAge: dy.startAge,
      endAge: dy.endAge,
      startYear: dy.startYear,
      endYear: dy.endYear,
    });
  };

  const handleLiuNianClick = (ln: LiuNianFortune) => {
    if (selectedLiuNian === ln && status !== 'idle') {
      setSelectedLiuNian(null);
      setSelectedDaYun(null);
      setText('');
      setStatus('idle');
      return;
    }
    setSelectedLiuNian(ln);
    setSelectedDaYun(null);
    startPeriodAnalysis({
      type: 'liunian',
      ganZhi: ln.stemBranch.ganZhi,
      year: ln.year,
      age: ln.age,
    });
  };

  return (
    <div className="space-y-6">
      {/* Start Age */}
      <div className="text-sm text-gray-600">
        {t('startAge')}: {yun.startAge} {t('age')}
      </div>

      {/* DaYun Cycles */}
      <div className="overflow-x-auto">
        <div className="flex gap-2">
          {yun.daYun.map((dy, i) => {
            const isCurrentDaYun =
              currentYear >= dy.startYear && currentYear <= dy.endYear;
            const isSelected = selectedDaYun === dy;
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleDaYunClick(dy)}
                title={tDim('analyzePeriod')}
                className={`min-w-[80px] rounded-lg border p-3 text-center transition cursor-pointer hover:shadow-md ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                    : isCurrentDaYun
                      ? 'border-gray-900 bg-gray-50 ring-2 ring-gray-900'
                      : 'border-gray-200 bg-white hover:border-gray-400'
                }`}
              >
                <div className="text-lg font-bold">
                  {dy.stemBranch.ganZhi}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {dy.startAge}-{dy.endAge} {t('age')}
                </div>
                <div className="mt-0.5 text-xs text-gray-400">
                  {dy.startYear}-{dy.endYear}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* LiuNian (Annual Fortune) - show first 30 years */}
      <div>
        <h4 className="mb-3 text-sm font-semibold">{t('liunian')}</h4>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
          {liuNian.slice(0, 30).map((ln, i) => {
            const isSelected = selectedLiuNian === ln;
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleLiuNianClick(ln)}
                title={tDim('analyzeLiuNian')}
                className={`rounded border p-2 text-center transition cursor-pointer hover:shadow-md ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                    : ln.year === currentYear
                      ? 'border-gray-900 bg-gray-50 ring-2 ring-gray-900'
                      : 'border-gray-100 bg-white hover:border-gray-400'
                }`}
              >
                <div className="text-sm font-medium">
                  {ln.stemBranch.ganZhi}
                </div>
                <div className="text-xs text-gray-400">{ln.year}</div>
                <div className="text-xs text-gray-400">
                  {ln.age} {t('age')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Inline Analysis Panel */}
      {(status !== 'idle' || text) && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-900">
              {selectedDaYun
                ? `${selectedDaYun.stemBranch.ganZhi} ${t('dayun')}（${selectedDaYun.startAge}-${selectedDaYun.endAge}${t('age')}）`
                : selectedLiuNian
                  ? `${selectedLiuNian.stemBranch.ganZhi} ${t('liunian')}（${selectedLiuNian.year}）`
                  : ''}
            </h4>
            {(status === 'loading' || status === 'streaming') && (
              <span className="flex items-center gap-2 text-xs text-gray-500">
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                {tAnalysis('analyzing')}
              </span>
            )}
          </div>

          {status === 'error' && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-red-600">{tAnalysis('error')}</span>
              <button
                type="button"
                onClick={() => {
                  if (selectedDaYun) handleDaYunClick(selectedDaYun);
                  else if (selectedLiuNian) handleLiuNianClick(selectedLiuNian);
                }}
                className="text-xs text-gray-500 underline"
              >
                {tAnalysis('retry')}
              </button>
            </div>
          )}

          {text && (
            <div className="prose prose-sm max-w-none text-gray-700">
              {renderBody(text)}
            </div>
          )}

          {status === 'done' && (
            <button
              type="button"
              onClick={() => {
                if (selectedDaYun) handleDaYunClick(selectedDaYun);
                else if (selectedLiuNian) handleLiuNianClick(selectedLiuNian);
              }}
              className="mt-4 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
            >
              {tAnalysis('reAnalyze')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Render markdown body — handles ### headings, bold, lists, paragraphs */
function renderBody(md: string) {
  const lines = md.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={key++} className="mb-2 mt-4 text-sm font-bold text-gray-800">
          {renderInline(trimmed.slice(4))}
        </h4>,
      );
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={key++} className="mb-2 mt-4 text-base font-bold text-gray-900">
          {renderInline(trimmed.slice(3))}
        </h3>,
      );
    } else if (trimmed.startsWith('# ')) {
      elements.push(
        <h3 key={key++} className="mb-2 mt-4 text-base font-bold text-gray-900">
          {renderInline(trimmed.slice(2))}
        </h3>,
      );
    } else if (trimmed.startsWith('- ')) {
      elements.push(
        <li key={key++} className="ml-4 mb-1 list-disc leading-relaxed">
          {renderInline(trimmed.slice(2))}
        </li>,
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      const text = trimmed.replace(/^\d+\.\s/, '');
      elements.push(
        <li key={key++} className="ml-4 mb-1 list-decimal leading-relaxed">
          {renderInline(text)}
        </li>,
      );
    } else if (trimmed === '') {
      elements.push(<div key={key++} className="h-2" />);
    } else {
      elements.push(
        <p key={key++} className="mb-2 leading-relaxed">
          {renderInline(trimmed)}
        </p>,
      );
    }
  }
  return elements;
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining) {
    const boldStart = remaining.indexOf('**');
    if (boldStart === -1) { parts.push(remaining); break; }
    const boldEnd = remaining.indexOf('**', boldStart + 2);
    if (boldEnd === -1) { parts.push(remaining); break; }
    if (boldStart > 0) parts.push(remaining.slice(0, boldStart));
    parts.push(
      <strong key={key++} className="font-semibold text-gray-900">
        {remaining.slice(boldStart + 2, boldEnd)}
      </strong>,
    );
    remaining = remaining.slice(boldEnd + 2);
  }
  return parts;
}
