/**
 * Mei Hua Yi Shu (梅花易数) Calculator
 *
 * Core calculation engine for Plum Blossom Numerology divination.
 */

import { Solar } from 'lunar-typescript';
import { TRIGRAMS, LINES_TO_TRIGRAM, HEXAGRAM_TABLE, YAOCI_TABLE } from './data.js';
import type { TrigramData } from './data.js';
import type {
  MeihuaInput,
  MeihuaTimeInput,
  MeihuaResult,
  Trigram,
  Hexagram,
  TiYongAnalysis,
  ChangingLinePosition,
  WuxingRelation,
  WuXing,
  TrigramName,
} from '../types.js';

// === Earthly Branch Mapping ===

const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/** Map hour (0-23) to earthly branch index (1-12, 子=1) */
function hourToBranchIndex(hour: number): number {
  // 23:00-00:59 → 子(1), 01:00-02:59 → 丑(2), ...
  if (hour === 23) return 1;
  return Math.floor(hour / 2) + 1;
}

// === Five Element Relationships ===

/** What element does this element generate? */
const GENERATES: Record<WuXing, WuXing> = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
};

/** What element does this element control? */
const CONTROLS: Record<WuXing, WuXing> = {
  '木': '土', '火': '金', '土': '水', '金': '木', '水': '火',
};

function getWuxingRelation(tiElement: WuXing, yongElement: WuXing): WuxingRelation {
  if (tiElement === yongElement) return '比和';
  if (GENERATES[tiElement] === yongElement) return '生';    // Ti generates Yong (泄气)
  if (CONTROLS[tiElement] === yongElement) return '克';     // Ti controls Yong (耗力)
  if (GENERATES[yongElement] === tiElement) return '被生';  // Yong generates Ti (有利)
  if (CONTROLS[yongElement] === tiElement) return '被克';   // Yong controls Ti (不利)
  return '比和';
}

// === Trigram Helpers ===

function toTrigram(data: TrigramData): Trigram {
  return { ...data };
}

function getTrigramByNumber(n: number): Trigram {
  return toTrigram(TRIGRAMS[n]);
}

function getTrigramByLines(lines: [boolean, boolean, boolean]): Trigram {
  const key = lines.map((l) => (l ? 'T' : 'F')).join('');
  const num = LINES_TO_TRIGRAM[key];
  return toTrigram(TRIGRAMS[num]);
}

// === Hexagram Builders ===

function buildHexagram(upper: Trigram, lower: Trigram): Hexagram {
  const lines: [boolean, boolean, boolean, boolean, boolean, boolean] = [
    lower.lines[0], lower.lines[1], lower.lines[2],
    upper.lines[0], upper.lines[1], upper.lines[2],
  ];
  const entry = HEXAGRAM_TABLE[upper.name][lower.name];
  return {
    name: entry.name,
    upper,
    lower,
    lines,
    kingWenNumber: entry.kingWenNumber,
    guaCi: entry.guaCi,
  };
}

function deriveMutualHexagram(hex: Hexagram): Hexagram {
  // Mutual hexagram (互卦):
  // Lower = lines 2,3,4 (0-indexed: 1,2,3)
  // Upper = lines 3,4,5 (0-indexed: 2,3,4)
  const lowerLines: [boolean, boolean, boolean] = [hex.lines[1], hex.lines[2], hex.lines[3]];
  const upperLines: [boolean, boolean, boolean] = [hex.lines[2], hex.lines[3], hex.lines[4]];
  const lowerTri = getTrigramByLines(lowerLines);
  const upperTri = getTrigramByLines(upperLines);
  return buildHexagram(upperTri, lowerTri);
}

function deriveChangedHexagram(hex: Hexagram, changingLine: ChangingLinePosition): Hexagram {
  const newLines = [...hex.lines] as [boolean, boolean, boolean, boolean, boolean, boolean];
  newLines[changingLine - 1] = !newLines[changingLine - 1];
  const lowerLines: [boolean, boolean, boolean] = [newLines[0], newLines[1], newLines[2]];
  const upperLines: [boolean, boolean, boolean] = [newLines[3], newLines[4], newLines[5]];
  const lowerTri = getTrigramByLines(lowerLines);
  const upperTri = getTrigramByLines(upperLines);
  return buildHexagram(upperTri, lowerTri);
}

// === Ti-Yong Analysis ===

const RELATION_ZH: Record<WuxingRelation, string> = {
  '生': '泄气，小凶',
  '克': '耗力，中平',
  '被生': '有利，吉',
  '被克': '不利，凶',
  '比和': '和谐，吉',
};

