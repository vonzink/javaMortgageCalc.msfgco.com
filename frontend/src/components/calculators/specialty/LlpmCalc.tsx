import { useState, useCallback } from 'react';
import CalculatorShell from '@/components/calculators/CalculatorShell';
import ResultCard from '@/components/calculators/ResultCard';
import ResultSection, { ResultRow, ResultTable } from '@/components/calculators/ResultSection';
import CurrencyInput from '@/components/calculators/CurrencyInput';
import PercentInput from '@/components/calculators/PercentInput';
import FieldRow from '@/components/calculators/FieldRow';
import FieldGroup from '@/components/calculators/FieldGroup';
import { formatCurrency } from '@/utils/formatters';
import {
  calculateLLPM,
  type LLPMParams,
  type LLPMResult,
} from '@/utils/calculations/llpm';

const DEFAULTS: LLPMParams = {
  loanAmount: 0,
  ltv: 80,
  fico: 740,
  loanPurpose: 'Purchase',
  propertyType: 'SFR',
  occupancy: 'Primary',
  lockDays: 30,
  basePrice: 100,
};

const LOAN_PURPOSES: { value: LLPMParams['loanPurpose']; label: string }[] = [
  { value: 'Purchase', label: 'Purchase' },
  { value: 'RateTermRefi', label: 'Rate/Term Refinance' },
  { value: 'CashOutRefi', label: 'Cash-Out Refinance' },
];

const PROPERTY_TYPES: { value: LLPMParams['propertyType']; label: string }[] = [
  { value: 'SFR', label: 'Single Family' },
  { value: 'Condo', label: 'Condominium' },
  { value: '2Unit', label: '2-Unit' },
  { value: '3-4Unit', label: '3-4 Unit' },
  { value: 'Manufactured', label: 'Manufactured' },
];

const OCCUPANCY_TYPES: { value: LLPMParams['occupancy']; label: string }[] = [
  { value: 'Primary', label: 'Primary Residence' },
  { value: 'Secondary', label: 'Second Home' },
  { value: 'Investment', label: 'Investment Property' },
];

