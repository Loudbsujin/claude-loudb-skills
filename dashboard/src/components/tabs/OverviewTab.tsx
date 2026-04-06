import { MetricCard } from '../MetricCard';
import { TrendChart } from '../charts/TrendChart';
import type { GoogleAdsRow, CampaignGoalType } from '../../types/google-ads';
import { aggregateTotal, aggregateByDate, aggregateByCampaign } from '../../lib/metrics';
import { GLOSSARY, formatKRW, formatNumber, formatPercent } from '../../lib/i18n';
import { useState } from 'react';

interface OverviewTabProps {
  rows: GoogleAdsRow[];
  goalType: CampaignGoalType;
}

export function OverviewTab({ rows, goalType }: OverviewTabProps) {
  const [trendMetrics, setTrendMetrics] = useState<('clicks' | 'impressions' | 'cost' | 'conversions')[]>(['clicks', 'cost']);
  const total = aggregateTotal(rows);
  const daily = aggregateByDate(rows);
  const campaigns = aggregateByCampaign(rows, goalType);

  const metricCards = [
    { key: 'impressions', value: formatNumber(total.impressions), scoreLabel: undefined },
    { key: 'clicks', value: formatNumber(total.clicks), scoreLabel: undefined },
    { key: 'ctr', value: formatPercent(total.ctr), scoreLabel: campaigns[0]?.scoreLabel },
    { key: 'avgCpc', value: formatKRW(total.avgCpc), scoreLabel: undefined },
    { key: 'cost', value: formatKRW(total.cost), scoreLabel: undefined },
    { key: 'conversions', value: formatNumber(total.conversions), scoreLabel: undefined },
    { key: 'cpa', value: total.conversions > 0 ? formatKRW(total.cpa) : '-', scoreLabel: undefined },
  ] as const;

  const trendOptions: { key: 'clicks' | 'impressions' | 'cost' | 'conversions'; label: string }[] = [
    { key: 'clicks', label: '클릭수' },
    { key: 'impressions', label: '노출수' },
    { key: 'cost', label: '비용' },
    { key: 'conversions', label: '전환수' },
  ];

  return (
    <div className="space-y-6">
      {/* Campaign score summary */}
      {campaigns.length > 0 && (
        <div className="bg-white rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold text-navy mb-3">캠페인별 효율 점수</h3>
          <div className="flex flex-wrap gap-3">
            {campaigns.map(c => (
              <div key={c.campaign} className="flex items-center gap-2 px-3 py-2 bg-warm-gray rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white
                  ${c.scoreLabel === '우수' ? 'bg-teal' : c.scoreLabel === '양호' ? 'bg-amber' : 'bg-coral'}`}>
                  {c.score}
                </div>
                <div>
                  <p className="text-xs font-medium text-navy">{c.campaign}</p>
                  <p className={`text-[10px] font-semibold
                    ${c.scoreLabel === '우수' ? 'text-teal' : c.scoreLabel === '양호' ? 'text-amber' : 'text-coral'}`}>
                    {c.scoreLabel}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {metricCards.map(({ key, value }) => (
          <MetricCard
            key={key}
            label={GLOSSARY[key].label}
            value={value}
            explanation={GLOSSARY[key].explanation}
          />
        ))}
      </div>

      {/* Trend chart */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-navy">일별 추이</h3>
          <div className="flex gap-1">
            {trendOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => {
                  setTrendMetrics(prev =>
                    prev.includes(opt.key)
                      ? prev.filter(m => m !== opt.key)
                      : [...prev, opt.key]
                  );
                }}
                className={`px-2.5 py-1 text-[10px] font-medium rounded-full transition-colors
                  ${trendMetrics.includes(opt.key)
                    ? 'bg-navy text-white'
                    : 'bg-warm-gray text-gray-text hover:text-navy'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        {trendMetrics.length > 0 && <TrendChart data={daily} metrics={trendMetrics} />}
      </div>
    </div>
  );
}
