/**
 * Da Liu Ren (大六壬) — Calculator
 *
 * Core computation engine for the Grand Six Ren divination system.
 * Steps: 日时干支 → 定月将 → 布天地盘 → 起四课 → 取三传 → 布天将 → 旬空
 */

import { Solar, SolarUtil, Lunar, LunarUtil } from 'lunar-typescript';
import type {
  LiurenInput,
  LiurenResult,
  LiurenBoard,
  LiurenPosition,
  LiurenLesson,
  LiurenTransmission,
  LiurenGeneral,
  WuXing,
} from '../types.js';
import {
  BRANCH_LIST,
  BRANCH_ELEMENT,
  STEM_ELEMENT,
  STEM_PALACE,
  MONTH_JIANG_TABLE,
  JIANG_NAME,
  GUIREN_TABLE,
  TWELVE_GENERALS,
  LIUCHONG,
  SANXING,
  branchIndex,
  getKeRelation,
  isKe,
  getYiMa,
} from './data.js';

// === Helper: advance branch by n positions ===

function advanceBranch(branch: string, n: number): string {
  const idx = branchIndex(branch);
  return BRANCH_LIST[((idx + n) % 12 + 12) % 12];
}

// === True Solar Time adjustment ===

function adjustForTrueSolarTime(input: LiurenInput): { hour: number; minute: number } {
  if (!input.useTrueSolarTime || input.longitude == null) {
    return { hour: input.hour, minute: input.minute };
  }
  const centralMeridian = 120; // China Standard Time (UTC+8) central meridian
  const longitudeCorrection = (input.longitude - centralMeridian) * 4; // 4 min per degree
  const dayOfYear = SolarUtil.getDaysInYear(input.year, input.month, input.day);
  const B = (2 * Math.PI * (dayOfYear - 81)) / 365;
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  let totalMinutes = input.hour * 60 + input.minute + Math.round(longitudeCorrection + eot);
  totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  return { hour: Math.floor(totalMinutes / 60), minute: totalMinutes % 60 };
}

// === Step 1: Calendar info ===

function getCalendarInfo(input: LiurenInput) {
  const adj = adjustForTrueSolarTime(input);
  const solar = Solar.fromYmdHms(input.year, input.month, input.day, adj.hour, adj.minute, 0);
  const lunar = Lunar.fromSolar(solar);

  const dayGan = lunar.getDayGan();
  const dayZhi = lunar.getDayZhi();
  const dayGanZhi = `${dayGan}${dayZhi}`;
  const hourGan = lunar.getTimeGan();
  const hourZhi = lunar.getTimeZhi();
  const hourGanZhi = `${hourGan}${hourZhi}`;

  return { solar, lunar, dayGan, dayZhi, dayGanZhi, hourGan, hourZhi, hourGanZhi };
}

// === Step 2: Determine Month General (月将) ===

function getMonthJiang(solar: Solar, lunar: Lunar): { branch: string; name: string } {
  // Use lunar-typescript's JieQi to find the current zhongqi period
  // We need to find which zhongqi has most recently passed

  const year = solar.getYear();
  const month = solar.getMonth();
  const day = solar.getDay();

  // Get all jieqi for the year
  // We'll use the lunar's prevJieQi method
  const prevJq = lunar.getPrevJieQi(true); // true = zhongqi only
  const jqName = prevJq.getName();

  // Find in our table
  const entry = MONTH_JIANG_TABLE.find((e) => e.zhongqi === jqName);
  if (entry) {
    return { branch: entry.branch, name: entry.name };
  }

  // Fallback: calculate based on solar month (approximate)
  // This shouldn't normally be reached
  const approxIndex = ((month + 9) % 12);
  const fallbackBranch = BRANCH_LIST[(11 - approxIndex + 12) % 12];
  return { branch: fallbackBranch, name: JIANG_NAME[fallbackBranch] || '' };
}

// === Step 3: Lay out Heaven and Earth boards (布天地盘) ===

function buildBoard(monthJiang: string, hourBranch: string): LiurenPosition[] {
  // Earth board: fixed 子丑寅卯辰巳午未申酉戌亥
  // Heaven board: rotate so that monthJiang sits on hourBranch
  // E.g., if month jiang = 亥(登明) and hour = 巳, then 亥 on heaven board sits at 巳 on earth board

  const jiangIdx = branchIndex(monthJiang);
  const hourIdx = branchIndex(hourBranch);
  const offset = (hourIdx - jiangIdx + 12) % 12;

  const positions: LiurenPosition[] = [];
  for (let i = 0; i < 12; i++) {
    const earthBranch = BRANCH_LIST[i];
    const heavenBranch = BRANCH_LIST[(i - offset + 12) % 12];
    positions.push({ earthBranch, heavenBranch });
  }

  return positions;
}

