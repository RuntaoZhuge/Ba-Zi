import type { BirthInput, BaZiResult } from '@bazi/domain';

export interface BaZiHistoryEntry {
  id: string;
  input: BirthInput;
  result: BaZiResult;
  createdAt: number;
  label: string; // display name: "姓名" or "1990-01-01 12:00 男"
}

const STORAGE_KEY = 'bazi-history';
const MAX_ENTRIES = 20;

function buildLabel(input: BirthInput): string {
  const date = `${input.year}-${String(input.month).padStart(2, '0')}-${String(input.day).padStart(2, '0')}`;
  const time = input.hourUnknown
    ? ''
    : ` ${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}`;
  const gender = input.gender === 'male' ? '男' : input.gender === 'female' ? '女' : '';
  return `${date}${time} ${gender}`.trim();
}

export function getHistory(): BaZiHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(input: BirthInput, result: BaZiResult, name?: string): BaZiHistoryEntry {
  const entries = getHistory();
  const entry: BaZiHistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    input,
    result,
    createdAt: Date.now(),
    label: name || buildLabel(input),
  };

  // Prepend new entry, remove duplicates by same date+time+gender
  const key = `${input.year}-${input.month}-${input.day}-${input.hour}-${input.minute}-${input.gender}`;
  const filtered = entries.filter((e) => {
    const k = `${e.input.year}-${e.input.month}-${e.input.day}-${e.input.hour}-${e.input.minute}-${e.input.gender}`;
    return k !== key;
  });

  const updated = [entry, ...filtered].slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Storage full — remove oldest entries
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 10)));
  }

  return entry;
}

export function removeFromHistory(id: string): void {
  const entries = getHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
