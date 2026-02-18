'use client';

import { useTranslations } from 'next-intl';
import type { TiYongAnalysis } from '@bazi/domain';

interface TiYongPanelProps {
  tiYong: TiYongAnalysis;
}

const WUXING_BG: Record<string, string> = {
  '金': 'bg-gray-100 text-gray-800 border-gray-300',
  '木': 'bg-green-100 text-green-800 border-green-300',
  '水': 'bg-blue-100 text-blue-800 border-blue-300',
  '火': 'bg-red-100 text-red-800 border-red-300',
  '土': 'bg-yellow-100 text-yellow-800 border-yellow-300',
};

const RELATION_COLOR: Record<string, string> = {
  '生': 'text-orange-600',
  '克': 'text-gray-600',
  '被生': 'text-green-600',
  '被克': 'text-red-600',
  '比和': 'text-blue-600',
};

const RELATION_ICON: Record<string, string> = {
  '生': '→',
  '克': '⊗',
  '被生': '←',
  '被克': '✕',
  '比和': '≡',
};

export function TiYongPanel({ tiYong }: TiYongPanelProps) {
  const t = useTranslations('meihua.result');

  return (
    <div className="space-y-4">
      {/* Ti and Yong display */}
      <div className="flex items-center justify-center gap-6">
        {/* Ti */}
        <div className={`rounded-lg border px-5 py-3 text-center ${WUXING_BG[tiYong.ti.wuxing]}`}>
          <div className="text-xs font-medium opacity-70">{t('ti')}</div>
          <div className="mt-1 text-2xl">{tiYong.ti.symbol}</div>
          <div className="mt-1 text-sm font-bold">{tiYong.ti.name}</div>
          <div className="text-xs">{tiYong.ti.wuxing} · {tiYong.ti.image}</div>
        </div>

        {/* Relation */}
        <div className="text-center">
          <div className={`text-2xl font-bold ${RELATION_COLOR[tiYong.relation]}`}>
            {RELATION_ICON[tiYong.relation]}
          </div>
          <div className={`mt-1 text-sm font-medium ${RELATION_COLOR[tiYong.relation]}`}>
            {tiYong.relation === '比和' ? '比和' : `体${tiYong.relation}用`}
          </div>
        </div>

        {/* Yong */}
        <div className={`rounded-lg border px-5 py-3 text-center ${WUXING_BG[tiYong.yong.wuxing]}`}>
          <div className="text-xs font-medium opacity-70">{t('yong')}</div>
          <div className="mt-1 text-2xl">{tiYong.yong.symbol}</div>
          <div className="mt-1 text-sm font-bold">{tiYong.yong.name}</div>
          <div className="text-xs">{tiYong.yong.wuxing} · {tiYong.yong.image}</div>
        </div>
      </div>

      {/* Summary */}
      <div className="text-center text-sm text-gray-600">
        {tiYong.summary}
      </div>
    </div>
  );
}
