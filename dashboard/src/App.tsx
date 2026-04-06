import { useState, useCallback } from 'react';
import type { GoogleAdsRow, TabType, CampaignGoalType } from './types/google-ads';
import { parseCSV } from './lib/csv-parser';
import { Layout } from './components/Layout';
import { UploadZone } from './components/UploadZone';
import { OverviewTab } from './components/tabs/OverviewTab';
import { ComparisonTab } from './components/tabs/ComparisonTab';
import { KeywordTab } from './components/tabs/KeywordTab';
import { BudgetTab } from './components/tabs/BudgetTab';

export default function App() {
  const [rows, setRows] = useState<GoogleAdsRow[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [goalType, setGoalType] = useState<CampaignGoalType>('traffic');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const parsed = await parseCSV(file);
      if (parsed.length === 0) {
        throw new Error('유효한 데이터가 없습니다.');
      }
      setRows(parsed);
      setActiveTab('overview');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'CSV 파일을 읽을 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLoadSample = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/sample-data.csv');
      if (!response.ok) throw new Error('샘플 데이터를 불러올 수 없습니다.');
      const blob = await response.blob();
      const file = new File([blob], 'sample-data.csv', { type: 'text/csv' });
      const parsed = await parseCSV(file);
      setRows(parsed);
      setActiveTab('overview');
    } catch (e) {
      setError(e instanceof Error ? e.message : '샘플 데이터를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setRows([]);
    setActiveTab('overview');
    setError(null);
  }, []);

  const hasData = rows.length > 0;

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      goalType={goalType}
      onGoalTypeChange={setGoalType}
      hasData={hasData}
      onReset={handleReset}
    >
      {!hasData ? (
        <UploadZone
          onFileSelect={handleFileSelect}
          onLoadSample={handleLoadSample}
          isLoading={isLoading}
          error={error}
        />
      ) : (
        <>
          {activeTab === 'overview' && <OverviewTab rows={rows} goalType={goalType} />}
          {activeTab === 'comparison' && <ComparisonTab rows={rows} goalType={goalType} />}
          {activeTab === 'keywords' && <KeywordTab rows={rows} />}
          {activeTab === 'budget' && <BudgetTab rows={rows} goalType={goalType} />}
        </>
      )}
    </Layout>
  );
}
