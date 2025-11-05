import React from 'react';
import { FormField } from '@/components/FormField';

interface RheologyResultsProps {
  pv: number;
  yp: number;
  n: number;
  k: number;
}

export const RheologyResults: React.FC<RheologyResultsProps> = ({
  pv,
  yp,
  n,
  k,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <FormField
        label="Plastic Viscosity (PV)"
        unit="cp"
        type="number"
        value={pv}
        onChange={() => {}}
        isCalculated
        readOnly
      />
      <FormField
        label="Yield Point (YP)"
        unit="lbf/100ft²"
        type="number"
        value={yp}
        onChange={() => {}}
        isCalculated
        readOnly
      />
      <FormField
        label="Flow Behavior Index (n)"
        type="number"
        value={n}
        onChange={() => {}}
        isCalculated
        readOnly
      />
      <FormField
        label="Consistency Index (k)"
        type="number"
        value={k}
        onChange={() => {}}
        isCalculated
        readOnly
      />
    </div>
  );
};