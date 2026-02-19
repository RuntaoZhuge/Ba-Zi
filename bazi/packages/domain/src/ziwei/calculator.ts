/**
 * Zi Wei Dou Shu (紫微斗数) Calculator
 *
 * Core calculation engine for Purple Star Astrology chart construction.
 * Implements the traditional 12-step algorithm from input to complete chart.
 */

import { Solar, SolarUtil } from 'lunar-typescript';
import type {
  ZiweiInput,
  ZiweiResult,
  ZiweiChart,
  ZiweiPalace,
  ZiweiPalaceName,
  ZiweiMainStar,
  ZiweiStar,
  ZiweiDecadeLuck,
  SiHuaStar,
} from '../types.js';
import {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  PALACE_NAMES,
  ZIWEI_POSITION_TABLE,
  ZIWEI_SERIES_OFFSETS,
  TIANFU_FROM_ZIWEI,
  TIANFU_SERIES_OFFSETS,
  STAR_BRIGHTNESS_TABLE,
  SI_HUA_TABLE,
  SI_HUA_NAMES,
  MONTH_STEM_START,
  NAYIN_TABLE,
  NAYIN_TO_JU,
  getNaYinElement,
  LUCUN_TABLE,
  TIANKUI_TABLE,
  TIANYUE_TABLE,
  TIANMA_TABLE,
  MING_ZHU_TABLE,
  SHEN_ZHU_TABLE,
  getWenChangPosition,
  getWenQuPosition,
  getZuoFuPosition,
  getYouBiPosition,
  getQingYangPosition,
  getTuoLuoPosition,
  getHuoXingPosition,
  getLingXingPosition,
  getDiKongPosition,
  getDiJiePosition,
} from './data.js';

// === Helper: branch index from hour ===

function hourToBranchIndex(hour: number): number {
  if (hour === 23) return 0; // 子
  return Math.floor((hour + 1) / 2) % 12;
}

// === True Solar Time adjustment ===

function adjustHourForTrueSolarTime(
  year: number, month: number, day: number, hour: number, longitude: number,
): number {
  const centralMeridian = 120;
  const longitudeCorrection = (longitude - centralMeridian) * 4; // minutes
  const dayOfYear = SolarUtil.getDaysInYear(year, month, day);
  const B = (2 * Math.PI * (dayOfYear - 81)) / 365;
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  const totalMinutes = hour * 60 + Math.round(longitudeCorrection + eot);
  return Math.floor(((totalMinutes % 1440) + 1440) % 1440 / 60);
}

// === Step 1-2: Lunar conversion + year GanZhi ===

interface LunarInfo {
  year: number;
  month: number;
  day: number;
  isLeap: boolean;
  yearStemIndex: number;
  yearBranchIndex: number;
  yearStem: string;
  yearBranch: string;
  monthStem: string;
  monthBranch: string;
  dayStem: string;
  dayBranch: string;
  hourBranchIndex: number;
  hourBranch: string;
}

function getLunarInfo(input: ZiweiInput): LunarInfo {
  const solar = Solar.fromYmdHms(input.year, input.month, input.day, input.hour, 0, 0);
  const lunar = solar.getLunar();

  const yearGanZhi = lunar.getYearInGanZhiExact();
  const yearStem = yearGanZhi[0];
  const yearBranch = yearGanZhi[1];
  const yearStemIndex = HEAVENLY_STEMS.indexOf(yearStem as typeof HEAVENLY_STEMS[number]);
  const yearBranchIndex = EARTHLY_BRANCHES.indexOf(yearBranch as typeof EARTHLY_BRANCHES[number]);

  const monthGanZhi = lunar.getMonthInGanZhiExact();
  const dayGanZhi = lunar.getDayInGanZhiExact();

  // Use true solar time adjusted hour for branch calculation if enabled
  const effectiveHour = (input.useTrueSolarTime && input.longitude != null)
    ? adjustHourForTrueSolarTime(input.year, input.month, input.day, input.hour, input.longitude)
    : input.hour;

  const hourBranchIndex = hourToBranchIndex(effectiveHour);
  const hourBranch = EARTHLY_BRANCHES[hourBranchIndex];

  return {
    year: lunar.getYear(),
    month: Math.abs(lunar.getMonth()),
    day: lunar.getDay(),
    isLeap: lunar.getMonth() < 0,
    yearStemIndex,
    yearBranchIndex,
    yearStem,
    yearBranch,
    monthStem: monthGanZhi[0],
    monthBranch: monthGanZhi[1],
    dayStem: dayGanZhi[0],
    dayBranch: dayGanZhi[1],
    hourBranchIndex,
    hourBranch,
  };
}

// === Step 3: Ming Palace branch index ===

