/**
 * BaZi Rule-Based Analysis Engine
 *
 * Extracts key interpretive data (用神、格局 etc.) from a BaZiResult
 * using traditional rules from《滴天髓》and《渊海子平》.
 * This structured context is then fed to the AI for personalized reading.
 */

import type {
  BaZiResult,
  WuXing,
  HeavenlyStem,
  ShiShenName,
} from '../types.js';

// === Exported Types ===

export interface AnalysisContext {
  strength: string;
  strengthFactors: string;
  yongShen: WuXing;
  xiShen: WuXing;
  jiShen: WuXing;
  geJu: string;
  wuxingSummary: string;
  shishenSummary: string;
  shenshaSummary: string;
  dayunSummary: string;
}

// === Constants ===

const STEM_WUXING: Record<string, WuXing> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
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

// 月支本气
const BRANCH_PRIMARY_STEM: Record<string, HeavenlyStem> = {
  '寅': '甲', '卯': '乙', '辰': '戊', '巳': '丙', '午': '丁',
  '未': '己', '申': '庚', '酉': '辛', '戌': '戊', '亥': '壬', '子': '癸', '丑': '己',
};

// 十神与日主五行的关系
const SHISHEN_ELEMENT: Record<ShiShenName, (dayEl: WuXing) => WuXing> = {
  '比肩': (d) => d,
  '劫财': (d) => d,
  '食神': (d) => GEN[d],
  '伤官': (d) => GEN[d],
  '偏财': (d) => CTL[d],
  '正财': (d) => CTL[d],
  '七杀': (d) => CTL_BY(d),
  '正官': (d) => CTL_BY(d),
  '偏印': (d) => GEN_BY[d],
  '正印': (d) => GEN_BY[d],
};

function CTL_BY(el: WuXing): WuXing {
  // What controls me
  const map: Record<WuXing, WuXing> = {
    '木': '金', '火': '水', '土': '木', '金': '火', '水': '土',
  };
  return map[el];
}

// === Main Export ===

export function extractAnalysisContext(result: BaZiResult): AnalysisContext {
  const { chart, yun } = result;
  const dayMaster = chart.dayMaster;
  const dayElement = STEM_WUXING[dayMaster];

  // 1. Parse strength from mingge string
  const { strength, strengthFactors } = parseStrength(chart.mingge);

  // 2. Determine 用神/喜神/忌神
  const { yongShen, xiShen, jiShen } = determineYongShen(dayElement, strength);

  // 3. Determine 格局
  const geJu = determineGeJu(dayMaster, chart);

  // 4. WuXing summary
  const wuxingSummary = buildWuxingSummary(chart.wuxingDistribution);

  // 5. ShiShen summary
  const shishenSummary = buildShiShenSummary(chart);

  // 6. ShenSha summary
  const shenshaSummary = buildShenshaSummary(chart.shensha);

  // 7. DaYun summary
  const dayunSummary = buildDayunSummary(yun, yongShen, dayElement);

  return {
    strength,
    strengthFactors,
    yongShen,
    xiShen,
    jiShen,
    geJu,
    wuxingSummary,
    shishenSummary,
    shenshaSummary,
    dayunSummary,
  };
}

// === Internal Functions ===

function parseStrength(mingge: string): { strength: string; strengthFactors: string } {
  const isStrong = mingge.includes('身强');
  const strength = isStrong ? '身强' : '身弱';

  // Extract factors from parentheses: "甲日主身强（得令、得地）"
  const match = mingge.match(/（(.+?)）/);
  const strengthFactors = match?.[1] ?? '';

  return { strength, strengthFactors };
}

function determineYongShen(
  dayElement: WuXing,
  strength: string,
): { yongShen: WuXing; xiShen: WuXing; jiShen: WuXing } {
  if (strength === '身强') {
    // 身强：泄秀为用，食伤泄、财星耗
    // 用神 = 食伤五行 (我生)
    // 喜神 = 财星五行 (我克)
    // 忌神 = 印星五行 (生我)
    return {
      yongShen: GEN[dayElement],        // 食伤
      xiShen: CTL[dayElement],           // 财星
      jiShen: GEN_BY[dayElement],        // 印星
    };
  } else {
    // 身弱：生扶为用，印星生、比劫助
    // 用神 = 印星五行 (生我)
    // 喜神 = 比劫五行 (同我)
    // 忌神 = 财星五行 (我克，耗身)
    return {
      yongShen: GEN_BY[dayElement],      // 印星
      xiShen: dayElement,                 // 比劫
      jiShen: CTL[dayElement],            // 财星
    };
  }
}

