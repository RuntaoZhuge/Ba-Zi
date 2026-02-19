'use client';

import { useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { LiurenResult } from '@bazi/domain';
import { streamFetch } from '@/lib/stream-fetch';

interface LiurenAnalysisPanelProps {
  result: LiurenResult;
}

type Status = 'idle' | 'loading' | 'streaming' | 'done' | 'error';

export function LiurenAnalysisPanel({ result }: LiurenAnalysisPanelProps) {
  const t = useTranslations('liuren.analysis');
  const locale = useLocale();
  const [text, setText] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorKey, setErrorKey] = useState<string>('error');

  const startAnalysis = useCallback(async () => {
    setText('');
    setStatus('loading');

    try {
      const res = await streamFetch(
        '/api/liuren/analysis',
        { result, locale },
        (acc) => { setText(acc); setStatus('streaming'); },
      );

      if (!res.ok) {
        setErrorKey(res.errorCode === 'NO_API_KEY' ? 'noApiKey' : 'error');
        setStatus('error');
        return;
      }
      setStatus('done');
    } catch {
      setErrorKey('error');
      setStatus('error');
    }
  }, [result, locale]);

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        {(status === 'idle' || status === 'done' || status === 'error') && (
          <button
            type="button"
            onClick={startAnalysis}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            {status === 'done' ? t('reAnalyze') : t('startAnalysis')}
          </button>
        )}
        {(status === 'loading' || status === 'streaming') && (
          <span className="flex items-center gap-2 text-sm text-gray-500">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            {t('analyzing')}
          </span>
        )}
      </div>

      {status === 'error' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {t(errorKey)}
          <button
            type="button"
            onClick={startAnalysis}
            className="ml-2 text-xs underline"
          >
            {t('retry')}
          </button>
        </div>
      )}

      {text && (
        <div className="prose prose-sm max-w-none text-gray-700">
          {renderBody(text)}
        </div>
      )}

      {(status === 'done' || status === 'streaming') && (
        <p className="mt-4 text-xs text-gray-400">{t('disclaimer')}</p>
      )}
    </section>
  );
}

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
        <h3 key={key++} className="mb-2 mt-5 text-base font-bold text-gray-900">
          {renderInline(trimmed.slice(3))}
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
    if (boldStart === -1) {
      parts.push(remaining);
      break;
    }

    const boldEnd = remaining.indexOf('**', boldStart + 2);
    if (boldEnd === -1) {
      parts.push(remaining);
      break;
    }

    if (boldStart > 0) {
      parts.push(remaining.slice(0, boldStart));
    }

    parts.push(
      <strong key={key++} className="font-semibold text-gray-900">
        {remaining.slice(boldStart + 2, boldEnd)}
      </strong>,
    );

    remaining = remaining.slice(boldEnd + 2);
  }

  return parts;
}
