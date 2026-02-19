import type { LiuyaoInput, LiuyaoResult } from '@bazi/domain';

export interface LiuyaoHistoryEntry {
  id: string;
  input: LiuyaoInput;
  result: LiuyaoResult;
  createdAt: number;
  label: string;
}

const STORAGE_KEY = 'liuyao-history';
const MAX_ENTRIES = 20;

function buildLabel(input: LiuyaoInput, result: LiuyaoResult): string {
  const date = `${input.year}.${input.month}.${input.day}`;
  const time = `${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}`;
  return `${date} ${time} · ${result.originalHex.name}`;
}

export function getLiuyaoHistory(): LiuyaoHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToLiuyaoHistory(input: LiuyaoInput, result: LiuyaoResult): LiuyaoHistoryEntry {
  const entries = getLiuyaoHistory();
  const entry: LiuyaoHistoryEntry = {
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

export function removeFromLiuyaoHistory(id: string): void {
  const entries = getLiuyaoHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function clearLiuyaoHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
