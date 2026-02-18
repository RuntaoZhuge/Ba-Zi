/**
 * Mei Hua Analysis Context Extractor
 *
 * Extracts structured context from MeihuaResult for AI prompt construction.
 */

import type { MeihuaResult } from '../types.js';

export interface MeihuaAnalysisContext {
  question: string;
  method: string;
  benGuaSummary: string;
  huGuaSummary: string;
  bianGuaSummary: string;
  changingLineSummary: string;
  tiYongSummary: string;
  wuxingAnalysis: string;
  seasonalContext: string;
}

/** Lunar month → season → prosperous element */
function getSeasonFromMonth(lunarMonth: number): string {
  if (lunarMonth >= 1 && lunarMonth <= 3) return '春季（木旺）';
  if (lunarMonth >= 4 && lunarMonth <= 6) return '夏季（火旺）';
  if (lunarMonth >= 7 && lunarMonth <= 9) return '秋季（金旺）';
  return '冬季（水旺）';
}

function guessLunarMonth(timestamp: number): number {
  // Rough approximation: solar month ≈ lunar month for seasonal context
  const d = new Date(timestamp);
  return d.getMonth() + 1;
}

export function extractMeihuaAnalysisContext(result: MeihuaResult): MeihuaAnalysisContext {
  const { benGua, huGua, bianGua, changingLine, changingLineCi, tiYong, input } = result;

  const question = input.question ?? '';
  const method = input.method === 'time' ? '时间起卦' : '数字起卦';

  const benGuaSummary = `${benGua.name}（上${benGua.upper.name}${benGua.upper.wuxing}下${benGua.lower.name}${benGua.lower.wuxing}）— ${benGua.guaCi}`;
  const huGuaSummary = `${huGua.name}（上${huGua.upper.name}${huGua.upper.wuxing}下${huGua.lower.name}${huGua.lower.wuxing}）— ${huGua.guaCi}`;
  const bianGuaSummary = `${bianGua.name}（上${bianGua.upper.name}${bianGua.upper.wuxing}下${bianGua.lower.name}${bianGua.lower.wuxing}）— ${bianGua.guaCi}`;

  const changingLineSummary = `第${changingLine}爻动${changingLineCi ? ` — ${changingLineCi}` : ''}`;

  const wuxingAnalysis = [
    `本卦：上卦${benGua.upper.name}(${benGua.upper.wuxing})，下卦${benGua.lower.name}(${benGua.lower.wuxing})`,
    `互卦：上卦${huGua.upper.name}(${huGua.upper.wuxing})，下卦${huGua.lower.name}(${huGua.lower.wuxing})`,
    `变卦：上卦${bianGua.upper.name}(${bianGua.upper.wuxing})，下卦${bianGua.lower.name}(${bianGua.lower.wuxing})`,
  ].join('；');

  const approxMonth = guessLunarMonth(result.timestamp);
  const seasonalContext = getSeasonFromMonth(approxMonth);

  return {
    question,
    method,
    benGuaSummary,
    huGuaSummary,
    bianGuaSummary,
    changingLineSummary,
    tiYongSummary: tiYong.summary,
    wuxingAnalysis,
    seasonalContext,
  };
}
