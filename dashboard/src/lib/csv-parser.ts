import Papa from 'papaparse';
import { COLUMN_MAP, type GoogleAdsRow } from '../types/google-ads';

function cleanNumeric(value: string | number | undefined): number {
  if (value === undefined || value === null || value === '--' || value === '') return 0;
  if (typeof value === 'number') return value;
  const cleaned = value
    .replace(/₩/g, '')
    .replace(/원/g, '')
    .replace(/,/g, '')
    .replace(/%/g, '')
    .replace(/\s/g, '')
    .trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function mapHeaders(headers: string[]): Record<string, keyof GoogleAdsRow> {
  const mapping: Record<string, keyof GoogleAdsRow> = {};
  for (const header of headers) {
    const trimmed = header.trim();
    if (COLUMN_MAP[trimmed]) {
      mapping[trimmed] = COLUMN_MAP[trimmed];
    } else {
      // fuzzy match: try lowercase
      const lower = trimmed.toLowerCase();
      for (const [key, val] of Object.entries(COLUMN_MAP)) {
        if (key.toLowerCase() === lower) {
          mapping[trimmed] = val;
          break;
        }
      }
    }
  }
  return mapping;
}

const NUMERIC_FIELDS = new Set<keyof GoogleAdsRow>([
  'impressions', 'clicks', 'ctr', 'avgCpc', 'cost',
  'conversions', 'convRate', 'cpa', 'convValue', 'roas', 'budget',
]);

export function parseCSV(file: File): Promise<GoogleAdsRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete(results) {
        if (!results.data || results.data.length === 0) {
          reject(new Error('CSV 파일에 데이터가 없습니다.'));
          return;
        }

        const headers = results.meta.fields || [];
        const headerMapping = mapHeaders(headers);

        if (Object.keys(headerMapping).length === 0) {
          reject(new Error('Google Ads CSV 컬럼을 인식할 수 없습니다. 컬럼 헤더를 확인해주세요.'));
          return;
        }

        const rows: GoogleAdsRow[] = [];
        for (const raw of results.data as Record<string, string>[]) {
          const row: Partial<GoogleAdsRow> = {};
          for (const [originalHeader, internalKey] of Object.entries(headerMapping)) {
            const value = raw[originalHeader];
            if (NUMERIC_FIELDS.has(internalKey)) {
              (row as Record<string, unknown>)[internalKey] = cleanNumeric(value);
            } else {
              (row as Record<string, unknown>)[internalKey] = value?.trim() || '';
            }
          }

          // Skip rows without campaign name
          if (!row.campaign) continue;

          // Set defaults
          row.impressions = row.impressions || 0;
          row.clicks = row.clicks || 0;
          row.cost = row.cost || 0;
          row.conversions = row.conversions || 0;
          row.convValue = row.convValue || 0;
          row.budget = row.budget || 0;
          row.ctr = row.ctr || (row.impressions > 0 ? (row.clicks / row.impressions) * 100 : 0);
          row.avgCpc = row.avgCpc || (row.clicks > 0 ? row.cost / row.clicks : 0);
          row.convRate = row.convRate || (row.clicks > 0 ? (row.conversions / row.clicks) * 100 : 0);
          row.cpa = row.cpa || (row.conversions > 0 ? row.cost / row.conversions : 0);
          row.roas = row.roas || (row.cost > 0 ? (row.convValue / row.cost) * 100 : 0);
          row.date = row.date || '';

          rows.push(row as GoogleAdsRow);
        }

        resolve(rows);
      },
      error(error) {
        reject(new Error(`CSV 파싱 오류: ${error.message}`));
      },
    });
  });
}
