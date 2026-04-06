import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import type { CampaignSummary } from '../../types/google-ads';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface RadarChartProps {
  campaigns: CampaignSummary[];
}

const COLORS = ['#2A7F6F', '#1B2A4A', '#D4A843', '#C75B4A'];

function normalize(value: number, max: number): number {
  if (max === 0) return 0;
  return Math.min((value / max) * 100, 100);
}

export function RadarChart({ campaigns }: RadarChartProps) {
  const maxCtr = Math.max(...campaigns.map(c => c.ctr), 1);
  const maxConvRate = Math.max(...campaigns.map(c => c.convRate), 1);
  const maxRoas = Math.max(...campaigns.map(c => c.roas), 1);
  const maxClicks = Math.max(...campaigns.map(c => c.clicks), 1);
  const maxImpressions = Math.max(...campaigns.map(c => c.impressions), 1);

  const chartData = {
    labels: ['클릭률', '전환율', 'ROAS', '클릭수', '노출수'],
    datasets: campaigns.map((camp, i) => ({
      label: camp.campaign.length > 12 ? camp.campaign.slice(0, 12) + '…' : camp.campaign,
      data: [
        normalize(camp.ctr, maxCtr),
        normalize(camp.convRate, maxConvRate),
        normalize(camp.roas, maxRoas),
        normalize(camp.clicks, maxClicks),
        normalize(camp.impressions, maxImpressions),
      ],
      borderColor: COLORS[i % COLORS.length],
      backgroundColor: COLORS[i % COLORS.length] + '20',
      borderWidth: 2,
      pointRadius: 3,
    })),
  };

  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <Radar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: { font: { size: 11 }, usePointStyle: true },
            },
          },
          scales: {
            r: {
              min: 0,
              max: 100,
              ticks: { display: false },
              grid: { color: '#E5E4DE60' },
              pointLabels: { font: { size: 11 } },
            },
          },
        }}
        height={300}
      />
    </div>
  );
}
