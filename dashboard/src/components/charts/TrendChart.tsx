import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { DailyMetric } from '../../types/google-ads';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface TrendChartProps {
  data: DailyMetric[];
  metrics: ('clicks' | 'impressions' | 'cost' | 'conversions')[];
}

const METRIC_CONFIG: Record<string, { label: string; color: string; yAxisID: string }> = {
  clicks: { label: '클릭수', color: '#2A7F6F', yAxisID: 'y' },
  impressions: { label: '노출수', color: '#1B2A4A', yAxisID: 'y1' },
  cost: { label: '비용', color: '#D4A843', yAxisID: 'y' },
  conversions: { label: '전환수', color: '#C75B4A', yAxisID: 'y' },
};

export function TrendChart({ data, metrics }: TrendChartProps) {
  const labels = data.map(d => {
    const date = new Date(d.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  const hasSecondAxis = metrics.includes('impressions') && metrics.length > 1;

  const chartData = {
    labels,
    datasets: metrics.map((metric) => {
      const config = METRIC_CONFIG[metric];
      return {
        label: config.label,
        data: data.map(d => d[metric]),
        borderColor: config.color,
        backgroundColor: config.color + '15',
        tension: 0.3,
        fill: metrics.length === 1,
        pointRadius: data.length > 20 ? 0 : 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        yAxisID: hasSecondAxis ? config.yAxisID : 'y',
      };
    }),
  };

  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              position: 'top',
              labels: { font: { size: 11 }, usePointStyle: true, pointStyleWidth: 8 },
            },
            tooltip: {
              backgroundColor: '#1B2A4A',
              titleFont: { size: 11 },
              bodyFont: { size: 11 },
              callbacks: {
                label: (ctx) => {
                  const metric = metrics[ctx.datasetIndex];
                  const val = ctx.parsed.y ?? 0;
                  if (metric === 'cost') return `비용: ₩${val.toLocaleString()}`;
                  return `${ctx.dataset.label}: ${val.toLocaleString()}`;
                },
              },
            },
          },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 } } },
            y: { grid: { color: '#E5E4DE40' }, ticks: { font: { size: 10 } } },
            ...(hasSecondAxis ? {
              y1: {
                position: 'right' as const,
                grid: { display: false },
                ticks: { font: { size: 10 } },
              },
            } : {}),
          },
        }}
        height={280}
      />
    </div>
  );
}
