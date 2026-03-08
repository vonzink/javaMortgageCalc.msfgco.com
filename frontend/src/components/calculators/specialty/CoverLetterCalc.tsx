import { useState, useCallback, useRef } from 'react';
import CalculatorShell from '@/components/calculators/CalculatorShell';
import ResultSection from '@/components/calculators/ResultSection';
import CurrencyInput from '@/components/calculators/CurrencyInput';
import PercentInput from '@/components/calculators/PercentInput';
import FieldRow from '@/components/calculators/FieldRow';
import FieldGroup from '@/components/calculators/FieldGroup';
import { formatCurrency, formatPercent, calcMonthlyPayment } from '@/utils/formatters';
import { Printer } from 'lucide-react';

interface CoverLetterData {
  borrowerName: string;
  propertyAddress: string;
  loanAmount: number;
  rate: number;
  term: number;
  loanType: string;
  loanOfficerName: string;
  loanOfficerNmls: string;
  companyName: string;
  companyNmls: string;
  date: string;
}

const DEFAULTS: CoverLetterData = {
  borrowerName: '',
  propertyAddress: '',
  loanAmount: 0,
  rate: 6.5,
  term: 30,
  loanType: 'Conventional',
  loanOfficerName: '',
  loanOfficerNmls: '',
  companyName: 'Main Street Financial Group',
  companyNmls: '',
  date: new Date().toISOString().split('T')[0],
};

const LOAN_TYPES = ['Conventional', 'FHA', 'VA', 'USDA'];