function determineGeJu(
  dayMaster: HeavenlyStem,
  chart: BaZiResult['chart'],
): string {
  const monthBranch = chart.fourPillars.month.stemBranch.branch;
  const primaryStem = BRANCH_PRIMARY_STEM[monthBranch];
  if (!primaryStem) return '杂气格';

  const dayElement = STEM_WUXING[dayMaster];
  const primaryElement = STEM_WUXING[primaryStem];

  // Determine the ten-god relationship of the month primary stem to day master
  const monthPrimaryShiShen = getShiShenRelation(dayElement, primaryElement, primaryStem, dayMaster);

  // Check if the month primary ten-god appears in any stem (透干)
  const stems = [
    chart.fourPillars.year.stemBranch.stem,
    chart.fourPillars.month.stemBranch.stem,
    chart.fourPillars.hour?.stemBranch.stem,
  ].filter(Boolean) as HeavenlyStem[];

  const transparent = stems.some((s) => {
    const sElement = STEM_WUXING[s];
    const sShiShen = getShiShenRelation(dayElement, sElement, s, dayMaster);
    return sShiShen === monthPrimaryShiShen;
  });

  const geJuName = monthPrimaryShiShen === '比肩' || monthPrimaryShiShen === '劫财'
    ? '建禄格'
    : `${monthPrimaryShiShen}格`;

  return transparent ? geJuName : `${geJuName}（不透）`;
}

function getShiShenRelation(
  dayElement: WuXing,
  targetElement: WuXing,
  targetStem: HeavenlyStem,
  dayMaster: HeavenlyStem,
): ShiShenName {
  const STEMS: HeavenlyStem[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const dayIdx = STEMS.indexOf(dayMaster);
  const targetIdx = STEMS.indexOf(targetStem);
  const samePolarity = dayIdx % 2 === targetIdx % 2;

  if (targetElement === dayElement) {
    return samePolarity ? '比肩' : '劫财';
  }
  if (targetElement === GEN[dayElement]) {
    return samePolarity ? '食神' : '伤官';
  }
  if (targetElement === CTL[dayElement]) {
    return samePolarity ? '偏财' : '正财';
  }
  if (targetElement === CTL_BY(dayElement)) {
    return samePolarity ? '七杀' : '正官';
  }
  if (targetElement === GEN_BY[dayElement]) {
    return samePolarity ? '偏印' : '正印';
  }
  return '比肩'; // fallback
}

function buildWuxingSummary(dist: Record<WuXing, number>): string {
  const elements: WuXing[] = ['木', '火', '土', '金', '水'];
  const parts = elements.map((e) => `${e}${dist[e]}`);

  const max = elements.reduce((a, b) => (dist[a] >= dist[b] ? a : b));
  const min = elements.reduce((a, b) => (dist[a] <= dist[b] ? a : b));

  return `${parts.join(' ')}，${max}旺${min}弱`;
}

function buildShiShenSummary(chart: BaZiResult['chart']): string {
  const parts: string[] = [];
  const { shishen } = chart;

  // Year stem
  if (shishen.year.stem !== '日主') {
    parts.push(`年干${shishen.year.stem}`);
  }
  // Month stem (most important)
  if (shishen.month.stem !== '日主') {
    parts.push(`月干${shishen.month.stem}`);
  }
  // Hour stem
  if (shishen.hour && shishen.hour.stem !== '日主') {
    parts.push(`时干${shishen.hour.stem}`);
  }

  // Count ten-god frequency
  const allShiShen: string[] = [];
  for (const p of [shishen.year, shishen.month, shishen.day, shishen.hour]) {
    if (!p) continue;
    if (p.stem !== '日主') allShiShen.push(p.stem);
    allShiShen.push(...p.branch);
  }

  const freq: Record<string, number> = {};
  for (const s of allShiShen) {
    freq[s] = (freq[s] || 0) + 1;
  }

  const dominant = Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([name, count]) => `${name}(${count})`)
    .join('、');

  if (dominant) {
    parts.push(`主要十神：${dominant}`);
  }

  return parts.join('，');
}

function buildShenshaSummary(shensha: BaZiResult['chart']['shensha']): string {
  if (shensha.length === 0) return '无明显神煞';

  const ji = shensha.filter((s) => s.description === '吉神').map((s) => s.name);
  const xiong = shensha.filter((s) => s.description === '凶煞').map((s) => s.name);

  const parts: string[] = [];
  if (ji.length > 0) parts.push(`吉神：${ji.join('、')}`);
  if (xiong.length > 0) parts.push(`凶煞：${xiong.join('、')}`);

  return parts.join('；');
}

function buildDayunSummary(
  yun: BaZiResult['yun'],
  yongShen: WuXing,
  dayElement: WuXing,
): string {
  if (yun.daYun.length === 0) return '大运信息不足';

  const parts: string[] = [];
  parts.push(`${yun.startAge}岁起运`);

  for (const dy of yun.daYun.slice(0, 8)) {
    const stemEl = STEM_WUXING[dy.stemBranch.stem];
    const branchEl = getBranchWuXing(dy.stemBranch.branch);

    const favorable = stemEl === yongShen || branchEl === yongShen;
    const unfavorable = stemEl === CTL_BY(dayElement) || branchEl === CTL_BY(dayElement);

    let label = '';
    if (favorable) label = '★';
    if (unfavorable) label = '▽';

    parts.push(
      `${dy.startAge}-${dy.endAge}岁 ${dy.stemBranch.ganZhi}${label}`,
    );
  }

  return parts.join('，');
}

function getBranchWuXing(branch: string): WuXing {
  const map: Record<string, WuXing> = {
    '寅': '木', '卯': '木', '辰': '土', '巳': '火', '午': '火',
    '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水', '子': '水', '丑': '土',
  };
  return map[branch] || '土';
}
