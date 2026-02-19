'use client';

import type { ZiweiChart, ZiweiPalace, ZiweiStar, ZiweiPalaceName } from '@bazi/domain';

interface PalaceChartProps {
  chart: ZiweiChart;
}

/**
 * Traditional Zi Wei Dou Shu palace layout (4x4 grid, hollow center):
 *
 *   巳(5)  午(6)  未(7)  申(8)
 *   辰(4)  [center]       酉(9)
 *   卯(3)  [center]       戌(10)
 *   寅(2)  丑(1)  子(0)  亥(11)
 *
 * Grid positions (row, col) for each branch index:
 */
const BRANCH_GRID_POSITIONS: Record<number, [number, number]> = {
  5:  [0, 0], // 巳
  6:  [0, 1], // 午
  7:  [0, 2], // 未
  8:  [0, 3], // 申
  4:  [1, 0], // 辰
  9:  [1, 3], // 酉
  3:  [2, 0], // 卯
  10: [2, 3], // 戌
  2:  [3, 0], // 寅
  1:  [3, 1], // 丑
  0:  [3, 2], // 子
  11: [3, 3], // 亥
};

const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const BRIGHTNESS_COLORS: Record<string, string> = {
  '庙': 'text-amber-600',
  '旺': 'text-amber-500',
  '得': 'text-blue-600',
  '利': 'text-blue-500',
  '平': 'text-gray-500',
  '不': 'text-red-400',
  '陷': 'text-red-500',
};

const SIHUA_COLORS: Record<string, string> = {
  '化禄': 'text-green-600',
  '化权': 'text-red-600',
  '化科': 'text-blue-600',
  '化忌': 'text-gray-500',
};

const SIHUA_SHORT: Record<string, string> = {
  '化禄': '禄',
  '化权': '权',
  '化科': '科',
  '化忌': '忌',
};

function StarLabel({ star }: { star: ZiweiStar }) {
  const brightnessClass = star.brightness ? BRIGHTNESS_COLORS[star.brightness] || '' : '';
  const isMain = star.type === 'main';

  return (
    <span className={`inline-flex items-center gap-0.5 ${isMain ? 'font-medium' : 'text-gray-400'} ${isMain ? brightnessClass : ''}`}>
      <span className={isMain ? 'text-xs' : 'text-[10px]'}>{star.name}</span>
      {star.brightness && isMain && (
        <span className="text-[9px] opacity-70">{star.brightness}</span>
      )}
      {star.siHua && (
        <span className={`text-[9px] font-bold ${SIHUA_COLORS[star.siHua] || ''}`}>
          {SIHUA_SHORT[star.siHua]}
        </span>
      )}
    </span>
  );
}

function PalaceCell({
  palace,
  isMing,
  isShen,
}: {
  palace: ZiweiPalace;
  isMing: boolean;
  isShen: boolean;
}) {
  const mainStars = palace.stars.filter(s => s.type === 'main');
  const auxStars = palace.stars.filter(s => s.type === 'aux');

  return (
    <div
      className={`flex flex-col border border-gray-200 p-1.5 min-h-[120px] ${
        isMing ? 'ring-2 ring-amber-400 bg-amber-50/30' : isShen ? 'ring-1 ring-blue-300 bg-blue-50/20' : 'bg-white'
      }`}
    >
      {/* Header: palace name + branch */}
      <div className="flex items-center justify-between mb-1">
        <span className={`text-[10px] font-bold ${isMing ? 'text-amber-700' : isShen ? 'text-blue-700' : 'text-gray-600'}`}>
          {palace.name}
          {isMing && ' ★'}
          {isShen && ' ◆'}
        </span>
        <span className="text-[10px] text-gray-400">{palace.stem}{palace.branch}</span>
      </div>

      {/* Main stars */}
      <div className="flex flex-wrap gap-x-1 gap-y-0.5">
        {mainStars.map((star, i) => (
          <StarLabel key={i} star={star} />
        ))}
      </div>

      {/* Aux stars */}
      {auxStars.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-x-1 gap-y-0.5 pt-1 border-t border-gray-100">
          {auxStars.map((star, i) => (
            <StarLabel key={i} star={star} />
          ))}
        </div>
      )}

      {/* Decade luck age */}
      {palace.decadeLuckAge && (
        <div className="mt-0.5 text-right text-[9px] text-gray-300">
          {palace.decadeLuckAge}
        </div>
      )}
    </div>
  );
}

function CenterInfo({ chart }: { chart: ZiweiChart }) {
  return (
    <div className="col-span-2 row-span-2 flex flex-col items-center justify-center border border-gray-200 bg-gray-50 p-3">
      <div className="text-center space-y-2">
        <div className="text-lg font-bold text-gray-800">{chart.wuxingJu}</div>
        <div className="text-xs text-gray-500 space-y-1">
          <div>命宫: <span className="font-medium text-amber-700">{chart.mingPalace}</span></div>
          <div>身宫: <span className="font-medium text-blue-700">{chart.shenPalace}</span></div>
          <div>命主: <span className="font-medium">{chart.mingZhu}</span></div>
          <div>身主: <span className="font-medium">{chart.shenZhu}</span></div>
        </div>
      </div>
    </div>
  );
}

export function PalaceChart({ chart }: PalaceChartProps) {
  // Build a lookup: branchIndex → palace
  const palaceByBranch = new Map<number, ZiweiPalace>();
  for (const palace of chart.palaces) {
    const branchIndex = BRANCHES.indexOf(palace.branch);
    if (branchIndex >= 0) {
      palaceByBranch.set(branchIndex, palace);
    }
  }

  // Find ming/shen palace branch
  const mingBranch = chart.palaces.find(p => p.name === '命宫')?.branch;
  const shenPalaceName = chart.shenPalace;

  // Build 4x4 grid
  const grid: (ZiweiPalace | 'center' | null)[][] = Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => null)
  );

  // Place palaces
  for (const [branchIndex, [row, col]] of Object.entries(BRANCH_GRID_POSITIONS)) {
    const palace = palaceByBranch.get(Number(branchIndex));
    if (palace) {
      grid[row][col] = palace;
    }
  }

  // Mark center cells
  grid[1][1] = 'center';
  grid[1][2] = 'center';
  grid[2][1] = 'center';
  grid[2][2] = 'center';

  return (
    <div className="grid grid-cols-4 gap-0 rounded-lg border border-gray-300 overflow-hidden">
      {grid.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          if (cell === 'center') {
            // Only render center once at position [1,1]
            if (rowIdx === 1 && colIdx === 1) {
              return <CenterInfo key={`${rowIdx}-${colIdx}`} chart={chart} />;
            }
            return null; // Other center cells are merged
          }

          if (cell) {
            const isMing = cell.branch === mingBranch;
            const isShen = !isMing && cell.name === shenPalaceName;
            return (
              <PalaceCell
                key={`${rowIdx}-${colIdx}`}
                palace={cell}
                isMing={isMing}
                isShen={isShen}
              />
            );
          }

          return <div key={`${rowIdx}-${colIdx}`} className="border border-gray-200 bg-gray-100" />;
        })
      )}
    </div>
  );
}
