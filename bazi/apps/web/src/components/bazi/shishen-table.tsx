'use client';

import { useTranslations } from 'next-intl';
import type { ShiShenAnalysis, ShiShenPillar, FourPillars, Pillar } from '@bazi/domain';

interface ShiShenTableProps {
  shishen: ShiShenAnalysis;
  fourPillars: FourPillars;
}

export function ShiShenTable({ shishen, fourPillars }: ShiShenTableProps) {
  const t = useTranslations('bazi.result');

  const pillars: { key: string; label: string; data: ShiShenPillar | null; pillar: Pillar | null }[] = [
    { key: 'year', label: t('yearPillar'), data: shishen.year, pillar: fourPillars.year },
    { key: 'month', label: t('monthPillar'), data: shishen.month, pillar: fourPillars.month },
    { key: 'day', label: t('dayPillar'), data: shishen.day, pillar: fourPillars.day },
    { key: 'hour', label: t('hourPillar'), data: shishen.hour, pillar: fourPillars.hour },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500"></th>
            {pillars.map(({ key, label }) => (
              <th
                key={key}
                className="px-3 py-2 text-center text-xs font-medium text-gray-500"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-100">
            <td className="px-3 py-2 text-xs text-gray-400">
              {t('heavenlyStem')}
            </td>
            {pillars.map(({ key, data, pillar }) => (
              <td key={key} className="px-3 py-2 text-center">
                {pillar && data ? (
                  <>
                    <div className="font-medium">{pillar.stemBranch.stem}</div>
                    <div className="text-xs text-gray-500">{data.stem}</div>
                  </>
                ) : (
                  <div className="text-xs text-gray-400">{t('hourUnknown')}</div>
                )}
              </td>
            ))}
          </tr>
          <tr>
            <td className="px-3 py-2 text-xs text-gray-400">
              {t('earthlyBranch')}
            </td>
            {pillars.map(({ key, data, pillar }) => (
              <td key={key} className="px-3 py-2 text-center">
                {pillar && data ? (
                  <>
                    <div className="font-medium">{pillar.stemBranch.branch}</div>
                    <div className="space-y-0.5">
                      {data.branch.map((ss, i) => (
                        <div key={i} className="text-xs text-gray-500">
                          {pillar.hiddenStems[i]} {ss}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-gray-400">-</div>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
