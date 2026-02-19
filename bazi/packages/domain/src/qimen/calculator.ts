/**
 * Qi Men Dun Jia (奇门遁甲) Calculator
 *
 * Hourly Yang-Plate Rotating Qi Men (时家阳盘转盘奇门)
 * Zhang Zhichun (张志春) school — 拆补法 for yuan determination.
 */

import { Solar, LunarUtil, SolarUtil } from 'lunar-typescript';
import type {
  QimenInput,
  QimenResult,
  QimenBoard,
  QimenPalace,
  QimenDunType,
  QimenYuan,
  QimenJuNumber,
  QimenStar,
  QimenGate,
  QimenDeity,
  QimenElement,
  PalaceNumber,
} from '../types.js';
import {
  PALACE_META,
  STARS_BY_PALACE,
  GATES_BY_PALACE,
  CLOCKWISE,
  COUNTERCLOCKWISE,
  JIEQI_JU_TABLE,
  YANG_DUN_JIEQI,
  JIA_HIDDEN_YI,
  SANQI_LIUYI,
  YANG_DEITIES,
  YIN_DEITIES,
  stemToElement,
} from './data.js';

// === Helper: effective palace (中宫寄坤) ===

function effective(p: PalaceNumber): PalaceNumber {
  return p === 5 ? 2 : p;
}

// === Step 1: Determine Dun Type + Ju Number (拆补法) ===

interface JuInfo {
  dunType: QimenDunType;
  juNumber: QimenJuNumber;
  yuan: QimenYuan;
  jieQi: string;
}

function determineJu(solar: Solar): JuInfo {
  const lunar = solar.getLunar();

  // Get the most recent solar term (both 节 and 气)
  const prevJieQi = lunar.getPrevJieQi(true);
  const jieQiName = prevJieQi.getName();
  const jieQiSolar = prevJieQi.getSolar();

  // Calculate days since this solar term
  const daysSince = solar.subtract(jieQiSolar);

  // Determine yuan: 0-4 = 上元, 5-9 = 中元, 10-14 = 下元
  let yuanIndex: number;
  if (daysSince < 5) yuanIndex = 0;
  else if (daysSince < 10) yuanIndex = 1;
  else yuanIndex = 2;

  const yuan: QimenYuan = (['上元', '中元', '下元'] as const)[yuanIndex];

  // Determine dun type
  const dunType: QimenDunType = YANG_DUN_JIEQI.has(jieQiName) ? '阳遁' : '阴遁';

  // Look up ju number
  const juTable = JIEQI_JU_TABLE[jieQiName];
  if (!juTable) {
    // Fallback: shouldn't happen with valid dates
    return { dunType: '阳遁', juNumber: 1, yuan: '上元', jieQi: jieQiName };
  }
  const juNumber = juTable[yuanIndex] as QimenJuNumber;

  return { dunType, juNumber, yuan, jieQi: jieQiName };
}

// === Step 2: Layout Earth Plate (地盘) ===

function layoutEarthPlate(
  juNumber: QimenJuNumber,
  dunType: QimenDunType,
): Map<PalaceNumber, QimenElement> {
  const plate = new Map<PalaceNumber, QimenElement>();

  // Yang Dun: place in ascending order 1→2→3→4→5→6→7→8→9
  // Yin Dun: place in descending order 9→8→7→6→5→4→3→2→1
  for (let i = 0; i < 9; i++) {
    let palaceNum: PalaceNumber;
    if (dunType === '阳遁') {
      palaceNum = (((juNumber - 1 + i) % 9) + 1) as PalaceNumber;
    } else {
      // Yin Dun: start at juNumber, go descending (wrapping 1→9)
      palaceNum = (((juNumber - 1 - i + 9) % 9) + 1) as PalaceNumber;
    }
    plate.set(palaceNum, SANQI_LIUYI[i]);
  }

  return plate;
}

// === Step 3: Determine Hour's Xun ===

interface XunInfo {
  xunShou: string;     // e.g. "甲子"
  xunShouYi: QimenElement; // e.g. "戊"
  xunKong: string;     // e.g. "戌亥"
}

