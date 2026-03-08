import { useState, useCallback } from 'react';
import IncomeCalcShell from '@/components/calculators/income/IncomeCalcShell';
import ResultCard from '@/components/calculators/ResultCard';
import ResultSection from '@/components/calculators/ResultSection';
import { ResultTable } from '@/components/calculators/ResultSection';
import ShowCalculations from '@/components/calculators/ShowCalculations';
import CurrencyInput from '@/components/calculators/CurrencyInput';
import FieldRow from '@/components/calculators/FieldRow';
import FieldGroup from '@/components/calculators/FieldGroup';
import { formatCurrency } from '@/utils/formatters';
import {
  calculateRentalMethodA,
  calculateRentalMethodB,
  type RentalMethodAParams,
  type RentalMethodBParams,
  type RentalMethodAResult,
  type RentalMethodBResult,
  type RentalMethod,
} from '@/utils/calculations/income';

const DEFAULT_METHOD_A: RentalMethodAParams = {
  rentsReceived: 0,
  totalExpenses: 0,
  insurance: 0,
  mortgageInterest: 0,
  taxes: 0,
  hoaDues: 0,
  depreciation: 0,
  oneTimeExpense: 0,
  monthsInService: 12,
  proposedPITIA: 0,
};

const DEFAULT_METHOD_B: RentalMethodBParams = {
  grossMonthlyRent: 0,
  proposedPITIA: 0,
};

type RentalResult = RentalMethodAResult | RentalMethodBResult;

