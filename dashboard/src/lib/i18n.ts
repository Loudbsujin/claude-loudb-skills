export const GLOSSARY: Record<string, { label: string; explanation: string }> = {
  impressions: {
    label: '노출수',
    explanation: '광고가 검색 결과에 표시된 횟수입니다. 많을수록 광고가 자주 보여졌다는 뜻입니다.',
  },
  clicks: {
    label: '클릭수',
    explanation: '사용자가 광고를 실제로 클릭한 횟수입니다.',
  },
  ctr: {
    label: '클릭률 (CTR)',
    explanation: '노출 대비 클릭 비율입니다. 100번 노출되어 5번 클릭되면 5%입니다. 높을수록 광고가 매력적이라는 의미입니다.',
  },
  avgCpc: {
    label: '평균 클릭당 비용 (CPC)',
    explanation: '한 번 클릭될 때마다 지불하는 평균 비용입니다. 낮을수록 효율적으로 클릭을 확보하고 있다는 뜻입니다.',
  },
  cost: {
    label: '총 비용',
    explanation: '해당 기간 동안 광고에 사용된 총 금액입니다.',
  },
  conversions: {
    label: '전환수',
    explanation: '광고를 클릭한 후 원하는 행동(문의, 신청, 구매 등)을 완료한 횟수입니다.',
  },
  convRate: {
    label: '전환율',
    explanation: '클릭 대비 전환이 일어난 비율입니다. 높을수록 광고가 효과적으로 행동을 유도하고 있다는 뜻입니다.',
  },
  cpa: {
    label: '전환당 비용 (CPA)',
    explanation: '전환 1건을 얻기 위해 지불한 평균 비용입니다. 낮을수록 비용 효율이 좋습니다.',
  },
  convValue: {
    label: '전환 가치',
    explanation: '전환으로 발생한 총 가치(매출 등)입니다.',
  },
  roas: {
    label: '광고 수익률 (ROAS)',
    explanation: '광고에 투자한 비용 대비 얻은 수익 비율입니다. 100% 이상이면 투자 대비 수익이 발생한 것입니다.',
  },
  budget: {
    label: '예산',
    explanation: '캠페인에 설정된 일일 예산입니다.',
  },
};

export const GOAL_TYPE_LABELS: Record<string, string> = {
  awareness: '인지도 (Awareness)',
  traffic: '트래픽 (Traffic)',
  conversion: '전환 (Conversion)',
};

export const TAB_LABELS: Record<string, string> = {
  overview: '전체 요약',
  comparison: '캠페인 비교',
  keywords: '키워드 분석',
  budget: '예산 · 추천',
};

export function formatKRW(value: number): string {
  if (value >= 10000) {
    return `₩${(value / 10000).toFixed(1)}만`;
  }
  return `₩${new Intl.NumberFormat('ko-KR').format(Math.round(value))}`;
}

export function formatNumber(value: number): string {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}만`;
  }
  return new Intl.NumberFormat('ko-KR').format(Math.round(value));
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}