export default function LlpmCalc() {
  const [params, setParams] = useState<LLPMParams>({ ...DEFAULTS });
  const [result, setResult] = useState<LLPMResult | null>(null);

  const calculate = useCallback(() => {
    setResult(calculateLLPM(params));
  }, [params]);

  const reset = useCallback(() => {
    setParams({ ...DEFAULTS });
    setResult(null);
  }, []);

  const update = (field: keyof LLPMParams, value: LLPMParams[keyof LLPMParams]) =>
    setParams((prev) => ({ ...prev, [field]: value }));

  return (
    <CalculatorShell
      title="Loan-Level Price Matrix (LLPM)"
      description="Calculate loan-level price adjustments (LLPA) based on loan characteristics."
      onCalculate={calculate}
      onReset={reset}
      isCalculated={!!result}
      results={
        result ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ResultCard
                label="Base Price"
                value={result.basePrice.toFixed(3)}
                variant="default"
              />
              <ResultCard
                label="Total Adjustment"
                value={result.totalAdjustment >= 0
                  ? `+${result.totalAdjustment.toFixed(3)}`
                  : result.totalAdjustment.toFixed(3)}
                variant={result.totalAdjustment >= 0 ? 'success' : 'danger'}
              />
              <ResultCard
                label="Final Price"
                value={result.finalPrice.toFixed(3)}
                variant="primary"
              />
              <ResultCard
                label="Adjustments"
                value={result.adjustments.length.toString()}
                subValue={result.adjustments.length === 0 ? 'No adjustments' : 'Applied'}
                variant="default"
              />
            </div>

            {/* Adjustments Table */}
            <ResultSection title="Price Adjustments">
              {result.adjustments.length === 0 ? (
                <p className="text-sm text-gray-500">No adjustments applied to this loan scenario.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 pr-4 font-medium text-gray-600">Category</th>
                        <th className="text-left py-2 pr-4 font-medium text-gray-600">Description</th>
                        <th className="text-right py-2 font-medium text-gray-600">Adjustment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {result.adjustments.map((adj, i) => (
                        <tr key={i}>
                          <td className="py-2 pr-4 text-gray-700">{adj.category}</td>
                          <td className="py-2 pr-4 text-gray-700">{adj.description}</td>
                          <td
                            className={`py-2 text-right font-mono font-medium ${
                              adj.adjustment >= 0 ? 'text-green-700' : 'text-red-700'
                            }`}
                          >
                            {adj.adjustment >= 0 ? '+' : ''}
                            {adj.adjustment.toFixed(3)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-300">
                        <td className="py-2 pr-4 font-semibold text-gray-800" colSpan={2}>
                          Total Adjustment
                        </td>
                        <td
                          className={`py-2 text-right font-mono font-bold ${
                            result.totalAdjustment >= 0 ? 'text-green-700' : 'text-red-700'
                          }`}
                        >
                          {result.totalAdjustment >= 0 ? '+' : ''}
                          {result.totalAdjustment.toFixed(3)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </ResultSection>

            {/* Price Summary */}
            <ResultSection title="Price Summary">
              <ResultTable
                rows={[
                  { label: 'Base Price', value: result.basePrice.toFixed(3) },
                  {
                    label: 'Total Adjustment',
                    value: `${result.totalAdjustment >= 0 ? '+' : ''}${result.totalAdjustment.toFixed(3)}`,
                  },
                  {
                    label: 'Final Price',
                    value: result.finalPrice.toFixed(3),
                    highlight: true,
                  },
                ]}
              />
            </ResultSection>
          </>
        ) : undefined
      }
    >
      {/* Loan Information */}
      <FieldGroup title="Loan Information">
        <FieldRow columns={3}>
          <CurrencyInput
            label="Loan Amount"
            value={params.loanAmount}
            onChange={(v) => update('loanAmount', v)}
          />
          <PercentInput
            label="LTV"
            value={params.ltv}
            onChange={(v) => update('ltv', v)}
            step={1}
          />
          <div className="w-full">
            <label className="label">FICO Score</label>
            <input
              type="number"
              className="input-field"
              value={params.fico || ''}
              onChange={(e) => update('fico', Number(e.target.value) || 0)}
              min={300}
              max={850}
            />
          </div>
        </FieldRow>
      </FieldGroup>

      {/* Loan Characteristics */}
      <FieldGroup title="Loan Characteristics">
        <FieldRow columns={3}>
          <div className="w-full">
            <label className="label">Loan Purpose</label>
            <select
              className="input-field"
              value={params.loanPurpose}
              onChange={(e) => update('loanPurpose', e.target.value as LLPMParams['loanPurpose'])}
            >
              {LOAN_PURPOSES.map((lp) => (
                <option key={lp.value} value={lp.value}>
                  {lp.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full">
            <label className="label">Property Type</label>
            <select
              className="input-field"
              value={params.propertyType}
              onChange={(e) =>
                update('propertyType', e.target.value as LLPMParams['propertyType'])
              }
            >
              {PROPERTY_TYPES.map((pt) => (
                <option key={pt.value} value={pt.value}>
                  {pt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full">
            <label className="label">Occupancy</label>
            <select
              className="input-field"
              value={params.occupancy}
              onChange={(e) => update('occupancy', e.target.value as LLPMParams['occupancy'])}
            >
              {OCCUPANCY_TYPES.map((ot) => (
                <option key={ot.value} value={ot.value}>
                  {ot.label}
                </option>
              ))}
            </select>
          </div>
        </FieldRow>
      </FieldGroup>

      {/* Pricing */}
      <FieldGroup title="Pricing">
        <FieldRow columns={2}>
          <div className="w-full">
            <label className="label">Lock Days</label>
            <select
              className="input-field"
              value={params.lockDays}
              onChange={(e) => update('lockDays', Number(e.target.value))}
            >
              <option value={15}>15 days</option>
              <option value={30}>30 days</option>
              <option value={45}>45 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>
          <div className="w-full">
            <label className="label">Base Price</label>
            <input
              type="number"
              className="input-field"
              value={params.basePrice || ''}
              onChange={(e) => update('basePrice', Number(e.target.value) || 0)}
              step={0.125}
            />
            <p className="mt-1 text-xs text-gray-500">Par = 100.000</p>
          </div>
        </FieldRow>
      </FieldGroup>
    </CalculatorShell>
  );
}