function getMingPalaceBranch(lunarMonth: number, hourBranchIndex: number): number {
  // 以寅月为起点(index 2)，顺数至生月，再逆数至生时
  return (2 + lunarMonth - 1 - hourBranchIndex + 24) % 12;
}

// === Step 4: Shen Palace branch index ===

function getShenPalaceBranch(lunarMonth: number, hourBranchIndex: number): number {
  return (2 + lunarMonth - 1 + hourBranchIndex) % 12;
}

// === Step 5: Palace stems + WuXing Ju ===

function getPalaceStem(mingBranch: number, yearStemIndex: number): number {
  // 五虎遁: year stem determines the stem of 寅(index 2)
  const yinStemIndex = MONTH_STEM_START[HEAVENLY_STEMS[yearStemIndex]];
  // From 寅 to mingBranch: offset = (mingBranch - 2 + 12) % 12
  const offset = (mingBranch - 2 + 12) % 12;
  return (yinStemIndex + offset) % 10;
}

function getWuxingJu(mingBranch: number, yearStemIndex: number): { name: string; number: number } {
  const stemIndex = getPalaceStem(mingBranch, yearStemIndex);
  const stem = HEAVENLY_STEMS[stemIndex];
  const branch = EARTHLY_BRANCHES[mingBranch];
  const ganZhi = `${stem}${branch}`;
  const nayin = NAYIN_TABLE[ganZhi];
  if (!nayin) {
    // Fallback: shouldn't happen with valid data
    return { name: '水二局', number: 2 };
  }
  const element = getNaYinElement(nayin);
  return NAYIN_TO_JU[element] || { name: '水二局', number: 2 };
}

// === Build all 12 palace stems ===

function buildPalaceStems(yearStemIndex: number): number[] {
  const yinStemIndex = MONTH_STEM_START[HEAVENLY_STEMS[yearStemIndex]];
  const stems: number[] = [];
  for (let i = 0; i < 12; i++) {
    // Branch i, offset from 寅(2)
    const offset = (i - 2 + 12) % 12;
    stems.push((yinStemIndex + offset) % 10);
  }
  return stems;
}

// === Step 6-8: Place main stars ===

function placeMainStars(
  lunarDay: number,
  juNumber: number,
): Map<number, ZiweiMainStar[]> {
  const starMap = new Map<number, ZiweiMainStar[]>();
  const addStar = (branch: number, star: ZiweiMainStar) => {
    const list = starMap.get(branch) || [];
    list.push(star);
    starMap.set(branch, list);
  };

  // Step 6: 紫微位置
  const juIndex = juNumber / 2 - 1; // 2→0, 3→0.5... we need integer index
  // juNumber: 2,3,4,5,6 → index: 0,1,2,3,4
  const juColIndex = [2, 3, 4, 5, 6].indexOf(juNumber);
  const effectiveDay = Math.min(lunarDay, 30);
  const ziweiPos = ZIWEI_POSITION_TABLE[effectiveDay]?.[juColIndex];
  if (ziweiPos == null) return starMap;

  addStar(ziweiPos, '紫微');

  // Step 7: 紫微星系 (逆行)
  for (const { star, offset } of ZIWEI_SERIES_OFFSETS) {
    const pos = (ziweiPos - offset + 12) % 12;
    addStar(pos, star);
  }

  // Step 8: 天府星系 (顺行)
  const tianfuPos = TIANFU_FROM_ZIWEI[ziweiPos];
  addStar(tianfuPos, '天府');

  for (const { star, offset } of TIANFU_SERIES_OFFSETS) {
    const pos = (tianfuPos + offset) % 12;
    addStar(pos, star);
  }

  return starMap;
}

// === Step 9: Place auxiliary stars ===

function placeAuxStars(
  yearStemIndex: number,
  yearBranchIndex: number,
  lunarMonth: number,
  hourBranchIndex: number,
): Map<number, string[]> {
  const starMap = new Map<number, string[]>();
  const addStar = (branch: number, star: string) => {
    const list = starMap.get(branch) || [];
    list.push(star);
    starMap.set(branch, list);
  };

  const yearStem = HEAVENLY_STEMS[yearStemIndex];

  // 文昌/文曲
  addStar(getWenChangPosition(hourBranchIndex), '文昌');
  addStar(getWenQuPosition(hourBranchIndex), '文曲');

  // 左辅/右弼
  addStar(getZuoFuPosition(lunarMonth), '左辅');
  addStar(getYouBiPosition(lunarMonth), '右弼');

  // 天魁/天钺
  addStar(TIANKUI_TABLE[yearStem], '天魁');
  addStar(TIANYUE_TABLE[yearStem], '天钺');

  // 禄存/擎羊/陀罗
  const lucunPos = LUCUN_TABLE[yearStem];
  addStar(lucunPos, '禄存');
  addStar(getQingYangPosition(lucunPos), '擎羊');
  addStar(getTuoLuoPosition(lucunPos), '陀罗');

  // 火星/铃星
  addStar(getHuoXingPosition(yearBranchIndex, hourBranchIndex), '火星');
  addStar(getLingXingPosition(yearBranchIndex, hourBranchIndex), '铃星');

  // 天马
  addStar(TIANMA_TABLE[yearBranchIndex], '天马');

  // 地空/地劫
  addStar(getDiKongPosition(hourBranchIndex), '地空');
  addStar(getDiJiePosition(hourBranchIndex), '地劫');

  return starMap;
}

