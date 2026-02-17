/**
 * Core Ba-Zi Calculator
 *
 * The main entry point for computing a complete BaZi chart from birth input.
 * Delegates to lunar-typescript via the calendar adapter.
 */

import {
  createSolar,
  getLunar,
  getEightChar,
  getYun,
  getDaYun,
  getLiuNian,
  parseStemBranch,
  getStemWuXing,
  getBranchWuXing,
  getStemYinYang,
  getHiddenStems,
  genderToCode,
  setEightCharSect,
  getYearDiShi,
  getMonthDiShi,
  getDayDiShi,
  getTimeDiShi,
  getYearXunKong,
  getMonthXunKong,
  getDayXunKong,
  getTimeXunKong,
  getMingGong,
  getShenGong,
  getTaiYuan,
  getTaiXi,
  getLibraryShiShen,
  getDayShenSha,
} from '../calendar/adapter.js';

import type {
  BirthInput,
  BaZiChart,
  BaZiResult,
  FourPillars,
  Pillar,
  ShiShenAnalysis,
  ShiShenPillar,
  ShiShenName,
  ShenShaResult,
  PalaceInfo,
  WuXing,
  HeavenlyStem,
  LiuNianFortune,
  YunInfo,
  CalculationStep,
} from '../types.js';

// === Ten Gods Derivation ===

/**
 * Derive the Ten God relationship between a reference stem (day master)
 * and another stem.
 */
function deriveShiShen(
  dayMaster: HeavenlyStem,
  targetStem: HeavenlyStem,
): ShiShenName | '日主' {
  if (dayMaster === targetStem) return '日主';

  const STEMS: HeavenlyStem[] = [
    '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸',
  ];

  const dayIdx = STEMS.indexOf(dayMaster);
  const targetIdx = STEMS.indexOf(targetStem);

  const dayYinYang = dayIdx % 2; // 0 = yang, 1 = yin
  const targetYinYang = targetIdx % 2;
  const samePolarity = dayYinYang === targetYinYang;

  const dayElement = Math.floor(dayIdx / 2); // 0=wood,1=fire,2=earth,3=metal,4=water
  const targetElement = Math.floor(targetIdx / 2);

  // Relationship based on five-element cycle
  // (target - day + 5) % 5 gives the generative distance
  const relation = (targetElement - dayElement + 5) % 5;

  switch (relation) {
    case 0: // Same element
      return samePolarity ? '比肩' : '劫财';
    case 1: // I generate (food/injury)
      return samePolarity ? '食神' : '伤官';
    case 2: // I overcome (wealth)
      return samePolarity ? '偏财' : '正财';
    case 3: // Overcomes me (officer/killer)
      return samePolarity ? '七杀' : '正官';
    case 4: // Generates me (seal)
      return samePolarity ? '偏印' : '正印';
    default:
      return '比肩';
  }
}

function buildShiShenPillar(
  dayMaster: HeavenlyStem,
  stem: HeavenlyStem,
  branch: string,
): ShiShenPillar {
  const stemShiShen = deriveShiShen(dayMaster, stem);
  const hiddenStems = getHiddenStems(branch);
  const branchShiShen = hiddenStems.map((hs) => {
    const result = deriveShiShen(dayMaster, hs);
    return result === '日主' ? '比肩' : result;
  }) as ShiShenName[];

  return { stem: stemShiShen, branch: branchShiShen };
}

// === Pillar Construction ===

function buildPillar(
  ganZhi: string,
  naYin: string,
  diShi?: string,
  xunKongInfo?: { xun: string; xunKong: string },
): Pillar {
  const stemBranch = parseStemBranch(ganZhi);
  return {
    stemBranch,
    hiddenStems: getHiddenStems(stemBranch.branch),
    naYin,
    stemWuXing: getStemWuXing(stemBranch.stem),
    branchWuXing: getBranchWuXing(stemBranch.branch),
    yinYang: getStemYinYang(stemBranch.stem),
    diShi,
    xun: xunKongInfo?.xun,
    xunKong: xunKongInfo?.xunKong,
  };
}

// === Five Element Distribution ===

function computeWuXingDistribution(
  fourPillars: FourPillars,
): Record<WuXing, number> {
  const dist: Record<WuXing, number> = {
    '木': 0,
    '火': 0,
    '土': 0,
    '金': 0,
    '水': 0,
  };

  const pillars: (Pillar | null)[] = [
    fourPillars.year,
    fourPillars.month,
    fourPillars.day,
    fourPillars.hour,
  ];

  for (const pillar of pillars) {
    if (!pillar) continue;
    // Count stem element
    dist[pillar.stemWuXing]++;
    // Count branch element
    dist[pillar.branchWuXing]++;
    // Count hidden stem elements (藏干)
    for (const hs of pillar.hiddenStems) {
      dist[getStemWuXing(hs)]++;
    }
  }

  return dist;
}

