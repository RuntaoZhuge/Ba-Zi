/**
 * Qi Men Dun Jia (奇门遁甲) — Data Tables
 *
 * All static lookup tables for the Hourly Yang-Plate Rotating Qi Men system
 * following the Zhang Zhichun (张志春) school.
 */

import type {
  PalaceNumber,
  QimenStar,
  QimenGate,
  QimenElement,
  QimenJuNumber,
  QimenDeity,
} from '../types.js';

// === Palace Metadata (九宫元数据) ===

export interface PalaceMeta {
  trigram: string;
  direction: string;
  defaultStar: QimenStar;
  defaultGate: QimenGate;
}

export const PALACE_META: Record<PalaceNumber, PalaceMeta> = {
  1: { trigram: '坎', direction: '北',   defaultStar: '天蓬', defaultGate: '休门' },
  2: { trigram: '坤', direction: '西南', defaultStar: '天芮', defaultGate: '死门' },
  3: { trigram: '震', direction: '东',   defaultStar: '天冲', defaultGate: '伤门' },
  4: { trigram: '巽', direction: '东南', defaultStar: '天辅', defaultGate: '杜门' },
  5: { trigram: '中', direction: '中',   defaultStar: '天禽', defaultGate: '死门' },
  6: { trigram: '乾', direction: '西北', defaultStar: '天心', defaultGate: '开门' },
  7: { trigram: '兑', direction: '西',   defaultStar: '天柱', defaultGate: '惊门' },
  8: { trigram: '艮', direction: '东北', defaultStar: '天任', defaultGate: '生门' },
  9: { trigram: '离', direction: '南',   defaultStar: '天英', defaultGate: '景门' },
};

// Stars in palace order (1-9)
export const STARS_BY_PALACE: QimenStar[] = [
  '天蓬', '天芮', '天冲', '天辅', '天禽', '天心', '天柱', '天任', '天英',
];

// Gates in palace order (1-9, palace 5 has no independent gate)
export const GATES_BY_PALACE: (QimenGate | null)[] = [
  '休门', '死门', '伤门', '杜门', null, '开门', '惊门', '生门', '景门',
];

// === Luo Shu Traversal Orders ===

// Clockwise order (跳过中宫5): used for rotation, deity placement (阳遁)
export const CLOCKWISE: PalaceNumber[] = [1, 8, 3, 4, 9, 2, 7, 6];

// Counter-clockwise order (跳过中宫5): used for deity placement (阴遁)
export const COUNTERCLOCKWISE: PalaceNumber[] = [1, 6, 7, 2, 9, 4, 3, 8];

// === Solar Term → Ju Number Table (节气→局数) ===

// [上元, 中元, 下元]
export const JIEQI_JU_TABLE: Record<string, [QimenJuNumber, QimenJuNumber, QimenJuNumber]> = {
  '冬至': [1, 7, 4], '小寒': [2, 8, 5], '大寒': [3, 9, 6],
  '立春': [8, 5, 2], '雨水': [9, 6, 3], '惊蛰': [1, 7, 4],
  '春分': [3, 9, 6], '清明': [4, 1, 7], '谷雨': [5, 2, 8],
  '立夏': [4, 1, 7], '小满': [5, 2, 8], '芒种': [6, 3, 9],
  '夏至': [9, 3, 6], '小暑': [8, 2, 5], '大暑': [7, 1, 4],
  '立秋': [2, 5, 8], '处暑': [1, 4, 7], '白露': [9, 3, 6],
  '秋分': [7, 1, 4], '寒露': [6, 9, 3], '霜降': [5, 8, 2],
  '立冬': [6, 9, 3], '小雪': [5, 8, 2], '大雪': [4, 7, 1],
};

// Yang Dun solar terms (冬至→芒种)
export const YANG_DUN_JIEQI = new Set([
  '冬至', '小寒', '大寒', '立春', '雨水', '惊蛰',
  '春分', '清明', '谷雨', '立夏', '小满', '芒种',
]);

// === Six Jia Hidden Instruments (六甲隐遁) ===

export const JIA_HIDDEN_YI: Record<string, QimenElement> = {
  '甲子': '戊', '甲戌': '己', '甲申': '庚',
  '甲午': '辛', '甲辰': '壬', '甲寅': '癸',
};

// === San Qi Liu Yi Sequence (三奇六仪排布序列) ===

export const SANQI_LIUYI: QimenElement[] = [
  '戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙',
];

// === Eight Deities (八神) ===

export const YANG_DEITIES: QimenDeity[] = [
  '值符', '螣蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天',
];

export const YIN_DEITIES: QimenDeity[] = [
  '值符', '螣蛇', '太阴', '六合', '勾陈', '朱雀', '九地', '九天',
];

// === Heavenly Stems for hour GanZhi lookup ===

export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;

// Map a heavenly stem to its corresponding QimenElement
// 甲 is hidden under 六仪, so when the hour stem is 甲, we use the xunShou's hidden yi
export function stemToElement(stem: string): QimenElement | null {
  const map: Record<string, QimenElement> = {
    '乙': '乙', '丙': '丙', '丁': '丁',
    '戊': '戊', '己': '己', '庚': '庚',
    '辛': '辛', '壬': '壬', '癸': '癸',
  };
  return map[stem] || null;
}
