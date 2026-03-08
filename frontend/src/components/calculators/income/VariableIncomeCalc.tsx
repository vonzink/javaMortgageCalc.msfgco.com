import { useState, useCallback } from 'react';
import IncomeCalcShell from '@/components/calculators/income/IncomeCalcShell';
import ResultCard from '@/components/calculators/ResultCard';
import ResultSection from '@/components/calculators/ResultSection';
import { ResultTable } from '@/components/calculators/ResultSection';
import ShowCalculations from '@/components/calculators/ShowCalculations';
import CurrencyInput from '@/components/calculators/CurrencyInput';
import FieldRow from '@/components/calculators/FieldRow';
import FieldGroup from '@/components/calculators/FieldGroup';
import { EntityGroup } from '@/components/calculators/FieldGroup';
import { formatCurrency } from '@/utils/formatters';
import {
  calculateVariableIncome,
  type VariableIncomeParams,
  type VariableIncomeResult,
  type EmployerData,
  type PayFrequency,
  PAY_PERIODS_PER_YEAR,
} from '@/utils/calculations/income';
import { Plus, Trash2 } from 'lucide-react';

const PAY_FREQ_OPTIONS: { value: PayFrequency; label: string }[] = [
  { value: 'WEEKLY', label: 'Weekly (52)' },
  { value: 'BIWEEKLY', label: 'Bi-Weekly (26)' },
  { value: 'SEMIMONTHLY', label: 'Semi-Monthly (24)' },
  { value: 'MONTHLY', label: 'Monthly (12)' },
];

const TREND_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  STABLE_OR_UP: { bg: 'bg-green-100', text: 'text-green-700', label: 'Stable / Increasing' },
  DECLINED_THEN_STABLE: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Declined then Stable' },
  DECLINING: { bg: 'bg-red-100', text: 'text-red-700', label: 'Declining' },
};

function createEmptyEmployer(name: string): EmployerData {
  return {
    name,
    paystub: {
      ytdGross: 0,
      payDate: new Date().toISOString().slice(0, 10),
      payFrequency: 'BIWEEKLY',
      periodsWorked: 0,
    },
    w2s: [
      { year: new Date().getFullYear() - 1, wages: 0 },
      { year: new Date().getFullYear() - 2, wages: 0 },
    ],
  };
}

