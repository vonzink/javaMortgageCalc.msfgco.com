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
  calculateScheduleF,
  type ScheduleFParams,
  type ScheduleFResult,
} from '@/utils/calculations/income';

interface ScheduleFYear {
  netProfit: number;
  coopPayments: number;
  otherIncome: number;
  depreciation: number;
  amortization: number;
  businessUseOfHome: number;
  mealsEntertainment: number;
}

const EMPTY_YEAR: ScheduleFYear = {
  netProfit: 0,
  coopPayments: 0,
  otherIncome: 0,
  depreciation: 0,
  amortization: 0,
  businessUseOfHome: 0,
  mealsEntertainment: 0,
};

const YEAR_FIELDS: { key: keyof ScheduleFYear; label: string }[] = [
  { key: 'netProfit', label: 'Net Profit' },
  { key: 'coopPayments', label: 'Co-op / CCC Payments' },
  { key: 'otherIncome', label: 'Other Income' },
  { key: 'depreciation', label: 'Depreciation' },
  { key: 'amortization', label: 'Amortization' },
  { key: 'businessUseOfHome', label: 'Business Use of Home' },
  { key: 'mealsEntertainment', label: 'Meals & Entertainment' },
];

export default function ScheduleFCalc() {
  const [year1, setYear1] = useState<ScheduleFYear>({ ...EMPTY_YEAR });
  const [year2, setYear2] = useState<ScheduleFYear>({ ...EMPTY_YEAR });
  const [result, setResult] = useState<ScheduleFResult | null>(null);

  const updateYear = (
    setter: React.Dispatch<React.SetStateAction<ScheduleFYear>>,
    field: keyof ScheduleFYear,
    value: number
  ) => {
    setter((prev) => ({ ...prev, [field]: value }));
  };

  const calculate = useCallback(() => {
    const params: ScheduleFParams = { year1, year2 };
    setResult(calculateScheduleF(params));
  }, [year1, year2]);

  const reset = useCallback(() => {
    setYear1({ ...EMPTY_YEAR });
    setYear2({ ...EMPTY_YEAR });
    setResult(null);
  }, []);

  const methodLabel = result?.policy.method === 'average' ? '2-Year Average' : 'Most Recent Year';

  return (
    <IncomeCalcShell
      title="Schedule F Farm Income"
      description="Calculate qualifying farm income with Fannie Mae averaging"
      onCalculate={calculate}
      onReset={reset}
      isCalculated={!!result}
      monthlyIncome={result?.monthly}
      method={result ? methodLabel : undefined}
      results={
        result ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ResultCard label="Year 1 Total" value={formatCurrency(result.year1Total)} />
              <ResultCard label="Year 2 Total" value={formatCurrency(result.year2Total)} />
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
                    { label: 'Year 1 Annual Income', value: formatCurrency(result.year1Total) },
                    { label: 'Year 2 Annual Income', value: formatCurrency(result.year2Total) },
                    { label: 'Monthly Income', value: formatCurrency(result.monthly), highlight: true },
                  ]}
                />
              </div>
            </ResultSection>

            <ShowCalculations
              steps={[
                { label: 'Year 1 Total', formula: 'NetProfit + CoopPay + OtherInc + Depr + Amort + HomeUse - Meals', value: formatCurrency(result.year1Total) },
                { label: 'Year 2 Total', value: formatCurrency(result.year2Total) },
                { label: 'Method', value: methodLabel },
                { label: 'Monthly Income', value: formatCurrency(result.monthly) },
              ]}
            />
          </>
        ) : undefined
      }
    >
      <FieldGroup title="Farm Income">
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