// Get the heaven-board branch sitting above a given earth-board branch
function getHeavenAbove(positions: LiurenPosition[], earthBranch: string): string {
  const pos = positions.find((p) => p.earthBranch === earthBranch);
  return pos ? pos.heavenBranch : earthBranch;
}

// === Step 4: Four Lessons (四课) ===

function buildFourLessons(positions: LiurenPosition[], dayGan: string, dayZhi: string): LiurenLesson[] {
  const stemPalace = STEM_PALACE[dayGan];

  // 第一课: 日干寄宫(下) → 天盘上对应支(上)
  const lesson1Bottom = stemPalace;
  const lesson1Top = getHeavenAbove(positions, stemPalace);

  // 第二课: 第一课上(下) → 天盘对应支(上)
  const lesson2Bottom = lesson1Top;
  const lesson2Top = getHeavenAbove(positions, lesson1Top);

  // 第三课: 日支(下) → 天盘对应支(上)
  const lesson3Bottom = dayZhi;
  const lesson3Top = getHeavenAbove(positions, dayZhi);

  // 第四课: 第三课上(下) → 天盘对应支(上)
  const lesson4Bottom = lesson3Top;
  const lesson4Top = getHeavenAbove(positions, lesson3Top);

  return [lesson1Top, lesson2Top, lesson3Top, lesson4Top].map((top, i) => {
    const bottom = [lesson1Bottom, lesson2Bottom, lesson3Bottom, lesson4Bottom][i];
    const topElement = BRANCH_ELEMENT[top];
    const bottomElement = BRANCH_ELEMENT[bottom];
    return {
      top,
      bottom,
      topElement,
      bottomElement,
      relation: getKeRelation(topElement, bottomElement),
    };
  });
}

// === Step 5: Three Transmissions (三传) ===

interface KeEntry {
  lessonIndex: number;
  top: string;
  bottom: string;
  direction: 'top_ke_bottom' | 'bottom_ke_top';
}

function findKeEntries(lessons: LiurenLesson[]): KeEntry[] {
  const entries: KeEntry[] = [];
  for (let i = 0; i < 4; i++) {
    const { top, bottom, topElement, bottomElement } = lessons[i];
    if (isKe(topElement, bottomElement)) {
      entries.push({ lessonIndex: i, top, bottom, direction: 'top_ke_bottom' });
    } else if (isKe(bottomElement, topElement)) {
      entries.push({ lessonIndex: i, top, bottom, direction: 'bottom_ke_top' });
    }
  }
  return entries;
}

function getTransmission(
  positions: LiurenPosition[],
  lessons: LiurenLesson[],
  dayGan: string,
  dayZhi: string,
): LiurenTransmission {
  // Check for 伏吟 (fu-yin): all heaven branches equal earth branches
  const isFuYin = positions.every((p) => p.heavenBranch === p.earthBranch);
  if (isFuYin) {
    return getFuYinTransmission(positions, lessons, dayGan, dayZhi);
  }

  // Check for 返吟 (fan-yin): all heaven branches are chong of earth branches
  const isFanYin = positions.every((p) => LIUCHONG[p.earthBranch] === p.heavenBranch);
  if (isFanYin) {
    return getFanYinTransmission(positions, lessons, dayGan, dayZhi);
  }

  // Normal case: find ke entries
  const keEntries = findKeEntries(lessons);

  if (keEntries.length === 0) {
    // 遥克法 or 昴星法
    return getNoKeTransmission(positions, lessons, dayGan, dayZhi);
  }

  // Separate into 贼 (top克bottom, 下贼上) and 克 (bottom克top, 上克下)
  const zeiEntries = keEntries.filter((e) => e.direction === 'top_ke_bottom');  // 上克下(贼)
  const keOnlyEntries = keEntries.filter((e) => e.direction === 'bottom_ke_top'); // 下克上

  // Priority: 贼 > 克 (先取有贼者)
  let selectedEntries = zeiEntries.length > 0 ? zeiEntries : keOnlyEntries;
  let methodName = zeiEntries.length > 0 ? '贼克法(上克下)' : '贼克法(下克上)';

  if (selectedEntries.length === 1) {
    // Single ke: direct use
    const entry = selectedEntries[0];
    const initial = entry.direction === 'top_ke_bottom' ? entry.top : entry.bottom;
    return buildTransmissionChain(positions, initial, methodName);
  }

  // Multiple ke entries: 比用法 — pick the one whose element matches day stem's element
  const dayStemElement = STEM_ELEMENT[dayGan];
  const biEntries = selectedEntries.filter((e) => {
    const useBranch = e.direction === 'top_ke_bottom' ? e.top : e.bottom;
    return BRANCH_ELEMENT[useBranch] === dayStemElement;
  });

  if (biEntries.length === 1) {
    const entry = biEntries[0];
    const initial = entry.direction === 'top_ke_bottom' ? entry.top : entry.bottom;
    return buildTransmissionChain(positions, initial, '比用法');
  }

  if (biEntries.length > 1) {
    selectedEntries = biEntries;
    methodName = '比用法';
  }

  // Still multiple: 涉害法 — compare depth of harm (涉害深浅)
  // Count how many branches each candidate "passes through" from the earth branch to the 受克 branch
  const sheHaiScores = selectedEntries.map((e) => {
    const useBranch = e.direction === 'top_ke_bottom' ? e.top : e.bottom;
    const earthIdx = branchIndex(e.bottom);
    const heavenIdx = branchIndex(e.top);
    // Count ke relationships along the path
    let count = 0;
    for (let step = 0; step < 12; step++) {
      const checkBranch = advanceBranch(e.bottom, step);
      const checkHeaven = getHeavenAbove(positions, checkBranch);
      const eEle = BRANCH_ELEMENT[checkBranch];
      const hEle = BRANCH_ELEMENT[checkHeaven];
      if (isKe(hEle, eEle) || isKe(eEle, hEle)) count++;
      if (checkBranch === useBranch) break;
    }
    return { entry: e, score: count, useBranch };
  });

  sheHaiScores.sort((a, b) => b.score - a.score);
  const initial = sheHaiScores[0].useBranch;
  return buildTransmissionChain(positions, initial, '涉害法');
}

