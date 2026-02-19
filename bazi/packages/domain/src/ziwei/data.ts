/**
 * Zi Wei Dou Shu (紫微斗数) Data Tables
 *
 * All static lookup tables for the Purple Star Astrology calculation.
 * Sources: Traditional 紫微斗数全书 reference tables.
 */

import type { ZiweiMainStar, ZiweiAuxStar, StarBrightness, SiHuaStar } from '../types.js';

// === Constants ===

export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

/** Palace names in fixed order starting from 命宫, going counterclockwise */
export const PALACE_NAMES = [
  '命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫',
  '迁移宫', '交友宫', '官禄宫', '田宅宫', '福德宫', '父母宫',
] as const;

// === 紫微安星表 (Zi Wei Star Position Table) ===
// Key: lunar day (1-30), Value: array indexed by [juNumber/2 - 1] where juNumber is 2,3,4,5,6
// Value is branch index (0=子, 1=丑, ... 11=亥) where 紫微 lands

export const ZIWEI_POSITION_TABLE: Record<number, number[]> = {
  // [水二局, 木三局, 金四局, 土五局, 火六局]
  1:  [1,  2,  3,  4,  5],
  2:  [2,  2,  3,  4,  5],
  3:  [2,  3,  4,  4,  5],
  4:  [3,  3,  4,  5,  6],
  5:  [3,  4,  4,  5,  6],
  6:  [4,  4,  5,  5,  6],
  7:  [4,  4,  5,  6,  7],
  8:  [4,  5,  5,  6,  7],
  9:  [5,  5,  6,  6,  7],
  10: [5,  5,  6,  7,  8],
  11: [5,  6,  6,  7,  8],
  12: [6,  6,  7,  7,  8],
  13: [6,  7,  7,  7,  8],
  14: [7,  7,  7,  8,  9],
  15: [7,  7,  8,  8,  9],
  16: [7,  8,  8,  9,  9],
  17: [8,  8,  8,  9, 10],
  18: [8,  8,  9,  9, 10],
  19: [8,  9,  9, 10, 10],
  20: [9,  9,  9, 10, 11],
  21: [9,  9, 10, 10, 11],
  22: [9, 10, 10, 11, 11],
  23: [10, 10, 11, 11, 11],
  24: [10, 11, 11, 11,  0],
  25: [11, 11, 11,  0,  0],
  26: [11, 11,  0,  0,  1],
  27: [11,  0,  0,  1,  1],
  28: [0,  0,  1,  1,  1],
  29: [0,  1,  1,  1,  2],
  30: [1,  1,  1,  2,  2],
};

// === 紫微星系偏移 (Zi Wei Star Series Offsets) ===
// From 紫微's position, count backwards (逆行) to find each star
// Offset is number of positions to go backwards (counterclockwise)

export const ZIWEI_SERIES_OFFSETS: { star: ZiweiMainStar; offset: number }[] = [
  { star: '天机', offset: 1 },
  { star: '太阳', offset: 3 },
  { star: '武曲', offset: 4 },
  { star: '天同', offset: 5 },
  { star: '廉贞', offset: 8 },
];

// === 天府对照表 (Tian Fu Mirror from Zi Wei) ===
// Given 紫微 at branch index, 天府 is at this branch index

export const TIANFU_FROM_ZIWEI: Record<number, number> = {
  0: 4,   // 子 → 辰
  1: 3,   // 丑 → 卯
  2: 2,   // 寅 → 寅
  3: 1,   // 卯 → 丑
  4: 0,   // 辰 → 子
  5: 11,  // 巳 → 亥
  6: 10,  // 午 → 戌
  7: 9,   // 未 → 酉
  8: 8,   // 申 → 申
  9: 7,   // 酉 → 未
  10: 6,  // 戌 → 午
  11: 5,  // 亥 → 巳
};

// === 天府星系偏移 (Tian Fu Star Series Offsets) ===
// From 天府's position, count forwards (顺行) to find each star

export const TIANFU_SERIES_OFFSETS: { star: ZiweiMainStar; offset: number }[] = [
  { star: '太阴', offset: 1 },
  { star: '贪狼', offset: 2 },
  { star: '巨门', offset: 3 },
  { star: '天相', offset: 4 },
  { star: '天梁', offset: 5 },
  { star: '七杀', offset: 6 },
  { star: '破军', offset: 10 },
];