// === Step 10: Four Transformations (四化) ===

function applySiHua(
  yearStem: string,
  palaces: ZiweiPalace[],
): void {
  const siHuaStars = SI_HUA_TABLE[yearStem];
  if (!siHuaStars) return;

  for (let i = 0; i < 4; i++) {
    const targetStar = siHuaStars[i];
    const huaName = SI_HUA_NAMES[i];
    // Find the star in palaces and annotate
    for (const palace of palaces) {
      for (const star of palace.stars) {
        if (star.name === targetStar && !star.siHua) {
          star.siHua = huaName;
          break;
        }
      }
    }
  }
}

// === Step 11: Star brightness ===

function applyBrightness(palaces: ZiweiPalace[]): void {
  for (const palace of palaces) {
    const branchIndex = EARTHLY_BRANCHES.indexOf(palace.branch as typeof EARTHLY_BRANCHES[number]);
    for (const star of palace.stars) {
      if (star.type === 'main') {
        const table = STAR_BRIGHTNESS_TABLE[star.name as ZiweiMainStar];
        if (table) {
          star.brightness = table[branchIndex] ?? undefined;
        }
      }
    }
  }
}

// === Step 12: Decade Luck (大运) ===

function calculateDecadeLucks(
  palaces: ZiweiPalace[],
  mingBranch: number,
  juNumber: number,
  yearStemIndex: number,
  yearBranchIndex: number,
  gender: 'male' | 'female',
): ZiweiDecadeLuck[] {
  const startAge = juNumber; // 起运年龄 = 五行局数
  // Direction: 阳男阴女顺行(+1), 阴男阳女逆行(-1)
  const yearYinYang = yearStemIndex % 2 === 0 ? 'yang' : 'yin';
  const forward = (yearYinYang === 'yang' && gender === 'male') ||
                  (yearYinYang === 'yin' && gender === 'female');
  const direction = forward ? 1 : -1;

  const lucks: ZiweiDecadeLuck[] = [];
  const palaceStems = buildPalaceStems(yearStemIndex);

  for (let i = 0; i < 12; i++) {
    const ageStart = startAge + i * 10;
    const ageEnd = ageStart + 9;
    const branchIndex = (mingBranch + direction * (i + 1) + 144) % 12;
    const stemIndex = palaceStems[branchIndex];
    const stem = HEAVENLY_STEMS[stemIndex];
    const branch = EARTHLY_BRANCHES[branchIndex];

    // Si Hua for this decade
    const decadeSiHua: { star: string; hua: SiHuaStar }[] = [];
    const siHuaStars = SI_HUA_TABLE[stem];
    if (siHuaStars) {
      for (let j = 0; j < 4; j++) {
        decadeSiHua.push({ star: siHuaStars[j], hua: SI_HUA_NAMES[j] });
      }
    }

    // Find palace name at this branch
    const palaceAtBranch = palaces.find(p => p.branch === branch);
    const palaceName = palaceAtBranch?.name || '命宫';

    lucks.push({
      ageRange: `${ageStart}-${ageEnd}`,
      palaceName: palaceName as ZiweiPalaceName,
      stem,
      branch,
      siHua: decadeSiHua,
    });
  }

  return lucks;
}

// === Main Calculator ===

