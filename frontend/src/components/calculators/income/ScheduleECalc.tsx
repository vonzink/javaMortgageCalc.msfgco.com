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
  calculateScheduleE,
  type ScheduleEParams,
  type ScheduleEResult,
} from '@/utils/calculations/income';

interface ScheduleEPropertyYear {
  rentsReceived: number;
  royaltiesReceived: number;
  amortization: number;
  totalExpenses: number;
  depreciation: number;
  insurance: number;
  mortgageInterest: number;
  taxes: number;
}

const EMPTY_YEAR: ScheduleEPropertyYear = {
  rentsReceived: 0,
  royaltiesReceived: 0,
  amortization: 0,
  totalExpenses: 0,
  depreciation: 0,
  insurance: 0,
  mortgageInterest: 0,
  taxes: 0,
};

const YEAR_FIELDS: { key: keyof ScheduleEPropertyYear; label: string }[] = [
  { key: 'rentsReceived', label: 'Rents Received' },
  { key: 'royaltiesReceived', label: 'Royalties Received' },
  { key: 'amortization', label: 'Amortization' },
  { key: 'totalExpenses', label: 'Total Expenses' },
  { key: 'depreciation', label: 'Depreciation' },
  { key: 'insurance', label: 'Insurance' },
  { key: 'mortgageInterest', label: 'Mortgage Interest' },
  { key: 'taxes', label: 'Taxes' },
];

export default function ScheduleECalc() {
  const [year1, setYear1] = useState<ScheduleEPropertyYear>({ ...EMPTY_YEAR });
  const [year2, setYear2] = useState<ScheduleEPropertyYear>({ ...EMPTY_YEAR });
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [result, setResult] = useState<ScheduleEResult | null>(null);

  const updateYear = (
    setter: React.Dispatch<React.SetStateAction<ScheduleEPropertyYear>>,
    field: keyof ScheduleEPropertyYear,
    value: number
  ) => {
    setter((prev) => ({ ...prev, [field]: value }));
  };

  const calculate = useCallback(() => {
    const params: ScheduleEParams = { year1, year2, monthlyPayment };
    setResult(calculateScheduleE(params));
  }, [year1, year2, monthlyPayment]);

  const reset = useCallback(() => {
    setYear1({ ...EMPTY_YEAR });
    setYear2({ ...EMPTY_YEAR });
    setMonthlyPayment(0);
    setResult(null);
  }, []);

  const methodLabel = result?.policy.method === 'average' ? '2-Year Average' : 'Most Recent Year';
  const isPositive = (result?.finalResult ?? 0) >= 0;

  return (
    <IncomeCalcShell
      title="Schedule E Non-Subject Property"
      description="Calculate qualifying rental income from Schedule E with monthly payment offset"
      onCalculate={calculate}
      onReset={reset}
      isCalculated={!!result}
      monthlyIncome={result ? Math.max(0, result.finalResult) : undefined}
      method={result ? methodLabel : undefined}
      results={
        result ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ResultCard label="Year 1 Total" value={formatCurrency(result.totalYear1)} />
              <ResultCard label="Year 2 Total" value={formatCurrency(result.totalYear2)} />
              <ResultCard label="Monthly Average" value={formatCurrency(result.monthlyAverage)} variant="primary" />
              <ResultCard
                label="Final Result"
                value={formatCurrency(result.finalResult)}
                variant={isPositive ? 'success' : 'danger'}
                subValue={isPositive ? 'Add to qualifying income' : 'Count as monthly expense'}
              />
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
                    { label: 'Monthly Average', value: formatCurrency(result.monthlyAverage) },
                    { label: 'Monthly Payment (Credit Report)', value: `- ${formatCurrency(result.monthlyPayment)}` },
                    { label: 'Net Monthly Result', value: formatCurrency(result.finalResult), highlight: true },
                  ]}
                />
              </div>
            </ResultSection>

            <ShowCalculations
              steps={[
                { label: 'Year 1 Annual', formula: '(Rents + Royalties + Amort + Depr + Ins + MortInt + Taxes) - Total Expenses', value: formatCurrency(result.totalYear1) },
                { label: 'Year 2 Annual', value: formatCurrency(result.totalYear2) },
                { label: 'Method', value: methodLabel },
                { label: 'Monthly Average', value: formatCurrency(result.monthlyAverage) },
                { label: 'Monthly Payment', value: formatCurrency(result.monthlyPayment) },
                { label: 'Final Result', formula: 'Monthly Average - Monthly Payment', value: formatCurrency(result.finalResult) },
              ]}
            />
          </>
        ) : undefined
      }
    >
      <FieldGroup title="Monthly Payment from Credit Report">
        <FieldRow columns={1}>
          <CurrencyInput
            label="Monthly Payment"
            value={monthlyPayment}
            onChange={setMonthlyPayment}
            hint="From the borrower's credit report for this property"
          />
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Schedule E Property Income">
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
