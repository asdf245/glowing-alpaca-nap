import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { ReportData } from '@/types/report';
import { FormField } from '@/components/FormField';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BIT_TYPE_OPTIONS = [
  { value: 'PDC', label: 'PDC' },
  { value: 'Tricone', label: 'Tricone' },
  { value: 'Roller Cone', label: 'Roller Cone' },
  { value: 'Diamond', label: 'Diamond' },
];

const BitDataTab: React.FC = () => {
  const { watch, setValue, formState: { errors } } = useFormContext<ReportData>();
  const [isPulledOutOpen, setIsPulledOutOpen] = useState(false);

  const getError = (field: keyof ReportData['presentBit']) => errors.presentBit?.[field]?.message as string | undefined;
  const getPulledOutError = (field: keyof ReportData['pulledOutBit']) => errors.pulledOutBit?.[field]?.message as string | undefined;

  const updatePresentBit = (key: keyof ReportData['presentBit'], value: string | number) => {
    setValue(`presentBit.${key}`, value as any, { shouldValidate: true });
  };

  const updatePulledOutBit = (key: keyof ReportData['pulledOutBit'], value: string | number) => {
    setValue(`pulledOutBit.${key}`, value as any, { shouldValidate: true });
  };

  return (
    <div className="space-y-8 p-4">
      <h2 className="text-2xl font-bold text-[#003366]">2. Bit Data</h2>

      {/* Present Bit Section */}
      <h3 className="text-xl font-semibold text-[#003366]">Present Bit</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FormField
          label="Bit no./Run no."
          type="number"
          value={watch('presentBit.bitRunNo')}
          onChange={(val) => updatePresentBit('bitRunNo', val)}
          error={getError('bitRunNo')}
        />
        <FormField
          label="Type"
          type="select"
          value={watch('presentBit.type')}
          onChange={(val) => updatePresentBit('type', val)}
          options={BIT_TYPE_OPTIONS}
          error={getError('type')}
        />
        <FormField
          label="Serial no."
          type="text"
          value={watch('presentBit.serialNo')}
          onChange={(val) => updatePresentBit('serialNo', val)}
          error={getError('serialNo')}
        />
        <FormField
          label="Manufacture"
          type="text"
          value={watch('presentBit.manufacture')}
          onChange={(val) => updatePresentBit('manufacture', val)}
          error={getError('manufacture')}
        />
        <FormField
          label="Nozzle"
          unit="1/32\""
          type="text"
          value={watch('presentBit.nozzle')}
          onChange={(val) => updatePresentBit('nozzle', val)}
          error={getError('nozzle')}
        />
        <FormField
          label="Bit Size"
          unit="in"
          type="text"
          value={watch('presentBit.bitSize')}
          onChange={(val) => updatePresentBit('bitSize', val)}
          error={getError('bitSize')}
        />
        <FormField
          label="Daily on bottom time"
          unit="hrs."
          type="number"
          value={watch('presentBit.dailyOnBottomTime')}
          onChange={(val) => updatePresentBit('dailyOnBottomTime', val)}
          error={getError('dailyOnBottomTime')}
        />
        <FormField
          label="Accumulative drilling Time"
          unit="hrs."
          type="number"
          value={watch('presentBit.accDrillingTime')}
          onChange={(val) => updatePresentBit('accDrillingTime', val)}
          error={getError('accDrillingTime')}
        />
        <FormField
          label="Accumulative Counter RPM"
          unit="Krev"
          type="number"
          value={watch('presentBit.accCounterRpm')}
          onChange={(val) => updatePresentBit('accCounterRpm', val)}
          error={getError('accCounterRpm')}
        />
        <FormField
          label="Daily circ. Time"
          unit="hrs."
          type="number"
          value={watch('presentBit.dailyCircTime')}
          onChange={(val) => updatePresentBit('dailyCircTime', val)}
          error={getError('dailyCircTime')}
        />
        <FormField
          label="Accumulative circ. Time"
          unit="hrs."
          type="number"
          value={watch('presentBit.accCircTime')}
          onChange={(val) => updatePresentBit('accCircTime', val)}
          error={getError('accCircTime')}
        />
      </div>

      <Separator />

      {/* Pulled Out Bit Section (Collapsible) */}
      <Collapsible open={isPulledOutOpen} onOpenChange={setIsPulledOutOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-start text-xl font-semibold text-[#003366] p-0">
            Pulled Out Bit (Optional)
            <ChevronDown className={cn("ml-2 h-5 w-5 transition-transform", isPulledOutOpen && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FormField
              label="Depth In"
              unit="m"
              type="number"
              value={watch('pulledOutBit.depthIn')}
              onChange={(val) => updatePulledOutBit('depthIn', val)}
              error={getPulledOutError('depthIn')}
            />
            {/* Duplicate fields from Present Bit */}
            <FormField
              label="Bit no./Run no."
              type="number"
              value={watch('pulledOutBit.bitRunNo')}
              onChange={(val) => updatePulledOutBit('bitRunNo', val)}
              error={getPulledOutError('bitRunNo')}
            />
            <FormField
              label="Type"
              type="select"
              value={watch('pulledOutBit.type')}
              onChange={(val) => updatePulledOutBit('type', val)}
              options={BIT_TYPE_OPTIONS}
              error={getPulledOutError('type')}
            />
            <FormField
              label="Serial no."
              type="text"
              value={watch('pulledOutBit.serialNo')}
              onChange={(val) => updatePulledOutBit('serialNo', val)}
              error={getPulledOutError('serialNo')}
            />
            <FormField
              label="Manufacture"
              type="text"
              value={watch('pulledOutBit.manufacture')}
              onChange={(val) => updatePulledOutBit('manufacture', val)}
              error={getPulledOutError('manufacture')}
            />
            <FormField
              label="Nozzle"
              unit="1/32\""
              type="text"
              value={watch('pulledOutBit.nozzle')}
              onChange={(val) => updatePulledOutBit('nozzle', val)}
              error={getPulledOutError('nozzle')}
            />
            <FormField
              label="Bit Size"
              unit="in"
              type="text"
              value={watch('pulledOutBit.bitSize')}
              onChange={(val) => updatePulledOutBit('bitSize', val)}
              error={getPulledOutError('bitSize')}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default BitDataTab;