// === Main Calculator ===

/**
 * Calculate a complete BaZi chart from birth input.
 */
export function calculateBaZi(input: BirthInput): BaZiResult {
  const log: CalculationStep[] = [];
  const logStep = (step: string, inp: unknown, output: unknown) => {
    log.push({ step, input: inp, output, timestamp: Date.now() });
  };

  // Step 0: Validate date range
  if (input.year < 1900 || input.year > 2100) {
    throw new Error(
      `出生年份超出支持范围（1900-2100）：${input.year}` +
        ` / Birth year out of supported range (1900-2100): ${input.year}`,
    );
  }

  // Step 1: Create Solar date
  const solar = createSolar(input);
  logStep('createSolar', input, solar.toYmdHms());

  // Step 2: Convert to Lunar
  const lunar = getLunar(solar);
  logStep('getLunar', solar.toYmdHms(), lunar.toFullString());

  // Step 3: Get EightChar
  const eightChar = getEightChar(lunar);

  // Apply zi hour mode: 'early' = sect 1 (day does NOT change at 23:00)
  if (input.ziHourMode === 'early') {
    setEightCharSect(eightChar, 1);
  }
  logStep('setZiHourMode', { ziHourMode: input.ziHourMode ?? 'late' }, null);

  const yearGanZhi = eightChar.getYear();
  const monthGanZhi = eightChar.getMonth();
  const dayGanZhi = eightChar.getDay();
  const hourGanZhi = eightChar.getTime();
  logStep('getEightChar', null, {
    year: yearGanZhi,
    month: monthGanZhi,
    day: dayGanZhi,
    hour: hourGanZhi,
  });

  // Step 4: Get NaYin for each pillar
  const yearNaYin = eightChar.getYearNaYin();
  const monthNaYin = eightChar.getMonthNaYin();
  const dayNaYin = eightChar.getDayNaYin();
  const hourNaYin = eightChar.getTimeNaYin();
  logStep('getNaYin', null, {
    year: yearNaYin,
    month: monthNaYin,
    day: dayNaYin,
    hour: hourNaYin,
  });

  // Step 5: Build four pillars (with DiShi and XunKong)
  const hourUnknown = !!input.hourUnknown;
  const fourPillars: FourPillars = {
    year: buildPillar(yearGanZhi, yearNaYin, getYearDiShi(eightChar), getYearXunKong(eightChar)),
    month: buildPillar(monthGanZhi, monthNaYin, getMonthDiShi(eightChar), getMonthXunKong(eightChar)),
    day: buildPillar(dayGanZhi, dayNaYin, getDayDiShi(eightChar), getDayXunKong(eightChar)),
    hour: hourUnknown ? null : buildPillar(hourGanZhi, hourNaYin, getTimeDiShi(eightChar), getTimeXunKong(eightChar)),
  };
  const dayMaster = fourPillars.day.stemBranch.stem;
  logStep('buildFourPillars', null, { dayMaster, hourUnknown });

  // Step 6: Compute five-element distribution
  const wuxingDistribution = computeWuXingDistribution(fourPillars);
  logStep('computeWuXing', null, wuxingDistribution);

  // Step 7: Compute ten gods
  const shishen: ShiShenAnalysis = {
    year: buildShiShenPillar(
      dayMaster,
      fourPillars.year.stemBranch.stem,
      fourPillars.year.stemBranch.branch,
    ),
    month: buildShiShenPillar(
      dayMaster,
      fourPillars.month.stemBranch.stem,
      fourPillars.month.stemBranch.branch,
    ),
    day: buildShiShenPillar(
      dayMaster,
      fourPillars.day.stemBranch.stem,
      fourPillars.day.stemBranch.branch,
    ),
    hour: fourPillars.hour
      ? buildShiShenPillar(
          dayMaster,
          fourPillars.hour.stemBranch.stem,
          fourPillars.hour.stemBranch.branch,
        )
      : null,
  };
  logStep('computeShiShen', { dayMaster }, shishen);

  // Step 7b: Cross-verify ten gods with library
  const libraryShiShen = getLibraryShiShen(eightChar);
  logStep('crossVerifyShiShen', { ours: shishen, library: libraryShiShen }, null);

  // Step 8: Get ShenSha (spirit deities)
  const shensha = extractShenSha(lunar);
  logStep('extractShenSha', null, shensha);

  // Step 9: Determine MingGe (destiny pattern)
  const mingge = determineMingGe(dayMaster, wuxingDistribution, shishen, fourPillars);
  logStep('determineMingGe', { dayMaster }, mingge);

  // Step 10: Compute special palaces
  const mingGong: PalaceInfo = getMingGong(eightChar);
  const shenGong: PalaceInfo = getShenGong(eightChar);
  const taiYuan: PalaceInfo = getTaiYuan(eightChar);
  const taiXi: PalaceInfo = getTaiXi(eightChar);
  logStep('computePalaces', null, { mingGong, shenGong, taiYuan, taiXi });

  // Step 11: Build chart
  const chart: BaZiChart = {
    input,
    fourPillars,
    dayMaster,
    wuxingDistribution,
    shishen,
    shensha,
    nayin: {
      year: yearNaYin,
      month: monthNaYin,
      day: dayNaYin,
      hour: hourUnknown ? null : hourNaYin,
    },
    mingge,
    mingGong,
    shenGong,
    taiYuan,
    taiXi,
    calculationLog: log,
  };

  // Step 11: Calculate fortune cycles (Yun)
  const genderCode = genderToCode(input.gender);
  const yun = getYun(eightChar, genderCode);
  const daYunArr = getDaYun(yun);

  const yunInfo: YunInfo = {
    gender: input.gender,
    startAge: yun.getStartYear(),
    startYears: yun.getStartYear(),
    startMonths: yun.getStartMonth(),
    startDays: yun.getStartDay(),
    daYun: daYunArr
      .filter((dy) => dy.getGanZhi() !== '')
      .map((dy) => {
        const ganZhi = dy.getGanZhi();
        const sb = parseStemBranch(ganZhi);
        return {
          startYear: dy.getStartYear(),
          startAge: dy.getStartAge(),
          endYear: dy.getEndYear(),
          endAge: dy.getEndAge(),
          stemBranch: sb,
        };
      }),
  };
  logStep('computeYun', { gender: input.gender }, yunInfo);

  // Step 12: Calculate LiuNian (annual fortune) for first DaYun cycle
  const liuNianList: LiuNianFortune[] = [];
  for (const dy of daYunArr) {
    const lnArr = getLiuNian(dy);
    for (const ln of lnArr) {
      const ganZhi = ln.getGanZhi();
      const sb = parseStemBranch(ganZhi);
      liuNianList.push({
        year: ln.getYear(),
        age: ln.getAge(),
        stemBranch: sb,
      });
    }
  }
  logStep('computeLiuNian', null, { count: liuNianList.length });

  return { chart, yun: yunInfo, liuNian: liuNianList };
}

