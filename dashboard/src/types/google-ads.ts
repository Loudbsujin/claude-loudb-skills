export interface GoogleAdsRow {
  campaign: string;
  campaignStatus?: string;
  adGroup?: string;
  keyword?: string;
  searchTerm?: string;
  impressions: number;
  clicks: number;
  ctr: number;
  avgCpc: number;
  cost: number;
  conversions: number;
  convRate: number;
  cpa: number;
  convValue: number;
  roas: number;
  budget: number;
  date: string;
}

export interface CampaignSummary {
  campaign: string;
  impressions: number;
  clicks: number;
  ctr: number;
  avgCpc: number;
  cost: number;
  conversions: number;
  convRate: number;
  cpa: number;
  convValue: number;
  roas: number;
  budget: number;
  score: number;
  scoreLabel: ScoreLabel;
}

export type ScoreLabel = '우수' | '양호' | '주의' | '개선필요';
export type ScoreColor = 'teal' | 'amber' | 'coral' | 'coral';

export interface DailyMetric {
  date: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  convValue: number;
}

export interface KeywordMetric {
  keyword: string;
  campaign: string;
  impressions: number;
  clicks: number;
  ctr: number;
  avgCpc: number;
  cost: number;
  conversions: number;
  convRate: number;
  cpa: number;
}

export type CampaignGoalType = 'awareness' | 'traffic' | 'conversion';

export interface Recommendation {
  id: string;
  priority: '높음' | '보통' | '낮음';
  category: 'cost' | 'performance' | 'budget' | 'tracking';
  title: string;
  description: string;
  campaignName?: string;
  metricValue?: string;
}

export type TabType = 'overview' | 'comparison' | 'keywords' | 'budget';

export const COLUMN_MAP: Record<string, keyof GoogleAdsRow> = {
  // English headers
  'Campaign': 'campaign',
  'Campaign status': 'campaignStatus',
  'Ad group': 'adGroup',
  'Keyword': 'keyword',
  'Search term': 'searchTerm',
  'Impressions': 'impressions',
  'Clicks': 'clicks',
  'CTR': 'ctr',
  'Avg. CPC': 'avgCpc',
  'Cost': 'cost',
  'Conversions': 'conversions',
  'Conv. rate': 'convRate',
  'Cost / conv.': 'cpa',
  'Conv. value': 'convValue',
  'ROAS': 'roas',
  'Budget': 'budget',
  'Day': 'date',
  // Korean headers
  '캠페인': 'campaign',
  '캠페인 상태': 'campaignStatus',
  '광고그룹': 'adGroup',
  '키워드': 'keyword',
  '검색어': 'searchTerm',
  '노출수': 'impressions',
  '클릭수': 'clicks',
  '클릭률': 'ctr',
  '평균 CPC': 'avgCpc',
  '평균CPC': 'avgCpc',
  '비용': 'cost',
  '전환수': 'conversions',
  '전환율': 'convRate',
  '전환당비용': 'cpa',
  '전환당 비용': 'cpa',
  '전환 가치': 'convValue',
  '광고 투자수익': 'roas',
  '예산': 'budget',
  '일': 'date',
};
