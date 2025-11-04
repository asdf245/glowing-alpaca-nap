import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X, Plus } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Column<T> {
  header: string;
  accessor: keyof T;
  type: 'text' | 'number' | 'textarea' | 'select' | 'calculated';
  unit?: string;
  options?: { value: string; label: string }[];
  colSpan?: number;
  width?: string;
  calculate?: (row: T, index: number, allRows: T[]) => string | number;
}

interface DynamicTableProps<T extends { id: string }> {
  name: string; // Field array name in RHF
  columns: Column<T>[];
  defaultRow: Omit<T, 'id'>;
  maxRows: number;
  note?: string;
}

export function DynamicTable<T extends { id: string }>({
  name,
  columns,
  defaultRow,
  maxRows,
  note,
}: DynamicTableProps<T>) {
  const { control, register, watch, setValue, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: name,
  });

  const currentRows = watch(name) as T[];

  const handleAddRow = () => {
    if (fields.length < maxRows) {
      append({ ...defaultRow, id: Date.now().toString() } as T);
    }
  };

  const getError = (index: number, accessor: keyof T) => {
    const fieldError = (errors as any)[name]?.[index]?.[accessor];
    return fieldError?.message;
  };

  const renderCell = (row: T, col: Column<T>, index: number) => {
    const fieldName = `${name}.${index}.${String(col.accessor)}`;
    const error = getError(index, col.accessor);
    const value = currentRows[index]?.[col.accessor];

    if (col.type === 'calculated' && col.calculate) {
      const calculatedValue = col.calculate(row, index, currentRows);
      return (
        <div className="text-green-700 dark:text-green-300 font-semibold text-sm">
          {calculatedValue}
        </div>
      );
    }

    const inputClasses = cn(
      "h-8 p-1 text-xs",
      error && "border-destructive focus-visible:ring-destructive"
    );

    if (col.type === 'textarea') {
      return (
        <Textarea
          {...register(fieldName)}
          className={inputClasses}
          rows={1}
        />
      );
    }

    if (col.type === 'select' && col.options) {
      return (
        <Select
          value={value as string || ''}
          onValueChange={(val) => setValue(fieldName as any, val)}
        >
          <SelectTrigger className={inputClasses}>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {col.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        {...register(fieldName, {
          valueAsNumber: col.type === 'number',
        })}
        type={col.type === 'number' ? 'text' : col.type} // Use text to allow partial input
        inputMode={col.type === 'number' ? 'decimal' : undefined}
        className={inputClasses}
      />
    );
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {columns.map((col, idx) => (
              <TableHead key={idx} style={{ width: col.width }} colSpan={col.colSpan}>
                {col.header} {col.unit && <span className="text-xs font-normal">({col.unit})</span>}
              </TableHead>
            ))}
            <TableHead className="w-[50px] text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field, index) => (
            <TableRow key={field.id} className={cn(
                Object.keys((errors as any)[name]?.[index] || {}).length > 0 && "border-l-4 border-destructive"
            )}>
              {columns.map((col, colIndex) => (
                <TableCell key={colIndex} className="p-1 align-top">
                  {renderCell(currentRows[index], col, index)}
                  {getError(index, col.accessor) && (
                    <p className="text-xs text-destructive mt-0.5">{getError(index, col.accessor)}</p>
                  )}
                </TableCell>
              ))}
              <TableCell className="p-1 text-right align-top">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => remove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center">
        <Button
          onClick={handleAddRow}
          disabled={fields.length >= maxRows}
          variant="outline"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Row
        </Button>
        <div className="text-sm text-muted-foreground">
          {fields.length} of {maxRows} entries
        </div>
      </div>
      {note && (
        <p className="text-xs text-muted-foreground mt-2">{note}</p>
      )}
    </div>
  );
}