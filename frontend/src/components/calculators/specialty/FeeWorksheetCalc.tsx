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
  calculateFeeWorksheet,
  type FeeWorksheetParams,
  type FeeWorksheetResult,
} from '@/utils/calculations/feeWorksheet';

const DEFAULTS: FeeWorksheetParams = {
  propertyValue: 0,
  loanAmount: 0,
  rate: 0,
  termMonths: 360,
  loanPurpose: 'Purchase',
  // Origination
  origFee: 0,
  discountPts: 0,
  processingFee: 0,
  underwritingFee: 0,
  // Cannot Shop
  appraisalFee: 0,
  creditReportFee: 0,
  techFee: 0,
  voeFee: 0,
  floodFee: 0,
  taxServiceFee: 0,
  mersFee: 0,
  // Can Shop
  eRecordingFee: 0,
  titleCPL: 0,
  titleLenders: 0,
  titleSettlement: 0,
  titleTaxCert: 0,
  titleOwners: 0,
  wireFee: 0,
  // Government
  recordingFee: 0,
  transferTax: 0,
  // Prepaids
  hazInsAmt: 0,
  hazInsMonths: 14,
  prepaidIntPerDiem: 0,
  prepaidIntDays: 15,
  // Escrow
  escTaxAmt: 0,
  escTaxMonths: 3,
  escInsAmt: 0,
  escInsMonths: 3,
  // Other
  other1: 0,
  other2: 0,
  // Monthly
  monthlyMI: 0,
  monthlyHOA: 0,
  // Credits
  sellerCredits: 0,
  lenderCredits: 0,
};

interface FormState extends Omit<FeeWorksheetParams, 'rate'> {
  ratePercent: number; // user enters as percent, convert to decimal for calc
}

