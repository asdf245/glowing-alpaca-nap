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
  // Convert the external Jalali date string (value) to a Gregorian Date object for the Calendar UI
  const selectedDate = React.useMemo(() => {
    return value ? moment(value, 'YYYY.MM.DD').toDate() : undefined;
  }, [value]);

  const handleSelect = (newDate: Date | undefined) => {
    if (newDate) {
      // Convert the selected Gregorian Date back to Jalali string format (YYYY.MM.DD)
      const jalaliDate = moment(newDate).format('YYYY.MM.DD');
      onChange(jalaliDate);
    } else {
      // Handle clearing the date if needed (though usually dates are required)
      onChange('');
    }
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
            selected={selectedDate}
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