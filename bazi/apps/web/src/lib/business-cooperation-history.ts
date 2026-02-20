import type { BirthInput, BaZiResult, BusinessCompatibility } from '@bazi/domain';

export interface BusinessCooperationHistoryEntry {
  id: string;
  person1Input: BirthInput;
  person2Input: BirthInput;
  person1Result: BaZiResult;
  person2Result: BaZiResult;
  compatibility: BusinessCompatibility;
  createdAt: number;
  person1Label: string;
  person2Label: string;
}

const STORAGE_KEY = 'business-cooperation-history';
const MAX_ENTRIES = 10;

function buildLabel(input: BirthInput, name?: string): string {
  if (name) return name;
  const date = `${input.year}-${String(input.month).padStart(2, '0')}-${String(input.day).padStart(2, '0')}`;
  const time = input.hourUnknown
    ? ''
    : ` ${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}`;
  return `${date}${time}`.trim();
}

export function getBusinessCooperationHistory(): BusinessCooperationHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBusinessCooperationHistory(
  person1Input: BirthInput,
  person2Input: BirthInput,
  person1Result: BaZiResult,
  person2Result: BaZiResult,
  compatibility: BusinessCompatibility,
  person1Name?: string,
  person2Name?: string,
): BusinessCooperationHistoryEntry {
  const entries = getBusinessCooperationHistory();
  const entry: BusinessCooperationHistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    person1Input,
    person2Input,
    person1Result,
    person2Result,
    compatibility,
    createdAt: Date.now(),
    person1Label: buildLabel(person1Input, person1Name),
    person2Label: buildLabel(person2Input, person2Name),
  };

  const updated = [entry, ...entries].slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 5)));
  }

  return entry;
}
