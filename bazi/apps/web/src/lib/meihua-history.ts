import type { MeihuaInput, MeihuaResult } from '@bazi/domain';

export interface MeihuaHistoryEntry {
  id: string;
  input: MeihuaInput;
  result: MeihuaResult;
  createdAt: number;
  label: string;
}

const STORAGE_KEY = 'meihua-history';
const MAX_ENTRIES = 20;

function buildLabel(result: MeihuaResult): string {
  return `${result.benGua.name} → ${result.bianGua.name}`;
}

export function getMeihuaHistory(): MeihuaHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToMeihuaHistory(input: MeihuaInput, result: MeihuaResult): MeihuaHistoryEntry {
  const entries = getMeihuaHistory();
  const entry: MeihuaHistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    input,
    result,
    createdAt: Date.now(),
    label: buildLabel(result),
  };

  const updated = [entry, ...entries].slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 10)));
  }

  return entry;
}

export function removeFromMeihuaHistory(id: string): void {
  const entries = getMeihuaHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function clearMeihuaHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
