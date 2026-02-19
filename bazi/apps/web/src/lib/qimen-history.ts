import type { QimenInput, QimenResult } from '@bazi/domain';

export interface QimenHistoryEntry {
  id: string;
  input: QimenInput;
  result: QimenResult;
  createdAt: number;
  label: string;
}

const STORAGE_KEY = 'qimen-history';
const MAX_ENTRIES = 20;

function buildLabel(input: QimenInput, result: QimenResult): string {
  const date = `${input.year}.${input.month}.${input.day}`;
  const time = `${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}`;
  const ju = `${result.board.dunType}${result.board.juNumber}局`;
  return `${date} ${time} · ${ju}`;
}

export function getQimenHistory(): QimenHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToQimenHistory(input: QimenInput, result: QimenResult): QimenHistoryEntry {
  const entries = getQimenHistory();
  const entry: QimenHistoryEntry = {
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

export function removeFromQimenHistory(id: string): void {
  const entries = getQimenHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function clearQimenHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
