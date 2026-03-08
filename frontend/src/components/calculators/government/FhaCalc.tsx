import { useState, useCallback } from 'react';
import CalculatorShell from '@/components/calculators/CalculatorShell';
import ResultCard from '@/components/calculators/ResultCard';
import ResultSection, { ResultRow, ResultTable } from '@/components/calculators/ResultSection';
import CurrencyInput from '@/components/calculators/CurrencyInput';
import PercentInput from '@/components/calculators/PercentInput';
import FieldRow from '@/components/calculators/FieldRow';
import FieldGroup from '@/components/calculators/FieldGroup';
import ShowCalculations from '@/components/calculators/ShowCalculations';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import {
  calculateFHA,
  calculateUfmipRefund,
  UFMIP_RATE,
  type FHAParams,
  type FHAScenario,
} from '@/utils/calculations/fha';

const DEFAULTS: FHAParams = {
  appraisedValue: 0,
  purchasePrice: 0,
  currentUpb: 0,
  currentRate: 0,
  currentPayment: 0,
  currentLoanType: 'fixed',
  originalLoanAmount: 0,
  newRate: 6.5,
  newTerm: 30,
  newLoanType: 'fixed',
  requestedLoanAmount: 0,
  financeUfmip: true,
  prepaidsCash: 0,
  totalCredits: 0,
  escrowRefund: 0,
  totalClosingCosts: 0,
  isExistingFha: false,
  endorsementDate: '',
  currentDate: new Date().toISOString().split('T')[0],
  firstPaymentDate: '',
  refiType: 'rateTerm',
};

interface FHAResult {
  purchase: FHAScenario | null;
  refi: FHAScenario | null;
  streamline: FHAScenario | null;
  notes: string[];
}

