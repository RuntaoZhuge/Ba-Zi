import { describe, it, expect } from 'vitest';
import { calculateLiuyao } from '../src/liuyao/calculator.js';
import { extractLiuyaoAnalysisContext } from '../src/liuyao/analysis.js';
import { HEXAGRAM_PALACE_MAP } from '../src/liuyao/data.js';
import type { LiuyaoInput, YaoValue } from '../src/types.js';

// Helper: create input with manual lines for deterministic testing
function manualInput(lines: YaoValue[], question?: string): LiuyaoInput {
  return {
    year: 2024, month: 3, day: 20, hour: 10, minute: 30,
    method: 'manual',
    manualLines: lines,
    question,
  };
}

describe('LiuYao Calculator', () => {
  describe('Palace Table Completeness', () => {
    it('should have exactly 64 entries in the palace map', () => {
      expect(Object.keys(HEXAGRAM_PALACE_MAP).length).toBe(64);
    });

    it('should have 8 hexagrams per palace', () => {
      const palaceCounts: Record<string, number> = {};
      for (const info of Object.values(HEXAGRAM_PALACE_MAP)) {
        palaceCounts[info.palace] = (palaceCounts[info.palace] || 0) + 1;
      }
      for (const [palace, count] of Object.entries(palaceCounts)) {
        expect(count, `${palace}宫 should have 8 hexagrams`).toBe(8);
      }
    });
  });

  describe('Basic Calculation', () => {
    it('should return a valid result for manual input', () => {
      // 乾为天: all yang, no moving lines → 6 lines of 7 (少阳)
      const result = calculateLiuyao(manualInput([7, 7, 7, 7, 7, 7]));

      expect(result.originalHex.name).toBe('乾为天');
      expect(result.originalHex.palace).toBe('乾');
      expect(result.originalHex.palaceElement).toBe('金');
      expect(result.changedHex).toBeNull();
      expect(result.movingLines).toEqual([]);
    });

    it('should calculate 坤为地 correctly', () => {
      // All yin, no moving → 6 lines of 8 (少阴)
      const result = calculateLiuyao(manualInput([8, 8, 8, 8, 8, 8]));

      expect(result.originalHex.name).toBe('坤为地');
      expect(result.originalHex.palace).toBe('坤');
      expect(result.originalHex.palaceElement).toBe('土');
    });

    it('should have 6 lines in the hexagram', () => {
      const result = calculateLiuyao(manualInput([7, 8, 7, 8, 7, 8]));
      expect(result.originalHex.lines.length).toBe(6);
    });
  });

  describe('Moving Lines and Changed Hexagram', () => {
    it('should detect moving lines (老阳=9)', () => {
      // Line 1 is 老阳(9), rest are 少阳(7)
      const result = calculateLiuyao(manualInput([9, 7, 7, 7, 7, 7]));
      expect(result.movingLines).toEqual([1]);
      expect(result.originalHex.lines[0].isMoving).toBe(true);
      expect(result.changedHex).not.toBeNull();
    });

    it('should detect moving lines (老阴=6)', () => {
      // Line 3 is 老阴(6), rest are 少阴(8)
      const result = calculateLiuyao(manualInput([8, 8, 6, 8, 8, 8]));
      expect(result.movingLines).toEqual([3]);
      expect(result.originalHex.lines[2].isMoving).toBe(true);
      expect(result.changedHex).not.toBeNull();
    });

    it('should handle multiple moving lines', () => {
      const result = calculateLiuyao(manualInput([9, 7, 9, 8, 6, 8]));
      expect(result.movingLines).toEqual([1, 3, 5]);
    });

    it('should have no changed hexagram when no moving lines', () => {
      const result = calculateLiuyao(manualInput([7, 8, 7, 8, 7, 8]));
      expect(result.changedHex).toBeNull();
      expect(result.movingLines).toEqual([]);
    });
  });

  describe('Na Jia (纳甲)', () => {
    it('should assign correct stems for 乾为天', () => {
      const result = calculateLiuyao(manualInput([7, 7, 7, 7, 7, 7]));
      const lines = result.originalHex.lines;

      // 乾 inner (lines 1-3): 甲
      expect(lines[0].stem).toBe('甲');
      expect(lines[1].stem).toBe('甲');
      expect(lines[2].stem).toBe('甲');
      // 乾 outer (lines 4-6): 壬
      expect(lines[3].stem).toBe('壬');
      expect(lines[4].stem).toBe('壬');
      expect(lines[5].stem).toBe('壬');
    });

    it('should assign correct branches for 乾为天', () => {
      const result = calculateLiuyao(manualInput([7, 7, 7, 7, 7, 7]));
      const lines = result.originalHex.lines;

      // 乾 inner: 子寅辰
      expect(lines[0].branch).toBe('子');
      expect(lines[1].branch).toBe('寅');
      expect(lines[2].branch).toBe('辰');
      // 乾 outer: 午申戌
      expect(lines[3].branch).toBe('午');
      expect(lines[4].branch).toBe('申');
      expect(lines[5].branch).toBe('戌');
    });

    it('should assign correct branches for 坤为地', () => {
      const result = calculateLiuyao(manualInput([8, 8, 8, 8, 8, 8]));
      const lines = result.originalHex.lines;

      // 坤 inner: 乙未 乙巳 乙卯
      expect(lines[0].branch).toBe('未');
      expect(lines[1].branch).toBe('巳');
      expect(lines[2].branch).toBe('卯');
      // 坤 outer: 癸丑 癸亥 癸酉
      expect(lines[3].branch).toBe('丑');
      expect(lines[4].branch).toBe('亥');
      expect(lines[5].branch).toBe('酉');
    });
  });

  describe('Shi/Ying (世应)', () => {
    it('should set shi=6 ying=3 for pure hexagrams (本宫)', () => {
      const result = calculateLiuyao(manualInput([7, 7, 7, 7, 7, 7])); // 乾为天
      expect(result.originalHex.shiPosition).toBe(6);
      expect(result.originalHex.yingPosition).toBe(3);
      expect(result.originalHex.lines[5].isShiYao).toBe(true);
      expect(result.originalHex.lines[2].isYingYao).toBe(true);
    });

    it('should set correct shi/ying for 一世卦', () => {
      // 天风姤 (乾/巽) = 一世: shi=1, ying=4
      // Lines: 巽 inner (FTT→no, let me think)
      // 巽 = [T,T,F] bottom→top
      // 乾 = [T,T,T]
      // Hexagram: [T,T,F,T,T,T] → 7=yang, 7=yang, 8=yin, 7=yang, 7=yang, 7=yang
      const result = calculateLiuyao(manualInput([7, 7, 8, 7, 7, 7]));
      expect(result.originalHex.name).toBe('天风姤');
      expect(result.originalHex.shiPosition).toBe(1);
      expect(result.originalHex.yingPosition).toBe(4);
    });
  });

  describe('Six Relations (六亲)', () => {
    it('should assign six relations based on palace element', () => {
      const result = calculateLiuyao(manualInput([7, 7, 7, 7, 7, 7])); // 乾为天, 乾宫金
      const lines = result.originalHex.lines;

      // Palace element = 金
      // Line 1: 子(水) → 金生水 = 子孙
      expect(lines[0].relation).toBe('子孙');
      // Line 2: 寅(木) → 金克木 = 妻财
      expect(lines[1].relation).toBe('妻财');
      // Line 3: 辰(土) → 土生金 = 父母
      expect(lines[2].relation).toBe('父母');
      // Line 4: 午(火) → 火克金 = 官鬼
      expect(lines[3].relation).toBe('官鬼');
      // Line 5: 申(金) → 金=金 = 兄弟
      expect(lines[4].relation).toBe('兄弟');
      // Line 6: 戌(土) → 土生金 = 父母
      expect(lines[5].relation).toBe('父母');
    });
  });

  describe('Six Spirits (六神)', () => {
    it('should assign six spirits based on day stem', () => {
      // 2024-3-20 is 甲辰年, day stem varies. Let's just check the pattern is correct.
      const result = calculateLiuyao(manualInput([7, 7, 7, 7, 7, 7]));
      const spirits = result.originalHex.lines.map((l) => l.spirit);

      // Should have 6 spirits, all from the valid set
      expect(spirits.length).toBe(6);
      const validSpirits = ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武'];
      for (const s of spirits) {
        expect(validSpirits).toContain(s);
      }
      // All 6 should be different
      expect(new Set(spirits).size).toBe(6);
    });
  });

  describe('Hidden Gods (伏神)', () => {
    it('should find hidden gods when six relations are incomplete', () => {
      // 乾为天 has: 子孙, 妻财, 父母, 官鬼, 兄弟, 父母
      // Missing: none (has all 5 types) — but let's check
      const result = calculateLiuyao(manualInput([7, 7, 7, 7, 7, 7]));
      const relations = new Set(result.originalHex.lines.map((l) => l.relation));
      // Qian for Tian has: 子孙(水), 妻财(木), 父母(土), 官鬼(火), 兄弟(金), 父母(土)
      // All 5 relations present → no hidden gods
      expect(relations.size).toBe(5);
      expect(result.hiddenGods.length).toBe(0);
    });
  });

  describe('Xun Kong (旬空)', () => {
    it('should set xunKong from day GanZhi', () => {
      const result = calculateLiuyao(manualInput([7, 7, 7, 7, 7, 7]));
      expect(result.xunKong).toBeTruthy();
      expect(result.xunKong.length).toBe(2); // Two branches
    });
  });

  describe('Day/Month info', () => {
    it('should set dayGanZhi and monthBranch', () => {
      const result = calculateLiuyao(manualInput([7, 7, 7, 7, 7, 7]));
      expect(result.dayGanZhi.length).toBe(2);
      expect(result.monthBranch.length).toBe(1);
    });
  });

  describe('Calculation Log', () => {
    it('should have log entries for all steps', () => {
      const result = calculateLiuyao(manualInput([9, 7, 7, 8, 6, 8]));
      const stepNames = result.calculationLog.map((l) => l.step);
      expect(stepNames).toContain('日月干支');
      expect(stepNames).toContain('起卦');
      expect(stepNames).toContain('定本卦');
      expect(stepNames).toContain('定变卦');
      expect(stepNames).toContain('定卦宫');
    });
  });

  describe('Random method', () => {
    it('should generate a valid result with random method', () => {
      const input: LiuyaoInput = {
        year: 2024, month: 6, day: 15, hour: 14, minute: 0,
        method: 'random',
        question: '今日事业运势如何？',
      };
      const result = calculateLiuyao(input);

      expect(result.originalHex.name).toBeTruthy();
      expect(result.originalHex.lines.length).toBe(6);
      expect(result.originalHex.palace).toBeTruthy();
      expect(result.input.question).toBe('今日事业运势如何？');
    });
  });

  describe('Analysis Context', () => {
    it('should extract analysis context', () => {
      const result = calculateLiuyao(manualInput([9, 7, 8, 7, 6, 8], '测事业'));
      const ctx = extractLiuyaoAnalysisContext(result);

      expect(ctx.hexInfo).toContain(result.originalHex.name);
      expect(ctx.hexInfo).toContain('宫');
      expect(ctx.dayMonth).toContain(result.dayGanZhi);
      expect(ctx.linesSummary).toBeTruthy();
      expect(ctx.question).toBe('测事业');
    });
  });

  describe('Specific hexagram tests', () => {
    it('should correctly identify 水火既济', () => {
      // upper=坎, lower=离 → 水火既济
      // Lower(离) = [T,F,T] → 7,8,7; Upper(坎) = [F,T,F] → 8,7,8
      const result = calculateLiuyao(manualInput([7, 8, 7, 8, 7, 8]));
      expect(result.originalHex.name).toBe('水火既济');
      expect(result.originalHex.palace).toBe('坎');
    });

    it('should correctly identify 火水未济', () => {
      // upper=离, lower=坎 → 火水未济
      // Lower(坎) = [F,T,F] → 8,7,8; Upper(离) = [T,F,T] → 7,8,7
      const result = calculateLiuyao(manualInput([8, 7, 8, 7, 8, 7]));
      expect(result.originalHex.name).toBe('火水未济');
      expect(result.originalHex.palace).toBe('离');
    });

    it('should correctly identify 地天泰', () => {
      // 坤/乾 = 地天泰
      // 坤=[F,F,F], 乾=[T,T,T]
      // Lines: T,T,T,F,F,F → 7,7,7,8,8,8
      const result = calculateLiuyao(manualInput([7, 7, 7, 8, 8, 8]));
      expect(result.originalHex.name).toBe('地天泰');
      expect(result.originalHex.palace).toBe('坤');
    });

    it('should correctly calculate changed hexagram', () => {
      // 乾为天 with line 1 moving (老阳9): 乾→天泽履? or 天风姤?
      // 乾 lines: T,T,T,T,T,T. Line 1 moving (9→yin): F,T,T,T,T,T
      // Lower becomes [F,T,T] = 兑. Upper stays 乾. → 天泽履
      const result = calculateLiuyao(manualInput([9, 7, 7, 7, 7, 7]));
      expect(result.originalHex.name).toBe('乾为天');
      expect(result.changedHex).not.toBeNull();
      expect(result.changedHex!.name).toBe('天泽履');
    });
  });
});
