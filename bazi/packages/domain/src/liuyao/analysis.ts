/**
 * Liu Yao Na Jia (六爻纳甲) — Analysis Context Extraction
 *
 * Transforms raw LiuyaoResult into a structured context for AI analysis prompts.
 */

import type { LiuyaoResult } from '../types.js';

export interface LiuyaoAnalysisContext {
  hexInfo: string;         // 卦名 + 宫 + 世应
  dayMonth: string;        // 日干支 + 月建
  xunKong: string;         // 旬空
  linesSummary: string;    // 每爻信息
  movingInfo: string;      // 动爻信息
  changedHex: string;      // 变卦信息
  hiddenGods: string;      // 伏神信息
  question: string;        // 所问之事
}

export function extractLiuyaoAnalysisContext(result: LiuyaoResult): LiuyaoAnalysisContext {
  const hex = result.originalHex;

  const hexInfo = `${hex.name} (${hex.palace}宫·${hex.palaceElement}) 世${hex.shiPosition}应${hex.yingPosition}`;

  const dayMonth = `日干支: ${result.dayGanZhi}, 月建: ${result.monthBranch}`;
  const xunKong = `旬空: ${result.xunKong}`;

  // Build line summary (from top to bottom for readability)
  const lineRows = [...hex.lines].reverse().map((l) => {
    const pos = l.position === 1 ? '初' : l.position === 6 ? '上' : String(l.position);
    const yinYang = l.isYang ? '阳' : '阴';
    const moving = l.isMoving ? ' ○动' : '';
    const shiYing = l.isShiYao ? ' 世' : l.isYingYao ? ' 应' : '';
    const changed = l.changedBranch ? ` → ${l.changedBranch}(${l.changedElement})${l.changedRelation}` : '';
    return `${l.spirit} | ${l.relation} | ${l.stem}${l.branch}(${l.element}) | ${yinYang}${moving}${shiYing}${changed}`;
  });
  const linesSummary = lineRows.join('\n');

  const movingInfo = result.movingLines.length > 0
    ? `动爻: ${result.movingLines.join(',')}爻`
    : '无动爻';

  const changedHex = result.changedHex
    ? `变卦: ${result.changedHex.name} (${result.changedHex.palace}宫)`
    : '无变卦';

  const hiddenGods = result.hiddenGods.length > 0
    ? result.hiddenGods.map((h) => `${h.relation}(${h.branch}·${h.element})伏于第${h.position}爻`).join(', ')
    : '六亲齐全，无伏神';

  return {
    hexInfo,
    dayMonth,
    xunKong,
    linesSummary,
    movingInfo,
    changedHex,
    hiddenGods,
    question: result.input.question || '',
  };
}
