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
  calculateBuyVsRent,
  type BuyVsRentParams,
  type BuyVsRentResult,
} from '@/utils/calculations/buyVsRent';

const TERM_OPTIONS = [15, 20, 25, 30];

interface FormState {
  homePrice: number;
  downPaymentPercent: number;
  mortgageRatePercent: number;
  termYears: number;
  propertyTaxRatePercent: number;
  homeInsurance: number;
  maintenanceRatePercent: number;
  homeAppreciationPercent: number;
  monthlyRent: number;
  rentIncreasePercent: number;
  investmentReturnPercent: number;
  marginalTaxRatePercent: number;
  yearsToAnalyze: number;
}

const DEFAULTS: FormState = {
  homePrice: 375000,
  downPaymentPercent: 20,
  mortgageRatePercent: 6.5,
  termYears: 30,
  propertyTaxRatePercent: 1.2,
  homeInsurance: 1500,
  maintenanceRatePercent: 1.0,
  homeAppreciationPercent: 3.0,
  monthlyRent: 2000,
  rentIncreasePercent: 3.0,
  investmentReturnPercent: 7.0,
  marginalTaxRatePercent: 24,
  yearsToAnalyze: 10,
};

export default function BuyVsRentCalc() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<BuyVsRentResult | null>(null);
  const [visibleRows, setVisibleRows] = useState(10);

  const calculate = useCallback(() => {
    const params: BuyVsRentParams = {
      homePrice: form.homePrice,
      downPaymentPercent: form.downPaymentPercent,
      mortgageRate: form.mortgageRatePercent / 100,
      termYears: form.termYears,
      propertyTaxRate: form.propertyTaxRatePercent / 100,
      homeInsurance: form.homeInsurance,
      maintenanceRate: form.maintenanceRatePercent / 100,
      homeAppreciation: form.homeAppreciationPercent / 100,
      monthlyRent: form.monthlyRent,
      rentIncrease: form.rentIncreasePercent / 100,
      investmentReturn: form.investmentReturnPercent / 100,
      marginalTaxRate: form.marginalTaxRatePercent / 100,
      yearsToAnalyze: form.yearsToAnalyze,
    };
    setResult(calculateBuyVsRent(params));
    setVisibleRows(10);
  }, [form]);

  const reset = useCallback(() => {
    setForm(DEFAULTS);
    setResult(null);
    setVisibleRows(10);
  }, []);

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <CalculatorShell
      title="Buy vs Rent Calculator"
      description="Compare the financial impact of buying a home versus renting over time"
      onCalculate={calculate}
      onReset={reset}
      isCalculated={!!result}
      results={
        result ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <ResultCard
                label="Break-Even Year"
                value={result.breakEvenYear ? `Year ${result.breakEvenYear}` : 'Never'}
                variant={result.breakEvenYear ? 'success' : 'warning'}
                subValue={result.breakEvenYear ? 'Buying becomes cheaper' : 'Renting wins over period'}
              />
              <ResultCard
                label="Total Buy Cost"
                value={formatCurrency(result.totalBuyCost)}
                subValue={`Over ${form.yearsToAnalyze} years`}
              />
              <ResultCard
                label="Total Rent Cost"
                value={formatCurrency(result.totalRentCost)}
                subValue={`Over ${form.yearsToAnalyze} years`}
              />
            </div>

            {/* Year-by-Year Comparison */}
            <ResultSection
              title="Year-by-Year Comparison"
              description="Monthly costs, equity, and net advantage of buying"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 pr-3 text-xs font-medium text-gray-500 uppercase">Year</th>
                      <th className="text-right py-2 pr-3 text-xs font-medium text-gray-500 uppercase">Buy/mo</th>
                      <th className="text-right py-2 pr-3 text-xs font-medium text-gray-500 uppercase">Rent/mo</th>
                      <th className="text-right py-2 pr-3 text-xs font-medium text-gray-500 uppercase">Home Value</th>
                      <th className="text-right py-2 pr-3 text-xs font-medium text-gray-500 uppercase">Home Equity</th>
                      <th className="text-right py-2 pr-3 text-xs font-medium text-gray-500 uppercase">Renter Invest.</th>
                      <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase">Net Advantage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {result.years.slice(0, visibleRows).map((yr) => (
                      <tr key={yr.year} className="hover:bg-gray-50">
                        <td className="py-1.5 pr-3 font-medium text-gray-700">{yr.year}</td>
                        <td className="py-1.5 pr-3 text-right font-mono">{formatCurrency(yr.monthlyCostBuy, 0)}</td>
                        <td className="py-1.5 pr-3 text-right font-mono">{formatCurrency(yr.monthlyCostRent, 0)}</td>
                        <td className="py-1.5 pr-3 text-right font-mono">{formatCurrency(yr.homeValue, 0)}</td>
                        <td className="py-1.5 pr-3 text-right font-mono text-blue-600">{formatCurrency(yr.homeEquity, 0)}</td>
                        <td className="py-1.5 pr-3 text-right font-mono text-purple-600">{formatCurrency(yr.investmentValue, 0)}</td>
                        <td className={`py-1.5 text-right font-mono font-medium ${yr.netAdvantage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {yr.netAdvantage > 0 ? '+' : ''}{formatCurrency(yr.netAdvantage, 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {visibleRows < result.years.length && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleRows((v) => v + 10)}
                    className="btn-secondary text-sm"
                  >
                    Show More ({result.years.length - visibleRows} remaining)
                  </button>
                </div>
              )}
            </ResultSection>

            {/* Calculations */}
            <ShowCalculations
              title="Show Calculations"
              steps={[
                { label: 'Down Payment', formula: `${formatCurrency(form.homePrice)} x ${form.downPaymentPercent}%`, value: formatCurrency(form.homePrice * form.downPaymentPercent / 100) },
                { label: 'Loan Amount', value: formatCurrency(form.homePrice * (1 - form.downPaymentPercent / 100)) },
                { label: 'Annual Property Tax', formula: `Home Value x ${form.propertyTaxRatePercent}%`, value: formatCurrency(form.homePrice * form.propertyTaxRatePercent / 100) },
                { label: 'Starting Monthly Rent', value: formatCurrency(form.monthlyRent) },
                { label: 'Annual Rent Increase', value: formatPercent(form.rentIncreasePercent) },
                { label: 'Home Appreciation', value: formatPercent(form.homeAppreciationPercent) },
              ]}
            />
          </>
        ) : undefined
      }
    >
      {/* Home Purchase Details */}
      <FieldGroup title="Home Purchase Details">
        <FieldRow columns={4}>
          <CurrencyInput
            label="Home Price"
            value={form.homePrice}
            onChange={(v) => update('homePrice', v)}
          />
          <PercentInput
            label="Down Payment %"
            value={form.downPaymentPercent}
            onChange={(v) => update('downPaymentPercent', v)}
            step={1}
          />
          <PercentInput
            label="Mortgage Rate"
            value={form.mortgageRatePercent}
            onChange={(v) => update('mortgageRatePercent', v)}
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

      {/* Ownership Costs */}
      <FieldGroup title="Ownership Costs">
        <FieldRow columns={3}>
          <PercentInput
            label="Property Tax Rate"
            value={form.propertyTaxRatePercent}
            onChange={(v) => update('propertyTaxRatePercent', v)}
            step={0.1}
          />
          <CurrencyInput
            label="Annual Home Insurance"
            value={form.homeInsurance}
            onChange={(v) => update('homeInsurance', v)}
          />
          <PercentInput
            label="Annual Maintenance Rate"
            value={form.maintenanceRatePercent}
            onChange={(v) => update('maintenanceRatePercent', v)}
            step={0.25}
          />
        </FieldRow>
      </FieldGroup>

      {/* Rental Details */}
      <FieldGroup title="Rental Details">
        <FieldRow columns={2}>
          <CurrencyInput
            label="Monthly Rent"
            value={form.monthlyRent}
            onChange={(v) => update('monthlyRent', v)}
          />
          <PercentInput
            label="Annual Rent Increase"
            value={form.rentIncreasePercent}
            onChange={(v) => update('rentIncreasePercent', v)}
            step={0.5}
          />
        </FieldRow>
      </FieldGroup>

      {/* Assumptions */}
      <FieldGroup title="Assumptions">
        <FieldRow columns={4}>
          <PercentInput
            label="Home Appreciation"
            value={form.homeAppreciationPercent}
            onChange={(v) => update('homeAppreciationPercent', v)}
            step={0.5}
          />
          <PercentInput
            label="Investment Return"
            value={form.investmentReturnPercent}
            onChange={(v) => update('investmentReturnPercent', v)}
            step={0.5}
          />
          <PercentInput
            label="Marginal Tax Rate"
            value={form.marginalTaxRatePercent}
            onChange={(v) => update('marginalTaxRatePercent', v)}
            step={1}
          />
          <div>
            <label className="label">Years to Analyze</label>
            <input
              type="number"
              className="input-field"
              value={form.yearsToAnalyze}
              onChange={(e) => update('yearsToAnalyze', Number(e.target.value))}
              min={1}
              max={30}
            />
          </div>
        </FieldRow>
      </FieldGroup>
    </CalculatorShell>
  );
}
