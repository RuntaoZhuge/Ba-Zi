/**
 * @bazi/domain — Public API
 *
 * All exports from this file constitute the domain's public interface.
 * The web app and other consumers import exclusively from this boundary.
 */

export { calculateBaZi } from './bazi/calculator.js';
export { extractAnalysisContext } from './bazi/analysis.js';
export type { AnalysisContext } from './bazi/analysis.js';

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
  CalculationStep,
} from './types.js';
