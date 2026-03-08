import { useState, type ReactNode, type FormEvent } from 'react';
import { Calculator, RotateCcw, Save, Printer } from 'lucide-react';

interface CalculatorShellProps {
  title: string;
  description?: string;
  children: ReactNode;
  results?: ReactNode;
  onCalculate?: () => void;
  onReset?: () => void;
  onSave?: () => void;
  onPrint?: () => void;
  isCalculated?: boolean;
  calculateLabel?: string;
}

export default function CalculatorShell({
  title,
  description,
  children,
  results,
  onCalculate,
  onReset,
  onSave,
  onPrint,
  isCalculated = false,
  calculateLabel = 'Calculate',
}: CalculatorShellProps) {
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onCalculate) {
      onCalculate();
      setShowResults(true);
    }
  };

  const handleReset = () => {
    setShowResults(false);
    if (onReset) onReset();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isCalculated && onSave && (
            <button
              onClick={onSave}
              className="btn-secondary flex items-center gap-2 text-sm"
              type="button"
            >
              <Save className="w-4 h-4" />
              Save Report
            </button>
          )}
          {isCalculated && onPrint && (
            <button
              onClick={onPrint}
              className="btn-secondary flex items-center gap-2 text-sm"
              type="button"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {children}

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              {calculateLabel}
            </button>
            {onReset && (
              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Results */}
      {(showResults || isCalculated) && results && (
        <div className="space-y-6">{results}</div>
      )}
    </div>
  );
}
