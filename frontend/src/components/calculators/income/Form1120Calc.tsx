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
import { YearGroup } from '@/components/calculators/FieldGroup';
import { formatCurrency } from '@/utils/formatters';
import {
  calculateForm1120,
  type Form1120Params,
  type Form1120Result,
} from '@/utils/calculations/income';

interface Form1120Year {
  capitalGain: number;
  netGainLoss: number;
  otherIncome: number;
  depreciation: number;
  depletion: number;
  domesticProduction: number;
  amortization: number;
  nolDeduction: number;
  taxableIncome: number;
  totalTax: number;
  mortgagesPayable: number;
  mealsEntertainment: number;
  dividendsPaid: number;
}

const EMPTY_YEAR: Form1120Year = {
  capitalGain: 0,
  netGainLoss: 0,
  otherIncome: 0,
  depreciation: 0,
  depletion: 0,
  domesticProduction: 0,
  amortization: 0,
  nolDeduction: 0,
  taxableIncome: 0,
  totalTax: 0,
  mortgagesPayable: 0,
  mealsEntertainment: 0,
  dividendsPaid: 0,
};

const YEAR_FIELDS: { key: keyof Form1120Year; label: string }[] = [
  { key: 'capitalGain', label: 'Capital Gain' },
  { key: 'netGainLoss', label: 'Net Gain/Loss' },
  { key: 'otherIncome', label: 'Other Income' },
  { key: 'depreciation', label: 'Depreciation' },
  { key: 'depletion', label: 'Depletion' },
  { key: 'domesticProduction', label: 'Domestic Production' },
  { key: 'amortization', label: 'Amortization' },
  { key: 'nolDeduction', label: 'NOL Deduction' },
  { key: 'taxableIncome', label: 'Taxable Income' },
  { key: 'totalTax', label: 'Total Tax' },
  { key: 'mortgagesPayable', label: 'Mortgages Payable' },
  { key: 'mealsEntertainment', label: 'Meals & Entertainment' },
  { key: 'dividendsPaid', label: 'Dividends Paid' },
];

export default function Form1120Calc() {
  const [year1, setYear1] = useState<Form1120Year>({ ...EMPTY_YEAR });
  const [year2, setYear2] = useState<Form1120Year>({ ...EMPTY_YEAR });
  const [ownershipPercent, setOwnershipPercent] = useState(100);
  const [result, setResult] = useState<Form1120Result | null>(null);

  const updateYear = (
    setter: React.Dispatch<React.SetStateAction<Form1120Year>>,
    field: keyof Form1120Year,
    value: number
  ) => {
    setter((prev) => ({ ...prev, [field]: value }));
  };

  const calculate = useCallback(() => {
    const params: Form1120Params = { year1, year2, ownershipPercent };
    setResult(calculateForm1120(params));
  }, [year1, year2, ownershipPercent]);

  const reset = useCallback(() => {
    setYear1({ ...EMPTY_YEAR });
    setYear2({ ...EMPTY_YEAR });
    setOwnershipPercent(100);
    setResult(null);
  }, []);

  const methodLabel = result?.policy.method === 'average' ? '2-Year Average' : 'Most Recent Year';

  return (
    <IncomeCalcShell
      title="Form 1120 C-Corporation Income"
      description="Calculate qualifying C-Corporation income with Fannie Mae averaging"
      onCalculate={calculate}
      onReset={reset}
      isCalculated={!!result}
      monthlyIncome={result?.monthly}
      method={result ? methodLabel : undefined}
      results={
        result ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ResultCard label="Year 1 Total" value={formatCurrency(result.total1)} />
              <ResultCard label="Year 2 Total" value={formatCurrency(result.total2)} />
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
                    { label: 'Year 1 Subtotal', value: formatCurrency(result.subtotal1) },
                    { label: 'Year 2 Subtotal', value: formatCurrency(result.subtotal2) },
                    { label: 'Year 1 Total (after tax, ownership, dividends)', value: formatCurrency(result.total1) },
                    { label: 'Year 2 Total (after tax, ownership, dividends)', value: formatCurrency(result.total2) },
                    { label: `Ownership: ${result.ownershipPercent}%`, value: '' },
                    { label: 'Monthly Income', value: formatCurrency(result.monthly), highlight: true },
                  ]}
                />
              </div>
            </ResultSection>

            <ShowCalculations
              steps={[
                { label: 'Year 1 Subtotal', formula: 'CapGain + NetGain + OtherInc + Depr + Depl + DomProd + Amort + NOL + TaxableInc', value: formatCurrency(result.subtotal1) },
                { label: 'Year 1 Total', formula: `(Subtotal - Tax - Mortgages - Meals) x ${result.ownershipPercent}% - Dividends`, value: formatCurrency(result.total1) },
                { label: 'Year 2 Subtotal', value: formatCurrency(result.subtotal2) },
                { label: 'Year 2 Total', value: formatCurrency(result.total2) },
                { label: 'Method', value: methodLabel },
                { label: 'Monthly Income', value: formatCurrency(result.monthly) },
              ]}
            />
          </>
        ) : undefined
      }
    >
      <FieldGroup title="Ownership">
        <FieldRow columns={1}>
          <PercentInput
            label="Ownership Percentage"
            value={ownershipPercent}
            onChange={setOwnershipPercent}
            step={1}
          />
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Corporation Income">
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
