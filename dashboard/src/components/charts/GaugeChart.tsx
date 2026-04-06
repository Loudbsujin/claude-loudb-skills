interface GaugeChartProps {
  label: string;
  value: number; // 0-100+ percentage
}

export function GaugeChart({ label, value }: GaugeChartProps) {
  const clamped = Math.min(value, 120);
  const degrees = (clamped / 120) * 180;
  const color = value > 100 ? '#C75B4A' : value >= 70 ? '#2A7F6F' : value >= 50 ? '#D4A843' : '#C75B4A';
  const status = value > 100 ? '초과' : value >= 85 ? '적정' : value >= 50 ? '부족' : '매우 부족';

  return (
    <div className="bg-white rounded-xl border border-border p-4 flex flex-col items-center">
      <p className="text-xs font-medium text-gray-text mb-3 truncate max-w-full">{label}</p>
      <div className="relative w-28 h-14 overflow-hidden">
        <div className="absolute w-28 h-28 rounded-full border-[10px] border-warm-gray"
          style={{ clipPath: 'inset(0 0 50% 0)' }}
        />
        <div
          className="absolute w-28 h-28 rounded-full border-[10px] border-transparent"
          style={{
            borderTopColor: color,
            borderRightColor: degrees > 90 ? color : 'transparent',
            transform: `rotate(${degrees - 90}deg)`,
            clipPath: 'inset(0 0 50% 0)',
            transition: 'transform 0.8s ease-out',
          }}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <span className="text-lg font-bold" style={{ color }}>{Math.round(value)}%</span>
        </div>
      </div>
      <span className="text-[10px] font-medium mt-1" style={{ color }}>{status}</span>
    </div>
  );
}
