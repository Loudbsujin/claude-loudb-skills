import { useState } from 'react';
import type { GoogleAdsRow } from '../../types/google-ads';
import { aggregateByKeyword } from '../../lib/metrics';
import { ScatterChart } from '../charts/ScatterChart';
import { formatKRW, formatPercent, formatNumber } from '../../lib/i18n';

interface KeywordTabProps {
  rows: GoogleAdsRow[];
}

type SortKey = 'ctr' | 'avgCpc' | 'convRate' | 'cost' | 'clicks';

export function KeywordTab({ rows }: KeywordTabProps) {
  const keywords = aggregateByKeyword(rows);
  const [sortKey, setSortKey] = useState<SortKey>('cost');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  if (keywords.length === 0) {
    return (
      <div className="text-center py-16 text-gray-text text-sm">
        키워드 데이터가 CSV 파일에 포함되어 있지 않습니다.<br />
        Google Ads에서 키워드 탭의 데이터를 내보내 주세요.
      </div>
    );
  }

  const sorted = [...keywords].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey];
    return sortDir === 'desc' ? -diff : diff;
  });

  const top10 = [...keywords].sort((a, b) => b.convRate - a.convRate).slice(0, 10);
  const bottom10 = [...keywords].sort((a, b) => a.convRate - b.convRate).slice(0, 10);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const SortHeader = ({ k, children }: { k: SortKey; children: React.ReactNode }) => (
    <th
      onClick={() => handleSort(k)}
      className="text-right p-3 font-medium text-gray-text cursor-pointer hover:text-navy select-none"
    >
      {children} {sortKey === k ? (sortDir === 'desc' ? '↓' : '↑') : ''}
    </th>
  );

  return (
    <div className="space-y-6">
      {/* Scatter chart */}
      <div>
        <h3 className="text-sm font-semibold text-navy mb-3">CPC vs 전환율 분포</h3>
        <ScatterChart keywords={keywords} />
      </div>

      {/* Top / Bottom tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold text-teal mb-3">전환율 상위 10개 키워드</h3>
          <div className="space-y-1.5">
            {top10.map((k, i) => (
              <div key={`${k.keyword}-${i}`} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-warm-gray/50">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-text w-4">{i + 1}</span>
                  <span className="text-xs text-navy">{k.keyword}</span>
                </div>
                <span className="text-xs font-medium text-teal">{formatPercent(k.convRate)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold text-coral mb-3">전환율 하위 10개 키워드</h3>
          <div className="space-y-1.5">
            {bottom10.map((k, i) => (
              <div key={`${k.keyword}-${i}`} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-warm-gray/50">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-text w-4">{i + 1}</span>
                  <span className="text-xs text-navy">{k.keyword}</span>
                </div>
                <span className="text-xs font-medium text-coral">{formatPercent(k.convRate)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full keyword table */}
      <div className="bg-white rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 font-medium text-gray-text">키워드</th>
              <th className="text-left p-3 font-medium text-gray-text">캠페인</th>
              <SortHeader k="clicks">클릭수</SortHeader>
              <SortHeader k="ctr">클릭률</SortHeader>
              <SortHeader k="avgCpc">평균 CPC</SortHeader>
              <SortHeader k="cost">비용</SortHeader>
              <SortHeader k="convRate">전환율</SortHeader>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 50).map((k, i) => (
              <tr key={`${k.keyword}-${i}`} className="border-b border-border last:border-b-0 hover:bg-warm-gray/50">
                <td className="p-3 font-medium text-navy">{k.keyword}</td>
                <td className="p-3 text-gray-text">{k.campaign}</td>
                <td className="p-3 text-right">{formatNumber(k.clicks)}</td>
                <td className="p-3 text-right">{formatPercent(k.ctr)}</td>
                <td className="p-3 text-right">{formatKRW(k.avgCpc)}</td>
                <td className="p-3 text-right">{formatKRW(k.cost)}</td>
                <td className="p-3 text-right">
                  <span className={k.convRate > 2 ? 'text-teal font-medium' : k.convRate > 0.5 ? 'text-amber' : 'text-coral'}>
                    {formatPercent(k.convRate)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
