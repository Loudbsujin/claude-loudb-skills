import { Bubble } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { KeywordMetric } from '../../types/google-ads';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

interface ScatterChartProps {
  keywords: KeywordMetric[];
}

export function ScatterChart({ keywords }: ScatterChartProps) {
  const maxCost = Math.max(...keywords.map(k => k.cost), 1);

  const chartData = {
    datasets: [{
      label: '키워드',
      data: keywords.slice(0, 30).map(k => ({
        x: k.avgCpc,
        y: k.convRate,
        r: Math.max(3, (k.cost / maxCost) * 25),
      })),
      backgroundColor: keywords.slice(0, 30).map(k =>
        k.convRate > 2 ? '#2A7F6F80' : k.convRate > 0.5 ? '#D4A84380' : '#C75B4A80'
      ),
      borderColor: keywords.slice(0, 30).map(k =>
        k.convRate > 2 ? '#2A7F6F' : k.convRate > 0.5 ? '#D4A843' : '#C75B4A'
      ),
      borderWidth: 1,
    }],
  };

  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <p className="text-xs text-gray-text mb-3">
        버블 크기 = 비용, 초록 = 전환율 높음, 노랑 = 보통, 빨강 = 낮음
      </p>
      <Bubble
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#1B2A4A',
              callbacks: {
                label: (ctx) => {
                  const kw = keywords[ctx.dataIndex];
                  if (!kw) return '';
                  return [
                    `키워드: ${kw.keyword}`,
                    `CPC: ₩${Math.round(kw.avgCpc).toLocaleString()}`,
                    `전환율: ${kw.convRate.toFixed(2)}%`,
                    `비용: ₩${Math.round(kw.cost).toLocaleString()}`,
                  ];
                },
              },
            },
          },
          scales: {
            x: {
              title: { display: true, text: '평균 CPC (₩)', font: { size: 11 } },
              grid: { color: '#E5E4DE40' },
              ticks: { font: { size: 10 } },
            },
            y: {
              title: { display: true, text: '전환율 (%)', font: { size: 11 } },
              grid: { color: '#E5E4DE40' },
              ticks: { font: { size: 10 } },
            },
          },
        }}
        height={300}
      />
    </div>
  );
}
