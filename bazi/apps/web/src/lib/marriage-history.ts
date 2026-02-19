import type { BirthInput, BaZiResult, MarriageCompatibility } from '@bazi/domain';

export interface MarriageHistoryEntry {
  id: string;
  maleInput: BirthInput;
  femaleInput: BirthInput;
  maleResult: BaZiResult;
  femaleResult: BaZiResult;
  compatibility: MarriageCompatibility;
  createdAt: number;
  maleLabel: string;
  femaleLabel: string;
}

const STORAGE_KEY = 'marriage-history';
const MAX_ENTRIES = 10;

function buildLabel(input: BirthInput, name?: string): string {
  if (name) return name;
  const date = `${input.year}-${String(input.month).padStart(2, '0')}-${String(input.day).padStart(2, '0')}`;
  const time = input.hourUnknown
    ? ''
    : ` ${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}`;
  const gender = input.gender === 'male' ? '男' : input.gender === 'female' ? '女' : '';
  return `${date}${time} ${gender}`.trim();
}

export function getMarriageHistory(): MarriageHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMarriageHistory(
  maleInput: BirthInput,
  femaleInput: BirthInput,
  maleResult: BaZiResult,
  femaleResult: BaZiResult,
  compatibility: MarriageCompatibility,
  maleName?: string,
  femaleName?: string,
): MarriageHistoryEntry {
  const entries = getMarriageHistory();
  const entry: MarriageHistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    maleInput,
    femaleInput,
    maleResult,
    femaleResult,
    compatibility,
    createdAt: Date.now(),
    maleLabel: buildLabel(maleInput, maleName),
    femaleLabel: buildLabel(femaleInput, femaleName),
  };

  const updated = [entry, ...entries].slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 5)));
  }

  return entry;
}
