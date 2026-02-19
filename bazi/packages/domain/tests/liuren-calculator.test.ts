import { describe, it, expect } from 'vitest';
import { calculateLiuren } from '../src/liuren/calculator.js';
import { extractLiurenAnalysisContext } from '../src/liuren/analysis.js';
import {
  BRANCH_ELEMENT,
  STEM_PALACE,
  GUIREN_TABLE,
  TWELVE_GENERALS,
  LIUCHONG,
  SANXING,
  JIANG_NAME,
  branchIndex,
  isKe,
  getYiMa,
} from '../src/liuren/data.js';
import type { LiurenInput } from '../src/types.js';

function makeInput(overrides?: Partial<LiurenInput>): LiurenInput {
  return {
    year: 2024, month: 3, day: 20, hour: 10, minute: 30,
    ...overrides,
  };
}

describe('Da Liu Ren Calculator', () => {
  describe('Data Tables', () => {
    it('should have 12 branch elements', () => {
      expect(Object.keys(BRANCH_ELEMENT).length).toBe(12);
    });

    it('should have 10 stem palaces', () => {
      expect(Object.keys(STEM_PALACE).length).toBe(10);
    });

    it('should have 10 guiren entries', () => {
      expect(Object.keys(GUIREN_TABLE).length).toBe(10);
    });

    it('should have 12 generals', () => {
      expect(TWELVE_GENERALS.length).toBe(12);
      expect(TWELVE_GENERALS[0]).toBe('贵人');
      expect(TWELVE_GENERALS[11]).toBe('天后');
    });

    it('should have 12 liuchong pairs', () => {
      expect(Object.keys(LIUCHONG).length).toBe(12);
      // Each chong should be reversible
      for (const [a, b] of Object.entries(LIUCHONG)) {
        expect(LIUCHONG[b]).toBe(a);
      }
    });

    it('should have correct sanxing entries', () => {
      expect(SANXING['寅']).toBe('巳');
      expect(SANXING['巳']).toBe('申');
      expect(SANXING['申']).toBe('寅');
      expect(SANXING['子']).toBe('卯');
      expect(SANXING['卯']).toBe('子');
      // Self-punishment
      expect(SANXING['辰']).toBe('辰');
      expect(SANXING['午']).toBe('午');
    });

    it('should calculate yi-ma correctly', () => {
      expect(getYiMa('子')).toBe('寅');
      expect(getYiMa('午')).toBe('申');
      expect(getYiMa('卯')).toBe('巳');
      expect(getYiMa('酉')).toBe('亥');
    });

    it('should have 12 jiang names', () => {
      expect(Object.keys(JIANG_NAME).length).toBe(12);
      expect(JIANG_NAME['子']).toBe('神后');
      expect(JIANG_NAME['亥']).toBe('登明');
    });
  });

  describe('Five Element Relations', () => {
    it('should detect ke (克) correctly', () => {
      // 金克木
      expect(isKe('金', '木')).toBe(true);
      // 木不克金
      expect(isKe('木', '金')).toBe(false);
      // 水克火
      expect(isKe('水', '火')).toBe(true);
      // 火克金
      expect(isKe('火', '金')).toBe(true);
      // 木克土
      expect(isKe('木', '土')).toBe(true);
      // 土克水
      expect(isKe('土', '水')).toBe(true);
    });

    it('should not detect ke for same elements', () => {
      expect(isKe('金', '金')).toBe(false);
      expect(isKe('木', '木')).toBe(false);
    });

    it('should not detect ke for sheng', () => {
      // 金生水, not ke
      expect(isKe('金', '水')).toBe(false);
      // 木生火
      expect(isKe('木', '火')).toBe(false);
    });
  });

  describe('Branch Index', () => {
    it('should return correct indices', () => {
      expect(branchIndex('子')).toBe(0);
      expect(branchIndex('丑')).toBe(1);
      expect(branchIndex('亥')).toBe(11);
    });
  });

  describe('Basic Calculation', () => {
    it('should return a valid result', () => {
      const result = calculateLiuren(makeInput());

      expect(result.dayGanZhi.length).toBe(2);
      expect(result.hourGanZhi.length).toBe(2);
      expect(result.hourBranch.length).toBe(1);
      expect(result.board.positions.length).toBe(12);
      expect(result.board.lessons.length).toBe(4);
      expect(result.board.transmission.initial).toBeTruthy();
      expect(result.board.transmission.middle).toBeTruthy();
      expect(result.board.transmission.final).toBeTruthy();
      expect(result.board.transmission.method).toBeTruthy();
      expect(result.board.xunKong).toBeTruthy();
    });

    it('should have a valid month jiang', () => {
      const result = calculateLiuren(makeInput());
      expect(branchIndex(result.board.monthJiang)).toBeGreaterThanOrEqual(0);
      expect(result.board.monthJiangName).toBeTruthy();
    });

    it('should have 12 board positions', () => {
      const result = calculateLiuren(makeInput());
      const earthBranches = result.board.positions.map((p) => p.earthBranch);
      // Should contain all 12 branches
      expect(new Set(earthBranches).size).toBe(12);
    });

    it('should have unique heaven branches', () => {
      const result = calculateLiuren(makeInput());
      const heavenBranches = result.board.positions.map((p) => p.heavenBranch);
      expect(new Set(heavenBranches).size).toBe(12);
    });
  });

  describe('Four Lessons', () => {
    it('should produce 4 lessons', () => {
      const result = calculateLiuren(makeInput());
      expect(result.board.lessons.length).toBe(4);
    });

    it('should have valid branches in each lesson', () => {
      const result = calculateLiuren(makeInput());
      for (const lesson of result.board.lessons) {
        expect(branchIndex(lesson.top)).toBeGreaterThanOrEqual(0);
        expect(branchIndex(lesson.bottom)).toBeGreaterThanOrEqual(0);
        expect(BRANCH_ELEMENT[lesson.top]).toBeTruthy();
        expect(BRANCH_ELEMENT[lesson.bottom]).toBeTruthy();
        expect(lesson.relation).toBeTruthy();
      }
    });

    it('should use day stem palace for lesson 1 bottom', () => {
      const result = calculateLiuren(makeInput());
      const dayStem = result.dayGanZhi[0];
      const expectedPalace = STEM_PALACE[dayStem];
      expect(result.board.lessons[0].bottom).toBe(expectedPalace);
    });

    it('should chain lessons correctly: lesson2.bottom = lesson1.top', () => {
      const result = calculateLiuren(makeInput());
      expect(result.board.lessons[1].bottom).toBe(result.board.lessons[0].top);
    });

    it('should use day branch for lesson 3 bottom', () => {
      const result = calculateLiuren(makeInput());
      const dayBranch = result.dayGanZhi[1];
      expect(result.board.lessons[2].bottom).toBe(dayBranch);
    });

    it('should chain lessons correctly: lesson4.bottom = lesson3.top', () => {
      const result = calculateLiuren(makeInput());
      expect(result.board.lessons[3].bottom).toBe(result.board.lessons[2].top);
    });
  });

  describe('Three Transmissions', () => {
    it('should have a valid method name', () => {
      const result = calculateLiuren(makeInput());
      const validMethods = [
        '贼克法(上克下)', '贼克法(下克上)', '比用法', '涉害法',
        '遥克法', '昴星法',
        '伏吟(刑)', '伏吟(冲)', '伏吟(自身)',
        '返吟(驿马)',
      ];
      expect(validMethods).toContain(result.board.transmission.method);
    });

    it('should produce valid branches for all three transmissions', () => {
      const result = calculateLiuren(makeInput());
      const t = result.board.transmission;
      expect(branchIndex(t.initial)).toBeGreaterThanOrEqual(0);
      expect(branchIndex(t.middle)).toBeGreaterThanOrEqual(0);
      expect(branchIndex(t.final)).toBeGreaterThanOrEqual(0);
    });

    it('should chain: middle = heaven above initial, final = heaven above middle', () => {
      const result = calculateLiuren(makeInput());
      const t = result.board.transmission;
      const positions = result.board.positions;

      // Find heaven branch above initial
      const posInit = positions.find((p) => p.earthBranch === t.initial);
      if (posInit) {
        expect(t.middle).toBe(posInit.heavenBranch);
      }

      // Find heaven branch above middle
      const posMid = positions.find((p) => p.earthBranch === t.middle);
      if (posMid) {
        expect(t.final).toBe(posMid.heavenBranch);
      }
    });
  });

  describe('Twelve Generals', () => {
    it('should assign generals to board positions', () => {
      const result = calculateLiuren(makeInput());
      const generalsAssigned = result.board.positions.filter((p) => p.general).length;
      expect(generalsAssigned).toBe(12);
    });

    it('should assign all 12 unique generals', () => {
      const result = calculateLiuren(makeInput());
      const generals = result.board.positions
        .map((p) => p.general)
        .filter(Boolean);
      expect(new Set(generals).size).toBe(12);
    });

    it('should include 贵人 in generals', () => {
      const result = calculateLiuren(makeInput());
      const generals = result.board.positions.map((p) => p.general);
      expect(generals).toContain('贵人');
    });
  });

  describe('Calculation Log', () => {
    it('should have log entries for all major steps', () => {
      const result = calculateLiuren(makeInput());
      const stepNames = result.calculationLog.map((l) => l.step);
      expect(stepNames).toContain('日时干支');
      expect(stepNames).toContain('定月将');
      expect(stepNames).toContain('布天地盘');
      expect(stepNames).toContain('起四课');
      expect(stepNames).toContain('取三传');
      expect(stepNames).toContain('布天将');
      expect(stepNames).toContain('旬空');
    });
  });

  describe('Different dates', () => {
    it('should produce different results for different times', () => {
      const r1 = calculateLiuren(makeInput({ hour: 8 }));
      const r2 = calculateLiuren(makeInput({ hour: 14 }));

      // Different hours should produce different boards
      expect(r1.hourGanZhi).not.toBe(r2.hourGanZhi);
    });

    it('should produce different results for different dates', () => {
      const r1 = calculateLiuren(makeInput({ day: 15 }));
      const r2 = calculateLiuren(makeInput({ day: 20 }));

      expect(r1.dayGanZhi).not.toBe(r2.dayGanZhi);
    });
  });

  describe('Board Rotation', () => {
    it('should place month jiang on hour branch', () => {
      const result = calculateLiuren(makeInput());
      const hourBranch = result.hourBranch;
      const monthJiang = result.board.monthJiang;

      // The position where earth branch = hourBranch should have heaven branch = monthJiang
      const pos = result.board.positions.find((p) => p.earthBranch === hourBranch);
      expect(pos?.heavenBranch).toBe(monthJiang);
    });
  });

  describe('Analysis Context', () => {
    it('should extract analysis context', () => {
      const result = calculateLiuren(makeInput({ question: '测事业' }));
      const ctx = extractLiurenAnalysisContext(result);

      expect(ctx.dayHourInfo).toContain(result.dayGanZhi);
      expect(ctx.monthJiang).toContain(result.board.monthJiangName);
      expect(ctx.boardSummary).toBeTruthy();
      expect(ctx.lessonsSummary).toBeTruthy();
      expect(ctx.transmissionInfo).toContain(result.board.transmission.method);
      expect(ctx.question).toBe('测事业');
    });
  });
});
