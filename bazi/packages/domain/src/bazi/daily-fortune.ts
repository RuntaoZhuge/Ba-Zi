/**
 * Daily Fortune Calculator (每日运势)
 *
 * Calculates today's fortune context for an existing BaZi chart by
 * combining the natal chart with today's GanZhi pillars.
 */

import { Solar } from 'lunar-typescript';
import type {
  BaZiResult,
  DailyFortuneContext,
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

// === Helpers ===

/**
 * Derive Ten God (十神) relationship between day master and a target stem.
 * Same logic as calculator.ts deriveShiShen (which is not exported).
 */
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

/**
 * Analyze the branch relationship between today's day branch and natal day branch.
 */
function analyzeBranchRelation(todayBranch: string, natalDayBranch: string): string {
  if (todayBranch === natalDayBranch) return '伏吟';
  if (LIU_HE[todayBranch] === natalDayBranch) return '六合';
  if (LIU_CHONG[todayBranch] === natalDayBranch) return '六冲';
  return '平和';
}

// === Main Export ===

/**
 * Calculate daily fortune context for a given date against an existing BaZi chart.
 */
export function calculateDailyFortune(
  result: BaZiResult,
  targetDate: { year: number; month: number; day: number },
): DailyFortuneContext {
  const { chart, yun, liuNian } = result;

  // 1. Get today's GanZhi via lunar-typescript
  const solar = Solar.fromYmd(targetDate.year, targetDate.month, targetDate.day);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  const todayYear = eightChar.getYear();
  const todayMonth = eightChar.getMonth();
  const todayDay = eightChar.getDay();

  // 2. Calculate current age
  const birthYear = chart.input.year;
  const currentAge = targetDate.year - birthYear;

  // 3. Find current DaYun
  const daYun = yun.daYun.find(
    (dy) => currentAge >= dy.startAge && currentAge <= dy.endAge,
  );
  const currentDaYun = daYun
    ? { ganZhi: daYun.stemBranch.ganZhi, startAge: daYun.startAge, endAge: daYun.endAge }
    : null;

  // 4. Find current LiuNian
  const ln = liuNian.find((l) => l.year === targetDate.year);
  const currentLiuNian = ln
    ? { year: ln.year, ganZhi: ln.stemBranch.ganZhi }
    : null;

  // 5. Extract analysis context for yongShen/xiShen/jiShen
  const analysisCtx = extractAnalysisContext(result);

  // 6. Ten-god relation: today's day stem vs day master
  const todayDayStem = todayDay.charAt(0) as HeavenlyStem;
  const dayGanShiShen = deriveShiShen(chart.dayMaster, todayDayStem);

  // 7. Branch relation: today's day branch vs natal day branch
  const todayDayBranch = todayDay.charAt(1);
  const natalDayBranch = chart.fourPillars.day.stemBranch.branch;
  const dayZhiRelation = analyzeBranchRelation(todayDayBranch, natalDayBranch);

  // 8. XunKong
  const xunKong = lunar.getDayXunKong();

  return {
    dayMaster: chart.dayMaster,
    mingge: chart.mingge,
    yongShen: analysisCtx.yongShen,
    xiShen: analysisCtx.xiShen,
    jiShen: analysisCtx.jiShen,
    todayYear,
    todayMonth,
    todayDay,
    currentDaYun,
    currentLiuNian,
    currentAge,
    dayGanShiShen,
    dayZhiRelation,
    xunKong,
    targetDate,
  };
}
