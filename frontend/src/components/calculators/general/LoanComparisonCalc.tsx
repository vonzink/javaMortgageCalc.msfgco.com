import { useState, useCallback } from 'react';
import CalculatorShell from '@/components/calculators/CalculatorShell';
import ResultCard from '@/components/calculators/ResultCard';
import ResultSection from '@/components/calculators/ResultSection';
import ShowCalculations from '@/components/calculators/ShowCalculations';
import CurrencyInput from '@/components/calculators/CurrencyInput';
import PercentInput from '@/components/calculators/PercentInput';
import FieldRow from '@/components/calculators/FieldRow';
import FieldGroup from '@/components/calculators/FieldGroup';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import {
  compareLoans,
  type ComparisonLoan,
  type ComparisonResult,
} from '@/utils/calculations/loanComparison';
import { Plus, Trash2 } from 'lucide-react';

const TERM_OPTIONS_MONTHS = [120, 180, 240, 300, 360];
const PURPOSE_OPTIONS: ComparisonLoan['purpose'][] = ['Purchase', 'Refinance'];

function createDefaultLoan(index: number): ComparisonLoan {
  return {
    label: `Loan ${index + 1}`,
    loanAmount: 300000,
    rate: 0.065,
    termMonths: 360,
    origFee: 0,
    discountPts: 0,
    processingFee: 400,
    underwritingFee: 500,
    appraisalFee: 500,
    creditReportFee: 50,
    titleFees: 1200,
    otherThirdParty: 0,
    recordingFee: 200,
    transferTax: 0,
    prepaidInsurance: 1200,
    prepaidInterest: 500,
    escrowTax: 600,
    escrowInsurance: 300,
    payoff1st: 0,
    payoff2nd: 0,
    payoffOther: 0,
    downPayment: 60000,
    sellerCredits: 0,
    lenderCredits: 0,
    monthlyTax: 250,
    monthlyInsurance: 100,
    monthlyMI: 0,
    monthlyHOA: 0,
    purpose: 'Purchase',
  };
}

// For form state, we store rate as percent
interface LoanFormEntry extends Omit<ComparisonLoan, 'rate'> {
  ratePercent: number;
}

function toFormEntry(loan: ComparisonLoan): LoanFormEntry {
  const { rate, ...rest } = loan;
  return { ...rest, ratePercent: rate * 100 };
}

function fromFormEntry(entry: LoanFormEntry): ComparisonLoan {
  const { ratePercent, ...rest } = entry;
  return { ...rest, rate: ratePercent / 100 };
}

