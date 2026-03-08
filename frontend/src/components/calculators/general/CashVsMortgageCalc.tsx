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
  calculateCashVsMortgage,
  type CashVsMortgageParams,
  type CashVsMortgageResult,
} from '@/utils/calculations/cashVsMortgage';

const TERM_OPTIONS = [15, 20, 25, 30];

interface FormState {
  homePrice: number;
  mortgageRatePercent: number;
  termYears: number;
  downPaymentPercent: number;
  investmentReturnPercent: number;
  marginalTaxRatePercent: number;
  propertyTaxRatePercent: number;
  homeInsurance: number;
  closingCosts: number;
}

const DEFAULTS: FormState = {
  homePrice: 400000,
  mortgageRatePercent: 6.5,
  termYears: 30,
  downPaymentPercent: 20,
  investmentReturnPercent: 7.0,
  marginalTaxRatePercent: 24,
  propertyTaxRatePercent: 1.2,
  homeInsurance: 1500,
  closingCosts: 8000,
};

export default function CashVsMortgageCalc() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<CashVsMortgageResult | null>(null);

  const calculate = useCallback(() => {
    const params: CashVsMortgageParams = {
      homePrice: form.homePrice,
      mortgageRate: form.mortgageRatePercent / 100,
      termYears: form.termYears,
      downPaymentPercent: form.downPaymentPercent,
      investmentReturn: form.investmentReturnPercent / 100,
      marginalTaxRate: form.marginalTaxRatePercent / 100,
      propertyTaxRate: form.propertyTaxRatePercent / 100,
      homeInsurance: form.homeInsurance,
      closingCosts: form.closingCosts,
    };
    setResult(calculateCashVsMortgage(params));
  }, [form]);

  const reset = useCallback(() => {
    setForm(DEFAULTS);
    setResult(null);
  }, []);

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const advantageLabel = result?.advantage === 'cash'
    ? 'Cash Purchase Wins'
    : result?.advantage === 'mortgage'
      ? 'Mortgage Wins'
      : 'Equal';

  const advantageVariant = result?.advantage === 'cash'
    ? 'success' as const
    : result?.advantage === 'mortgage'
      ? 'primary' as const
      : 'default' as const;

  return (
    <CalculatorShell
      title="Cash vs Mortgage Calculator"
      description="Compare paying cash for a home versus financing with a mortgage"
      onCalculate={calculate}
      onReset={reset}
      isCalculated={!!result}
      results={
        result ? (
          <>
            {/* Advantage Indicator */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ResultCard
                label="Recommendation"
                value={advantageLabel}
                variant={advantageVariant}
                subValue={`Saves ${formatCurrency(result.savings)} over ${form.termYears} years`}
              />
              <ResultCard
                label="Cash Net Cost"
                value={formatCurrency(result.cashScenario.netCost)}
                variant={result.advantage === 'cash' ? 'success' : 'default'}
              />
              <ResultCard
                label="Mortgage Net Cost"
                value={formatCurrency(result.mortgageScenario.netCost)}
                variant={result.advantage === 'mortgage' ? 'primary' : 'default'}
              />
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cash Scenario */}
              <ResultSection title="Cash Purchase">
                <ResultTable
                  rows={[
                    { label: 'Home Price', value: formatCurrency(form.homePrice) },
                    { label: 'Total Cash Outlay', value: formatCurrency(result.cashScenario.totalCost) },
                    { label: 'Opportunity Cost (Lost Returns)', value: formatCurrency(result.cashScenario.opportunityCost) },
                    { label: 'Net Cost', value: formatCurrency(result.cashScenario.netCost), highlight: true },
                  ]}
                />
              </ResultSection>

              {/* Mortgage Scenario */}
              <ResultSection title="Mortgage Financing">
                <ResultTable
                  rows={[
                    { label: 'Down Payment', value: formatCurrency(result.mortgageScenario.downPayment) },
                    { label: 'Monthly Payment', value: formatCurrency(result.mortgageScenario.monthlyPayment) },
                    { label: 'Total Interest Paid', value: formatCurrency(result.mortgageScenario.totalInterest) },
                    { label: 'Closing Costs', value: formatCurrency(result.mortgageScenario.closingCosts) },
                    { label: 'Tax Savings (Interest Deduction)', value: `-${formatCurrency(result.mortgageScenario.taxSavings)}` },
                    { label: 'Investment Growth', value: `-${formatCurrency(result.mortgageScenario.investmentGrowth)}` },
                    { label: 'Net Cost', value: formatCurrency(result.mortgageScenario.netCost), highlight: true },
                  ]}
                />
              </ResultSection>
            </div>

            {/* Calculations */}
            <ShowCalculations
              title="Show Calculations"
              steps={[
                {
                  label: 'Cash: Opportunity Cost',
                  formula: `${formatCurrency(form.homePrice)} x (1 + ${form.investmentReturnPercent}%)^${form.termYears} - ${formatCurrency(form.homePrice)}`,
                  value: formatCurrency(result.cashScenario.opportunityCost),
                },
                {
                  label: 'Down Payment',
                  formula: `${formatCurrency(form.homePrice)} x ${form.downPaymentPercent}%`,
                  value: formatCurrency(result.mortgageScenario.downPayment),
                },
                {
                  label: 'Loan Amount',
                  value: formatCurrency(form.homePrice - result.mortgageScenario.downPayment),
                },
                {
                  label: 'Monthly Payment',
                  formula: 'P * r / (1 - (1+r)^-n)',
                  value: formatCurrency(result.mortgageScenario.monthlyPayment),
                },
                {
                  label: 'Total Interest',
                  formula: `(${formatCurrency(result.mortgageScenario.monthlyPayment)} x ${form.termYears * 12}) - Loan`,
                  value: formatCurrency(result.mortgageScenario.totalInterest),
                },
                {
                  label: 'Tax Savings',
                  formula: `Total Interest x ${form.marginalTaxRatePercent}%`,
                  value: formatCurrency(result.mortgageScenario.taxSavings),
                },
                {
                  label: 'Investable Amount',
                  formula: 'Home Price - Down Payment - Closing Costs',
                  value: formatCurrency(form.homePrice - result.mortgageScenario.downPayment - form.closingCosts),
                },
                {
                  label: 'Investment Growth',
                  value: formatCurrency(result.mortgageScenario.investmentGrowth),
                },
                {
                  label: 'Savings',
                  value: formatCurrency(result.savings),
                },
              ]}
            />
          </>
        ) : undefined
      }
    >
      <FieldGroup title="Home Purchase">
        <FieldRow columns={3}>
          <CurrencyInput
            label="Home Price"
            value={form.homePrice}
            onChange={(v) => update('homePrice', v)}
          />
          <PercentInput
            label="Mortgage Rate"
            value={form.mortgageRatePercent}
            onChange={(v) => update('mortgageRatePercent', v)}
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
        <FieldRow columns={3}>
          <PercentInput
            label="Down Payment %"
            value={form.downPaymentPercent}
            onChange={(v) => update('downPaymentPercent', v)}
            step={5}
          />
          <CurrencyInput
            label="Closing Costs"
            value={form.closingCosts}
            onChange={(v) => update('closingCosts', v)}
          />
          <CurrencyInput
            label="Annual Home Insurance"
            value={form.homeInsurance}
            onChange={(v) => update('homeInsurance', v)}
          />
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Assumptions">
        <FieldRow columns={3}>
          <PercentInput
            label="Investment Return"
            value={form.investmentReturnPercent}
            onChange={(v) => update('investmentReturnPercent', v)}
            step={0.5}
          />
          <PercentInput
            label="Marginal Tax Rate"
            value={form.marginalTaxRatePercent}
            onChange={(v) => update('marginalTaxRatePercent', v)}
            step={1}
          />
          <PercentInput
            label="Property Tax Rate"
            value={form.propertyTaxRatePercent}
            onChange={(v) => update('propertyTaxRatePercent', v)}
            step={0.1}
          />
        </FieldRow>
      </FieldGroup>
    </CalculatorShell>
  );
}
