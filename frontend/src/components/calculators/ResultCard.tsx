import type { ReactNode } from 'react';

interface ResultCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variantClasses = {
  default: 'bg-gray-50 border-gray-200',
  primary: 'bg-brand-50 border-brand-200',
  success: 'bg-green-50 border-green-200',
  warning: 'bg-yellow-50 border-yellow-200',
  danger: 'bg-red-50 border-red-200',
};

const valueColorClasses = {
  default: 'text-gray-900',
  primary: 'text-brand-700',
  success: 'text-green-700',
  warning: 'text-yellow-700',
  danger: 'text-red-700',
};

export default function ResultCard({
  label,
  value,
  subValue,
  icon,
  variant = 'default',
  className = '',
}: ResultCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 ${variantClasses[variant]} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            {label}
          </p>
          <p className={`text-xl font-bold mt-1 ${valueColorClasses[variant]}`}>
            {value}
          </p>
          {subValue && (
            <p className="text-sm text-gray-500 mt-0.5">{subValue}</p>
          )}
        </div>
        {icon && (
          <div className="text-gray-400 flex-shrink-0">{icon}</div>
        )}
      </div>
    </div>
  );
}