export default function Rental1038Calc() {
  const [method, setMethod] = useState<RentalMethod>('scheduleE');
  const [methodAParams, setMethodAParams] = useState<RentalMethodAParams>({ ...DEFAULT_METHOD_A });
  const [methodBParams, setMethodBParams] = useState<RentalMethodBParams>({ ...DEFAULT_METHOD_B });
  const [result, setResult] = useState<RentalResult | null>(null);

  const updateA = <K extends keyof RentalMethodAParams>(field: K, value: RentalMethodAParams[K]) => {
    setMethodAParams((prev) => ({ ...prev, [field]: value }));
  };

  const updateB = <K extends keyof RentalMethodBParams>(field: K, value: RentalMethodBParams[K]) => {
    setMethodBParams((prev) => ({ ...prev, [field]: value }));
  };

  const calculate = useCallback(() => {
    if (method === 'scheduleE') {
      setResult(calculateRentalMethodA(methodAParams));
    } else {
      setResult(calculateRentalMethodB(methodBParams));
    }
  }, [method, methodAParams, methodBParams]);

  const reset = useCallback(() => {
    setMethodAParams({ ...DEFAULT_METHOD_A });
    setMethodBParams({ ...DEFAULT_METHOD_B });
    setResult(null);
  }, []);

  const netIncome = result?.netRentalIncome ?? 0;
  const isPositive = netIncome >= 0;

  return (
    <IncomeCalcShell
      title="Rental Property Income (1038)"
      description="Calculate net rental income using Schedule E (Method A) or Lease Agreement (Method B)"
      onCalculate={calculate}
      onReset={reset}
      isCalculated={!!result}
      monthlyIncome={result ? Math.max(0, result.netRentalIncome) : undefined}
      method={result ? (result.method === 'scheduleE' ? 'Schedule E Method' : 'Lease Agreement Method') : undefined}
      results={
        result ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {result.method === 'scheduleE' ? (
                <>
                  <ResultCard label="Adjusted Annual" value={formatCurrency((result as RentalMethodAResult).adjustedAnnualIncome)} />
                  <ResultCard label="Monthly Adjusted" value={formatCurrency((result as RentalMethodAResult).monthlyAdjusted)} variant="primary" />
                </>
              ) : (
                <ResultCard label="Adjusted Monthly (75%)" value={formatCurrency((result as RentalMethodBResult).adjustedMonthly)} variant="primary" />
              )}
              <ResultCard
                label="Net Rental Income"
                value={formatCurrency(result.netRentalIncome)}
                variant={isPositive ? 'success' : 'danger'}
                subValue={isPositive ? 'Add to qualifying income' : 'Count as monthly expense'}
              />
            </div>

            <ResultSection title="Calculation Details">
              <ResultTable
                rows={
                  result.method === 'scheduleE'
                    ? [
                        { label: 'Adjusted Annual Income', value: formatCurrency((result as RentalMethodAResult).adjustedAnnualIncome) },
                        { label: 'Monthly Adjusted', value: formatCurrency((result as RentalMethodAResult).monthlyAdjusted) },
                        { label: 'Proposed PITIA', value: formatCurrency(result.proposedPITIA) },
                        { label: 'Net Rental Income', value: formatCurrency(result.netRentalIncome), highlight: true },
                      ]
                    : [
                        { label: 'Adjusted Monthly (75%)', value: formatCurrency((result as RentalMethodBResult).adjustedMonthly) },
                        { label: 'Proposed PITIA', value: formatCurrency(result.proposedPITIA) },
                        { label: 'Net Rental Income', value: formatCurrency(result.netRentalIncome), highlight: true },
                      ]
                }
              />
            </ResultSection>

            <ShowCalculations
              steps={
                result.method === 'scheduleE'
                  ? [
                      { label: 'Adjusted Annual', formula: '(Rents + Ins + MortInt + Taxes + HOA + Depr + OneTime) - Total Expenses', value: formatCurrency((result as RentalMethodAResult).adjustedAnnualIncome) },
                      { label: 'Monthly Adjusted', formula: `Adjusted Annual / ${methodAParams.monthsInService} months`, value: formatCurrency((result as RentalMethodAResult).monthlyAdjusted) },
                      { label: 'Net', formula: 'Monthly Adjusted - Proposed PITIA', value: formatCurrency(result.netRentalIncome) },
                    ]
                  : [
                      { label: 'Adjusted Monthly', formula: `${formatCurrency(methodBParams.grossMonthlyRent)} x 75%`, value: formatCurrency((result as RentalMethodBResult).adjustedMonthly) },
                      { label: 'Net', formula: 'Adjusted Monthly - Proposed PITIA', value: formatCurrency(result.netRentalIncome) },
                    ]
              }
            />
          </>
        ) : undefined
      }
    >
      {/* Method Selection */}
      <FieldGroup title="Calculation Method">
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="rental-method"
              value="scheduleE"
              checked={method === 'scheduleE'}
              onChange={() => { setMethod('scheduleE'); setResult(null); }}
              className="text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Method A - Schedule E
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="rental-method"
              value="lease"
              checked={method === 'lease'}
              onChange={() => { setMethod('lease'); setResult(null); }}
              className="text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Method B - Lease Agreement
            </span>
          </label>
        </div>
      </FieldGroup>

      {method === 'scheduleE' ? (
        <FieldGroup title="Schedule E Details">
          <FieldRow columns={2}>
            <CurrencyInput label="Rents Received" value={methodAParams.rentsReceived} onChange={(v) => updateA('rentsReceived', v)} />
            <CurrencyInput label="Total Expenses" value={methodAParams.totalExpenses} onChange={(v) => updateA('totalExpenses', v)} />
          </FieldRow>
          <FieldRow columns={3}>
            <CurrencyInput label="Insurance" value={methodAParams.insurance} onChange={(v) => updateA('insurance', v)} />
            <CurrencyInput label="Mortgage Interest" value={methodAParams.mortgageInterest} onChange={(v) => updateA('mortgageInterest', v)} />
            <CurrencyInput label="Taxes" value={methodAParams.taxes} onChange={(v) => updateA('taxes', v)} />
          </FieldRow>
          <FieldRow columns={3}>
            <CurrencyInput label="HOA Dues" value={methodAParams.hoaDues} onChange={(v) => updateA('hoaDues', v)} />
            <CurrencyInput label="Depreciation" value={methodAParams.depreciation} onChange={(v) => updateA('depreciation', v)} />
            <CurrencyInput label="One-Time Expense" value={methodAParams.oneTimeExpense} onChange={(v) => updateA('oneTimeExpense', v)} />
          </FieldRow>
          <FieldRow columns={2}>
            <div>
              <label className="label">Months in Service</label>
              <input
                type="number"
                className="input-field"
                value={methodAParams.monthsInService}
                onChange={(e) => updateA('monthsInService', Math.max(1, Math.min(12, Number(e.target.value))))}
                min={1}
                max={12}
              />
            </div>
            <CurrencyInput label="Proposed PITIA" value={methodAParams.proposedPITIA} onChange={(v) => updateA('proposedPITIA', v)} />
          </FieldRow>
        </FieldGroup>
      ) : (
        <FieldGroup title="Lease Agreement Details">
          <FieldRow columns={2}>
            <CurrencyInput label="Gross Monthly Rent" value={methodBParams.grossMonthlyRent} onChange={(v) => updateB('grossMonthlyRent', v)} />
            <CurrencyInput label="Proposed PITIA" value={methodBParams.proposedPITIA} onChange={(v) => updateB('proposedPITIA', v)} />
          </FieldRow>
        </FieldGroup>
      )}
    </IncomeCalcShell>
  );
}
