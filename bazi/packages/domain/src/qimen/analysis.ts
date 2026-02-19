/**
 * Qi Men Dun Jia Analysis Context Extractor
 *
 * Extracts structured context from QimenResult for AI prompt construction.
 */

import type { QimenResult, QimenPalace } from '../types.js';

export interface QimenAnalysisContext {
  dunType: string;
  juInfo: string;
  dayHourGanZhi: string;
  zhiFu: string;
  zhiShi: string;
  xunInfo: string;
  palaceSummary: string;
  patterns: string;
  question: string;
}

function formatPalace(palace: QimenPalace): string {
  const parts = [
    `${palace.palaceNumber}宫(${palace.trigram}/${palace.direction})`,
    `天盘${palace.heavenStem}/地盘${palace.earthStem}`,
    palace.star,
    palace.gate,
    palace.deity,
  ];
  if (palace.patterns.length > 0) {
    parts.push(`[${palace.patterns.join('、')}]`);
  }
  return parts.join(' ');
}

export function extractQimenAnalysisContext(result: QimenResult): QimenAnalysisContext {
  const { board, dayGanZhi, hourGanZhi, input } = result;

  const dunType = `${board.dunType}${board.juNumber}局`;
  const juInfo = `${board.jieQi} ${board.yuan} ${board.dunType}${board.juNumber}局`;
  const dayHourGanZhi = `${dayGanZhi}日 ${hourGanZhi}时`;

  const zhiFu = `${board.zhiFuStar}`;
  const zhiShi = `${board.zhiShiGate}`;
  const xunInfo = `旬首${board.xunShou}(${board.xunShouYi}) 旬空${board.xunKong}`;

  const palaceSummary = board.palaces.map(formatPalace).join('\n');

  const allPatterns = board.palaces
    .flatMap(p => p.patterns.map(pat => `${p.palaceNumber}宫${pat}`));
  const patterns = allPatterns.length > 0 ? allPatterns.join('；') : '无特殊格局';

  const question = input.question || '';

  return {
    dunType,
    juInfo,
    dayHourGanZhi,
    zhiFu,
    zhiShi,
    xunInfo,
    palaceSummary,
    patterns,
    question,
  };
}
