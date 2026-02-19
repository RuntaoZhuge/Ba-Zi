'use client';

import { useTranslations } from 'next-intl';
import type { DailyFortuneContext } from '@bazi/domain';

interface DailyContextDisplayProps {
  context: DailyFortuneContext;
}

export function DailyContextDisplay({ context }: DailyContextDisplayProps) {
  const t = useTranslations('baziDaily');

  return (
    <div className="space-y-6">
      {/* Today's GanZhi */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold">{t('todayInfo')}</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="text-center">
            <div className="text-xs text-gray-400">{t('todayDate')}</div>
            <div className="mt-1 text-sm font-medium">
              {context.targetDate.year}/{context.targetDate.month}/{context.targetDate.day}
            </div>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-center">
            <div className="text-xs text-gray-400">{t('todayGanZhi')}</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">{context.todayDay}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">{t('monthGanZhi')}</div>
            <div className="mt-1 text-lg font-medium">{context.todayMonth}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">{t('yearGanZhi')}</div>
            <div className="mt-1 text-lg font-medium">{context.todayYear}</div>
          </div>
        </div>
      </section>

      {/* Current Fortune Periods */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold">{t('currentFortune')}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div className="text-xs text-gray-400">{t('currentAge')}</div>
            <div className="mt-1 text-xl font-bold text-gray-900">
              {context.currentAge} {t('age')}
            </div>
          </div>
          {context.currentDaYun && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <div className="text-xs text-blue-600">{t('currentDaYun')}</div>
              <div className="mt-1 text-xl font-bold text-blue-900">
                {context.currentDaYun.ganZhi}
              </div>
              <div className="mt-1 text-xs text-blue-500">
                {context.currentDaYun.startAge}-{context.currentDaYun.endAge} {t('age')}
              </div>
            </div>
          )}
          {context.currentLiuNian && (
            <div className="rounded-lg border border-green-100 bg-green-50 p-4">
              <div className="text-xs text-green-600">{t('currentLiuNian')}</div>
              <div className="mt-1 text-xl font-bold text-green-900">
                {context.currentLiuNian.ganZhi}
              </div>
              <div className="mt-1 text-xs text-green-500">
                {context.currentLiuNian.year}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Interactions */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold">{t('chartInteraction')}</h3>
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <div className="text-xs text-gray-400">{t('dayMaster')}</div>
            <div className="mt-1 font-medium text-gray-900">{context.dayMaster}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">{t('dayMasterRelation')}</div>
            <div className="mt-1 font-medium text-gray-900">{context.dayGanShiShen}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">{t('branchRelation')}</div>
            <div className="mt-1 font-medium text-gray-900">{context.dayZhiRelation}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">{t('xunKong')}</div>
            <div className="mt-1 font-medium text-gray-900">{context.xunKong}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
