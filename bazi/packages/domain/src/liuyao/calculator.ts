/**
 * Liu Yao Na Jia (六爻纳甲) — Calculator
 *
 * Core computation engine for Six Lines divination with Na Jia system.
 * Steps: 起卦 → 定本卦/变卦 → 纳甲装卦 → 定卦宫 → 定世应 → 装六亲 → 装六神 → 飞伏神
 */

import { Solar, Lunar, LunarUtil } from 'lunar-typescript';
import type {
  LiuyaoInput,
  LiuyaoResult,
  LiuyaoHexagram,
  LiuyaoLine,
  LiuyaoHiddenGod,
  YaoValue,
  TrigramName,
  WuXing,
  SixRelation,
  SixSpirit,
} from '../types.js';
import { HEXAGRAM_TABLE, TRIGRAMS, LINES_TO_TRIGRAM } from '../meihua/data.js';
import {
  BRANCH_ELEMENT,
  NAJIA_STEMS,
  NAJIA_INNER,
  NAJIA_OUTER,
  HEXAGRAM_PALACE_MAP,
  PALACE_PURE_HEX,
  SIX_SPIRITS_ORDER,
  SPIRIT_START,
  TRIGRAM_ELEMENT,
  getSixRelation,
} from './data.js';

// === Helper: trigram line pattern → TrigramName ===

function linesToTrigramName(lines: [boolean, boolean, boolean]): TrigramName {
  const key = lines.map((l) => (l ? 'T' : 'F')).join('');
  const num = LINES_TO_TRIGRAM[key];
  return TRIGRAMS[num].name;
}

// === Step 1: Cast hexagram (起卦) ===

function castCoin(): YaoValue {
  // Simulate 3 coins: heads=3, tails=2. Sum of 3 coins: 6,7,8,9
  const coin = () => (Math.random() < 0.5 ? 2 : 3);
  return (coin() + coin() + coin()) as YaoValue;
}

function generateLines(input: LiuyaoInput): YaoValue[] {
  if (input.method === 'manual' && input.manualLines && input.manualLines.length === 6) {
    return input.manualLines;
  }
  if (input.method === 'coin' || input.method === 'random') {
    return Array.from({ length: 6 }, () => castCoin());
  }
  // Fallback to random
  return Array.from({ length: 6 }, () => castCoin());
}

// === Step 2: Determine hexagram from lines ===

function linesToHexagram(lines: YaoValue[]): { upper: TrigramName; lower: TrigramName; name: string } {
  // Lines are bottom (1) to top (6)
  // Lower trigram = lines 1-3, Upper trigram = lines 4-6
  const lowerBool: [boolean, boolean, boolean] = [
    lines[0] === 7 || lines[0] === 9,
    lines[1] === 7 || lines[1] === 9,
    lines[2] === 7 || lines[2] === 9,
  ];
  const upperBool: [boolean, boolean, boolean] = [
    lines[3] === 7 || lines[3] === 9,
    lines[4] === 7 || lines[4] === 9,
    lines[5] === 7 || lines[5] === 9,
  ];

  const lower = linesToTrigramName(lowerBool);
  const upper = linesToTrigramName(upperBool);
  const hexEntry = HEXAGRAM_TABLE[upper]?.[lower];
  const name = hexEntry?.name || `${upper}${lower}`;

  return { upper, lower, name };
}

// === Step 3: Determine changed hexagram ===

function getChangedHexagram(lines: YaoValue[]): { upper: TrigramName; lower: TrigramName; name: string } | null {
  const hasMoving = lines.some((v) => v === 6 || v === 9);
  if (!hasMoving) return null;

  // Moving lines flip: 老阴(6) → 阳, 老阳(9) → 阴
  const changedLines: YaoValue[] = lines.map((v) => {
    if (v === 6) return 7 as YaoValue; // old yin → young yang
    if (v === 9) return 8 as YaoValue; // old yang → young yin
    return v;
  });

  return linesToHexagram(changedLines);
}

// === Step 4-7: Build full hexagram with NaJia, relations, spirits ===

