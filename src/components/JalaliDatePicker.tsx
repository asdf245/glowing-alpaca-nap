import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import moment from "moment-jalaali";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

moment.loadPersian({ dialect: 'persian-modern' });

interface JalaliDatePickerProps {
  label: string;
  value: string; // YYYY.MM.DD format
  onChange: (date: string) => void;
  required?: boolean;
}

export function JalaliDatePicker({ label, value, onChange, required = false }: JalaliDatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? moment(value, 'YYYY.MM.DD').toDate() : undefined
  );

  React.useEffect(() => {
    if (date) {
      const jalaliDate = moment(date).format('YYYY.MM.DD');
      if (jalaliDate !== value) {
        onChange(jalaliDate);
      }
    } else if (value) {
        // If value is set externally but date state is undefined, sync it
        setDate(moment(value, 'YYYY.MM.DD').toDate());
    }
  }, [date, value, onChange]);

  const handleSelect = (newDate: Date | undefined) => {
    setDate(newDate);
  };

  return (
    <div className="grid gap-1.5">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? value : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
            // Note: Full Jalali calendar UI requires specialized components, 
            // but we handle the data conversion using moment-jalaali.
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}