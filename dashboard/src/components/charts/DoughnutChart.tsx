import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartProps {
  labels: string[];
  values: number[];
  title?: string;
}

const COLORS = ['#2A7F6F', '#1B2A4A', '#D4A843', '#C75B4A', '#6B7280', '#4A90A4', '#8B6F47'];

export function DoughnutChart({ labels, values, title }: DoughnutChartProps) {
  const chartData = {
    labels: labels.map(l => l.length > 15 ? l.slice(0, 15) + '…' : l),
    datasets: [{
      data: values,
      backgroundColor: COLORS.slice(0, values.length).map(c => c + 'CC'),
      borderColor: COLORS.slice(0, values.length),
      borderWidth: 1,
    }],
  };

  return (
    <div className="bg-white rounded-xl border border-border p-4">
      {title && <p className="text-sm font-medium text-navy mb-3">{title}</p>}
      <Doughnut
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { font: { size: 10 }, usePointStyle: true, padding: 12 },
            },
            tooltip: {
              backgroundColor: '#1B2A4A',
              callbacks: {
                label: (ctx) => {
                  const total = values.reduce((s, v) => s + v, 0);
                  const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : '0';
                  return `${ctx.label}: ₩${Math.round(ctx.parsed).toLocaleString()} (${pct}%)`;
                },
              },
            },
          },
        }}
        height={250}
      />
    </div>
  );
}