// === 星曜亮度表 (Star Brightness Table) ===
// starName → array of 12 brightness values indexed by branch (0=子...11=亥)
// 庙=most bright, 旺, 得, 利, 平, 不, 陷=weakest

export const STAR_BRIGHTNESS_TABLE: Record<ZiweiMainStar, (StarBrightness | null)[]> = {
  //              子     丑     寅     卯     辰     巳     午     未     申     酉     戌     亥
  '紫微': ['旺', '庙', '得', '利', '庙', '得', '庙', '庙', '得', '利', '庙', '得'],
  '天机': ['得', '庙', '利', '庙', '平', '利', '不', '庙', '利', '庙', '平', '利'],
  '太阳': ['陷', '不', '旺', '庙', '庙', '庙', '庙', '得', '利', '平', '陷', '陷'],
  '武曲': ['庙', '庙', '利', '陷', '旺', '得', '利', '庙', '利', '庙', '旺', '得'],
  '天同': ['庙', '不', '利', '平', '陷', '庙', '平', '不', '利', '平', '陷', '庙'],
  '廉贞': ['平', '庙', '庙', '利', '陷', '利', '陷', '庙', '庙', '利', '陷', '利'],
  '天府': ['庙', '庙', '得', '庙', '得', '庙', '旺', '得', '庙', '得', '庙', '旺'],
  '太阴': ['庙', '庙', '陷', '陷', '得', '利', '不', '陷', '平', '得', '庙', '庙'],
  '贪狼': ['旺', '庙', '庙', '庙', '利', '平', '旺', '庙', '庙', '庙', '利', '平'],
  '巨门': ['庙', '不', '庙', '旺', '利', '平', '庙', '不', '庙', '旺', '利', '平'],
  '天相': ['得', '庙', '庙', '得', '平', '利', '得', '庙', '庙', '得', '平', '利'],
  '天梁': ['庙', '庙', '庙', '旺', '得', '利', '庙', '庙', '陷', '得', '得', '得'],
  '七杀': ['庙', '旺', '庙', '得', '平', '利', '庙', '旺', '庙', '得', '平', '利'],
  '破军': ['旺', '得', '庙', '陷', '平', '庙', '旺', '得', '庙', '陷', '平', '庙'],
};

// === 四化表 (Si Hua / Four Transformations Table) ===
// Indexed by heavenly stem → [化禄, 化权, 化科, 化忌]

export const SI_HUA_TABLE: Record<string, [ZiweiMainStar, ZiweiMainStar, ZiweiMainStar, ZiweiMainStar]> = {
  '甲': ['廉贞', '破军', '武曲', '太阳'],
  '乙': ['天机', '天梁', '紫微', '太阴'],
  '丙': ['天同', '天机', '天梁', '廉贞'],
  '丁': ['太阴', '天同', '天机', '巨门'],
  '戊': ['贪狼', '太阴', '天府', '天机'],  // 注：戊 化科有争议，此处用天府(中州派)
  '己': ['武曲', '贪狼', '天梁', '天同'],  // 注：己 化科有争议，此处用天梁
  '庚': ['太阳', '武曲', '太阴', '天同'],
  '辛': ['巨门', '太阳', '天梁', '天机'],  // 注：辛 化科有争议，此处用天梁(中州派)
  '壬': ['天梁', '紫微', '天府', '武曲'],  // 注：壬 化科有争议，此处用天府(中州派)
  '癸': ['破军', '巨门', '太阴', '贪狼'],
};

export const SI_HUA_NAMES: SiHuaStar[] = ['化禄', '化权', '化科', '化忌'];

// === 辅星安置规则 (Auxiliary Star Placement Rules) ===

// 文昌 (Wen Chang): From 辰(4), count backwards by hour branch index
// hourBranchIndex: 0=子, 1=丑, 2=寅, ... 11=亥
export function getWenChangPosition(hourBranchIndex: number): number {
  return (4 - hourBranchIndex + 12) % 12;
}

// 文曲 (Wen Qu): From 辰(4), count forwards by hour branch index
export function getWenQuPosition(hourBranchIndex: number): number {
  return (4 + hourBranchIndex) % 12;
}

// 左辅 (Zuo Fu): From 辰(4), count forwards by lunar month
export function getZuoFuPosition(lunarMonth: number): number {
  return (4 + lunarMonth - 1) % 12;
}

// 右弼 (You Bi): From 戌(10), count backwards by lunar month
export function getYouBiPosition(lunarMonth: number): number {
  return (10 - lunarMonth + 1 + 12) % 12;
}

