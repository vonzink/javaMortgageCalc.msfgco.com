import { useState, useCallback } from 'react';
import IncomeCalcShell, { MethodBadge } from '@/components/calculators/income/IncomeCalcShell';
import ResultCard from '@/components/calculators/ResultCard';
import ResultSection from '@/components/calculators/ResultSection';
import { ResultTable } from '@/components/calculators/ResultSection';
import ShowCalculations from '@/components/calculators/ShowCalculations';
import CurrencyInput from '@/components/calculators/CurrencyInput';
import FieldRow from '@/components/calculators/FieldRow';
import FieldGroup from '@/components/calculators/FieldGroup';
import { YearGroup } from '@/components/calculators/FieldGroup';
import { formatCurrency } from '@/utils/formatters';
import {
  calculateForm1040,
  type Form1040Params,
  type Form1040Result,
  type Form1040SectionResult,
} from '@/utils/calculations/income';

const DEFAULT_PARAMS: Form1040Params = {
  w2Year1: [0, 0, 0, 0],
  w2Year2: [0, 0, 0, 0],
  alimonyYear1: 0,
  alimonyYear2: 0,
  pensionIRAYear1: [0, 0, 0],
  pensionIRAYear2: [0, 0, 0],
  pensionAnnYear1: [0, 0, 0],
  pensionAnnYear2: [0, 0, 0],
  unemploymentYear1: 0,
  unemploymentYear2: 0,
  socialSecurityYear1: 0,
  socialSecurityYear2: 0,
};

function SectionResultDisplay({
  title,
  section,
}: {
  title: string;
  section: Form1040SectionResult;
}) {
  const methodLabel = section.policy.method === 'average' ? '2-Year Average' : 'Most Recent Year';
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
        <MethodBadge method={methodLabel} />
      </div>
      <ResultTable
        rows={[
          { label: 'Year 1 Total', value: formatCurrency(section.year1) },
          { label: 'Year 2 Total', value: formatCurrency(section.year2) },
          { label: 'Monthly Income', value: formatCurrency(section.policy.monthly), highlight: true },
        ]}
      />
    </div>
  );
}

