'use client';

import { useTranslations } from 'next-intl';
import type { WuXing } from '@bazi/domain';

/**
 * Pentagon order: 木(top) → 火(top-right) → 土(bottom-right) → 金(bottom-left) → 水(top-left)
 * Following the traditional 五行相生 cycle clockwise.
 */
const WUXING_ORDER: WuXing[] = ['木', '火', '土', '金', '水'];

const WUXING_COLORS: Record<WuXing, string> = {
  '木': '#22c55e',
  '火': '#ef4444',
  '土': '#eab308',
  '金': '#6b7280',
  '水': '#3b82f6',
};

interface WuxingChartProps {
  distribution: Record<WuXing, number>;
}

const CX = 150;
const CY = 150;
const R = 110;
const LEVELS = 5;

/** Get the (x, y) coordinate for a vertex at index i (0-4), at given radius. */
function getPoint(i: number, radius: number): [number, number] {
  // Start from top (-90°), go clockwise
  const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
  return [CX + radius * Math.cos(angle), CY + radius * Math.sin(angle)];
}

/** Build a polygon path string for given radius. */
function polygonPath(radius: number): string {
  return WUXING_ORDER.map((_, i) => {
    const [x, y] = getPoint(i, radius);
    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
  }).join(' ') + ' Z';
}

export function WuxingChart({ distribution }: WuxingChartProps) {
  const t = useTranslations('bazi');
  const maxValue = Math.max(...Object.values(distribution), 1);

  // Build the data polygon
  const dataPoints = WUXING_ORDER.map((wx, i) => {
    const value = distribution[wx];
    const ratio = value / maxValue;
    // Minimum 8% radius so zero values are still slightly visible
    const r = R * Math.max(ratio, 0.08);
    return getPoint(i, r);
  });

  const dataPath =
    dataPoints.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ') + ' Z';

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 300 300" className="h-64 w-64">
        {/* Grid levels */}
        {Array.from({ length: LEVELS }, (_, level) => {
          const r = (R / LEVELS) * (level + 1);
          return (
            <path
              key={level}
              d={polygonPath(r)}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={level === LEVELS - 1 ? 1.5 : 0.8}
            />
          );
        })}

        {/* Axis lines from center to each vertex */}
        {WUXING_ORDER.map((_, i) => {
          const [x, y] = getPoint(i, R);
          return (
            <line
              key={i}
              x1={CX}
              y1={CY}
              x2={x}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth={0.8}
            />
          );
        })}

        {/* Data fill */}
        <path d={dataPath} fill="rgba(99,102,241,0.15)" stroke="#6366f1" strokeWidth={2} />

        {/* Data dots */}
        {dataPoints.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={4}
            fill={WUXING_COLORS[WUXING_ORDER[i]]}
            stroke="white"
            strokeWidth={1.5}
          />
        ))}

        {/* Labels */}
        {WUXING_ORDER.map((wx, i) => {
          const [x, y] = getPoint(i, R + 22);
          return (
            <text
              key={wx}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-xs font-medium"
              fill={WUXING_COLORS[wx]}
            >
              {t(`wuxing.${wx}`)} {distribution[wx]}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
