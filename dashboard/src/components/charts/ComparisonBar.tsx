import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { CampaignSummary } from '../../types/google-ads';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ComparisonBarProps {
  campaigns: CampaignSummary[];
  metric: 'ctr' | 'avgCpc' | 'convRate' | 'cpa' | 'cost' | 'roas';
}

const METRIC_LABELS: Record<string, { label: string; format: (v: number) => string }> = {
  ctr: { label: '클릭률 (%)', format: v => `${v.toFixed(2)}%` },
  avgCpc: { label: '평균 CPC (₩)', format: v => `₩${Math.round(v).toLocaleString()}` },
  convRate: { label: '전환율 (%)', format: v => `${v.toFixed(2)}%` },
  cpa: { label: '전환당 비용 (₩)', format: v => `₩${Math.round(v).toLocaleString()}` },
  cost: { label: '총 비용 (₩)', format: v => `₩${Math.round(v).toLocaleString()}` },
  roas: { label: 'ROAS (%)', format: v => `${v.toFixed(0)}%` },
};

const COLORS = ['#2A7F6F', '#1B2A4A', '#D4A843', '#C75B4A', '#6B7280'];

export function ComparisonBar({ campaigns, metric }: ComparisonBarProps) {
  const config = METRIC_LABELS[metric];

  const chartData = {
    labels: campaigns.map(c => c.campaign.length > 12 ? c.campaign.slice(0, 12) + '…' : c.campaign),
    datasets: [{
      label: config.label,
      data: campaigns.map(c => c[metric]),
      backgroundColor: campaigns.map((_, i) => COLORS[i % COLORS.length] + 'CC'),
      borderColor: campaigns.map((_, i) => COLORS[i % COLORS.length]),
      borderWidth: 1,
      borderRadius: 4,
    }],
  };

  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#1B2A4A',
              callbacks: {
                label: (ctx) => config.format(ctx.parsed.y ?? 0),
              },
            },
          },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 } } },
            y: { grid: { color: '#E5E4DE40' }, ticks: { font: { size: 10 } } },
          },
        }}
        height={250}
      />
    </div>
  );
}
