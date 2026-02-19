/**
 * Zi Wei Dou Shu Analysis Context Extractor
 *
 * Extracts structured context from ZiweiResult for AI prompt construction.
 */

import type { ZiweiResult, ZiweiPalace, ZiweiStar } from '../types.js';

export interface ZiweiAnalysisContext {
  name: string;
  gender: string;
  lunarBirthInfo: string;
  mingPalace: string;
  shenPalace: string;
  wuxingJu: string;
  allPalaces: string;
  decadeLucks: string;
  siHuaSummary: string;
  keyPattern: string;
}

function formatStar(star: ZiweiStar): string {
  let s = star.name;
  if (star.brightness) s += `(${star.brightness})`;
  if (star.siHua) s += `[${star.siHua}]`;
  return s;
}

function formatPalace(palace: ZiweiPalace): string {
  const mainStars = palace.stars.filter(s => s.type === 'main').map(formatStar).join('、');
  const auxStars = palace.stars.filter(s => s.type === 'aux').map(formatStar).join('、');
  let line = `${palace.name}(${palace.stem}${palace.branch})`;
  if (mainStars) line += `：主星 ${mainStars}`;
  if (auxStars) line += `；辅星 ${auxStars}`;
  if (palace.decadeLuckAge) line += ` [大运${palace.decadeLuckAge}]`;
  return line;
}

function detectKeyPatterns(result: ZiweiResult): string {
  const patterns: string[] = [];
  const { palaces } = result.chart;

  // Find 命宫 stars
  const mingPalace = palaces.find(p => p.name === '命宫');
  if (mingPalace) {
    const mainStars = mingPalace.stars.filter(s => s.type === 'main').map(s => s.name);
    if (mainStars.includes('紫微') && mainStars.includes('天府')) {
      patterns.push('紫府同宫');
    }
    if (mainStars.includes('紫微') && mainStars.includes('贪狼')) {
      patterns.push('紫贪同宫');
    }
    if (mainStars.includes('紫微') && mainStars.includes('天相')) {
      patterns.push('紫相同宫');
    }
    if (mainStars.includes('紫微') && mainStars.includes('七杀')) {
      patterns.push('紫杀同宫');
    }
    if (mainStars.includes('紫微') && mainStars.includes('破军')) {
      patterns.push('紫破同宫');
    }
  }

  // Check for 日月并明 (太阳庙旺 + 太阴庙旺)
  let sunBright = false;
  let moonBright = false;
  for (const palace of palaces) {
    for (const star of palace.stars) {
      if (star.name === '太阳' && (star.brightness === '庙' || star.brightness === '旺')) {
        sunBright = true;
      }
      if (star.name === '太阴' && (star.brightness === '庙' || star.brightness === '旺')) {
        moonBright = true;
      }
    }
  }
  if (sunBright && moonBright) patterns.push('日月并明');

  // Check Si Hua in 命宫
  if (mingPalace) {
    for (const star of mingPalace.stars) {
      if (star.siHua === '化禄') patterns.push(`命宫${star.name}化禄`);
      if (star.siHua === '化忌') patterns.push(`命宫${star.name}化忌`);
    }
  }

  return patterns.length > 0 ? patterns.join('；') : '无显著格局特征';
}

export function extractZiweiAnalysisContext(result: ZiweiResult): ZiweiAnalysisContext {
  const { chart, lunarInfo, input, decadeLucks } = result;
  const { palaces } = chart;

  const name = input.name || '未知';
  const gender = input.gender === 'male' ? '男' : '女';

  const lunarBirthInfo = `农历${lunarInfo.yearStem}${lunarInfo.yearBranch}年${lunarInfo.isLeap ? '闰' : ''}${lunarInfo.month}月${lunarInfo.day}日 ${lunarInfo.hourBranch}时`;

  // Ming Palace summary
  const mingPalaceObj = palaces.find(p => p.name === '命宫');
  const mingPalace = mingPalaceObj ? formatPalace(mingPalaceObj) : '命宫信息缺失';

  // Shen Palace summary
  const shenPalaceObj = palaces.find(p => p.name === chart.shenPalace);
  const shenPalace = shenPalaceObj
    ? `身宫在${chart.shenPalace}：${formatPalace(shenPalaceObj)}`
    : `身宫在${chart.shenPalace}`;

  // All palaces
  const allPalaces = palaces.map(formatPalace).join('\n');

  // Decade lucks
  const decadeLucksStr = decadeLucks
    .slice(0, 8) // Show first 8 decades
    .map(l => `${l.ageRange}岁 ${l.stem}${l.branch}(${l.palaceName})`)
    .join('；');

  // Si Hua summary
  const siHuaEntries: string[] = [];
  for (const palace of palaces) {
    for (const star of palace.stars) {
      if (star.siHua) {
        siHuaEntries.push(`${star.name}${star.siHua}在${palace.name}`);
      }
    }
  }
  const siHuaSummary = siHuaEntries.join('，');

  const keyPattern = detectKeyPatterns(result);

  return {
    name,
    gender,
    lunarBirthInfo,
    mingPalace,
    shenPalace,
    wuxingJu: chart.wuxingJu,
    allPalaces,
    decadeLucks: decadeLucksStr,
    siHuaSummary,
    keyPattern,
  };
}
