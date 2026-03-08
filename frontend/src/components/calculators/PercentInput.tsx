import { forwardRef, type InputHTMLAttributes, useCallback } from 'react';
import { parseNum } from '@/utils/formatters';

interface PercentInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  hint?: string;
  /** Step increment (default 0.125 for mortgage rates) */
  step?: number;
}

const PercentInput = forwardRef<HTMLInputElement, PercentInputProps>(
  ({ label, value, onChange, error, hint, step = 0.125, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        onChange(parseNum(raw));
      },
      [onChange]
    );

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="number"
            step={step}
            value={value || ''}
            onChange={handleChange}
            className={`input-field pr-8 ${
              error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
            } ${className}`}
            {...props}
          />
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 text-sm pointer-events-none">
            %
          </span>
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      </div>
    );
  }
);

PercentInput.displayName = 'PercentInput';

export default PercentInput;
