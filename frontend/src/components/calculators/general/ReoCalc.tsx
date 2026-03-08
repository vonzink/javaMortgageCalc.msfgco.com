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
  calculateREO,
  type REOParams,
  type REOResult,
} from '@/utils/calculations/reo';

const TERM_OPTIONS = [15, 20, 25, 30];

interface FormState {
  purchasePrice: number;
  repairCosts: number;
  afterRepairValue: number;
  downPaymentPercent: number;
  mortgageRatePercent: number;
  termYears: number;
  monthlyRent: number;
  vacancyRatePercent: number;
  propertyTaxRatePercent: number;
  insurance: number;
  maintenance: number;
  managementFeePercent: number;
  otherExpenses: number;
}

const DEFAULTS: FormState = {
  purchasePrice: 200000,
  repairCosts: 25000,
  afterRepairValue: 275000,
  downPaymentPercent: 25,
  mortgageRatePercent: 7.0,
  termYears: 30,
  monthlyRent: 1800,
  vacancyRatePercent: 5,
  propertyTaxRatePercent: 1.2,
  insurance: 1500,
  maintenance: 2000,
  managementFeePercent: 8,
  otherExpenses: 500,
};

export default function ReoCalc() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<REOResult | null>(null);

  const calculate = useCallback(() => {
    const params: REOParams = {
      purchasePrice: form.purchasePrice,
      repairCosts: form.repairCosts,
      afterRepairValue: form.afterRepairValue,
      downPaymentPercent: form.downPaymentPercent,
      mortgageRate: form.mortgageRatePercent / 100,
      termYears: form.termYears,
      monthlyRent: form.monthlyRent,
      vacancyRate: form.vacancyRatePercent / 100,
      propertyTaxRate: form.propertyTaxRatePercent / 100,
      insurance: form.insurance,
      maintenance: form.maintenance,
      managementFee: form.managementFeePercent / 100,
      otherExpenses: form.otherExpenses,
    };
    setResult(calculateREO(params));
  }, [form]);

  const reset = useCallback(() => {
    setForm(DEFAULTS);
    setResult(null);
  }, []);

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const dscrVariant = (dscr: number) => {
    if (dscr >= 1.25) return 'success' as const;
    if (dscr >= 1.0) return 'warning' as const;
    return 'danger' as const;
  };

  return (
    <CalculatorShell
      title="REO Investment Calculator"
      description="Analyze real estate owned investment returns: cap rate, cash-on-cash, ROI, and DSCR"
      onCalculate={calculate}
      onReset={reset}
      isCalculated={!!result}
      results={
        result ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              <ResultCard
                label="Cap Rate"
                value={`${result.capRate.toFixed(2)}%`}
                variant={result.capRate >= 8 ? 'success' : result.capRate >= 5 ? 'primary' : 'warning'}
              />
              <ResultCard
                label="Cash-on-Cash"
                value={`${result.cashOnCash.toFixed(2)}%`}
                variant={result.cashOnCash >= 10 ? 'success' : result.cashOnCash >= 5 ? 'primary' : 'warning'}
              />
              <ResultCard
                label="ROI"
                value={`${result.roi.toFixed(2)}%`}
                variant={result.roi > 0 ? 'success' : 'danger'}
              />
              <ResultCard
                label="DSCR"
                value={result.dscr.toFixed(2)}
                variant={dscrVariant(result.dscr)}
                subValue={result.dscr >= 1.25 ? 'Strong' : result.dscr >= 1.0 ? 'Adequate' : 'Below 1.0'}
              />
              <ResultCard
                label="NOI"
                value={formatCurrency(result.netOperatingIncome)}
                subValue="Annual"
              />
              <ResultCard
                label="Cash Flow"
                value={formatCurrency(result.cashFlow)}
                variant={result.cashFlow > 0 ? 'success' : 'danger'}
                subValue="Annual"
              />
              <ResultCard
                label="Monthly Payment"
                value={formatCurrency(result.monthlyPayment)}
              />
            </div>

            {/* Income Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResultSection title="Income Analysis">
                <ResultTable
                  rows={[
                    { label: 'Gross Annual Income', value: formatCurrency(result.grossAnnualIncome) },
                    { label: `Vacancy (${form.vacancyRatePercent}%)`, value: `-${formatCurrency(result.grossAnnualIncome - result.effectiveGrossIncome)}` },
                    { label: 'Effective Gross Income', value: formatCurrency(result.effectiveGrossIncome), highlight: true },
                    { label: 'Total Expenses', value: `-${formatCurrency(result.totalExpenses)}` },
                    { label: 'Net Operating Income', value: formatCurrency(result.netOperatingIncome), highlight: true },
                    { label: 'Annual Debt Service', value: `-${formatCurrency(result.annualDebtService)}` },
                    { label: 'Annual Cash Flow', value: formatCurrency(result.cashFlow), highlight: true },
                  ]}
                />
              </ResultSection>

              <ResultSection title="Investment Summary">
                <ResultTable
                  rows={[
                    { label: 'Purchase Price', value: formatCurrency(form.purchasePrice) },
                    { label: 'Repair Costs', value: formatCurrency(form.repairCosts) },
                    { label: 'After Repair Value (ARV)', value: formatCurrency(form.afterRepairValue) },
                    { label: 'Down Payment', value: formatCurrency(result.downPayment) },
                    { label: 'Total Investment', value: formatCurrency(result.totalInvestment), highlight: true },
                    { label: 'Loan Amount', value: formatCurrency(result.loanAmount) },
                    { label: 'Monthly Mortgage', value: formatCurrency(result.monthlyPayment) },
                    { label: 'Monthly Cash Flow', value: formatCurrency(result.cashFlow / 12), highlight: true },
                  ]}
                />
              </ResultSection>
            </div>

            {/* Calculations */}
            <ShowCalculations
              title="Show Calculations"
              steps={[
                { label: 'Gross Annual Income', formula: `${formatCurrency(form.monthlyRent)} x 12`, value: formatCurrency(result.grossAnnualIncome) },
                { label: 'Effective Gross Income', formula: `GAI x (1 - ${form.vacancyRatePercent}%)`, value: formatCurrency(result.effectiveGrossIncome) },
                { label: 'Net Operating Income', formula: 'EGI - Total Expenses', value: formatCurrency(result.netOperatingIncome) },
                { label: 'Cap Rate', formula: 'NOI / Purchase Price x 100', value: `${result.capRate.toFixed(2)}%` },
                { label: 'Cash-on-Cash Return', formula: 'Cash Flow / Total Investment x 100', value: `${result.cashOnCash.toFixed(2)}%` },
                { label: 'DSCR', formula: 'NOI / Annual Debt Service', value: result.dscr.toFixed(2) },
              ]}
            />
          </>
        ) : undefined
      }
    >
      {/* Property Details */}
      <FieldGroup title="Property Details">
        <FieldRow columns={3}>
          <CurrencyInput
            label="Purchase Price"
            value={form.purchasePrice}
            onChange={(v) => update('purchasePrice', v)}
          />
          <CurrencyInput
            label="Repair Costs"
            value={form.repairCosts}
            onChange={(v) => update('repairCosts', v)}
          />
          <CurrencyInput
            label="After Repair Value (ARV)"
            value={form.afterRepairValue}
            onChange={(v) => update('afterRepairValue', v)}
          />
        </FieldRow>
      </FieldGroup>

      {/* Financing */}
      <FieldGroup title="Financing">
        <FieldRow columns={3}>
          <PercentInput
            label="Down Payment %"
            value={form.downPaymentPercent}
            onChange={(v) => update('downPaymentPercent', v)}
            step={5}
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
      </FieldGroup>

      {/* Income */}
      <FieldGroup title="Rental Income">
        <FieldRow columns={2}>
          <CurrencyInput
            label="Monthly Rent"
            value={form.monthlyRent}
            onChange={(v) => update('monthlyRent', v)}
          />
          <PercentInput
            label="Vacancy Rate"
            value={form.vacancyRatePercent}
            onChange={(v) => update('vacancyRatePercent', v)}
            step={1}
          />
        </FieldRow>
      </FieldGroup>

      {/* Expenses */}
      <FieldGroup title="Annual Expenses">
        <FieldRow columns={3}>
          <PercentInput
            label="Property Tax Rate"
            value={form.propertyTaxRatePercent}
            onChange={(v) => update('propertyTaxRatePercent', v)}
            step={0.1}
          />
          <CurrencyInput
            label="Annual Insurance"
            value={form.insurance}
            onChange={(v) => update('insurance', v)}
          />
          <CurrencyInput
            label="Annual Maintenance"
            value={form.maintenance}
            onChange={(v) => update('maintenance', v)}
          />
        </FieldRow>
        <FieldRow columns={2}>
          <PercentInput
            label="Management Fee %"
            value={form.managementFeePercent}
            onChange={(v) => update('managementFeePercent', v)}
            step={1}
            hint="Percentage of effective gross income"
          />
          <CurrencyInput
            label="Other Annual Expenses"
            value={form.otherExpenses}
            onChange={(v) => update('otherExpenses', v)}
          />
        </FieldRow>
      </FieldGroup>
    </CalculatorShell>
  );
}