// === ShenSha Extraction ===

function extractShenSha(lunar: { getDayJiShen: () => string[]; getDayXiongSha: () => string[] }): ShenShaResult[] {
  const results: ShenShaResult[] = [];

  try {
    const { jiShen, xiongSha } = getDayShenSha(lunar as Parameters<typeof getDayShenSha>[0]);
    for (const name of jiShen) {
      results.push({ name, pillar: 'day', description: '吉神' });
    }
    for (const name of xiongSha) {
      results.push({ name, pillar: 'day', description: '凶煞' });
    }
  } catch {
    // Graceful fallback — some dates may not have ShenSha data
  }

  return results;
}

// === MingGe Determination ===
// Based on《滴天髓》"能知衰旺之真机，其于三命之奥，思过半矣"
// and《渊海子平》"日干为主，先看提纲"

// 地支藏干带权重（本气 1.0 / 中气 0.5 / 余气 0.3）
const HIDDEN_STEMS_WEIGHT: Record<string, { stem: string; w: number }[]> = {
  '寅': [{ stem: '甲', w: 1.0 }, { stem: '丙', w: 0.5 }, { stem: '戊', w: 0.3 }],
  '卯': [{ stem: '乙', w: 1.0 }],
  '辰': [{ stem: '戊', w: 1.0 }, { stem: '乙', w: 0.5 }, { stem: '癸', w: 0.3 }],
  '巳': [{ stem: '丙', w: 1.0 }, { stem: '庚', w: 0.5 }, { stem: '戊', w: 0.3 }],
  '午': [{ stem: '丁', w: 1.0 }, { stem: '己', w: 0.5 }],
  '未': [{ stem: '己', w: 1.0 }, { stem: '丁', w: 0.5 }, { stem: '乙', w: 0.3 }],
  '申': [{ stem: '庚', w: 1.0 }, { stem: '壬', w: 0.5 }, { stem: '戊', w: 0.3 }],
  '酉': [{ stem: '辛', w: 1.0 }],
  '戌': [{ stem: '戊', w: 1.0 }, { stem: '辛', w: 0.5 }, { stem: '丁', w: 0.3 }],
  '亥': [{ stem: '壬', w: 1.0 }, { stem: '甲', w: 0.5 }],
  '子': [{ stem: '癸', w: 1.0 }],
  '丑': [{ stem: '己', w: 1.0 }, { stem: '癸', w: 0.5 }, { stem: '辛', w: 0.3 }],
};

