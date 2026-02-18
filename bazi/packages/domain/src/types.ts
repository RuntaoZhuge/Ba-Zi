/**
 * Ba-Zi Domain Types
 *
 * All core types for the Ba-Zi calculation engine.
 * This file has ZERO framework dependencies — it is pure TypeScript.
 */

// === Fundamental Chinese Calendar Types ===

export type HeavenlyStem =
  | '甲'
  | '乙'
  | '丙'
  | '丁'
  | '戊'
  | '己'
  | '庚'
  | '辛'
  | '壬'
  | '癸';

export type EarthlyBranch =
  | '子'
  | '丑'
  | '寅'
  | '卯'
  | '辰'
  | '巳'
  | '午'
  | '未'
  | '申'
  | '酉'
  | '戌'
  | '亥';

export type WuXing = '木' | '火' | '土' | '金' | '水';

export type YinYang = '阴' | '阳';

export type Gender = 'male' | 'female' | 'unknown';

export type CalendarType = 'solar' | 'lunar';

export type ZiHourMode = 'early' | 'late';

// === Input Types ===

export interface BirthInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: Gender;
  calendarType: CalendarType;
  isLeapMonth?: boolean;
  longitude?: number;
  useTrueSolarTime?: boolean;
  ziHourMode?: ZiHourMode;
  /** When true, the birth hour is unknown and the hour pillar will be omitted */
  hourUnknown?: boolean;
}

// === Pillar Types ===

export interface StemBranch {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  /** Full GanZhi string, e.g. "甲子" */
  ganZhi: string;
}

export interface Pillar {
  stemBranch: StemBranch;
  /** Hidden stems in the earthly branch */
  hiddenStems: HeavenlyStem[];
  /** NaYin five-element designation */
  naYin: string;
  /** Five element of the heavenly stem */
  stemWuXing: WuXing;
  /** Five element of the earthly branch */
  branchWuXing: WuXing;
  /** Yin-Yang of the stem */
  yinYang: YinYang;
  /** Twelve Life Stage (十二长生 / 地势) */
  diShi?: string;
  /** Xun cycle (旬) */
  xun?: string;
  /** Void branches in the Xun (旬空) */
  xunKong?: string;
}

export interface FourPillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  /** null when birth hour is unknown */
  hour: Pillar | null;
}

// === Ten Gods (十神) Types ===

export type ShiShenName =
  | '比肩'
  | '劫财'
  | '食神'
  | '伤官'
  | '偏财'
  | '正财'
  | '七杀'
  | '正官'
  | '偏印'
  | '正印';

export interface ShiShenPillar {
  /** Ten God of the heavenly stem */
  stem: ShiShenName | '日主';
  /** Ten Gods of the hidden stems in the earthly branch */
  branch: ShiShenName[];
}

export interface ShiShenAnalysis {
  year: ShiShenPillar;
  month: ShiShenPillar;
  day: ShiShenPillar;
  /** null when birth hour is unknown */
  hour: ShiShenPillar | null;
}

// === Spirit Deities (神煞) Types ===

export interface ShenShaResult {
  name: string;
  pillar: 'year' | 'month' | 'day' | 'hour';
  description?: string;
}

// === Fortune Cycle Types ===

export interface DaYunCycle {
  /** Calendar year when this cycle starts */
  startYear: number;
  /** Age when this cycle starts */
  startAge: number;
  /** Calendar year when this cycle ends */
  endYear: number;
  /** Age when this cycle ends */
  endAge: number;
  stemBranch: StemBranch;
}

export interface LiuNianFortune {
  year: number;
  age: number;
  stemBranch: StemBranch;
}

export interface LiuYueFortune {
  year: number;
  month: number;
  stemBranch: StemBranch;
}

export interface YunInfo {
  /** Gender used for fortune direction */
  gender: Gender;
  /** Age when DaYun starts */
  startAge: number;
  /** Years from birth to DaYun start */
  startYears: number;
  /** Months from birth to DaYun start */
  startMonths: number;
  /** Days from birth to DaYun start */
  startDays: number;
  /** Major fortune cycles */
  daYun: DaYunCycle[];
}

// === Observability Types ===

export interface CalculationStep {
  step: string;
  input: unknown;
  output: unknown;
  timestamp: number;
}

