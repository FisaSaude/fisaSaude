import { Label } from './ui/label';
import { Input } from './ui/input';
import { AlertCircle } from 'lucide-react';
import { ComponentProps } from 'react';

interface FormFieldProps extends ComponentProps<typeof Input> {
  label: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
}

export function FormField({
  label,
  error,
  helperText,
  isRequired,
  id,
  className,
  ...inputProps
}: FormFieldProps) {
  const inputId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className={className}>
      <Label htmlFor={inputId}>
        {label}
        {isRequired && (
          <span className="text-destructive ml-1" aria-label="obrigatório">
            *
          </span>
        )}
      </Label>
      <Input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        aria-required={isRequired}
        {...inputProps}
      />
      {error && (
        <div
          id={errorId}
          className="flex items-center gap-1.5 mt-2 text-sm text-destructive"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle size={16} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
      {!error && helperText && (
        <div
          id={helperId}
          className="mt-2 text-sm text-muted-foreground"
        >
          {helperText}
        </div>
      )}
    </div>
  );
}
