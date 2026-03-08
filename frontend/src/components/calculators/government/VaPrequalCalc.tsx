import { useState, useCallback } from 'react';
import CalculatorShell from '@/components/calculators/CalculatorShell';
import ResultCard from '@/components/calculators/ResultCard';
import ResultSection, { ResultRow, ResultTable } from '@/components/calculators/ResultSection';
import CurrencyInput from '@/components/calculators/CurrencyInput';
import FieldRow from '@/components/calculators/FieldRow';
import FieldGroup from '@/components/calculators/FieldGroup';
import ShowCalculations from '@/components/calculators/ShowCalculations';
import { formatCurrency, formatPercent, formatNumber } from '@/utils/formatters';
import {
  calculateVAPrequal,
  PI_FACTORS,
  type VAParams,
  type VAResult,
  type VARegion,
} from '@/utils/calculations/va';

const RATE_OPTIONS = Object.keys(PI_FACTORS).sort();
const TERM_OPTIONS = [15, 20, 30] as const;
const REGION_OPTIONS: VARegion[] = ['Northeast', 'Midwest', 'South', 'West'];

const DEFAULTS: VAParams = {
  mortgageAmount: 0,
  interestRate: '6.500',
  loanTerm: 30,
  grossIncome: 0,
  familySize: 1,
  region: 'South',
  propertyTaxes: 0,
  homeInsurance: 0,
  hoaDues: 0,
  carPayments: 0,
  revolvingAccounts: 0,
  installmentLoans: 0,
  childCare: 0,
  otherDebts: 0,
  squareFootage: 0,
  federalTax: 0,
  stateTax: 0,
  socialSecurity: 0,
};

