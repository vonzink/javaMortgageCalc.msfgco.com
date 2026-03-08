import { useState, useCallback } from 'react';
import IncomeCalcShell, { MethodBadge } from '@/components/calculators/income/IncomeCalcShell';
import ResultCard from '@/components/calculators/ResultCard';
import ResultSection from '@/components/calculators/ResultSection';
import { ResultTable } from '@/components/calculators/ResultSection';
import ShowCalculations from '@/components/calculators/ShowCalculations';
import CurrencyInput from '@/components/calculators/CurrencyInput';
import FieldRow from '@/components/calculators/FieldRow';
import FieldGroup from '@/components/calculators/FieldGroup';
import { YearGroup, EntityGroup } from '@/components/calculators/FieldGroup';
import { formatCurrency } from '@/utils/formatters';
import {
  calculateScheduleC,
  type ScheduleCParams,
  type ScheduleCResult,
  type ScheduleCBusinessResult,
} from '@/utils/calculations/income';

interface ScheduleCBusinessYear {
  netProfit: number;
  otherIncome: number;
  depletion: number;
  depreciation: number;
  businessUseOfHome: number;
  mileageDepreciation: number;
  amortization: number;
  mealsEntertainment: number;
}

const EMPTY_YEAR: ScheduleCBusinessYear = {
  netProfit: 0,
  otherIncome: 0,
  depletion: 0,
  depreciation: 0,
  businessUseOfHome: 0,
  mileageDepreciation: 0,
  amortization: 0,
  mealsEntertainment: 0,
};

interface BusinessState {
  year1: ScheduleCBusinessYear;
  year2: ScheduleCBusinessYear;
}

const EMPTY_BUSINESS: BusinessState = {
  year1: { ...EMPTY_YEAR },
  year2: { ...EMPTY_YEAR },
};

const YEAR_FIELDS: { key: keyof ScheduleCBusinessYear; label: string }[] = [
  { key: 'netProfit', label: 'Net Profit' },
  { key: 'otherIncome', label: 'Other Income' },
  { key: 'depletion', label: 'Depletion' },
  { key: 'depreciation', label: 'Depreciation' },
  { key: 'businessUseOfHome', label: 'Business Use of Home' },
  { key: 'mileageDepreciation', label: 'Mileage Depreciation' },
  { key: 'amortization', label: 'Amortization' },
  { key: 'mealsEntertainment', label: 'Meals & Entertainment' },
];

function BusinessResultSection({ label, data }: { label: string; data: ScheduleCBusinessResult }) {
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
          { label: 'Monthly Income', value: formatCurrency(data.monthly), highlight: true },
        ]}
      />
    </div>
  );
}

export default function ScheduleCCalc() {
  const [biz1, setBiz1] = useState<BusinessState>({ year1: { ...EMPTY_YEAR }, year2: { ...EMPTY_YEAR } });
  const [biz2, setBiz2] = useState<BusinessState>({ year1: { ...EMPTY_YEAR }, year2: { ...EMPTY_YEAR } });
  const [result, setResult] = useState<ScheduleCResult | null>(null);

  const updateYear = (
    setter: React.Dispatch<React.SetStateAction<BusinessState>>,
    yearKey: 'year1' | 'year2',
    field: keyof ScheduleCBusinessYear,
    value: number
  ) => {
    setter((prev) => ({
      ...prev,
      [yearKey]: { ...prev[yearKey], [field]: value },
    }));
  };

  const calculate = useCallback(() => {
    const params: ScheduleCParams = {
      business1: biz1,
      business2: biz2,
    };
    setResult(calculateScheduleC(params));
  }, [biz1, biz2]);

  const reset = useCallback(() => {
    setBiz1({ year1: { ...EMPTY_YEAR }, year2: { ...EMPTY_YEAR } });
    setBiz2({ year1: { ...EMPTY_YEAR }, year2: { ...EMPTY_YEAR } });
    setResult(null);
  }, []);

  const renderBusinessInputs = (
    label: string,
    state: BusinessState,
    setter: React.Dispatch<React.SetStateAction<BusinessState>>,
    index: number
  ) => (
    <EntityGroup index={index} label={label}>
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
      title="Schedule C Sole Proprietorship Income"
      description="Calculate qualifying sole proprietorship income with Fannie Mae averaging (2 businesses)"
      onCalculate={calculate}
      onReset={reset}
      isCalculated={!!result}
      monthlyIncome={result?.combinedMonthly}
      method={result ? (result.business1.policy.method === 'average' ? '2-Year Average' : 'Most Recent Year') : undefined}
      results={
        result ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ResultCard label="Business 1" value={formatCurrency(result.business1.monthly)} subValue="/month" variant="primary" />
              <ResultCard label="Business 2" value={formatCurrency(result.business2.monthly)} subValue="/month" variant="primary" />
              <ResultCard label="Combined Monthly" value={formatCurrency(result.combinedMonthly)} subValue="/month" variant="success" />
            </div>

            <ResultSection title="Business Breakdown">
              <div className="space-y-6 divide-y divide-gray-100">
                <BusinessResultSection label="Business 1" data={result.business1} />
                <div className="pt-4">
                  <BusinessResultSection label="Business 2" data={result.business2} />
                </div>
              </div>
            </ResultSection>

            <ShowCalculations
              steps={[
                { label: 'Biz 1 Year 1', formula: 'NetProfit + OtherInc + Depl + Depr + HomeUse + Mileage + Amort - Meals', value: formatCurrency(result.business1.year1Total) },
                { label: 'Biz 1 Year 2', value: formatCurrency(result.business1.year2Total) },
                { label: 'Biz 1 Monthly', value: formatCurrency(result.business1.monthly) },
                { label: 'Biz 2 Year 1', value: formatCurrency(result.business2.year1Total) },
                { label: 'Biz 2 Year 2', value: formatCurrency(result.business2.year2Total) },
                { label: 'Biz 2 Monthly', value: formatCurrency(result.business2.monthly) },
                { label: 'Combined Monthly', value: formatCurrency(result.combinedMonthly) },
              ]}
            />
          </>
        ) : undefined
      }
    >
      {renderBusinessInputs('Business 1', biz1, setBiz1, 0)}
      {renderBusinessInputs('Business 2', biz2, setBiz2, 1)}
    </IncomeCalcShell>
  );
}
