import { useState, useCallback } from 'react';
import CalculatorShell from '@/components/calculators/CalculatorShell';
import ResultCard from '@/components/calculators/ResultCard';
import ResultSection, { ResultTable } from '@/components/calculators/ResultSection';
import ShowCalculations from '@/components/calculators/ShowCalculations';
import CurrencyInput from '@/components/calculators/CurrencyInput';
import PercentInput from '@/components/calculators/PercentInput';
import FieldRow from '@/components/calculators/FieldRow';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import {
  calculateBlendedRate,
  type LoanEntry,
  type BlendedRateResult,
} from '@/utils/calculations/blendedRate';
import { Plus, Trash2 } from 'lucide-react';

const TERM_OPTIONS = [10, 15, 20, 25, 30];

interface LoanFormEntry {
  balance: number;
  ratePercent: number; // user-facing percent
  termYears: number;
}

const DEFAULT_LOAN: LoanFormEntry = {
  balance: 0,
  ratePercent: 6.5,
  termYears: 30,
};

const DEFAULT_LOANS: LoanFormEntry[] = [
  { balance: 250000, ratePercent: 6.5, termYears: 30 },
  { balance: 50000, ratePercent: 8.0, termYears: 15 },
];

export default function BlendedRateCalc() {
  const [loans, setLoans] = useState<LoanFormEntry[]>(DEFAULT_LOANS);
  const [result, setResult] = useState<BlendedRateResult | null>(null);

  const calculate = useCallback(() => {
    const entries: LoanEntry[] = loans.map((l) => ({
      balance: l.balance,
      rate: l.ratePercent / 100,
      termYears: l.termYears,
    }));
    setResult(calculateBlendedRate(entries));
  }, [loans]);

  const reset = useCallback(() => {
    setLoans(DEFAULT_LOANS);
    setResult(null);
  }, []);

  const updateLoan = (index: number, field: keyof LoanFormEntry, value: number) => {
    setLoans((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l))
    );
  };

  const addLoan = () => {
    if (loans.length < 4) {
      setLoans((prev) => [...prev, { ...DEFAULT_LOAN }]);
    }
  };

  const removeLoan = (index: number) => {
    if (loans.length > 2) {
      setLoans((prev) => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <CalculatorShell
      title="Blended Rate Calculator"
      description="Calculate the weighted average rate across multiple loans"
      onCalculate={calculate}
      onReset={reset}
      isCalculated={!!result}
      results={
        result ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ResultCard
                label="Blended Rate"
                value={formatPercent(result.blendedRate * 100)}
                variant="primary"
              />
              <ResultCard
                label="Total Balance"
                value={formatCurrency(result.totalBalance)}
              />
              <ResultCard
                label="Combined Payment"
                value={formatCurrency(result.combinedPayment)}
                subValue="Monthly P&I"
              />
            </div>

            {/* Individual Loan Details */}
            <ResultSection title="Loan Breakdown">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 pr-3 text-xs font-medium text-gray-500 uppercase">Loan</th>
                      <th className="text-right py-2 pr-3 text-xs font-medium text-gray-500 uppercase">Balance</th>
                      <th className="text-right py-2 pr-3 text-xs font-medium text-gray-500 uppercase">Rate</th>
                      <th className="text-right py-2 pr-3 text-xs font-medium text-gray-500 uppercase">Payment</th>
                      <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase">Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {result.loans.map((loan, i) => (
                      <tr key={i}>
                        <td className="py-2 pr-3 text-gray-700">Loan {i + 1}</td>
                        <td className="py-2 pr-3 text-right font-mono">{formatCurrency(loan.balance)}</td>
                        <td className="py-2 pr-3 text-right font-mono">{formatPercent(loan.rate * 100)}</td>
                        <td className="py-2 pr-3 text-right font-mono">{formatCurrency(loan.payment)}</td>
                        <td className="py-2 text-right font-mono">{(loan.weight * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 font-semibold">
                      <td className="py-2 pr-3 text-gray-900">Totals</td>
                      <td className="py-2 pr-3 text-right font-mono">{formatCurrency(result.totalBalance)}</td>
                      <td className="py-2 pr-3 text-right font-mono text-brand-700">{formatPercent(result.blendedRate * 100)}</td>
                      <td className="py-2 pr-3 text-right font-mono">{formatCurrency(result.combinedPayment)}</td>
                      <td className="py-2 text-right font-mono">100.0%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </ResultSection>

            {/* Calculations */}
            <ShowCalculations
              title="Show Calculations"
              steps={[
                {
                  label: 'Total Balance',
                  value: formatCurrency(result.totalBalance),
                },
                ...result.loans.map((loan, i) => ({
                  label: `Loan ${i + 1} Weight`,
                  formula: `${formatCurrency(loan.balance)} / ${formatCurrency(result.totalBalance)}`,
                  value: `${(loan.weight * 100).toFixed(2)}%`,
                })),
                {
                  label: 'Blended Rate',
                  formula: 'Sum(rate x weight)',
                  value: formatPercent(result.blendedRate * 100),
                },
              ]}
            />
          </>
        ) : undefined
      }
    >
      {loans.map((loan, index) => (
        <div
          key={index}
          className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700">Loan {index + 1}</h4>
            {loans.length > 2 && (
              <button
                type="button"
                onClick={() => removeLoan(index)}
                className="text-red-500 hover:text-red-700 p-1"
                title="Remove loan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <FieldRow columns={3}>
            <CurrencyInput
              label="Balance"
              value={loan.balance}
              onChange={(v) => updateLoan(index, 'balance', v)}
            />
            <PercentInput
              label="Interest Rate"
              value={loan.ratePercent}
              onChange={(v) => updateLoan(index, 'ratePercent', v)}
            />
            <div>
              <label className="label">Term (Years)</label>
              <select
                className="input-field"
                value={loan.termYears}
                onChange={(e) => updateLoan(index, 'termYears', Number(e.target.value))}
              >
                {TERM_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t} years
                  </option>
                ))}
              </select>
            </div>
          </FieldRow>
        </div>
      ))}

      {loans.length < 4 && (
        <button
          type="button"
          onClick={addLoan}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Loan
        </button>
      )}
    </CalculatorShell>
  );
}
