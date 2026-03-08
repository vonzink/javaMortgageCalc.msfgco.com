import { useState, useCallback } from 'react';
import CalculatorShell from '@/components/calculators/CalculatorShell';
import ResultCard from '@/components/calculators/ResultCard';
import ResultSection, { ResultTable } from '@/components/calculators/ResultSection';
import CurrencyInput from '@/components/calculators/CurrencyInput';
import PercentInput from '@/components/calculators/PercentInput';
import FieldRow from '@/components/calculators/FieldRow';
import FieldGroup from '@/components/calculators/FieldGroup';
import ShowCalculations from '@/components/calculators/ShowCalculations';
import { formatCurrency } from '@/utils/formatters';
import { calculateEscrow, type EscrowParams, type EscrowResult } from '@/utils/calculations/escrow';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface FormState {
  closingDate: string;
  firstPaymentDate: string;
  annualTaxes: number;
  taxDueMonth1: number;
  taxDueMonth2: number;
  annualInsurance: number;
  insuranceRenewalMonth: number;
  annualRate: number;
  loanAmount: number;
  cushionMonths: number;
}

const DEFAULTS: FormState = {
  closingDate: '',
  firstPaymentDate: '',
  annualTaxes: 0,
  taxDueMonth1: 11, // December
  taxDueMonth2: 5,  // June (semi-annual)
  annualInsurance: 0,
  insuranceRenewalMonth: 0, // January
  annualRate: 6.5,
  loanAmount: 0,
  cushionMonths: 2,
};

