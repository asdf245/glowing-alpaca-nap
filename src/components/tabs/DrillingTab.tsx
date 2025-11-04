import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ReportData } from '@/types/report';
import { FormField } from '@/components/FormField';
import { Separator } from '@/components/ui/separator';

const DrillingTab: React.FC = () => {
  const { watch, setValue, formState: { errors } } = useFormContext<ReportData>();

  const depthFrom = watch('depthFrom') || 0;
  const depthTo = watch('depthTo') || 0;
  const hours = watch('hours') || 0;

  // Auto-Calculations
  const meterage = depthTo > depthFrom ? depthTo - depthFrom : 0;
  const avgRop = meterage > 0 && hours > 0 ? (meterage / hours).toFixed(2) : 0;

  const getError = (field: keyof ReportData) => errors[field]?.message as string | undefined;

  return (
    <div className="space-y-8 p-4">
      <h2 className="text-2xl font-bold text-[#003366]">3. Drilling Parameters</h2>

      {/* Depth Interval Summary */}
      <h3 className="text-xl font-semibold text-[#003366]">Depth Interval Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <FormField
          label="From"
          unit="m"
          type="number"
          value={depthFrom}
          onChange={(val) => setValue('depthFrom', val as number, { shouldValidate: true })}
          error={getError('depthFrom')}
          required
        />
        <FormField
          label="To"
          unit="m"
          type="number"
          value={depthTo}
          onChange={(val) => setValue('depthTo', val as number, { shouldValidate: true })}
          error={getError('depthTo')}
          required
        />
        <FormField
          label="Meterage"
          unit="m"
          type="number"
          value={meterage}
          onChange={() => {}} // Read-only
          isCalculated
          readOnly
        />
        <FormField
          label="Hours"
          unit="hr"
          type="number"
          value={hours}
          onChange={(val) => setValue('hours', val as number, { shouldValidate: true })}
          error={getError('hours')}
          required
        />
        <FormField
          label="AVG. ROP"
          unit="m/hr."
          type="text"
          value={avgRop}
          onChange={() => {}} // Read-only
          isCalculated
          readOnly
        />
      </div>

      <Separator />

      {/* Drilling Parameters */}
      <h3 className="text-xl font-semibold text-[#003366]">Drilling Parameters</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <FormField
          label="WOB"
          unit="Klbf"
          type="number"
          value={watch('wob')}
          onChange={(val) => setValue('wob', val as number)}
        />
        <FormField
          label="SPP"
          unit="PSI"
          type="number"
          value={watch('spp')}
          onChange={(val) => setValue('spp', val as number)}
        />
        <FormField
          label="Flow Rate"
          unit="GPM"
          type="number"
          value={watch('flowRate')}
          onChange={(val) => setValue('flowRate', val as number)}
        />
        <FormField
          label="RPM + TURB."
          unit="rpm"
          type="number"
          value={watch('rpmTurb')}
          onChange={(val) => setValue('rpmTurb', val as number)}
        />
        <FormField
          label="Torque"
          unit="klbf.ft"
          type="number"
          value={watch('torque')}
          onChange={(val) => setValue('torque', val as number)}
        />
      </div>

      <Separator />

      {/* Hydraulic Data */}
      <h3 className="text-xl font-semibold text-[#003366]">Hydraulic Data</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <FormField
          label="Ann Velocity"
          unit="m/min"
          type="number"
          value={watch('annVelocity')}
          onChange={(val) => setValue('annVelocity', val as number)}
        />
        <FormField
          label="Jet Velocity"
          unit="m/s"
          type="number"
          value={watch('jetVelocity')}
          onChange={(val) => setValue('jetVelocity', val as number)}
        />
        <FormField
          label="Bit HHP"
          type="number"
          value={watch('bitHhp')}
          onChange={(val) => setValue('bitHhp', val as number)}
        />
        <FormField
          label="HSI"
          unit="HHP/inch²"
          type="number"
          value={watch('hsi')}
          onChange={(val) => setValue('hsi', val as number)}
        />
        <FormField
          label="ECD"
          unit="pcf"
          type="number"
          value={watch('ecd')}
          onChange={(val) => setValue('ecd', val as number)}
        />
      </div>

      <Separator />

      {/* Mud Data */}
      <h3 className="text-xl font-semibold text-[#003366]">Mud Data</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FormField
          label="Mud Weight"
          unit="pcf"
          type="number"
          value={watch('mudWeight')}
          onChange={(val) => setValue('mudWeight', val as number, { shouldValidate: true })}
          error={getError('mudWeight')}
          required
        />
        <FormField
          label="Viscosity"
          unit="s/qt."
          type="number"
          value={watch('viscosity')}
          onChange={(val) => setValue('viscosity', val as number, { shouldValidate: true })}
          error={getError('viscosity')}
          required
        />
        <FormField
          label="P.V."
          unit="cp"
          type="number"
          value={watch('pv')}
          onChange={(val) => setValue('pv', val as number)}
        />
        <FormField
          label="YP"
          unit="lbf/100ft²"
          type="number"
          value={watch('yp')}
          onChange={(val) => setValue('yp', val as number)}
        />
        <FormField
          label="Gels"
          unit="10sec/10min"
          type="text"
          value={watch('gels')}
          onChange={(val) => setValue('gels', val as string)}
        />
        <FormField
          label="W. L."
          unit="cc/30\""
          type="number"
          value={watch('wL')}
          onChange={(val) => setValue('wL', val as number)}
        />
        <FormField
          label="CL"
          unit="gr/l"
          type="number"
          value={watch('cl')}
          onChange={(val) => setValue('cl', val as number)}
        />
        <FormField
          label="PH"
          type="number"
          value={watch('ph')}
          onChange={(val) => setValue('ph', val as number, { shouldValidate: true })}
          error={getError('ph')}
          required
        />
        <FormField
          label="Total Daily Losses"
          unit="bbl"
          type="number"
          value={watch('totalDailyLosses')}
          onChange={(val) => setValue('totalDailyLosses', val as number)}
        />
        <FormField
          label="Total Daily Flow"
          unit="bbl"
          type="number"
          value={watch('totalDailyFlow')}
          onChange={(val) => setValue('totalDailyFlow', val as number)}
        />
        <FormField
          label="Total Well Losses"
          unit="bbl"
          type="number"
          value={watch('totalWellLosses')}
          onChange={(val) => setValue('totalWellLosses', val as number)}
        />
        <FormField
          label="Total Well Flow"
          unit="bbl"
          type="number"
          value={watch('totalWellFlow')}
          onChange={(val) => setValue('totalWellFlow', val as number)}
        />
      </div>
    </div>
  );
};

export default DrillingTab;