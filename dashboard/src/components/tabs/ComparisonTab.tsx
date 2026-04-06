import { useState } from 'react';
import type { GoogleAdsRow, CampaignGoalType } from '../../types/google-ads';
import { aggregateByCampaign } from '../../lib/metrics';
import { ComparisonBar } from '../charts/ComparisonBar';
import { RadarChart } from '../charts/RadarChart';
import { formatKRW, formatPercent } from '../../lib/i18n';

interface ComparisonTabProps {
  rows: GoogleAdsRow[];
  goalType: CampaignGoalType;
}

type CompareMetric = 'ctr' | 'avgCpc' | 'convRate' | 'cpa' | 'cost' | 'roas';

const METRIC_OPTIONS: { key: CompareMetric; label: string }[] = [
  { key: 'ctr', label: '클릭률' },
  { key: 'avgCpc', label: '평균 CPC' },
  { key: 'convRate', label: '전환율' },
  { key: 'cpa', label: '전환당 비용' },
  { key: 'cost', label: '총 비용' },
  { key: 'roas', label: 'ROAS' },
];

export function ComparisonTab({ rows, goalType }: ComparisonTabProps) {
  const allCampaigns = aggregateByCampaign(rows, goalType);
  const [selectedNames, setSelectedNames] = useState<string[]>(allCampaigns.map(c => c.campaign));
  const [metric, setMetric] = useState<CompareMetric>('ctr');

  const selected = allCampaigns.filter(c => selectedNames.includes(c.campaign));

  const toggleCampaign = (name: string) => {
    setSelectedNames(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  return (
    <div className="space-y-6">
      {/* Campaign selector */}
      <div className="bg-white rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold text-navy mb-3">비교할 캠페인 선택</h3>
        <div className="flex flex-wrap gap-2">
          {allCampaigns.map(c => (
            <label key={c.campaign} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedNames.includes(c.campaign)}
                onChange={() => toggleCampaign(c.campaign)}
                className="w-3.5 h-3.5 rounded border-border text-teal focus:ring-teal"
              />
              <span className="text-xs text-navy">{c.campaign}</span>
            </label>
          ))}
        </div>
      </div>

      {selected.length >= 2 && (
        <>
          {/* Metric selector + Bar chart */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-navy">지표별 비교</h3>
              <select
                value={metric}
                onChange={(e) => setMetric(e.target.value as CompareMetric)}
                className="text-xs border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal"
              >
                {METRIC_OPTIONS.map(opt => (
                  <option key={opt.key} value={opt.key}>{opt.label}</option>
                ))}
              </select>
            </div>
            <ComparisonBar campaigns={selected} metric={metric} />
          </div>

          {/* Radar chart */}
          <div>
            <h3 className="text-sm font-semibold text-navy mb-3">종합 비교 (레이더)</h3>
            <RadarChart campaigns={selected} />
          </div>

          {/* Comparison table */}
          <div className="bg-white rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-gray-text">캠페인</th>
                  <th className="text-right p-3 font-medium text-gray-text">클릭률</th>
                  <th className="text-right p-3 font-medium text-gray-text">평균 CPC</th>
                  <th className="text-right p-3 font-medium text-gray-text">전환율</th>
                  <th className="text-right p-3 font-medium text-gray-text">전환당 비용</th>
                  <th className="text-right p-3 font-medium text-gray-text">총 비용</th>
                  <th className="text-right p-3 font-medium text-gray-text">점수</th>
                </tr>
              </thead>
              <tbody>
                {selected.map(c => (
                  <tr key={c.campaign} className="border-b border-border last:border-b-0 hover:bg-warm-gray/50">
                    <td className="p-3 font-medium text-navy">{c.campaign}</td>
                    <td className="p-3 text-right">{formatPercent(c.ctr)}</td>
                    <td className="p-3 text-right">{formatKRW(c.avgCpc)}</td>
                    <td className="p-3 text-right">{formatPercent(c.convRate)}</td>
                    <td className="p-3 text-right">{c.conversions > 0 ? formatKRW(c.cpa) : '-'}</td>
                    <td className="p-3 text-right">{formatKRW(c.cost)}</td>
                    <td className="p-3 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold
                        ${c.scoreLabel === '우수' ? 'bg-teal-light text-teal'
                          : c.scoreLabel === '양호' ? 'bg-amber-light text-amber'
                          : 'bg-coral-light text-coral'}`}>
                        {c.score}점 · {c.scoreLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selected.length < 2 && (
        <div className="text-center py-12 text-gray-text text-sm">
          비교하려면 캠페인을 2개 이상 선택해주세요.
        </div>
      )}
    </div>
  );
}
