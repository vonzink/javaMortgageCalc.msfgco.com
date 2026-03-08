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
  calculateBuydown,
  type BuydownParams,
  type BuydownResult,
} from '@/utils/calculations/buydown';

const TERM_OPTIONS = [15, 20, 25, 30];
const BUYDOWN_TYPES: { value: BuydownParams['buydownType']; label: string }[] = [
  { value: '2-1', label: '2-1 Buydown' },
  { value: '3-2-1', label: '3-2-1 Buydown' },
  { value: 'permanent', label: 'Permanent Buydown' },
];

interface FormState {
  loanAmount: number;
  baseRatePercent: number;
  termYears: number;
  buydownType: BuydownParams['buydownType'];
  permanentReduction: number; // basis points
}

const DEFAULTS: FormState = {
  loanAmount: 300000,
  baseRatePercent: 6.5,
  termYears: 30,
  buydownType: '2-1',
  permanentReduction: 25,
};

export default function BuydownCalc() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<BuydownResult | null>(null);

  const calculate = useCallback(() => {
    const params: BuydownParams = {
      loanAmount: form.loanAmount,
      baseRate: form.baseRatePercent / 100,
      termYears: form.termYears,
      buydownType: form.buydownType,
      permanentReduction: form.permanentReduction,
    };
    setResult(calculateBuydown(params));
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
      title="Buydown Analysis"
      description="Analyze temporary and permanent rate buydown options"
      onCalculate={calculate}
      onReset={reset}
      isCalculated={!!result}
      results={
        result ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ResultCard
                label="Base Payment"
                value={formatCurrency(result.basePayment)}
                subValue={`at ${formatPercent(form.baseRatePercent)}`}
              />
              <ResultCard
                label="Total Savings"
                value={formatCurrency(result.totalSavings)}
                variant="success"
              />
              <ResultCard
                label="Buydown Cost"
                value={formatCurrency(result.buydownCost)}
                variant="warning"
              />
              {result.breakEvenMonths > 0 ? (
                <ResultCard
                  label="Break-Even"
                  value={`${result.breakEvenMonths} months`}
                  subValue={`${(result.breakEvenMonths / 12).toFixed(1)} years`}
                />
              ) : (
                <ResultCard
                  label="Buydown Type"
                  value={form.buydownType === '3-2-1' ? '3-2-1' : '2-1'}
                  subValue="Temporary buydown"
                />
              )}
            </div>

            {/* Year-by-Year Breakdown */}
            <ResultSection title="Payment Schedule by Year">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 pr-3 text-xs font-medium text-gray-500 uppercase">Year</th>
                      <th className="text-right py-2 pr-3 text-xs font-medium text-gray-500 uppercase">Rate</th>
                      <th className="text-right py-2 pr-3 text-xs font-medium text-gray-500 uppercase">Monthly Payment</th>
                      <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase">Annual Savings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {result.buydownYears.map((yr) => (
                      <tr key={yr.year} className={yr.savings > 0 ? 'bg-green-50' : ''}>
                        <td className="py-2 pr-3 text-gray-700 font-medium">
                          {form.buydownType === 'permanent'
                            ? 'All Years'
                            : yr.savings > 0
                              ? `Year ${yr.year}`
                              : `Year ${yr.year}+`}
                        </td>
                        <td className="py-2 pr-3 text-right font-mono">{formatPercent(yr.rate * 100)}</td>
                        <td className="py-2 pr-3 text-right font-mono">{formatCurrency(yr.payment)}</td>
                        <td className="py-2 text-right font-mono">
                          {yr.savings > 0 ? (
                            <span className="text-green-700">{formatCurrency(yr.savings)}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ResultSection>

            {/* Permanent buydown info */}
            {result.permanentRate !== undefined && (
              <ResultSection title="Permanent Buydown Details">
                <ResultTable
                  rows={[
                    { label: 'Original Rate', value: formatPercent(form.baseRatePercent) },
                    { label: 'New Permanent Rate', value: formatPercent(result.permanentRate * 100), highlight: true },
                    { label: 'Rate Reduction', value: `${form.permanentReduction} bps` },
                    { label: 'Monthly Savings', value: formatCurrency(result.basePayment - result.buydownYears[0].payment) },
                    { label: 'Cost to Buy Down', value: formatCurrency(result.buydownCost) },
                    { label: 'Break-Even Point', value: `${result.breakEvenMonths} months`, highlight: true },
                  ]}
                />
              </ResultSection>
            )}

            {/* Calculations */}
            <ShowCalculations
              title="Show Calculations"
              steps={[
                {
                  label: 'Loan Amount',
                  value: formatCurrency(form.loanAmount),
                },
                {
                  label: 'Base Rate',
                  value: formatPercent(form.baseRatePercent),
                },
                {
                  label: 'Base Payment',
                  formula: 'P * r / (1 - (1+r)^-n)',
                  value: formatCurrency(result.basePayment),
                },
                {
                  label: 'Buydown Cost',
                  value: formatCurrency(result.buydownCost),
                },
                {
                  label: 'Total Savings',
                  value: formatCurrency(result.totalSavings),
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
            label="Base Interest Rate"
            value={form.baseRatePercent}
            onChange={(v) => update('baseRatePercent', v)}
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

      <FieldGroup title="Buydown Options">
        <FieldRow columns={form.buydownType === 'permanent' ? 2 : 1}>
          <div>
            <label className="label">Buydown Type</label>
            <select
              className="input-field"
              value={form.buydownType}
              onChange={(e) => update('buydownType', e.target.value as BuydownParams['buydownType'])}
            >
              {BUYDOWN_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {form.buydownType === 'permanent' && (
            <div>
              <label className="label">Rate Reduction (Basis Points)</label>
              <input
                type="number"
                className="input-field"
                value={form.permanentReduction}
                onChange={(e) => update('permanentReduction', Number(e.target.value))}
                step={25}
                min={1}
                placeholder="e.g. 25 = 0.25%"
              />
              <p className="mt-1 text-xs text-gray-500">
                {form.permanentReduction} bps = {(form.permanentReduction / 100).toFixed(3)}% rate reduction
              </p>
            </div>
          )}
        </FieldRow>
      </FieldGroup>
    </CalculatorShell>
  );
}
