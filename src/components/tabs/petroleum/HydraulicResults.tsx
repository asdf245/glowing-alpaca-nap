import React from 'react';
import { FormField } from '@/components/FormField';

interface HydraulicResultsProps {
  annVelocity: number;
  jetVelocity: number;
  bitHhp: number;
  hsi: number;
}

export const HydraulicResults = ({
  annVelocity,
  jetVelocity,
  bitHhp,
  hsi,
}: HydraulicResultsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <FormField
        label="Annular Velocity (AV)"
        unit="m/min"
        type="number"
        value={annVelocity}
        onChange={() => {}}
        isCalculated
        readOnly
      />
      <FormField
        label="Jet Velocity (JV)"
        unit="m/s"
        type="number"
        value={jetVelocity}
        onChange={() => {}}
        isCalculated
        readOnly
      />
      <FormField
        label="Bit Hydraulic Horsepower (BHHP)"
        unit="HP"
        type="number"
        value={bitHhp}
        onChange={() => {}}
        isCalculated
        readOnly
      />
      <FormField
        label="Hydraulic Specific Index (HSI)"
        unit="HHP/inch²"
        type="number"
        value={hsi}
        onChange={() => {}}
        isCalculated
        readOnly
      />
    </div>
  );
};