function CoverLetterPreview({ data }: { data: CoverLetterData }) {
  const payment = data.loanAmount > 0 && data.rate > 0
    ? calcMonthlyPayment(data.loanAmount, data.rate / 100, data.term)
    : 0;

  const formattedDate = data.date
    ? new Date(data.date + 'T00:00:00').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="bg-white rounded-lg border border-gray-200 print:border-0 print:shadow-none">
      {/* Header */}
      <div className="border-b-4 border-brand-600 px-8 py-6 print:px-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {data.companyName || 'Main Street Financial Group'}
        </h2>
        {data.companyNmls && (
          <p className="text-sm text-gray-500 mt-1">NMLS #{data.companyNmls}</p>
        )}
      </div>

      {/* Body */}
      <div className="px-8 py-6 print:px-6 space-y-6">
        {/* Date */}
        <p className="text-sm text-gray-600">{formattedDate}</p>

        {/* Greeting */}
        <div className="space-y-4">
          <p className="text-gray-800">
            Dear {data.borrowerName || '[Borrower Name]'},
          </p>
          <p className="text-gray-700 leading-relaxed">
            Thank you for choosing {data.companyName || '[Company]'} for your mortgage
            needs. We are pleased to present the following loan summary for your review.
          </p>
        </div>

        {/* Loan Details Table */}
        <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
          <div className="bg-brand-600 text-white px-6 py-3">
            <h3 className="text-lg font-semibold">Loan Summary</h3>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="flex justify-between px-6 py-3">
              <span className="text-sm font-medium text-gray-600">Property Address</span>
              <span className="text-sm text-gray-900 text-right max-w-[60%]">
                {data.propertyAddress || '--'}
              </span>
            </div>
            <div className="flex justify-between px-6 py-3">
              <span className="text-sm font-medium text-gray-600">Loan Type</span>
              <span className="text-sm text-gray-900">{data.loanType}</span>
            </div>
            <div className="flex justify-between px-6 py-3">
              <span className="text-sm font-medium text-gray-600">Loan Amount</span>
              <span className="text-sm font-semibold text-gray-900">
                {data.loanAmount > 0 ? formatCurrency(data.loanAmount, 0) : '--'}
              </span>
            </div>
            <div className="flex justify-between px-6 py-3">
              <span className="text-sm font-medium text-gray-600">Interest Rate</span>
              <span className="text-sm text-gray-900">
                {data.rate > 0 ? formatPercent(data.rate) : '--'}
              </span>
            </div>
            <div className="flex justify-between px-6 py-3">
              <span className="text-sm font-medium text-gray-600">Loan Term</span>
              <span className="text-sm text-gray-900">{data.term} years</span>
            </div>
            <div className="flex justify-between px-6 py-3 bg-brand-50">
              <span className="text-sm font-semibold text-brand-700">Estimated P&I Payment</span>
              <span className="text-sm font-bold text-brand-700">
                {payment > 0 ? formatCurrency(payment) : '--'}
              </span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-xs text-gray-500 leading-relaxed border-t border-gray-200 pt-4">
          <p>
            This is not a commitment to lend. All loan programs, terms, and rates are
            subject to change without notice. Final terms are subject to borrower
            qualification, property appraisal, and underwriting approval. Interest rates
            and payments shown are estimates only and may vary based on market conditions
            at the time of rate lock.
          </p>
        </div>

        {/* Loan Officer Info */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-800 font-semibold">
            {data.loanOfficerName || '[Loan Officer Name]'}
          </p>
          {data.loanOfficerNmls && (
            <p className="text-sm text-gray-500">NMLS #{data.loanOfficerNmls}</p>
          )}
          <p className="text-sm text-gray-500">
            {data.companyName || '[Company Name]'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CoverLetterCalc() {
  const [data, setData] = useState<CoverLetterData>({ ...DEFAULTS });
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const generate = useCallback(() => {
    setShowPreview(true);
  }, []);

  const reset = useCallback(() => {
    setData({ ...DEFAULTS });
    setShowPreview(false);
  }, []);

  const update = (field: keyof CoverLetterData, value: CoverLetterData[keyof CoverLetterData]) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <CalculatorShell
      title="Cover Letter Generator"
      description="Generate a branded loan presentation cover letter for your borrowers."
      onCalculate={generate}
      onReset={reset}
      calculateLabel="Generate Preview"
      isCalculated={showPreview}
      onPrint={showPreview ? handlePrint : undefined}
      results={
        showPreview ? (
          <>
            {/* Print button at top */}
            <div className="flex items-center justify-end print:hidden">
              <button
                type="button"
                onClick={handlePrint}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Printer className="w-4 h-4" />
                Print Cover Letter
              </button>
            </div>

            {/* Preview */}
            <div ref={printRef} className="print:m-0">
              <CoverLetterPreview data={data} />
            </div>
          </>
        ) : undefined
      }
    >
      {/* Borrower & Property */}
      <FieldGroup title="Borrower & Property">
        <FieldRow columns={2}>
          <div className="w-full">
            <label className="label">Borrower Name</label>
            <input
              type="text"
              className="input-field"
              value={data.borrowerName}
              onChange={(e) => update('borrowerName', e.target.value)}
              placeholder="John & Jane Smith"
            />
          </div>
          <div className="w-full">
            <label className="label">Property Address</label>
            <input
              type="text"
              className="input-field"
              value={data.propertyAddress}
              onChange={(e) => update('propertyAddress', e.target.value)}
              placeholder="123 Main St, Springfield, IL 62701"
            />
          </div>
        </FieldRow>
      </FieldGroup>

      {/* Loan Details */}
      <FieldGroup title="Loan Details">
        <FieldRow columns={4}>
          <CurrencyInput
            label="Loan Amount"
            value={data.loanAmount}
            onChange={(v) => update('loanAmount', v)}
          />
          <PercentInput
            label="Interest Rate"
            value={data.rate}
            onChange={(v) => update('rate', v)}
          />
          <div className="w-full">
            <label className="label">Term (years)</label>
            <select
              className="input-field"
              value={data.term}
              onChange={(e) => update('term', Number(e.target.value))}
            >
              <option value={15}>15 years</option>
              <option value={20}>20 years</option>
              <option value={25}>25 years</option>
              <option value={30}>30 years</option>
            </select>
          </div>
          <div className="w-full">
            <label className="label">Loan Type</label>
            <select
              className="input-field"
              value={data.loanType}
              onChange={(e) => update('loanType', e.target.value)}
            >
              {LOAN_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </FieldRow>
      </FieldGroup>

      {/* Loan Officer & Company */}
      <FieldGroup title="Loan Officer & Company">
        <FieldRow columns={2}>
          <div className="w-full">
            <label className="label">Loan Officer Name</label>
            <input
              type="text"
              className="input-field"
              value={data.loanOfficerName}
              onChange={(e) => update('loanOfficerName', e.target.value)}
              placeholder="Jane Doe"
            />
          </div>
          <div className="w-full">
            <label className="label">Loan Officer NMLS #</label>
            <input
              type="text"
              className="input-field"
              value={data.loanOfficerNmls}
              onChange={(e) => update('loanOfficerNmls', e.target.value)}
              placeholder="123456"
            />
          </div>
        </FieldRow>
        <FieldRow columns={2}>
          <div className="w-full">
            <label className="label">Company Name</label>
            <input
              type="text"
              className="input-field"
              value={data.companyName}
              onChange={(e) => update('companyName', e.target.value)}
            />
          </div>
          <div className="w-full">
            <label className="label">Company NMLS #</label>
            <input
              type="text"
              className="input-field"
              value={data.companyNmls}
              onChange={(e) => update('companyNmls', e.target.value)}
              placeholder="789012"
            />
          </div>
        </FieldRow>
      </FieldGroup>

      {/* Date */}
      <FieldGroup title="Date">
        <FieldRow columns={1}>
          <div className="w-full max-w-xs">
            <label className="label">Letter Date</label>
            <input
              type="date"
              className="input-field"
              value={data.date}
              onChange={(e) => update('date', e.target.value)}
            />
          </div>
        </FieldRow>
      </FieldGroup>
    </CalculatorShell>
  );
}