function analyzeTiYong(
  upper: Trigram,
  lower: Trigram,
  changingLine: ChangingLinePosition,
): TiYongAnalysis {
  // Changing line in lower (1-3) → yong=lower, ti=upper
  // Changing line in upper (4-6) → yong=upper, ti=lower
  const tiPosition: 'upper' | 'lower' = changingLine <= 3 ? 'upper' : 'lower';
  const ti = tiPosition === 'upper' ? upper : lower;
  const yong = tiPosition === 'upper' ? lower : upper;
  const relation = getWuxingRelation(ti.wuxing, yong.wuxing);

  const summary = `体${ti.name}${ti.wuxing}，用${yong.name}${yong.wuxing}，${relation === '比和' ? '体用比和' : `体${relation}用`}，${RELATION_ZH[relation]}`;

  return { ti, yong, tiPosition, relation, summary };
}

// === Lunar Date Helper ===

interface LunarDateInfo {
  yearBranchIndex: number; // 1-12 (子=1...亥=12)
  lunarMonth: number;
  lunarDay: number;
  hourBranchIndex: number; // 1-12
}

function getLunarDateInfo(input: MeihuaTimeInput): LunarDateInfo {
  const solar = Solar.fromYmdHms(input.year, input.month, input.day, input.hour, 0, 0);
  const lunar = solar.getLunar();
  const yearBranch = lunar.getYearZhiExact();
  const yearBranchIndex = BRANCHES.indexOf(yearBranch) + 1;

  return {
    yearBranchIndex: yearBranchIndex > 0 ? yearBranchIndex : 1,
    lunarMonth: Math.abs(lunar.getMonth()),
    lunarDay: lunar.getDay(),
    hourBranchIndex: hourToBranchIndex(input.hour),
  };
}

// === Main Calculator ===

export function calculateMeihua(input: MeihuaInput): MeihuaResult {
  const log: { step: string; detail: string }[] = [];

  let upperNumber: number;
  let lowerNumber: number;
  let changingLineRaw: number;

  if (input.method === 'time') {
    const info = getLunarDateInfo(input);
    log.push({
      step: '农历转换',
      detail: `年支=${BRANCHES[info.yearBranchIndex - 1]}(${info.yearBranchIndex}), 月=${info.lunarMonth}, 日=${info.lunarDay}, 时辰=${info.hourBranchIndex}`,
    });

    const upperSum = info.yearBranchIndex + info.lunarMonth + info.lunarDay;
    const lowerSum = upperSum + info.hourBranchIndex;
    upperNumber = upperSum % 8 || 8;
    lowerNumber = lowerSum % 8 || 8;
    changingLineRaw = lowerSum % 6 || 6;

    log.push({
      step: '起卦计算',
      detail: `上卦数=(${info.yearBranchIndex}+${info.lunarMonth}+${info.lunarDay})%8=${upperNumber}, 下卦数=(${upperSum}+${info.hourBranchIndex})%8=${lowerNumber}, 动爻=${lowerSum}%6=${changingLineRaw}`,
    });
  } else {
    upperNumber = input.upperNumber % 8 || 8;
    lowerNumber = input.lowerNumber % 8 || 8;
    changingLineRaw = (input.upperNumber + input.lowerNumber) % 6 || 6;

    log.push({
      step: '数字起卦',
      detail: `上卦数=${input.upperNumber}%8=${upperNumber}, 下卦数=${input.lowerNumber}%8=${lowerNumber}, 动爻=(${input.upperNumber}+${input.lowerNumber})%6=${changingLineRaw}`,
    });
  }

  const changingLine = changingLineRaw as ChangingLinePosition;
  const upperTrigram = getTrigramByNumber(upperNumber);
  const lowerTrigram = getTrigramByNumber(lowerNumber);

  log.push({
    step: '卦象',
    detail: `上卦=${upperTrigram.name}(${upperTrigram.symbol}), 下卦=${lowerTrigram.name}(${lowerTrigram.symbol}), 动爻=第${changingLine}爻`,
  });

  const benGua = buildHexagram(upperTrigram, lowerTrigram);
  const huGua = deriveMutualHexagram(benGua);
  const bianGua = deriveChangedHexagram(benGua, changingLine);
  const tiYong = analyzeTiYong(upperTrigram, lowerTrigram, changingLine);

  const yaoCiEntry = YAOCI_TABLE[benGua.kingWenNumber];
  const changingLineCi = yaoCiEntry?.[changingLine] ?? '';

  log.push({
    step: '结果',
    detail: `本卦=${benGua.name}, 互卦=${huGua.name}, 变卦=${bianGua.name}, 体用=${tiYong.summary}`,
  });

  return {
    input,
    timestamp: Date.now(),
    benGua,
    huGua,
    bianGua,
    changingLine,
    changingLineCi,
    tiYong,
    calculationLog: log,
  };
}
