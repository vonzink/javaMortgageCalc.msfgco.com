import { useState, useCallback } from 'react';
import IncomeCalcShell, { MethodBadge } from '@/components/calculators/income/IncomeCalcShell';
import ResultCard from '@/components/calculators/ResultCard';
import ResultSection from '@/components/calculators/ResultSection';
import { ResultTable } from '@/components/calculators/ResultSection';
import ShowCalculations from '@/components/calculators/ShowCalculations';
import CurrencyInput from '@/components/calculators/CurrencyInput';
import FieldRow from '@/components/calculators/FieldRow';
import FieldGroup from '@/components/calculators/FieldGroup';
import { YearGroup } from '@/components/calculators/FieldGroup';
import { formatCurrency } from '@/utils/formatters';
import {
  calculateScheduleESubject,
  type ScheduleESubjectParams,
  type ScheduleESubjectResult,
} from '@/utils/calculations/income';

interface ScheduleESubjectYear {
  rentsReceived: number;
  royaltiesReceived: number;
  amortCasualty: number;
  totalExpenses: number;
  depreciation: number;
  insurance: number;
  mortgageInterest: number;
  taxes: number;
}

const EMPTY_YEAR: ScheduleESubjectYear = {
  rentsReceived: 0,
  royaltiesReceived: 0,
  amortCasualty: 0,
  totalExpenses: 0,
  depreciation: 0,
  insurance: 0,
  mortgageInterest: 0,
  taxes: 0,
};

const YEAR_FIELDS: { key: keyof ScheduleESubjectYear; label: string }[] = [
  { key: 'rentsReceived', label: 'Rents Received' },
  { key: 'royaltiesReceived', label: 'Royalties Received' },
  { key: 'amortCasualty', label: 'Amort / Casualty Loss' },
  { key: 'totalExpenses', label: 'Total Expenses' },
  { key: 'depreciation', label: 'Depreciation' },
  { key: 'insurance', label: 'Insurance' },
  { key: 'mortgageInterest', label: 'Mortgage Interest' },
  { key: 'taxes', label: 'Taxes' },
];

export default function ScheduleESubjectCalc() {
  const [year1, setYear1] = useState<ScheduleESubjectYear>({ ...EMPTY_YEAR });
  const [year2, setYear2] = useState<ScheduleESubjectYear>({ ...EMPTY_YEAR });
  const [result, setResult] = useState<ScheduleESubjectResult | null>(null);

  const updateYear = (
    setter: React.Dispatch<React.SetStateAction<ScheduleESubjectYear>>,
    field: keyof ScheduleESubjectYear,
    value: number
  ) => {
    setter((prev) => ({ ...prev, [field]: value }));
  };

  const calculate = useCallback(() => {
    const params: ScheduleESubjectParams = { year1, year2 };
    setResult(calculateScheduleESubject(params));
  }, [year1, year2]);

  const reset = useCallback(() => {
    setYear1({ ...EMPTY_YEAR });
    setYear2({ ...EMPTY_YEAR });
    setResult(null);
  }, []);

  const methodLabel = result?.policy.method === 'average' ? '2-Year Average' : 'Most Recent Year';

  return (
    <IncomeCalcShell
      title="Schedule E Subject Property"
      description="Calculate qualifying rental income for the subject property (no monthly payment offset)"
      onCalculate={calculate}
      onReset={reset}
      isCalculated={!!result}
      monthlyIncome={result?.monthly}
      method={result ? methodLabel : undefined}
      results={
        result ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ResultCard label="Year 1 Total" value={formatCurrency(result.totalYear1)} />
              <ResultCard label="Year 2 Total" value={formatCurrency(result.totalYear2)} />
              <ResultCard label="Monthly Income" value={formatCurrency(result.monthly)} variant="success" />
            </div>

            <ResultSection title="Calculation Details">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700">Income Method</h4>
                  <MethodBadge method={methodLabel} />
                </div>
                <ResultTable
                  rows={[
                    { label: 'Year 1 Annual Income', value: formatCurrency(result.totalYear1) },
                    { label: 'Year 2 Annual Income', value: formatCurrency(result.totalYear2) },
                    { label: 'Monthly Income', value: formatCurrency(result.monthly), highlight: true },
                  ]}
                />
              </div>
            </ResultSection>

            <ShowCalculations
              steps={[
                { label: 'Year 1 Annual', formula: '(Rents + Royalties + AmortCasualty + Depr + Ins + MortInt + Taxes) - Total Expenses', value: formatCurrency(result.totalYear1) },
                { label: 'Year 2 Annual', value: formatCurrency(result.totalYear2) },
                { label: 'Method', value: methodLabel },
                { label: 'Monthly Income', value: formatCurrency(result.monthly) },
              ]}
            />
          </>
        ) : undefined
      }
    >
      <FieldGroup title="Subject Property Schedule E Income">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <YearGroup year={1} label="Year 1 (Most Recent)">
            {YEAR_FIELDS.map((f) => (
              <CurrencyInput
                key={f.key}
                label={f.label}
                value={year1[f.key]}
                onChange={(v) => updateYear(setYear1, f.key, v)}
              />
            ))}
          </YearGroup>
          <YearGroup year={2} label="Year 2 (Prior)">
            {YEAR_FIELDS.map((f) => (
              <CurrencyInput
                key={f.key}
                label={f.label}
                value={year2[f.key]}
                onChange={(v) => updateYear(setYear2, f.key, v)}
              />
            ))}
          </YearGroup>
        </div>
      </FieldGroup>
    </IncomeCalcShell>
  );
}
