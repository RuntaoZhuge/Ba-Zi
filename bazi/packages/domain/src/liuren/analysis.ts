/**
 * Da Liu Ren (大六壬) — Analysis Context Extraction
 *
 * Transforms raw LiurenResult into a structured context for AI analysis prompts.
 */

import type { LiurenResult } from '../types.js';
import { BRANCH_LIST } from './data.js';

export interface LiurenAnalysisContext {
  dayHourInfo: string;       // 日干支 + 时干支
  monthJiang: string;        // 月将信息
  boardSummary: string;      // 天地盘概览
  lessonsSummary: string;    // 四课详情
  transmissionInfo: string;  // 三传信息
  xunKong: string;           // 旬空
  question: string;          // 所问之事
}

export function extractLiurenAnalysisContext(result: LiurenResult): LiurenAnalysisContext {
  const board = result.board;

  const dayHourInfo = `日干支: ${result.dayGanZhi}, 时干支: ${result.hourGanZhi}`;
  const monthJiang = `月将: ${board.monthJiang}(${board.monthJiangName})`;

  // Board summary: show heaven branch → earth branch for all 12 positions
  // Traditional square layout: show key positions
  const boardRows = board.positions.map((p) => {
    const generalStr = p.general ? `[${p.general}]` : '';
    return `${p.earthBranch}上${p.heavenBranch}${generalStr}`;
  });
  const boardSummary = boardRows.join(', ');

  // Lessons summary
  const lessonRows = board.lessons.map((l, i) =>
    `第${i + 1}课: ${l.top}(${l.topElement})/${l.bottom}(${l.bottomElement}) ${l.relation}`,
  );
  const lessonsSummary = lessonRows.join('\n');

  // Transmission info
  const t = board.transmission;
  const transmissionInfo = [
    `取传法: ${t.method}`,
    `初传: ${t.initial}${t.initialGeneral ? `[${t.initialGeneral}]` : ''}`,
    `中传: ${t.middle}${t.middleGeneral ? `[${t.middleGeneral}]` : ''}`,
    `末传: ${t.final}${t.finalGeneral ? `[${t.finalGeneral}]` : ''}`,
  ].join(', ');

  return {
    dayHourInfo,
    monthJiang,
    boardSummary,
    lessonsSummary,
    transmissionInfo,
    xunKong: `旬空: ${board.xunKong}`,
    question: result.input.question || '',
  };
}
