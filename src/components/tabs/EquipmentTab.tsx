import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormField } from '@/components/FormField';
import { useFormContext } from 'react-hook-form';
import { ReportData } from '@/types/report';
import { JalaliDatePicker } from '@/components/JalaliDatePicker';

const CALIBRATION_EQUIPMENT = [
    { key: 'gasDetector', label: 'Gas Detector' },
    { key: 'chromatograph', label: 'Chromatograph' },
    { key: 'h2s1', label: 'H2S-1' },
    { key: 'h2s2', label: 'H2S-2' },
    { key: 'h2s3', label: 'H2S-3' },
    { key: 'calcimeter', label: 'Calcimeter' },
];

const RESULT_OPTIONS = [
    { value: 'OK', label: 'OK' },
    { value: 'Failed', label: 'Failed' },
];

const EquipmentTab: React.FC = () => {
    const { watch, setValue } = useFormContext<ReportData>();

    const updateCalibration = (equipmentKey: keyof ReportData['equipmentCalibration'], field: 'testDate' | 'calibratedDate' | 'result', value: string) => {
        setValue(`equipmentCalibration.${equipmentKey}.${field}` as any, value as any);
    };

    return (
        <div className="space-y-8 p-4">
            <h2 className="text-2xl font-bold text-[#003366]">7. Equipment & Crew</h2>

            {/* Equipment Calibration Table */}
            <h3 className="text-xl font-semibold text-[#003366]">Equipment Calibration</h3>
            <div className="space-y-4">
                {CALIBRATION_EQUIPMENT.map(({ key, label }) => (
                    <div key={key} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border-b pb-4">
                        <Label className="font-medium text-lg col-span-1">{label}</Label>
                        
                        <JalaliDatePicker
                            label="Test Date"
                            value={watch(`equipmentCalibration.${key}.testDate` as any) || ''}
                            onChange={(val) => updateCalibration(key as keyof ReportData['equipmentCalibration'], 'testDate', val)}
                        />
                        <JalaliDatePicker
                            label="Calibrated Date"
                            value={watch(`equipmentCalibration.${key}.calibratedDate` as any) || ''}
                            onChange={(val) => updateCalibration(key as keyof ReportData['equipmentCalibration'], 'calibratedDate', val)}
                        />
                        <FormField
                            label="Result"
                            type="select"
                            value={watch(`equipmentCalibration.${key}.result` as any) || ''}
                            onChange={(val) => updateCalibration(key as keyof ReportData['equipmentCalibration'], 'result', val as string)}
                            options={RESULT_OPTIONS}
                        />
                    </div>
                ))}
            </div>

            <Separator />

            {/* Safety Meeting */}
            <h3 className="text-xl font-semibold text-[#003366]">Safety Meeting</h3>
            <div className="space-y-2">
                <Label className="font-medium">Attend in Rig site Safety meeting?</Label>
                <RadioGroup 
                    value={watch('safetyMeeting') || 'No'} 
                    onValueChange={(val) => setValue('safetyMeeting', val as ReportData['safetyMeeting'])}
                    className="flex space-x-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="safety-yes" />
                        <Label htmlFor="safety-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="safety-no" />
                        <Label htmlFor="safety-no">No</Label>
                    </div>
                </RadioGroup>
            </div>

            <Separator />

            {/* Crew Roster */}
            <h3 className="text-xl font-semibold text-[#003366]">Crew Roster</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Day Crew */}
                <div className="space-y-4 p-4 border rounded-lg">
                    <h4 className="font-medium text-lg">Day Crew</h4>
                    {watch('dayCrew').map((_crew, index) => (
                        <div key={index} className="grid grid-cols-3 gap-4">
                            <Label className="flex items-center">Person {index + 1}</Label>
                            <FormField
                                label="Number"
                                type="number"
                                value={watch(`dayCrew.${index}.number`)}
                                onChange={(val) => setValue(`dayCrew.${index}.number`, val as number)}
                            />
                            <FormField
                                label="Name"
                                type="text"
                                value={watch(`dayCrew.${index}.name`)}
                                onChange={(val) => setValue(`dayCrew.${index}.name`, val as string)}
                            />
                        </div>
                    ))}
                </div>

                {/* Night Crew */}
                <div className="space-y-4 p-4 border rounded-lg">
                    <h4 className="font-medium text-lg">Night Crew</h4>
                    {watch('nightCrew').map((_crew, index) => (
                        <div key={index} className="grid grid-cols-3 gap-4">
                            <Label className="flex items-center">Person {index + 1}</Label>
                            <FormField
                                label="Number"
                                type="number"
                                value={watch(`nightCrew.${index}.number`)}
                                onChange={(val) => setValue(`nightCrew.${index}.number`, val as number)}
                            />
                            <FormField
                                label="Name"
                                type="text"
                                value={watch(`nightCrew.${index}.name`)}
                                onChange={(val) => setValue(`nightCrew.${index}.name`, val as string)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EquipmentTab;