import { useState, useCallback, useMemo } from 'react';
import CalculatorShell from '@/components/calculators/CalculatorShell';
import ResultCard from '@/components/calculators/ResultCard';
import ResultSection from '@/components/calculators/ResultSection';
import ShowCalculations from '@/components/calculators/ShowCalculations';
import CurrencyInput from '@/components/calculators/CurrencyInput';
import PercentInput from '@/components/calculators/PercentInput';
import FieldRow from '@/components/calculators/FieldRow';
import FieldGroup from '@/components/calculators/FieldGroup';
import { formatCurrency, formatPercent, formatNumber } from '@/utils/formatters';
import {
  generateAmortizationSchedule,
  calculateAmortizationSummary,
  type AmortizationParams,
  type AmortizationRow,
  type AmortizationSummary,
} from '@/utils/calculations/mortgage';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const TERM_OPTIONS = [15, 20, 25, 30];
const EXTRA_FREQ_OPTIONS: { value: AmortizationParams['extraFreq']; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'annually', label: 'Annually' },
  { value: 'one-time', label: 'One-Time' },
];

const now = new Date();
const DEFAULT_PARAMS: AmortizationParams = {
  loanAmount: 300000,
  rate: 0.065,
  termYears: 30,
  startMonth: now.getMonth(),
  startYear: now.getFullYear(),
  propertyValue: 375000,
  monthlyTax: 250,
  monthlyIns: 100,
  monthlyPMI: 0,
  extraAmount: 0,
  extraFreq: 'monthly',
  extraStartMonth: now.getMonth(),
  extraStartYear: now.getFullYear(),
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface CalcResult {
  schedule: AmortizationRow[];
  baseSchedule: AmortizationRow[];
  summary: AmortizationSummary;
}

export default function AmortizationCalc() {
  // Store rate as percent for display (e.g. 6.5)
  const [ratePercent, setRatePercent] = useState(6.5);
  const [params, setParams] = useState<AmortizationParams>(DEFAULT_PARAMS);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [visibleRows, setVisibleRows] = useState(24);

  const calculate = useCallback(() => {
    const calcParams = { ...params, rate: ratePercent / 100 };
    const schedule = generateAmortizationSchedule(calcParams, true);
    const baseSchedule = generateAmortizationSchedule(calcParams, false);
    const summary = calculateAmortizationSummary(calcParams, schedule, baseSchedule);
    setResult({ schedule, baseSchedule, summary });
    setVisibleRows(24);
  }, [params, ratePercent]);

  const reset = useCallback(() => {
    setParams(DEFAULT_PARAMS);
    setRatePercent(6.5);
    setResult(null);
    setVisibleRows(24);
  }, []);

  const update = <K extends keyof AmortizationParams>(field: K, value: AmortizationParams[K]) => {
    setParams((prev) => ({ ...prev, [field]: value }));
  };

  const chartData = useMemo(() => {
    if (!result) return [];
    // Aggregate by year
    const yearMap = new Map<number, { year: number; principal: number; interest: number }>();
    for (const row of result.schedule) {
      const existing = yearMap.get(row.schedYear);
      if (existing) {
        existing.principal += row.principal;
        existing.interest += row.interest;
      } else {
        yearMap.set(row.schedYear, {
          year: row.schedYear,
          principal: row.principal,
          interest: row.interest,
        });
      }
    }
    return Array.from(yearMap.values());
  }, [result]);

  const hasExtras = params.extraAmount > 0;

  return (
    <CalculatorShell
      title="Amortization Calculator"
      description="Full amortization schedule with extra payments, PMI auto-drop, and interactive charts"
      onCalculate={calculate}
      onReset={reset}
      isCalculated={!!result}
      results={
        result ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <ResultCard
                label="Monthly P&I"
                value={formatCurrency(result.summary.monthlyPI)}
                variant="primary"
              />
              <ResultCard
                label="Total Monthly"
                value={formatCurrency(result.summary.totalMonthly)}
                subValue="P&I + Tax + Ins + PMI"
              />
              <ResultCard
                label="Payoff Date"
                value={result.summary.payoffDate}
              />
              <ResultCard
                label="Total Interest"
                value={formatCurrency(result.summary.totalInterest)}
                variant="warning"
              />
              <ResultCard
                label="Total Cost"
                value={formatCurrency(result.summary.totalCost)}
              />
            </div>

            {/* Extra payment savings */}
            {hasExtras && result.summary.interestSaved > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ResultCard
                  label="Interest Saved"
                  value={formatCurrency(result.summary.interestSaved)}
                  variant="success"
                  subValue="With extra payments"
                />
                <ResultCard
                  label="Time Saved"
                  value={`${Math.floor(result.summary.timeSaved / 12)} yr ${result.summary.timeSaved % 12} mo`}
                  variant="success"
                  subValue="Early payoff"
                />
              </div>
            )}

            {/* Chart */}
            {chartData.length > 0 && (
              <ResultSection title="Principal vs Interest Over Time">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="year"
                        label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          formatCurrency(value),
                          name === 'principal' ? 'Principal' : 'Interest',
                        ]}
                        labelFormatter={(label) => `Year ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="principal"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="#93c5fd"
                        name="principal"
                      />
                      <Area
                        type="monotone"
                        dataKey="interest"
                        stackId="1"
                        stroke="#f59e0b"
                        fill="#fcd34d"
                        name="interest"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ResultSection>
            )}

            {/* Calculations */}
            <ShowCalculations
              title="Show Calculations"
              steps={[
                {
                  label: 'Monthly Rate',
                  formula: `${formatPercent(ratePercent)} / 12`,
                  value: formatPercent(ratePercent / 12, 4),
                },
                {
                  label: 'Total Payments',
                  formula: `${params.termYears} x 12`,
                  value: formatNumber(params.termYears * 12),
                },
                {
                  label: 'Monthly P&I',
                  formula: 'P * r / (1 - (1+r)^-n)',
                  value: formatCurrency(result.summary.monthlyPI),
                },
                {
                  label: 'Total Interest',
                  value: formatCurrency(result.summary.totalInterest),
                },
              ]}
            />

            {/* Amortization Schedule */}
            <ResultSection title="Amortization Schedule" description={`${formatNumber(result.schedule.length)} payments`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 pr-3 text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="text-left py-2 pr-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="text-right py-2 pr-3 text-xs font-medium text-gray-500 uppercase">Payment</th>
                      <th className="text-right py-2 pr-3 text-xs font-medium text-gray-500 uppercase">Principal</th>
                      <th className="text-right py-2 pr-3 text-xs font-medium text-gray-500 uppercase">Interest</th>
                      {hasExtras && (
                        <th className="text-right py-2 pr-3 text-xs font-medium text-gray-500 uppercase">Extra</th>
                      )}
                      <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {result.schedule.slice(0, visibleRows).map((row) => (
                      <tr key={row.paymentNum} className="hover:bg-gray-50">
                        <td className="py-1.5 pr-3 font-mono text-gray-500">{row.paymentNum}</td>
                        <td className="py-1.5 pr-3 text-gray-700">{row.date}</td>
                        <td className="py-1.5 pr-3 text-right font-mono">{formatCurrency(row.payment)}</td>
                        <td className="py-1.5 pr-3 text-right font-mono text-blue-600">{formatCurrency(row.principal)}</td>
                        <td className="py-1.5 pr-3 text-right font-mono text-amber-600">{formatCurrency(row.interest)}</td>
                        {hasExtras && (
                          <td className="py-1.5 pr-3 text-right font-mono text-green-600">
                            {row.extra > 0 ? formatCurrency(row.extra) : '-'}
                          </td>
                        )}
                        <td className="py-1.5 text-right font-mono font-medium">{formatCurrency(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {visibleRows < result.schedule.length && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleRows((v) => v + 24)}
                    className="btn-secondary text-sm"
                  >
                    Show More ({result.schedule.length - visibleRows} remaining)
                  </button>
                </div>
              )}
            </ResultSection>
          </>
        ) : undefined
      }
    >
      {/* Loan Details */}
      <FieldGroup title="Loan Details">
        <FieldRow columns={3}>
          <CurrencyInput
            label="Loan Amount"
            value={params.loanAmount}
            onChange={(v) => update('loanAmount', v)}
          />
          <PercentInput
            label="Interest Rate"
            value={ratePercent}
            onChange={setRatePercent}
          />
          <div>
            <label className="label">Term (Years)</label>
            <select
              className="input-field"
              value={params.termYears}
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
        <FieldRow columns={2}>
          <div>
            <label className="label">Start Month</label>
            <select
              className="input-field"
              value={params.startMonth}
              onChange={(e) => update('startMonth', Number(e.target.value))}
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Start Year</label>
            <input
              type="number"
              className="input-field"
              value={params.startYear}
              onChange={(e) => update('startYear', Number(e.target.value))}
            />
          </div>
        </FieldRow>
      </FieldGroup>

      {/* Property & Escrow */}
      <FieldGroup title="Property & Escrow">
        <FieldRow columns={4}>
          <CurrencyInput
            label="Property Value"
            value={params.propertyValue}
            onChange={(v) => update('propertyValue', v)}
          />
          <CurrencyInput
            label="Monthly Tax"
            value={params.monthlyTax}
            onChange={(v) => update('monthlyTax', v)}
          />
          <CurrencyInput
            label="Monthly Insurance"
            value={params.monthlyIns}
            onChange={(v) => update('monthlyIns', v)}
          />
          <CurrencyInput
            label="Monthly PMI"
            value={params.monthlyPMI}
            onChange={(v) => update('monthlyPMI', v)}
          />
        </FieldRow>
      </FieldGroup>

      {/* Extra Payments */}
      <FieldGroup title="Extra Payments" description="Optional additional principal payments">
        <FieldRow columns={4}>
          <CurrencyInput
            label="Extra Amount"
            value={params.extraAmount}
            onChange={(v) => update('extraAmount', v)}
          />
          <div>
            <label className="label">Frequency</label>
            <select
              className="input-field"
              value={params.extraFreq}
              onChange={(e) => update('extraFreq', e.target.value as AmortizationParams['extraFreq'])}
            >
              {EXTRA_FREQ_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Start Month</label>
            <select
              className="input-field"
              value={params.extraStartMonth}
              onChange={(e) => update('extraStartMonth', Number(e.target.value))}
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Start Year</label>
            <input
              type="number"
              className="input-field"
              value={params.extraStartYear}
              onChange={(e) => update('extraStartYear', Number(e.target.value))}
            />
          </div>
        </FieldRow>
      </FieldGroup>
    </CalculatorShell>
  );
}
