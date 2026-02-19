/**
 * Marriage Compatibility Analysis (八字合婚)
 *
 * Analyzes the compatibility between two BaZi charts based on
 * traditional principles: day master combination, five element balance,
 * useful god coordination, branch relations, and nayin matching.
 */

import type {
  BaZiResult,
  MarriageCompatibility,
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
  maleResult: BaZiResult,
  femaleResult: BaZiResult,
): MarriageCompatibility['dayMasterRelation'] {
  const maleStem = maleResult.chart.dayMaster;
  const femaleStem = femaleResult.chart.dayMaster;

  // Check 天干五合
  let combination: string | null = null;
  for (const [a, b, element] of TIAN_GAN_WU_HE) {
    if ((maleStem === a && femaleStem === b) || (maleStem === b && femaleStem === a)) {
      combination = `${a}${b}合化${element}`;
      break;
    }
  }

  const shiShenMaleToFemale = deriveShiShen(maleStem, femaleStem);
  const shiShenFemaleToMale = deriveShiShen(femaleStem, maleStem);

  let score = 60;

  // 天干五合 is the strongest positive factor
  if (combination) score += 30;

  // Favorable ten-god relations for marriage
  const favorableForMale = ['正财', '偏财', '正官', '正印'];
  const unfavorableForMale = ['七杀', '劫财', '伤官'];

  if (favorableForMale.includes(shiShenMaleToFemale)) score += 10;
  if (unfavorableForMale.includes(shiShenMaleToFemale)) score -= 10;

  const favorableForFemale = ['正官', '正财', '正印', '食神'];
  const unfavorableForFemale = ['七杀', '劫财', '伤官'];

  if (favorableForFemale.includes(shiShenFemaleToMale)) score += 10;
  if (unfavorableForFemale.includes(shiShenFemaleToMale)) score -= 10;

  // Same day master → 比肩, slightly unfavorable
  if (maleStem === femaleStem) score -= 5;

  return {
    maleStem,
    femaleStem,
    combination,
    shiShenMaleToFemale,
    shiShenFemaleToMale,
    score: clamp(score, 0, 100),
  };
}