// 天魁/天钺 (Tian Kui / Tian Yue): Based on year stem
export const TIANKUI_TABLE: Record<string, number> = {
  '甲': 1,  // 丑
  '戊': 1,
  '庚': 1,
  '乙': 0,  // 子
  '己': 0,
  '丙': 11, // 亥
  '丁': 9,  // 酉
  '壬': 3,  // 卯
  '癸': 3,
  '辛': 6,  // 午
};

export const TIANYUE_TABLE: Record<string, number> = {
  '甲': 7,  // 未
  '戊': 7,
  '庚': 7,
  '乙': 8,  // 申
  '己': 8,
  '丙': 3,  // 卯
  '丁': 5,  // 巳
  '壬': 5,
  '癸': 5,
  '辛': 2,  // 寅
};

// 禄存 (Lu Cun): Based on year stem
export const LUCUN_TABLE: Record<string, number> = {
  '甲': 2,  // 寅
  '乙': 3,  // 卯
  '丙': 5,  // 巳
  '丁': 6,  // 午
  '戊': 5,  // 巳
  '己': 6,  // 午
  '庚': 8,  // 申
  '辛': 9,  // 酉
  '壬': 11, // 亥
  '癸': 0,  // 子
};

// 擎羊 = 禄存 + 1, 陀罗 = 禄存 - 1
export function getQingYangPosition(lucunPos: number): number {
  return (lucunPos + 1) % 12;
}
export function getTuoLuoPosition(lucunPos: number): number {
  return (lucunPos - 1 + 12) % 12;
}

// 火星 (Huo Xing): Based on year branch + hour branch
// yearBranch group: 寅午戌=0, 申子辰=1, 巳酉丑=2, 亥卯未=3
// Starting position for each group, then count forward by hour branch
const HUOXING_BASE: Record<number, number> = {
  0: 1,  // 寅午戌 → from 丑
  1: 2,  // 申子辰 → from 寅
  2: 3,  // 巳酉丑 → from 卯
  3: 9,  // 亥卯未 → from 酉
};

function getYearBranchGroup(yearBranchIndex: number): number {
  // 寅(2)午(6)戌(10) → 0
  if ([2, 6, 10].includes(yearBranchIndex)) return 0;
  // 申(8)子(0)辰(4) → 1
  if ([8, 0, 4].includes(yearBranchIndex)) return 1;
  // 巳(5)酉(9)丑(1) → 2
  if ([5, 9, 1].includes(yearBranchIndex)) return 2;
  // 亥(11)卯(3)未(7) → 3
  return 3;
}

export function getHuoXingPosition(yearBranchIndex: number, hourBranchIndex: number): number {
  const group = getYearBranchGroup(yearBranchIndex);
  return (HUOXING_BASE[group] + hourBranchIndex) % 12;
}

// 铃星 (Ling Xing): Similar to 火星 but different base positions
const LINGXING_BASE: Record<number, number> = {
  0: 3,  // 寅午戌 → from 卯
  1: 10, // 申子辰 → from 戌
  2: 10, // 巳酉丑 → from 戌
  3: 10, // 亥卯未 → from 戌
};

export function getLingXingPosition(yearBranchIndex: number, hourBranchIndex: number): number {
  const group = getYearBranchGroup(yearBranchIndex);
  return (LINGXING_BASE[group] + hourBranchIndex) % 12;
}

// 天马 (Tian Ma): Based on year branch
export const TIANMA_TABLE: Record<number, number> = {
  0: 2,  // 子 → 寅
  1: 11, // 丑 → 亥
  2: 8,  // 寅 → 申
  3: 5,  // 卯 → 巳
  4: 2,  // 辰 → 寅
  5: 11, // 巳 → 亥
  6: 8,  // 午 → 申
  7: 5,  // 未 → 巳
  8: 2,  // 申 → 寅
  9: 11, // 酉 → 亥
  10: 8, // 戌 → 申
  11: 5, // 亥 → 巳
};

// 地空 (Di Kong): From 亥(11), count forwards by hour branch
export function getDiKongPosition(hourBranchIndex: number): number {
  return (11 - hourBranchIndex + 12) % 12;
}

// 地劫 (Di Jie): From 亥(11), count backwards by hour branch
export function getDiJiePosition(hourBranchIndex: number): number {
  return (11 + hourBranchIndex) % 12;
}

// === 五虎遁月表 (Wu Hu Dun Month Stem Table) ===
// Given year stem, the stem of the first month (寅月)
// Then each subsequent month increments the stem

