/**
 * Business Cooperation Analysis (商业合作)
 *
 * Analyzes business partnership compatibility between two BaZi charts.
 * Same five dimensions as marriage analysis but with business-oriented
 * ten-god scoring (favoring wealth/authority gods over romantic ones).
 */

import type {
  BaZiResult,
  BusinessCompatibility,
  HeavenlyStem,
  WuXing,
} from '../types.js';
import { extractAnalysisContext } from './analysis.js';

// === Constants ===

const STEMS: HeavenlyStem[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

const STEM_WUXING: Record<string, WuXing> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
};

/** 天干五合 (Five Heavenly Stem Combinations) */
const TIAN_GAN_WU_HE: [HeavenlyStem, HeavenlyStem, WuXing][] = [
  ['甲', '己', '土'],
  ['乙', '庚', '金'],
  ['丙', '辛', '水'],
  ['丁', '壬', '木'],
  ['戊', '癸', '火'],
];

/** 六合 pairs */
const LIU_HE: Record<string, string> = {
  '子': '丑', '丑': '子', '寅': '亥', '亥': '寅',
  '卯': '戌', '戌': '卯', '辰': '酉', '酉': '辰',
  '巳': '申', '申': '巳', '午': '未', '未': '午',
};

/** 六冲 pairs */
const LIU_CHONG: Record<string, string> = {
  '子': '午', '午': '子', '丑': '未', '未': '丑',
  '寅': '申', '申': '寅', '卯': '酉', '酉': '卯',
  '辰': '戌', '戌': '辰', '巳': '亥', '亥': '巳',
};

/** 五行相生 X → GEN[X] */
const GEN: Record<WuXing, WuXing> = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
};

/** 五行相克 X → CTL[X] */
const CTL: Record<WuXing, WuXing> = {
  '木': '土', '火': '金', '土': '水', '金': '木', '水': '火',
};

/** NaYin last-character to WuXing mapping */
const NAYIN_WUXING: Record<string, WuXing> = {
  '金': '金', '木': '木', '水': '水', '火': '火', '土': '土',
};

// === Helpers ===

function deriveShiShen(dayMaster: HeavenlyStem, targetStem: HeavenlyStem): string {
  if (dayMaster === targetStem) return '比肩';

  const dayIdx = STEMS.indexOf(dayMaster);
  const targetIdx = STEMS.indexOf(targetStem);
  const samePolarity = dayIdx % 2 === targetIdx % 2;

  const dayElement = Math.floor(dayIdx / 2);
  const targetElement = Math.floor(targetIdx / 2);
  const relation = (targetElement - dayElement + 5) % 5;

  const NAMES: [string, string][] = [
    ['比肩', '劫财'],
    ['食神', '伤官'],
    ['偏财', '正财'],
    ['七杀', '正官'],
    ['偏印', '正印'],
  ];

  return NAMES[relation][samePolarity ? 0 : 1];
}

