import { useState, useCallback } from 'react';
import IncomeCalcShell, { MethodBadge } from '@/components/calculators/income/IncomeCalcShell';
import ResultCard from '@/components/calculators/ResultCard';
import ResultSection from '@/components/calculators/ResultSection';
import { ResultTable } from '@/components/calculators/ResultSection';
import ShowCalculations from '@/components/calculators/ShowCalculations';
import CurrencyInput from '@/components/calculators/CurrencyInput';
import FieldRow from '@/components/calculators/FieldRow';
import FieldGroup from '@/components/calculators/FieldGroup';
import { YearGroup, EntityGroup } from '@/components/calculators/FieldGroup';
import { formatCurrency } from '@/utils/formatters';
import {
  calculateScheduleB,
  type ScheduleBParams,
  type ScheduleBResult,
} from '@/utils/calculations/income';
import { Plus, Trash2 } from 'lucide-react';

interface InstitutionState {
  interestYear1: number;
  interestYear2: number;
  taxExemptInterestYear1: number;
  taxExemptInterestYear2: number;
  dividendsYear1: number;
  dividendsYear2: number;
}

const EMPTY_INSTITUTION: InstitutionState = {
  interestYear1: 0,
  interestYear2: 0,
  taxExemptInterestYear1: 0,
  taxExemptInterestYear2: 0,
  dividendsYear1: 0,
  dividendsYear2: 0,
};

export default function ScheduleBCalc() {
  const [institutions, setInstitutions] = useState<InstitutionState[]>([
    { ...EMPTY_INSTITUTION },
  ]);
  const [result, setResult] = useState<ScheduleBResult | null>(null);

  const addInstitution = () => {
    if (institutions.length >= 3) return;
    setInstitutions((prev) => [...prev, { ...EMPTY_INSTITUTION }]);
  };

  const removeInstitution = (index: number) => {
    if (institutions.length <= 1) return;
    setInstitutions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateInst = (
    index: number,
    field: keyof InstitutionState,
    value: number
  ) => {
    setInstitutions((prev) =>
      prev.map((inst, i) =>
        i === index ? { ...inst, [field]: value } : inst
      )
    );
  };

  const calculate = useCallback(() => {
    const params: ScheduleBParams = { institutions };
    setResult(calculateScheduleB(params));
  }, [institutions]);

  const reset = useCallback(() => {
    setInstitutions([{ ...EMPTY_INSTITUTION }]);
    setResult(null);
  }, []);

  const methodLabel = result?.policy.method === 'average' ? '2-Year Average' : 'Most Recent Year';

  return (
    <IncomeCalcShell
      title="Schedule B Interest & Dividends"
      description="Calculate qualifying interest and dividend income from up to 3 institutions"
      onCalculate={calculate}
      onReset={reset}
      isCalculated={!!result}
      monthlyIncome={result?.monthly}
      method={result ? methodLabel : undefined}
      results={
        result ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ResultCard label="Year 1 Total" value={formatCurrency(result.totalYear1)} />
              <ResultCard label="Year 2 Total" value={formatCurrency(result.totalYear2)} />
              <ResultCard label="Monthly Income" value={formatCurrency(result.monthly)} variant="success" />
            </div>

            <ResultSection title="Institution Breakdown">
              <div className="space-y-4">
                {result.institutions.map((inst, i) => (
                  <div key={i} className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">Institution {i + 1}</h4>
                    <ResultTable
                      rows={[
                        { label: 'Year 1 Total', value: formatCurrency(inst.year1Total) },
                        { label: 'Year 2 Total', value: formatCurrency(inst.year2Total) },
                      ]}
                    />
                  </div>
                ))}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700">Overall</h4>
                    <MethodBadge method={methodLabel} />
                  </div>
                  <ResultTable
                    rows={[
                      { label: 'Total Year 1', value: formatCurrency(result.totalYear1) },
                      { label: 'Total Year 2', value: formatCurrency(result.totalYear2) },
                      { label: 'Monthly Income', value: formatCurrency(result.monthly), highlight: true },
                    ]}
                  />
                </div>
              </div>
            </ResultSection>

            <ShowCalculations
              steps={[
                { label: 'Total Year 1', formula: 'Sum of Interest + Tax-Exempt Interest + Dividends', value: formatCurrency(result.totalYear1) },
                { label: 'Total Year 2', value: formatCurrency(result.totalYear2) },
                { label: 'Method', value: methodLabel },
                { label: 'Monthly Income', value: formatCurrency(result.monthly) },
              ]}
            />
          </>
        ) : undefined
      }
    >
      {institutions.map((inst, idx) => (
        <EntityGroup key={idx} index={idx} label={`Institution ${idx + 1}`}>
          {institutions.length > 1 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => removeInstitution(idx)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <YearGroup year={1} label="Year 1 (Most Recent)">
              <CurrencyInput label="Interest" value={inst.interestYear1} onChange={(v) => updateInst(idx, 'interestYear1', v)} />
              <CurrencyInput label="Tax-Exempt Interest" value={inst.taxExemptInterestYear1} onChange={(v) => updateInst(idx, 'taxExemptInterestYear1', v)} />
              <CurrencyInput label="Dividends" value={inst.dividendsYear1} onChange={(v) => updateInst(idx, 'dividendsYear1', v)} />
            </YearGroup>
            <YearGroup year={2} label="Year 2 (Prior)">
              <CurrencyInput label="Interest" value={inst.interestYear2} onChange={(v) => updateInst(idx, 'interestYear2', v)} />
              <CurrencyInput label="Tax-Exempt Interest" value={inst.taxExemptInterestYear2} onChange={(v) => updateInst(idx, 'taxExemptInterestYear2', v)} />
              <CurrencyInput label="Dividends" value={inst.dividendsYear2} onChange={(v) => updateInst(idx, 'dividendsYear2', v)} />
            </YearGroup>
          </div>
        </EntityGroup>
      ))}

      {institutions.length < 3 && (
        <button
          type="button"
          onClick={addInstitution}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Institution
        </button>
      )}
    </IncomeCalcShell>
  );
}
