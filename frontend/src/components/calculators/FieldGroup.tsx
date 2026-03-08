import type { ReactNode } from 'react';

interface FieldGroupProps {
  title: string;
  description?: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
}

export default function FieldGroup({
  title,
  description,
  children,
  className = '',
}: FieldGroupProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border-b border-gray-200 pb-2">
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

interface YearGroupProps {
  year: number | string;
  label?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Specialized FieldGroup for income calculator year sections.
 */
export function YearGroup({ year, label, children, className = '' }: YearGroupProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 text-sm font-semibold">
          {label || `Year ${year}`}
        </span>
      </div>
      <div className="space-y-3 pl-0 sm:pl-4">{children}</div>
    </div>
  );
}

interface EntityGroupProps {
  index: number;
  label?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Specialized FieldGroup for income calculator entity sections (e.g., Business 1, Partnership 2).
 */
export function EntityGroup({
  index,
  label,
  children,
  className = '',
}: EntityGroupProps) {
  return (
    <div
      className={`bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-4 ${className}`}
    >
      <h4 className="text-sm font-semibold text-gray-700">
        {label || `Entity ${index + 1}`}
      </h4>
      {children}
    </div>
  );
}
