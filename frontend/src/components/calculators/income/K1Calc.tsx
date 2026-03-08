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
  calculateK1Partnership,
  type K1PartnershipParams,
  type K1PartnershipResult,
  type PartnershipK1Result,
} from '@/utils/calculations/income';
import { Plus, Trash2 } from 'lucide-react';

interface PartnershipK1Year {
  ordinaryIncome: number;
  rentalRealEstate: number;
  otherRentalIncome: number;
  guaranteedPayments: number;
}

const EMPTY_YEAR: PartnershipK1Year = {
  ordinaryIncome: 0,
  rentalRealEstate: 0,
  otherRentalIncome: 0,
  guaranteedPayments: 0,
};

interface EntityState {
  year1: PartnershipK1Year;
  year2: PartnershipK1Year;
}

const YEAR_FIELDS: { key: keyof PartnershipK1Year; label: string }[] = [
  { key: 'ordinaryIncome', label: 'Ordinary Income' },
  { key: 'rentalRealEstate', label: 'Rental Real Estate Income' },
  { key: 'otherRentalIncome', label: 'Other Rental Income' },
  { key: 'guaranteedPayments', label: 'Guaranteed Payments' },
];

export default function K1Calc() {
  const [entities, setEntities] = useState<EntityState[]>([
    { year1: { ...EMPTY_YEAR }, year2: { ...EMPTY_YEAR } },
  ]);
  const [result, setResult] = useState<K1PartnershipResult | null>(null);

  const addEntity = () => {
    if (entities.length >= 4) return;
    setEntities((prev) => [...prev, { year1: { ...EMPTY_YEAR }, year2: { ...EMPTY_YEAR } }]);
  };

  const removeEntity = (index: number) => {
    if (entities.length <= 1) return;
    setEntities((prev) => prev.filter((_, i) => i !== index));
  };

  const updateYear = (
    entityIndex: number,
    yearKey: 'year1' | 'year2',
    field: keyof PartnershipK1Year,
    value: number
  ) => {
    setEntities((prev) =>
      prev.map((ent, i) =>
        i === entityIndex
          ? { ...ent, [yearKey]: { ...ent[yearKey], [field]: value } }
          : ent
      )
    );
  };

  const calculate = useCallback(() => {
    const params: K1PartnershipParams = { entities };
    setResult(calculateK1Partnership(params));
  }, [entities]);

  const reset = useCallback(() => {
    setEntities([{ year1: { ...EMPTY_YEAR }, year2: { ...EMPTY_YEAR } }]);
    setResult(null);
  }, []);

  return (
    <IncomeCalcShell
      title="K-1 Partnership Income Calculator"
      description="Calculate qualifying partnership K-1 income with Fannie Mae averaging (up to 4 entities)"
      onCalculate={calculate}
      onReset={reset}
      isCalculated={!!result}
      monthlyIncome={result?.combinedMonthly}
      method={result && result.entities.length > 0 ? (result.entities[0].policy.method === 'average' ? '2-Year Average' : 'Most Recent Year') : undefined}
      results={
        result ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {result.entities.map((ent, i) => (
                <ResultCard
                  key={i}
                  label={`K-1 Entity ${i + 1}`}
                  value={formatCurrency(ent.monthly)}
                  subValue="/month"
                  variant="primary"
                />
              ))}
              <ResultCard label="Combined Monthly" value={formatCurrency(result.combinedMonthly)} variant="success" />
            </div>

            <ResultSection title="K-1 Entity Breakdown">
              <div className="space-y-6 divide-y divide-gray-100">
                {result.entities.map((ent, i) => {
                  const methodLabel = ent.policy.method === 'average' ? '2-Year Average' : 'Most Recent Year';
                  return (
                    <div key={i} className={i > 0 ? 'pt-4' : ''}>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-gray-700">K-1 Entity {i + 1}</h4>
                          <MethodBadge method={methodLabel} />
                        </div>
                        <ResultTable
                          rows={[
                            { label: 'Year 1 Total', value: formatCurrency(ent.year1Total) },
                            { label: 'Year 2 Total', value: formatCurrency(ent.year2Total) },
                            { label: 'Monthly Income', value: formatCurrency(ent.monthly), highlight: true },
                          ]}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ResultSection>

            <ShowCalculations
              steps={result.entities.flatMap((ent, i) => [
                { label: `Entity ${i + 1} Year 1`, formula: 'Ordinary + RentalRE + OtherRental + Guaranteed', value: formatCurrency(ent.year1Total) },
                { label: `Entity ${i + 1} Year 2`, value: formatCurrency(ent.year2Total) },
                { label: `Entity ${i + 1} Monthly`, value: formatCurrency(ent.monthly) },
              ]).concat([
                { label: 'Combined Monthly', value: formatCurrency(result.combinedMonthly) },
              ])}
            />
          </>
        ) : undefined
      }
    >
      {entities.map((ent, entIdx) => (
        <EntityGroup key={entIdx} index={entIdx} label={`K-1 Entity ${entIdx + 1}`}>
          {entities.length > 1 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => removeEntity(entIdx)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <YearGroup year={1} label="Year 1 (Most Recent)">
              {YEAR_FIELDS.map((f) => (
                <CurrencyInput
                  key={f.key}
                  label={f.label}
                  value={ent.year1[f.key]}
                  onChange={(v) => updateYear(entIdx, 'year1', f.key, v)}
                />
              ))}
            </YearGroup>
            <YearGroup year={2} label="Year 2 (Prior)">
              {YEAR_FIELDS.map((f) => (
                <CurrencyInput
                  key={f.key}
                  label={f.label}
                  value={ent.year2[f.key]}
                  onChange={(v) => updateYear(entIdx, 'year2', f.key, v)}
                />
              ))}
            </YearGroup>
          </div>
        </EntityGroup>
      ))}

      {entities.length < 4 && (
        <button
          type="button"
          onClick={addEntity}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add K-1 Entity
        </button>
      )}
    </IncomeCalcShell>
  );
}