export default function FeeWorksheetCalc() {
  const [form, setForm] = useState<FormState>({
    ...DEFAULTS,
    ratePercent: 6.5,
  });
  const [result, setResult] = useState<FeeWorksheetResult | null>(null);

  const calculate = useCallback(() => {
    const params: FeeWorksheetParams = {
      ...form,
      rate: form.ratePercent / 100,
    };
    setResult(calculateFeeWorksheet(params));
  }, [form]);

  const reset = useCallback(() => {
    setForm({ ...DEFAULTS, ratePercent: 6.5 });
    setResult(null);
  }, []);

  const update = (field: keyof FormState, value: number | string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <CalculatorShell
      title="Fee Worksheet"
      description="Complete closing cost worksheet with origination fees, title charges, prepaids, escrow, and borrower funds calculation."
      onCalculate={calculate}
      onReset={reset}
      isCalculated={!!result}
      results={
        result ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ResultCard
                label="Est. Closing Costs"
                value={formatCurrency(result.estClosing)}
                variant="default"
              />
              <ResultCard
                label="Est. Prepaids"
                value={formatCurrency(result.estPrepaids)}
                variant="default"
              />
              <ResultCard
                label="Funds from Borrower"
                value={formatCurrency(result.fundsFromYou)}
                variant="primary"
              />
              <ResultCard
                label="Monthly Payment"
                value={formatCurrency(result.totalMonthly)}
                subValue={`P&I: ${formatCurrency(result.monthlyPI)}`}
                variant="success"
              />
            </div>

            {/* Section A - Origination */}
            <ResultSection title="Section A: Origination Charges">
              <ResultTable
                rows={[
                  { label: 'Origination Fee', value: formatCurrency(form.origFee) },
                  { label: 'Discount Points', value: formatCurrency(form.discountPts) },
                  { label: 'Processing Fee', value: formatCurrency(form.processingFee) },
                  { label: 'Underwriting Fee', value: formatCurrency(form.underwritingFee) },
                  { label: 'Total Origination', value: formatCurrency(result.origTotal), highlight: true },
                ]}
              />
            </ResultSection>

            {/* Section B - Cannot Shop */}
            <ResultSection title="Section B: Services You Cannot Shop For">
              <ResultTable
                rows={[
                  { label: 'Appraisal', value: formatCurrency(form.appraisalFee) },
                  { label: 'Credit Report', value: formatCurrency(form.creditReportFee) },
                  { label: 'Technology Fee', value: formatCurrency(form.techFee) },
                  { label: 'VOE Fee', value: formatCurrency(form.voeFee) },
                  { label: 'Flood Certification', value: formatCurrency(form.floodFee) },
                  { label: 'Tax Service', value: formatCurrency(form.taxServiceFee) },
                  { label: 'MERS Fee', value: formatCurrency(form.mersFee) },
                  { label: 'Total', value: formatCurrency(result.cannotShopTotal), highlight: true },
                ]}
              />
            </ResultSection>

            {/* Section C - Can Shop */}
            <ResultSection title="Section C: Services You Can Shop For">
              <ResultTable
                rows={[
                  { label: 'E-Recording Fee', value: formatCurrency(form.eRecordingFee) },
                  { label: 'Title - CPL', value: formatCurrency(form.titleCPL) },
                  { label: "Title - Lender's Policy", value: formatCurrency(form.titleLenders) },
                  { label: 'Title - Settlement Fee', value: formatCurrency(form.titleSettlement) },
                  { label: 'Title - Tax Certificate', value: formatCurrency(form.titleTaxCert) },
                  { label: "Title - Owner's Policy", value: formatCurrency(form.titleOwners) },
                  { label: 'Wire Fee', value: formatCurrency(form.wireFee) },
                  { label: 'Total', value: formatCurrency(result.canShopTotal), highlight: true },
                ]}
              />
            </ResultSection>

            {/* Government */}
            <ResultSection title="Section E: Taxes and Government Fees">
              <ResultTable
                rows={[
                  { label: 'Recording Fee', value: formatCurrency(form.recordingFee) },
                  { label: 'Transfer Tax', value: formatCurrency(form.transferTax) },
                  { label: 'Total', value: formatCurrency(result.govTotal), highlight: true },
                ]}
              />
            </ResultSection>

            {/* Prepaids */}
            <ResultSection title="Section F: Prepaids">
              <ResultTable
                rows={[
                  {
                    label: `Hazard Insurance (${form.hazInsMonths} mo)`,
                    value: formatCurrency(result.prepaidHazIns),
                  },
                  {
                    label: `Prepaid Interest (${form.prepaidIntDays} days)`,
                    value: formatCurrency(result.prepaidInterest),
                  },
                  { label: 'Total Prepaids', value: formatCurrency(result.prepaidsTotal), highlight: true },
                ]}
              />
            </ResultSection>

            {/* Escrow */}
            <ResultSection title="Section G: Initial Escrow">
              <ResultTable
                rows={[
                  {
                    label: `Tax Escrow (${form.escTaxMonths} mo)`,
                    value: formatCurrency(result.escrowTax),
                  },
                  {
                    label: `Insurance Escrow (${form.escInsMonths} mo)`,
                    value: formatCurrency(result.escrowIns),
                  },
                  { label: 'Total Escrow', value: formatCurrency(result.escrowTotal), highlight: true },
                ]}
              />
            </ResultSection>

            {/* Other */}
            {result.otherTotal > 0 && (
              <ResultSection title="Section H: Other">
                <ResultTable
                  rows={[
                    ...(form.other1 > 0 ? [{ label: 'Other 1', value: formatCurrency(form.other1) }] : []),
                    ...(form.other2 > 0 ? [{ label: 'Other 2', value: formatCurrency(form.other2) }] : []),
                    { label: 'Total Other', value: formatCurrency(result.otherTotal), highlight: true },
                  ]}
                />
              </ResultSection>
            )}

            {/* Total Summary */}
            <ResultSection title="Cash to Close Summary">
              <ResultTable
                rows={[
                  ...(form.loanPurpose === 'Purchase'
                    ? [{ label: 'Purchase Price', value: formatCurrency(form.propertyValue) }]
                    : []),
                  { label: 'Estimated Closing Costs', value: formatCurrency(result.estClosing) },
                  { label: 'Origination / Discount', value: formatCurrency(result.discount) },
                  { label: 'Estimated Prepaids & Escrow', value: formatCurrency(result.estPrepaids) },
                  { label: 'Total Due', value: formatCurrency(result.totalDue), highlight: true },
                  { label: 'Loan Amount', value: `- ${formatCurrency(result.totalPaid)}` },
                  ...(form.sellerCredits > 0
                    ? [{ label: 'Seller Credits', value: `- ${formatCurrency(form.sellerCredits)}` }]
                    : []),
                  ...(form.lenderCredits > 0
                    ? [{ label: 'Lender Credits', value: `- ${formatCurrency(form.lenderCredits)}` }]
                    : []),
                  {
                    label: 'Estimated Funds from Borrower',
                    value: formatCurrency(result.fundsFromYou),
                    highlight: true,
                  },
                ]}
              />
            </ResultSection>

            {/* Monthly Payment */}
            <ResultSection title="Monthly Payment Breakdown">
              <ResultTable
                rows={[
                  { label: 'Principal & Interest', value: formatCurrency(result.monthlyPI) },
                  { label: 'Hazard Insurance', value: formatCurrency(form.hazInsAmt) },
                  { label: 'Property Taxes', value: formatCurrency(form.escTaxAmt) },
                  { label: 'Mortgage Insurance', value: formatCurrency(form.monthlyMI) },
                  { label: 'HOA Dues', value: formatCurrency(form.monthlyHOA) },
                  {
                    label: 'Total Monthly Payment',
                    value: formatCurrency(result.totalMonthly),
                    highlight: true,
                  },
                ]}
              />
            </ResultSection>
          </>
        ) : undefined
      }
    >
      {/* Loan Info */}
      <FieldGroup title="Loan Information">
        <FieldRow columns={3}>
          <CurrencyInput
            label="Property Value / Purchase Price"
            value={form.propertyValue}
            onChange={(v) => update('propertyValue', v)}
          />
          <CurrencyInput
            label="Loan Amount"
            value={form.loanAmount}
            onChange={(v) => update('loanAmount', v)}
          />
          <PercentInput
            label="Interest Rate"
            value={form.ratePercent}
            onChange={(v) => update('ratePercent', v)}
          />
        </FieldRow>
        <FieldRow columns={2}>
          <div className="w-full">
            <label className="label">Term</label>
            <select
              className="input-field"
              value={form.termMonths}
              onChange={(e) => update('termMonths', Number(e.target.value))}
            >
              <option value={180}>15 years (180 months)</option>
              <option value={240}>20 years (240 months)</option>
              <option value={300}>25 years (300 months)</option>
              <option value={360}>30 years (360 months)</option>
            </select>
          </div>
          <div className="w-full">
            <label className="label">Loan Purpose</label>
            <select
              className="input-field"
              value={form.loanPurpose}
              onChange={(e) => update('loanPurpose', e.target.value)}
            >
              <option value="Purchase">Purchase</option>
              <option value="Refinance">Refinance</option>
            </select>
          </div>
        </FieldRow>
      </FieldGroup>

      {/* Section A - Origination */}
      <FieldGroup title="Section A: Origination Charges">
        <FieldRow columns={4}>
          <CurrencyInput
            label="Origination Fee"
            value={form.origFee}
            onChange={(v) => update('origFee', v)}
          />
          <CurrencyInput
            label="Discount Points"
            value={form.discountPts}
            onChange={(v) => update('discountPts', v)}
          />
          <CurrencyInput
            label="Processing Fee"
            value={form.processingFee}
            onChange={(v) => update('processingFee', v)}
          />
          <CurrencyInput
            label="Underwriting Fee"
            value={form.underwritingFee}
            onChange={(v) => update('underwritingFee', v)}
          />
        </FieldRow>
      </FieldGroup>

      {/* Section B - Cannot Shop */}
      <FieldGroup title="Section B: Services You Cannot Shop For">
        <FieldRow columns={4}>
          <CurrencyInput
            label="Appraisal"
            value={form.appraisalFee}
            onChange={(v) => update('appraisalFee', v)}
          />
          <CurrencyInput
            label="Credit Report"
            value={form.creditReportFee}
            onChange={(v) => update('creditReportFee', v)}
          />
          <CurrencyInput
            label="Technology Fee"
            value={form.techFee}
            onChange={(v) => update('techFee', v)}
          />
          <CurrencyInput
            label="VOE Fee"
            value={form.voeFee}
            onChange={(v) => update('voeFee', v)}
          />
        </FieldRow>
        <FieldRow columns={3}>
          <CurrencyInput
            label="Flood Cert"
            value={form.floodFee}
            onChange={(v) => update('floodFee', v)}
          />
          <CurrencyInput
            label="Tax Service"
            value={form.taxServiceFee}
            onChange={(v) => update('taxServiceFee', v)}
          />
          <CurrencyInput
            label="MERS Fee"
            value={form.mersFee}
            onChange={(v) => update('mersFee', v)}
          />
        </FieldRow>
      </FieldGroup>

      {/* Section C - Can Shop */}
      <FieldGroup title="Section C: Services You Can Shop For">
        <FieldRow columns={4}>
          <CurrencyInput
            label="E-Recording"
            value={form.eRecordingFee}
            onChange={(v) => update('eRecordingFee', v)}
          />
          <CurrencyInput
            label="Title - CPL"
            value={form.titleCPL}
            onChange={(v) => update('titleCPL', v)}
          />
          <CurrencyInput
            label="Title - Lender's"
            value={form.titleLenders}
            onChange={(v) => update('titleLenders', v)}
          />
          <CurrencyInput
            label="Title - Settlement"
            value={form.titleSettlement}
            onChange={(v) => update('titleSettlement', v)}
          />
        </FieldRow>
        <FieldRow columns={3}>
          <CurrencyInput
            label="Title - Tax Cert"
            value={form.titleTaxCert}
            onChange={(v) => update('titleTaxCert', v)}
          />
          <CurrencyInput
            label="Title - Owner's"
            value={form.titleOwners}
            onChange={(v) => update('titleOwners', v)}
          />
          <CurrencyInput
            label="Wire Fee"
            value={form.wireFee}
            onChange={(v) => update('wireFee', v)}
          />
        </FieldRow>
      </FieldGroup>

      {/* Section E - Government */}
      <FieldGroup title="Section E: Taxes & Government Fees">
        <FieldRow columns={2}>
          <CurrencyInput
            label="Recording Fee"
            value={form.recordingFee}
            onChange={(v) => update('recordingFee', v)}
          />
          <CurrencyInput
            label="Transfer Tax"
            value={form.transferTax}
            onChange={(v) => update('transferTax', v)}
          />
        </FieldRow>
      </FieldGroup>

      {/* Section F - Prepaids */}
      <FieldGroup title="Section F: Prepaids">
        <FieldRow columns={2}>
          <CurrencyInput
            label="Hazard Insurance (monthly)"
            value={form.hazInsAmt}
            onChange={(v) => update('hazInsAmt', v)}
          />
          <div className="w-full">
            <label className="label">Hazard Insurance Months</label>
            <input
              type="number"
              className="input-field"
              value={form.hazInsMonths || ''}
              onChange={(e) => update('hazInsMonths', Number(e.target.value) || 0)}
              min={0}
              max={24}
            />
          </div>
        </FieldRow>
        <FieldRow columns={2}>
          <CurrencyInput
            label="Prepaid Interest Per Diem"
            value={form.prepaidIntPerDiem}
            onChange={(v) => update('prepaidIntPerDiem', v)}
          />
          <div className="w-full">
            <label className="label">Prepaid Interest Days</label>
            <input
              type="number"
              className="input-field"
              value={form.prepaidIntDays || ''}
              onChange={(e) => update('prepaidIntDays', Number(e.target.value) || 0)}
              min={0}
              max={31}
            />
          </div>
        </FieldRow>
      </FieldGroup>

      {/* Section G - Escrow */}
      <FieldGroup title="Section G: Initial Escrow">
        <FieldRow columns={2}>
          <CurrencyInput
            label="Tax Escrow (monthly)"
            value={form.escTaxAmt}
            onChange={(v) => update('escTaxAmt', v)}
          />
          <div className="w-full">
            <label className="label">Tax Escrow Months</label>
            <input
              type="number"
              className="input-field"
              value={form.escTaxMonths || ''}
              onChange={(e) => update('escTaxMonths', Number(e.target.value) || 0)}
              min={0}
              max={12}
            />
          </div>
        </FieldRow>
        <FieldRow columns={2}>
          <CurrencyInput
            label="Insurance Escrow (monthly)"
            value={form.escInsAmt}
            onChange={(v) => update('escInsAmt', v)}
          />
          <div className="w-full">
            <label className="label">Insurance Escrow Months</label>
            <input
              type="number"
              className="input-field"
              value={form.escInsMonths || ''}
              onChange={(e) => update('escInsMonths', Number(e.target.value) || 0)}
              min={0}
              max={12}
            />
          </div>
        </FieldRow>
      </FieldGroup>

      {/* Other */}
      <FieldGroup title="Section H: Other Costs">
        <FieldRow columns={2}>
          <CurrencyInput
            label="Other 1"
            value={form.other1}
            onChange={(v) => update('other1', v)}
          />
          <CurrencyInput
            label="Other 2"
            value={form.other2}
            onChange={(v) => update('other2', v)}
          />
        </FieldRow>
      </FieldGroup>

      {/* Monthly */}
      <FieldGroup title="Monthly Costs (for payment breakdown)">
        <FieldRow columns={2}>
          <CurrencyInput
            label="Monthly MI"
            value={form.monthlyMI}
            onChange={(v) => update('monthlyMI', v)}
          />
          <CurrencyInput
            label="Monthly HOA"
            value={form.monthlyHOA}
            onChange={(v) => update('monthlyHOA', v)}
          />
        </FieldRow>
      </FieldGroup>

      {/* Credits */}
      <FieldGroup title="Credits">
        <FieldRow columns={2}>
          <CurrencyInput
            label="Seller Credits"
            value={form.sellerCredits}
            onChange={(v) => update('sellerCredits', v)}
          />
          <CurrencyInput
            label="Lender Credits"
            value={form.lenderCredits}
            onChange={(v) => update('lenderCredits', v)}
          />
        </FieldRow>
      </FieldGroup>
    </CalculatorShell>
  );
}
