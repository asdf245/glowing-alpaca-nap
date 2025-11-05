import React from 'react';
import { FormField } from '@/components/FormField';

interface PressureResultsProps {
  hydrostaticPressure: number;
  annularPressureLoss: number;
  ecd: number;
  emw: number;
  mamw: number;
  tripMargin: number;
}

export const PressureResults = ({
  hydrostaticPressure,
  annularPressureLoss,
  ecd,
  emw,
  mamw,
  tripMargin,
}: PressureResultsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <FormField
        label="Hydrostatic Pressure (HP)"
        unit="PSI"
        type="number"
        value={hydrostaticPressure}
        onChange={() => {}}
        isCalculated
        readOnly
      />
      <FormField
        label="Annular Pressure Loss (APL)"
        unit="PSI"
        type="number"
        value={annularPressureLoss}
        onChange={() => {}}
        isCalculated
        readOnly
      />
      <FormField
        label="Equivalent Circulating Density (ECD)"
        unit="pcf"
        type="number"
        value={ecd}
        onChange={() => {}}
        isCalculated
        readOnly
      />
      <FormField
        label="Equivalent Mud Weight (EMW)"
        unit="pcf"
        type="number"
        value={emw}
        onChange={() => {}}
        isCalculated
        readOnly
      />
      <FormField
        label="Max Allowable Mud Weight (MAMW)"
        unit="pcf"
        type="number"
        value={mamw}
        onChange={() => {}}
        isCalculated
        readOnly
      />
      <FormField
        label="Trip Margin (TM)"
        unit="pcf"
        type="number"
        value={tripMargin}
        onChange={() => {}}
        isCalculated
        readOnly
      />
    </div>
  );
};