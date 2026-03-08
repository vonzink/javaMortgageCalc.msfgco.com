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
  calculateForm1065,
  type Form1065Params,
  type Form1065Result,
  type Form1065PartnershipResult,
} from '@/utils/calculations/income';

interface Form1065PartnershipYear {
  ordinaryIncome: number;
  netFarmProfit: number;
  netGainLoss: number;
  otherIncomeLoss: number;
  depreciation: number;
  depletion: number;
  amortization: number;
  mortgagesPayable: number;
  mealsEntertainment: number;
}

const EMPTY_YEAR: Form1065PartnershipYear = {
  ordinaryIncome: 0,
  netFarmProfit: 0,
  netGainLoss: 0,
  otherIncomeLoss: 0,
  depreciation: 0,
  depletion: 0,
  amortization: 0,
  mortgagesPayable: 0,
  mealsEntertainment: 0,
};

interface PartnershipState {
  year1: Form1065PartnershipYear;
  year2: Form1065PartnershipYear;
  ownershipPercent: number;
}

const EMPTY_PARTNERSHIP: PartnershipState = {
  year1: { ...EMPTY_YEAR },
  year2: { ...EMPTY_YEAR },
  ownershipPercent: 100,
};

const YEAR_FIELDS: { key: keyof Form1065PartnershipYear; label: string }[] = [
  { key: 'ordinaryIncome', label: 'Ordinary Income' },
  { key: 'netFarmProfit', label: 'Net Farm Profit' },
  { key: 'netGainLoss', label: 'Net Gain/Loss' },
  { key: 'otherIncomeLoss', label: 'Other Income/Loss' },
  { key: 'depreciation', label: 'Depreciation' },
  { key: 'depletion', label: 'Depletion' },
  { key: 'amortization', label: 'Amortization' },
  { key: 'mortgagesPayable', label: 'Mortgages Payable' },
  { key: 'mealsEntertainment', label: 'Meals & Entertainment' },
];

function PartnershipResult({ label, data }: { label: string; data: Form1065PartnershipResult }) {
  const methodLabel = data.policy.method === 'average' ? '2-Year Average' : 'Most Recent Year';
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">{label}</h4>
        <MethodBadge method={methodLabel} />
      </div>
      <ResultTable
        rows={[
          { label: 'Year 1 Subtotal', value: formatCurrency(data.subtotal1) },
          { label: 'Year 2 Subtotal', value: formatCurrency(data.subtotal2) },
          { label: 'Year 1 Total (after ownership)', value: formatCurrency(data.total1) },
          { label: 'Year 2 Total (after ownership)', value: formatCurrency(data.total2) },
          { label: `Ownership: ${data.ownershipPercent}%`, value: '' },
          { label: 'Monthly Income', value: formatCurrency(data.monthly), highlight: true },
        ]}
      />
    </div>
  );
}

export default function Form1065Calc() {
  const [p1, setP1] = useState<PartnershipState>({ ...EMPTY_PARTNERSHIP });
  const [p2, setP2] = useState<PartnershipState>({ ...EMPTY_PARTNERSHIP });
  const [result, setResult] = useState<Form1065Result | null>(null);

  const updateYear = (
    setter: React.Dispatch<React.SetStateAction<PartnershipState>>,
    yearKey: 'year1' | 'year2',
    field: keyof Form1065PartnershipYear,
    value: number
  ) => {
    setter((prev) => ({
      ...prev,
      [yearKey]: { ...prev[yearKey], [field]: value },
    }));
  };

  const calculate = useCallback(() => {
    const params: Form1065Params = {
      partnership1: p1,
      partnership2: p2,
    };
    setResult(calculateForm1065(params));
  }, [p1, p2]);

  const reset = useCallback(() => {
    setP1({ ...EMPTY_PARTNERSHIP, year1: { ...EMPTY_YEAR }, year2: { ...EMPTY_YEAR } });
    setP2({ ...EMPTY_PARTNERSHIP, year1: { ...EMPTY_YEAR }, year2: { ...EMPTY_YEAR } });
    setResult(null);
  }, []);

  const renderPartnershipInputs = (
    label: string,
    state: PartnershipState,
    setter: React.Dispatch<React.SetStateAction<PartnershipState>>,
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
      title="Form 1065 Partnership Income"
      description="Calculate qualifying partnership income with Fannie Mae averaging"
      onCalculate={calculate}
      onReset={reset}
      isCalculated={!!result}
      monthlyIncome={result?.combinedMonthly}
      method={result ? (result.partnership1.policy.method === 'average' ? '2-Year Average' : 'Most Recent Year') : undefined}
      results={
        result ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ResultCard label="Partnership 1" value={formatCurrency(result.partnership1.monthly)} subValue="/month" variant="primary" />
              <ResultCard label="Partnership 2" value={formatCurrency(result.partnership2.monthly)} subValue="/month" variant="primary" />
              <ResultCard label="Combined Monthly" value={formatCurrency(result.combinedMonthly)} subValue="/month" variant="success" />
            </div>
            <ResultSection title="Partnership Breakdown">
              <div className="space-y-6 divide-y divide-gray-100">
                <PartnershipResult label="Partnership 1" data={result.partnership1} />
                <div className="pt-4">
                  <PartnershipResult label="Partnership 2" data={result.partnership2} />
                </div>
              </div>
            </ResultSection>
            <ShowCalculations
              steps={[
                { label: 'P1 Year 1 Subtotal', value: formatCurrency(result.partnership1.subtotal1) },
                { label: 'P1 Year 1 Total', formula: `(Subtotal - Mortgages - Meals) x ${result.partnership1.ownershipPercent}%`, value: formatCurrency(result.partnership1.total1) },
                { label: 'P1 Monthly', value: formatCurrency(result.partnership1.monthly) },
                { label: 'P2 Monthly', value: formatCurrency(result.partnership2.monthly) },
                { label: 'Combined Monthly', value: formatCurrency(result.combinedMonthly) },
              ]}
            />
          </>
        ) : undefined
      }
    >
      {renderPartnershipInputs('Partnership 1', p1, setP1, 0)}
      {renderPartnershipInputs('Partnership 2', p2, setP2, 1)}
    </IncomeCalcShell>
  );
}
