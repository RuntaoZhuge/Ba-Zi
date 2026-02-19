'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useCallback, useRef } from 'react';
import { calculateBaZi, analyzeMarriage } from '@bazi/domain';
import type { BirthInput, BaZiResult, MarriageCompatibility } from '@bazi/domain';
import { BirthForm } from '@/components/bazi/birth-form';
import { MarriageResultDisplay } from '@/components/bazi/marriage-result-display';
import { saveMarriageHistory } from '@/lib/marriage-history';
import { streamFetch } from '@/lib/stream-fetch';

type Status = 'idle' | 'loading' | 'streaming' | 'done' | 'error';

export default function BaZiMarriagePage() {
  const t = useTranslations('baziMarriage');
  const locale = useLocale();

  const maleFormRef = useRef<HTMLFormElement>(null);
  const femaleFormRef = useRef<HTMLFormElement>(null);
  const maleInputRef = useRef<BirthInput | null>(null);
  const femaleInputRef = useRef<BirthInput | null>(null);

  const [maleName, setMaleName] = useState('');
  const [femaleName, setFemaleName] = useState('');
  const [maleResult, setMaleResult] = useState<BaZiResult | null>(null);
  const [femaleResult, setFemaleResult] = useState<BaZiResult | null>(null);
  const [compatibility, setCompatibility] = useState<MarriageCompatibility | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // AI analysis state
  const [text, setText] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorKey, setErrorKey] = useState<string>('error');

  const handleMaleSubmit = (input: BirthInput) => {
    const mi = { ...input, gender: 'male' as const };
    maleInputRef.current = mi;
  };

  const handleFemaleSubmit = (input: BirthInput) => {
    const fi = { ...input, gender: 'female' as const };
    femaleInputRef.current = fi;
  };

  const handleMatch = () => {
    // Trigger both form validations — requestSubmit fires onSubmit synchronously
    maleFormRef.current?.requestSubmit();
    femaleFormRef.current?.requestSubmit();

    const mi = maleInputRef.current;
    const fi = femaleInputRef.current;
    if (!mi || !fi) return;

    setIsCalculating(true);
    setText('');
    setStatus('idle');

    try {
      const mr = calculateBaZi(mi);
      const fr = calculateBaZi(fi);
      const comp = analyzeMarriage(mr, fr);

      setMaleResult(mr);
      setFemaleResult(fr);
      setCompatibility(comp);

      saveMarriageHistory(mi, fi, mr, fr, comp, maleName, femaleName);
    } catch {
      // calculation error handled by empty state
    } finally {
      setIsCalculating(false);
    }
  };

  const startAnalysis = useCallback(async () => {
    if (!maleResult || !femaleResult || !compatibility) return;
    setText('');
    setStatus('loading');

    try {
      const res = await streamFetch(
        '/api/bazi/marriage',
        { maleResult, femaleResult, compatibility, locale },
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
  }, [maleResult, femaleResult, compatibility, locale]);

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
          <h2 className="mb-4 text-lg font-semibold text-blue-700">{t('maleInfo')}</h2>
          <BirthForm
            ref={maleFormRef}
            onSubmit={handleMaleSubmit}
            onNameChange={setMaleName}
            isLoading={isCalculating}
            hideSubmit
          />
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-pink-700">{t('femaleInfo')}</h2>
          <BirthForm
            ref={femaleFormRef}
            onSubmit={handleFemaleSubmit}
            onNameChange={setFemaleName}
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
      {maleResult && femaleResult && compatibility && (
        <>
          <MarriageResultDisplay
            compatibility={compatibility}
            maleResult={maleResult}
            femaleResult={femaleResult}
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
