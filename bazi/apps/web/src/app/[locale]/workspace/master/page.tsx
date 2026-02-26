'use client';

import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect, useCallback } from 'react';
import { CitySelector } from '@/components/bazi/city-selector';
import type { City } from '@/data/cities';

// === Types ===

interface Profile {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: 'male' | 'female';
  calendarType: 'solar' | 'lunar';
  useTrueSolarTime?: boolean;
  longitude?: number;
  latitude?: number;
}

interface MethodBadge {
  method: string;
  label: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  methods?: MethodBadge[];
  status?: 'streaming' | 'done' | 'error';
}

// === Profile Storage ===

const PROFILE_KEY = 'master-agent-profile';

function loadProfile(): Profile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveProfile(profile: Profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

// === Markdown Rendering Helpers ===

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function renderBody(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="ml-4 list-disc space-y-1">
          {listItems.map((item, i) => (
            <li key={i} className="text-gray-700">
              {renderInline(item)}
            </li>
          ))}
        </ul>,
      );
      listItems = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3
          key={`h-${elements.length}`}
          className="mt-4 mb-2 text-base font-bold text-gray-900"
        >
          {renderInline(trimmed.slice(4))}
        </h3>,
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listItems.push(trimmed.slice(2));
    } else if (/^\d+\.\s/.test(trimmed)) {
      flushList();
      elements.push(
        <p key={`p-${elements.length}`} className="text-gray-700">
          {renderInline(trimmed)}
        </p>,
      );
    } else if (trimmed === '') {
      flushList();
      elements.push(<div key={`sp-${elements.length}`} className="h-2" />);
    } else {
      flushList();
      elements.push(
        <p key={`p-${elements.length}`} className="text-gray-700 leading-relaxed">
          {renderInline(trimmed)}
        </p>,
      );
    }
  }
  flushList();
  return elements;
}

// === Components ===

