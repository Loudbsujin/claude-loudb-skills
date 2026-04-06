import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import type { ScoreLabel } from '../types/google-ads';

interface MetricCardProps {
  label: string;
  value: string;
  explanation: string;
  scoreLabel?: ScoreLabel;
  trend?: 'up' | 'down' | 'neutral';
}

const SCORE_STYLES: Record<ScoreLabel, { bg: string; border: string; text: string }> = {
  '우수': { bg: 'bg-teal-light', border: 'border-l-teal', text: 'text-teal' },
  '양호': { bg: 'bg-amber-light', border: 'border-l-amber', text: 'text-amber' },
  '주의': { bg: 'bg-amber-light', border: 'border-l-amber', text: 'text-amber' },
  '개선필요': { bg: 'bg-coral-light', border: 'border-l-coral', text: 'text-coral' },
};

export function MetricCard({ label, value, explanation, scoreLabel }: MetricCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const style = scoreLabel ? SCORE_STYLES[scoreLabel] : null;

  return (
    <div
      className={`
        relative p-4 rounded-xl border border-border bg-white
        ${style ? `border-l-4 ${style.border}` : ''}
        transition-shadow hover:shadow-sm
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-gray-text">{label}</span>
        <button
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowTooltip(!showTooltip)}
          className="text-gray-text/50 hover:text-gray-text transition-colors"
          aria-label={`${label} 설명`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="text-xl font-bold text-navy">{value}</div>

      {scoreLabel && style && (
        <span className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
          {scoreLabel}
        </span>
      )}

      {showTooltip && (
        <div className="absolute z-10 left-0 right-0 top-full mt-1 p-3 bg-navy text-white text-xs rounded-lg shadow-lg leading-relaxed">
          {explanation}
        </div>
      )}
    </div>
  );
}
