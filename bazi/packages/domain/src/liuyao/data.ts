/**
 * Liu Yao Na Jia (六爻纳甲) — Data Tables
 *
 * All static lookup tables for the Six Lines divination system
 * with Na Jia (纳甲) stem/branch assignment.
 */

import type { TrigramName, WuXing, SixRelation, SixSpirit } from '../types.js';

// === Branch / Element mappings ===

export const BRANCH_LIST = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

export const BRANCH_ELEMENT: Record<string, WuXing> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

export const STEM_LIST = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;

// === Five Element Relations (for 六亲) ===
// palace element vs line element → SixRelation

const WUXING_SHENG: Record<WuXing, WuXing> = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
};

export function getSixRelation(palaceElement: WuXing, lineElement: WuXing): SixRelation {
  if (palaceElement === lineElement) return '兄弟';
  if (WUXING_SHENG[palaceElement] === lineElement) return '子孙';
  if (WUXING_SHENG[lineElement] === palaceElement) return '父母';
  // Check 克 relationship
  if (WUXING_SHENG[WUXING_SHENG[palaceElement]] === lineElement) return '妻财';
  return '官鬼';
}

// === Trigram element lookup ===

export const TRIGRAM_ELEMENT: Record<TrigramName, WuXing> = {
  '乾': '金', '兑': '金', '离': '火', '震': '木',
  '巽': '木', '坎': '水', '艮': '土', '坤': '土',
};

// === Na Jia Stems (纳甲天干) ===
// 乾纳甲壬, 坤纳乙癸, 震纳庚, 巽纳辛, 坎纳戊, 离纳己, 艮纳丙, 兑纳丁

export const NAJIA_STEMS: Record<TrigramName, { inner: string; outer: string }> = {
  '乾': { inner: '甲', outer: '壬' },
  '坤': { inner: '乙', outer: '癸' },
  '震': { inner: '庚', outer: '庚' },
  '巽': { inner: '辛', outer: '辛' },
  '坎': { inner: '戊', outer: '戊' },
  '离': { inner: '己', outer: '己' },
  '艮': { inner: '丙', outer: '丙' },
  '兑': { inner: '丁', outer: '丁' },
};

// === Na Jia Branches (纳甲地支) ===
// Inner (下卦/内卦): lines 1-3, Outer (上卦/外卦): lines 4-6
// Yang trigrams (乾震坎艮): branches go forward (隔一位)
// Yin trigrams (坤巽离兑): branches go backward (隔一位)

export const NAJIA_INNER: Record<TrigramName, [string, string, string]> = {
  '乾': ['子', '寅', '辰'],   // 甲子 甲寅 甲辰
  '坤': ['未', '巳', '卯'],   // 乙未 乙巳 乙卯
  '震': ['子', '寅', '辰'],   // 庚子 庚寅 庚辰
  '巽': ['丑', '亥', '酉'],   // 辛丑 辛亥 辛酉
  '坎': ['寅', '辰', '午'],   // 戊寅 戊辰 戊午
  '离': ['卯', '丑', '亥'],   // 己卯 己丑 己亥
  '艮': ['辰', '午', '申'],   // 丙辰 丙午 丙申
  '兑': ['巳', '卯', '丑'],   // 丁巳 丁卯 丁丑
};

export const NAJIA_OUTER: Record<TrigramName, [string, string, string]> = {
  '乾': ['午', '申', '戌'],   // 壬午 壬申 壬戌
  '坤': ['丑', '亥', '酉'],   // 癸丑 癸亥 癸酉
  '震': ['午', '申', '戌'],   // 庚午 庚申 庚戌
  '巽': ['未', '巳', '卯'],   // 辛未 辛巳 辛卯
  '坎': ['申', '戌', '子'],   // 戊申 戊戌 戊子
  '离': ['酉', '未', '巳'],   // 己酉 己未 己巳
  '艮': ['戌', '子', '寅'],   // 丙戌 丙子 丙寅
  '兑': ['亥', '酉', '未'],   // 丁亥 丁酉 丁未
};

// === Eight Palace 64 Hexagram Table (八宫六十四卦) ===

export interface HexagramPalaceInfo {
  palace: TrigramName;
  palaceElement: WuXing;
  shi: number;   // 世爻 1-6
  ying: number;  // 应爻 1-6
}