function buildHexagram(
  upper: TrigramName,
  lower: TrigramName,
  name: string,
  lines: YaoValue[],
  dayStem: string,
  palaceElement: WuXing,
  shi: number,
  ying: number,
): LiuyaoLine[] {
  const result: LiuyaoLine[] = [];

  // Na Jia: assign stems and branches
  const innerBranches = NAJIA_INNER[lower];
  const outerBranches = NAJIA_OUTER[upper];
  const innerStem = NAJIA_STEMS[lower].inner;
  const outerStem = NAJIA_STEMS[upper].outer;

  // Six spirits
  const spiritStartIdx = SPIRIT_START[dayStem] ?? 0;

  for (let i = 0; i < 6; i++) {
    const pos = i + 1; // 1-6
    const isInner = i < 3;
    const branch = isInner ? innerBranches[i] : outerBranches[i - 3];
    const stem = isInner ? innerStem : outerStem;
    const element = BRANCH_ELEMENT[branch];
    const relation = getSixRelation(palaceElement, element);
    const spirit = SIX_SPIRITS_ORDER[(spiritStartIdx + i) % 6];

    const value = lines[i];
    const isYang = value === 7 || value === 9;
    const isMoving = value === 6 || value === 9;

    const line: LiuyaoLine = {
      position: pos,
      value,
      isYang,
      isMoving,
      branch,
      stem,
      element,
      relation,
      spirit,
      isShiYao: pos === shi,
      isYingYao: pos === ying,
    };

    // Changed line info (for moving lines)
    if (isMoving) {
      const changedHexUpper = pos > 3 ? getChangedTrigramForLine(upper, pos - 3, isYang) : upper;
      const changedHexLower = pos <= 3 ? getChangedTrigramForLine(lower, pos, isYang) : lower;
      const changedTrigram = pos <= 3 ? changedHexLower : changedHexUpper;
      const changedLocalPos = pos <= 3 ? pos : pos - 3;
      const isChangedInner = pos <= 3;
      const changedBranches = isChangedInner ? NAJIA_INNER[changedTrigram] : NAJIA_OUTER[changedTrigram];
      line.changedBranch = changedBranches[changedLocalPos - 1];
      line.changedElement = BRANCH_ELEMENT[line.changedBranch];
      line.changedRelation = getSixRelation(palaceElement, line.changedElement);
    }

    result.push(line);
  }

  return result;
}

function getChangedTrigramForLine(trigram: TrigramName, localPos: number, isYang: boolean): TrigramName {
  // Get the trigram's lines, flip the specified line
  const trigramData = Object.values(TRIGRAMS).find((t) => t.name === trigram);
  if (!trigramData) return trigram;
  const lines = [...trigramData.lines] as [boolean, boolean, boolean];
  lines[localPos - 1] = !isYang; // moving yang→yin, moving yin→yang
  return linesToTrigramName(lines);
}

// === Step 9: Hidden Gods (飞伏神) ===

function findHiddenGods(
  hexLines: LiuyaoLine[],
  palace: TrigramName,
  palaceElement: WuXing,
): LiuyaoHiddenGod[] {
  // Check which six relations are missing in the original hexagram
  const presentRelations = new Set(hexLines.map((l) => l.relation));
  const allRelations: SixRelation[] = ['父母', '兄弟', '子孙', '妻财', '官鬼'];
  const missing = allRelations.filter((r) => !presentRelations.has(r));

  if (missing.length === 0) return [];

  // Get the pure hexagram (本宫卦) lines for this palace
  const pureHex = PALACE_PURE_HEX[palace];
  const pureBranches: { branch: string; element: WuXing; position: number }[] = [];
  const innerBr = NAJIA_INNER[pureHex.lower];
  const outerBr = NAJIA_OUTER[pureHex.upper];
  for (let i = 0; i < 3; i++) {
    pureBranches.push({ branch: innerBr[i], element: BRANCH_ELEMENT[innerBr[i]], position: i + 1 });
  }
  for (let i = 0; i < 3; i++) {
    pureBranches.push({ branch: outerBr[i], element: BRANCH_ELEMENT[outerBr[i]], position: i + 4 });
  }

  const hiddenGods: LiuyaoHiddenGod[] = [];

  for (const missingRelation of missing) {
    // Find in the pure hexagram the line with this relation
    const pureLineMatch = pureBranches.find(
      (pb) => getSixRelation(palaceElement, pb.element) === missingRelation,
    );
    if (pureLineMatch) {
      // Find which position in the current hexagram to associate it with
      // Convention: the hidden god sits behind the line at the same position
      hiddenGods.push({
        position: pureLineMatch.position,
        branch: pureLineMatch.branch,
        element: pureLineMatch.element,
        relation: missingRelation,
      });
    }
  }

  return hiddenGods;
}

// === Main Calculator ===

