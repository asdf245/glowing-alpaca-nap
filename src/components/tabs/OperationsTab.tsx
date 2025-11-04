import React from 'react';
import { DynamicTable } from '@/components/DynamicTable';
import { OperationEntry } from '@/types/report';
import { Separator } from '@/components/ui/separator';
import { calculateDuration } from '@/utils/dateUtils';

const OPERATIONS_COLUMNS = [
  { header: 'From', accessor: 'fromTime', type: 'text', unit: 'HH:MM:SS', width: '15%' },
  { header: 'To', accessor: 'toTime', type: 'text', unit: 'HH:MM:SS', width: '15%' },
  { 
    header: 'Duration', 
    accessor: 'duration', 
    type: 'calculated', 
    unit: 'HH:MM:SS', 
    width: '15%',
    calculate: (row: OperationEntry) => calculateDuration(row.fromTime, row.toTime)
  },
  { header: 'Remark', accessor: 'remark', type: 'textarea', colSpan: 2, width: '55%' },
];

const DEFAULT_OPERATION_ROW: Omit<OperationEntry, 'id'> = {
  fromTime: '00:00:00',
  toTime: '00:00:00',
  remark: '',
};

const OperationsTab: React.FC = () => {
  return (
    <div className="space-y-8 p-4">
      <h2 className="text-2xl font-bold text-[#003366]">6. Operations Log</h2>
      <Separator />
      <DynamicTable<OperationEntry>
        name="operationEntries"
        columns={OPERATIONS_COLUMNS as any}
        defaultRow={DEFAULT_OPERATION_ROW}
        maxRows={20}
      />
    </div>
  );
};

export default OperationsTab;