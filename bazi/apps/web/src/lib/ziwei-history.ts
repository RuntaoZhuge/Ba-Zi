import type { ZiweiInput, ZiweiResult } from '@bazi/domain';

export interface ZiweiHistoryEntry {
  id: string;
  input: ZiweiInput;
  result: ZiweiResult;
  createdAt: number;
  label: string;
}

const STORAGE_KEY = 'ziwei-history';
const MAX_ENTRIES = 20;

function buildLabel(input: ZiweiInput, result: ZiweiResult): string {
  const name = input.name || `${input.year}.${input.month}.${input.day}`;
  return `${name} · ${result.chart.wuxingJu}`;
}

export function getZiweiHistory(): ZiweiHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToZiweiHistory(input: ZiweiInput, result: ZiweiResult): ZiweiHistoryEntry {
  const entries = getZiweiHistory();
  const entry: ZiweiHistoryEntry = {
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

export function removeFromZiweiHistory(id: string): void {
  const entries = getZiweiHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function clearZiweiHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
