'use client';

import { useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { BaZiResult } from '@bazi/domain';
import { streamFetch } from '@/lib/stream-fetch';

type Status = 'idle' | 'loading' | 'streaming' | 'done' | 'error';

interface DimensionAnalysisProps {
  result: BaZiResult;
}

const DIMENSIONS = ['career', 'wealth', 'marriage', 'health', 'fortune'] as const;
type Dimension = (typeof DIMENSIONS)[number];

const DIMENSION_ICONS: Record<Dimension, string> = {
  career: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  wealth: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  marriage: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  health: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0zM9 12h6m-3-3v6',
  fortune: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
};

export function DimensionAnalysis({ result }: DimensionAnalysisProps) {
  const t = useTranslations('bazi.dimensions');

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">{t('title')}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {DIMENSIONS.map((dim) => (
          <DimensionCard key={dim} dimension={dim} result={result} />
        ))}
      </div>
    </section>
  );
}

function DimensionCard({
  dimension,
  result,
}: {
  dimension: Dimension;
  result: BaZiResult;
}) {
  const t = useTranslations('bazi.dimensions');
  const tAnalysis = useTranslations('bazi.analysis');
  const locale = useLocale();
  const [text, setText] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const startAnalysis = useCallback(async () => {
    setText('');
    setStatus('loading');

    try {
      const res = await streamFetch(
        '/api/bazi/analysis',
        { result, locale, dimension },
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
  }, [result, locale, dimension]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
            <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={DIMENSION_ICONS[dimension]} />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">{t(dimension)}</h3>
            <p className="text-xs text-gray-400">{t(`${dimension}Desc`)}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4">
        {status === 'idle' && (
          <button
            type="button"
            onClick={startAnalysis}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:border-gray-300"
          >
            {t('startAnalysis')}
          </button>
        )}

        {(status === 'loading' || status === 'streaming') && (
          <>
            <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              {tAnalysis('analyzing')}
            </div>
            {text && (
              <div className="prose prose-sm max-w-none text-gray-700">
                {renderBody(text)}
              </div>
            )}
          </>
        )}

        {status === 'error' && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-red-600">{tAnalysis('error')}</span>
            <button
              type="button"
              onClick={startAnalysis}
              className="text-xs text-gray-500 underline"
            >
              {tAnalysis('retry')}
            </button>
          </div>
        )}

        {status === 'done' && text && (
          <>
            <div className="prose prose-sm max-w-none text-gray-700">
              {renderBody(text)}
            </div>
            <button
              type="button"
              onClick={startAnalysis}
              className="mt-4 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
            >
              {tAnalysis('reAnalyze')}
            </button>
          </>
        )}
      </div>
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
