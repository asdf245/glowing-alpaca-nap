import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  unit?: string;
  required?: boolean;
  type: 'text' | 'number' | 'textarea' | 'select';
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  error?: string;
  options?: { value: string; label: string }[];
  readOnly?: boolean;
  isCalculated?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  unit,
  required = false,
  type,
  value,
  onChange,
  error,
  options,
  readOnly = false,
  isCalculated = false,
}) => {
  const id = label.toLowerCase().replace(/[^a-z0-9]/g, '-');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (type === 'number') {
      const rawValue = e.target.value;
      // Allow empty string for optional number fields
      if (rawValue === '') {
        onChange('');
        return;
      }
      const numValue = parseFloat(rawValue);
      onChange(isNaN(numValue) ? rawValue : numValue);
    } else {
      onChange(e.target.value);
    }
  };

  const inputClasses = cn(
    "w-full",
    error && "border-destructive focus-visible:ring-destructive",
    isCalculated && "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-semibold"
  );

  const displayValue = (value === 0 && type === 'number') || value === undefined ? '' : value;

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <Textarea
          id={id}
          value={displayValue as string || ''}
          onChange={handleChange}
          readOnly={readOnly}
          className={inputClasses}
        />
      );
    }
    if (type === 'select' && options) {
      return (
        <Select
          value={displayValue as string || ''}
          onValueChange={(val) => onChange(val)}
          disabled={readOnly}
        >
          <SelectTrigger className={inputClasses}>
            <SelectValue placeholder={`Select ${label}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    
    // Default to Input
    return (
      <Input
        id={id}
        type={type === 'number' ? 'text' : type} // Use text input for number to allow partial input before validation
        inputMode={type === 'number' ? 'decimal' : undefined}
        value={displayValue}
        onChange={handleChange}
        readOnly={readOnly}
        className={inputClasses}
      />
    );
  };

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>
        {label}
        {unit && <span className="text-muted-foreground ml-1">({unit})</span>}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {renderInput()}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
};