export default function Form1040Calc() {
  const [params, setParams] = useState<Form1040Params>(DEFAULT_PARAMS);
  const [result, setResult] = useState<Form1040Result | null>(null);

  const updateArray = (
    field: keyof Form1040Params,
    index: number,
    value: number
  ) => {
    setParams((prev) => {
      const arr = [...(prev[field] as number[])];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const updateField = (field: keyof Form1040Params, value: number) => {
    setParams((prev) => ({ ...prev, [field]: value }));
  };

  const calculate = useCallback(() => {
    setResult(calculateForm1040(params));
  }, [params]);

  const reset = useCallback(() => {
    setParams(DEFAULT_PARAMS);
    setResult(null);
  }, []);

  return (
    <IncomeCalcShell
      title="Form 1040 Income Calculator"
      description="Calculate qualifying income from W-2 wages, alimony, pension, unemployment, and Social Security"
      onCalculate={calculate}
      onReset={reset}
      isCalculated={!!result}
      monthlyIncome={result?.combinedMonthly}
      method={result ? 'Fannie Mae 1040 Analysis' : undefined}
      results={
        result ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <ResultCard label="W-2 Wages" value={formatCurrency(result.w2.policy.monthly)} subValue="/month" variant="primary" />
              <ResultCard label="Alimony" value={formatCurrency(result.alimony.policy.monthly)} subValue="/month" />
              <ResultCard label="Pension" value={formatCurrency(result.pension.policy.monthly)} subValue="/month" />
              <ResultCard label="Unemployment" value={formatCurrency(result.unemployment.policy.monthly)} subValue="/month" />
              <ResultCard label="Social Security" value={formatCurrency(result.socialSecurity.policy.monthly)} subValue="/month" />
              <ResultCard label="Combined" value={formatCurrency(result.combinedMonthly)} subValue="/month" variant="success" />
            </div>

            <ResultSection title="Income Breakdown">
              <div className="space-y-6 divide-y divide-gray-100">
                <SectionResultDisplay title="W-2 Wages" section={result.w2} />
                <div className="pt-4"><SectionResultDisplay title="Alimony" section={result.alimony} /></div>
                <div className="pt-4"><SectionResultDisplay title="Pension / Annuity" section={result.pension} /></div>
                <div className="pt-4"><SectionResultDisplay title="Unemployment" section={result.unemployment} /></div>
                <div className="pt-4"><SectionResultDisplay title="Social Security" section={result.socialSecurity} /></div>
              </div>
            </ResultSection>

            <ShowCalculations
              steps={[
                { label: 'W-2 Monthly', formula: result.w2.policy.method === 'average' ? `(${formatCurrency(result.w2.year1)} + ${formatCurrency(result.w2.year2)}) / 24` : `${formatCurrency(result.w2.year1)} / 12`, value: formatCurrency(result.w2.policy.monthly) },
                { label: 'Alimony Monthly', value: formatCurrency(result.alimony.policy.monthly) },
                { label: 'Pension Monthly', value: formatCurrency(result.pension.policy.monthly) },
                { label: 'Unemployment Monthly', value: formatCurrency(result.unemployment.policy.monthly) },
                { label: 'Social Security Monthly', value: formatCurrency(result.socialSecurity.policy.monthly) },
                { label: 'Combined Monthly', value: formatCurrency(result.combinedMonthly) },
              ]}
            />
          </>
        ) : undefined
      }
    >
      {/* W-2 Wages */}
      <FieldGroup title="W-2 Wages" description="Up to 4 employers">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <YearGroup year={1} label="Year 1 (Most Recent)">
            {[0, 1, 2, 3].map((i) => (
              <CurrencyInput
                key={i}
                label={`Employer ${i + 1}`}
                value={params.w2Year1[i]}
                onChange={(v) => updateArray('w2Year1', i, v)}
              />
            ))}
          </YearGroup>
          <YearGroup year={2} label="Year 2 (Prior)">
            {[0, 1, 2, 3].map((i) => (
              <CurrencyInput
                key={i}
                label={`Employer ${i + 1}`}
                value={params.w2Year2[i]}
                onChange={(v) => updateArray('w2Year2', i, v)}
              />
            ))}
          </YearGroup>
        </div>
      </FieldGroup>

      {/* Alimony */}
      <FieldGroup title="Alimony Received">
        <FieldRow columns={2}>
          <CurrencyInput
            label="Year 1"
            value={params.alimonyYear1}
            onChange={(v) => updateField('alimonyYear1', v)}
          />
          <CurrencyInput
            label="Year 2"
            value={params.alimonyYear2}
            onChange={(v) => updateField('alimonyYear2', v)}
          />
        </FieldRow>
      </FieldGroup>

      {/* Pension/Annuity */}
      <FieldGroup title="Pension / Annuity" description="Up to 3 sources - IRA (Line 15) + Pensions (Line 16)">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <YearGroup year={1} label="Year 1 (Most Recent)">
            {[0, 1, 2].map((i) => (
              <FieldRow key={i} columns={2}>
                <CurrencyInput
                  label={`Source ${i + 1} IRA`}
                  value={params.pensionIRAYear1[i]}
                  onChange={(v) => updateArray('pensionIRAYear1', i, v)}
                />
                <CurrencyInput
                  label={`Source ${i + 1} Pension`}
                  value={params.pensionAnnYear1[i]}
                  onChange={(v) => updateArray('pensionAnnYear1', i, v)}
                />
              </FieldRow>
            ))}
          </YearGroup>
          <YearGroup year={2} label="Year 2 (Prior)">
            {[0, 1, 2].map((i) => (
              <FieldRow key={i} columns={2}>
                <CurrencyInput
                  label={`Source ${i + 1} IRA`}
                  value={params.pensionIRAYear2[i]}
                  onChange={(v) => updateArray('pensionIRAYear2', i, v)}
                />
                <CurrencyInput
                  label={`Source ${i + 1} Pension`}
                  value={params.pensionAnnYear2[i]}
                  onChange={(v) => updateArray('pensionAnnYear2', i, v)}
                />
              </FieldRow>
            ))}
          </YearGroup>
        </div>
      </FieldGroup>

      {/* Unemployment */}
      <FieldGroup title="Unemployment Compensation">
        <FieldRow columns={2}>
          <CurrencyInput
            label="Year 1"
            value={params.unemploymentYear1}
            onChange={(v) => updateField('unemploymentYear1', v)}
          />
          <CurrencyInput
            label="Year 2"
            value={params.unemploymentYear2}
            onChange={(v) => updateField('unemploymentYear2', v)}
          />
        </FieldRow>
      </FieldGroup>

      {/* Social Security */}
      <FieldGroup title="Social Security Benefits">
        <FieldRow columns={2}>
          <CurrencyInput
            label="Year 1"
            value={params.socialSecurityYear1}
            onChange={(v) => updateField('socialSecurityYear1', v)}
          />
          <CurrencyInput
            label="Year 2"
            value={params.socialSecurityYear2}
            onChange={(v) => updateField('socialSecurityYear2', v)}
          />
        </FieldRow>
      </FieldGroup>
    </IncomeCalcShell>
  );
}
