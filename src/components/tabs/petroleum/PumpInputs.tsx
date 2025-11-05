import { useFormContext } from 'react-hook-form';
import { FormField } from '@/components/FormField';
import { ReportData } from '@/types/report';

export const PumpInputs = () => {
  const { setValue, watch } = useFormContext<ReportData>();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <FormField
        label="Liner Size"
        unit="in"
        type="number"
        value={watch('linerSizeIn')}
        onChange={(val) => setValue('linerSizeIn', val as number)}
      />
      <FormField
        label="Stroke Length"
        unit="in"
        type="number"
        value={watch('strokeLengthIn')}
        onChange={(val) => setValue('strokeLengthIn', val as number)}
      />
    </div>
  );
};