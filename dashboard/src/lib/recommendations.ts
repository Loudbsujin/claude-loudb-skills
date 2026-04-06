import type { CampaignSummary, GoogleAdsRow, Recommendation, KeywordMetric } from '../types/google-ads';
import { aggregateByDate } from './metrics';

export function generateRecommendations(
  summaries: CampaignSummary[],
  rows: GoogleAdsRow[],
  keywords: KeywordMetric[],
): Recommendation[] {
  const recs: Recommendation[] = [];
  let id = 0;

  for (const camp of summaries) {
    // R01: CTR < 1%
    if (camp.ctr < 1 && camp.impressions > 100) {
      recs.push({
        id: `r${++id}`,
        priority: '높음',
        category: 'performance',
        title: '클릭률이 매우 낮습니다',
        description: `"${camp.campaign}"의 클릭률이 ${camp.ctr.toFixed(2)}%로 매우 낮습니다. 광고 문구를 더 매력적으로 수정하거나, 타겟 키워드와 광고 내용의 관련성을 높여보세요.`,
        campaignName: camp.campaign,
        metricValue: `${camp.ctr.toFixed(2)}%`,
      });
    }

    // R02: CPA > 30,000원 (월 30만원 기준)
    if (camp.cpa > 30000 && camp.conversions > 0) {
      recs.push({
        id: `r${++id}`,
        priority: '높음',
        category: 'cost',
        title: '전환당 비용이 높습니다',
        description: `"${camp.campaign}"의 전환당 비용이 ${Math.round(camp.cpa).toLocaleString()}원입니다. 월 30만원 예산 대비 비용 효율이 낮습니다. 전환율이 낮은 키워드의 입찰가를 낮추거나 일시중지를 고려해보세요.`,
        campaignName: camp.campaign,
        metricValue: `₩${Math.round(camp.cpa).toLocaleString()}`,
      });
    }

    // R03: CPC > 500원
    if (camp.avgCpc > 500 && camp.clicks > 0) {
      recs.push({
        id: `r${++id}`,
        priority: '보통',
        category: 'cost',
        title: '클릭당 비용이 높습니다',
        description: `"${camp.campaign}"의 평균 CPC가 ${Math.round(camp.avgCpc).toLocaleString()}원입니다. 월 30만원 예산에서 충분한 클릭을 확보하기 어렵습니다. 입찰 전략을 검토하거나 경쟁이 덜한 키워드를 활용해보세요.`,
        campaignName: camp.campaign,
        metricValue: `₩${Math.round(camp.avgCpc).toLocaleString()}`,
      });
    }

    // R04: Budget utilization < 50%
    if (camp.budget > 0) {
      const campRows = rows.filter(r => r.campaign === camp.campaign);
      const days = new Set(campRows.map(r => r.date)).size || 1;
      const dailyAvgSpend = camp.cost / days;
      const utilization = (dailyAvgSpend / camp.budget) * 100;

      if (utilization < 50) {
        recs.push({
          id: `r${++id}`,
          priority: '보통',
          category: 'budget',
          title: '예산이 충분히 사용되지 않고 있습니다',
          description: `"${camp.campaign}"이 일일 예산의 ${Math.round(utilization)}%만 사용하고 있습니다. 키워드를 추가하거나 입찰가를 높여 더 많은 노출을 확보해보세요.`,
          campaignName: camp.campaign,
          metricValue: `${Math.round(utilization)}%`,
        });
      }

      // R05: Budget utilization > 100%
      if (utilization > 100) {
        recs.push({
          id: `r${++id}`,
          priority: '보통',
          category: 'budget',
          title: '일일 예산을 초과하고 있습니다',
          description: `"${camp.campaign}"이 설정 예산을 초과 사용하고 있습니다. 일일 예산을 재검토하거나, 비효율 키워드를 정리해보세요.`,
          campaignName: camp.campaign,
        });
      }
    }

    // R06: ROAS < 100%
    if (camp.roas > 0 && camp.roas < 100 && camp.convValue > 0) {
      recs.push({
        id: `r${++id}`,
        priority: '높음',
        category: 'performance',
        title: '광고 수익률이 마이너스입니다',
        description: `"${camp.campaign}"의 ROAS가 ${camp.roas.toFixed(0)}%로, 투자 대비 손실이 발생하고 있습니다. 전환 가치가 높은 키워드에 예산을 집중해보세요.`,
        campaignName: camp.campaign,
        metricValue: `${camp.roas.toFixed(0)}%`,
      });
    }

    // R07: No conversions
    if (camp.conversions === 0 && camp.clicks > 20) {
      recs.push({
        id: `r${++id}`,
        priority: '높음',
        category: 'tracking',
        title: '전환이 기록되지 않았습니다',
        description: `"${camp.campaign}"에 ${camp.clicks}회 클릭이 있지만 전환이 기록되지 않았습니다. 전환 추적이 올바르게 설정되어 있는지 먼저 확인해주세요.`,
        campaignName: camp.campaign,
      });
    }

    // R08: High conversion rate but low budget → recommend increase
    if (camp.convRate > 3 && camp.budget > 0) {
      const campRows = rows.filter(r => r.campaign === camp.campaign);
      const days = new Set(campRows.map(r => r.date)).size || 1;
      const dailyAvgSpend = camp.cost / days;
      const utilization = (dailyAvgSpend / camp.budget) * 100;
      if (utilization > 85) {
        recs.push({
          id: `r${++id}`,
          priority: '낮음',
          category: 'budget',
          title: '전환율이 우수합니다 — 예산 증액을 고려해보세요',
          description: `"${camp.campaign}"의 전환율이 ${camp.convRate.toFixed(2)}%로 우수합니다! 예산을 늘려 더 많은 전환을 확보하는 것을 추천합니다.`,
          campaignName: camp.campaign,
          metricValue: `${camp.convRate.toFixed(2)}%`,
        });
      }
    }

    // R09: High impressions, low clicks
    if (camp.impressions > 1000 && camp.ctr < 1.5 && camp.ctr > 0) {
      recs.push({
        id: `r${++id}`,
        priority: '보통',
        category: 'performance',
        title: '노출은 많지만 클릭이 적습니다',
        description: `"${camp.campaign}"이 ${camp.impressions.toLocaleString()}회 노출을 얻고 있지만 클릭이 적습니다. 광고 확장 소재를 추가하거나 광고 문구의 행동유도(CTA)를 강화해보세요.`,
        campaignName: camp.campaign,
      });
    }
  }

  // R10: Keyword concentration
  if (keywords.length > 0) {
    const totalSpend = keywords.reduce((s, k) => s + k.cost, 0);
    if (totalSpend > 0) {
      const sorted = [...keywords].sort((a, b) => b.cost - a.cost);
      const topKeyword = sorted[0];
      const topRatio = (topKeyword.cost / totalSpend) * 100;
      if (topRatio > 50 && keywords.length > 3) {
        recs.push({
          id: `r${++id}`,
          priority: '보통',
          category: 'performance',
          title: '특정 키워드에 예산이 집중되어 있습니다',
          description: `"${topKeyword.keyword}"에 전체 예산의 ${Math.round(topRatio)}%가 집중되어 있습니다. 의존도를 낮추기 위해 다른 키워드도 육성해보세요.`,
          metricValue: `${Math.round(topRatio)}%`,
        });
      }
    }
  }

  // R11: Daily spend variance
  const dailyMetrics = aggregateByDate(rows);
  if (dailyMetrics.length > 7) {
    const dailyCosts = dailyMetrics.map(d => d.cost);
    const avg = dailyCosts.reduce((s, c) => s + c, 0) / dailyCosts.length;
    if (avg > 0) {
      const variance = dailyCosts.reduce((s, c) => s + Math.pow(c - avg, 2), 0) / dailyCosts.length;
      const cv = Math.sqrt(variance) / avg;
      if (cv > 0.5) {
        recs.push({
          id: `r${++id}`,
          priority: '낮음',
          category: 'budget',
          title: '일별 지출 편차가 큽니다',
          description: `일별 광고 지출이 불균등합니다. 예산이 특정 날짜에 집중되고 있어, 균등한 예산 배분을 고려해보세요.`,
        });
      }
    }
  }

  // Sort by priority
  const priorityOrder = { '높음': 0, '보통': 1, '낮음': 2 };
  recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recs;
}
