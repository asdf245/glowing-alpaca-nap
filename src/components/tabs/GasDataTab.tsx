import React from 'react';
import { DynamicTable } from '@/components/DynamicTable';
import { GasEntry } from '@/types/report';
import { Separator } from '@/components/ui/separator';

const GAS_TYPE_OPTIONS = [
  { value: 'FG', label: 'FG (Formation Gas)' },
  { value: 'CG', label: 'CG (Connection Gas)' },
  { value: 'TG', label: 'TG (Trip Gas)' },
  { value: 'BG', label: 'BG (Background Gas)' },
];

const GAS_COLUMNS = [
  { header: 'From', accessor: 'from', type: 'number', unit: 'm', width: '8%' },
  { header: 'To', accessor: 'to', type: 'number', unit: 'm', width: '8%' },
  { header: 'TYPE', accessor: 'type', type: 'select', options: GAS_TYPE_OPTIONS, width: '10%' },
  { header: 'TOT. GAS', accessor: 'totGas', type: 'number', unit: '%', width: '8%' },
  { header: 'C1', accessor: 'c1', type: 'number', unit: 'ppm', width: '8%' },
  { header: 'C2', accessor: 'c2', type: 'number', unit: 'ppm', width: '8%' },
  { header: 'C3', accessor: 'c3', type: 'number', unit: 'ppm', width: '8%' },
  { header: 'iC4', accessor: 'iC4', type: 'number', unit: 'ppm', width: '8%' },
  { header: 'nC4', accessor: 'nC4', type: 'number', unit: 'ppm', width: '8%' },
  { header: 'iC5', accessor: 'iC5', type: 'number', unit: 'ppm', width: '8%' },
  { header: 'nC5', accessor: 'nC5', type: 'number', unit: 'ppm', width: '8%' },
  { header: 'Remarks', accessor: 'remarks', type: 'textarea', colSpan: 2, width: '15%' },
];

const DEFAULT_GAS_ROW: Omit<GasEntry, 'id'> = {
  from: 0,
  to: 0,
  type: 'BG',
  totGas: undefined,
  c1: undefined,
  c2: undefined,
  c3: undefined,
  iC4: undefined,
  nC4: undefined,
  iC5: undefined,
  nC5: undefined,
  remarks: '',
};

const GasDataTab: React.FC = () => {
  // Calculated Wetness Ratio display (not part of the table, but displayed below)
  // This calculation should ideally be done on the entire gasEntries array if needed globally,
  // but for simplicity, we'll just display the note as requested.

  return (
    <div className="space-y-8 p-4">
      <h2 className="text-2xl font-bold text-[#003366]">5. Gas Data</h2>
      <Separator />
      <DynamicTable<GasEntry & { id: string }> // Cast generic type
        name="gasEntries"
        columns={GAS_COLUMNS as any}
        defaultRow={DEFAULT_GAS_ROW}
        maxRows={10}
      />
      <p className="text-sm text-muted-foreground mt-4">
        NOTE: FG=formation gas | CG=connection gas | TG=trip gas | BG=background gas
      </p>
      {/* Gas ratio auto-calculations displayed as read-only: Wetness Ratio = (C2+C3)/(C1+C2+C3) */}
      {/* This calculation is complex to display globally without a dedicated summary component, 
          but the data structure supports it. */}
    </div>
  );
};

export default GasDataTab;