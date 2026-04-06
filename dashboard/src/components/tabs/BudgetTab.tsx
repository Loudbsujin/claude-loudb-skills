import type { GoogleAdsRow, CampaignGoalType, Recommendation } from '../../types/google-ads';
import { aggregateByCampaign, aggregateByDate, aggregateByKeyword } from '../../lib/metrics';
import { generateRecommendations } from '../../lib/recommendations';
import { GaugeChart } from '../charts/GaugeChart';
import { DoughnutChart } from '../charts/DoughnutChart';
import { TrendChart } from '../charts/TrendChart';
import { formatKRW } from '../../lib/i18n';
import { AlertTriangle, TrendingUp, Wallet, Activity } from 'lucide-react';

interface BudgetTabProps {
  rows: GoogleAdsRow[];
  goalType: CampaignGoalType;
}

const PRIORITY_STYLES = {
  '높음': 'bg-coral-light text-coral border-coral',
  '보통': 'bg-amber-light text-amber border-amber',
  '낮음': 'bg-teal-light text-teal border-teal',
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  cost: <Wallet className="w-4 h-4" />,
  performance: <TrendingUp className="w-4 h-4" />,
  budget: <Activity className="w-4 h-4" />,
  tracking: <AlertTriangle className="w-4 h-4" />,
};

export function BudgetTab({ rows, goalType }: BudgetTabProps) {
  const campaigns = aggregateByCampaign(rows, goalType);
  const daily = aggregateByDate(rows);
  const keywords = aggregateByKeyword(rows);
  const recommendations = generateRecommendations(campaigns, rows, keywords);

  // Budget utilization per campaign
  const budgetUtils = campaigns.filter(c => c.budget > 0).map(c => {
    const campRows = rows.filter(r => r.campaign === c.campaign);
    const days = new Set(campRows.map(r => r.date)).size || 1;
    const dailyAvgSpend = c.cost / days;
    return {
      campaign: c.campaign,
      utilization: (dailyAvgSpend / c.budget) * 100,
      dailyBudget: c.budget,
      dailyAvgSpend,
    };
  });

  return (
    <div className="space-y-6">
      {/* Budget utilization gauges */}
      {budgetUtils.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-navy mb-3">캠페인별 일일 예산 사용률</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {budgetUtils.map(b => (
              <GaugeChart
                key={b.campaign}
                label={b.campaign}
                value={b.utilization}
              />
            ))}
          </div>
          <p className="text-[10px] text-gray-text mt-2">
            70~100%가 적정 범위입니다. 100% 초과 시 예산 조정이 필요합니다.
          </p>
        </div>
      )}

      {/* Cost distribution + Daily spend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DoughnutChart
          title="캠페인별 비용 분포"
          labels={campaigns.map(c => c.campaign)}
          values={campaigns.map(c => c.cost)}
        />
        <div>
          <h3 className="text-sm font-semibold text-navy mb-3">일별 지출 추이</h3>
          <TrendChart data={daily} metrics={['cost']} />
        </div>
      </div>

      {/* Budget summary table */}
      {budgetUtils.length > 0 && (
        <div className="bg-white rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-gray-text">캠페인</th>
                <th className="text-right p-3 font-medium text-gray-text">일일 예산</th>
                <th className="text-right p-3 font-medium text-gray-text">일평균 지출</th>
                <th className="text-right p-3 font-medium text-gray-text">사용률</th>
                <th className="text-right p-3 font-medium text-gray-text">총 비용</th>
              </tr>
            </thead>
            <tbody>
              {budgetUtils.map(b => {
                const camp = campaigns.find(c => c.campaign === b.campaign)!;
                return (
                  <tr key={b.campaign} className="border-b border-border last:border-b-0 hover:bg-warm-gray/50">
                    <td className="p-3 font-medium text-navy">{b.campaign}</td>
                    <td className="p-3 text-right">{formatKRW(b.dailyBudget)}</td>
                    <td className="p-3 text-right">{formatKRW(b.dailyAvgSpend)}</td>
                    <td className="p-3 text-right">
                      <span className={
                        b.utilization > 100 ? 'text-coral font-medium' :
                        b.utilization >= 70 ? 'text-teal font-medium' :
                        'text-amber font-medium'
                      }>
                        {Math.round(b.utilization)}%
                      </span>
                    </td>
                    <td className="p-3 text-right">{formatKRW(camp.cost)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Recommendations */}
      <div>
        <h3 className="text-sm font-semibold text-navy mb-3">
          개선 추천사항 ({recommendations.length}건)
        </h3>
        {recommendations.length === 0 ? (
          <div className="text-center py-8 text-gray-text text-sm bg-white rounded-xl border border-border">
            현재 데이터 기준 특별한 개선사항이 없습니다. 광고 운영이 양호합니다!
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const style = PRIORITY_STYLES[rec.priority];
  return (
    <div className={`bg-white rounded-xl border border-border p-4 border-l-4 ${style.split(' ')[2] ? `border-l-${style.split(' ')[2].replace('border-', '')}` : ''}`}
      style={{ borderLeftColor: rec.priority === '높음' ? '#C75B4A' : rec.priority === '보통' ? '#D4A843' : '#2A7F6F' }}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${rec.priority === '높음' ? 'text-coral' : rec.priority === '보통' ? 'text-amber' : 'text-teal'}`}>
          {CATEGORY_ICONS[rec.category]}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-navy">{rec.title}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${style}`}>
              {rec.priority}
            </span>
          </div>
          <p className="text-xs text-gray-text leading-relaxed">{rec.description}</p>
        </div>
      </div>
    </div>
  );
}
