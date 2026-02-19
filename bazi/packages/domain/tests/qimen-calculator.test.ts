import { describe, it, expect } from 'vitest';
import { calculateQimen, extractQimenAnalysisContext } from '../src/index.js';
import type { QimenInput, QimenResult, PalaceNumber } from '../src/index.js';

describe('calculateQimen', () => {
  // 2024-03-20 10:30 — Spring Equinox period (春分), Yang Dun
  const baseInput: QimenInput = {
    year: 2024,
    month: 3,
    day: 20,
    hour: 10,
    minute: 30,
  };

  describe('basic structure', () => {
    it('should return a complete result with all required fields', () => {
      const result = calculateQimen(baseInput);

      expect(result.input).toEqual(baseInput);
      expect(result.timestamp).toBeGreaterThan(0);
      expect(result.board).toBeDefined();
      expect(result.dayGanZhi).toBeTruthy();
      expect(result.hourGanZhi).toBeTruthy();
      expect(result.calculationLog.length).toBeGreaterThan(0);
    });

    it('should have exactly 9 palaces', () => {
      const result = calculateQimen(baseInput);
      expect(result.board.palaces).toHaveLength(9);
    });

    it('should have palaces numbered 1-9', () => {
      const result = calculateQimen(baseInput);
      const nums = result.board.palaces.map(p => p.palaceNumber).sort();
      expect(nums).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should have valid board metadata', () => {
      const result = calculateQimen(baseInput);
      const { board } = result;

      expect(['阳遁', '阴遁']).toContain(board.dunType);
      expect(board.juNumber).toBeGreaterThanOrEqual(1);
      expect(board.juNumber).toBeLessThanOrEqual(9);
      expect(['上元', '中元', '下元']).toContain(board.yuan);
      expect(board.jieQi).toBeTruthy();
      expect(board.zhiFuStar).toBeTruthy();
      expect(board.zhiShiGate).toBeTruthy();
      expect(board.xunShou).toBeTruthy();
      expect(board.xunShouYi).toBeTruthy();
      expect(board.xunKong).toBeTruthy();
    });
  });

  describe('palace content', () => {
    it('each palace should have all required fields', () => {
      const result = calculateQimen(baseInput);

      for (const palace of result.board.palaces) {
        expect(palace.palaceNumber).toBeGreaterThanOrEqual(1);
        expect(palace.palaceNumber).toBeLessThanOrEqual(9);
        expect(palace.trigram).toBeTruthy();
        expect(palace.direction).toBeTruthy();
        expect(palace.earthStem).toBeTruthy();
        expect(palace.heavenStem).toBeTruthy();
        expect(palace.star).toBeTruthy();
        expect(palace.gate).toBeTruthy();
        expect(palace.deity).toBeTruthy();
        expect(typeof palace.isEmpty).toBe('boolean');
        expect(Array.isArray(palace.patterns)).toBe(true);
      }
    });

    it('should have valid stems (三奇六仪)', () => {
      const validStems = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'];
      const result = calculateQimen(baseInput);

      for (const palace of result.board.palaces) {
        expect(validStems).toContain(palace.earthStem);
        expect(validStems).toContain(palace.heavenStem);
      }
    });

    it('should have valid stars (九星)', () => {
      const validStars = ['天蓬', '天芮', '天冲', '天辅', '天禽', '天心', '天柱', '天任', '天英'];
      const result = calculateQimen(baseInput);

      for (const palace of result.board.palaces) {
        expect(validStars).toContain(palace.star);
      }
    });

    it('should have valid gates (八门)', () => {
      const validGates = ['休门', '死门', '伤门', '杜门', '开门', '惊门', '生门', '景门'];
      const result = calculateQimen(baseInput);

      for (const palace of result.board.palaces) {
        expect(validGates).toContain(palace.gate);
      }
    });

    it('should have valid deities (八神)', () => {
      const validDeities = ['值符', '螣蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天', '勾陈', '朱雀'];
      const result = calculateQimen(baseInput);

      for (const palace of result.board.palaces) {
        expect(validDeities).toContain(palace.deity);
      }
    });
  });

  describe('dun type determination', () => {
    it('should be Yang Dun (阳遁) during spring equinox period', () => {
      // 2024-03-20 is around 春分 (Spring Equinox)
      const result = calculateQimen({ ...baseInput, month: 3, day: 20 });
      expect(result.board.dunType).toBe('阳遁');
    });

    it('should be Yin Dun (阴遁) during summer solstice period', () => {
      // 2024-06-25 is after 夏至 (Summer Solstice, ~June 21)
      const result = calculateQimen({ ...baseInput, month: 6, day: 25 });
      expect(result.board.dunType).toBe('阴遁');
    });

    it('should be Yang Dun during winter solstice period', () => {
      // 2024-12-22 is after 冬至 (Winter Solstice, ~Dec 21)
      const result = calculateQimen({ ...baseInput, month: 12, day: 22 });
      expect(result.board.dunType).toBe('阳遁');
    });

    it('should be Yin Dun during autumn equinox period', () => {
      // 2024-09-25 is after 秋分 (Autumn Equinox, ~Sep 22)
      const result = calculateQimen({ ...baseInput, month: 9, day: 25 });
      expect(result.board.dunType).toBe('阴遁');
    });
  });

  describe('earth plate (地盘)', () => {
    it('should place all 9 stems on the earth plate', () => {
      const result = calculateQimen(baseInput);
      const earthStems = result.board.palaces.map(p => p.earthStem);
      // All 9 san qi liu yi should appear
      const uniqueStems = new Set(earthStems);
      expect(uniqueStems.size).toBe(9);
    });

    it('yang dun earth plate: 戊 starts at ju number palace, ascending', () => {
      // For yang dun, 戊 should be at the palace equal to juNumber
      const result = calculateQimen(baseInput);
      if (result.board.dunType === '阳遁') {
        const wuPalace = result.board.palaces.find(p => p.earthStem === '戊');
        expect(wuPalace).toBeDefined();
        expect(wuPalace!.palaceNumber).toBe(result.board.juNumber);
      }
    });
  });

  describe('xun and xun kong', () => {
    it('xunShou should be one of the six jia', () => {
      const validXunShou = ['甲子', '甲戌', '甲申', '甲午', '甲辰', '甲寅'];
      const result = calculateQimen(baseInput);
      expect(validXunShou).toContain(result.board.xunShou);
    });

    it('xunShouYi should match the jia hidden yi table', () => {
      const jiaYiMap: Record<string, string> = {
        '甲子': '戊', '甲戌': '己', '甲申': '庚',
        '甲午': '辛', '甲辰': '壬', '甲寅': '癸',
      };
      const result = calculateQimen(baseInput);
      expect(result.board.xunShouYi).toBe(jiaYiMap[result.board.xunShou]);
    });

    it('xunKong should be two characters (two branches)', () => {
      const result = calculateQimen(baseInput);
      expect(result.board.xunKong).toHaveLength(2);
    });
  });

  describe('zhi fu and zhi shi', () => {
    it('zhiFuStar should be a valid star name', () => {
      const validStars = ['天蓬', '天芮', '天冲', '天辅', '天禽', '天心', '天柱', '天任', '天英'];
      const result = calculateQimen(baseInput);
      expect(validStars).toContain(result.board.zhiFuStar);
    });

    it('zhiShiGate should be a valid gate name', () => {
      const validGates = ['休门', '死门', '伤门', '杜门', '开门', '惊门', '生门', '景门'];
      const result = calculateQimen(baseInput);
      expect(validGates).toContain(result.board.zhiShiGate);
    });
  });

  describe('deity placement', () => {
    it('should have exactly 8 distinct deities across outer palaces', () => {
      const result = calculateQimen(baseInput);
      const outerPalaces = result.board.palaces.filter(p => p.palaceNumber !== 5);
      const deities = outerPalaces.map(p => p.deity);
      expect(new Set(deities).size).toBe(8);
    });

    it('yang dun should use yang deities (白虎/玄武)', () => {
      const result = calculateQimen(baseInput);
      if (result.board.dunType === '阳遁') {
        const deities = result.board.palaces.map(p => p.deity);
        expect(deities).toContain('白虎');
        expect(deities).toContain('玄武');
      }
    });

    it('yin dun should use yin deities (勾陈/朱雀)', () => {
      // Use a date in yin dun period
      const yinResult = calculateQimen({ ...baseInput, month: 7, day: 15 });
      if (yinResult.board.dunType === '阴遁') {
        const deities = yinResult.board.palaces.map(p => p.deity);
        expect(deities).toContain('勾陈');
        expect(deities).toContain('朱雀');
      }
    });
  });

  describe('pattern detection', () => {
    it('should detect 伏吟 when heaven and earth stems match', () => {
      const result = calculateQimen(baseInput);
      for (const palace of result.board.palaces) {
        if (palace.heavenStem === palace.earthStem) {
          expect(palace.patterns).toContain('伏吟');
        }
      }
    });

    it('patterns should be arrays of strings', () => {
      const result = calculateQimen(baseInput);
      for (const palace of result.board.palaces) {
        expect(Array.isArray(palace.patterns)).toBe(true);
        for (const p of palace.patterns) {
          expect(typeof p).toBe('string');
        }
      }
    });
  });

  describe('different dates', () => {
    it('should handle dates throughout the year', () => {
      const dates = [
        { year: 2024, month: 1, day: 10 },  // 冬至 period (Yang Dun)
        { year: 2024, month: 4, day: 10 },  // 清明 period (Yang Dun)
        { year: 2024, month: 7, day: 10 },  // 小暑 period (Yin Dun)
        { year: 2024, month: 10, day: 10 }, // 寒露 period (Yin Dun)
      ];

      for (const d of dates) {
        const input: QimenInput = { ...d, hour: 10, minute: 0 };
        const result = calculateQimen(input);
        expect(result.board.palaces).toHaveLength(9);
        expect(result.board.dunType).toBeTruthy();
        expect(result.board.juNumber).toBeGreaterThanOrEqual(1);
      }
    });

    it('should produce different boards for different hours', () => {
      const r1 = calculateQimen({ ...baseInput, hour: 8 });
      const r2 = calculateQimen({ ...baseInput, hour: 14 });

      // Different hours should (usually) produce different hour GanZhi
      expect(r1.hourGanZhi).not.toBe(r2.hourGanZhi);
    });

    it('should handle edge years', () => {
      const r1 = calculateQimen({ year: 1900, month: 6, day: 15, hour: 12, minute: 0 });
      expect(r1.board.palaces).toHaveLength(9);

      const r2 = calculateQimen({ year: 2050, month: 6, day: 15, hour: 12, minute: 0 });
      expect(r2.board.palaces).toHaveLength(9);
    });
  });

  describe('true solar time', () => {
    it('should accept true solar time options without error', () => {
      const input: QimenInput = {
        ...baseInput,
        useTrueSolarTime: true,
        longitude: 116.4,
      };
      const result = calculateQimen(input);
      expect(result.board.palaces).toHaveLength(9);
    });

    it('should potentially change hour pillar when using true solar time', () => {
      // Compare with and without true solar time for a non-120° longitude
      const withoutTST = calculateQimen(baseInput);
      const withTST = calculateQimen({
        ...baseInput,
        useTrueSolarTime: true,
        longitude: 80.0, // Far from 120°, large correction
      });

      // The boards may differ due to different effective hour
      expect(withTST.board.palaces).toHaveLength(9);
    });
  });

  describe('question field', () => {
    it('should pass question through to input', () => {
      const input: QimenInput = { ...baseInput, question: '今日出行如何？' };
      const result = calculateQimen(input);
      expect(result.input.question).toBe('今日出行如何？');
    });
  });

  describe('calculation log', () => {
    it('should contain all major steps', () => {
      const result = calculateQimen(baseInput);
      const steps = result.calculationLog.map(l => l.step);

      expect(steps).toContain('时间');
      expect(steps).toContain('定局');
      expect(steps).toContain('地盘');
      expect(steps).toContain('旬首');
      expect(steps).toContain('值符值使');
      expect(steps).toContain('天盘');
      expect(steps).toContain('门盘');
      expect(steps).toContain('八神');
      expect(steps).toContain('格局');
    });
  });
});

describe('extractQimenAnalysisContext', () => {
  it('should extract context from a valid result', () => {
    const result = calculateQimen({
      year: 2024,
      month: 5,
      day: 10,
      hour: 14,
      minute: 0,
      question: '事业发展',
    });
    const ctx = extractQimenAnalysisContext(result);

    expect(ctx.dunType).toBeTruthy();
    expect(ctx.juInfo).toBeTruthy();
    expect(ctx.zhiFu).toBeTruthy();
    expect(ctx.zhiShi).toBeTruthy();
    expect(ctx.palaceSummary).toBeTruthy();
    expect(ctx.question).toBe('事业发展');
    expect(ctx.patterns).toBeDefined();
  });

  it('should handle result without question', () => {
    const result = calculateQimen({
      year: 2024,
      month: 3,
      day: 20,
      hour: 10,
      minute: 30,
    });
    const ctx = extractQimenAnalysisContext(result);
    expect(ctx.question).toBe('');
  });
});