export const MONTH_STEM_START: Record<string, number> = {
  '甲': 2, // 丙寅
  '己': 2,
  '乙': 4, // 戊寅
  '庚': 4,
  '丙': 6, // 庚寅
  '辛': 6,
  '丁': 8, // 壬寅
  '壬': 8,
  '戊': 0, // 甲寅
  '癸': 0,
};

// === 纳音五行局 (Na Yin Five Element Bureau) ===
// Based on the Na Yin of the stem+branch of the Ming Palace
// The 60 Jia Zi Na Yin lookup

export const NAYIN_TABLE: Record<string, string> = {
  '甲子': '海中金', '乙丑': '海中金',
  '丙寅': '炉中火', '丁卯': '炉中火',
  '戊辰': '大林木', '己巳': '大林木',
  '庚午': '路旁土', '辛未': '路旁土',
  '壬申': '剑锋金', '癸酉': '剑锋金',
  '甲戌': '山头火', '乙亥': '山头火',
  '丙子': '涧下水', '丁丑': '涧下水',
  '戊寅': '城头土', '己卯': '城头土',
  '庚辰': '白蜡金', '辛巳': '白蜡金',
  '壬午': '杨柳木', '癸未': '杨柳木',
  '甲申': '泉中水', '乙酉': '泉中水',
  '丙戌': '屋上土', '丁亥': '屋上土',
  '戊子': '霹雳火', '己丑': '霹雳火',
  '庚寅': '松柏木', '辛卯': '松柏木',
  '壬辰': '长流水', '癸巳': '长流水',
  '甲午': '砂石金', '乙未': '砂石金',
  '丙申': '山下火', '丁酉': '山下火',
  '戊戌': '平地木', '己亥': '平地木',
  '庚子': '壁上土', '辛丑': '壁上土',
  '壬寅': '金箔金', '癸卯': '金箔金',
  '甲辰': '覆灯火', '乙巳': '覆灯火',
  '丙午': '天河水', '丁未': '天河水',
  '戊申': '大驿土', '己酉': '大驿土',
  '庚戌': '钗钏金', '辛亥': '钗钏金',
  '壬子': '桑柘木', '癸丑': '桑柘木',
  '甲寅': '大溪水', '乙卯': '大溪水',
  '丙辰': '沙中土', '丁巳': '沙中土',
  '戊午': '天上火', '己未': '天上火',
  '庚申': '石榴木', '辛酉': '石榴木',
  '壬戌': '大海水', '癸亥': '大海水',
};

// Na Yin element → Wu Xing Ju number
export const NAYIN_TO_JU: Record<string, { name: string; number: number }> = {
  '水': { name: '水二局', number: 2 },
  '木': { name: '木三局', number: 3 },
  '金': { name: '金四局', number: 4 },
  '土': { name: '土五局', number: 5 },
  '火': { name: '火六局', number: 6 },
};

// Extract the WuXing element from a Na Yin name
export function getNaYinElement(nayin: string): string {
  // Last character of Na Yin is the element: 金木水火土
  return nayin[nayin.length - 1];
}

// === 命主星 / 身主星 (Ming Zhu / Shen Zhu Stars) ===
// Based on year branch

export const MING_ZHU_TABLE: Record<number, ZiweiMainStar> = {
  0: '贪狼',  // 子
  1: '巨门',  // 丑
  2: '禄存' as ZiweiMainStar, // 寅 — technically 禄存 is auxiliary, but traditionally listed here
  3: '文曲' as ZiweiMainStar, // 卯
  4: '廉贞',  // 辰
  5: '武曲',  // 巳
  6: '破军',  // 午
  7: '武曲',  // 未
  8: '廉贞',  // 申
  9: '文曲' as ZiweiMainStar, // 酉
  10: '禄存' as ZiweiMainStar, // 戌
  11: '巨门', // 亥
};

export const SHEN_ZHU_TABLE: Record<number, ZiweiMainStar> = {
  0: '天同',  // 子 — 铃星 in some schools, using 天同 here
  1: '天相',  // 丑
  2: '天梁',  // 寅
  3: '天同',  // 卯
  4: '天机',  // 辰 — 文昌 in some schools
  5: '天梁',  // 巳
  6: '天同',  // 午 — 火星 in some schools
  7: '天相',  // 未
  8: '天梁',  // 申
  9: '天同',  // 酉 — 文曲 in some schools
  10: '天机', // 戌
  11: '天梁', // 亥
};