function getHourXun(hourGanZhi: string): XunInfo {
  const xunShou = LunarUtil.getXun(hourGanZhi);
  const xunShouYi = JIA_HIDDEN_YI[xunShou];
  const xunKong = LunarUtil.getXunKong(hourGanZhi);
  return { xunShou, xunShouYi, xunKong };
}

// === Step 4: Determine Zhi Fu / Zhi Shi ===

function findPalaceOfElement(
  earthPlate: Map<PalaceNumber, QimenElement>,
  element: QimenElement,
): PalaceNumber {
  for (const [palace, e] of earthPlate) {
    if (e === element) return effective(palace);
  }
  return 1; // fallback
}

// === Step 5-6: Rotate Plate (转盘) ===

function rotatePlateItems<T>(
  originalPalace: PalaceNumber,
  targetPalace: PalaceNumber,
  items: Map<PalaceNumber, T>,
  order: PalaceNumber[],
): Map<PalaceNumber, T> {
  const fromIdx = order.indexOf(effective(originalPalace));
  const toIdx = order.indexOf(effective(targetPalace));
  if (fromIdx === -1 || toIdx === -1) return items;

  const offset = (toIdx - fromIdx + order.length) % order.length;
  const result = new Map<PalaceNumber, T>();

  for (const [palace, item] of items) {
    const ep = effective(palace);
    const idx = order.indexOf(ep);
    if (idx === -1) {
      result.set(palace, item);
      continue;
    }
    const newIdx = (idx + offset) % order.length;
    result.set(order[newIdx], item);
  }

  return result;
}

// === Step 7: Place Deities (八神) ===

function placeDeities(
  zhiFuPalace: PalaceNumber,
  dunType: QimenDunType,
): Map<PalaceNumber, QimenDeity> {
  const deities = dunType === '阳遁' ? YANG_DEITIES : YIN_DEITIES;
  const order = dunType === '阳遁' ? CLOCKWISE : COUNTERCLOCKWISE;
  const result = new Map<PalaceNumber, QimenDeity>();

  const startIdx = order.indexOf(effective(zhiFuPalace));
  if (startIdx === -1) return result;

  for (let i = 0; i < 8; i++) {
    const palaceIdx = (startIdx + i) % order.length;
    result.set(order[palaceIdx], deities[i]);
  }

  return result;
}

// === Step 8: Detect Patterns (格局) ===

function detectPatterns(palace: QimenPalace): string[] {
  const patterns: string[] = [];
  const h = palace.heavenStem;
  const e = palace.earthStem;

  // 伏吟: heaven stem == earth stem
  if (h === e) patterns.push('伏吟');

  // 反吟: stems in opposing positions (simplified check via Luo Shu opposition)
  const CHONG_PAIRS: Record<string, string> = {
    '戊': '壬', '壬': '戊', '己': '癸', '癸': '己',
    '庚': '丁', '丁': '庚', '辛': '丙', '丙': '辛',
  };
  if (CHONG_PAIRS[h] === e) patterns.push('反吟');

  // 九遁 checks
  // 天遁: 天盘丙+地盘戊+生门
  if (h === '丙' && e === '戊' && palace.gate === '生门') patterns.push('天遁');
  // 地遁: 天盘乙+地盘己+开门
  if (h === '乙' && e === '己' && palace.gate === '开门') patterns.push('地遁');
  // 人遁: 天盘丁+地盘癸+休门 (or 太阴)
  if (h === '丁' && e === '癸' && palace.gate === '休门') patterns.push('人遁');
  // 神遁: 天盘丙+地盘戊+九地
  if (h === '丙' && e === '戊' && palace.deity === '九地') patterns.push('神遁');
  // 鬼遁: 天盘丁+地盘癸+九天
  if (h === '丁' && e === '癸' && palace.deity === '九天') patterns.push('鬼遁');

  // 奇仪组合 (notable combinations)
  // 乙+庚 = 日奇入墓 or 庚+乙 (depends on context)
  if (h === '庚' && e === '庚') patterns.push('庚格');
  if ((h === '庚' || e === '庚') && (h === '壬' || e === '壬') && h !== e) {
    patterns.push('上格');
  }

  return patterns;
}