function getNaYinWuXing(nayin: string): WuXing {
  const lastChar = nayin.charAt(nayin.length - 1);
  return NAYIN_WUXING[lastChar] || '土';
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// === Dimension Analysis ===

function analyzeDayMasterRelation(
  p1Result: BaZiResult,
  p2Result: BaZiResult,
): BusinessCompatibility['dayMasterRelation'] {
  const person1Stem = p1Result.chart.dayMaster;
  const person2Stem = p2Result.chart.dayMaster;

  // Check 天干五合
  let combination: string | null = null;
  for (const [a, b, element] of TIAN_GAN_WU_HE) {
    if ((person1Stem === a && person2Stem === b) || (person1Stem === b && person2Stem === a)) {
      combination = `${a}${b}合化${element}`;
      break;
    }
  }

  const shiShenPerson1ToPerson2 = deriveShiShen(person1Stem, person2Stem);
  const shiShenPerson2ToPerson1 = deriveShiShen(person2Stem, person1Stem);

  let score = 60;

  // 天干五合 is a strong positive factor for partnership
  if (combination) score += 30;

  // Business-favorable ten-god relations
  const favorable = ['正财', '食神', '偏财', '正官'];
  const unfavorable = ['劫财', '伤官', '七杀'];

  if (favorable.includes(shiShenPerson1ToPerson2)) score += 12;
  if (unfavorable.includes(shiShenPerson1ToPerson2)) score -= 12;

  if (favorable.includes(shiShenPerson2ToPerson1)) score += 12;
  if (unfavorable.includes(shiShenPerson2ToPerson1)) score -= 12;

  // Same day master → 比肩, competing dynamic
  if (person1Stem === person2Stem) score -= 5;

  return {
    person1Stem,
    person2Stem,
    combination,
    shiShenPerson1ToPerson2,
    shiShenPerson2ToPerson1,
    score: clamp(score, 0, 100),
  };
}

function analyzeWuxingBalance(
  p1Result: BaZiResult,
  p2Result: BaZiResult,
): BusinessCompatibility['wuxingBalance'] {
  const p1Dist = p1Result.chart.wuxingDistribution;
  const p2Dist = p2Result.chart.wuxingDistribution;
  const elements: WuXing[] = ['木', '火', '土', '金', '水'];

  const complementary: WuXing[] = [];
  const conflicting: WuXing[] = [];

  let score = 60;

  for (const el of elements) {
    const p1Val = p1Dist[el];
    const p2Val = p2Dist[el];

    if ((p1Val >= 3 && p2Val <= 1) || (p2Val >= 3 && p1Val <= 1)) {
      complementary.push(el);
      score += 8;
    }

    if (p1Val >= 4 && p2Val >= 4) {
      conflicting.push(el);
      score -= 5;
    }
    if (p1Val === 0 && p2Val === 0) {
      conflicting.push(el);
      score -= 3;
    }
  }

  return {
    score: clamp(score, 0, 100),
    complementary,
    conflicting,
  };
}

function analyzeYongShenMatch(
  p1Result: BaZiResult,
  p2Result: BaZiResult,
): BusinessCompatibility['yongShenMatch'] {
  const p1Ctx = extractAnalysisContext(p1Result);
  const p2Ctx = extractAnalysisContext(p2Result);

  const p1Dist = p1Result.chart.wuxingDistribution;
  const p2Dist = p2Result.chart.wuxingDistribution;

  let score = 60;

  // Partner's yongShen is the other's strong element → very good
  if (p2Dist[p1Ctx.yongShen] >= 3) score += 15;
  if (p1Dist[p2Ctx.yongShen] >= 3) score += 15;

  // Partner's xiShen is the other's strong element → good
  if (p2Dist[p1Ctx.xiShen] >= 3) score += 8;
  if (p1Dist[p2Ctx.xiShen] >= 3) score += 8;

  // Partner's jiShen is the other's strong element → bad
  if (p2Dist[p1Ctx.jiShen] >= 4) score -= 10;
  if (p1Dist[p2Ctx.jiShen] >= 4) score -= 10;

  // YongShen compatibility
  if (p1Ctx.yongShen === p2Ctx.yongShen) score += 5;
  if (p1Ctx.yongShen === p2Ctx.jiShen) score -= 8;
  if (p2Ctx.yongShen === p1Ctx.jiShen) score -= 8;

  return {
    score: clamp(score, 0, 100),
    person1YongShen: p1Ctx.yongShen,
    person2YongShen: p2Ctx.yongShen,
    person1XiShen: p1Ctx.xiShen,
    person2XiShen: p2Ctx.xiShen,
  };
}

function analyzeBranchRelations(
  p1Result: BaZiResult,
  p2Result: BaZiResult,
): BusinessCompatibility['branchRelations'] {
  const p1Pillars = p1Result.chart.fourPillars;
  const p2Pillars = p2Result.chart.fourPillars;

  const p1Branches = [
    p1Pillars.year.stemBranch.branch,
    p1Pillars.month.stemBranch.branch,
    p1Pillars.day.stemBranch.branch,
    ...(p1Pillars.hour ? [p1Pillars.hour.stemBranch.branch] : []),
  ];

  const p2Branches = [
    p2Pillars.year.stemBranch.branch,
    p2Pillars.month.stemBranch.branch,
    p2Pillars.day.stemBranch.branch,
    ...(p2Pillars.hour ? [p2Pillars.hour.stemBranch.branch] : []),
  ];

  const liuHe: string[] = [];
  const liuChong: string[] = [];

  for (const b1 of p1Branches) {
    for (const b2 of p2Branches) {
      if (LIU_HE[b1] === b2) {
        liuHe.push(`${b1}${b2}合`);
      }
      if (LIU_CHONG[b1] === b2) {
        liuChong.push(`${b1}${b2}冲`);
      }
    }
  }

  const uniqueHe = [...new Set(liuHe)];
  const uniqueChong = [...new Set(liuChong)];

  let score = 60;
  score += uniqueHe.length * 10;
  score -= uniqueChong.length * 12;

  // Day branch harmony/clash is important for business partners too
  const p1DayBranch = p1Pillars.day.stemBranch.branch;
  const p2DayBranch = p2Pillars.day.stemBranch.branch;
  if (LIU_HE[p1DayBranch] === p2DayBranch) score += 10;
  if (LIU_CHONG[p1DayBranch] === p2DayBranch) score -= 10;

  return {
    score: clamp(score, 0, 100),
    liuHe: uniqueHe,
    liuChong: uniqueChong,
  };
}

function analyzeNayinMatch(
  p1Result: BaZiResult,
  p2Result: BaZiResult,
): BusinessCompatibility['nayinMatch'] {
  const person1NaYin = p1Result.chart.nayin.day;
  const person2NaYin = p2Result.chart.nayin.day;

  const p1El = getNaYinWuXing(person1NaYin);
  const p2El = getNaYinWuXing(person2NaYin);

  let relation: string;
  let score: number;

  if (p1El === p2El) {
    relation = '比和';
    score = 70;
  } else if (GEN[p1El] === p2El) {
    relation = `${p1El}生${p2El}`;
    score = 85;
  } else if (GEN[p2El] === p1El) {
    relation = `${p2El}生${p1El}`;
    score = 80;
  } else if (CTL[p1El] === p2El) {
    relation = `${p1El}克${p2El}`;
    score = 40;
  } else if (CTL[p2El] === p1El) {
    relation = `${p2El}克${p1El}`;
    score = 45;
  } else {
    relation = '平和';
    score = 60;
  }

  return {
    score: clamp(score, 0, 100),
    person1NaYin,
    person2NaYin,
    relation,
  };
}

// === Main Export ===

/**
 * Analyze business cooperation compatibility between two BaZi charts.
 *
 * Scoring weights:
 * - Day master combination: 25%
 * - Five element balance:   20%
 * - Useful god match:       25%
 * - Branch relations:       15%
 * - NaYin matching:         15%
 */
export function analyzeBusinessCooperation(
  person1Result: BaZiResult,
  person2Result: BaZiResult,
): BusinessCompatibility {
  const dayMasterRelation = analyzeDayMasterRelation(person1Result, person2Result);
  const wuxingBalance = analyzeWuxingBalance(person1Result, person2Result);
  const yongShenMatch = analyzeYongShenMatch(person1Result, person2Result);
  const branchRelations = analyzeBranchRelations(person1Result, person2Result);
  const nayinMatch = analyzeNayinMatch(person1Result, person2Result);

  const overallScore = Math.round(
    dayMasterRelation.score * 0.25 +
    wuxingBalance.score * 0.20 +
    yongShenMatch.score * 0.25 +
    branchRelations.score * 0.15 +
    nayinMatch.score * 0.15,
  );

  return {
    overallScore: clamp(overallScore, 0, 100),
    dayMasterRelation,
    wuxingBalance,
    yongShenMatch,
    branchRelations,
    nayinMatch,
  };
}