export function calculateLiuyao(input: LiuyaoInput): LiuyaoResult {
  const log: { step: string; detail: string }[] = [];

  // Step 0: Get calendar info
  const solar = Solar.fromYmdHms(input.year, input.month, input.day, input.hour, input.minute, 0);
  const lunar = Lunar.fromSolar(solar);

  const dayGanZhi = `${lunar.getDayGan()}${lunar.getDayZhi()}`;
  const dayStem = lunar.getDayGan();
  const monthBranch = lunar.getMonthZhi();
  const xunKong = LunarUtil.getXunKong(dayGanZhi);

  log.push({ step: '日月干支', detail: `日干支: ${dayGanZhi}, 月建: ${monthBranch}, 旬空: ${xunKong}` });

  // Step 1: Cast hexagram
  const lines = generateLines(input);
  log.push({ step: '起卦', detail: `六爻值(初→上): ${lines.join(', ')} (方法: ${input.method})` });

  // Step 2: Determine original hexagram
  const origHex = linesToHexagram(lines);
  log.push({ step: '定本卦', detail: `${origHex.name} (${origHex.upper}/${origHex.lower})` });

  // Step 3: Determine changed hexagram
  const movingLines = lines.reduce<number[]>((acc, v, i) => {
    if (v === 6 || v === 9) acc.push(i + 1);
    return acc;
  }, []);
  const changedHex = getChangedHexagram(lines);
  if (changedHex) {
    log.push({ step: '定变卦', detail: `${changedHex.name}, 动爻: ${movingLines.join(',')}` });
  } else {
    log.push({ step: '定变卦', detail: '无动爻，无变卦' });
  }

  // Step 4-5: Look up palace info
  const palaceKey = `${origHex.upper}_${origHex.lower}`;
  const palaceInfo = HEXAGRAM_PALACE_MAP[palaceKey];
  if (!palaceInfo) {
    throw new Error(`Palace info not found for ${palaceKey}`);
  }
  log.push({
    step: '定卦宫',
    detail: `${palaceInfo.palace}宫 (${palaceInfo.palaceElement}), 世${palaceInfo.shi}应${palaceInfo.ying}`,
  });

  // Step 6-8: Build lines with NaJia, relations, spirits
  const origLines = buildHexagram(
    origHex.upper,
    origHex.lower,
    origHex.name,
    lines,
    dayStem,
    palaceInfo.palaceElement,
    palaceInfo.shi,
    palaceInfo.ying,
  );

  const originalHexagram: LiuyaoHexagram = {
    name: origHex.name,
    palace: palaceInfo.palace,
    palaceElement: palaceInfo.palaceElement,
    upperTrigram: origHex.upper,
    lowerTrigram: origHex.lower,
    lines: origLines,
    shiPosition: palaceInfo.shi,
    yingPosition: palaceInfo.ying,
  };

  // Build changed hexagram if exists
  let changedHexagram: LiuyaoHexagram | null = null;
  if (changedHex) {
    const changedPalaceKey = `${changedHex.upper}_${changedHex.lower}`;
    const changedPalaceInfo = HEXAGRAM_PALACE_MAP[changedPalaceKey];
    if (changedPalaceInfo) {
      // Changed hexagram uses the ORIGINAL hexagram's palace element for six relations
      const changedLineValues: YaoValue[] = lines.map((v) => {
        if (v === 6) return 7 as YaoValue;
        if (v === 9) return 8 as YaoValue;
        return v;
      });
      const changedLines = buildHexagram(
        changedHex.upper,
        changedHex.lower,
        changedHex.name,
        changedLineValues,
        dayStem,
        palaceInfo.palaceElement, // Use original palace element
        changedPalaceInfo.shi,
        changedPalaceInfo.ying,
      );
      changedHexagram = {
        name: changedHex.name,
        palace: changedPalaceInfo.palace,
        palaceElement: changedPalaceInfo.palaceElement,
        upperTrigram: changedHex.upper,
        lowerTrigram: changedHex.lower,
        lines: changedLines,
        shiPosition: changedPalaceInfo.shi,
        yingPosition: changedPalaceInfo.ying,
      };
    }
  }

  // Step 9: Hidden gods
  const hiddenGods = findHiddenGods(origLines, palaceInfo.palace, palaceInfo.palaceElement);
  if (hiddenGods.length > 0) {
    log.push({
      step: '飞伏神',
      detail: hiddenGods.map((h) => `${h.relation}(${h.branch}${h.element})伏于第${h.position}爻`).join(', '),
    });
  }

  return {
    input,
    timestamp: Date.now(),
    dayGanZhi,
    monthBranch,
    originalHex: originalHexagram,
    changedHex: changedHexagram,
    movingLines,
    hiddenGods,
    xunKong,
    calculationLog: log,
  };
}
