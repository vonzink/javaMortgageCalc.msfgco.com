import { useState, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import CalculatorShell from '@/components/calculators/CalculatorShell';
import ResultCard from '@/components/calculators/ResultCard';
import ResultSection from '@/components/calculators/ResultSection';
import FieldGroup from '@/components/calculators/FieldGroup';
import { Upload, Download, FileText, AlertCircle } from 'lucide-react';
import {
  calculateLLPM,
  type LLPMParams,
  type LLPMResult,
} from '@/utils/calculations/llpm';

interface BatchRow extends LLPMParams {
  rowIndex: number;
}

interface BatchResult {
  row: BatchRow;
  result: LLPMResult;
}

const CSV_COLUMNS = [
  'loanAmount',
  'ltv',
  'fico',
  'loanPurpose',
  'propertyType',
  'occupancy',
  'lockDays',
  'basePrice',
];

const SAMPLE_CSV = `loanAmount,ltv,fico,loanPurpose,propertyType,occupancy,lockDays,basePrice
350000,80,740,Purchase,SFR,Primary,30,100
425000,90,680,RateTermRefi,Condo,Primary,30,100.25
275000,75,760,Purchase,SFR,Secondary,45,99.875
550000,85,700,CashOutRefi,2Unit,Investment,30,100.5`;

function parseCSVRow(row: Record<string, string>, index: number): BatchRow | null {
  const loanAmount = parseFloat(row.loanAmount);
  const ltv = parseFloat(row.ltv);
  const fico = parseInt(row.fico, 10);
  const basePrice = parseFloat(row.basePrice);
  const lockDays = parseInt(row.lockDays, 10);

  if (isNaN(loanAmount) || isNaN(ltv) || isNaN(fico) || isNaN(basePrice)) {
    return null;
  }

  const loanPurpose = row.loanPurpose as LLPMParams['loanPurpose'];
  const propertyType = row.propertyType as LLPMParams['propertyType'];
  const occupancy = row.occupancy as LLPMParams['occupancy'];

  return {
    rowIndex: index,
    loanAmount,
    ltv,
    fico,
    loanPurpose: loanPurpose || 'Purchase',
    propertyType: propertyType || 'SFR',
    occupancy: occupancy || 'Primary',
    lockDays: isNaN(lockDays) ? 30 : lockDays,
    basePrice,
  };
}

export default function BatchLlpmCalc() {
  const [results, setResults] = useState<BatchResult[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [rawData, setRawData] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processCSV = useCallback((csvContent: string) => {
    const parseResult = Papa.parse<Record<string, string>>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
    });

    const newErrors: string[] = [];
    const batchResults: BatchResult[] = [];

    if (parseResult.errors.length > 0) {
      parseResult.errors.forEach((err) => {
        newErrors.push(`Row ${err.row}: ${err.message}`);
      });
    }

    parseResult.data.forEach((row, i) => {
      const parsed = parseCSVRow(row, i + 1);
      if (!parsed) {
        newErrors.push(`Row ${i + 2}: Invalid data - check numeric values`);
        return;
      }

      const result = calculateLLPM(parsed);
      batchResults.push({ row: parsed, result });
    });

    setResults(batchResults);
    setErrors(newErrors);
  }, []);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setRawData(content);
        processCSV(content);
      };
      reader.readAsText(file);
    },
    [processCSV]
  );

  const handleExport = useCallback(() => {
    if (results.length === 0) return;

    const exportData = results.map((r) => ({
      loanAmount: r.row.loanAmount,
      ltv: r.row.ltv,
      fico: r.row.fico,
      loanPurpose: r.row.loanPurpose,
      propertyType: r.row.propertyType,
      occupancy: r.row.occupancy,
      lockDays: r.row.lockDays,
      basePrice: r.result.basePrice.toFixed(3),
      totalAdjustment: r.result.totalAdjustment.toFixed(3),
      finalPrice: r.result.finalPrice.toFixed(3),
      adjustmentCount: r.result.adjustments.length,
      adjustmentDetails: r.result.adjustments
        .map((a) => `${a.category}: ${a.adjustment >= 0 ? '+' : ''}${a.adjustment.toFixed(3)}`)
        .join('; '),
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `llpm-results-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [results]);

  const handleLoadSample = useCallback(() => {
    setFileName('sample-data.csv');
    setRawData(SAMPLE_CSV);
    processCSV(SAMPLE_CSV);
  }, [processCSV]);

  const reset = useCallback(() => {
    setResults([]);
    setErrors([]);
    setFileName('');
    setRawData('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <CalculatorShell
      title="Batch LLPM Processor"
      description="Upload a CSV file to run Loan-Level Price Matrix calculations on multiple loans at once."
      onReset={reset}
      isCalculated={results.length > 0}
      results={
        results.length > 0 ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ResultCard
                label="Loans Processed"
                value={results.length.toString()}
                variant="primary"
              />
              <ResultCard
                label="Avg Final Price"
                value={(
                  results.reduce((sum, r) => sum + r.result.finalPrice, 0) / results.length
                ).toFixed(3)}
                variant="default"
              />
              <ResultCard
                label="Avg Adjustment"
                value={(
                  results.reduce((sum, r) => sum + r.result.totalAdjustment, 0) / results.length
                ).toFixed(3)}
                variant={
                  results.reduce((sum, r) => sum + r.result.totalAdjustment, 0) / results.length >=
                  0
                    ? 'success'
                    : 'danger'
                }
              />
              <ResultCard
                label="Errors"
                value={errors.length.toString()}
                variant={errors.length > 0 ? 'warning' : 'success'}
              />
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <ResultSection title="Parse Errors">
                <div className="space-y-1">
                  {errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {err}
                    </div>
                  ))}
                </div>
              </ResultSection>
            )}

            {/* Results Table */}
            <ResultSection title="Results">
              <div className="flex items-center justify-end mb-4">
                <button
                  onClick={handleExport}
                  className="btn-secondary flex items-center gap-2 text-sm"
                  type="button"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 pr-3 font-medium text-gray-600">#</th>
                      <th className="text-right py-2 pr-3 font-medium text-gray-600">Loan Amt</th>
                      <th className="text-right py-2 pr-3 font-medium text-gray-600">LTV</th>
                      <th className="text-right py-2 pr-3 font-medium text-gray-600">FICO</th>
                      <th className="text-left py-2 pr-3 font-medium text-gray-600">Purpose</th>
                      <th className="text-left py-2 pr-3 font-medium text-gray-600">Property</th>
                      <th className="text-left py-2 pr-3 font-medium text-gray-600">Occupancy</th>
                      <th className="text-right py-2 pr-3 font-medium text-gray-600">Base</th>
                      <th className="text-right py-2 pr-3 font-medium text-gray-600">Adj</th>
                      <th className="text-right py-2 font-medium text-gray-600">Final</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {results.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="py-2 pr-3 text-gray-500">{r.row.rowIndex}</td>
                        <td className="py-2 pr-3 text-right font-mono">
                          {r.row.loanAmount.toLocaleString()}
                        </td>
                        <td className="py-2 pr-3 text-right font-mono">{r.row.ltv}%</td>
                        <td className="py-2 pr-3 text-right font-mono">{r.row.fico}</td>
                        <td className="py-2 pr-3 text-gray-700">{r.row.loanPurpose}</td>
                        <td className="py-2 pr-3 text-gray-700">{r.row.propertyType}</td>
                        <td className="py-2 pr-3 text-gray-700">{r.row.occupancy}</td>
                        <td className="py-2 pr-3 text-right font-mono">
                          {r.result.basePrice.toFixed(3)}
                        </td>
                        <td
                          className={`py-2 pr-3 text-right font-mono font-medium ${
                            r.result.totalAdjustment >= 0 ? 'text-green-700' : 'text-red-700'
                          }`}
                        >
                          {r.result.totalAdjustment >= 0 ? '+' : ''}
                          {r.result.totalAdjustment.toFixed(3)}
                        </td>
                        <td className="py-2 text-right font-mono font-bold text-gray-900">
                          {r.result.finalPrice.toFixed(3)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ResultSection>
          </>
        ) : undefined
      }
    >
      {/* File Upload */}
      <FieldGroup title="Upload CSV File">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {fileName ? (
                  <span className="flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    {fileName}
                  </span>
                ) : (
                  'Click to upload a CSV file'
                )}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                CSV with columns: loanAmount, ltv, fico, loanPurpose, propertyType, occupancy,
                lockDays, basePrice
              </p>
            </label>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleLoadSample}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Load Sample Data
            </button>
          </div>
        </div>
      </FieldGroup>

      {/* CSV Format Guide */}
      <FieldGroup title="CSV Format">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-3">
            Required columns (headers must match exactly):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-mono font-medium text-gray-800">loanAmount</span>
              <span className="text-gray-500 ml-2">Numeric (e.g., 350000)</span>
            </div>
            <div>
              <span className="font-mono font-medium text-gray-800">ltv</span>
              <span className="text-gray-500 ml-2">Numeric (e.g., 80)</span>
            </div>
            <div>
              <span className="font-mono font-medium text-gray-800">fico</span>
              <span className="text-gray-500 ml-2">Numeric (e.g., 740)</span>
            </div>
            <div>
              <span className="font-mono font-medium text-gray-800">loanPurpose</span>
              <span className="text-gray-500 ml-2">
                Purchase | RateTermRefi | CashOutRefi
              </span>
            </div>
            <div>
              <span className="font-mono font-medium text-gray-800">propertyType</span>
              <span className="text-gray-500 ml-2">
                SFR | Condo | 2Unit | 3-4Unit | Manufactured
              </span>
            </div>
            <div>
              <span className="font-mono font-medium text-gray-800">occupancy</span>
              <span className="text-gray-500 ml-2">Primary | Secondary | Investment</span>
            </div>
            <div>
              <span className="font-mono font-medium text-gray-800">lockDays</span>
              <span className="text-gray-500 ml-2">Numeric (e.g., 30)</span>
            </div>
            <div>
              <span className="font-mono font-medium text-gray-800">basePrice</span>
              <span className="text-gray-500 ml-2">Numeric (e.g., 100)</span>
            </div>
          </div>
        </div>
      </FieldGroup>
    </CalculatorShell>
  );
}
