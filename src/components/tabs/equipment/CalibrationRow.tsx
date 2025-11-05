import React from 'react';
import { Label } from '@/components/ui/label';
import { JalaliDatePicker } from '@/components/JalaliDatePicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReportData } from '@/types/report';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form'; // <-- Added import

interface CalibrationRowProps {
    label: string;
    equipmentKey: keyof ReportData['equipmentCalibration'];
    watch: UseFormWatch<ReportData>; // <-- Updated type
    setValue: UseFormSetValue<ReportData>; // <-- Updated type
}

const RESULT_OPTIONS = [
    { value: 'OK', label: 'OK' },
    { value: 'Failed', label: 'Failed' },
];

export const CalibrationRow: React.FC<CalibrationRowProps> = ({ label, equipmentKey, watch, setValue }) => {
    const updateField = (field: 'testDate' | 'calibratedDate' | 'result', value: string) => {
        // Note: We use setValue directly here as we are inside the RHF context via useFormContext in the parent.
        // Casting the path to 'any' to satisfy RHF when using template literals for nested fields.
        setValue(`equipmentCalibration.${equipmentKey}.${field}` as any, value, { shouldValidate: true });
    };

    return (
        <div className="grid grid-cols-4 gap-4 items-center border-b border-border/50 py-3 last:border-b-0">
            {/* Column 1: Equipment Label */}
            <Label className="font-medium text-base col-span-1">{label}</Label>
            
            {/* Column 2: Test Date (Label suppressed) */}
            <JalaliDatePicker
                label="" 
                value={watch(`equipmentCalibration.${equipmentKey}.testDate` as any) || ''}
                onChange={(val) => updateField('testDate', val)}
            />
            
            {/* Column 3: Calibrated Date (Label suppressed) */}
            <JalaliDatePicker
                label="" 
                value={watch(`equipmentCalibration.${equipmentKey}.calibratedDate` as any) || ''}
                onChange={(val) => updateField('calibratedDate', val)}
            />
            
            {/* Column 4: Result (Select) */}
            <Select
                value={watch(`equipmentCalibration.${equipmentKey}.result` as any) || ''}
                onValueChange={(val) => updateField('result', val)}
            >
                <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Result" />
                </SelectTrigger>
                <SelectContent>
                    {RESULT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};