function buildTransmissionChain(
  positions: LiurenPosition[],
  initial: string,
  method: string,
): LiurenTransmission {
  const middle = getHeavenAbove(positions, initial);
  const final_ = getHeavenAbove(positions, middle);

  return {
    initial,
    middle,
    final: final_,
    method,
  };
}

function getFuYinTransmission(
  positions: LiurenPosition[],
  lessons: LiurenLesson[],
  dayGan: string,
  dayZhi: string,
): LiurenTransmission {
  // 伏吟课: 天地盘完全相同
  // Priority: 刑 → 冲 → 自身

  // Try 刑: check four lessons for san-xing
  for (const lesson of lessons) {
    const xingTarget = SANXING[lesson.top];
    if (xingTarget && xingTarget !== lesson.top) {
      return buildTransmissionChain(positions, xingTarget, '伏吟(刑)');
    }
  }

  // Try 冲: use day branch's chong
  const chongBranch = LIUCHONG[dayZhi];
  if (chongBranch) {
    return buildTransmissionChain(positions, chongBranch, '伏吟(冲)');
  }

  // Fallback: use day stem palace
  const stemPalace = STEM_PALACE[dayGan];
  return buildTransmissionChain(positions, stemPalace, '伏吟(自身)');
}

function getFanYinTransmission(
  positions: LiurenPosition[],
  lessons: LiurenLesson[],
  dayGan: string,
  dayZhi: string,
): LiurenTransmission {
  // 返吟课: 天地盘六冲对冲
  // Use 驿马 (yi-ma) as initial transmission

  // First check if there are ke entries
  const keEntries = findKeEntries(lessons);
  if (keEntries.length > 0) {
    // Use the first ke entry
    const entry = keEntries[0];
    const initial = entry.direction === 'top_ke_bottom' ? entry.top : entry.bottom;
    return buildTransmissionChain(positions, initial, '返吟(驿马)');
  }

  // Use yi-ma
  const yiMa = getYiMa(dayZhi);
  return buildTransmissionChain(positions, yiMa, '返吟(驿马)');
}

function getNoKeTransmission(
  positions: LiurenPosition[],
  lessons: LiurenLesson[],
  dayGan: string,
  dayZhi: string,
): LiurenTransmission {
  // No ke in four lessons

  // 遥克法: check if any pair of four lessons (non-adjacent) has ke
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      const topI = BRANCH_ELEMENT[lessons[i].top];
      const topJ = BRANCH_ELEMENT[lessons[j].top];
      if (isKe(topI, topJ)) {
        return buildTransmissionChain(positions, lessons[i].top, '遥克法');
      }
      if (isKe(topJ, topI)) {
        return buildTransmissionChain(positions, lessons[j].top, '遥克法');
      }
    }
  }

  // 昴星法: use day stem's 禄 (lu) branch, or the heaven branch above day branch
  // Simplified: use the heaven branch sitting on the day stem's palace
  const stemPalace = STEM_PALACE[dayGan];
  const aboveStemPalace = getHeavenAbove(positions, stemPalace);
  return buildTransmissionChain(positions, aboveStemPalace, '昴星法');
}

