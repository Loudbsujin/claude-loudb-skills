import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, Play } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  onLoadSample: () => void;
  isLoading: boolean;
  error: string | null;
}

export function UploadZone({ onFileSelect, onLoadSample, isLoading, error }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  }, [onFileSelect]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-navy mb-2">광고 데이터 분석 시작하기</h2>
          <p className="text-gray-text text-sm">
            Google Ads에서 다운로드한 CSV 파일을 업로드하면<br />
            광고 성과를 한눈에 파악할 수 있습니다.
          </p>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer
            transition-all duration-200
            ${isDragging
              ? 'border-teal bg-teal-light scale-[1.02]'
              : 'border-border hover:border-navy-light hover:bg-warm-gray'
            }
            ${isLoading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isLoading}
          />
          <div className="flex flex-col items-center gap-3">
            {isLoading ? (
              <div className="w-10 h-10 border-3 border-navy border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className="w-14 h-14 bg-warm-gray rounded-xl flex items-center justify-center">
                {isDragging ? (
                  <FileSpreadsheet className="w-7 h-7 text-teal" />
                ) : (
                  <Upload className="w-7 h-7 text-navy-light" />
                )}
              </div>
            )}
            <div>
              <p className="font-medium text-navy">
                {isLoading ? '파일 분석 중...' : 'CSV 파일을 여기에 끌어다 놓으세요'}
              </p>
              <p className="text-xs text-gray-text mt-1">또는 클릭하여 파일 선택</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-coral-light text-coral rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={onLoadSample}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white rounded-lg
              hover:bg-navy-light transition-colors text-sm font-medium
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            샘플 데이터로 체험하기
          </button>
          <p className="text-xs text-gray-text mt-2">
            월 30만원 규모의 관공서 광고 샘플 데이터입니다
          </p>
        </div>

        <div className="mt-8 p-4 bg-warm-gray rounded-xl">
          <p className="text-xs font-medium text-navy mb-2">CSV 파일 다운로드 방법</p>
          <ol className="text-xs text-gray-text space-y-1 list-decimal list-inside">
            <li>Google Ads에 로그인합니다</li>
            <li>원하는 캠페인 또는 키워드 탭으로 이동합니다</li>
            <li>기간을 설정한 후, 오른쪽 상단 다운로드 아이콘을 클릭합니다</li>
            <li>CSV 형식을 선택하여 다운로드합니다</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
