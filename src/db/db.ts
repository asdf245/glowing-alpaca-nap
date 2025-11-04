import Dexie, { Table } from 'dexie';
import { ReportData } from '@/types/report';

export interface ReportRecord {
  id?: number;
  wellName: string;
  reportDate: string; // Jalali date YYYY.MM.DD
  data: ReportData;
  lastModified: Date;
}

export class MudlogDatabase extends Dexie {
  reports!: Table<ReportRecord>;

  constructor() {
    super('MudlogReporterDB');
    this.version(1).stores({
      reports: '++id, wellName, reportDate, lastModified', // Primary key and indexed fields
    });
  }
}

export const db = new MudlogDatabase();