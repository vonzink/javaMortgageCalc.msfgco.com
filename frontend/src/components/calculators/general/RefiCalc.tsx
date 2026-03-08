import { useState, useCallback } from 'react';
import CalculatorShell from '@/components/calculators/CalculatorShell';
import ResultCard from '@/components/calculators/ResultCard';
import ResultSection, { ResultTable } from '@/components/calculators/ResultSection';
import ShowCalculations from '@/components/calculators/ShowCalculations';
import CurrencyInput from '@/components/calculators/CurrencyInput';
import PercentInput from '@/components/calculators/PercentInput';
import FieldRow from '@/components/calculators/FieldRow';
import FieldGroup from '@/components/calculators/FieldGroup';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import {
  calculateRefi,
  type RefiParams,
  type RefiResult,
} from '@/utils/calculations/refi';

const TERM_OPTIONS = [10, 15, 20, 25, 30];

interface FormState {
  currentBalance: number;
  currentRatePercent: number;
  currentTermRemaining: number;
  newRatePercent: number;
  newTermYears: number;
  closingCosts: number;
  cashOut: number;
  rollInCosts: boolean;
}

const DEFAULTS: FormState = {
  currentBalance: 280000,
  currentRatePercent: 7.0,
  currentTermRemaining: 27,
  newRatePercent: 6.0,
  newTermYears: 30,
  closingCosts: 5000,
  cashOut: 0,
  rollInCosts: false,
};

