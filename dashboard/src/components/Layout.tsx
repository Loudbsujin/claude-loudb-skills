import { BarChart3, Download, Image } from 'lucide-react';
import type { TabType, CampaignGoalType } from '../types/google-ads';
import { TAB_LABELS, GOAL_TYPE_LABELS } from '../lib/i18n';
import { exportToPDF, exportToPNG } from '../lib/export';

interface LayoutProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  goalType: CampaignGoalType;
  onGoalTypeChange: (type: CampaignGoalType) => void;
  hasData: boolean;
  onReset: () => void;
  children: React.ReactNode;
}

const TABS: TabType[] = ['overview', 'comparison', 'keywords', 'budget'];

export function Layout({
  activeTab, onTabChange, goalType, onGoalTypeChange, hasData, onReset, children,
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-5 h-5 text-teal" />
              <h1 className="text-base font-bold text-navy">광고 성과 분석</h1>
            </div>

            {hasData && (
              <div className="flex items-center gap-3">
                <select
                  value={goalType}
                  onChange={(e) => onGoalTypeChange(e.target.value as CampaignGoalType)}
                  className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-white text-navy
                    focus:outline-none focus:ring-1 focus:ring-teal"
                >
                  {Object.entries(GOAL_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <button
                  onClick={onReset}
                  className="text-xs text-gray-text hover:text-navy transition-colors"
                >
                  새 파일 업로드
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          {hasData && (
            <nav className="flex gap-1 -mb-px overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => onTabChange(tab)}
                  className={`
                    px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                    ${activeTab === tab
                      ? 'border-teal text-teal'
                      : 'border-transparent text-gray-text hover:text-navy hover:border-border'
                    }
                  `}
                >
                  {TAB_LABELS[tab]}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main content */}
      <main id="dashboard-content" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {children}
      </main>

      {/* Export bar */}
      {hasData && (
        <footer className="bg-white border-t border-border sticky bottom-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex justify-end gap-2">
            <button
              onClick={() => exportToPDF('dashboard-content', '광고성과분석.pdf')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                bg-navy text-white rounded-lg hover:bg-navy-light transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              PDF 내보내기
            </button>
            <button
              onClick={() => exportToPNG('dashboard-content', '광고성과분석.png')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                border border-border text-navy rounded-lg hover:bg-warm-gray transition-colors"
            >
              <Image className="w-3.5 h-3.5" />
              이미지 저장
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