export function calculateZiwei(input: ZiweiInput): ZiweiResult {
  const log: { step: string; detail: string }[] = [];

  // Step 1-2: Lunar conversion
  const lunar = getLunarInfo(input);
  log.push({
    step: '农历转换',
    detail: `${lunar.yearStem}${lunar.yearBranch}年 农历${lunar.month}月${lunar.day}日 ${lunar.hourBranch}时`,
  });

  // Step 3: Ming Palace
  const mingBranch = getMingPalaceBranch(lunar.month, lunar.hourBranchIndex);
  log.push({
    step: '安命宫',
    detail: `命宫在${EARTHLY_BRANCHES[mingBranch]}`,
  });

  // Step 4: Shen Palace
  const shenBranch = getShenPalaceBranch(lunar.month, lunar.hourBranchIndex);
  log.push({
    step: '安身宫',
    detail: `身宫在${EARTHLY_BRANCHES[shenBranch]}`,
  });

  // Step 5: WuXing Ju
  const wuxingJu = getWuxingJu(mingBranch, lunar.yearStemIndex);
  log.push({
    step: '定五行局',
    detail: wuxingJu.name,
  });

  // Assign palace names: starting from Ming Palace branch, going counterclockwise
  const palaceStems = buildPalaceStems(lunar.yearStemIndex);
  const palaces: ZiweiPalace[] = [];
  for (let i = 0; i < 12; i++) {
    const branchIndex = (mingBranch + i) % 12;
    palaces.push({
      name: PALACE_NAMES[i],
      branch: EARTHLY_BRANCHES[branchIndex],
      stem: HEAVENLY_STEMS[palaceStems[branchIndex]],
      stars: [],
    });
  }

  // Find which palace 身宫 is in
  const shenPalace = palaces.find(p => p.branch === EARTHLY_BRANCHES[shenBranch]);
  const shenPalaceName = shenPalace?.name || '命宫';

  // Step 6-8: Place main stars
  const mainStarMap = placeMainStars(lunar.day, wuxingJu.number);
  for (const palace of palaces) {
    const branchIndex = EARTHLY_BRANCHES.indexOf(palace.branch as typeof EARTHLY_BRANCHES[number]);
    const stars = mainStarMap.get(branchIndex) || [];
    for (const starName of stars) {
      palace.stars.push({ name: starName, type: 'main' });
    }
  }

  log.push({
    step: '安主星',
    detail: `紫微在${EARTHLY_BRANCHES[ZIWEI_POSITION_TABLE[Math.min(lunar.day, 30)]?.[([2, 3, 4, 5, 6].indexOf(wuxingJu.number))] ?? 0]}，共安14主星`,
  });

  // Step 9: Place auxiliary stars
  const auxStarMap = placeAuxStars(
    lunar.yearStemIndex,
    lunar.yearBranchIndex,
    lunar.month,
    lunar.hourBranchIndex,
  );
  for (const palace of palaces) {
    const branchIndex = EARTHLY_BRANCHES.indexOf(palace.branch as typeof EARTHLY_BRANCHES[number]);
    const stars = auxStarMap.get(branchIndex) || [];
    for (const starName of stars) {
      palace.stars.push({ name: starName as ZiweiMainStar, type: 'aux' });
    }
  }
  log.push({ step: '安辅星', detail: '文昌文曲左辅右弼天魁天钺禄存擎羊陀罗火铃天马地空地劫' });

  // Step 10: Four Transformations
  applySiHua(lunar.yearStem, palaces);
  const siHuaStars = SI_HUA_TABLE[lunar.yearStem];
  if (siHuaStars) {
    log.push({
      step: '定四化',
      detail: `${lunar.yearStem}干：${siHuaStars[0]}化禄 ${siHuaStars[1]}化权 ${siHuaStars[2]}化科 ${siHuaStars[3]}化忌`,
    });
  }

  // Step 11: Brightness
  applyBrightness(palaces);
  log.push({ step: '定亮度', detail: '14主星亮度已标注' });

  // Ming Zhu / Shen Zhu
  const mingZhu = MING_ZHU_TABLE[lunar.yearBranchIndex] || '贪狼';
  const shenZhu = SHEN_ZHU_TABLE[lunar.yearBranchIndex] || '天同';

  const chart: ZiweiChart = {
    palaces,
    mingPalace: '命宫',
    shenPalace: shenPalaceName as ZiweiPalaceName,
    mingZhu,
    shenZhu,
    wuxingJu: wuxingJu.name,
  };

  // Step 12: Decade Luck
  const decadeLucks = calculateDecadeLucks(
    palaces,
    mingBranch,
    wuxingJu.number,
    lunar.yearStemIndex,
    lunar.yearBranchIndex,
    input.gender,
  );
  log.push({
    step: '排大运',
    detail: `${wuxingJu.number}岁起运，${decadeLucks[0]?.ageRange} → ${decadeLucks[decadeLucks.length - 1]?.ageRange}`,
  });

  // Annotate decade luck ages on palaces
  for (const luck of decadeLucks) {
    const palace = palaces.find(p => p.branch === luck.branch);
    if (palace && !palace.decadeLuckAge) {
      palace.decadeLuckAge = luck.ageRange;
    }
  }

  return {
    input,
    timestamp: Date.now(),
    chart,
    decadeLucks,
    lunarInfo: {
      year: lunar.year,
      month: lunar.month,
      day: lunar.day,
      isLeap: lunar.isLeap,
      yearStem: lunar.yearStem,
      yearBranch: lunar.yearBranch,
      monthStem: lunar.monthStem,
      monthBranch: lunar.monthBranch,
      dayStem: lunar.dayStem,
      dayBranch: lunar.dayBranch,
      hourBranch: lunar.hourBranch,
    },
    calculationLog: log,
  };
}