export default function RefiCalc() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<RefiResult | null>(null);

  const calculate = useCallback(() => {
    const params: RefiParams = {
      currentBalance: form.currentBalance,
      currentRate: form.currentRatePercent / 100,
      currentTermRemaining: form.currentTermRemaining,
      newRate: form.newRatePercent / 100,
      newTermYears: form.newTermYears,
      closingCosts: form.closingCosts,
      cashOut: form.cashOut,
      rollInCosts: form.rollInCosts,
    };
    setResult(calculateRefi(params));
  }, [form]);

  const reset = useCallback(() => {
    setForm(DEFAULTS);
    setResult(null);
  }, []);

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <CalculatorShell
      title="Refinance Analysis"
      description="Analyze your refinance savings, breakeven point, and lifetime benefits"
      onCalculate={calculate}
      onReset={reset}
      isCalculated={!!result}
      results={
        result ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <ResultCard
                label="Current Payment"
                value={formatCurrency(result.currentPayment)}
              />
              <ResultCard
                label="New Payment"
                value={formatCurrency(result.newPayment)}
                variant="primary"
              />
              <ResultCard
                label="Monthly Savings"
                value={formatCurrency(result.monthlySavings)}
                variant={result.monthlySavings > 0 ? 'success' : 'danger'}
              />
              <ResultCard
                label="Break-Even"
                value={result.breakEvenMonths > 0 ? `${result.breakEvenMonths} mo` : 'N/A'}
                subValue={result.breakEvenMonths > 0 ? `${(result.breakEvenMonths / 12).toFixed(1)} years` : ''}
              />
              <ResultCard
                label="Interest Savings"
                value={formatCurrency(result.interestSavings)}
                variant={result.interestSavings > 0 ? 'success' : 'warning'}
              />
              <ResultCard
                label="Lifetime Savings"
                value={formatCurrency(result.lifetimeSavings)}
                variant={result.lifetimeSavings > 0 ? 'success' : 'danger'}
              />
            </div>

            {/* Comparison Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResultSection title="Current Loan">
                <ResultTable
                  rows={[
                    { label: 'Balance', value: formatCurrency(form.currentBalance) },
                    { label: 'Rate', value: formatPercent(form.currentRatePercent) },
                    { label: 'Remaining Term', value: `${form.currentTermRemaining} years` },
                    { label: 'Monthly Payment', value: formatCurrency(result.currentPayment), highlight: true },
                    { label: 'Total Remaining Interest', value: formatCurrency(result.totalCurrentInterest) },
                  ]}
                />
              </ResultSection>

              <ResultSection title="New Loan">
                <ResultTable
                  rows={[
                    { label: 'New Loan Amount', value: formatCurrency(result.newLoanAmount) },
                    { label: 'Rate', value: formatPercent(form.newRatePercent) },
                    { label: 'Term', value: `${form.newTermYears} years` },
                    { label: 'Monthly Payment', value: formatCurrency(result.newPayment), highlight: true },
                    { label: 'Total Interest', value: formatCurrency(result.totalNewInterest) },
                    { label: 'Closing Costs', value: formatCurrency(form.closingCosts) },
                    ...(form.cashOut > 0 ? [{ label: 'Cash Out', value: formatCurrency(form.cashOut) }] : []),
                    ...(form.rollInCosts ? [{ label: 'Costs Rolled In', value: 'Yes' }] : []),
                  ]}
                />
              </ResultSection>
            </div>

            {/* Calculations */}
            <ShowCalculations
              title="Show Calculations"
              steps={[
                {
                  label: 'Current Payment',
                  formula: 'P * r / (1 - (1+r)^-n)',
                  value: formatCurrency(result.currentPayment),
                },
                {
                  label: 'New Loan Amount',
                  formula: `Balance${form.cashOut > 0 ? ' + Cash Out' : ''}${form.rollInCosts ? ' + Closing Costs' : ''}`,
                  value: formatCurrency(result.newLoanAmount),
                },
                {
                  label: 'New Payment',
                  formula: 'P * r / (1 - (1+r)^-n)',
                  value: formatCurrency(result.newPayment),
                },
                {
                  label: 'Monthly Savings',
                  formula: 'Current Payment - New Payment',
                  value: formatCurrency(result.monthlySavings),
                },
                {
                  label: 'Break-Even Months',
                  formula: 'Closing Costs / Monthly Savings',
                  value: result.breakEvenMonths > 0 ? `${result.breakEvenMonths} months` : 'N/A',
                },
                {
                  label: 'Interest Savings',
                  formula: 'Current Total Interest - New Total Interest',
                  value: formatCurrency(result.interestSavings),
                },
                {
                  label: 'Lifetime Savings',
                  formula: 'Interest Savings - Upfront Closing Costs',
                  value: formatCurrency(result.lifetimeSavings),
                },
              ]}
            />
          </>
        ) : undefined
      }
    >
      {/* Current Loan */}
      <FieldGroup title="Current Loan">
        <FieldRow columns={3}>
          <CurrencyInput
            label="Current Balance"
            value={form.currentBalance}
            onChange={(v) => update('currentBalance', v)}
          />
          <PercentInput
            label="Current Rate"
            value={form.currentRatePercent}
            onChange={(v) => update('currentRatePercent', v)}
          />
          <div>
            <label className="label">Years Remaining</label>
            <input
              type="number"
              className="input-field"
              value={form.currentTermRemaining}
              onChange={(e) => update('currentTermRemaining', Number(e.target.value))}
              min={1}
              max={30}
            />
          </div>
        </FieldRow>
      </FieldGroup>

      {/* New Loan */}
      <FieldGroup title="New Loan">
        <FieldRow columns={3}>
          <PercentInput
            label="New Rate"
            value={form.newRatePercent}
            onChange={(v) => update('newRatePercent', v)}
          />
          <div>
            <label className="label">New Term (Years)</label>
            <select
              className="input-field"
              value={form.newTermYears}
              onChange={(e) => update('newTermYears', Number(e.target.value))}
            >
              {TERM_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t} years
                </option>
              ))}
            </select>
          </div>
          <CurrencyInput
            label="Closing Costs"
            value={form.closingCosts}
            onChange={(v) => update('closingCosts', v)}
          />
        </FieldRow>
        <FieldRow columns={2}>
          <CurrencyInput
            label="Cash Out"
            value={form.cashOut}
            onChange={(v) => update('cashOut', v)}
            hint="Additional cash you want to take out"
          />
          <div>
            <label className="label">Roll Closing Costs Into Loan?</label>
            <div className="flex items-center gap-3 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.rollInCosts}
                  onChange={(e) => update('rollInCosts', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm text-gray-700">
                  Yes, add closing costs to new loan balance
                </span>
              </label>
            </div>
          </div>
        </FieldRow>
      </FieldGroup>
    </CalculatorShell>
  );
}
