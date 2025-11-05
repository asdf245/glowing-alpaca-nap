import { DynamicTable } from '@/components/DynamicTable';
import { WellProfileEntry } from '@/types/report';

const WELL_PROFILE_COLUMNS = [  { header: 'Type', accessor: 'type', type: 'text', width: '25%' },
  { header: 'ID', accessor: 'idIn', type: 'number', unit: 'in', width: '15%' },
  { header: 'TOP', accessor: 'topM', type: 'number', unit: 'm', width: '15%' },
  { header: 'BOTTOM', accessor: 'bottomM', type: 'number', unit: 'm', width: '15%' },
  { 
    header: 'Length', 
    accessor: 'lengthM', 
    type: 'calculated', 
    unit: 'm', 
    width: '20%',
    calculate: (row: WellProfileEntry) => {
        const length = (row.bottomM || 0) - (row.topM || 0);
        return length >= 0 ? length.toFixed(2) : 'Error';
    }
  },
];

const DEFAULT_WELL_PROFILE_ROW: Omit<WellProfileEntry, 'id'> = { 
  type: '', idIn: undefined, topM: undefined, bottomM: undefined, lengthM: undefined 
};

export const WellProfileTable = () => {
  return (
    <DynamicTable
      name="wellProfile"
      columns={WELL_PROFILE_COLUMNS as any}
      defaultRow={DEFAULT_WELL_PROFILE_ROW}
      maxRows={10}
      note="Define the ID and depth of each casing/liner/open hole section."
    />
  );
};