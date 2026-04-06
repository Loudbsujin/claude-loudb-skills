import type {
  GoogleAdsRow,
  CampaignSummary,
  DailyMetric,
  KeywordMetric,
  CampaignGoalType,
  ScoreLabel,
} from '../types/google-ads';

// Benchmarks per goal type (월 30만원 기준)
const BENCHMARKS: Record<CampaignGoalType, {
  ctr: [number, number, number];       // [우수, 양호, 주의] thresholds
  cpc: [number, number, number];
  convRate: [number, number, number];
  cpa: [number, number, number];
  roas: [number, number, number];
}> = {
  awareness: {
    ctr: [2, 1, 0.5],
    cpc: [200, 400, 700],
    convRate: [1.5, 0.8, 0.3],
    cpa: [20000, 40000, 70000],
    roas: [200, 100, 50],
  },
  traffic: {
    ctr: [3, 2, 1],
    cpc: [300, 500, 800],
    convRate: [2, 1, 0.5],
    cpa: [15000, 30000, 60000],
    roas: [300, 150, 80],
  },
  conversion: {
    ctr: [3, 1.5, 0.8],
    cpc: [500, 800, 1200],
    convRate: [3, 1.5, 0.5],
    cpa: [15000, 30000, 60000],
    roas: [400, 200, 100],
  },
};

function scoreMetric(value: number, thresholds: [number, number, number], lowerIsBetter = false): number {
  const [good, ok, warn] = thresholds;
  if (lowerIsBetter) {
    if (value <= good) return 3;
    if (value <= ok) return 2;
    if (value <= warn) return 1;
    return 0;
  }
  if (value >= good) return 3;
  if (value >= ok) return 2;
  if (value >= warn) return 1;
  return 0;
}

function scoreToLabel(score: number): ScoreLabel {
  if (score >= 2.5) return '우수';
  if (score >= 1.5) return '양호';
  if (score >= 0.5) return '주의';
  return '개선필요';
}

export function calculateCampaignScore(summary: Omit<CampaignSummary, 'score' | 'scoreLabel'>, goalType: CampaignGoalType): { score: number; scoreLabel: ScoreLabel } {
  const b = BENCHMARKS[goalType];
  const ctrScore = scoreMetric(summary.ctr, b.ctr);
  const cpcScore = scoreMetric(summary.avgCpc, b.cpc, true);
  const convRateScore = scoreMetric(summary.convRate, b.convRate);
  const cpaScore = summary.conversions > 0 ? scoreMetric(summary.cpa, b.cpa, true) : 1;
  const roasScore = summary.convValue > 0 ? scoreMetric(summary.roas, b.roas) : 1;

  // Weighted average
  const weights = goalType === 'awareness'
    ? { ctr: 0.30, cpc: 0.25, convRate: 0.10, cpa: 0.15, roas: 0.20 }
    : goalType === 'traffic'
    ? { ctr: 0.25, cpc: 0.25, convRate: 0.15, cpa: 0.15, roas: 0.20 }
    : { ctr: 0.15, cpc: 0.10, convRate: 0.25, cpa: 0.25, roas: 0.25 };

  const weighted = ctrScore * weights.ctr + cpcScore * weights.cpc +
    convRateScore * weights.convRate + cpaScore * weights.cpa + roasScore * weights.roas;

  const score = Math.round((weighted / 3) * 100);
  return { score, scoreLabel: scoreToLabel(weighted) };
}

export function aggregateByCampaign(rows: GoogleAdsRow[], goalType: CampaignGoalType): CampaignSummary[] {
  const groups = new Map<string, GoogleAdsRow[]>();
  for (const row of rows) {
    const existing = groups.get(row.campaign) || [];
    existing.push(row);
    groups.set(row.campaign, existing);
  }

  const summaries: CampaignSummary[] = [];
  for (const [campaign, campRows] of groups) {
    const impressions = campRows.reduce((s, r) => s + r.impressions, 0);
    const clicks = campRows.reduce((s, r) => s + r.clicks, 0);
    const cost = campRows.reduce((s, r) => s + r.cost, 0);
    const conversions = campRows.reduce((s, r) => s + r.conversions, 0);
    const convValue = campRows.reduce((s, r) => s + r.convValue, 0);
    const budget = Math.max(...campRows.map(r => r.budget));

    const base = {
      campaign,
      impressions,
      clicks,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      avgCpc: clicks > 0 ? cost / clicks : 0,
      cost,
      conversions,
      convRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
      cpa: conversions > 0 ? cost / conversions : 0,
      convValue,
      roas: cost > 0 ? (convValue / cost) * 100 : 0,
      budget,
    };

    const { score, scoreLabel } = calculateCampaignScore(base, goalType);
    summaries.push({ ...base, score, scoreLabel });
  }

  return summaries;
}

export function aggregateByDate(rows: GoogleAdsRow[]): DailyMetric[] {
  const groups = new Map<string, DailyMetric>();
  for (const row of rows) {
    if (!row.date) continue;
    const existing = groups.get(row.date) || {
      date: row.date, impressions: 0, clicks: 0, cost: 0, conversions: 0, convValue: 0,
    };
    existing.impressions += row.impressions;
    existing.clicks += row.clicks;
    existing.cost += row.cost;
    existing.conversions += row.conversions;
    existing.convValue += row.convValue;
    groups.set(row.date, existing);
  }

  return Array.from(groups.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function aggregateByKeyword(rows: GoogleAdsRow[]): KeywordMetric[] {
  const groups = new Map<string, { campaign: string; impressions: number; clicks: number; cost: number; conversions: number }>();
  for (const row of rows) {
    if (!row.keyword) continue;
    const key = `${row.campaign}::${row.keyword}`;
    const existing = groups.get(key) || { campaign: row.campaign, impressions: 0, clicks: 0, cost: 0, conversions: 0 };
    existing.impressions += row.impressions;
    existing.clicks += row.clicks;
    existing.cost += row.cost;
    existing.conversions += row.conversions;
    groups.set(key, existing);
  }

  return Array.from(groups.entries()).map(([key, data]) => {
    const keyword = key.split('::')[1];
    return {
      keyword,
      campaign: data.campaign,
      impressions: data.impressions,
      clicks: data.clicks,
      ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
      avgCpc: data.clicks > 0 ? data.cost / data.clicks : 0,
      cost: data.cost,
      conversions: data.conversions,
      convRate: data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0,
      cpa: data.conversions > 0 ? data.cost / data.conversions : 0,
    };
  });
}

export function aggregateTotal(rows: GoogleAdsRow[]): {
  impressions: number; clicks: number; ctr: number; avgCpc: number;
  cost: number; conversions: number; convRate: number; cpa: number; roas: number;
} {
  const impressions = rows.reduce((s, r) => s + r.impressions, 0);
  const clicks = rows.reduce((s, r) => s + r.clicks, 0);
  const cost = rows.reduce((s, r) => s + r.cost, 0);
  const conversions = rows.reduce((s, r) => s + r.conversions, 0);
  const convValue = rows.reduce((s, r) => s + r.convValue, 0);

  return {
    impressions,
    clicks,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    avgCpc: clicks > 0 ? cost / clicks : 0,
    cost,
    conversions,
    convRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
    cpa: conversions > 0 ? cost / conversions : 0,
    roas: cost > 0 ? (convValue / cost) * 100 : 0,
  };
}
