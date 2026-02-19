/**
 * Da Liu Ren (大六壬) — Data Tables
 *
 * All static lookup tables for the Grand Six Ren divination system:
 * - Branch/element mappings
 * - Stem palace table (日干寄宫)
 * - Month general table (月将)
 * - Noble person table (贵人)
 * - Twelve generals sequence
 * - Five element relations for ke/sheng
 * - Liu Chong and San Xing tables
 */

import type { WuXing, LiurenGeneral } from '../types.js';

// === Branch / Element ===

export const BRANCH_LIST = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

export const BRANCH_ELEMENT: Record<string, WuXing> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

export function branchIndex(branch: string): number {
  return BRANCH_LIST.indexOf(branch as (typeof BRANCH_LIST)[number]);
}

// === Stem / Element ===

export const STEM_LIST = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;

export const STEM_ELEMENT: Record<string, WuXing> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
};

// === Five Element Relations ===

const WUXING_SHENG: Record<WuXing, WuXing> = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
};

/** Returns the ke-sheng relation description: A克B, A生B, 同, etc. */
export function getKeRelation(topElement: WuXing, bottomElement: WuXing): string {
  if (topElement === bottomElement) return '比和';
  if (WUXING_SHENG[topElement] === bottomElement) return `${topElement}生${bottomElement}`;
  if (WUXING_SHENG[bottomElement] === topElement) return `${bottomElement}生${topElement}`;
  // ke: A克B means A is the grandchild (隔一个) of B's sheng chain
  if (WUXING_SHENG[WUXING_SHENG[topElement]] === bottomElement) return `${topElement}克${bottomElement}`;
  return `${bottomElement}克${topElement}`;
}

/** Check if A ke (overcomes) B */
export function isKe(a: WuXing, b: WuXing): boolean {
  return WUXING_SHENG[WUXING_SHENG[a]] === b;
}

// === Stem Palace (日干寄宫) ===
// Each day stem has a "residence" branch for the four lessons

export const STEM_PALACE: Record<string, string> = {
  '甲': '寅', '乙': '辰', '丙': '巳', '丁': '未',
  '戊': '巳', '己': '未', '庚': '申', '辛': '戌',
  '壬': '亥', '癸': '丑',
};

// === Month General (月将) ===
// Determined by the zhongqi (中气) the date falls under
// After each zhongqi, the month general changes

export const MONTH_JIANG_TABLE: { zhongqi: string; branch: string; name: string }[] = [
  { zhongqi: '雨水', branch: '亥', name: '登明' },
  { zhongqi: '春分', branch: '戌', name: '河魁' },
  { zhongqi: '谷雨', branch: '酉', name: '从魁' },
  { zhongqi: '小满', branch: '申', name: '传送' },
  { zhongqi: '夏至', branch: '未', name: '小吉' },
  { zhongqi: '大暑', branch: '午', name: '胜光' },
  { zhongqi: '处暑', branch: '巳', name: '太乙' },
  { zhongqi: '秋分', branch: '辰', name: '天罡' },
  { zhongqi: '霜降', branch: '卯', name: '太冲' },
  { zhongqi: '小雪', branch: '寅', name: '功曹' },
  { zhongqi: '冬至', branch: '丑', name: '大吉' },
  { zhongqi: '大寒', branch: '子', name: '神后' },
];

// Month jiang name lookup by branch
export const JIANG_NAME: Record<string, string> = {
  '子': '神后', '丑': '大吉', '寅': '功曹', '卯': '太冲',
  '辰': '天罡', '巳': '太乙', '午': '胜光', '未': '小吉',
  '申': '传送', '酉': '从魁', '戌': '河魁', '亥': '登明',
};

// === Noble Person (贵人) ===
// Day stem → [yang noble branch, yin noble branch]
// Yang noble (day), Yin noble (night)

export const GUIREN_TABLE: Record<string, [string, string]> = {
  '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
  '乙': ['子', '申'], '己': ['子', '申'],
  '丙': ['亥', '酉'], '丁': ['亥', '酉'],
  '壬': ['巳', '卯'], '癸': ['巳', '卯'],
  '辛': ['午', '寅'],
};

// === Twelve Generals (十二天将) ===

export const TWELVE_GENERALS: LiurenGeneral[] = [
  '贵人', '螣蛇', '朱雀', '六合', '勾陈', '青龙',
  '天空', '白虎', '太常', '玄武', '太阴', '天后',
];

// === Liu Chong (六冲) ===
// Each branch and its chong (clash) partner

export const LIUCHONG: Record<string, string> = {
  '子': '午', '丑': '未', '寅': '申', '卯': '酉',
  '辰': '戌', '巳': '亥', '午': '子', '未': '丑',
  '申': '寅', '酉': '卯', '戌': '辰', '亥': '巳',
};

// === San Xing (三刑) ===
// Used for fu-yin (伏吟) transmission extraction

export const SANXING: Record<string, string> = {
  '寅': '巳', '巳': '申', '申': '寅',  // 寅巳申 无恩之刑
  '丑': '戌', '戌': '未', '未': '丑',  // 丑戌未 恃势之刑
  '子': '卯', '卯': '子',              // 子卯 无礼之刑
  '辰': '辰', '午': '午', '酉': '酉', '亥': '亥', // 自刑
};

// === Yi Ma (驿马) ===
// Used for fan-yin (返吟) transmission extraction
// Day branch → yi-ma branch

export function getYiMa(dayBranch: string): string {
  // 申子辰→寅, 寅午戌→申, 亥卯未→巳, 巳酉丑→亥
  if (['申', '子', '辰'].includes(dayBranch)) return '寅';
  if (['寅', '午', '戌'].includes(dayBranch)) return '申';
  if (['亥', '卯', '未'].includes(dayBranch)) return '巳';
  if (['巳', '酉', '丑'].includes(dayBranch)) return '亥';
  return '寅'; // fallback
}

// === Zhongqi dates (中气 Solar term dates) ===
// We use the JieQi lookup from lunar-typescript, so no static table needed here.
// These are the 12 zhongqi names used for month jiang determination.

export const ZHONGQI_LIST = [
  '雨水', '春分', '谷雨', '小满', '夏至', '大暑',
  '处暑', '秋分', '霜降', '小雪', '冬至', '大寒',
] as const;
