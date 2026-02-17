/**
 * Calendar Adapter
 *
 * Thin wrapper around lunar-typescript that isolates the third-party dependency.
 * If the library is ever replaced, only this file changes.
 */

import { Solar, Lunar, EightChar, Yun, DaYun, LiuNian, SolarUtil } from 'lunar-typescript';

import type {
  BirthInput,
  StemBranch,
  HeavenlyStem,
  EarthlyBranch,
  WuXing,
  YinYang,
} from '../types.js';

// === Stem/Branch Metadata ===

const STEM_WUXING: Record<string, WuXing> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

const BRANCH_WUXING: Record<string, WuXing> = {
  '子': '水', '丑': '土',
  '寅': '木', '卯': '木',
  '辰': '土', '巳': '火',
  '午': '火', '未': '土',
  '申': '金', '酉': '金',
  '戌': '土', '亥': '水',
};

const STEM_YINYANG: Record<string, YinYang> = {
  '甲': '阳', '乙': '阴',
  '丙': '阳', '丁': '阴',
  '戊': '阳', '己': '阴',
  '庚': '阳', '辛': '阴',
  '壬': '阳', '癸': '阴',
};

/**
 * Hidden stems for each earthly branch (藏干)
 */
const BRANCH_HIDDEN_STEMS: Record<string, HeavenlyStem[]> = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲'],
};

// === Core Adapter Functions ===

/**
 * Create a Solar object from BirthInput.
 * Handles solar/lunar calendar conversion.
 */
export function createSolar(input: BirthInput): Solar {
  // Apply true solar time adjustment if requested
  const adj = adjustToTrueSolarTime(input);

  if (adj.calendarType === 'lunar') {
    // lunar-typescript uses negative month for leap months (e.g., -4 = 闰四月)
    const lunarMonth = adj.isLeapMonth ? -adj.month : adj.month;
    const lunar = Lunar.fromYmdHms(
      adj.year,
      lunarMonth,
      adj.day,
      adj.hour,
      adj.minute,
      0,
    );
    return lunar.getSolar();
  }
  return Solar.fromYmdHms(
    adj.year,
    adj.month,
    adj.day,
    adj.hour,
    adj.minute,
    0,
  );
}

/**
 * Get the Lunar object from a Solar object.
 */
export function getLunar(solar: Solar): Lunar {
  return solar.getLunar();
}

/**
 * Get the EightChar (八字) object from a Lunar object.
 */
export function getEightChar(lunar: Lunar): EightChar {
  return lunar.getEightChar();
}

/**
 * Get the Yun (运) object from EightChar.
 * @param genderCode 1 for male, 0 for female
 */
export function getYun(eightChar: EightChar, genderCode: number): Yun {
  return eightChar.getYun(genderCode);
}

/**
 * Get major fortune cycles from Yun.
 */
export function getDaYun(yun: Yun): DaYun[] {
  return yun.getDaYun();
}

/**
 * Get annual fortune from a DaYun cycle.
 */
export function getLiuNian(daYun: DaYun): LiuNian[] {
  return daYun.getLiuNian();
}

// === Helper Functions ===

export function parseStemBranch(ganZhi: string): StemBranch {
  const stem = ganZhi[0] as HeavenlyStem;
  const branch = ganZhi[1] as EarthlyBranch;
  return { stem, branch, ganZhi };
}

export function getStemWuXing(stem: string): WuXing {
  return STEM_WUXING[stem];
}

export function getBranchWuXing(branch: string): WuXing {
  return BRANCH_WUXING[branch];
}

export function getStemYinYang(stem: string): YinYang {
  return STEM_YINYANG[stem];
}

export function getHiddenStems(branch: string): HeavenlyStem[] {
  return BRANCH_HIDDEN_STEMS[branch] || [];
}

/**
 * Convert gender string to the numeric code lunar-typescript expects.
 */
export function genderToCode(gender: string): number {
  return gender === 'female' ? 0 : 1;
}

// === Zi Hour Mode ===

/**
 * Set the sect (派) for EightChar calculations.
 * sect=1: Day does NOT change at 23:00 (early zi stays same day)
 * sect=2: Day changes at 23:00 (late zi uses next day) — library default
 */
export function setEightCharSect(eightChar: EightChar, sect: number): void {
  eightChar.setSect(sect);
}

// === True Solar Time ===

/**
 * Adjust birth time to true solar time based on longitude.
 * Returns adjusted input with potentially changed hour/minute (and date for day rollover).
 * Central meridian defaults to 120°E (China Standard Time).
 */