export default function LoanComparisonCalc() {
  const [loans, setLoans] = useState<LoanFormEntry[]>([
    toFormEntry(createDefaultLoan(0)),
    toFormEntry({ ...createDefaultLoan(1), label: 'Loan 2', rate: 0.0625, origFee: 1500 }),
  ]);
  const [results, setResults] = useState<ComparisonResult[] | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const calculate = useCallback(() => {
    const loanParams = loans.map(fromFormEntry);
    setResults(compareLoans(loanParams));
  }, [loans]);

  const reset = useCallback(() => {
    setLoans([
      toFormEntry(createDefaultLoan(0)),
      toFormEntry({ ...createDefaultLoan(1), label: 'Loan 2', rate: 0.0625, origFee: 1500 }),
    ]);
    setResults(null);
    setActiveTab(0);
  }, []);

  const updateLoan = <K extends keyof LoanFormEntry>(
    index: number,
    field: K,
    value: LoanFormEntry[K]
  ) => {
    setLoans((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l))
    );
  };

  const addLoan = () => {
    if (loans.length < 4) {
      const newIndex = loans.length;
      setLoans((prev) => [
        ...prev,
        toFormEntry({ ...createDefaultLoan(newIndex), label: `Loan ${newIndex + 1}` }),
      ]);
    }
  };

  const removeLoan = (index: number) => {
    if (loans.length > 2) {
      setLoans((prev) => prev.filter((_, i) => i !== index));
      if (activeTab >= loans.length - 1) {
        setActiveTab(Math.max(0, loans.length - 2));
      }
    }
  };

  const loan = loans[activeTab];

  return (
    <CalculatorShell
      title="Loan Comparison"
      description="Side-by-side comparison of up to 4 loan scenarios with APR, fees, and total cost analysis"
      onCalculate={calculate}
      onReset={reset}
      isCalculated={!!results}
      results={
        results ? (
          <>
            {/* Summary Cards - Best loan indicators */}
            {(() => {
              const lowestPayment = results.reduce((min, r) => r.totalMonthly < min.totalMonthly ? r : min, results[0]);
              const lowestAPR = results.reduce((min, r) => (r.apr > 0 && r.apr < min.apr) || min.apr === 0 ? r : min, results[0]);
              const lowestCash = results.reduce((min, r) => r.cashToClose < min.cashToClose ? r : min, results[0]);
              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <ResultCard
                    label="Lowest Total Monthly"
                    value={formatCurrency(lowestPayment.totalMonthly)}
                    subValue={lowestPayment.label}
                    variant="success"
                  />
                  <ResultCard
                    label="Lowest APR"
                    value={formatPercent(lowestAPR.apr * 100)}
                    subValue={lowestAPR.label}
                    variant="primary"
                  />
                  <ResultCard
                    label="Lowest Cash to Close"
                    value={formatCurrency(lowestCash.cashToClose)}
                    subValue={lowestCash.label}
                  />
                </div>
              );
            })()}

            {/* Side-by-Side Table */}
            <ResultSection title="Loan Comparison" description="Side-by-side cost analysis">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 pr-3 text-xs font-medium text-gray-500 uppercase">Metric</th>
                      {results.map((r, i) => (
                        <th key={i} className="text-right py-2 pr-3 text-xs font-medium text-gray-500 uppercase min-w-[120px]">
                          {r.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { label: 'Monthly P&I', key: 'monthlyPI' as const, format: formatCurrency },
                      { label: 'Total Monthly', key: 'totalMonthly' as const, format: formatCurrency, highlight: true },
                      { label: 'APR', key: 'apr' as const, format: (v: number) => formatPercent(v * 100), highlight: true },
                      { label: 'Origination Fees', key: 'origTotal' as const, format: formatCurrency },
                      { label: 'Third Party Fees', key: 'thirdPartyTotal' as const, format: formatCurrency },
                      { label: 'Government Fees', key: 'govTotal' as const, format: formatCurrency },
                      { label: 'Prepaids', key: 'prepaidsTotal' as const, format: formatCurrency },
                      { label: 'Escrow', key: 'escrowTotal' as const, format: formatCurrency },
                      { label: 'Payoffs', key: 'payoffsTotal' as const, format: formatCurrency },
                      { label: 'Total Closing Costs', key: 'totalClosing' as const, format: formatCurrency, highlight: true },
                      { label: 'Cash to Close', key: 'cashToClose' as const, format: formatCurrency, highlight: true },
                    ].map((row) => (
                      <tr key={row.key} className={row.highlight ? 'bg-gray-50 font-semibold' : ''}>
                        <td className="py-2 pr-3 text-gray-700">{row.label}</td>
                        {results.map((r, i) => (
                          <td key={i} className="py-2 pr-3 text-right font-mono">
                            {row.format(r[row.key])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ResultSection>
          </>
        ) : undefined
      }
    >
      {/* Loan Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mb-4 flex-wrap">
        {loans.map((l, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === i
                ? 'bg-brand-50 text-brand-700 border-b-2 border-brand-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {l.label}
          </button>
        ))}
        {loans.length < 4 && (
          <button
            type="button"
            onClick={addLoan}
            className="px-3 py-2 text-sm text-gray-400 hover:text-brand-600 transition-colors"
            title="Add loan"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Active Loan Form */}
      {loan && (
        <div className="space-y-6">
          {/* Loan Label & Remove */}
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-xs">
              <label className="label">Loan Label</label>
              <input
                type="text"
                className="input-field"
                value={loan.label}
                onChange={(e) => updateLoan(activeTab, 'label', e.target.value)}
              />
            </div>
            {loans.length > 2 && (
              <button
                type="button"
                onClick={() => removeLoan(activeTab)}
                className="text-red-500 hover:text-red-700 p-2 mt-5"
                title="Remove this loan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Core Loan Details */}
          <FieldGroup title="Loan Details">
            <FieldRow columns={4}>
              <CurrencyInput
                label="Loan Amount"
                value={loan.loanAmount}
                onChange={(v) => updateLoan(activeTab, 'loanAmount', v)}
              />
              <PercentInput
                label="Interest Rate"
                value={loan.ratePercent}
                onChange={(v) => updateLoan(activeTab, 'ratePercent', v)}
              />
              <div>
                <label className="label">Term (Months)</label>
                <select
                  className="input-field"
                  value={loan.termMonths}
                  onChange={(e) => updateLoan(activeTab, 'termMonths', Number(e.target.value))}
                >
                  {TERM_OPTIONS_MONTHS.map((t) => (
                    <option key={t} value={t}>
                      {t} mo ({t / 12} yr)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Purpose</label>
                <select
                  className="input-field"
                  value={loan.purpose}
                  onChange={(e) => updateLoan(activeTab, 'purpose', e.target.value as ComparisonLoan['purpose'])}
                >
                  {PURPOSE_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </FieldRow>
          </FieldGroup>

          {/* Origination Fees */}
          <FieldGroup title="Origination Fees">
            <FieldRow columns={4}>
              <CurrencyInput label="Origination Fee" value={loan.origFee} onChange={(v) => updateLoan(activeTab, 'origFee', v)} />
              <CurrencyInput label="Discount Points ($)" value={loan.discountPts} onChange={(v) => updateLoan(activeTab, 'discountPts', v)} />
              <CurrencyInput label="Processing Fee" value={loan.processingFee} onChange={(v) => updateLoan(activeTab, 'processingFee', v)} />
              <CurrencyInput label="Underwriting Fee" value={loan.underwritingFee} onChange={(v) => updateLoan(activeTab, 'underwritingFee', v)} />
            </FieldRow>
          </FieldGroup>

          {/* Third Party Fees */}
          <FieldGroup title="Third Party Fees">
            <FieldRow columns={4}>
              <CurrencyInput label="Appraisal Fee" value={loan.appraisalFee} onChange={(v) => updateLoan(activeTab, 'appraisalFee', v)} />
              <CurrencyInput label="Credit Report" value={loan.creditReportFee} onChange={(v) => updateLoan(activeTab, 'creditReportFee', v)} />
              <CurrencyInput label="Title Fees" value={loan.titleFees} onChange={(v) => updateLoan(activeTab, 'titleFees', v)} />
              <CurrencyInput label="Other Third Party" value={loan.otherThirdParty} onChange={(v) => updateLoan(activeTab, 'otherThirdParty', v)} />
            </FieldRow>
          </FieldGroup>

          {/* Government Fees */}
          <FieldGroup title="Government Fees">
            <FieldRow columns={2}>
              <CurrencyInput label="Recording Fee" value={loan.recordingFee} onChange={(v) => updateLoan(activeTab, 'recordingFee', v)} />
              <CurrencyInput label="Transfer Tax" value={loan.transferTax} onChange={(v) => updateLoan(activeTab, 'transferTax', v)} />
            </FieldRow>
          </FieldGroup>

          {/* Prepaids & Escrow */}
          <FieldGroup title="Prepaids & Escrow">
            <FieldRow columns={4}>
              <CurrencyInput label="Prepaid Insurance" value={loan.prepaidInsurance} onChange={(v) => updateLoan(activeTab, 'prepaidInsurance', v)} />
              <CurrencyInput label="Prepaid Interest" value={loan.prepaidInterest} onChange={(v) => updateLoan(activeTab, 'prepaidInterest', v)} />
              <CurrencyInput label="Escrow Tax" value={loan.escrowTax} onChange={(v) => updateLoan(activeTab, 'escrowTax', v)} />
              <CurrencyInput label="Escrow Insurance" value={loan.escrowInsurance} onChange={(v) => updateLoan(activeTab, 'escrowInsurance', v)} />
            </FieldRow>
          </FieldGroup>

          {/* Payoffs */}
          <FieldGroup title="Payoffs">
            <FieldRow columns={3}>
              <CurrencyInput label="1st Mortgage Payoff" value={loan.payoff1st} onChange={(v) => updateLoan(activeTab, 'payoff1st', v)} />
              <CurrencyInput label="2nd Mortgage Payoff" value={loan.payoff2nd} onChange={(v) => updateLoan(activeTab, 'payoff2nd', v)} />
              <CurrencyInput label="Other Payoffs" value={loan.payoffOther} onChange={(v) => updateLoan(activeTab, 'payoffOther', v)} />
            </FieldRow>
          </FieldGroup>

          {/* Credits & Monthly */}
          <FieldGroup title="Credits & Down Payment">
            <FieldRow columns={3}>
              <CurrencyInput label="Down Payment" value={loan.downPayment} onChange={(v) => updateLoan(activeTab, 'downPayment', v)} />
              <CurrencyInput label="Seller Credits" value={loan.sellerCredits} onChange={(v) => updateLoan(activeTab, 'sellerCredits', v)} />
              <CurrencyInput label="Lender Credits" value={loan.lenderCredits} onChange={(v) => updateLoan(activeTab, 'lenderCredits', v)} />
            </FieldRow>
          </FieldGroup>

          <FieldGroup title="Monthly Payments (Escrow)">
            <FieldRow columns={4}>
              <CurrencyInput label="Monthly Tax" value={loan.monthlyTax} onChange={(v) => updateLoan(activeTab, 'monthlyTax', v)} />
              <CurrencyInput label="Monthly Insurance" value={loan.monthlyInsurance} onChange={(v) => updateLoan(activeTab, 'monthlyInsurance', v)} />
              <CurrencyInput label="Monthly MI" value={loan.monthlyMI} onChange={(v) => updateLoan(activeTab, 'monthlyMI', v)} />
              <CurrencyInput label="Monthly HOA" value={loan.monthlyHOA} onChange={(v) => updateLoan(activeTab, 'monthlyHOA', v)} />
            </FieldRow>
          </FieldGroup>
        </div>
      )}
    </CalculatorShell>
  );
}
