import type { LiurenInput, LiurenResult } from '@bazi/domain';

export interface LiurenHistoryEntry {
  id: string;
  input: LiurenInput;
  result: LiurenResult;
  createdAt: number;
  label: string;
}

const STORAGE_KEY = 'liuren-history';
const MAX_ENTRIES = 20;

function buildLabel(input: LiurenInput, result: LiurenResult): string {
  const date = `${input.year}.${input.month}.${input.day}`;
  const time = `${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}`;
  return `${date} ${time} · ${result.board.transmission.method}`;
}

export function getLiurenHistory(): LiurenHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToLiurenHistory(input: LiurenInput, result: LiurenResult): LiurenHistoryEntry {
  const entries = getLiurenHistory();
  const entry: LiurenHistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    input,
    result,
    createdAt: Date.now(),
    label: buildLabel(input, result),
  };

  const updated = [entry, ...entries].slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 10)));
  }

  return entry;
}

export function removeFromLiurenHistory(id: string): void {
  const entries = getLiurenHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function clearLiurenHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