export function adjustToTrueSolarTime(
  input: BirthInput,
): BirthInput {
  if (!input.useTrueSolarTime || input.longitude == null) {
    return input;
  }

  const centralMeridian = 120;
  // 1. Longitude correction: Earth rotates 1° per 4 minutes
  const longitudeCorrection = (input.longitude - centralMeridian) * 4;

  // 2. Equation of Time (approximate, accurate to ~1 minute)
  const dayOfYear = SolarUtil.getDaysInYear(input.year, input.month, input.day);
  const B = (2 * Math.PI * (dayOfYear - 81)) / 365;
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

  const totalAdjustmentMinutes = Math.round(longitudeCorrection + eot);

  let totalMinutes = input.hour * 60 + input.minute + totalAdjustmentMinutes;

  // Handle day rollover
  let dayOffset = 0;
  while (totalMinutes < 0) {
    totalMinutes += 24 * 60;
    dayOffset--;
  }
  while (totalMinutes >= 24 * 60) {
    totalMinutes -= 24 * 60;
    dayOffset++;
  }

  const adjustedHour = Math.floor(totalMinutes / 60);
  const adjustedMinute = totalMinutes % 60;

  if (dayOffset !== 0) {
    // Use Solar date arithmetic for day rollover
    const solar = Solar.fromYmdHms(input.year, input.month, input.day, 12, 0, 0);
    const adjusted = solar.next(dayOffset);
    return {
      ...input,
      year: adjusted.getYear(),
      month: adjusted.getMonth(),
      day: adjusted.getDay(),
      hour: adjustedHour,
      minute: adjustedMinute,
    };
  }

  return {
    ...input,
    hour: adjustedHour,
    minute: adjustedMinute,
  };
}

// === DiShi (地势/十二长生) ===

export function getYearDiShi(eightChar: EightChar): string {
  return eightChar.getYearDiShi();
}

export function getMonthDiShi(eightChar: EightChar): string {
  return eightChar.getMonthDiShi();
}

export function getDayDiShi(eightChar: EightChar): string {
  return eightChar.getDayDiShi();
}

export function getTimeDiShi(eightChar: EightChar): string {
  return eightChar.getTimeDiShi();
}

// === XunKong (旬空) ===

export function getYearXunKong(eightChar: EightChar): { xun: string; xunKong: string } {
  return { xun: eightChar.getYearXun(), xunKong: eightChar.getYearXunKong() };
}

export function getMonthXunKong(eightChar: EightChar): { xun: string; xunKong: string } {
  return { xun: eightChar.getMonthXun(), xunKong: eightChar.getMonthXunKong() };
}

export function getDayXunKong(eightChar: EightChar): { xun: string; xunKong: string } {
  return { xun: eightChar.getDayXun(), xunKong: eightChar.getDayXunKong() };
}

export function getTimeXunKong(eightChar: EightChar): { xun: string; xunKong: string } {
  return { xun: eightChar.getTimeXun(), xunKong: eightChar.getTimeXunKong() };
}

// === Special Palaces (特殊宫位) ===

export function getMingGong(eightChar: EightChar): { ganZhi: string; naYin: string } {
  return { ganZhi: eightChar.getMingGong(), naYin: eightChar.getMingGongNaYin() };
}

export function getShenGong(eightChar: EightChar): { ganZhi: string; naYin: string } {
  return { ganZhi: eightChar.getShenGong(), naYin: eightChar.getShenGongNaYin() };
}

export function getTaiYuan(eightChar: EightChar): { ganZhi: string; naYin: string } {
  return { ganZhi: eightChar.getTaiYuan(), naYin: eightChar.getTaiYuanNaYin() };
}

export function getTaiXi(eightChar: EightChar): { ganZhi: string; naYin: string } {
  return { ganZhi: eightChar.getTaiXi(), naYin: eightChar.getTaiXiNaYin() };
}

// === ShenSha (神煞) ===

export function getDayShenSha(lunar: Lunar): { jiShen: string[]; xiongSha: string[] } {
  return {
    jiShen: lunar.getDayJiShen(),
    xiongSha: lunar.getDayXiongSha(),
  };
}

// === Cross-verification: Library Ten Gods ===

export function getLibraryShiShen(eightChar: EightChar): {
  year: { gan: string; zhi: string[] };
  month: { gan: string; zhi: string[] };
  day: { gan: string; zhi: string[] };
  time: { gan: string; zhi: string[] };
} {
  return {
    year: { gan: eightChar.getYearShiShenGan(), zhi: eightChar.getYearShiShenZhi() },
    month: { gan: eightChar.getMonthShiShenGan(), zhi: eightChar.getMonthShiShenZhi() },
    day: { gan: eightChar.getDayShiShenGan(), zhi: eightChar.getDayShiShenZhi() },
    time: { gan: eightChar.getTimeShiShenGan(), zhi: eightChar.getTimeShiShenZhi() },
  };
}
