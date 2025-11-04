import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ReportData } from '@/types/report';
import { FormField } from '@/components/FormField';
import { JalaliDatePicker } from '@/components/JalaliDatePicker';
import { Separator } from '@/components/ui/separator';

const WELL_PURPOSE_OPTIONS = [
  { value: 'Workover', label: 'Workover' },
  { value: 'Drilling', label: 'Drilling' },
  { value: 'Exploration', label: 'Exploration' },
  { value: 'Appraisal', label: 'Appraisal' },
];

const WELL_TYPE_OPTIONS = [
  { value: 'Vertical', label: 'Vertical' },
  { value: 'Directional', label: 'Directional' },
  { value: 'Horizontal', label: 'Horizontal' },
];

const RIG_TYPE_OPTIONS = [
  { value: 'Workover', label: 'Workover' },
  { value: 'Drilling', label: 'Drilling' },
];

const GeneralTab: React.FC = () => {
  const { watch, setValue, formState: { errors } } = useFormContext<ReportData>();

  const getError = (field: keyof ReportData) => errors[field]?.message as string | undefined;

  return (
    <div className="space-y-8 p-4">
      <h2 className="text-2xl font-bold text-[#003366]">1. General Information</h2>

      {/* Report Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <JalaliDatePicker
          label="Date"
          value={watch('date')}
          onChange={(val) => setValue('date', val, { shouldValidate: true })}
          required
        />
        <FormField
          label="Report No."
          type="number"
          value={watch('reportNo')}
          onChange={(val) => setValue('reportNo', val as number, { shouldValidate: true })}
          error={getError('reportNo')}
          required
        />
        <JalaliDatePicker
          label="Rig Spud Date"
          value={watch('rigSpudDate') || ''}
          onChange={(val) => setValue('rigSpudDate', val)}
        />
        <JalaliDatePicker
          label="Unit Spud Date"
          value={watch('unitSpudDate') || ''}
          onChange={(val) => setValue('unitSpudDate', val)}
        />
      </div>

      <Separator />

      {/* Well Information */}
      <h3 className="text-xl font-semibold text-[#003366]">Well Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FormField
          label="Well Name"
          type="text"
          value={watch('wellName')}
          onChange={(val) => setValue('wellName', val as string, { shouldValidate: true })}
          error={getError('wellName')}
          required
        />
        <FormField
          label="M. Depth"
          unit="m"
          type="number"
          value={watch('mDepth')}
          onChange={(val) => setValue('mDepth', val as number, { shouldValidate: true })}
          error={getError('mDepth')}
          required
        />
        <FormField
          label="Field Name"
          type="text"
          value={watch('fieldName')}
          onChange={(val) => setValue('fieldName', val as string, { shouldValidate: true })}
          error={getError('fieldName')}
          required
        />
        <FormField
          label="Hole Size"
          unit="inch"
          type="text"
          value={watch('holeSize')}
          onChange={(val) => setValue('holeSize', val as string, { shouldValidate: true })}
          error={getError('holeSize')}
          required
        />
        <FormField
          label="Well Purpose"
          type="select"
          value={watch('wellPurpose')}
          onChange={(val) => setValue('wellPurpose', val as ReportData['wellPurpose'], { shouldValidate: true })}
          options={WELL_PURPOSE_OPTIONS}
          error={getError('wellPurpose')}
          required
        />
        <FormField
          label="Well Type"
          type="select"
          value={watch('wellType')}
          onChange={(val) => setValue('wellType', val as ReportData['wellType'], { shouldValidate: true })}
          options={WELL_TYPE_OPTIONS}
          error={getError('wellType')}
          required
        />
        <FormField
          label="GLE / RTE"
          unit="m"
          type="text"
          value={watch('gleRte')}
          onChange={(val) => setValue('gleRte', val as string)}
        />
        <FormField
          label="W.D"
          unit="m"
          type="number"
          value={watch('wD')}
          onChange={(val) => setValue('wD', val as number)}
        />
        <FormField
          label="TVD"
          unit="m"
          type="number"
          value={watch('tvd')}
          onChange={(val) => setValue('tvd', val as number)}
        />
      </div>

      <Separator />

      {/* Rig & Organization */}
      <h3 className="text-xl font-semibold text-[#003366]">Rig & Organization</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FormField
          label="Rig Name"
          type="text"
          value={watch('rigName')}
          onChange={(val) => setValue('rigName', val as string, { shouldValidate: true })}
          error={getError('rigName')}
          required
        />
        <FormField
          label="Rig Type"
          type="select"
          value={watch('rigType')}
          onChange={(val) => setValue('rigType', val as ReportData['rigType'])}
          options={RIG_TYPE_OPTIONS}
        />
        <FormField
          label="Customer"
          type="text"
          value={watch('customer')}
          onChange={(val) => setValue('customer', val as string)}
        />
        <FormField
          label="Contractor"
          type="text"
          value={watch('contractor')}
          onChange={(val) => setValue('contractor', val as string)}
        />
        <FormField
          label="ML Unit ID"
          type="text"
          value={watch('mlUnitId')}
          onChange={(val) => setValue('mlUnitId', val as string)}
        />
      </div>

      <Separator />

      {/* Survey & Formation Data */}
      <h3 className="text-xl font-semibold text-[#003366]">Survey & Formation</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FormField
          label="Last Survey"
          unit="m"
          type="number"
          value={watch('lastSurveyM')}
          onChange={(val) => setValue('lastSurveyM', val as number)}
        />
        <FormField
          label="Inc."
          unit="°"
          type="number"
          value={watch('inc')}
          onChange={(val) => setValue('inc', val as number)}
        />
        <FormField
          label="Azi."
          unit="°"
          type="number"
          value={watch('azi')}
          onChange={(val) => setValue('azi', val as number)}
        />
        <FormField
          label="Last Survey TVD"
          unit="m"
          type="number"
          value={watch('lastSurveyTvdM')}
          onChange={(val) => setValue('lastSurveyTvdM', val as number)}
        />
        <FormField
          label="Last Kick of Point"
          unit="m"
          type="number"
          value={watch('lastKickOfPointM')}
          onChange={(val) => setValue('lastKickOfPointM', val as number)}
        />
        <FormField
          label="Last Formation"
          type="text"
          value={watch('lastFormation')}
          onChange={(val) => setValue('lastFormation', val as string)}
        />
        <FormField
          label="Last Formation"
          unit="m"
          type="number"
          value={watch('lastFormationM')}
          onChange={(val) => setValue('lastFormationM', val as number)}
        />
        <FormField
          label="Last Casing Size"
          unit="inch"
          type="number"
          value={watch('lastCasingSize')}
          onChange={(val) => setValue('lastCasingSize', val as number)}
        />
        <FormField
          label="Last Casing"
          unit="m"
          type="number"
          value={watch('lastCasingM')}
          onChange={(val) => setValue('lastCasingM', val as number)}
        />
      </div>
    </div>
  );
};

export default GeneralTab;