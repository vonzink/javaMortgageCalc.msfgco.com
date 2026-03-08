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
  calculateScheduleD,
  type ScheduleDParams,
  type ScheduleDResult,
} from '@/utils/calculations/income';

const DEFAULT_PARAMS: ScheduleDParams = {
  shortTermYear1: 0,
  shortTermYear2: 0,
  longTermYear1: 0,
  longTermYear2: 0,
};

export default function ScheduleDCalc() {
  const [params, setParams] = useState<ScheduleDParams>({ ...DEFAULT_PARAMS });
  const [result, setResult] = useState<ScheduleDResult | null>(null);

  const update = <K extends keyof ScheduleDParams>(field: K, value: number) => {
    setParams((prev) => ({ ...prev, [field]: value }));
  };

  const calculate = useCallback(() => {
    setResult(calculateScheduleD(params));
  }, [params]);

  const reset = useCallback(() => {
    setParams({ ...DEFAULT_PARAMS });
    setResult(null);
  }, []);

  const methodLabel = result?.policy.method === 'average' ? '2-Year Average' : 'Most Recent Year';

  return (
    <IncomeCalcShell
      title="Schedule D Capital Gains/Losses"
      description="Calculate qualifying capital gains income with Fannie Mae averaging"
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
                    { label: 'Short-Term Year 1', value: formatCurrency(params.shortTermYear1) },
                    { label: 'Long-Term Year 1', value: formatCurrency(params.longTermYear1) },
                    { label: 'Year 1 Total', value: formatCurrency(result.totalYear1) },
                    { label: 'Short-Term Year 2', value: formatCurrency(params.shortTermYear2) },
                    { label: 'Long-Term Year 2', value: formatCurrency(params.longTermYear2) },
                    { label: 'Year 2 Total', value: formatCurrency(result.totalYear2) },
                    { label: 'Monthly Income', value: formatCurrency(result.monthly), highlight: true },
                  ]}
                />
              </div>
            </ResultSection>

            <ShowCalculations
              steps={[
                { label: 'Year 1 Total', formula: `${formatCurrency(params.shortTermYear1)} + ${formatCurrency(params.longTermYear1)}`, value: formatCurrency(result.totalYear1) },
                { label: 'Year 2 Total', formula: `${formatCurrency(params.shortTermYear2)} + ${formatCurrency(params.longTermYear2)}`, value: formatCurrency(result.totalYear2) },
                { label: 'Method', value: methodLabel },
                { label: 'Monthly Income', value: formatCurrency(result.monthly) },
              ]}
            />
          </>
        ) : undefined
      }
    >
      <FieldGroup title="Capital Gains & Losses">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <YearGroup year={1} label="Year 1 (Most Recent)">
            <CurrencyInput
              label="Short-Term Gain/Loss"
              value={params.shortTermYear1}
              onChange={(v) => update('shortTermYear1', v)}
            />
            <CurrencyInput
              label="Long-Term Gain/Loss"
              value={params.longTermYear1}
              onChange={(v) => update('longTermYear1', v)}
            />
          </YearGroup>
          <YearGroup year={2} label="Year 2 (Prior)">
            <CurrencyInput
              label="Short-Term Gain/Loss"
              value={params.shortTermYear2}
              onChange={(v) => update('shortTermYear2', v)}
            />
            <CurrencyInput
              label="Long-Term Gain/Loss"
              value={params.longTermYear2}
              onChange={(v) => update('longTermYear2', v)}
            />
          </YearGroup>
        </div>
      </FieldGroup>
    </IncomeCalcShell>
  );
}
