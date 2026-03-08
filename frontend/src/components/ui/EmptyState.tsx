import type { ReactNode } from 'react';
import { FileText } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`text-center py-12 bg-white rounded-lg border border-gray-200 ${className}`}
    >
      <div className="flex justify-center mb-4">
        {icon || <FileText className="w-12 h-12 text-gray-300" />}
      </div>
      <h3 className="text-lg font-medium text-gray-700">{title}</h3>
      {description && (
        <p className="text-gray-500 mt-1 max-w-sm mx-auto">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