// 地支对应的季节五行
const BRANCH_SEASON: Record<string, WuXing> = {
  '寅': '木', '卯': '木', '巳': '火', '午': '火',
  '辰': '土', '未': '土', '戌': '土', '丑': '土',
  '申': '金', '酉': '金', '亥': '水', '子': '水',
};

// 五行相生：X 生 GEN[X]
const GEN: Record<WuXing, WuXing> = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
};

// 印星：GEN_BY[X] 生 X
const GEN_BY: Record<WuXing, WuXing> = {
  '木': '水', '火': '木', '土': '火', '金': '土', '水': '金',
};

// 五行相克：X 克 CTL[X]
const CTL: Record<WuXing, WuXing> = {
  '木': '土', '火': '金', '土': '水', '金': '木', '水': '火',
};

function determineMingGe(
  dayMaster: HeavenlyStem,
  wuxing: Record<WuXing, number>,
  _shishen: ShiShenAnalysis,
  fourPillars?: FourPillars,
): string {
  const dayElement = getStemWuXing(dayMaster);

  // Fallback: simple ratio when fourPillars unavailable
  if (!fourPillars) {
    const support = wuxing[dayElement] + wuxing[GEN_BY[dayElement]];
    const total = Object.values(wuxing).reduce((a, b) => a + b, 0);
    return total > 0 && support / total >= 0.4
      ? `${dayMaster}日主身强`
      : `${dayMaster}日主身弱`;
  }

  // ─── 1. 得令：旺相休囚死 ───
  // 《渊海子平》: 月令提纲，占全局之力约五成
  //   旺：日主与月令同五行（如木日主生于寅卯月）
  //   相：月令所生即日主（如木月生火日主）
  //   休：日主生月令（如水日主生木月，泄气）
  //   囚：日主克月令（如金日主克木月，耗力）
  //   死：月令克日主（如金月克木日主）
  const monthBranch = fourPillars.month.stemBranch.branch;
  const season = BRANCH_SEASON[monthBranch];

  let deLing: number;
  if (dayElement === season) {
    deLing = 50;  // 旺
  } else if (GEN[season] === dayElement) {
    deLing = 30;  // 相
  } else if (GEN[dayElement] === season) {
    deLing = 10;  // 休
  } else if (CTL[dayElement] === season) {
    deLing = 5;   // 囚
  } else {
    deLing = 0;   // 死
  }

  // ─── 2. 得地：通根 ───
  // 《滴天髓》: 藏干通根为日主立足之本
  // 本气根力最重，中气次之，余气最轻
  // 月支权重 ×1.5（提纲之力），日支 ×1.2（近身有力）
  let deDi = 0;
  const PILLAR_FACTOR = [1.0, 1.5, 1.2, 1.0]; // 年/月/日/时
  const pillarArr = [fourPillars.year, fourPillars.month, fourPillars.day, fourPillars.hour];

  for (let i = 0; i < 4; i++) {
    const p = pillarArr[i];
    if (!p) continue;
    const branch = p.stemBranch.branch;
    const entries = HIDDEN_STEMS_WEIGHT[branch];
    if (!entries) continue;
    for (const { stem, w } of entries) {
      const el = getStemWuXing(stem as HeavenlyStem);
      if (el === dayElement) {
        deDi += 8 * w * PILLAR_FACTOR[i];   // 比劫通根
      } else if (el === GEN_BY[dayElement]) {
        deDi += 5 * w * PILLAR_FACTOR[i];   // 印星通根
      }
    }
  }

  // ─── 3. 得助：天干比劫与印星 ───
  // 年干、月干、时干中的同类与生我之干
  let deZhu = 0;
  const otherStems = [
    fourPillars.year?.stemBranch.stem,
    fourPillars.month?.stemBranch.stem,
    // 日干本身不计入
    fourPillars.hour?.stemBranch.stem,
  ];
  for (const s of otherStems) {
    if (!s) continue;
    const el = getStemWuXing(s);
    if (el === dayElement) {
      deZhu += 8;  // 比劫帮身
    } else if (el === GEN_BY[dayElement]) {
      deZhu += 6;  // 印星生身
    }
  }

  // ─── 综合判定 ───
  const total = deLing + deDi + deZhu;

  const factors: string[] = [];
  if (deLing >= 30) factors.push('得令');
  if (deDi >= 10) factors.push('得地');
  if (deZhu >= 6) factors.push('得助');

  if (total >= 50) {
    return `${dayMaster}日主身强（${factors.join('、') || '综合偏强'}）`;
  }

  const weakFactors: string[] = [];
  if (deLing < 30) weakFactors.push('不得令');
  if (deDi < 10) weakFactors.push('不得地');
  if (deZhu < 6) weakFactors.push('不得助');
  return `${dayMaster}日主身弱（${weakFactors.join('、') || '综合偏弱'}）`;
}