function analyzeWuxingBalance(
  maleResult: BaZiResult,
  femaleResult: BaZiResult,
): MarriageCompatibility['wuxingBalance'] {
  const maleDist = maleResult.chart.wuxingDistribution;
  const femaleDist = femaleResult.chart.wuxingDistribution;
  const elements: WuXing[] = ['木', '火', '土', '金', '水'];

  const complementary: WuXing[] = [];
  const conflicting: WuXing[] = [];

  let score = 60;

  for (const el of elements) {
    const maleVal = maleDist[el];
    const femaleVal = femaleDist[el];

    // Complementary: one strong (>=3) and the other weak (<=1)
    if ((maleVal >= 3 && femaleVal <= 1) || (femaleVal >= 3 && maleVal <= 1)) {
      complementary.push(el);
      score += 8;
    }

    // Conflicting: both very strong (>=4) or both zero
    if (maleVal >= 4 && femaleVal >= 4) {
      conflicting.push(el);
      score -= 5;
    }
    if (maleVal === 0 && femaleVal === 0) {
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
  maleResult: BaZiResult,
  femaleResult: BaZiResult,
): MarriageCompatibility['yongShenMatch'] {
  const maleCtx = extractAnalysisContext(maleResult);
  const femaleCtx = extractAnalysisContext(femaleResult);

  const maleDist = maleResult.chart.wuxingDistribution;
  const femaleDist = femaleResult.chart.wuxingDistribution;

  let score = 60;

  // Male's yongShen is female's strong element → very good
  if (femaleDist[maleCtx.yongShen] >= 3) score += 15;
  if (maleDist[femaleCtx.yongShen] >= 3) score += 15;

  // Male's xiShen is female's strong element → good
  if (femaleDist[maleCtx.xiShen] >= 3) score += 8;
  if (maleDist[femaleCtx.xiShen] >= 3) score += 8;

  // Male's jiShen is female's strong element → bad
  if (femaleDist[maleCtx.jiShen] >= 4) score -= 10;
  if (maleDist[femaleCtx.jiShen] >= 4) score -= 10;

  // YongShen compatibility
  if (maleCtx.yongShen === femaleCtx.yongShen) score += 5;
  if (maleCtx.yongShen === femaleCtx.jiShen) score -= 8;
  if (femaleCtx.yongShen === maleCtx.jiShen) score -= 8;

  return {
    score: clamp(score, 0, 100),
    maleYongShen: maleCtx.yongShen,
    femaleYongShen: femaleCtx.yongShen,
    maleXiShen: maleCtx.xiShen,
    femaleXiShen: femaleCtx.xiShen,
  };
}

function analyzeBranchRelations(
  maleResult: BaZiResult,
  femaleResult: BaZiResult,
): MarriageCompatibility['branchRelations'] {
  const malePillars = maleResult.chart.fourPillars;
  const femalePillars = femaleResult.chart.fourPillars;

  const maleBranches = [
    malePillars.year.stemBranch.branch,
    malePillars.month.stemBranch.branch,
    malePillars.day.stemBranch.branch,
    ...(malePillars.hour ? [malePillars.hour.stemBranch.branch] : []),
  ];

  const femaleBranches = [
    femalePillars.year.stemBranch.branch,
    femalePillars.month.stemBranch.branch,
    femalePillars.day.stemBranch.branch,
    ...(femalePillars.hour ? [femalePillars.hour.stemBranch.branch] : []),
  ];

  const liuHe: string[] = [];
  const liuChong: string[] = [];

  for (const mb of maleBranches) {
    for (const fb of femaleBranches) {
      if (LIU_HE[mb] === fb) {
        liuHe.push(`${mb}${fb}合`);
      }
      if (LIU_CHONG[mb] === fb) {
        liuChong.push(`${mb}${fb}冲`);
      }
    }
  }

  const uniqueHe = [...new Set(liuHe)];
  const uniqueChong = [...new Set(liuChong)];

  let score = 60;
  score += uniqueHe.length * 10;
  score -= uniqueChong.length * 12;

  // Day branch is most important for marriage
  const maleDayBranch = malePillars.day.stemBranch.branch;
  const femaleDayBranch = femalePillars.day.stemBranch.branch;
  if (LIU_HE[maleDayBranch] === femaleDayBranch) score += 10;
  if (LIU_CHONG[maleDayBranch] === femaleDayBranch) score -= 10;

  return {
    score: clamp(score, 0, 100),
    liuHe: uniqueHe,
    liuChong: uniqueChong,
  };
}

function analyzeNayinMatch(
  maleResult: BaZiResult,
  femaleResult: BaZiResult,
): MarriageCompatibility['nayinMatch'] {
  const maleNaYin = maleResult.chart.nayin.day;
  const femaleNaYin = femaleResult.chart.nayin.day;

  const maleEl = getNaYinWuXing(maleNaYin);
  const femaleEl = getNaYinWuXing(femaleNaYin);

  let relation: string;
  let score: number;

  if (maleEl === femaleEl) {
    relation = '比和';
    score = 70;
  } else if (GEN[maleEl] === femaleEl) {
    relation = `${maleEl}生${femaleEl}`;
    score = 85;
  } else if (GEN[femaleEl] === maleEl) {
    relation = `${femaleEl}生${maleEl}`;
    score = 80;
  } else if (CTL[maleEl] === femaleEl) {
    relation = `${maleEl}克${femaleEl}`;
    score = 40;
  } else if (CTL[femaleEl] === maleEl) {
    relation = `${femaleEl}克${maleEl}`;
    score = 45;
  } else {
    relation = '平和';
    score = 60;
  }

  return {
    score: clamp(score, 0, 100),
    maleNaYin,
    femaleNaYin,
    relation,
  };
}

// === Main Export ===

/**
 * Analyze marriage compatibility between two BaZi charts.
 *
 * Scoring weights:
 * - Day master combination: 25%
 * - Five element balance:   20%
 * - Useful god match:       25%
 * - Branch relations:       15%
 * - NaYin matching:         15%
 */
export function analyzeMarriage(
  maleResult: BaZiResult,
  femaleResult: BaZiResult,
): MarriageCompatibility {
  const dayMasterRelation = analyzeDayMasterRelation(maleResult, femaleResult);
  const wuxingBalance = analyzeWuxingBalance(maleResult, femaleResult);
  const yongShenMatch = analyzeYongShenMatch(maleResult, femaleResult);
  const branchRelations = analyzeBranchRelations(maleResult, femaleResult);
  const nayinMatch = analyzeNayinMatch(maleResult, femaleResult);

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
