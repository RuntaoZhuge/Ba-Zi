import { describe, it, expect } from 'vitest';
import { calculateBaZi } from '../src/index.js';
import type { BirthInput } from '../src/index.js';

/**
 * Reference test data — known-correct BaZi charts.
 * These are validated against multiple online BaZi calculators.
 *
 * Each entry: { input, expectedPillars: [year, month, day, hour] }
 */
const REFERENCE_DATA: {
  label: string;
  input: BirthInput;
  expectedPillars: [string, string, string, string];
}[] = [
  {
    label: '1986-05-29 00:00 Male (standard date)',
    input: {
      year: 1986,
      month: 5,
      day: 29,
      hour: 0,
      minute: 0,
      gender: 'male',
      calendarType: 'solar',
    },
    expectedPillars: ['丙寅', '癸巳', '癸酉', '壬子'],
  },
  {
    label: '1990-01-01 12:00 Female (new year boundary)',
    input: {
      year: 1990,
      month: 1,
      day: 1,
      hour: 12,
      minute: 0,
      gender: 'female',
      calendarType: 'solar',
    },
    expectedPillars: ['己巳', '丙子', '丙寅', '甲午'],
  },
  {
    label: '2000-02-04 08:00 Male (lichun boundary)',
    input: {
      year: 2000,
      month: 2,
      day: 4,
      hour: 8,
      minute: 0,
      gender: 'male',
      calendarType: 'solar',
    },
    expectedPillars: ['己卯', '丁丑', '壬辰', '甲辰'],
  },
  {
    label: '1985-10-15 14:30 Female',
    input: {
      year: 1985,
      month: 10,
      day: 15,
      hour: 14,
      minute: 30,
      gender: 'female',
      calendarType: 'solar',
    },
    expectedPillars: ['乙丑', '丙戌', '丁亥', '丁未'],
  },
  {
    label: '1975-06-20 03:00 Male (yin hour)',
    input: {
      year: 1975,
      month: 6,
      day: 20,
      hour: 3,
      minute: 0,
      gender: 'male',
      calendarType: 'solar',
    },
    expectedPillars: ['乙卯', '壬午', '丁酉', '壬寅'],
  },
  {
    label: '2024-01-01 00:00 Male (recent date)',
    input: {
      year: 2024,
      month: 1,
      day: 1,
      hour: 0,
      minute: 0,
      gender: 'male',
      calendarType: 'solar',
    },
    expectedPillars: ['癸卯', '甲子', '甲子', '甲子'],
  },
  {
    label: '1960-03-15 10:00 Male (older date)',
    input: {
      year: 1960,
      month: 3,
      day: 15,
      hour: 10,
      minute: 0,
      gender: 'male',
      calendarType: 'solar',
    },
    expectedPillars: ['庚子', '己卯', '壬寅', '乙巳'],
  },
  {
    label: '1995-08-08 06:00 Female (立秋 boundary)',
    input: {
      year: 1995,
      month: 8,
      day: 8,
      hour: 6,
      minute: 0,
      gender: 'female',
      calendarType: 'solar',
    },
    expectedPillars: ['乙亥', '癸未', '辛未', '辛卯'],
  },
];