// === True Solar Time adjustment ===

function adjustForTrueSolarTime(input: QimenInput): { hour: number; minute: number } {
  if (!input.useTrueSolarTime || input.longitude == null) {
    return { hour: input.hour, minute: input.minute };
  }
  const centralMeridian = 120;
  const longitudeCorrection = (input.longitude - centralMeridian) * 4;
  const dayOfYear = SolarUtil.getDaysInYear(input.year, input.month, input.day);
  const B = (2 * Math.PI * (dayOfYear - 81)) / 365;
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  let totalMinutes = input.hour * 60 + input.minute + Math.round(longitudeCorrection + eot);
  totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  return { hour: Math.floor(totalMinutes / 60), minute: totalMinutes % 60 };
}

// === Main Calculator ===

export function calculateQimen(input: QimenInput): QimenResult {
  const log: { step: string; detail: string }[] = [];

  // Step 0: Time setup
  const adj = adjustForTrueSolarTime(input);
  const solar = Solar.fromYmdHms(input.year, input.month, input.day, adj.hour, adj.minute, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  const dayGanZhi = eightChar.getDay();
  const hourGanZhi = eightChar.getTime();

  log.push({ step: '时间', detail: `${dayGanZhi}日 ${hourGanZhi}时` });

  // Step 1: Determine Ju
  const juInfo = determineJu(solar);

  // Southern hemisphere: reverse yin/yang dun
  const isSouthernHemisphere = input.latitude != null && input.latitude < 0;
  if (isSouthernHemisphere) {
    juInfo.dunType = juInfo.dunType === '阳遁' ? '阴遁' : '阳遁';
  }

  log.push({
    step: '定局',
    detail: `${juInfo.jieQi} ${juInfo.yuan} ${juInfo.dunType}${juInfo.juNumber}局${isSouthernHemisphere ? ' (南半球反转)' : ''}`,
  });

  // Step 2: Earth Plate
  const earthPlate = layoutEarthPlate(juInfo.juNumber, juInfo.dunType);
  const earthPalaceStr = Array.from({ length: 9 }, (_, i) => {
    const p = (i + 1) as PalaceNumber;
    return `${p}宫=${earthPlate.get(p) || '?'}`;
  }).join(' ');
  log.push({ step: '地盘', detail: earthPalaceStr });

  // Step 3: Hour Xun
  const xunInfo = getHourXun(hourGanZhi);
  log.push({
    step: '旬首',
    detail: `${xunInfo.xunShou}(${xunInfo.xunShouYi}) 空亡:${xunInfo.xunKong}`,
  });

  // Step 4: Zhi Fu / Zhi Shi
  const xunYiPalace = findPalaceOfElement(earthPlate, xunInfo.xunShouYi);
  const zhiFuStar = PALACE_META[xunYiPalace].defaultStar;
  const zhiShiGate = PALACE_META[xunYiPalace].defaultGate;
  log.push({
    step: '值符值使',
    detail: `值符=${zhiFuStar}(${xunYiPalace}宫) 值使=${zhiShiGate}`,
  });

  // Step 5: Determine hour stem's element and its earth-plate palace
  const hourStem = hourGanZhi[0];
  let hourElement: QimenElement;
  if (hourStem === '甲') {
    // 甲 uses the xunShou's hidden yi
    hourElement = xunInfo.xunShouYi;
  } else {
    hourElement = stemToElement(hourStem) || '戊';
  }
  const hourStemPalace = findPalaceOfElement(earthPlate, hourElement);

  // Build default star map (palace → star)
  const defaultStarMap = new Map<PalaceNumber, QimenStar>();
  for (let i = 0; i < 9; i++) {
    defaultStarMap.set((i + 1) as PalaceNumber, STARS_BY_PALACE[i]);
  }

  // Build default gate map (palace → gate), skip palace 5
  const defaultGateMap = new Map<PalaceNumber, QimenGate>();
  for (let i = 0; i < 9; i++) {
    const g = GATES_BY_PALACE[i];
    if (g) defaultGateMap.set((i + 1) as PalaceNumber, g);
  }

  // Rotate stars: zhiFu star moves from xunYiPalace to hourStemPalace
  const rotatedStars = rotatePlateItems(
    xunYiPalace, hourStemPalace, defaultStarMap, CLOCKWISE,
  );
  // 天禽(5) follows 天芮(2): find where 天芮 went
  // Palace 5 star goes wherever palace 2 star goes — already handled by effective()

  log.push({
    step: '天盘',
    detail: `${zhiFuStar}→${hourStemPalace}宫(${hourElement})`,
  });

  // Rotate gates: zhiShi gate moves from xunYiPalace to hourStemPalace
  const rotatedGates = rotatePlateItems(
    xunYiPalace, hourStemPalace, defaultGateMap, CLOCKWISE,
  );
  log.push({
    step: '门盘',
    detail: `${zhiShiGate}→${hourStemPalace}宫`,
  });

  // Step 7: Deities
  const deities = placeDeities(hourStemPalace, juInfo.dunType);
  log.push({
    step: '八神',
    detail: `值符神在${hourStemPalace}宫 ${juInfo.dunType === '阳遁' ? '顺' : '逆'}布`,
  });

  // Build heaven plate stems: rotate earth plate elements
  // Heaven plate = rotate the earth plate elements by the same offset
  const heavenPlate = rotatePlateItems(
    xunYiPalace, hourStemPalace,
    earthPlate, CLOCKWISE,
  );

  // Xun Kong branches
  const kongBranches = xunInfo.xunKong; // e.g. "戌亥"

  // Southern hemisphere: swap N↔S in direction labels
  const DIRECTION_SWAP: Record<string, string> = {
    '北': '南', '南': '北',
    '东北': '东南', '东南': '东北',
    '西北': '西南', '西南': '西北',
    '东': '东', '西': '西', '中': '中',
  };

  // Assemble 9 palaces
  const palaces: QimenPalace[] = [];
  for (let i = 1; i <= 9; i++) {
    const p = i as PalaceNumber;
    const meta = PALACE_META[p];
    const ep = effective(p);

    const earthStem = earthPlate.get(p) || earthPlate.get(ep) || '戊';
    const heavenStem = heavenPlate.get(ep) || earthStem;
    const star = rotatedStars.get(ep) || meta.defaultStar;
    const gate = rotatedGates.get(ep) || meta.defaultGate;
    const deity = deities.get(ep) || '值符';

    // Check if earth stem's hidden branch is in kong
    const isEmpty = false; // Simplified: xun kong applies to branches, not directly to palace stems

    const direction = isSouthernHemisphere
      ? (DIRECTION_SWAP[meta.direction] || meta.direction)
      : meta.direction;

    const palace: QimenPalace = {
      palaceNumber: p,
      trigram: meta.trigram,
      direction,
      earthStem: earthStem as QimenElement,
      heavenStem: heavenStem as QimenElement,
      star,
      gate,
      deity,
      isEmpty,
      patterns: [],
    };

    palace.patterns = detectPatterns(palace);
    palaces.push(palace);
  }

  log.push({ step: '格局', detail: palaces.flatMap(p => p.patterns.map(pat => `${p.palaceNumber}宫${pat}`)).join(' ') || '无特殊格局' });

  const board: QimenBoard = {
    palaces,
    dunType: juInfo.dunType,
    juNumber: juInfo.juNumber,
    yuan: juInfo.yuan,
    jieQi: juInfo.jieQi,
    zhiFuStar,
    zhiShiGate,
    xunShou: xunInfo.xunShou,
    xunShouYi: xunInfo.xunShouYi,
    xunKong: xunInfo.xunKong,
  };

  return {
    input,
    timestamp: Date.now(),
    board,
    dayGanZhi,
    hourGanZhi,
    calculationLog: log,
  };
}