export default function VariableIncomeCalc() {
  const [employers, setEmployers] = useState<EmployerData[]>([
    createEmptyEmployer('Employer 1'),
  ]);
  const [result, setResult] = useState<VariableIncomeResult | null>(null);

  const addEmployer = () => {
    if (employers.length >= 4) return;
    setEmployers((prev) => [
      ...prev,
      createEmptyEmployer(`Employer ${prev.length + 1}`),
    ]);
  };

  const removeEmployer = (index: number) => {
    if (employers.length <= 1) return;
    setEmployers((prev) => prev.filter((_, i) => i !== index));
  };

  const updateEmployer = (index: number, field: keyof EmployerData, value: unknown) => {
    setEmployers((prev) =>
      prev.map((emp, i) => (i === index ? { ...emp, [field]: value } : emp))
    );
  };

  const updatePaystub = (index: number, field: string, value: unknown) => {
    setEmployers((prev) =>
      prev.map((emp, i) =>
        i === index
          ? { ...emp, paystub: { ...emp.paystub!, [field]: value } }
          : emp
      )
    );
  };

  const updateW2 = (empIndex: number, w2Index: number, field: string, value: unknown) => {
    setEmployers((prev) =>
      prev.map((emp, i) => {
        if (i !== empIndex) return emp;
        const w2s = [...emp.w2s];
        w2s[w2Index] = { ...w2s[w2Index], [field]: value };
        return { ...emp, w2s };
      })
    );
  };

  const calculate = useCallback(() => {
    const params: VariableIncomeParams = { employers };
    setResult(calculateVariableIncome(params));
  }, [employers]);

  const reset = useCallback(() => {
    setEmployers([createEmptyEmployer('Employer 1')]);
    setResult(null);
  }, []);

  return (
    <IncomeCalcShell
      title="Variable Income Calculator"
      description="Multi-employer variable income analysis per Fannie Mae B3-3.1 guidelines"
      onCalculate={calculate}
      onReset={reset}
      isCalculated={!!result}
      monthlyIncome={result?.combinedMonthly}
      method={result ? 'Variable Income Analysis' : undefined}
      results={
        result ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.employers.map((emp, i) => (
                <ResultCard
                  key={i}
                  label={emp.name}
                  value={formatCurrency(emp.qualifyingMonthly)}
                  subValue={emp.method}
                  variant="primary"
                />
              ))}
              <ResultCard
                label="Combined Monthly"
                value={formatCurrency(result.combinedMonthly)}
                variant="success"
              />
            </div>

            {result.employers.map((emp, i) => (
              <ResultSection key={i} title={emp.name}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm text-gray-600">Income Trend:</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${TREND_COLORS[emp.trend].bg} ${TREND_COLORS[emp.trend].text}`}
                    >
                      {TREND_COLORS[emp.trend].label}
                    </span>
                  </div>
                  <ResultTable
                    rows={[
                      { label: 'YTD Annualized', value: formatCurrency(emp.ytdAnnualized) },
                      { label: 'YTD Monthly', value: formatCurrency(emp.ytdMonthly) },
                      { label: 'W-2 Year 1', value: formatCurrency(emp.w2Year1) },
                      { label: 'W-2 Year 2', value: formatCurrency(emp.w2Year2) },
                      { label: 'Method', value: emp.method },
                      { label: 'Qualifying Monthly', value: formatCurrency(emp.qualifyingMonthly), highlight: true },
                    ]}
                  />
                </div>
              </ResultSection>
            ))}

            <ShowCalculations
              steps={result.employers.flatMap((emp) => [
                { label: `${emp.name} - YTD Annualized`, value: formatCurrency(emp.ytdAnnualized) },
                { label: `${emp.name} - Method`, value: emp.method },
                { label: `${emp.name} - Qualifying Monthly`, value: formatCurrency(emp.qualifyingMonthly) },
              ]).concat([
                { label: 'Combined Monthly', value: formatCurrency(result.combinedMonthly) },
              ])}
            />
          </>
        ) : undefined
      }
    >
      {employers.map((emp, empIdx) => (
        <EntityGroup key={empIdx} index={empIdx} label={emp.name}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="label">Employer Name</label>
              <input
                type="text"
                className="input-field"
                value={emp.name}
                onChange={(e) => updateEmployer(empIdx, 'name', e.target.value)}
              />
            </div>
            {employers.length > 1 && (
              <button
                type="button"
                onClick={() => removeEmployer(empIdx)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <FieldGroup title="Current Paystub">
            <FieldRow columns={2}>
              <CurrencyInput
                label="YTD Gross Income"
                value={emp.paystub?.ytdGross ?? 0}
                onChange={(v) => updatePaystub(empIdx, 'ytdGross', v)}
              />
              <div>
                <label className="label">Pay Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={emp.paystub?.payDate ?? ''}
                  onChange={(e) => updatePaystub(empIdx, 'payDate', e.target.value)}
                />
              </div>
            </FieldRow>
            <FieldRow columns={2}>
              <div>
                <label className="label">Pay Frequency</label>
                <select
                  className="input-field"
                  value={emp.paystub?.payFrequency ?? 'BIWEEKLY'}
                  onChange={(e) => updatePaystub(empIdx, 'payFrequency', e.target.value)}
                >
                  {PAY_FREQ_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Periods Worked (YTD)</label>
                <input
                  type="number"
                  className="input-field"
                  value={emp.paystub?.periodsWorked ?? 0}
                  onChange={(e) => updatePaystub(empIdx, 'periodsWorked', Number(e.target.value))}
                  min={0}
                />
              </div>
            </FieldRow>
          </FieldGroup>

          <FieldGroup title="W-2 History">
            {emp.w2s.map((w2, w2Idx) => (
              <FieldRow key={w2Idx} columns={2}>
                <div>
                  <label className="label">Year</label>
                  <input
                    type="number"
                    className="input-field"
                    value={w2.year}
                    onChange={(e) => updateW2(empIdx, w2Idx, 'year', Number(e.target.value))}
                  />
                </div>
                <CurrencyInput
                  label="W-2 Wages"
                  value={w2.wages}
                  onChange={(v) => updateW2(empIdx, w2Idx, 'wages', v)}
                />
              </FieldRow>
            ))}
          </FieldGroup>
        </EntityGroup>
      ))}

      {employers.length < 4 && (
        <button
          type="button"
          onClick={addEmployer}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Employer
        </button>
      )}
    </IncomeCalcShell>
  );
}