function ProfileForm({
  profile,
  onSave,
  collapsed,
  onToggle,
}: {
  profile: Profile | null;
  onSave: (p: Profile) => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations();
  const [year, setYear] = useState(profile?.year ?? 1990);
  const [month, setMonth] = useState(profile?.month ?? 1);
  const [day, setDay] = useState(profile?.day ?? 1);
  const [hour, setHour] = useState(profile?.hour ?? 12);
  const [minute, setMinute] = useState(profile?.minute ?? 0);
  const [gender, setGender] = useState<'male' | 'female'>(
    profile?.gender ?? 'male',
  );
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>(
    profile?.calendarType ?? 'solar',
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [useTrueSolarTime, setUseTrueSolarTime] = useState(
    profile?.useTrueSolarTime ?? false,
  );
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [longitude, setLongitude] = useState(
    profile?.longitude?.toString() ?? '',
  );
  const [latitude, setLatitude] = useState(
    profile?.latitude?.toString() ?? '',
  );

  // Sync form state when profile changes (e.g., loaded from localStorage)
  useEffect(() => {
    if (profile) {
      setYear(profile.year);
      setMonth(profile.month);
      setDay(profile.day);
      setHour(profile.hour);
      setMinute(profile.minute);
      setGender(profile.gender);
      setCalendarType(profile.calendarType);
      setUseTrueSolarTime(profile.useTrueSolarTime ?? false);
      setLongitude(profile.longitude?.toString() ?? '');
      setLatitude(profile.latitude?.toString() ?? '');
    }
  }, [profile]);

  const handleSave = () => {
    const p: Profile = {
      year,
      month,
      day,
      hour,
      minute,
      gender,
      calendarType,
      useTrueSolarTime: useTrueSolarTime && longitude ? true : undefined,
      longitude: useTrueSolarTime && longitude ? parseFloat(longitude) : undefined,
      latitude: latitude ? parseFloat(latitude) : undefined,
    };
    saveProfile(p);
    onSave(p);
  };

  if (collapsed && profile) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 transition"
        >
          <div className="flex-1 text-sm text-gray-600">
            <span className="font-medium text-gray-900">
              {t('master.profileSaved')}
            </span>
            {' — '}
            {profile.year}/{profile.month}/{profile.day} {profile.hour}:
            {String(profile.minute).padStart(2, '0')}{' '}
            {t(`common.${profile.gender}`)}
            {profile.useTrueSolarTime && (
              <span className="ml-2 text-xs text-gray-500">
                ({t('bazi.form.useTrueSolarTime')})
              </span>
            )}
          </div>
          <div className="ml-4 flex items-center gap-2">
            <span className="text-xs text-gray-500">{t('master.editProfile')}</span>
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          {t('master.profileTitle')}
        </h3>
        {profile && (
          <button
            onClick={onToggle}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            {t('common.collapse')}
          </button>
        )}
      </div>
      <p className="mb-4 text-xs text-gray-500">{t('master.profileHint')}</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Gender */}
        <div className="col-span-2 sm:col-span-4">
          <label className="mb-1 block text-xs text-gray-500">
            {t('bazi.form.gender')}
          </label>
          <div className="flex gap-2">
            {(['male', 'female'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`rounded-lg px-4 py-1.5 text-sm ${
                  gender === g
                    ? 'bg-gray-900 text-white'
                    : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t(`common.${g}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Type */}
        <div className="col-span-2 sm:col-span-4">
          <label className="mb-1 block text-xs text-gray-500">
            {t('bazi.form.calendarType')}
          </label>
          <div className="flex gap-2">
            {(['solar', 'lunar'] as const).map((ct) => (
              <button
                key={ct}
                onClick={() => setCalendarType(ct)}
                className={`rounded-lg px-4 py-1.5 text-sm ${
                  calendarType === ct
                    ? 'bg-gray-900 text-white'
                    : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t(`bazi.form.${ct}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Year */}
        <div>
          <label className="mb-1 block text-xs text-gray-500">
            {t('bazi.form.year')}
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value === '' ? 0 : Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            min={1900}
            max={2100}
          />
        </div>

        {/* Month */}
        <div>
          <label className="mb-1 block text-xs text-gray-500">
            {t('bazi.form.month')}
          </label>
          <input
            type="number"
            value={month}
            onChange={(e) => setMonth(e.target.value === '' ? 0 : Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            min={1}
            max={12}
          />
        </div>

        {/* Day */}
        <div>
          <label className="mb-1 block text-xs text-gray-500">
            {t('bazi.form.day')}
          </label>
          <input
            type="number"
            value={day}
            onChange={(e) => setDay(e.target.value === '' ? 0 : Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            min={1}
            max={31}
          />
        </div>

        {/* Spacer for alignment */}
        <div className="hidden sm:block" />

        {/* Hour */}
        <div>
          <label className="mb-1 block text-xs text-gray-500">
            {t('bazi.form.hour')}
          </label>
          <input
            type="number"
            value={hour}
            onChange={(e) => setHour(e.target.value === '' ? 0 : Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            min={0}
            max={23}
          />
        </div>

        {/* Minute */}
        <div>
          <label className="mb-1 block text-xs text-gray-500">
            {t('bazi.form.minute')}
          </label>
          <input
            type="number"
            value={minute}
            onChange={(e) => setMinute(e.target.value === '' ? 0 : Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            min={0}
            max={59}
          />
        </div>
      </div>

      {/* Advanced Options */}
      <div className="mt-4 rounded-lg border border-gray-200">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          <span>{t('bazi.form.advancedOptions')}</span>
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {showAdvanced && (
          <div className="space-y-3 border-t border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="masterTrueSolarTime"
                checked={useTrueSolarTime}
                onChange={(e) => setUseTrueSolarTime(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="masterTrueSolarTime" className="text-sm text-gray-700">
                {t('bazi.form.useTrueSolarTime')}
              </label>
            </div>

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
                        setLatitude(String(city.latitude));
                      }
                    }}
                    placeholder={t('bazi.form.cityPlaceholder')}
                    noResultsText={t('bazi.form.cityNoResults')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
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
                  <div>
                    <label className="mb-1 block text-sm text-gray-700">
                      {t('bazi.form.latitude')}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="-90"
                      max="90"
                      value={latitude}
                      onChange={(e) => {
                        setLatitude(e.target.value);
                        setSelectedCity(null);
                      }}
                      placeholder={t('bazi.form.latitudePlaceholder')}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-gray-400">
                  {t('bazi.form.southernHemisphereNote')}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => {
            handleSave();
            onToggle(); // Auto-collapse after save
          }}
          className="flex-1 rounded-lg bg-gray-900 px-6 py-2 text-sm text-white hover:bg-gray-800"
        >
          {t('master.saveProfile')}
        </button>
        {profile && (
          <button
            onClick={onToggle}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            {t('common.cancel')}
          </button>
        )}
      </div>
    </div>
  );
}

function MethodBadges({ methods }: { methods: MethodBadge[] }) {
  const colors: Record<string, string> = {
    bazi: 'border-amber-200 bg-amber-50 text-amber-700',
    meihua: 'border-pink-200 bg-pink-50 text-pink-700',
    qimen: 'border-purple-200 bg-purple-50 text-purple-700',
    liuyao: 'border-blue-200 bg-blue-50 text-blue-700',
    liuren: 'border-teal-200 bg-teal-50 text-teal-700',
  };

  return (
    <div className="mb-2 flex flex-wrap gap-1.5">
      {methods.map((m) => (
        <span
          key={m.method}
          className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[m.method] ?? 'border-gray-200 bg-gray-50 text-gray-600'}`}
        >
          {m.label}
        </span>
      ))}
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-gray-900 px-4 py-3 text-sm text-white">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-gray-100 bg-white px-5 py-4 shadow-sm">
        {message.methods && message.methods.length > 0 && (
          <MethodBadges methods={message.methods} />
        )}
        {message.status === 'streaming' && !message.content ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            <span>...</span>
          </div>
        ) : message.status === 'error' ? (
          <p className="text-sm text-red-600">{message.content}</p>
        ) : (
          <div className="text-sm">{renderBody(message.content)}</div>
        )}
        {message.status === 'streaming' && message.content && (
          <span className="mt-1 inline-block h-3 w-1 animate-pulse bg-gray-400" />
        )}
      </div>
    </div>
  );
}

// === Main Page ===

export default function MasterAgentPage() {
  const t = useTranslations();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileCollapsed, setProfileCollapsed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load profile from localStorage on mount
  useEffect(() => {
    const saved = loadProfile();
    if (saved) {
      setProfile(saved);
      setProfileCollapsed(true);
    }
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Parse method metadata from stream prefix
  const parseMethodsMeta = (text: string): { methods: MethodBadge[]; cleanText: string } => {
    const match = text.match(/^<!--methods:(.*?)-->\n/);
    if (match) {
      try {
        const methods = JSON.parse(match[1]) as MethodBadge[];
        return { methods, cleanText: text.slice(match[0].length) };
      } catch {
        return { methods: [], cleanText: text };
      }
    }
    return { methods: [], cleanText: text };
  };

  const sendMessage = useCallback(async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    setInput('');
    setIsLoading(true);

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
    };

    const assistantId = `assistant-${Date.now()}`;
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      methods: [],
      status: 'streaming',
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    try {
      // Build conversation history (exclude current pending messages)
      const history = messages
        .filter((m) => m.status === 'done')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const response = await fetch('/api/agent/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: profile ?? undefined,
          question,
          history, // Send conversation history
          locale: 'zh', // TODO: detect from next-intl
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMsg =
          data.error === 'NO_API_KEY'
            ? t('master.noApiKey')
            : t('master.error');
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: errorMsg, status: 'error' }
              : m,
          ),
        );
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let accumulated = '';
      let parsedMethods: MethodBadge[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });

        // Parse methods from first chunk
        const { methods, cleanText } = parseMethodsMeta(accumulated);
        if (methods.length > 0) parsedMethods = methods;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: cleanText,
                  methods: parsedMethods,
                  status: 'streaming',
                }
              : m,
          ),
        );
      }

      // Mark as done
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, status: 'done' } : m,
        ),
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: t('master.error'), status: 'error' }
            : m,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, profile, t]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-lg font-semibold">{t('master.title')}</h1>
        <p className="text-sm text-gray-500">{t('master.subtitle')}</p>
      </div>

      {/* Profile Section */}
      <ProfileForm
        profile={profile}
        onSave={(p) => {
          setProfile(p);
          setProfileCollapsed(true);
        }}
        collapsed={profileCollapsed}
        onToggle={() => setProfileCollapsed(!profileCollapsed)}
      />

      {/* Messages Area */}
      <div className="mt-4 flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50/50 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 text-4xl">&#x2728;</div>
            <p className="mb-2 text-sm font-medium text-gray-600">
              {t('master.emptyTitle')}
            </p>
            <p className="max-w-md text-xs text-gray-400">
              {t('master.emptyHint')}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                'master.example1',
                'master.example2',
                'master.example3',
                'master.example4',
              ].map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setInput(t(key));
                    inputRef.current?.focus();
                  }}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                >
                  {t(key)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="mt-3 flex gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('master.inputPlaceholder')}
          className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none"
          rows={1}
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="rounded-xl bg-gray-900 px-5 py-3 text-sm text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            t('master.send')
          )}
        </button>
      </div>

      {/* Disclaimer */}
      <p className="mt-2 text-center text-xs text-gray-400">
        {t('master.disclaimer')}
      </p>
    </div>
  );
}
