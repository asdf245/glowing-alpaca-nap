import React from 'react';
import { DynamicTable } from '@/components/DynamicTable';
import { StringDataEntry } from '@/types/report';

const STRING_COLUMNS = [  { header: 'Type', accessor: 'type', type: 'text', width: '25%' },
  { header: 'ID', accessor: 'idIn', type: 'number', unit: 'in', width: '15%' },
  { header: 'OD', accessor: 'odIn', type: 'number', unit: 'in', width: '15%' },
  { header: 'lb/ft', accessor: 'lbFt', type: 'number', width: '15%' },
  { header: 'Length', accessor: 'lengthM', type: 'number', unit: 'm', width: '20%' },
];

const DEFAULT_STRING_ROW: Omit<StringDataEntry, 'id'> = { 
  type: '', idIn: undefined, odIn: undefined, lbFt: undefined, lengthM: undefined 
};

export const StringDataTable = () => {
  return (
    <DynamicTable
      name="stringData"
      columns={STRING_COLUMNS as any}
      defaultRow={DEFAULT_STRING_ROW}
      maxRows={10}
      note="Define the dimensions and length of each drill string component currently in the hole."
    />
  );
};