export default function VaPrequalCalc() {
  const [params, setParams] = useState<VAParams>({ ...DEFAULTS });
  const [result, setResult] = useState<VAResult | null>(null);

  const calculate = useCallback(() => {
    setResult(calculateVAPrequal(params));
  }, [params]);

  const reset = useCallback(() => {
    setParams({ ...DEFAULTS });
    setResult(null);
  }, []);

  const update = (field: keyof VAParams, value: VAParams[keyof VAParams]) =>
    setParams((prev) => ({ ...prev, [field]: value }));

  return (
    <CalculatorShell
      title="VA Pre-Qualification Worksheet"
      description="VA loan pre-qualification analysis including residual income test, DTI ratio, and P&I factor lookup."
      onCalculate={calculate}
      onReset={reset}
      isCalculated={!!result}
      results={
        result ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ResultCard
                label="P&I Payment"
                value={formatCurrency(result.piPayment)}
                subValue={`Factor: ${result.paymentFactor}`}
                variant="primary"
              />
              <ResultCard
                label="Total Housing"
                value={formatCurrency(result.totalHousing)}
                variant="default"
              />
              <ResultCard
                label="DTI Ratio"
                value={formatPercent(result.dtiRatio, 1)}
                subValue={result.dtiRatio <= 41 ? 'Within guidelines' : 'Exceeds 41% guideline'}
                variant={result.dtiRatio <= 41 ? 'success' : 'danger'}
              />
              <ResultCard
                label="Residual Income"
                value={formatCurrency(result.actualResidual)}
                subValue={result.residualPasses ? 'PASS' : 'FAIL'}
                variant={result.residualPasses ? 'success' : 'danger'}
              />
            </div>

            {/* Residual Income Analysis */}
            <ResultSection
              title="Residual Income Analysis"
              description={`Region: ${params.region} | Family Size: ${params.familySize}`}
            >
              <div
                className={`rounded-lg p-4 mb-4 ${
                  result.residualPasses
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span
                      className={`text-lg font-bold ${
                        result.residualPasses ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {result.residualPasses ? 'PASS' : 'FAIL'}
                    </span>
                    <span className="text-sm text-gray-600 ml-2">
                      Actual: {formatCurrency(result.actualResidual)} | Required:{' '}
                      {formatCurrency(result.requiredResidual)}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      result.residualDifference >= 0 ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {result.residualDifference >= 0 ? '+' : ''}
                    {formatCurrency(result.residualDifference)}
                  </span>
                </div>
              </div>

              <ResultTable
                rows={[
                  { label: 'Gross Monthly Income', value: formatCurrency(params.grossIncome), highlight: true },
                  { label: 'P&I Payment', value: `- ${formatCurrency(result.piPayment)}` },
                  { label: 'Property Taxes', value: `- ${formatCurrency(params.propertyTaxes)}` },
                  { label: 'Home Insurance', value: `- ${formatCurrency(params.homeInsurance)}` },
                  { label: 'HOA Dues', value: `- ${formatCurrency(params.hoaDues)}` },
                  { label: 'Total Housing', value: `- ${formatCurrency(result.totalHousing)}`, highlight: true },
                  { label: 'Total Debts', value: `- ${formatCurrency(result.totalDebts)}` },
                  { label: 'Maintenance ($0.14/sqft)', value: `- ${formatCurrency(result.maintenanceCost)}` },
                  { label: 'Total Taxes & Withholdings', value: `- ${formatCurrency(result.totalTaxes)}` },
                  { label: 'Actual Residual Income', value: formatCurrency(result.actualResidual), highlight: true },
                  { label: 'Required Residual', value: formatCurrency(result.requiredResidual) },
                ]}
              />
            </ResultSection>

            {/* DTI Breakdown */}
            <ResultSection title="Debt-to-Income Breakdown">
              <ResultTable
                rows={[
                  { label: 'P&I Payment', value: formatCurrency(result.piPayment) },
                  { label: 'Property Taxes', value: formatCurrency(params.propertyTaxes) },
                  { label: 'Home Insurance', value: formatCurrency(params.homeInsurance) },
                  { label: 'HOA Dues', value: formatCurrency(params.hoaDues) },
                  { label: 'Total Housing', value: formatCurrency(result.totalHousing), highlight: true },
                  { label: 'Car Payments', value: formatCurrency(params.carPayments) },
                  { label: 'Revolving Accounts', value: formatCurrency(params.revolvingAccounts) },
                  { label: 'Installment Loans', value: formatCurrency(params.installmentLoans) },
                  { label: 'Child Care', value: formatCurrency(params.childCare) },
                  { label: 'Other Debts', value: formatCurrency(params.otherDebts) },
                  { label: 'Total Debts', value: formatCurrency(result.totalDebts), highlight: true },
                  {
                    label: 'Total Obligations',
                    value: formatCurrency(result.totalHousing + result.totalDebts),
                    highlight: true,
                  },
                  {
                    label: 'DTI Ratio',
                    value: formatPercent(result.dtiRatio, 2),
                    highlight: true,
                  },
                ]}
              />
            </ResultSection>

            {/* Calculation Steps */}
            <ShowCalculations
              title="Payment Factor Calculation"
              steps={[
                {
                  label: 'Interest Rate',
                  value: params.interestRate + '%',
                },
                {
                  label: 'Term',
                  value: `${params.loanTerm} years`,
                },
                {
                  label: 'P&I Factor (per $1,000)',
                  value: result.paymentFactor.toFixed(2),
                },
                {
                  label: 'P&I Payment',
                  formula: `(${formatCurrency(params.mortgageAmount, 0)} / 1000) x ${result.paymentFactor}`,
                  value: formatCurrency(result.piPayment),
                },
                {
                  label: 'Maintenance',
                  formula: `${formatNumber(params.squareFootage)} sqft x $0.14`,
                  value: formatCurrency(result.maintenanceCost),
                },
              ]}
            />
          </>
        ) : undefined
      }
    >
      {/* Loan Information */}
      <FieldGroup title="Loan Information">
        <FieldRow columns={3}>
          <CurrencyInput
            label="Mortgage Amount"
            value={params.mortgageAmount}
            onChange={(v) => update('mortgageAmount', v)}
          />
          <div className="w-full">
            <label className="label">Interest Rate</label>
            <select
              className="input-field"
              value={params.interestRate}
              onChange={(e) => update('interestRate', e.target.value)}
            >
              {RATE_OPTIONS.map((rate) => (
                <option key={rate} value={rate}>
                  {rate}%
                </option>
              ))}
            </select>
          </div>
          <div className="w-full">
            <label className="label">Loan Term</label>
            <select
              className="input-field"
              value={params.loanTerm}
              onChange={(e) => update('loanTerm', Number(e.target.value))}
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

      {/* Borrower Information */}
      <FieldGroup title="Borrower Information">
        <FieldRow columns={3}>
          <CurrencyInput
            label="Gross Monthly Income"
            value={params.grossIncome}
            onChange={(v) => update('grossIncome', v)}
          />
          <div className="w-full">
            <label className="label">Family Size</label>
            <select
              className="input-field"
              value={params.familySize}
              onChange={(e) => update('familySize', Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                <option key={s} value={s}>
                  {s} {s === 7 ? '+' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full">
            <label className="label">Region</label>
            <select
              className="input-field"
              value={params.region}
              onChange={(e) => update('region', e.target.value as VARegion)}
            >
              {REGION_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </FieldRow>
      </FieldGroup>

      {/* Housing Expenses */}
      <FieldGroup title="Monthly Housing Expenses">
        <FieldRow columns={3}>
          <CurrencyInput
            label="Property Taxes"
            value={params.propertyTaxes}
            onChange={(v) => update('propertyTaxes', v)}
          />
          <CurrencyInput
            label="Home Insurance"
            value={params.homeInsurance}
            onChange={(v) => update('homeInsurance', v)}
          />
          <CurrencyInput
            label="HOA Dues"
            value={params.hoaDues}
            onChange={(v) => update('hoaDues', v)}
          />
        </FieldRow>
      </FieldGroup>

      {/* Debts */}
      <FieldGroup title="Monthly Debts">
        <FieldRow columns={3}>
          <CurrencyInput
            label="Car Payments"
            value={params.carPayments}
            onChange={(v) => update('carPayments', v)}
          />
          <CurrencyInput
            label="Revolving Accounts"
            value={params.revolvingAccounts}
            onChange={(v) => update('revolvingAccounts', v)}
          />
          <CurrencyInput
            label="Installment Loans"
            value={params.installmentLoans}
            onChange={(v) => update('installmentLoans', v)}
          />
        </FieldRow>
        <FieldRow columns={2}>
          <CurrencyInput
            label="Child Care"
            value={params.childCare}
            onChange={(v) => update('childCare', v)}
          />
          <CurrencyInput
            label="Other Debts"
            value={params.otherDebts}
            onChange={(v) => update('otherDebts', v)}
          />
        </FieldRow>
      </FieldGroup>

      {/* Property */}
      <FieldGroup title="Property Information">
        <FieldRow columns={1}>
          <div className="w-full max-w-xs">
            <label className="label">Square Footage</label>
            <input
              type="number"
              className="input-field"
              value={params.squareFootage || ''}
              onChange={(e) => update('squareFootage', Number(e.target.value) || 0)}
              min={0}
            />
            <p className="mt-1 text-xs text-gray-500">Used for maintenance cost calculation ($0.14/sqft)</p>
          </div>
        </FieldRow>
      </FieldGroup>

      {/* Tax Withholdings */}
      <FieldGroup title="Monthly Tax Withholdings">
        <FieldRow columns={3}>
          <CurrencyInput
            label="Federal Tax"
            value={params.federalTax}
            onChange={(v) => update('federalTax', v)}
          />
          <CurrencyInput
            label="State Tax"
            value={params.stateTax}
            onChange={(v) => update('stateTax', v)}
          />
          <CurrencyInput
            label="Social Security"
            value={params.socialSecurity}
            onChange={(v) => update('socialSecurity', v)}
          />
        </FieldRow>
      </FieldGroup>
    </CalculatorShell>
  );
}
