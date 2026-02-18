'use client';

import type { Hexagram, ChangingLinePosition } from '@bazi/domain';

interface HexagramDisplayProps {
  hexagram: Hexagram;
  changingLine?: ChangingLinePosition;
  label: string;
}

const WUXING_COLORS: Record<string, string> = {
  '金': 'text-gray-600',
  '木': 'text-green-600',
  '水': 'text-blue-600',
  '火': 'text-red-600',
  '土': 'text-yellow-700',
};

function YangLine({ isChanging }: { isChanging: boolean }) {
  return (
    <div className={`flex items-center justify-center ${isChanging ? 'text-red-500' : 'text-gray-800'}`}>
      <div className={`h-1.5 w-full rounded-sm ${isChanging ? 'bg-red-500' : 'bg-gray-800'}`} />
      {isChanging && <span className="ml-1 text-xs text-red-500">○</span>}
    </div>
  );
}

function YinLine({ isChanging }: { isChanging: boolean }) {
  return (
    <div className={`flex items-center justify-center ${isChanging ? 'text-red-500' : 'text-gray-800'}`}>
      <div className="flex w-full items-center gap-2">
        <div className={`h-1.5 flex-1 rounded-sm ${isChanging ? 'bg-red-500' : 'bg-gray-800'}`} />
        <div className="w-3" />
        <div className={`h-1.5 flex-1 rounded-sm ${isChanging ? 'bg-red-500' : 'bg-gray-800'}`} />
      </div>
      {isChanging && <span className="ml-1 text-xs text-red-500">×</span>}
    </div>
  );
}

export function HexagramDisplay({ hexagram, changingLine, label }: HexagramDisplayProps) {
  // Render lines from top (index 5) to bottom (index 0)
  const lines = [...hexagram.lines].reverse();
  const linePositions = [6, 5, 4, 3, 2, 1]; // visual top→bottom

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
      {/* Label */}
      <div className="mb-2 text-xs font-medium text-gray-400">{label}</div>

      {/* Hexagram Name */}
      <div className="mb-3 text-lg font-bold text-gray-900">{hexagram.name}</div>

      {/* Upper trigram label */}
      <div className="mb-1 flex items-center justify-center gap-1 text-xs">
        <span className={WUXING_COLORS[hexagram.upper.wuxing] ?? 'text-gray-500'}>
          {hexagram.upper.symbol} {hexagram.upper.name}({hexagram.upper.wuxing})
        </span>
      </div>

      {/* Lines */}
      <div className="mx-auto w-24 space-y-1.5">
        {lines.map((isYang, i) => {
          const pos = linePositions[i];
          const isChanging = changingLine === pos;
          return isYang ? (
            <YangLine key={pos} isChanging={isChanging} />
          ) : (
            <YinLine key={pos} isChanging={isChanging} />
          );
        })}
      </div>

      {/* Lower trigram label */}
      <div className="mt-1 flex items-center justify-center gap-1 text-xs">
        <span className={WUXING_COLORS[hexagram.lower.wuxing] ?? 'text-gray-500'}>
          {hexagram.lower.symbol} {hexagram.lower.name}({hexagram.lower.wuxing})
        </span>
      </div>

      {/* GuaCi */}
      <div className="mt-3 text-xs text-gray-500 leading-relaxed">
        {hexagram.guaCi}
      </div>
    </div>
  );
}
