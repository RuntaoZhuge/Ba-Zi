import { describe, it, expect } from 'vitest';
import { calculateMeihua } from '../src/index.js';
import type { MeihuaNumberInput, MeihuaTimeInput } from '../src/index.js';

describe('calculateMeihua', () => {
  describe('number-based divination', () => {
    it('should correctly derive trigrams from numbers', () => {
      // upperNumber=5, lowerNumber=10
      // upper = 5%8 = 5 → 巽(风)
      // lower = 10%8 = 2 → 兑(泽)
      // changing = (5+10)%6 = 3 → line 3
      const input: MeihuaNumberInput = {
        method: 'number',
        upperNumber: 5,
        lowerNumber: 10,
      };
      const result = calculateMeihua(input);

      expect(result.benGua.upper.name).toBe('巽');
      expect(result.benGua.lower.name).toBe('兑');
      expect(result.changingLine).toBe(3);
      expect(result.benGua.name).toBe('风泽中孚');
    });

    it('should handle remainder 0 as 8 (坤) for trigram', () => {
      // upperNumber=16 → 16%8=0 → 8 → 坤
      // lowerNumber=8 → 8%8=0 → 8 → 坤
      // changing = (16+8)%6=0 → 6
      const input: MeihuaNumberInput = {
        method: 'number',
        upperNumber: 16,
        lowerNumber: 8,
      };
      const result = calculateMeihua(input);

      expect(result.benGua.upper.name).toBe('坤');
      expect(result.benGua.lower.name).toBe('坤');
      expect(result.changingLine).toBe(6);
      expect(result.benGua.name).toBe('坤为地');
    });

    it('should correctly derive mutual hexagram (互卦)', () => {
      // 乾为天: all yang lines [T,T,T,T,T,T]
      // 互卦: lower=lines[1,2,3]=T,T,T→乾, upper=lines[2,3,4]=T,T,T→乾
      // 互卦 = 乾为天
      const input: MeihuaNumberInput = {
        method: 'number',
        upperNumber: 1, // 乾
        lowerNumber: 1, // 乾
      };
      const result = calculateMeihua(input);

      expect(result.benGua.name).toBe('乾为天');
      expect(result.huGua.name).toBe('乾为天');
    });

    it('should correctly derive changed hexagram (变卦)', () => {
      // upper=1→乾, lower=1→乾 → 乾为天
      // changing = (1+1)%6 = 2
      // Flip line 2 (0-indexed: 1): T→F
      // Lines become: [T,F,T,T,T,T]
      // lower = [T,F,T] → 离(3)
      // upper = [T,T,T] → 乾(1)
      // Changed = 天火同人
      const input: MeihuaNumberInput = {
        method: 'number',
        upperNumber: 1,
        lowerNumber: 1,
      };
      const result = calculateMeihua(input);

      expect(result.changingLine).toBe(2);
      expect(result.bianGua.name).toBe('天火同人');
    });

    it('should correctly identify Ti and Yong', () => {
      // upper=1→乾(金), lower=3→离(火), changing line 4 (in upper)
      // Yong=upper(乾/金), Ti=lower(离/火)
      // Ti(火) controls Yong(金) → 克
      const input: MeihuaNumberInput = {
        method: 'number',
        upperNumber: 1,
        lowerNumber: 3,
      };
      const result = calculateMeihua(input);
      // changing = (1+3)%6 = 4 → upper trigram
      expect(result.changingLine).toBe(4);
      expect(result.tiYong.tiPosition).toBe('lower');
      expect(result.tiYong.ti.name).toBe('离');
      expect(result.tiYong.yong.name).toBe('乾');
      expect(result.tiYong.relation).toBe('克'); // 火克金
    });

    it('should handle Ti-Yong when changing line in lower trigram', () => {
      // upper=3→离(火), lower=1→乾(金), changing = (3+1)%6=4
      // Wait, that's in upper. Let me pick numbers that give changing in lower.
      // upper=2→兑(金), lower=3→离(火), changing=(2+3)%6=5 → upper
      // upper=5→巽(木), lower=3→离(火), changing=(5+3)%6=2 → lower
      const input: MeihuaNumberInput = {
        method: 'number',
        upperNumber: 5,
        lowerNumber: 3,
      };
      const result = calculateMeihua(input);
      expect(result.changingLine).toBe(2); // in lower trigram
      expect(result.tiYong.tiPosition).toBe('upper');
      expect(result.tiYong.ti.name).toBe('巽');
      expect(result.tiYong.yong.name).toBe('离');
      expect(result.tiYong.relation).toBe('生'); // 木生火
    });
  });

  describe('time-based divination', () => {
    it('should produce a valid result for a known date', () => {
      const input: MeihuaTimeInput = {
        method: 'time',
        year: 2024,
        month: 3,
        day: 15,
        hour: 10,
      };
      const result = calculateMeihua(input);

      expect(result.benGua).toBeDefined();
      expect(result.huGua).toBeDefined();
      expect(result.bianGua).toBeDefined();
      expect(result.changingLine).toBeGreaterThanOrEqual(1);
      expect(result.changingLine).toBeLessThanOrEqual(6);
      expect(result.tiYong.ti).toBeDefined();
      expect(result.tiYong.yong).toBeDefined();
      expect(result.calculationLog.length).toBeGreaterThan(0);
    });
  });

  describe('five element relationships', () => {
    it('should detect 比和 (same element)', () => {
      // 乾(金) and 兑(金)
      // upper=1→乾, lower=2→兑, changing=(1+2)%6=3→lower
      // Ti=upper=乾(金), Yong=lower=兑(金)
      const input: MeihuaNumberInput = {
        method: 'number',
        upperNumber: 1,
        lowerNumber: 2,
      };
      const result = calculateMeihua(input);
      expect(result.tiYong.relation).toBe('比和');
    });

    it('should detect 被生 (Yong generates Ti)', () => {
      // Ti needs to be generated by Yong: e.g. Ti=火, Yong=木
      // 离(火) as Ti, 震(木) as Yong
      // upper=3→离(火), lower=4→震(木), changing=(3+4)%6=1→lower
      // Ti=upper=离(火), Yong=lower=震(木)
      // 木生火 → Yong generates Ti → 被生
      const input: MeihuaNumberInput = {
        method: 'number',
        upperNumber: 3,
        lowerNumber: 4,
      };
      const result = calculateMeihua(input);
      expect(result.changingLine).toBe(1);
      expect(result.tiYong.ti.name).toBe('离');
      expect(result.tiYong.yong.name).toBe('震');
      expect(result.tiYong.relation).toBe('被生');
    });

    it('should detect 被克 (Yong controls Ti)', () => {
      // Ti=木, Yong=金 → 金克木 → 被克
      // 震(木) as Ti, 乾(金) as Yong
      // upper=4→震(木), lower=1→乾(金), changing=(4+1)%6=5→upper
      // Ti=lower=乾(金), Yong=upper=震(木) → 木 vs 金... 金克木→Yong被克?
      // Let me recalculate: Ti=乾(金), Yong=震(木) → 金克木 → 克
      // Need: upper=1→乾(金), lower=4→震(木), changing=(1+4)%6=5→upper
      // Ti=lower=震(木), Yong=upper=乾(金) → 金克木 → 被克
      const input: MeihuaNumberInput = {
        method: 'number',
        upperNumber: 1,
        lowerNumber: 4,
      };
      const result = calculateMeihua(input);
      expect(result.changingLine).toBe(5);
      expect(result.tiYong.ti.name).toBe('震');
      expect(result.tiYong.yong.name).toBe('乾');
      expect(result.tiYong.relation).toBe('被克'); // 金克木
    });
  });

  describe('hexagram data integrity', () => {
    it('should always produce a named hexagram for any trigram combination', () => {
      for (let u = 1; u <= 8; u++) {
        for (let l = 1; l <= 8; l++) {
          const input: MeihuaNumberInput = {
            method: 'number',
            upperNumber: u,
            lowerNumber: l,
          };
          const result = calculateMeihua(input);
          expect(result.benGua.name).toBeTruthy();
          expect(result.benGua.kingWenNumber).toBeGreaterThanOrEqual(1);
          expect(result.benGua.kingWenNumber).toBeLessThanOrEqual(64);
          expect(result.benGua.guaCi).toBeTruthy();
        }
      }
    });

    it('should produce valid mutual hexagrams', () => {
      for (let u = 1; u <= 8; u++) {
        for (let l = 1; l <= 8; l++) {
          const input: MeihuaNumberInput = {
            method: 'number',
            upperNumber: u,
            lowerNumber: l,
          };
          const result = calculateMeihua(input);
          expect(result.huGua.name).toBeTruthy();
          expect(result.huGua.kingWenNumber).toBeGreaterThanOrEqual(1);
          expect(result.huGua.kingWenNumber).toBeLessThanOrEqual(64);
        }
      }
    });
  });

  describe('question field', () => {
    it('should preserve the question in the result', () => {
      const input: MeihuaNumberInput = {
        method: 'number',
        upperNumber: 3,
        lowerNumber: 5,
        question: '今天适合出行吗？',
      };
      const result = calculateMeihua(input);
      expect(result.input.question).toBe('今天适合出行吗？');
    });
  });
});
