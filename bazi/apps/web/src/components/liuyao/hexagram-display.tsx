'use client';

import type { LiuyaoResult, LiuyaoLine, SixRelation } from '@bazi/domain';

interface HexagramDisplayProps {
  result: LiuyaoResult;
}

/** Color map for six relations */
function relationColor(rel: SixRelation): string {
  switch (rel) {
    case '官鬼': return 'text-red-600';
    case '妻财': return 'text-amber-600';
    case '父母': return 'text-blue-600';
    case '兄弟': return 'text-gray-600';
    case '子孙': return 'text-green-600';
    default: return 'text-gray-700';
  }
}

/** Yao symbol: solid for yang, broken for yin */
function yaoSymbol(line: LiuyaoLine): string {
  return line.isYang ? '━━━' : '━ ━';
}

/** Moving mark: circle for old yang (9), cross for old yin (6) */
function movingMark(line: LiuyaoLine): string {
  if (!line.isMoving) return '';
  return line.value === 9 ? ' ○' : ' ×';
}

/** Shi/Ying label */
function shiYingLabel(line: LiuyaoLine): string {
  if (line.isShiYao) return '世';
  if (line.isYingYao) return '应';
  return '';
}

export function HexagramDisplay({ result }: HexagramDisplayProps) {
  const { originalHex, changedHex, hiddenGods } = result;

  // Lines displayed from top (6) to bottom (1)
  const linesTopDown = [...originalHex.lines].sort((a, b) => b.position - a.position);

  // Changed hex lines map for quick lookup
  const changedLinesMap = new Map<number, LiuyaoLine>();
  if (changedHex) {
    for (const l of changedHex.lines) {
      changedLinesMap.set(l.position, l);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header: hexagram names */}
      <div className="flex items-baseline gap-6">
        <div>
          <span className="text-lg font-bold text-gray-900">{originalHex.name}</span>
          <span className="ml-2 text-sm text-gray-500">
            ({originalHex.palace}宫 · {originalHex.palaceElement})
          </span>
        </div>
        {changedHex && (
          <div>
            <span className="text-gray-400 mr-2">→</span>
            <span className="text-lg font-bold text-gray-900">{changedHex.name}</span>
            <span className="ml-2 text-sm text-gray-500">
              ({changedHex.palace}宫 · {changedHex.palaceElement})
            </span>
          </div>
        )}
      </div>

      {/* Hexagram table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-300 text-xs text-gray-500">
              <th className="py-2 px-2 text-left font-medium">六神</th>
              <th className="py-2 px-2 text-left font-medium">六亲</th>
              <th className="py-2 px-2 text-left font-medium">干支(五行)</th>
              <th className="py-2 px-3 text-center font-medium">本卦</th>
              <th className="py-2 px-2 text-center font-medium">世应</th>
              {changedHex && (
                <th className="py-2 px-2 text-left font-medium">变爻</th>
              )}
            </tr>
          </thead>
          <tbody>
            {linesTopDown.map((line) => {
              const changedLine = changedLinesMap.get(line.position);
              const isMoving = line.isMoving;
              const rowBg = isMoving ? 'bg-amber-50' : '';

              return (
                <tr key={line.position} className={`border-b border-gray-100 ${rowBg}`}>
                  {/* Six Spirit */}
                  <td className="py-2 px-2 text-gray-500 whitespace-nowrap">
                    {line.spirit}
                  </td>

                  {/* Six Relation */}
                  <td className={`py-2 px-2 whitespace-nowrap font-medium ${relationColor(line.relation)}`}>
                    {line.relation}
                  </td>

                  {/* Stem + Branch (Element) */}
                  <td className="py-2 px-2 whitespace-nowrap text-gray-700">
                    {line.stem}{line.branch}
                    <span className="text-gray-400">({line.element})</span>
                  </td>

                  {/* Yao symbol + moving mark */}
                  <td className="py-2 px-3 text-center font-mono whitespace-nowrap">
                    <span className={isMoving ? 'text-amber-700 font-bold' : 'text-gray-800'}>
                      {yaoSymbol(line)}
                    </span>
                    {isMoving && (
                      <span className="text-amber-600 font-bold">{movingMark(line)}</span>
                    )}
                  </td>

                  {/* Shi/Ying */}
                  <td className="py-2 px-2 text-center">
                    {shiYingLabel(line) && (
                      <span className="font-bold text-gray-900">{shiYingLabel(line)}</span>
                    )}
                  </td>

                  {/* Changed line */}
                  {changedHex && (
                    <td className="py-2 px-2 whitespace-nowrap">
                      {isMoving && changedLine ? (
                        <span className="text-gray-600">
                          → {changedLine.branch}
                          <span className="text-gray-400">({changedLine.element})</span>
                          <span className={`ml-1 ${relationColor(changedLine.relation)}`}>
                            {changedLine.relation}
                          </span>
                        </span>
                      ) : null}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Metadata bar */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500 border-t border-gray-200 pt-3">
        <span>日干支: <span className="font-medium text-gray-700">{result.dayGanZhi}</span></span>
        <span>月建: <span className="font-medium text-gray-700">{result.monthBranch}</span></span>
        <span>旬空: <span className="font-medium text-gray-700">{result.xunKong}</span></span>
      </div>

      {/* Hidden gods */}
      {hiddenGods.length > 0 && (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
          <h4 className="text-xs font-semibold text-gray-600 mb-2">伏神</h4>
          <div className="flex flex-wrap gap-3 text-xs">
            {hiddenGods.map((hg, i) => (
              <span key={i} className="text-gray-600">
                第{hg.position}爻:
                <span className={`ml-1 font-medium ${relationColor(hg.relation)}`}>
                  {hg.relation}
                </span>
                <span className="text-gray-400 ml-0.5">
                  ({hg.branch} · {hg.element})
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
