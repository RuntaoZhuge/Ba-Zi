'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useCallback, useRef } from 'react';
import { calculateBaZi, analyzeBusinessCooperation } from '@bazi/domain';
import type { BirthInput, BaZiResult, BusinessCompatibility } from '@bazi/domain';
import { BirthForm } from '@/components/bazi/birth-form';
import { BusinessResultDisplay } from '@/components/bazi/business-result-display';
import { saveBusinessCooperationHistory } from '@/lib/business-cooperation-history';
import { streamFetch } from '@/lib/stream-fetch';

type Status = 'idle' | 'loading' | 'streaming' | 'done' | 'error';

export default function BaZiBusinessPage() {
  const t = useTranslations('baziBusiness');
  const locale = useLocale();

  const person1FormRef = useRef<HTMLFormElement>(null);
  const person2FormRef = useRef<HTMLFormElement>(null);
  const person1InputRef = useRef<BirthInput | null>(null);
  const person2InputRef = useRef<BirthInput | null>(null);

  const [person1Name, setPerson1Name] = useState('');
  const [person2Name, setPerson2Name] = useState('');
  const [person1Result, setPerson1Result] = useState<BaZiResult | null>(null);
  const [person2Result, setPerson2Result] = useState<BaZiResult | null>(null);
  const [compatibility, setCompatibility] = useState<BusinessCompatibility | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // AI analysis state
  const [text, setText] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorKey, setErrorKey] = useState<string>('error');

  const handlePerson1Submit = (input: BirthInput) => {
    person1InputRef.current = input;
  };

  const handlePerson2Submit = (input: BirthInput) => {
    person2InputRef.current = input;
  };

  const handleMatch = () => {
    person1FormRef.current?.requestSubmit();
    person2FormRef.current?.requestSubmit();

    const p1 = person1InputRef.current;
    const p2 = person2InputRef.current;
    if (!p1 || !p2) return;

    setIsCalculating(true);
    setText('');
    setStatus('idle');

    try {
      const r1 = calculateBaZi(p1);
      const r2 = calculateBaZi(p2);
      const comp = analyzeBusinessCooperation(r1, r2);

      setPerson1Result(r1);
      setPerson2Result(r2);
      setCompatibility(comp);

      saveBusinessCooperationHistory(p1, p2, r1, r2, comp, person1Name, person2Name);
    } catch {
      // calculation error handled by empty state
    } finally {
      setIsCalculating(false);
    }
  };

  const startAnalysis = useCallback(async () => {
    if (!person1Result || !person2Result || !compatibility) return;
    setText('');
    setStatus('loading');

    try {
      const res = await streamFetch(
        '/api/bazi/business-cooperation',
        { person1Result, person2Result, compatibility, locale },
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
  }, [person1Result, person2Result, compatibility, locale]);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="mt-1 text-gray-500">{t('subtitle')}</p>
      </div>

      {/* Dual Forms */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-indigo-700">{t('person1Info')}</h2>
          <BirthForm
            ref={person1FormRef}
            onSubmit={handlePerson1Submit}
            onNameChange={setPerson1Name}
            isLoading={isCalculating}
            hideSubmit
          />
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-emerald-700">{t('person2Info')}</h2>
          <BirthForm
            ref={person2FormRef}
            onSubmit={handlePerson2Submit}
            onNameChange={setPerson2Name}
            isLoading={isCalculating}
            hideSubmit
          />
        </section>
      </div>

      {/* Central Match Button */}
      <button
        type="button"
        onClick={handleMatch}
        disabled={isCalculating}
        className="w-full rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
      >
        {isCalculating ? t('matching') : t('startMatch')}
      </button>

      {/* Results */}
      {person1Result && person2Result && compatibility && (
        <>
          <BusinessResultDisplay
            compatibility={compatibility}
            person1Result={person1Result}
            person2Result={person2Result}
          />

          {/* AI Analysis */}
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t('analysis.title')}</h2>
              {(status === 'idle' || status === 'done' || status === 'error') && (
                <button
                  type="button"
                  onClick={startAnalysis}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  {status === 'done' ? t('analysis.reAnalyze') : t('analysis.startAnalysis')}
                </button>
              )}
              {(status === 'loading' || status === 'streaming') && (
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                  {t('analysis.analyzing')}
                </span>
              )}
            </div>

            {status === 'error' && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {t(`analysis.${errorKey}`)}
                <button
                  type="button"
                  onClick={startAnalysis}
                  className="ml-2 text-xs underline"
                >
                  {t('analysis.retry')}
                </button>
              </div>
            )}

            {text && (
              <div className="prose prose-sm max-w-none text-gray-700">
                {renderBody(text)}
              </div>
            )}

            {(status === 'done' || status === 'streaming') && (
              <p className="mt-4 text-xs text-gray-400">{t('analysis.disclaimer')}</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

// === Simple markdown renderer (same pattern as other analysis panels) ===

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
