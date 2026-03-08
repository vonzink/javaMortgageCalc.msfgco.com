import type { ReactNode } from 'react';

interface ResultSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export default function ResultSection({
  title,
  description,
  children,
  className = '',
}: ResultSectionProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        {description && (
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

interface ResultRowProps {
  label: string;
  value: string | number;
  highlight?: boolean;
  className?: string;
}

export function ResultRow({
  label,
  value,
  highlight = false,
  className = '',
}: ResultRowProps) {
  return (
    <div
      className={`flex items-center justify-between py-2 ${
        highlight ? 'font-semibold text-gray-900' : 'text-gray-700'
      } ${className}`}
    >
      <span className="text-sm">{label}</span>
      <span className={`text-sm font-mono ${highlight ? 'text-brand-700' : ''}`}>
        {value}
      </span>
    </div>
  );
}

interface ResultTableProps {
  rows: { label: string; value: string | number; highlight?: boolean }[];
  className?: string;
}

export function ResultTable({ rows, className = '' }: ResultTableProps) {
  return (
    <div className={`divide-y divide-gray-100 ${className}`}>
      {rows.map((row, i) => (
        <ResultRow key={i} {...row} />
      ))}
    </div>
  );
}
