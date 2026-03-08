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
import { calculateAPR, type APRParams, type APRResult } from '@/utils/calculations/apr';

const TERM_OPTIONS = [15, 20, 25, 30];

interface FormState {
  loanAmount: number;
  ratePercent: number;      // user-facing percent (e.g. 6.5)
  termYears: number;
  discountPointsPercent: number; // user-facing percent (e.g. 1.0)
  financedFees: number;
  prepaidFees: number;
}

const DEFAULTS: FormState = {
  loanAmount: 300000,
  ratePercent: 6.5,
  termYears: 30,
  discountPointsPercent: 0,
  financedFees: 0,
  prepaidFees: 0,
};

export default function AprCalc() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<APRResult | null>(null);

  const calculate = useCallback(() => {
    const params: APRParams = {
      loanAmount: form.loanAmount,
      rate: form.ratePercent / 100,
      termYears: form.termYears,
      discountPoints: form.discountPointsPercent / 100,
      financedFees: form.financedFees,
      prepaidFees: form.prepaidFees,
    };
    setResult(calculateAPR(params));
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
      title="APR Calculator"
      description="Calculate Annual Percentage Rate with fee breakdowns (Reg Z compliant)"
      onCalculate={calculate}
      onReset={reset}
      isCalculated={!!result}
      results={
        result ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <ResultCard
                label="APR"
                value={formatPercent(result.apr * 100)}
                variant="primary"
              />
              <ResultCard
                label="Monthly Payment"
                value={formatCurrency(result.monthlyPayment)}
              />
              <ResultCard
                label="Amount Financed"
                value={formatCurrency(result.amountFinanced)}
              />
              <ResultCard
                label="Finance Charges"
                value={formatCurrency(result.financeCharges)}
                variant="warning"
              />
              <ResultCard
                label="APR Spread"
                value={`${result.aprSpread.toFixed(3)}%`}
                subValue="Above note rate"
                variant={result.aprSpread > 0.5 ? 'danger' : 'default'}
              />
              <ResultCard
                label="Total Upfront Costs"
                value={formatCurrency(result.totalUpfrontCosts)}
              />
            </div>

            {/* Breakdown */}
            <ResultSection title="Rate Comparison">
              <ResultTable
                rows={[
                  { label: 'Note Rate', value: formatPercent(form.ratePercent) },
                  { label: 'APR', value: formatPercent(result.apr * 100), highlight: true },
                  { label: 'Spread', value: `${result.aprSpread.toFixed(3)}%` },
                ]}
              />
            </ResultSection>

            <ResultSection title="Cost Breakdown">
              <ResultTable
                rows={[
                  {
                    label: 'Discount Points',
                    value: formatCurrency(form.loanAmount * (form.discountPointsPercent / 100)),
                  },
                  { label: 'Financed Fees', value: formatCurrency(form.financedFees) },
                  { label: 'Prepaid Fees', value: formatCurrency(form.prepaidFees) },
                  { label: 'Total Upfront Costs', value: formatCurrency(result.totalUpfrontCosts), highlight: true },
                ]}
              />
            </ResultSection>

            {/* Calculations */}
            <ShowCalculations
              title="Show Calculations"
              steps={[
                {
                  label: 'Loan Amount',
                  value: formatCurrency(form.loanAmount),
                },
                {
                  label: 'Points Amount',
                  formula: `${formatCurrency(form.loanAmount)} x ${form.discountPointsPercent}%`,
                  value: formatCurrency(form.loanAmount * (form.discountPointsPercent / 100)),
                },
                {
                  label: 'Amount Financed',
                  formula: 'Loan - Points - Prepaid Fees',
                  value: formatCurrency(result.amountFinanced),
                },
                {
                  label: 'Principal (with financed fees)',
                  formula: `${formatCurrency(form.loanAmount)} + ${formatCurrency(form.financedFees)}`,
                  value: formatCurrency(form.loanAmount + form.financedFees),
                },
                {
                  label: 'Monthly Payment',
                  formula: 'P * r / (1 - (1+r)^-n)',
                  value: formatCurrency(result.monthlyPayment),
                },
                {
                  label: 'APR (solved iteratively)',
                  formula: 'PV(payments, APR) = Amount Financed',
                  value: formatPercent(result.apr * 100),
                },
              ]}
            />
          </>
        ) : undefined
      }
    >
      <FieldGroup title="Loan Details">
        <FieldRow columns={3}>
          <CurrencyInput
            label="Loan Amount"
            value={form.loanAmount}
            onChange={(v) => update('loanAmount', v)}
          />
          <PercentInput
            label="Interest Rate"
            value={form.ratePercent}
            onChange={(v) => update('ratePercent', v)}
          />
          <div>
            <label className="label">Term (Years)</label>
            <select
              className="input-field"
              value={form.termYears}
              onChange={(e) => update('termYears', Number(e.target.value))}
            >
              {TERM_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t} years
                </option>
              ))}
            </select>
          </div>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Fees & Points">
        <FieldRow columns={3}>
          <PercentInput
            label="Discount Points"
            value={form.discountPointsPercent}
            onChange={(v) => update('discountPointsPercent', v)}
            step={0.125}
          />
          <CurrencyInput
            label="Financed Fees"
            value={form.financedFees}
            onChange={(v) => update('financedFees', v)}
            hint="Fees added to loan balance"
          />
          <CurrencyInput
            label="Prepaid Fees"
            value={form.prepaidFees}
            onChange={(v) => update('prepaidFees', v)}
            hint="Fees paid upfront at closing"
          />
        </FieldRow>
      </FieldGroup>
    </CalculatorShell>
  );
}
