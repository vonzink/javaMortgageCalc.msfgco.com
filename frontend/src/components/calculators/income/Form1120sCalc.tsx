import { useState, useCallback } from 'react';
import IncomeCalcShell, { MethodBadge } from '@/components/calculators/income/IncomeCalcShell';
import ResultCard from '@/components/calculators/ResultCard';
import ResultSection from '@/components/calculators/ResultSection';
import { ResultTable } from '@/components/calculators/ResultSection';
import ShowCalculations from '@/components/calculators/ShowCalculations';
import CurrencyInput from '@/components/calculators/CurrencyInput';
import PercentInput from '@/components/calculators/PercentInput';
import FieldRow from '@/components/calculators/FieldRow';
import FieldGroup from '@/components/calculators/FieldGroup';
import { YearGroup, EntityGroup } from '@/components/calculators/FieldGroup';
import { formatCurrency } from '@/utils/formatters';
import {
  calculateForm1120S,
  type Form1120SParams,
  type Form1120SResult,
  type Form1120SCorpResult,
} from '@/utils/calculations/income';

interface Form1120SCorpYear {
  netGainLoss: number;
  otherIncome: number;
  depreciation: number;
  depletion: number;
  amortization: number;
  mortgagesPayable: number;
  mealsEntertainment: number;
}

const EMPTY_YEAR: Form1120SCorpYear = {
  netGainLoss: 0,
  otherIncome: 0,
  depreciation: 0,
  depletion: 0,
  amortization: 0,
  mortgagesPayable: 0,
  mealsEntertainment: 0,
};

interface CorpState {
  year1: Form1120SCorpYear;
  year2: Form1120SCorpYear;
  ownershipPercent: number;
}

const EMPTY_CORP: CorpState = {
  year1: { ...EMPTY_YEAR },
  year2: { ...EMPTY_YEAR },
  ownershipPercent: 100,
};

const YEAR_FIELDS: { key: keyof Form1120SCorpYear; label: string }[] = [
  { key: 'netGainLoss', label: 'Net Gain/Loss' },
  { key: 'otherIncome', label: 'Other Income' },
  { key: 'depreciation', label: 'Depreciation' },
  { key: 'depletion', label: 'Depletion' },
  { key: 'amortization', label: 'Amortization' },
  { key: 'mortgagesPayable', label: 'Mortgages Payable' },
  { key: 'mealsEntertainment', label: 'Meals & Entertainment' },
];

function CorpResultSection({ label, data }: { label: string; data: Form1120SCorpResult }) {
  const methodLabel = data.policy.method === 'average' ? '2-Year Average' : 'Most Recent Year';
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">{label}</h4>
        <MethodBadge method={methodLabel} />
      </div>
      <ResultTable
        rows={[
          { label: 'Year 1 Total', value: formatCurrency(data.year1Total) },
          { label: 'Year 2 Total', value: formatCurrency(data.year2Total) },
          { label: `Ownership: ${data.ownershipPercent}%`, value: '' },
          { label: 'Monthly Income', value: formatCurrency(data.monthly), highlight: true },
        ]}
      />
    </div>
  );
}

export default function Form1120sCalc() {
  const [corp1, setCorp1] = useState<CorpState>({ ...EMPTY_CORP, year1: { ...EMPTY_YEAR }, year2: { ...EMPTY_YEAR } });
  const [corp2, setCorp2] = useState<CorpState>({ ...EMPTY_CORP, year1: { ...EMPTY_YEAR }, year2: { ...EMPTY_YEAR } });
  const [result, setResult] = useState<Form1120SResult | null>(null);

  const updateYear = (
    setter: React.Dispatch<React.SetStateAction<CorpState>>,
    yearKey: 'year1' | 'year2',
    field: keyof Form1120SCorpYear,
    value: number
  ) => {
    setter((prev) => ({
      ...prev,
      [yearKey]: { ...prev[yearKey], [field]: value },
    }));
  };

  const calculate = useCallback(() => {
    const params: Form1120SParams = { corp1, corp2 };
    setResult(calculateForm1120S(params));
  }, [corp1, corp2]);

  const reset = useCallback(() => {
    setCorp1({ ...EMPTY_CORP, year1: { ...EMPTY_YEAR }, year2: { ...EMPTY_YEAR } });
    setCorp2({ ...EMPTY_CORP, year1: { ...EMPTY_YEAR }, year2: { ...EMPTY_YEAR } });
    setResult(null);
  }, []);

  const renderCorpInputs = (
    label: string,
    state: CorpState,
    setter: React.Dispatch<React.SetStateAction<CorpState>>,
    index: number
  ) => (
    <EntityGroup index={index} label={label}>
      <PercentInput
        label="Ownership %"
        value={state.ownershipPercent}
        onChange={(v) => setter((prev) => ({ ...prev, ownershipPercent: v }))}
        step={1}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <YearGroup year={1} label="Year 1 (Most Recent)">
          {YEAR_FIELDS.map((f) => (
            <CurrencyInput
              key={f.key}
              label={f.label}
              value={state.year1[f.key]}
              onChange={(v) => updateYear(setter, 'year1', f.key, v)}
            />
          ))}
        </YearGroup>
        <YearGroup year={2} label="Year 2 (Prior)">
          {YEAR_FIELDS.map((f) => (
            <CurrencyInput
              key={f.key}
              label={f.label}
              value={state.year2[f.key]}
              onChange={(v) => updateYear(setter, 'year2', f.key, v)}
            />
          ))}
        </YearGroup>
      </div>
    </EntityGroup>
  );

  return (
    <IncomeCalcShell
      title="Form 1120S S-Corporation Income"
      description="Calculate qualifying S-Corporation income with Fannie Mae averaging"
      onCalculate={calculate}
      onReset={reset}
      isCalculated={!!result}
      monthlyIncome={result?.combinedMonthly}
      method={result ? (result.corp1.policy.method === 'average' ? '2-Year Average' : 'Most Recent Year') : undefined}
      results={
        result ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ResultCard label="S-Corp 1" value={formatCurrency(result.corp1.monthly)} subValue="/month" variant="primary" />
              <ResultCard label="S-Corp 2" value={formatCurrency(result.corp2.monthly)} subValue="/month" variant="primary" />
              <ResultCard label="Combined Monthly" value={formatCurrency(result.combinedMonthly)} subValue="/month" variant="success" />
            </div>
            <ResultSection title="S-Corp Breakdown">
              <div className="space-y-6 divide-y divide-gray-100">
                <CorpResultSection label="S-Corporation 1" data={result.corp1} />
                <div className="pt-4">
                  <CorpResultSection label="S-Corporation 2" data={result.corp2} />
                </div>
              </div>
            </ResultSection>
            <ShowCalculations
              steps={[
                { label: 'Corp 1 Year 1', formula: 'NetGain + OtherInc + Depr + Depl + Amort - Mortgages - Meals', value: formatCurrency(result.corp1.year1Total) },
                { label: 'Corp 1 Year 2', value: formatCurrency(result.corp1.year2Total) },
                { label: 'Corp 1 Monthly', value: formatCurrency(result.corp1.monthly) },
                { label: 'Corp 2 Monthly', value: formatCurrency(result.corp2.monthly) },
                { label: 'Combined Monthly', value: formatCurrency(result.combinedMonthly) },
              ]}
            />
          </>
        ) : undefined
      }
    >
      {renderCorpInputs('S-Corporation 1', corp1, setCorp1, 0)}
      {renderCorpInputs('S-Corporation 2', corp2, setCorp2, 1)}
    </IncomeCalcShell>
  );
}