// Key format: "${upperTrigram}_${lowerTrigram}"
export const HEXAGRAM_PALACE_MAP: Record<string, HexagramPalaceInfo> = (() => {
  const map: Record<string, HexagramPalaceInfo> = {};
  const E = TRIGRAM_ELEMENT;

  // [palace, upper, lower, shi, ying]
  // 8 hexagrams per palace: 本宫, 一世, 二世, 三世, 四世, 五世, 游魂, 归魂
  const t: [TrigramName, TrigramName, TrigramName, number, number][] = [
    // 乾宫 (金): 乾为天→天风姤→天山遁→天地否→风地观→山地剥→火地晋→火天大有
    ['乾', '乾', '乾', 6, 3], ['乾', '乾', '巽', 1, 4], ['乾', '乾', '艮', 2, 5], ['乾', '乾', '坤', 3, 6],
    ['乾', '巽', '坤', 4, 1], ['乾', '艮', '坤', 5, 2], ['乾', '离', '坤', 4, 1], ['乾', '离', '乾', 3, 6],

    // 兑宫 (金): 兑为泽→泽水困→泽地萃→泽山咸→水山蹇→地山谦→雷山小过→雷泽归妹
    ['兑', '兑', '兑', 6, 3], ['兑', '兑', '坎', 1, 4], ['兑', '兑', '坤', 2, 5], ['兑', '兑', '艮', 3, 6],
    ['兑', '坎', '艮', 4, 1], ['兑', '坤', '艮', 5, 2], ['兑', '震', '艮', 4, 1], ['兑', '震', '兑', 3, 6],

    // 离宫 (火): 离为火→火山旅→火风鼎→火水未济→山水蒙→风水涣→天水讼→天火同人
    ['离', '离', '离', 6, 3], ['离', '离', '艮', 1, 4], ['离', '离', '巽', 2, 5], ['离', '离', '坎', 3, 6],
    ['离', '艮', '坎', 4, 1], ['离', '巽', '坎', 5, 2], ['离', '乾', '坎', 4, 1], ['离', '乾', '离', 3, 6],

    // 震宫 (木): 震为雷→雷地豫→雷水解→雷风恒→地风升→水风井→泽风大过→泽雷随
    ['震', '震', '震', 6, 3], ['震', '震', '坤', 1, 4], ['震', '震', '坎', 2, 5], ['震', '震', '巽', 3, 6],
    ['震', '坤', '巽', 4, 1], ['震', '坎', '巽', 5, 2], ['震', '兑', '巽', 4, 1], ['震', '兑', '震', 3, 6],

    // 巽宫 (木): 巽为风→风天小畜→风火家人→风雷益→天雷无妄→火雷噬嗑→山雷颐→山风蛊
    ['巽', '巽', '巽', 6, 3], ['巽', '巽', '乾', 1, 4], ['巽', '巽', '离', 2, 5], ['巽', '巽', '震', 3, 6],
    ['巽', '乾', '震', 4, 1], ['巽', '离', '震', 5, 2], ['巽', '艮', '震', 4, 1], ['巽', '艮', '巽', 3, 6],

    // 坎宫 (水): 坎为水→水泽节→水雷屯→水火既济→泽火革→雷火丰→地火明夷→地水师
    ['坎', '坎', '坎', 6, 3], ['坎', '坎', '兑', 1, 4], ['坎', '坎', '震', 2, 5], ['坎', '坎', '离', 3, 6],
    ['坎', '兑', '离', 4, 1], ['坎', '震', '离', 5, 2], ['坎', '坤', '离', 4, 1], ['坎', '坤', '坎', 3, 6],

    // 艮宫 (土): 艮为山→山火贲→山天大畜→山泽损→火泽睽→天泽履→风泽中孚→风山渐
    ['艮', '艮', '艮', 6, 3], ['艮', '艮', '离', 1, 4], ['艮', '艮', '乾', 2, 5], ['艮', '艮', '兑', 3, 6],
    ['艮', '离', '兑', 4, 1], ['艮', '乾', '兑', 5, 2], ['艮', '巽', '兑', 4, 1], ['艮', '巽', '艮', 3, 6],

    // 坤宫 (土): 坤为地→地雷复→地泽临→地天泰→雷天大壮→泽天夬→水天需→水地比
    ['坤', '坤', '坤', 6, 3], ['坤', '坤', '震', 1, 4], ['坤', '坤', '兑', 2, 5], ['坤', '坤', '乾', 3, 6],
    ['坤', '震', '乾', 4, 1], ['坤', '兑', '乾', 5, 2], ['坤', '坎', '乾', 4, 1], ['坤', '坎', '坤', 3, 6],
  ];

  for (const [palace, upper, lower, shi, ying] of t) {
    map[`${upper}_${lower}`] = { palace, palaceElement: E[palace], shi, ying };
  }
  return map;
})();

// Also store the 本宫卦 (pure hexagram) for each palace — needed for 飞伏神
export const PALACE_PURE_HEX: Record<TrigramName, { upper: TrigramName; lower: TrigramName }> = {
  '乾': { upper: '乾', lower: '乾' },
  '兑': { upper: '兑', lower: '兑' },
  '离': { upper: '离', lower: '离' },
  '震': { upper: '震', lower: '震' },
  '巽': { upper: '巽', lower: '巽' },
  '坎': { upper: '坎', lower: '坎' },
  '艮': { upper: '艮', lower: '艮' },
  '坤': { upper: '坤', lower: '坤' },
};

// === Six Spirits (六神) ===

export const SIX_SPIRITS_ORDER: SixSpirit[] = ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武'];

// Starting spirit index based on day stem
export const SPIRIT_START: Record<string, number> = {
  '甲': 0, '乙': 0,  // 青龙起
  '丙': 1, '丁': 1,  // 朱雀起
  '戊': 2,           // 勾陈起
  '己': 3,           // 螣蛇起
  '庚': 4, '辛': 4,  // 白虎起
  '壬': 5, '癸': 5,  // 玄武起
};
