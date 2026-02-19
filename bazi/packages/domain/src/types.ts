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

// === Zi Wei Dou Shu (紫微斗数) Types ===

export type ZiweiPalaceName =
  | '命宫' | '兄弟宫' | '夫妻宫' | '子女宫'
  | '财帛宫' | '疾厄宫' | '迁移宫' | '交友宫'
  | '官禄宫' | '田宅宫' | '福德宫' | '父母宫';

export type ZiweiMainStar =
  | '紫微' | '天机' | '太阳' | '武曲' | '天同' | '廉贞'
  | '天府' | '太阴' | '贪狼' | '巨门' | '天相' | '天梁' | '七杀' | '破军';

export type ZiweiAuxStar =
  | '文昌' | '文曲' | '左辅' | '右弼'
  | '天魁' | '天钺' | '禄存' | '擎羊' | '陀罗'
  | '火星' | '铃星' | '天马' | '地空' | '地劫';

export type StarBrightness = '庙' | '旺' | '得' | '利' | '平' | '不' | '陷';

export type SiHuaStar = '化禄' | '化权' | '化科' | '化忌';

export interface ZiweiStar {
  name: ZiweiMainStar | ZiweiAuxStar;
  type: 'main' | 'aux';
  brightness?: StarBrightness;
  siHua?: SiHuaStar;
}

export interface ZiweiPalace {
  name: ZiweiPalaceName;
  branch: string;
  stem: string;
  stars: ZiweiStar[];
  decadeLuckAge?: string;
}

export interface ZiweiDecadeLuck {
  ageRange: string;
  palaceName: ZiweiPalaceName;
  stem: string;
  branch: string;
  siHua: { star: string; hua: SiHuaStar }[];
}

export interface ZiweiChart {
  palaces: ZiweiPalace[];
  mingPalace: ZiweiPalaceName;
  shenPalace: ZiweiPalaceName;
  mingZhu: ZiweiMainStar;
  shenZhu: ZiweiMainStar;
  wuxingJu: string;
}

export interface ZiweiInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  gender: 'male' | 'female';
  name?: string;
  longitude?: number;
  useTrueSolarTime?: boolean;
}

export interface ZiweiResult {
  input: ZiweiInput;
  timestamp: number;
  chart: ZiweiChart;
  decadeLucks: ZiweiDecadeLuck[];
  lunarInfo: {
    year: number;
    month: number;
    day: number;
    isLeap: boolean;
    yearStem: string;
    yearBranch: string;
    monthStem: string;
    monthBranch: string;
    dayStem: string;
    dayBranch: string;
    hourBranch: string;
  };
  calculationLog: { step: string; detail: string }[];
}

// === Liu Yao Na Jia (六爻纳甲) Types ===

/** Coin throw value: 6=老阴, 7=少阳, 8=少阴, 9=老阳 */
export type YaoValue = 6 | 7 | 8 | 9;

export type SixRelation = '父母' | '兄弟' | '子孙' | '妻财' | '官鬼';

export type SixSpirit = '青龙' | '朱雀' | '勾陈' | '螣蛇' | '白虎' | '玄武';

export interface LiuyaoLine {
  position: number;         // 1-6 (初爻到上爻)
  value: YaoValue;
  isYang: boolean;          // 阳爻(7/9) or 阴爻(6/8)
  isMoving: boolean;        // 动爻(6/9)
  branch: string;           // 纳甲地支
  stem: string;             // 纳甲天干
  element: WuXing;          // 五行
  relation: SixRelation;    // 六亲
  spirit: SixSpirit;        // 六神
  isShiYao: boolean;        // 世爻
  isYingYao: boolean;       // 应爻
  changedBranch?: string;   // 变爻后的地支
  changedElement?: WuXing;  // 变爻后的五行
  changedRelation?: SixRelation; // 变爻后的六亲
}

export interface LiuyaoHexagram {
  name: string;
  palace: TrigramName;
  palaceElement: WuXing;
  upperTrigram: TrigramName;
  lowerTrigram: TrigramName;
  lines: LiuyaoLine[];
  shiPosition: number;      // 世爻位置 (1-6)
  yingPosition: number;     // 应爻位置 (1-6)
}

export interface LiuyaoHiddenGod {
  position: number;
  branch: string;
  element: WuXing;
  relation: SixRelation;
}