// === Palace Types (宫位) ===

export interface PalaceInfo {
  ganZhi: string;
  naYin: string;
}

// === Main Output Types ===

export interface BaZiChart {
  /** The birth input used for this calculation */
  input: BirthInput;
  /** The four pillars */
  fourPillars: FourPillars;
  /** The day master (日主) — the heavenly stem of the day pillar */
  dayMaster: HeavenlyStem;
  /** Five element distribution count */
  wuxingDistribution: Record<WuXing, number>;
  /** Ten Gods analysis */
  shishen: ShiShenAnalysis;
  /** Spirit Deities */
  shensha: ShenShaResult[];
  /** NaYin for each pillar */
  nayin: {
    year: string;
    month: string;
    day: string;
    /** null when birth hour is unknown */
    hour: string | null;
  };
  /** Destiny pattern classification */
  mingge: string;
  /** Destiny Palace (命宫) */
  mingGong?: PalaceInfo;
  /** Body Palace (身宫) */
  shenGong?: PalaceInfo;
  /** Fetal Origin (胎元) */
  taiYuan?: PalaceInfo;
  /** Fetal Breath (胎息) */
  taiXi?: PalaceInfo;
  /** Calculation log for observability */
  calculationLog: CalculationStep[];
}

export interface BaZiResult {
  chart: BaZiChart;
  yun: YunInfo;
  liuNian: LiuNianFortune[];
}

// === Mei Hua Yi Shu (梅花易数) Types ===

export type TrigramName = '乾' | '兑' | '离' | '震' | '巽' | '坎' | '艮' | '坤';

export type MeihuaMethod = 'time' | 'number';

export interface MeihuaTimeInput {
  method: 'time';
  year: number;
  month: number;
  day: number;
  hour: number;
  question?: string;
}

export interface MeihuaNumberInput {
  method: 'number';
  upperNumber: number;
  lowerNumber: number;
  question?: string;
}

export type MeihuaInput = MeihuaTimeInput | MeihuaNumberInput;

/** A single trigram (经卦 / 三爻卦) */
export interface Trigram {
  name: TrigramName;
  /** Xiantian number: 乾1 兑2 离3 震4 巽5 坎6 艮7 坤8 */
  number: number;
  /** Unicode symbol: ☰☱☲☳☴☵☶☷ */
  symbol: string;
  wuxing: WuXing;
  /** Natural image: 天泽火雷风水山地 */
  image: string;
  /** Three lines from bottom to top. true = yang (───), false = yin (─ ─) */
  lines: [boolean, boolean, boolean];
}

/** A full hexagram (别卦 / 六爻卦) */
export interface Hexagram {
  /** Hexagram name, e.g. "天火同人" */
  name: string;
  upper: Trigram;
  lower: Trigram;
  /** Six lines from bottom (index 0) to top (index 5) */
  lines: [boolean, boolean, boolean, boolean, boolean, boolean];
  /** King Wen sequence number (1-64) */
  kingWenNumber: number;
  /** Traditional hexagram judgement text (卦辞) */
  guaCi: string;
}

export type ChangingLinePosition = 1 | 2 | 3 | 4 | 5 | 6;

/** Five-element relationship between Ti and Yong */
export type WuxingRelation = '生' | '克' | '被生' | '被克' | '比和';

export interface TiYongAnalysis {
  /** Ti (体) trigram — the one WITHOUT the changing line */
  ti: Trigram;
  /** Yong (用) trigram — the one WITH the changing line */
  yong: Trigram;
  tiPosition: 'upper' | 'lower';
  relation: WuxingRelation;
  /** Human-readable summary */
  summary: string;
}

export interface MeihuaResult {
  input: MeihuaInput;
  timestamp: number;
  /** Original hexagram (本卦) */
  benGua: Hexagram;
  /** Mutual hexagram (互卦) */
  huGua: Hexagram;
  /** Changed hexagram (变卦) */
  bianGua: Hexagram;
  /** Position of the changing line (1-6 from bottom) */
  changingLine: ChangingLinePosition;
  /** Changing line text (动爻爻辞) */
  changingLineCi: string;
  tiYong: TiYongAnalysis;
  calculationLog: { step: string; detail: string }[];
}
