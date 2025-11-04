import React from 'react';
import { DynamicTable } from '@/components/DynamicTable';
import { LithologyEntry } from '@/types/report';
import { Separator } from '@/components/ui/separator';

const LITHOLOGY_COLUMNS = [
  { header: 'From', accessor: 'from', type: 'number', unit: 'm', width: '10%' },
  { header: 'To', accessor: 'to', type: 'number', unit: 'm', width: '10%' },
  { header: 'ROP min', accessor: 'ropMin', type: 'number', unit: 'm/hr', width: '10%' },
  { header: 'ROP max', accessor: 'ropMax', type: 'number', unit: 'm/hr', width: '10%' },
  { header: 'ROP avg', accessor: 'ropAvg', type: 'number', unit: 'm/hr', width: '10%' },
  { header: 'Description', accessor: 'description', type: 'textarea', colSpan: 2, width: '40%' },
];

const DEFAULT_LITHOLOGY_ROW: Omit<LithologyEntry, 'id'> = {
  from: 0,
  to: 0,
  ropMin: undefined,
  ropMax: undefined,
  ropAvg: undefined,
  description: '',
};

const LithologyTab: React.FC = () => {
  return (
    <div className="space-y-8 p-4">
      <h2 className="text-2xl font-bold text-[#003366]">4. Lithology Data</h2>
      <Separator />
      <DynamicTable<LithologyEntry>
        name="lithologyEntries"
        columns={LITHOLOGY_COLUMNS as any}
        defaultRow={DEFAULT_LITHOLOGY_ROW}
        maxRows={10}
      />
    </div>
  );
};

export default LithologyTab;