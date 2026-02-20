'use client';

import { useTranslations } from 'next-intl';
import type { BusinessCompatibility, BaZiResult } from '@bazi/domain';
import { PillarChart } from './pillar-chart';

interface BusinessResultDisplayProps {
  compatibility: BusinessCompatibility;
  person1Result: BaZiResult;
  person2Result: BaZiResult;
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="h-32 w-32 -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="54"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-gray-100"
        />
        <circle
          cx="64"
          cy="64"
          r="54"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={color}
        />
      </svg>
      <span className="absolute text-3xl font-bold text-gray-900">{score}</span>
    </div>
  );
}

function DimensionCard({
  label,
  desc,
  score,
  children,
}: {
  label: string;
  desc: string;
  score: number;
  children: React.ReactNode;
}) {
  const barColor =
    score >= 80
      ? 'bg-green-500'
      : score >= 60
        ? 'bg-yellow-500'
        : 'bg-red-500';

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">{label}</div>
          <div className="text-xs text-gray-400">{desc}</div>
        </div>
        <div className="text-lg font-bold text-gray-900">{score}</div>
      </div>
      <div className="mb-3 h-1.5 w-full rounded-full bg-gray-100">
        <div
          className={`h-1.5 rounded-full ${barColor}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="space-y-1 text-xs text-gray-600">{children}</div>
    </div>
  );
}

export function BusinessResultDisplay({
  compatibility,
  person1Result,
  person2Result,
}: BusinessResultDisplayProps) {
  const t = useTranslations('baziBusiness');

  const { dayMasterRelation, wuxingBalance, yongShenMatch, branchRelations, nayinMatch } =
    compatibility;

  return (
    <div className="space-y-8">
      {/* Overall Score */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 text-center">
        <h2 className="mb-4 text-lg font-semibold">{t('overallScore')}</h2>
        <ScoreRing score={compatibility.overallScore} />
        <div className="mt-2 text-sm text-gray-500">
          {compatibility.overallScore} {t('scoreUnit')}
        </div>
      </section>

      {/* Side-by-side Pillars */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">
            {t('labels.person1Pillars')}
          </h3>
          <PillarChart
            fourPillars={person1Result.chart.fourPillars}
            dayMaster={person1Result.chart.dayMaster}
          />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">
            {t('labels.person2Pillars')}
          </h3>
          <PillarChart
            fourPillars={person2Result.chart.fourPillars}
            dayMaster={person2Result.chart.dayMaster}
          />
        </div>
      </section>

      {/* Dimension Details */}
      <section className="space-y-4">
        {/* Day Master */}
        <DimensionCard
          label={t('dimensions.dayMaster')}
          desc={t('dimensions.dayMasterDesc')}
          score={dayMasterRelation.score}
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-gray-400">{t('labels.person1DayMaster')}：</span>
              {dayMasterRelation.person1Stem}
            </div>
            <div>
              <span className="text-gray-400">{t('labels.person2DayMaster')}：</span>
              {dayMasterRelation.person2Stem}
            </div>
            <div>
              <span className="text-gray-400">{t('labels.combination')}：</span>
              {dayMasterRelation.combination || t('labels.noCombination')}
            </div>
            <div>
              <span className="text-gray-400">{t('labels.person1ToPerson2')}：</span>
              {dayMasterRelation.shiShenPerson1ToPerson2}
            </div>
            <div className="col-span-2">
              <span className="text-gray-400">{t('labels.person2ToPerson1')}：</span>
              {dayMasterRelation.shiShenPerson2ToPerson1}
            </div>
          </div>
        </DimensionCard>

        {/* WuXing Balance */}
        <DimensionCard
          label={t('dimensions.wuxingBalance')}
          desc={t('dimensions.wuxingBalanceDesc')}
          score={wuxingBalance.score}
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-gray-400">{t('labels.complementary')}：</span>
              {wuxingBalance.complementary.length > 0
                ? wuxingBalance.complementary.join('、')
                : t('labels.none')}
            </div>
            <div>
              <span className="text-gray-400">{t('labels.conflicting')}：</span>
              {wuxingBalance.conflicting.length > 0
                ? wuxingBalance.conflicting.join('、')
                : t('labels.none')}
            </div>
          </div>
        </DimensionCard>

        {/* YongShen Match */}
        <DimensionCard
          label={t('dimensions.yongShenMatch')}
          desc={t('dimensions.yongShenMatchDesc')}
          score={yongShenMatch.score}
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-gray-400">{t('labels.person1YongShen')}：</span>
              {yongShenMatch.person1YongShen}
            </div>
            <div>
              <span className="text-gray-400">{t('labels.person2YongShen')}：</span>
              {yongShenMatch.person2YongShen}
            </div>
            <div>
              <span className="text-gray-400">{t('labels.person1XiShen')}：</span>
              {yongShenMatch.person1XiShen}
            </div>
            <div>
              <span className="text-gray-400">{t('labels.person2XiShen')}：</span>
              {yongShenMatch.person2XiShen}
            </div>
          </div>
        </DimensionCard>

        {/* Branch Relations */}
        <DimensionCard
          label={t('dimensions.branchRelations')}
          desc={t('dimensions.branchRelationsDesc')}
          score={branchRelations.score}
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-gray-400">{t('labels.liuHe')}：</span>
              {branchRelations.liuHe.length > 0
                ? branchRelations.liuHe.join('、')
                : t('labels.none')}
            </div>
            <div>
              <span className="text-gray-400">{t('labels.liuChong')}：</span>
              {branchRelations.liuChong.length > 0
                ? branchRelations.liuChong.join('、')
                : t('labels.none')}
            </div>
          </div>
        </DimensionCard>

        {/* NaYin Match */}
        <DimensionCard
          label={t('dimensions.nayinMatch')}
          desc={t('dimensions.nayinMatchDesc')}
          score={nayinMatch.score}
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-gray-400">{t('labels.person1NaYin')}：</span>
              {nayinMatch.person1NaYin}
            </div>
            <div>
              <span className="text-gray-400">{t('labels.person2NaYin')}：</span>
              {nayinMatch.person2NaYin}
            </div>
            <div className="col-span-2">
              <span className="text-gray-400">{t('labels.relation')}：</span>
              {nayinMatch.relation}
            </div>
          </div>
        </DimensionCard>
      </section>
    </div>
  );
}