// === Step 6: Twelve Generals (布天将) ===

function assignGenerals(
  positions: LiurenPosition[],
  dayGan: string,
  hourBranch: string,
): void {
  const guirenPair = GUIREN_TABLE[dayGan];
  if (!guirenPair) return;

  // Determine day or night: 巳→申 is day, rest is night (simplified)
  const hourIdx = branchIndex(hourBranch);
  const isDay = hourIdx >= 3 && hourIdx <= 9; // 卯→酉 roughly daytime
  const guirenBranch = isDay ? guirenPair[0] : guirenPair[1];

  // Find which earth position the guiren branch falls on in the heaven board
  // Guiren (noble person) is placed at the heaven branch position
  const guirenPos = positions.find((p) => p.heavenBranch === guirenBranch);
  if (!guirenPos) return;

  const guirenEarthIdx = branchIndex(guirenPos.earthBranch);

  // Assign generals: from guiren position, go clockwise for yang noble, counter-clockwise for yin noble
  const isYangGui = isDay;
  for (let i = 0; i < 12; i++) {
    const general = TWELVE_GENERALS[i];
    let earthIdx: number;
    if (isYangGui) {
      // Yang noble: clockwise (forward)
      earthIdx = (guirenEarthIdx + i) % 12;
    } else {
      // Yin noble: counter-clockwise (backward)
      earthIdx = ((guirenEarthIdx - i) % 12 + 12) % 12;
    }
    const pos = positions.find((p) => p.earthBranch === BRANCH_LIST[earthIdx]);
    if (pos) {
      pos.general = general;
    }
  }
}

// === Get general for a branch from the board ===

function getGeneralForBranch(positions: LiurenPosition[], branch: string): LiurenGeneral | undefined {
  // Find the position where the heaven branch matches
  const pos = positions.find((p) => p.heavenBranch === branch);
  return pos?.general;
}

// === Main Calculator ===

export function calculateLiuren(input: LiurenInput): LiurenResult {
  const log: { step: string; detail: string }[] = [];

  // Step 1: Calendar info
  const cal = getCalendarInfo(input);
  log.push({
    step: '日时干支',
    detail: `日干支: ${cal.dayGanZhi}, 时干支: ${cal.hourGanZhi}`,
  });

  // Step 2: Month general
  const monthJiang = getMonthJiang(cal.solar, cal.lunar);
  log.push({
    step: '定月将',
    detail: `月将: ${monthJiang.branch}(${monthJiang.name})`,
  });

  // Step 3: Build heaven/earth board
  const positions = buildBoard(monthJiang.branch, cal.hourZhi);
  log.push({
    step: '布天地盘',
    detail: `月将${monthJiang.branch}加时支${cal.hourZhi}`,
  });

  // Step 4: Four lessons
  const lessons = buildFourLessons(positions, cal.dayGan, cal.dayZhi);
  log.push({
    step: '起四课',
    detail: lessons.map((l, i) => `第${i + 1}课: ${l.top}/${l.bottom}(${l.relation})`).join(', '),
  });

  // Step 5: Three transmissions
  const transmission = getTransmission(positions, lessons, cal.dayGan, cal.dayZhi);

  // Assign generals to transmission branches
  transmission.initialGeneral = getGeneralForBranch(positions, transmission.initial);
  transmission.middleGeneral = getGeneralForBranch(positions, transmission.middle);
  transmission.finalGeneral = getGeneralForBranch(positions, transmission.final);

  log.push({
    step: '取三传',
    detail: `${transmission.method}: 初传${transmission.initial}, 中传${transmission.middle}, 末传${transmission.final}`,
  });

  // Step 6: Assign generals
  assignGenerals(positions, cal.dayGan, cal.hourZhi);
  log.push({
    step: '布天将',
    detail: positions.filter((p) => p.general).map((p) => `${p.earthBranch}:${p.general}`).join(' '),
  });

  // Step 7: Xun Kong
  const xunKong = LunarUtil.getXunKong(cal.dayGanZhi);
  log.push({
    step: '旬空',
    detail: `旬空: ${xunKong}`,
  });

  const board: LiurenBoard = {
    positions,
    monthJiang: monthJiang.branch,
    monthJiangName: monthJiang.name,
    lessons,
    transmission,
    xunKong,
  };

  return {
    input,
    timestamp: Date.now(),
    board,
    dayGanZhi: cal.dayGanZhi,
    hourGanZhi: cal.hourGanZhi,
    hourBranch: cal.hourZhi,
    calculationLog: log,
  };
}