describe('calculateBaZi', () => {
  describe('Four Pillars calculation', () => {
    for (const { label, input, expectedPillars } of REFERENCE_DATA) {
      it(`should compute correct pillars for: ${label}`, () => {
        const result = calculateBaZi(input);
        const [year, month, day, hour] = expectedPillars;

        expect(result.chart.fourPillars.year.stemBranch.ganZhi).toBe(year);
        expect(result.chart.fourPillars.month.stemBranch.ganZhi).toBe(month);
        expect(result.chart.fourPillars.day.stemBranch.ganZhi).toBe(day);
        expect(result.chart.fourPillars.hour.stemBranch.ganZhi).toBe(hour);
      });
    }
  });

  describe('Day Master extraction', () => {
    it('should extract the correct day master', () => {
      const result = calculateBaZi(REFERENCE_DATA[0].input);
      expect(result.chart.dayMaster).toBe('癸');
    });
  });

  describe('Five Element distribution', () => {
    it('should produce a valid distribution including hidden stems', () => {
      const result = calculateBaZi(REFERENCE_DATA[0].input);
      const dist = result.chart.wuxingDistribution;
      const total = Object.values(dist).reduce((a, b) => a + b, 0);
      // 8 stems+branches + hidden stems (varies by birth data, always > 8)
      expect(total).toBeGreaterThan(8);
    });

    it('should have non-negative counts for all elements', () => {
      for (const ref of REFERENCE_DATA) {
        const result = calculateBaZi(ref.input);
        for (const val of Object.values(result.chart.wuxingDistribution)) {
          expect(val).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  describe('Ten Gods (ShiShen) analysis', () => {
    it('should mark day pillar stem as 日主', () => {
      const result = calculateBaZi(REFERENCE_DATA[0].input);
      expect(result.chart.shishen.day.stem).toBe('日主');
    });

    it('should produce branch ShiShen arrays matching hidden stems count', () => {
      for (const ref of REFERENCE_DATA) {
        const result = calculateBaZi(ref.input);
        const pillars = ['year', 'month', 'day', 'hour'] as const;
        for (const p of pillars) {
          expect(result.chart.shishen[p].branch.length).toBe(
            result.chart.fourPillars[p].hiddenStems.length,
          );
        }
      }
    });
  });

  describe('NaYin', () => {
    it('should produce non-empty NaYin strings', () => {
      const result = calculateBaZi(REFERENCE_DATA[0].input);
      expect(result.chart.nayin.year).toBeTruthy();
      expect(result.chart.nayin.month).toBeTruthy();
      expect(result.chart.nayin.day).toBeTruthy();
      expect(result.chart.nayin.hour).toBeTruthy();
    });
  });

  describe('Fortune cycles (Yun)', () => {
    it('should produce DaYun cycles', () => {
      const result = calculateBaZi(REFERENCE_DATA[0].input);
      expect(result.yun.daYun.length).toBeGreaterThan(0);
    });

    it('should produce LiuNian entries', () => {
      const result = calculateBaZi(REFERENCE_DATA[0].input);
      expect(result.liuNian.length).toBeGreaterThan(0);
    });

    it('should have valid GanZhi in DaYun', () => {
      const result = calculateBaZi(REFERENCE_DATA[0].input);
      for (const dy of result.yun.daYun) {
        expect(dy.stemBranch.ganZhi.length).toBe(2);
        expect(dy.stemBranch.stem).toBeTruthy();
        expect(dy.stemBranch.branch).toBeTruthy();
      }
    });
  });

  describe('Observability (calculation log)', () => {
    it('should produce a non-empty calculation log', () => {
      const result = calculateBaZi(REFERENCE_DATA[0].input);
      expect(result.chart.calculationLog.length).toBeGreaterThan(0);
    });

    it('should log timestamps', () => {
      const result = calculateBaZi(REFERENCE_DATA[0].input);
      for (const step of result.chart.calculationLog) {
        expect(step.timestamp).toBeGreaterThan(0);
      }
    });
  });

  describe('MingGe', () => {
    it('should produce a non-empty MingGe string', () => {
      for (const ref of REFERENCE_DATA) {
        const result = calculateBaZi(ref.input);
        expect(result.chart.mingge).toBeTruthy();
        expect(result.chart.mingge.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Solar term boundary cases', () => {
    it('should use 庚辰 year for 2000-02-04 21:00 (after Li Chun)', () => {
      const result = calculateBaZi({
        year: 2000, month: 2, day: 4, hour: 21, minute: 0,
        gender: 'male', calendarType: 'solar',
      });
      expect(result.chart.fourPillars.year.stemBranch.ganZhi).toBe('庚辰');
    });

    it('should use 甲辰 year for 2024-02-04 17:00 (after Li Chun)', () => {
      const result = calculateBaZi({
        year: 2024, month: 2, day: 4, hour: 17, minute: 0,
        gender: 'male', calendarType: 'solar',
      });
      expect(result.chart.fourPillars.year.stemBranch.ganZhi).toBe('甲辰');
    });

    it('should handle 1985-03-06 near Jing Zhe month transition', () => {
      const result = calculateBaZi({
        year: 1985, month: 3, day: 6, hour: 0, minute: 0,
        gender: 'male', calendarType: 'solar',
      });
      // Jing Zhe 1985 is Mar 5 — so Mar 6 should be in the new month
      expect(result.chart.fourPillars.year.stemBranch.ganZhi).toBe('乙丑');
      expect(result.chart.fourPillars.month.stemBranch.stem).toBeTruthy();
    });
  });

  describe('Optional birth hour (hourUnknown)', () => {
    it('should return null hour pillar when hourUnknown is true', () => {
      const result = calculateBaZi({
        year: 1986, month: 5, day: 29, hour: 0, minute: 0,
        gender: 'male', calendarType: 'solar', hourUnknown: true,
      });
      expect(result.chart.fourPillars.hour).toBeNull();
      expect(result.chart.fourPillars.year.stemBranch.ganZhi).toBe('丙寅');
      expect(result.chart.fourPillars.month.stemBranch.ganZhi).toBe('癸巳');
      expect(result.chart.fourPillars.day.stemBranch.ganZhi).toBe('癸酉');
    });

    it('should compute wuxing from 3 pillars (with hidden stems) when hourUnknown', () => {
      const result = calculateBaZi({
        year: 1986, month: 5, day: 29, hour: 0, minute: 0,
        gender: 'male', calendarType: 'solar', hourUnknown: true,
      });
      const total = Object.values(result.chart.wuxingDistribution).reduce((a, b) => a + b, 0);
      // 6 stems+branches from 3 pillars + hidden stems (always > 6)
      expect(total).toBeGreaterThan(6);
    });

    it('should return null shishen.hour when hourUnknown', () => {
      const result = calculateBaZi({
        year: 1986, month: 5, day: 29, hour: 0, minute: 0,
        gender: 'male', calendarType: 'solar', hourUnknown: true,
      });
      expect(result.chart.shishen.hour).toBeNull();
      expect(result.chart.shishen.year).toBeTruthy();
      expect(result.chart.shishen.month).toBeTruthy();
      expect(result.chart.shishen.day).toBeTruthy();
    });

    it('should return null nayin.hour when hourUnknown', () => {
      const result = calculateBaZi({
        year: 1986, month: 5, day: 29, hour: 0, minute: 0,
        gender: 'male', calendarType: 'solar', hourUnknown: true,
      });
      expect(result.chart.nayin.hour).toBeNull();
      expect(result.chart.nayin.year).toBeTruthy();
    });

    it('should still produce valid fortune cycles when hourUnknown', () => {
      const result = calculateBaZi({
        year: 1986, month: 5, day: 29, hour: 0, minute: 0,
        gender: 'male', calendarType: 'solar', hourUnknown: true,
      });
      expect(result.yun.daYun.length).toBeGreaterThan(0);
      expect(result.liuNian.length).toBeGreaterThan(0);
    });
  });

  describe('Date range validation', () => {
    it('should throw for year before 1900', () => {
      expect(() => calculateBaZi({
        year: 1800, month: 1, day: 1, hour: 0, minute: 0,
        gender: 'male', calendarType: 'solar',
      })).toThrow(/1900-2100/);
    });

    it('should throw for year after 2100', () => {
      expect(() => calculateBaZi({
        year: 2200, month: 1, day: 1, hour: 0, minute: 0,
        gender: 'male', calendarType: 'solar',
      })).toThrow(/1900-2100/);
    });

    it('should succeed for boundary year 1900', () => {
      const result = calculateBaZi({
        year: 1900, month: 6, day: 15, hour: 12, minute: 0,
        gender: 'male', calendarType: 'solar',
      });
      expect(result.chart.fourPillars.year.stemBranch.ganZhi).toBe('庚子');
    });

    it('should succeed for boundary year 2100', () => {
      const result = calculateBaZi({
        year: 2100, month: 6, day: 15, hour: 12, minute: 0,
        gender: 'male', calendarType: 'solar',
      });
      expect(result.chart.fourPillars.year).toBeTruthy();
    });
  });

  // === NEW TESTS: DiShi, XunKong, Palaces ===

  describe('DiShi (地势/十二长生)', () => {
    it('should produce non-empty DiShi for all four pillars', () => {
      for (const ref of REFERENCE_DATA) {
        const result = calculateBaZi(ref.input);
        expect(result.chart.fourPillars.year.diShi).toBeTruthy();
        expect(result.chart.fourPillars.month.diShi).toBeTruthy();
        expect(result.chart.fourPillars.day.diShi).toBeTruthy();
        expect(result.chart.fourPillars.hour!.diShi).toBeTruthy();
      }
    });

    it('should return known DiShi values', () => {
      const VALID_DISHI = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'];
      const result = calculateBaZi(REFERENCE_DATA[0].input);
      expect(VALID_DISHI).toContain(result.chart.fourPillars.day.diShi);
    });
  });

  describe('XunKong (旬空)', () => {
    it('should produce non-empty xun and xunKong for all four pillars', () => {
      const result = calculateBaZi(REFERENCE_DATA[0].input);
      for (const p of ['year', 'month', 'day', 'hour'] as const) {
        const pillar = result.chart.fourPillars[p]!;
        expect(pillar.xun).toBeTruthy();
        expect(pillar.xunKong).toBeTruthy();
        expect(pillar.xun!.length).toBe(2); // e.g. "甲子"
      }
    });
  });

  describe('Palaces (宫位)', () => {
    it('should compute MingGong with ganZhi and naYin', () => {
      const result = calculateBaZi(REFERENCE_DATA[0].input);
      expect(result.chart.mingGong).toBeTruthy();
      expect(result.chart.mingGong!.ganZhi.length).toBe(2);
      expect(result.chart.mingGong!.naYin).toBeTruthy();
    });

    it('should compute ShenGong with ganZhi and naYin', () => {
      const result = calculateBaZi(REFERENCE_DATA[0].input);
      expect(result.chart.shenGong).toBeTruthy();
      expect(result.chart.shenGong!.ganZhi.length).toBe(2);
      expect(result.chart.shenGong!.naYin).toBeTruthy();
    });

    it('should compute TaiYuan with ganZhi and naYin', () => {
      const result = calculateBaZi(REFERENCE_DATA[0].input);
      expect(result.chart.taiYuan).toBeTruthy();
      expect(result.chart.taiYuan!.ganZhi.length).toBe(2);
      expect(result.chart.taiYuan!.naYin).toBeTruthy();
    });

    it('should compute TaiXi with ganZhi and naYin', () => {
      const result = calculateBaZi(REFERENCE_DATA[0].input);
      expect(result.chart.taiXi).toBeTruthy();
      expect(result.chart.taiXi!.ganZhi.length).toBe(2);
      expect(result.chart.taiXi!.naYin).toBeTruthy();
    });

    it('should produce palaces for all reference data', () => {
      for (const ref of REFERENCE_DATA) {
        const result = calculateBaZi(ref.input);
        expect(result.chart.mingGong).toBeTruthy();
        expect(result.chart.shenGong).toBeTruthy();
        expect(result.chart.taiYuan).toBeTruthy();
        expect(result.chart.taiXi).toBeTruthy();
      }
    });
  });

  // === NEW TESTS: ShenSha ===

  describe('ShenSha (神煞)', () => {
    it('should produce non-empty ShenSha array', () => {
      const result = calculateBaZi(REFERENCE_DATA[0].input);
      expect(result.chart.shensha.length).toBeGreaterThan(0);
    });

    it('should classify ShenSha as 吉神 or 凶煞', () => {
      const result = calculateBaZi(REFERENCE_DATA[0].input);
      for (const ss of result.chart.shensha) {
        expect(['吉神', '凶煞']).toContain(ss.description);
        expect(ss.name).toBeTruthy();
        expect(ss.pillar).toBe('day');
      }
    });

    it('should produce ShenSha for multiple dates', () => {
      for (const ref of REFERENCE_DATA) {
        const result = calculateBaZi(ref.input);
        expect(result.chart.shensha.length).toBeGreaterThan(0);
      }
    });
  });

  // === NEW TESTS: Lunar Calendar Input ===

  describe('Lunar calendar input', () => {
    it('should produce same result for solar and equivalent lunar date', () => {
      // 1986-05-29 solar = 1986年四月二十一 lunar
      const solarResult = calculateBaZi({
        year: 1986, month: 5, day: 29, hour: 0, minute: 0,
        gender: 'male', calendarType: 'solar',
      });
      const lunarResult = calculateBaZi({
        year: 1986, month: 4, day: 21, hour: 0, minute: 0,
        gender: 'male', calendarType: 'lunar',
      });
      expect(lunarResult.chart.fourPillars.year.stemBranch.ganZhi)
        .toBe(solarResult.chart.fourPillars.year.stemBranch.ganZhi);
      expect(lunarResult.chart.fourPillars.day.stemBranch.ganZhi)
        .toBe(solarResult.chart.fourPillars.day.stemBranch.ganZhi);
    });

    it('should handle lunar input for a different date', () => {
      // 2000-01-01 lunar (正月初一) = 2000-02-05 solar
      const result = calculateBaZi({
        year: 2000, month: 1, day: 1, hour: 12, minute: 0,
        gender: 'male', calendarType: 'lunar',
      });
      expect(result.chart.fourPillars.year.stemBranch.ganZhi).toBe('庚辰');
    });
  });

  // === NEW TESTS: Leap Month ===

  describe('Leap month (闰月)', () => {
    it('should differentiate leap month from normal month', () => {
      // 2020 has 闰四月
      const normalResult = calculateBaZi({
        year: 2020, month: 4, day: 15, hour: 12, minute: 0,
        gender: 'male', calendarType: 'lunar', isLeapMonth: false,
      });
      const leapResult = calculateBaZi({
        year: 2020, month: 4, day: 15, hour: 12, minute: 0,
        gender: 'male', calendarType: 'lunar', isLeapMonth: true,
      });
      // Leap month 4 and normal month 4 should produce different day pillars
      // because they are ~30 days apart
      expect(leapResult.chart.fourPillars.day.stemBranch.ganZhi)
        .not.toBe(normalResult.chart.fourPillars.day.stemBranch.ganZhi);
    });

    it('should compute valid pillars for leap month input', () => {
      const result = calculateBaZi({
        year: 2020, month: 4, day: 1, hour: 8, minute: 0,
        gender: 'female', calendarType: 'lunar', isLeapMonth: true,
      });
      expect(result.chart.fourPillars.year.stemBranch.ganZhi).toBe('庚子');
      expect(result.chart.fourPillars.day.stemBranch.ganZhi).toBeTruthy();
    });
  });

  // === NEW TESTS: Zi Hour Mode ===

  describe('Zi hour mode (子时)', () => {
    it('should produce different day pillars for early vs late zi at 23:30', () => {
      const base: BirthInput = {
        year: 1990, month: 6, day: 15, hour: 23, minute: 30,
        gender: 'male', calendarType: 'solar',
      };
      const earlyResult = calculateBaZi({ ...base, ziHourMode: 'early' });
      const lateResult = calculateBaZi({ ...base, ziHourMode: 'late' });

      // Early zi: day does NOT change at 23:00 — same day pillar
      // Late zi (default): day changes at 23:00 — next day pillar
      expect(earlyResult.chart.fourPillars.day.stemBranch.ganZhi)
        .not.toBe(lateResult.chart.fourPillars.day.stemBranch.ganZhi);
    });

    it('should not affect day pillar for non-zi hours', () => {
      const base: BirthInput = {
        year: 1990, month: 6, day: 15, hour: 14, minute: 0,
        gender: 'male', calendarType: 'solar',
      };
      const earlyResult = calculateBaZi({ ...base, ziHourMode: 'early' });
      const lateResult = calculateBaZi({ ...base, ziHourMode: 'late' });

      expect(earlyResult.chart.fourPillars.day.stemBranch.ganZhi)
        .toBe(lateResult.chart.fourPillars.day.stemBranch.ganZhi);
    });
  });

  // === NEW TESTS: True Solar Time ===

  describe('True solar time (真太阳时)', () => {
    it('should adjust hour for far-west longitude (e.g. Urumqi 87.6°E)', () => {
      // Urumqi is ~32° west of central meridian (120°E)
      // Time correction = (87.6 - 120) * 4 = -129.6 minutes ≈ -2h 10min
      // An hour near boundary should shift
      const base: BirthInput = {
        year: 1990, month: 6, day: 15, hour: 9, minute: 0,
        gender: 'male', calendarType: 'solar',
      };
      const normalResult = calculateBaZi(base);
      const trueSolarResult = calculateBaZi({
        ...base,
        useTrueSolarTime: true,
        longitude: 87.6,
      });

      // With ~2h adjustment backward, the hour pillar should change
      expect(trueSolarResult.chart.fourPillars.hour!.stemBranch.ganZhi)
        .not.toBe(normalResult.chart.fourPillars.hour!.stemBranch.ganZhi);
    });

    it('should not adjust when useTrueSolarTime is false', () => {
      const base: BirthInput = {
        year: 1990, month: 6, day: 15, hour: 9, minute: 0,
        gender: 'male', calendarType: 'solar',
      };
      const result1 = calculateBaZi(base);
      const result2 = calculateBaZi({ ...base, longitude: 87.6 });

      expect(result1.chart.fourPillars.hour!.stemBranch.ganZhi)
        .toBe(result2.chart.fourPillars.hour!.stemBranch.ganZhi);
    });

    it('should produce same result for Beijing (116.4°E) — near central meridian', () => {
      const base: BirthInput = {
        year: 1990, month: 6, day: 15, hour: 12, minute: 0,
        gender: 'male', calendarType: 'solar',
      };
      const normalResult = calculateBaZi(base);
      const trueSolarResult = calculateBaZi({
        ...base,
        useTrueSolarTime: true,
        longitude: 116.4,
      });

      // Beijing is very close to 120°E, minimal adjustment — hour pillar should stay same
      expect(trueSolarResult.chart.fourPillars.hour!.stemBranch.ganZhi)
        .toBe(normalResult.chart.fourPillars.hour!.stemBranch.ganZhi);
    });
  });

  // === NEW TESTS: Cross-verification ===

  describe('ShiShen cross-verification', () => {
    it('should log cross-verification data in calculation log', () => {
      const result = calculateBaZi(REFERENCE_DATA[0].input);
      const crossVerifyStep = result.chart.calculationLog.find(
        (s) => s.step === 'crossVerifyShiShen',
      );
      expect(crossVerifyStep).toBeTruthy();
    });
  });

  // === NEW TESTS: Additional reference data ===

  describe('Additional reference data', () => {
    const ADDITIONAL_REFS: {
      label: string;
      input: BirthInput;
      expectedPillars: [string, string, string, string];
    }[] = [
      {
        label: '1949-10-01 14:00 Male (PRC founding)',
        input: {
          year: 1949, month: 10, day: 1, hour: 14, minute: 0,
          gender: 'male', calendarType: 'solar',
        },
        expectedPillars: ['己丑', '癸酉', '甲子', '辛未'],
      },
      {
        label: '2008-08-08 20:00 Male (Beijing Olympics)',
        input: {
          year: 2008, month: 8, day: 8, hour: 20, minute: 0,
          gender: 'male', calendarType: 'solar',
        },
        expectedPillars: ['戊子', '庚申', '庚辰', '丙戌'],
      },
      {
        label: '1970-01-01 00:00 Male (Unix epoch)',
        input: {
          year: 1970, month: 1, day: 1, hour: 0, minute: 0,
          gender: 'male', calendarType: 'solar',
        },
        expectedPillars: ['己酉', '丙子', '辛巳', '戊子'],
      },
      {
        label: '2000-01-01 00:00 Female (Y2K)',
        input: {
          year: 2000, month: 1, day: 1, hour: 0, minute: 0,
          gender: 'female', calendarType: 'solar',
        },
        expectedPillars: ['己卯', '丙子', '戊午', '壬子'],
      },
      {
        label: '1955-03-20 12:00 Male (Spring Equinox vicinity)',
        input: {
          year: 1955, month: 3, day: 20, hour: 12, minute: 0,
          gender: 'male', calendarType: 'solar',
        },
        expectedPillars: ['乙未', '己卯', '庚辰', '壬午'],
      },
      {
        label: '2020-06-21 06:00 Female (Summer Solstice 2020)',
        input: {
          year: 2020, month: 6, day: 21, hour: 6, minute: 0,
          gender: 'female', calendarType: 'solar',
        },
        expectedPillars: ['庚子', '壬午', '乙未', '己卯'],
      },
    ];

    for (const { label, input, expectedPillars } of ADDITIONAL_REFS) {
      it(`should compute correct pillars for: ${label}`, () => {
        const result = calculateBaZi(input);
        const [year, month, day, hour] = expectedPillars;
        expect(result.chart.fourPillars.year.stemBranch.ganZhi).toBe(year);
        expect(result.chart.fourPillars.month.stemBranch.ganZhi).toBe(month);
        expect(result.chart.fourPillars.day.stemBranch.ganZhi).toBe(day);
        expect(result.chart.fourPillars.hour!.stemBranch.ganZhi).toBe(hour);
      });
    }
  });

  // === NEW TESTS: Hidden stems consistency ===

  describe('Hidden stems', () => {
    it('should produce correct hidden stems for known branches', () => {
      // 寅 should have [甲, 丙, 戊]
      const result = calculateBaZi(REFERENCE_DATA[0].input); // 丙寅 year
      expect(result.chart.fourPillars.year.hiddenStems).toEqual(['甲', '丙', '戊']);
    });

    it('should produce single hidden stem for 子', () => {
      // 壬子 hour — 子 should have [癸]
      const result = calculateBaZi(REFERENCE_DATA[0].input);
      expect(result.chart.fourPillars.hour!.hiddenStems).toEqual(['癸']);
    });
  });

  // === NEW TESTS: Five Element distribution with hidden stems ===

  describe('Five Element distribution (detailed)', () => {
    it('should count hidden stems in distribution', () => {
      const result = calculateBaZi(REFERENCE_DATA[0].input);
      const dist = result.chart.wuxingDistribution;
      const total = Object.values(dist).reduce((a, b) => a + b, 0);
      // 4 pillars × 2 (stem+branch) = 8 + hidden stems count
      // 寅[3] + 巳[3] + 酉[1] + 子[1] = 8 hidden stems → total = 16
      expect(total).toBe(16);
    });

    it('should produce correct element counts for 1986-05-29', () => {
      const result = calculateBaZi(REFERENCE_DATA[0].input);
      const dist = result.chart.wuxingDistribution;
      // Stems: 丙(火) 癸(水) 癸(水) 壬(水)
      // Branches: 寅(木) 巳(火) 酉(金) 子(水)
      // Hidden: 寅[甲(木),丙(火),戊(土)] 巳[丙(火),庚(金),戊(土)] 酉[辛(金)] 子[癸(水)]
      expect(dist['水']).toBe(5); // 癸+癸+壬+子+癸
      expect(dist['火']).toBe(4); // 丙+巳+丙+丙
      expect(dist['金']).toBe(3); // 酉+庚+辛
      expect(dist['木']).toBe(2); // 寅+甲
      expect(dist['土']).toBe(2); // 戊+戊
    });
  });

  // === NEW TESTS: Calculation log completeness ===

  describe('Calculation log completeness', () => {
    it('should log all major computation steps', () => {
      const result = calculateBaZi(REFERENCE_DATA[0].input);
      const stepNames = result.chart.calculationLog.map((s) => s.step);
      expect(stepNames).toContain('createSolar');
      expect(stepNames).toContain('getLunar');
      expect(stepNames).toContain('getEightChar');
      expect(stepNames).toContain('buildFourPillars');
      expect(stepNames).toContain('computeWuXing');
      expect(stepNames).toContain('computeShiShen');
      expect(stepNames).toContain('crossVerifyShiShen');
      expect(stepNames).toContain('extractShenSha');
      expect(stepNames).toContain('determineMingGe');
      expect(stepNames).toContain('computePalaces');
      expect(stepNames).toContain('computeYun');
      expect(stepNames).toContain('computeLiuNian');
    });
  });
});
