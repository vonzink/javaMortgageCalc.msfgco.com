import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CalculationStep {
  label: string;
  formula?: string;
  value: string | number;
}

interface ShowCalculationsProps {
  title?: string;
  steps: CalculationStep[];
  defaultOpen?: boolean;
  className?: string;
}

export default function ShowCalculations({
  title = 'Show Calculations',
  steps,
  defaultOpen = false,
  className = '',
}: ShowCalculationsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (steps.length === 0) return null;

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
        type="button"
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 bg-white space-y-2">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex items-start justify-between gap-4 py-1.5 text-sm"
            >
              <div className="min-w-0">
                <span className="text-gray-700">{step.label}</span>
                {step.formula && (
                  <span className="text-gray-400 ml-2 font-mono text-xs">
                    {step.formula}
                  </span>
                )}
              </div>
              <span className="font-mono text-gray-900 font-medium flex-shrink-0">
                {step.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ShowCalculationsGroupProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function ShowCalculationsGroup({
  title,
  children,
  defaultOpen = false,
  className = '',
}: ShowCalculationsGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
        type="button"
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {isOpen && <div className="p-4 bg-white">{children}</div>}
    </div>
  );
}
