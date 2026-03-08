import type { ReactNode } from 'react';
import CalculatorShell from '@/components/calculators/CalculatorShell';
import { formatCurrency } from '@/utils/formatters';

interface IncomeCalcShellProps {
  title: string;
  description?: string;
  children: ReactNode;
  results?: ReactNode;
  monthlyIncome?: number;
  method?: string;
  onCalculate?: () => void;
  onReset?: () => void;
  isCalculated?: boolean;
}

function MethodBadge({ method }: { method: string }) {
  const is2Year = method.toLowerCase().includes('average');
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
        is2Year
          ? 'bg-blue-100 text-blue-700'
          : 'bg-green-100 text-green-700'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          is2Year ? 'bg-blue-500' : 'bg-green-500'
        }`}
      />
      {method}
    </span>
  );
}

export default function IncomeCalcShell({
  title,
  description,
  children,
  results,
  monthlyIncome,
  method,
  onCalculate,
  onReset,
  isCalculated = false,
}: IncomeCalcShellProps) {
  const incomeHeader =
    isCalculated && monthlyIncome !== undefined ? (
      <div className="bg-gradient-to-r from-brand-50 to-brand-100 rounded-lg border border-brand-200 p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-brand-600 uppercase tracking-wide font-medium">
              Total Qualifying Monthly Income
            </p>
            <p className="text-2xl font-bold text-brand-800 mt-0.5">
              {formatCurrency(monthlyIncome)}
            </p>
          </div>
          {method && <MethodBadge method={method} />}
        </div>
      </div>
    ) : null;

  return (
    <CalculatorShell
      title={title}
      description={description}
      onCalculate={onCalculate}
      onReset={onReset}
      isCalculated={isCalculated}
      results={
        results ? (
          <>
            {incomeHeader}
            {results}
          </>
        ) : undefined
      }
    >
      {children}
    </CalculatorShell>
  );
}

export { MethodBadge };