function ScenarioSection({
  title,
  scenario,
  description,
}: {
  title: string;
  scenario: FHAScenario;
  description?: string;
}) {
  return (
    <ResultSection title={title} description={description}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <ResultCard
          label="Max Base Loan"
          value={formatCurrency(scenario.maxBaseLoan, 0)}
          variant="default"
        />
        <ResultCard
          label="Total Loan"
          value={formatCurrency(scenario.totalLoan, 0)}
          variant="primary"
        />
        <ResultCard
          label="Monthly P&I"
          value={formatCurrency(scenario.payment)}
          variant="success"
        />
        <ResultCard
          label="Cash to Close"
          value={formatCurrency(scenario.cashToClose)}
          variant={scenario.cashToClose < 0 ? 'success' : 'warning'}
        />
      </div>

      <ResultTable
        rows={[
          { label: 'Actual Base Loan', value: formatCurrency(scenario.actualLoan, 0) },
          { label: 'UFMIP Amount', value: formatCurrency(scenario.ufmipAmt, 0) },
          ...(scenario.ufmipRefund > 0
            ? [{ label: 'UFMIP Refund Applied', value: formatCurrency(scenario.ufmipRefund, 0) }]
            : []),
          ...(scenario.ltv !== null
            ? [{ label: 'LTV', value: formatPercent(scenario.ltv * 100, 2) }]
            : []),
          { label: 'Total Loan (with UFMIP)', value: formatCurrency(scenario.totalLoan, 0), highlight: true },
          { label: 'Monthly P&I', value: formatCurrency(scenario.payment), highlight: true },
          { label: 'Cash to Close', value: formatCurrency(scenario.cashToClose) },
        ]}
      />

      {/* NTB Evaluation */}
      {scenario.ntb.met !== null && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Net Tangible Benefit</h4>
          <div
            className={`rounded-lg p-3 text-sm ${
              scenario.ntb.met
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <span className="font-semibold">{scenario.ntb.met ? 'PASS' : 'FAIL'}</span>
            {' — '}
            {scenario.ntb.detail}
            {scenario.ntb.reductionPercent !== 0 && (
              <span className="ml-2">
                (Payment change: {(scenario.ntb.reductionPercent * 100).toFixed(2)}%)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Seasoning */}
      {scenario.seasoning !== null && (
        <div className="mt-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Seasoning Requirement</h4>
          <div
            className={`rounded-lg p-3 text-sm ${
              scenario.seasoning
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <span className="font-semibold">{scenario.seasoning ? 'MET' : 'NOT MET'}</span>
            {' — '}
            {scenario.seasoning
              ? '6+ payments made and 210+ days since first payment.'
              : 'Requires 6 payments made and 210 days since first payment.'}
          </div>
        </div>
      )}
    </ResultSection>
  );
}

export default function FhaCalc() {
  const [params, setParams] = useState<FHAParams>({ ...DEFAULTS });
  const [result, setResult] = useState<FHAResult | null>(null);

  const calculate = useCallback(() => {
    setResult(calculateFHA(params));
  }, [params]);

  const reset = useCallback(() => {
    setParams({ ...DEFAULTS });
    setResult(null);
  }, []);

  const update = (field: keyof FHAParams, value: FHAParams[keyof FHAParams]) =>
    setParams((prev) => ({ ...prev, [field]: value }));

  return (
    <CalculatorShell
      title="FHA Calculator"
      description="FHA loan analysis: Purchase, Rate/Term Refinance, and Streamline Refinance scenarios with UFMIP and NTB evaluation."
      onCalculate={calculate}
      onReset={reset}
      isCalculated={!!result}
      results={
        result ? (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {result.purchase && (
                <ResultCard
                  label="Purchase Payment"
                  value={formatCurrency(result.purchase.payment)}
                  subValue={`Loan: ${formatCurrency(result.purchase.totalLoan, 0)}`}
                  variant="primary"
                />
              )}
              {result.refi && (
                <ResultCard
                  label="Refi Payment"
                  value={formatCurrency(result.refi.payment)}
                  subValue={`Loan: ${formatCurrency(result.refi.totalLoan, 0)}`}
                  variant="success"
                />
              )}
              {result.streamline && (
                <ResultCard
                  label="Streamline Payment"
                  value={formatCurrency(result.streamline.payment)}
                  subValue={`Loan: ${formatCurrency(result.streamline.totalLoan, 0)}`}
                  variant="warning"
                />
              )}
            </div>

            {/* Detailed Scenarios */}
            {result.purchase && (
              <ScenarioSection
                title="Purchase Scenario"
                scenario={result.purchase}
                description="Max LTV 96.5% of lesser of purchase price or appraised value"
              />
            )}
            {result.refi && (
              <ScenarioSection
                title={`Refinance Scenario (${params.refiType === 'cashOut' ? 'Cash-Out 80%' : 'Rate/Term 97.75%'})`}
                scenario={result.refi}
                description={`Max LTV ${params.refiType === 'cashOut' ? '80%' : '97.75%'} of appraised value`}
              />
            )}
            {result.streamline && (
              <ScenarioSection
                title="Streamline Refinance"
                scenario={result.streamline}
                description="Base loan = UPB minus UFMIP refund"
              />
            )}

            {/* UFMIP Refund Details */}
            {params.isExistingFha && params.endorsementDate && params.originalLoanAmount > 0 && (
              <ShowCalculations
                title="UFMIP Refund Calculation"
                steps={(() => {
                  const ref = calculateUfmipRefund(
                    params.endorsementDate,
                    params.currentDate,
                    params.originalLoanAmount
                  );
                  return [
                    {
                      label: 'Original UFMIP',
                      formula: `${formatCurrency(params.originalLoanAmount, 0)} x ${(UFMIP_RATE * 100).toFixed(2)}%`,
                      value: formatCurrency(ref.originalUfmip),
                    },
                    {
                      label: 'Months Since Endorsement',
                      value: ref.monthsSince.toString(),
                    },
                    {
                      label: 'Refund Percentage',
                      value: `${ref.refundPercent}%`,
                    },
                    {
                      label: 'Refund Amount',
                      formula: `${formatCurrency(ref.originalUfmip)} x ${ref.refundPercent}%`,
                      value: formatCurrency(ref.refundAmount),
                    },
                  ];
                })()}
              />
            )}

            {/* Notes */}
            {result.notes.length > 0 && (
              <ResultSection title="Notes">
                <ul className="space-y-1.5 text-sm text-gray-700">
                  {result.notes.map((note, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-gray-400 mt-0.5">{'--'}</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </ResultSection>
            )}
          </>
        ) : undefined
      }
    >
      {/* Property Info */}
      <FieldGroup title="Property Information">
        <FieldRow columns={2}>
          <CurrencyInput
            label="Appraised Value"
            value={params.appraisedValue}
            onChange={(v) => update('appraisedValue', v)}
          />
          <CurrencyInput
            label="Purchase Price"
            value={params.purchasePrice}
            onChange={(v) => update('purchasePrice', v)}
          />
        </FieldRow>
      </FieldGroup>

      {/* Existing Loan */}
      <FieldGroup title="Existing Loan" description="Required for refinance and streamline scenarios">
        <FieldRow columns={3}>
          <CurrencyInput
            label="Current UPB"
            value={params.currentUpb}
            onChange={(v) => update('currentUpb', v)}
          />
          <PercentInput
            label="Current Rate"
            value={params.currentRate}
            onChange={(v) => update('currentRate', v)}
          />
          <CurrencyInput
            label="Current Payment (P&I)"
            value={params.currentPayment}
            onChange={(v) => update('currentPayment', v)}
          />
        </FieldRow>
        <FieldRow columns={3}>
          <div className="w-full">
            <label className="label">Current Loan Type</label>
            <select
              className="input-field"
              value={params.currentLoanType}
              onChange={(e) => update('currentLoanType', e.target.value as 'fixed' | 'arm')}
            >
              <option value="fixed">Fixed</option>
              <option value="arm">ARM</option>
            </select>
          </div>
          <CurrencyInput
            label="Original Loan Amount"
            value={params.originalLoanAmount}
            onChange={(v) => update('originalLoanAmount', v)}
          />
          <div className="w-full flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={params.isExistingFha}
                onChange={(e) => update('isExistingFha', e.target.checked)}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-700">Existing FHA Loan</span>
            </label>
          </div>
        </FieldRow>

        {params.isExistingFha && (
          <FieldRow columns={2}>
            <div className="w-full">
              <label className="label">Endorsement Date</label>
              <input
                type="date"
                className="input-field"
                value={params.endorsementDate}
                onChange={(e) => update('endorsementDate', e.target.value)}
              />
            </div>
            <div className="w-full">
              <label className="label">First Payment Date</label>
              <input
                type="date"
                className="input-field"
                value={params.firstPaymentDate}
                onChange={(e) => update('firstPaymentDate', e.target.value)}
              />
            </div>
          </FieldRow>
        )}
      </FieldGroup>

      {/* New Loan */}
      <FieldGroup title="New Loan Details">
        <FieldRow columns={4}>
          <PercentInput
            label="New Rate"
            value={params.newRate}
            onChange={(v) => update('newRate', v)}
          />
          <div className="w-full">
            <label className="label">Term (years)</label>
            <select
              className="input-field"
              value={params.newTerm}
              onChange={(e) => update('newTerm', Number(e.target.value))}
            >
              <option value={15}>15 years</option>
              <option value={20}>20 years</option>
              <option value={25}>25 years</option>
              <option value={30}>30 years</option>
            </select>
          </div>
          <div className="w-full">
            <label className="label">New Loan Type</label>
            <select
              className="input-field"
              value={params.newLoanType}
              onChange={(e) => update('newLoanType', e.target.value as 'fixed' | 'arm')}
            >
              <option value="fixed">Fixed</option>
              <option value="arm">ARM</option>
            </select>
          </div>
          <div className="w-full">
            <label className="label">Refi Type</label>
            <select
              className="input-field"
              value={params.refiType}
              onChange={(e) => update('refiType', e.target.value as 'rateTerm' | 'cashOut')}
            >
              <option value="rateTerm">Rate/Term</option>
              <option value="cashOut">Cash-Out</option>
            </select>
          </div>
        </FieldRow>
        <FieldRow columns={2}>
          <CurrencyInput
            label="Requested Loan Amount (optional)"
            value={params.requestedLoanAmount}
            onChange={(v) => update('requestedLoanAmount', v)}
            hint="Leave at 0 for maximum allowable"
          />
          <div className="w-full flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={params.financeUfmip}
                onChange={(e) => update('financeUfmip', e.target.checked)}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-700">Finance UFMIP</span>
            </label>
          </div>
        </FieldRow>
      </FieldGroup>

      {/* Costs */}
      <FieldGroup title="Costs & Credits">
        <FieldRow columns={3}>
          <CurrencyInput
            label="Prepaids (Cash)"
            value={params.prepaidsCash}
            onChange={(v) => update('prepaidsCash', v)}
          />
          <CurrencyInput
            label="Total Credits"
            value={params.totalCredits}
            onChange={(v) => update('totalCredits', v)}
          />
          <CurrencyInput
            label="Escrow Refund"
            value={params.escrowRefund}
            onChange={(v) => update('escrowRefund', v)}
          />
        </FieldRow>
        <FieldRow columns={2}>
          <CurrencyInput
            label="Total Closing Costs"
            value={params.totalClosingCosts}
            onChange={(v) => update('totalClosingCosts', v)}
          />
          <div className="w-full">
            <label className="label">Current Date</label>
            <input
              type="date"
              className="input-field"
              value={params.currentDate}
              onChange={(e) => update('currentDate', e.target.value)}
            />
          </div>
        </FieldRow>
      </FieldGroup>
    </CalculatorShell>
  );
}
