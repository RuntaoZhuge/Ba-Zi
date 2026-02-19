import { describe, it, expect } from 'vitest';
import { calculateZiwei, extractZiweiAnalysisContext } from '../src/index.js';
import type { ZiweiInput } from '../src/index.js';

describe('calculateZiwei', () => {
  const baseInput: ZiweiInput = {
    year: 1990,
    month: 1,
    day: 15,
    hour: 6,
    gender: 'male',
    name: '测试',
  };

  describe('basic structure', () => {
    it('should return a complete result with all required fields', () => {
      const result = calculateZiwei(baseInput);

      expect(result.input).toEqual(baseInput);
      expect(result.timestamp).toBeGreaterThan(0);
      expect(result.chart).toBeDefined();
      expect(result.chart.palaces).toHaveLength(12);
      expect(result.decadeLucks.length).toBeGreaterThan(0);
      expect(result.lunarInfo).toBeDefined();
      expect(result.calculationLog.length).toBeGreaterThan(0);
    });

    it('should have exactly 12 palaces with distinct names', () => {
      const result = calculateZiwei(baseInput);
      const names = result.chart.palaces.map(p => p.name);
      expect(new Set(names).size).toBe(12);
    });

    it('should have 12 palaces with distinct branches', () => {
      const result = calculateZiwei(baseInput);
      const branches = result.chart.palaces.map(p => p.branch);
      expect(new Set(branches).size).toBe(12);
    });

    it('should populate stems for all palaces', () => {
      const result = calculateZiwei(baseInput);
      for (const palace of result.chart.palaces) {
        expect(palace.stem).toBeTruthy();
        expect(palace.branch).toBeTruthy();
      }
    });
  });

  describe('star placement', () => {
    it('should place all 14 main stars', () => {
      const result = calculateZiwei(baseInput);
      const allMainStars = result.chart.palaces.flatMap(
        p => p.stars.filter(s => s.type === 'main').map(s => s.name)
      );
      const mainStarNames = [
        '紫微', '天机', '太阳', '武曲', '天同', '廉贞',
        '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军',
      ];
      for (const star of mainStarNames) {
        expect(allMainStars).toContain(star);
      }
    });

    it('should place auxiliary stars (at least 14)', () => {
      const result = calculateZiwei(baseInput);
      const allAuxStars = result.chart.palaces.flatMap(
        p => p.stars.filter(s => s.type === 'aux').map(s => s.name)
      );
      expect(allAuxStars.length).toBeGreaterThanOrEqual(14);

      const expectedAux = [
        '文昌', '文曲', '左辅', '右弼', '天魁', '天钺',
        '禄存', '擎羊', '陀罗', '火星', '铃星', '天马', '地空', '地劫',
      ];
      for (const star of expectedAux) {
        expect(allAuxStars).toContain(star);
      }
    });

    it('should assign brightness to main stars', () => {
      const result = calculateZiwei(baseInput);
      const mainStars = result.chart.palaces.flatMap(
        p => p.stars.filter(s => s.type === 'main')
      );
      const withBrightness = mainStars.filter(s => s.brightness);
      expect(withBrightness.length).toBeGreaterThan(0);
    });
  });

  describe('four transformations (四化)', () => {
    it('should have exactly 4 Si Hua annotations', () => {
      const result = calculateZiwei(baseInput);
      const siHuaStars = result.chart.palaces.flatMap(
        p => p.stars.filter(s => s.siHua)
      );
      expect(siHuaStars.length).toBe(4);

      const huaTypes = siHuaStars.map(s => s.siHua);
      expect(huaTypes).toContain('化禄');
      expect(huaTypes).toContain('化权');
      expect(huaTypes).toContain('化科');
      expect(huaTypes).toContain('化忌');
    });
  });

  describe('wuxing ju', () => {
    it('should return a valid wuxing ju', () => {
      const result = calculateZiwei(baseInput);
      const validJus = ['水二局', '木三局', '金四局', '土五局', '火六局'];
      expect(validJus).toContain(result.chart.wuxingJu);
    });
  });

  describe('decade luck', () => {
    it('should generate decade luck cycles', () => {
      const result = calculateZiwei(baseInput);
      expect(result.decadeLucks.length).toBeGreaterThanOrEqual(10);
    });

    it('should have age ranges starting from wuxing ju number', () => {
      const result = calculateZiwei(baseInput);
      const juMap: Record<string, number> = {
        '水二局': 2, '木三局': 3, '金四局': 4, '土五局': 5, '火六局': 6,
      };
      const juNumber = juMap[result.chart.wuxingJu];
      expect(juNumber).toBeDefined();
      const firstRange = result.decadeLucks[0]?.ageRange;
      expect(firstRange).toBeDefined();
      expect(firstRange!.startsWith(`${juNumber}-`)).toBe(true);
    });

    it('should have siHua for each decade', () => {
      const result = calculateZiwei(baseInput);
      for (const luck of result.decadeLucks) {
        expect(luck.siHua.length).toBe(4);
      }
    });
  });

  describe('lunar info', () => {
    it('should populate lunar date info', () => {
      const result = calculateZiwei(baseInput);
      expect(result.lunarInfo.yearStem).toBeTruthy();
      expect(result.lunarInfo.yearBranch).toBeTruthy();
      expect(result.lunarInfo.month).toBeGreaterThanOrEqual(1);
      expect(result.lunarInfo.month).toBeLessThanOrEqual(12);
      expect(result.lunarInfo.day).toBeGreaterThanOrEqual(1);
    });
  });

  describe('different inputs', () => {
    it('should produce different charts for different birth dates', () => {
      const input1: ZiweiInput = { year: 1985, month: 6, day: 20, hour: 14, gender: 'male' };
      const input2: ZiweiInput = { year: 2000, month: 3, day: 10, hour: 8, gender: 'female' };

      const result1 = calculateZiwei(input1);
      const result2 = calculateZiwei(input2);

      // Different inputs should generally produce different charts
      // At minimum, the wuxing ju or palace arrangement should differ
      const starsStr1 = result1.chart.palaces.map(p => p.stars.map(s => s.name).join(',')).join('|');
      const starsStr2 = result2.chart.palaces.map(p => p.stars.map(s => s.name).join(',')).join('|');
      expect(starsStr1).not.toBe(starsStr2);
    });

    it('should handle female gender correctly', () => {
      const input: ZiweiInput = { year: 1990, month: 1, day: 15, hour: 6, gender: 'female' };
      const result = calculateZiwei(input);

      // For the same date, male vs female differ in decade luck direction
      const maleResult = calculateZiwei(baseInput);
      // The decade luck ages should be the same (same ju), but palace order may differ
      expect(result.chart.wuxingJu).toBe(maleResult.chart.wuxingJu);
    });

    it('should handle late hours (23:00 = 子时)', () => {
      const input: ZiweiInput = { year: 1990, month: 5, day: 10, hour: 23, gender: 'male' };
      const result = calculateZiwei(input);
      expect(result.lunarInfo.hourBranch).toBe('子');
    });

    it('should handle edge dates', () => {
      // Lunar New Year boundary
      const input: ZiweiInput = { year: 2024, month: 2, day: 10, hour: 0, gender: 'male' };
      const result = calculateZiwei(input);
      expect(result.chart.palaces).toHaveLength(12);
    });
  });

  describe('calculation log', () => {
    it('should include all major steps', () => {
      const result = calculateZiwei(baseInput);
      const steps = result.calculationLog.map(l => l.step);
      expect(steps).toContain('农历转换');
      expect(steps).toContain('安命宫');
      expect(steps).toContain('安身宫');
      expect(steps).toContain('定五行局');
      expect(steps).toContain('安主星');
      expect(steps).toContain('安辅星');
      expect(steps).toContain('定四化');
      expect(steps).toContain('排大运');
    });
  });
});

describe('extractZiweiAnalysisContext', () => {
  it('should produce a valid analysis context', () => {
    const input: ZiweiInput = {
      year: 1990,
      month: 1,
      day: 15,
      hour: 6,
      gender: 'male',
      name: '张三',
    };
    const result = calculateZiwei(input);
    const ctx = extractZiweiAnalysisContext(result);

    expect(ctx.name).toBe('张三');
    expect(ctx.gender).toBe('男');
    expect(ctx.lunarBirthInfo).toContain('农历');
    expect(ctx.mingPalace).toContain('命宫');
    expect(ctx.shenPalace).toContain('身宫');
    expect(ctx.wuxingJu).toBeTruthy();
    expect(ctx.allPalaces).toBeTruthy();
    expect(ctx.decadeLucks).toBeTruthy();
    expect(ctx.siHuaSummary).toBeTruthy();
    expect(ctx.keyPattern).toBeTruthy();
  });
});