export type LiuyaoMethod = 'coin' | 'random' | 'manual';

export interface LiuyaoInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  question?: string;
  method: LiuyaoMethod;
  manualLines?: YaoValue[];  // 手动输入时的6爻值 (bottom→top)
}

export interface LiuyaoResult {
  input: LiuyaoInput;
  timestamp: number;
  dayGanZhi: string;
  monthBranch: string;
  originalHex: LiuyaoHexagram;
  changedHex: LiuyaoHexagram | null;
  movingLines: number[];
  hiddenGods: LiuyaoHiddenGod[];
  xunKong: string;
  calculationLog: { step: string; detail: string }[];
}

// === Qi Men Dun Jia (奇门遁甲) Types ===

export type QimenDunType = '阳遁' | '阴遁';
export type QimenYuan = '上元' | '中元' | '下元';
export type QimenJuNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type PalaceNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type QimenStar =
  | '天蓬' | '天芮' | '天冲' | '天辅' | '天禽'
  | '天心' | '天柱' | '天任' | '天英';

export type QimenGate =
  | '休门' | '死门' | '伤门' | '杜门'
  | '开门' | '惊门' | '生门' | '景门';

export type QimenDeity =
  | '值符' | '螣蛇' | '太阴' | '六合'
  | '白虎' | '玄武' | '九地' | '九天'
  | '勾陈' | '朱雀';

export type QimenElement = '戊' | '己' | '庚' | '辛' | '壬' | '癸' | '丁' | '丙' | '乙';

export interface QimenPalace {
  palaceNumber: PalaceNumber;
  trigram: string;
  direction: string;
  earthStem: QimenElement;
  heavenStem: QimenElement;
  star: QimenStar;
  gate: QimenGate;
  deity: QimenDeity;
  isEmpty: boolean;
  patterns: string[];
}

export interface QimenBoard {
  palaces: QimenPalace[];
  dunType: QimenDunType;
  juNumber: QimenJuNumber;
  yuan: QimenYuan;
  jieQi: string;
  zhiFuStar: QimenStar;
  zhiShiGate: QimenGate;
  xunShou: string;
  xunShouYi: QimenElement;
  xunKong: string;
}

export interface QimenInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  question?: string;
  useTrueSolarTime?: boolean;
  longitude?: number;
  /** Latitude — when negative (southern hemisphere), yin/yang dun is reversed and N/S directions are swapped */
  latitude?: number;
}

export interface QimenResult {
  input: QimenInput;
  timestamp: number;
  board: QimenBoard;
  dayGanZhi: string;
  hourGanZhi: string;
  calculationLog: { step: string; detail: string }[];
}

// === Da Liu Ren (大六壬) Types ===

export type LiurenGeneral =
  | '贵人' | '螣蛇' | '朱雀' | '六合' | '勾陈' | '青龙'
  | '天空' | '白虎' | '太常' | '玄武' | '太阴' | '天后';

export interface LiurenPosition {
  earthBranch: string;       // 地盘支
  heavenBranch: string;      // 天盘支
  general?: LiurenGeneral;   // 天将
}

export interface LiurenLesson {
  top: string;               // 上神
  bottom: string;            // 下神
  topElement: WuXing;
  bottomElement: WuXing;
  relation: string;          // 克关系描述
}

export interface LiurenTransmission {
  initial: string;           // 初传
  middle: string;            // 中传
  final: string;             // 末传
  method: string;            // 取传法名称
  initialGeneral?: LiurenGeneral;
  middleGeneral?: LiurenGeneral;
  finalGeneral?: LiurenGeneral;
}

export interface LiurenBoard {
  positions: LiurenPosition[];  // 12 positions (子→亥)
  monthJiang: string;           // 月将地支
  monthJiangName: string;       // 月将名 (登明/河魁/...)
  lessons: LiurenLesson[];      // 四课
  transmission: LiurenTransmission;  // 三传
  xunKong: string;
}

export interface LiurenInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  question?: string;
  useTrueSolarTime?: boolean;
  longitude?: number;
  latitude?: number;
}

export interface LiurenResult {
  input: LiurenInput;
  timestamp: number;
  board: LiurenBoard;
  dayGanZhi: string;
  hourGanZhi: string;
  hourBranch: string;
  calculationLog: { step: string; detail: string }[];
}
