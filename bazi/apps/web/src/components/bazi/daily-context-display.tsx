'use client';

import { useTranslations, useLocale } from 'next-intl';
import type { DailyFortuneContext, WuXing } from '@bazi/domain';

interface DailyContextDisplayProps {
  context: DailyFortuneContext;
}

// === Color & Jewelry mappings by WuXing ===

const WUXING_COLORS: Record<WuXing, { zh: string[]; en: string[]; swatches: string[] }> = {
  '木': { zh: ['绿色', '青色', '翠色'], en: ['Green', 'Teal', 'Emerald'], swatches: ['#22c55e', '#10b981', '#059669'] },
  '火': { zh: ['红色', '紫色', '橙色'], en: ['Red', 'Purple', 'Orange'], swatches: ['#ef4444', '#a855f7', '#f97316'] },
  '土': { zh: ['黄色', '棕色', '米色'], en: ['Yellow', 'Brown', 'Beige'], swatches: ['#eab308', '#a16207', '#d4a574'] },
  '金': { zh: ['白色', '银色', '金色'], en: ['White', 'Silver', 'Gold'], swatches: ['#e5e7eb', '#c0c0c0', '#fbbf24'] },
  '水': { zh: ['黑色', '深蓝', '灰色'], en: ['Black', 'Navy', 'Gray'], swatches: ['#1f2937', '#1e40af', '#6b7280'] },
};

const WUXING_JEWELRY: Record<WuXing, { zh: string[]; en: string[] }> = {
  '木': { zh: ['翡翠', '绿松石', '橄榄石'], en: ['Jade', 'Turquoise', 'Peridot'] },
  '火': { zh: ['红宝石', '石榴石', '紫水晶'], en: ['Ruby', 'Garnet', 'Amethyst'] },
  '土': { zh: ['黄水晶', '虎眼石', '琥珀'], en: ['Citrine', 'Tiger Eye', 'Amber'] },
  '金': { zh: ['铂金', '银饰', '白水晶'], en: ['Platinum', 'Silver', 'Clear Quartz'] },
  '水': { zh: ['黑曜石', '蓝宝石', '珍珠'], en: ['Obsidian', 'Sapphire', 'Pearl'] },
};

function ColorSwatch({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-5 w-5 rounded-full border border-gray-200"
      style={{ backgroundColor: color }}
    />
  );
}

export function DailyContextDisplay({ context }: DailyContextDisplayProps) {
  const t = useTranslations('baziDaily');
  const locale = useLocale();
  const lang = locale === 'en' ? 'en' : 'zh';
  const sep = lang === 'zh' ? '、' : ', ';

  const yong = context.yongShen;
  const xi = context.xiShen;
  const ji = context.jiShen;

  const luckyElements: WuXing[] = yong === xi ? [yong] : [yong, xi];
  const luckySwatches = luckyElements.flatMap((el) => WUXING_COLORS[el].swatches);
  const luckyColorNames = luckyElements.flatMap((el) => WUXING_COLORS[el][lang]);
  const avoidColorNames = WUXING_COLORS[ji][lang];
  const avoidSwatches = WUXING_COLORS[ji].swatches;
  const jewelryNames = luckyElements.flatMap((el) => WUXING_JEWELRY[el][lang]);

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

      {/* Daily Style Recommendations */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold">{t('recommendations')}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Lucky Colors */}
          <div className="rounded-lg border border-green-100 bg-green-50 p-4">
            <div className="text-xs font-medium text-green-700">{t('luckyColors')}</div>
            <div className="mt-2 flex items-center gap-1.5">
              {luckySwatches.map((sw, i) => (
                <ColorSwatch key={i} color={sw} />
              ))}
            </div>
            <div className="mt-2 text-sm font-medium text-green-900">
              {luckyColorNames.join(sep)}
            </div>
            <div className="mt-1 text-xs text-green-600">
              {t('yongShenLabel')}：{yong}{yong !== xi ? ` / ${t('xiShenLabel')}：${xi}` : ''}
            </div>
          </div>

          {/* Avoid Colors */}
          <div className="rounded-lg border border-red-100 bg-red-50 p-4">
            <div className="text-xs font-medium text-red-700">{t('avoidColors')}</div>
            <div className="mt-2 flex items-center gap-1.5">
              {avoidSwatches.map((sw, i) => (
                <ColorSwatch key={i} color={sw} />
              ))}
            </div>
            <div className="mt-2 text-sm font-medium text-red-900">
              {avoidColorNames.join(sep)}
            </div>
            <div className="mt-1 text-xs text-red-600">
              {ji}
            </div>
          </div>

          {/* Jewelry */}
          <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
            <div className="text-xs font-medium text-amber-700">{t('jewelry')}</div>
            <div className="mt-2 flex items-center gap-1.5">
              {luckySwatches.slice(0, 3).map((sw, i) => (
                <ColorSwatch key={i} color={sw} />
              ))}
            </div>
            <div className="mt-2 text-sm font-medium text-amber-900">
              {jewelryNames.join(sep)}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