export default function EscrowCalc() {
  const [form, setForm] = useState<FormState>({ ...DEFAULTS });
  const [result, setResult] = useState<EscrowResult | null>(null);

  const calculate = useCallback(() => {
    // Convert annual rate to daily rate: annualRate / 100 / 365
    const dailyInterestRate = form.annualRate / 100 / 365;

    const params: EscrowParams = {
      closingDate: form.closingDate,
      firstPaymentDate: form.firstPaymentDate,
      annualTaxes: form.annualTaxes,
      taxDueMonth1: form.taxDueMonth1,
      taxDueMonth2: form.taxDueMonth2,
      annualInsurance: form.annualInsurance,
      insuranceRenewalMonth: form.insuranceRenewalMonth,
      dailyInterestRate,
      loanAmount: form.loanAmount,
      cushionMonths: form.cushionMonths,
    };

    setResult(calculateEscrow(params));
  }, [form]);

  const reset = useCallback(() => {
    setForm({ ...DEFAULTS });
    setResult(null);
  }, []);

  const update = (field: keyof FormState, value: FormState[keyof FormState]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <CalculatorShell
      title="Escrow & Prepaids Calculator"
      description="Calculate prepaid interest, tax escrow deposits, insurance escrow deposits, and total prepaids due at closing."
      onCalculate={calculate}
      onReset={reset}
      isCalculated={!!result}
      results={
        result ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ResultCard
                label="Prepaid Interest"
                value={formatCurrency(result.prepaidInterest)}
                subValue={`${result.daysOfInterest} days @ ${formatCurrency(result.perDiemInterest)}/day`}
                variant="primary"
              />
              <ResultCard
                label="Tax Escrow"
                value={formatCurrency(result.taxEscrowDeposit)}
                subValue={`${result.taxMonthsToCollect} months`}
                variant="default"
              />
              <ResultCard
                label="Insurance Escrow"
                value={formatCurrency(result.insuranceEscrowDeposit)}
                subValue={`${result.insuranceMonthsToCollect} months`}
                variant="default"
              />
              <ResultCard
                label="Total Due"
                value={formatCurrency(result.totalPrepaidAndEscrow)}
                variant="success"
              />
            </div>

            {/* Prepaid Interest */}
            <ResultSection title="Prepaid Interest">
              <ResultTable
                rows={[
                  { label: 'Per Diem Interest', value: formatCurrency(result.perDiemInterest) },
                  { label: 'Days of Interest', value: result.daysOfInterest.toString() },
                  {
                    label: 'Total Prepaid Interest',
                    value: formatCurrency(result.prepaidInterest),
                    highlight: true,
                  },
                ]}
              />
            </ResultSection>

            {/* Tax Escrow */}
            <ResultSection title="Tax Escrow">
              <ResultTable
                rows={[
                  { label: 'Annual Taxes', value: formatCurrency(form.annualTaxes) },
                  { label: 'Monthly Tax', value: formatCurrency(result.monthlyTax) },
                  { label: 'Months to Collect', value: result.taxMonthsToCollect.toString() },
                  {
                    label: 'Tax Escrow Deposit',
                    value: formatCurrency(result.taxEscrowDeposit),
                    highlight: true,
                  },
                ]}
              />
            </ResultSection>

            {/* Insurance Escrow */}
            <ResultSection title="Insurance Escrow">
              <ResultTable
                rows={[
                  { label: 'Annual Insurance', value: formatCurrency(form.annualInsurance) },
                  { label: 'Monthly Insurance', value: formatCurrency(result.monthlyInsurance) },
                  {
                    label: 'Insurance Premium (1 year)',
                    value: formatCurrency(result.insurancePremium),
                  },
                  { label: 'Months to Collect', value: result.insuranceMonthsToCollect.toString() },
                  {
                    label: 'Insurance Escrow Deposit',
                    value: formatCurrency(result.insuranceEscrowDeposit),
                    highlight: true,
                  },
                ]}
              />
            </ResultSection>

            {/* Totals Summary */}
            <ResultSection title="Summary">
              <ResultTable
                rows={[
                  { label: 'Prepaid Interest', value: formatCurrency(result.prepaidInterest) },
                  { label: 'Insurance Premium (1 year)', value: formatCurrency(result.insurancePremium) },
                  {
                    label: 'Total Prepaids',
                    value: formatCurrency(result.totalPrepaids),
                    highlight: true,
                  },
                  { label: 'Tax Escrow Deposit', value: formatCurrency(result.taxEscrowDeposit) },
                  {
                    label: 'Insurance Escrow Deposit',
                    value: formatCurrency(result.insuranceEscrowDeposit),
                  },
                  {
                    label: 'Total Escrow Deposits',
                    value: formatCurrency(result.totalEscrow),
                    highlight: true,
                  },
                  {
                    label: 'Total Prepaids & Escrow',
                    value: formatCurrency(result.totalPrepaidAndEscrow),
                    highlight: true,
                  },
                ]}
              />
            </ResultSection>

            {/* Calculation Details */}
            <ShowCalculations
              title="Per Diem Interest Calculation"
              steps={[
                {
                  label: 'Loan Amount',
                  value: formatCurrency(form.loanAmount, 0),
                },
                {
                  label: 'Annual Rate',
                  value: `${form.annualRate}%`,
                },
                {
                  label: 'Daily Rate',
                  formula: `${form.annualRate}% / 365`,
                  value: `${(form.annualRate / 365).toFixed(6)}%`,
                },
                {
                  label: 'Per Diem',
                  formula: `${formatCurrency(form.loanAmount, 0)} x ${(form.annualRate / 365).toFixed(6)}%`,
                  value: formatCurrency(result.perDiemInterest),
                },
                {
                  label: 'Days of Interest',
                  value: result.daysOfInterest.toString(),
                },
                {
                  label: 'Prepaid Interest',
                  formula: `${formatCurrency(result.perDiemInterest)} x ${result.daysOfInterest} days`,
                  value: formatCurrency(result.prepaidInterest),
                },
              ]}
            />
          </>
        ) : undefined
      }
    >
      {/* Dates */}
      <FieldGroup title="Dates">
        <FieldRow columns={2}>
          <div className="w-full">
            <label className="label">Closing Date</label>
            <input
              type="date"
              className="input-field"
              value={form.closingDate}
              onChange={(e) => update('closingDate', e.target.value)}
            />
          </div>
          <div className="w-full">
            <label className="label">First Payment Date</label>
            <input
              type="date"
              className="input-field"
              value={form.firstPaymentDate}
              onChange={(e) => update('firstPaymentDate', e.target.value)}
            />
          </div>
        </FieldRow>
      </FieldGroup>

      {/* Loan Info */}
      <FieldGroup title="Loan Information">
        <FieldRow columns={2}>
          <CurrencyInput
            label="Loan Amount"
            value={form.loanAmount}
            onChange={(v) => update('loanAmount', v)}
          />
          <PercentInput
            label="Annual Interest Rate"
            value={form.annualRate}
            onChange={(v) => update('annualRate', v)}
          />
        </FieldRow>
      </FieldGroup>

      {/* Taxes */}
      <FieldGroup title="Property Taxes">
        <FieldRow columns={3}>
          <CurrencyInput
            label="Annual Taxes"
            value={form.annualTaxes}
            onChange={(v) => update('annualTaxes', v)}
          />
          <div className="w-full">
            <label className="label">Tax Due Month 1</label>
            <select
              className="input-field"
              value={form.taxDueMonth1}
              onChange={(e) => update('taxDueMonth1', Number(e.target.value))}
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={i} value={i}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full">
            <label className="label">Tax Due Month 2</label>
            <select
              className="input-field"
              value={form.taxDueMonth2}
              onChange={(e) => update('taxDueMonth2', Number(e.target.value))}
            >
              <option value={-1}>Annual (one payment)</option>
              {MONTH_NAMES.map((name, i) => (
                <option key={i} value={i}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </FieldRow>
      </FieldGroup>

      {/* Insurance */}
      <FieldGroup title="Homeowner's Insurance">
        <FieldRow columns={2}>
          <CurrencyInput
            label="Annual Insurance Premium"
            value={form.annualInsurance}
            onChange={(v) => update('annualInsurance', v)}
          />
          <div className="w-full">
            <label className="label">Insurance Renewal Month</label>
            <select
              className="input-field"
              value={form.insuranceRenewalMonth}
              onChange={(e) => update('insuranceRenewalMonth', Number(e.target.value))}
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={i} value={i}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </FieldRow>
      </FieldGroup>

      {/* Cushion */}
      <FieldGroup title="Escrow Cushion">
        <FieldRow columns={1}>
          <div className="w-full max-w-xs">
            <label className="label">Cushion Months</label>
            <select
              className="input-field"
              value={form.cushionMonths}
              onChange={(e) => update('cushionMonths', Number(e.target.value))}
            >
              <option value={0}>0 months</option>
              <option value={1}>1 month</option>
              <option value={2}>2 months (standard)</option>
              <option value={3}>3 months</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">RESPA allows a maximum 2-month cushion</p>
          </div>
        </FieldRow>
      </FieldGroup>
    </CalculatorShell>
  );
}
