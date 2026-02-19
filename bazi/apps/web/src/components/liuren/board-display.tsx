'use client';

import type { LiurenResult, LiurenPosition, LiurenLesson } from '@bazi/domain';
import { useTranslations } from 'next-intl';

interface BoardDisplayProps {
  result: LiurenResult;
}

/**
 * Traditional square layout for the 12-position board:
 *   巳  午  未  申
 *   辰          酉
 *   卯          戌
 *   寅  丑  子  亥
 */
const GRID_TOP = ['巳', '午', '未', '申'];
const GRID_RIGHT = ['酉', '戌'];
const GRID_BOTTOM = ['亥', '子', '丑', '寅'];
const GRID_LEFT = ['卯', '辰'];

function PositionCell({ pos }: { pos: LiurenPosition }) {
  return (
    <div className="border border-gray-200 p-1.5 text-center text-xs min-w-[4rem]">
      <div className="text-purple-600 text-[10px] truncate">{pos.general || ''}</div>
      <div className="font-bold text-gray-900">{pos.heavenBranch}</div>
      <div className="text-gray-400">{pos.earthBranch}</div>
    </div>
  );
}

function findPosition(positions: LiurenPosition[], earthBranch: string): LiurenPosition {
  return positions.find((p) => p.earthBranch === earthBranch)!;
}

function BoardGrid({ positions }: { positions: LiurenPosition[] }) {
  return (
    <div className="inline-block">
      {/* Top row: 巳午未申 */}
      <div className="flex">
        {GRID_TOP.map((b) => (
          <PositionCell key={b} pos={findPosition(positions, b)} />
        ))}
      </div>
      {/* Middle rows */}
      <div className="flex">
        <PositionCell pos={findPosition(positions, GRID_LEFT[1])} />
        <div className="flex-1 border border-gray-100 min-w-[8rem] min-h-[3rem]" />
        <PositionCell pos={findPosition(positions, GRID_RIGHT[0])} />
      </div>
      <div className="flex">
        <PositionCell pos={findPosition(positions, GRID_LEFT[0])} />
        <div className="flex-1 border border-gray-100 min-w-[8rem] min-h-[3rem]" />
        <PositionCell pos={findPosition(positions, GRID_RIGHT[1])} />
      </div>
      {/* Bottom row: 寅丑子亥 (reversed for visual) */}
      <div className="flex">
        {GRID_BOTTOM.reverse().map((b) => (
          <PositionCell key={b} pos={findPosition(positions, b)} />
        ))}
      </div>
    </div>
  );
}

function LessonsDisplay({ lessons }: { lessons: LiurenLesson[] }) {
  const t = useTranslations('liuren.result');
  return (
    <div className="flex gap-3">
      {lessons.map((l, i) => (
        <div key={i} className="rounded-md border border-gray-200 p-2 text-center text-xs min-w-[4rem]">
          <div className="text-[10px] text-gray-400">{t('lesson')}{i + 1}</div>
          <div className="font-bold text-gray-900">{l.top}</div>
          <div className="border-t border-gray-200 my-0.5" />
          <div className="text-gray-600">{l.bottom}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">{l.relation}</div>
        </div>
      ))}
    </div>
  );
}

function TransmissionDisplay({ result }: { result: LiurenResult }) {
  const t = useTranslations('liuren.result');
  const tr = result.board.transmission;
  const items = [
    { label: t('initial'), branch: tr.initial, general: tr.initialGeneral },
    { label: t('middle'), branch: tr.middle, general: tr.middleGeneral },
    { label: t('final'), branch: tr.final, general: tr.finalGeneral },
  ];

  return (
    <div className="flex gap-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-md border border-blue-200 bg-blue-50 p-2 text-center text-xs min-w-[4rem]">
          <div className="text-[10px] text-blue-400">{item.label}</div>
          <div className="font-bold text-blue-900">{item.branch}</div>
          {item.general && (
            <div className="text-[10px] text-purple-600">{item.general}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export function BoardDisplay({ result }: BoardDisplayProps) {
  const t = useTranslations('liuren.result');

  return (
    <div className="space-y-6">
      {/* Info bar */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        <span>{t('dayGanZhi')}: <span className="font-medium text-gray-900">{result.dayGanZhi}</span></span>
        <span>{t('hourGanZhi')}: <span className="font-medium text-gray-900">{result.hourGanZhi}</span></span>
        <span>{t('monthJiang')}: <span className="font-medium text-gray-900">{result.board.monthJiang}({result.board.monthJiangName})</span></span>
        <span>{t('xunKong')}: <span className="font-medium text-gray-900">{result.board.xunKong}</span></span>
      </div>

      {/* Three Transmissions */}
      <div>
        <h3 className="text-sm font-semibold mb-2">{t('transmission')} <span className="text-xs text-gray-400 font-normal">({t('method')}: {result.board.transmission.method})</span></h3>
        <TransmissionDisplay result={result} />
      </div>

      {/* Four Lessons */}
      <div>
        <h3 className="text-sm font-semibold mb-2">{t('lessons')}</h3>
        <LessonsDisplay lessons={result.board.lessons} />
      </div>

      {/* Board */}
      <div>
        <h3 className="text-sm font-semibold mb-2">{t('board')}</h3>
        <BoardGrid positions={result.board.positions} />
      </div>
    </div>
  );
}
