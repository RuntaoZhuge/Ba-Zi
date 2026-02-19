/**
 * @bazi/domain — Public API
 *
 * All exports from this file constitute the domain's public interface.
 * The web app and other consumers import exclusively from this boundary.
 */

export { calculateBaZi } from './bazi/calculator.js';
export { extractAnalysisContext } from './bazi/analysis.js';
export type { AnalysisContext } from './bazi/analysis.js';
export { calculateDailyFortune } from './bazi/daily-fortune.js';
export { analyzeMarriage } from './bazi/marriage.js';

// Meihua (梅花易数)
export { calculateMeihua } from './meihua/calculator.js';
export { extractMeihuaAnalysisContext } from './meihua/analysis.js';
export type { MeihuaAnalysisContext } from './meihua/analysis.js';

// Ziwei (紫微斗数)
export { calculateZiwei } from './ziwei/calculator.js';
export { extractZiweiAnalysisContext } from './ziwei/analysis.js';
export type { ZiweiAnalysisContext } from './ziwei/analysis.js';

// Qimen (奇门遁甲)
export { calculateQimen } from './qimen/calculator.js';
export { extractQimenAnalysisContext } from './qimen/analysis.js';
export type { QimenAnalysisContext } from './qimen/analysis.js';

// Liuyao (六爻纳甲)
export { calculateLiuyao } from './liuyao/calculator.js';
export { extractLiuyaoAnalysisContext } from './liuyao/analysis.js';
export type { LiuyaoAnalysisContext } from './liuyao/analysis.js';

// Liuren (大六壬)
export { calculateLiuren } from './liuren/calculator.js';
export { extractLiurenAnalysisContext } from './liuren/analysis.js';
export type { LiurenAnalysisContext } from './liuren/analysis.js';

export type {
  // Input types
  BirthInput,
  Gender,
  CalendarType,
  ZiHourMode,

  // Fundamental types
  HeavenlyStem,
  EarthlyBranch,
  WuXing,
  YinYang,
  StemBranch,

  // Pillar types
  Pillar,
  FourPillars,

  // Analysis types
  ShiShenName,
  ShiShenPillar,
  ShiShenAnalysis,
  ShenShaResult,

  // Fortune cycle types
  DaYunCycle,
  LiuNianFortune,
  LiuYueFortune,
  YunInfo,

  // Palace types
  PalaceInfo,

  // Output types
  BaZiChart,
  BaZiResult,
  DailyFortuneContext,
  MarriageCompatibility,
  CalculationStep,

  // Meihua types
  TrigramName,
  MeihuaMethod,
  MeihuaTimeInput,
  MeihuaNumberInput,
  MeihuaInput,
  Trigram,
  Hexagram,
  ChangingLinePosition,
  WuxingRelation,
  TiYongAnalysis,
  MeihuaResult,

  // Ziwei types
  ZiweiPalaceName,
  ZiweiMainStar,
  ZiweiAuxStar,
  StarBrightness,
  SiHuaStar,
  ZiweiStar,
  ZiweiPalace,
  ZiweiDecadeLuck,
  ZiweiChart,
  ZiweiInput,
  ZiweiResult,

  // Liuyao types
  YaoValue,
  SixRelation,
  SixSpirit,
  LiuyaoLine,
  LiuyaoHexagram,
  LiuyaoHiddenGod,
  LiuyaoMethod,
  LiuyaoInput,
  LiuyaoResult,

  // Liuren types
  LiurenGeneral,
  LiurenPosition,
  LiurenLesson,
  LiurenTransmission,
  LiurenBoard,
  LiurenInput,
  LiurenResult,

  // Qimen types
  QimenDunType,
  QimenYuan,
  QimenJuNumber,
  PalaceNumber,
  QimenStar,
  QimenGate,
  QimenDeity,
  QimenElement,
  QimenPalace,
  QimenBoard,
  QimenInput,
  QimenResult,
} from './types.js';
