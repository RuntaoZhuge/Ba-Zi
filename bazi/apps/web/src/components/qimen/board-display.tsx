'use client';

import type { QimenBoard, QimenPalace, PalaceNumber } from '@bazi/domain';

interface BoardDisplayProps {
  board: QimenBoard;
}

/**
 * Traditional Luo Shu 3×3 layout (south on top):
 *
 *   巽4(东南)  离9(南)   坤2(西南)
 *   震3(东)    中5       兑7(西)
 *   艮8(东北)  坎1(北)   乾6(西北)
 */
const GRID_LAYOUT: PalaceNumber[][] = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
];

const DEITY_COLOR = 'text-purple-600';
const STAR_COLOR = 'text-blue-600';
const GATE_COLOR = 'text-green-700 font-bold';
const HEAVEN_STEM_COLOR = 'text-red-600';
const EARTH_STEM_COLOR = 'text-gray-500';

function PalaceCell({ palace, board }: { palace: QimenPalace; board: QimenBoard }) {
  const isCenter = palace.palaceNumber === 5;

  if (isCenter) {
    return (
      <div className="flex flex-col items-center justify-center border border-gray-300 bg-amber-50/50 p-2 min-h-[140px]">
        <div className="text-sm font-bold text-amber-800 mb-1">
          {board.dunType}{board.juNumber}局
        </div>
        <div className="text-[11px] text-gray-600 space-y-0.5 text-center">
          <div>{board.jieQi} {board.yuan}</div>
          <div>值符: <span className={STAR_COLOR}>{board.zhiFuStar}</span></div>
          <div>值使: <span className={GATE_COLOR}>{board.zhiShiGate}</span></div>
          <div>旬首: {board.xunShou}({board.xunShouYi})</div>
          <div>空亡: {board.xunKong}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col border border-gray-300 bg-white p-1.5 min-h-[140px]">
      {/* Deity */}
      <div className={`text-[10px] ${DEITY_COLOR}`}>{palace.deity}</div>

      {/* Star */}
      <div className={`text-xs ${STAR_COLOR}`}>{palace.star}</div>

      {/* Heaven stem / Earth stem */}
      <div className="text-xs mt-1">
        <span className={HEAVEN_STEM_COLOR}>{palace.heavenStem}</span>
        <span className="text-gray-300"> / </span>
        <span className={EARTH_STEM_COLOR}>{palace.earthStem}</span>
      </div>

      {/* Gate */}
      <div className={`text-xs mt-1 ${GATE_COLOR}`}>{palace.gate}</div>

      {/* Patterns */}
      {palace.patterns.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-0.5 pt-1">
          {palace.patterns.map((p, i) => (
            <span key={i} className="rounded bg-yellow-100 px-1 text-[9px] text-yellow-800">
              {p}
            </span>
          ))}
        </div>
      )}

      {/* Palace info */}
      <div className="mt-auto pt-1 border-t border-gray-100 text-[9px] text-gray-400">
        {palace.trigram}{palace.palaceNumber}宫 · {palace.direction}
      </div>
    </div>
  );
}

export function BoardDisplay({ board }: BoardDisplayProps) {
  const palaceMap = new Map<PalaceNumber, QimenPalace>();
  for (const p of board.palaces) {
    palaceMap.set(p.palaceNumber, p);
  }

  return (
    <div className="grid grid-cols-3 gap-0 rounded-lg border border-gray-400 overflow-hidden">
      {GRID_LAYOUT.flat().map((num) => {
        const palace = palaceMap.get(num);
        if (!palace) return <div key={num} className="border border-gray-300 bg-gray-100 min-h-[140px]" />;
        return <PalaceCell key={num} palace={palace} board={board} />;
      })}
    </div>
  );
}
