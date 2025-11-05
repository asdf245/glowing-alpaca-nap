import * as XLSX from 'xlsx';
import { ReportData } from '@/types/report';
import { calculateDuration } from './dateUtils';

// Helper function to convert column index (0-based) to Excel column letter (A, B, C...)
const colToLetter = (c: number): string => {
  let s = '';
  let n = c + 1;
  while (n > 0) {
    let remainder = n % 26;
    if (remainder === 0) {
      s = 'Z' + s;
      n = (n / 26) - 1;
    } else {
      s = String.fromCharCode(65 + remainder - 1) + s;
      n = Math.floor(n / 26);
    }
  }
  return s;
};

// Helper function to set a cell value
const setCell = (ws: XLSX.WorkSheet, r: number, c: number, value: string | number | undefined, type: 's' | 'n' = 's') => {
  if (value !== undefined && value !== null && value !== '') {
    const cellRef = `${colToLetter(c)}${r + 1}`;
    ws[cellRef] = { v: value, t: type };
  }
};

// Helper function to merge cells
const mergeCells = (ws: XLSX.WorkSheet, r1: number, c1: number, r2: number, c2: number) => {
    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push({ s: { r: r1, c: c1 }, e: { r: r2, c: c2 } });
};


export function generateNidcExcel(data: ReportData): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const ws: XLSX.WorkSheet = {};

  // --- Row 0 (A1:W1): Main Header ---
  setCell(ws, 0, 0, "SPECIAL DRILLING SERVICES\nNIDC SURFACE LOGGING DAILY REPORT");
  mergeCells(ws, 0, 0, 0, 22); 

  // --- Row 1 (A2:V2): Report Metadata ---
  setCell(ws, 1, 0, "Date"); setCell(ws, 1, 3, data.date as string);
  setCell(ws, 1, 6, "Report No."); setCell(ws, 1, 9, data.reportNo as number, 'n');
  setCell(ws, 1, 12, "Rig Spud Date"); setCell(ws, 1, 15, data.rigSpudDate as string);
  setCell(ws, 1, 18, "Unit Spud Date"); setCell(ws, 1, 21, data.unitSpudDate as string);
  
  // Merge cells for metadata labels/values (A2-C2, D2-F2, G2-I2, J2-L2, M2-O2, P2-R2, S2-U2, V2-X2)
  for (let i = 0; i <= 21; i += 3) {
    mergeCells(ws, 1, i, 1, i + 2); 
  }

  // --- Rows 2-7: General Information (Complex Layout) ---
  
  const generalInfoMap = [
    // R2
    { r: 2, c: 0, label: "Well Name", value: data.wellName as string },
    { r: 2, c: 3, label: "Hole Size (inch)", value: data.holeSize as string },
    { r: 2, c: 6, label: "Rig Name", value: data.rigName as string },
    // R3
    { r: 3, c: 0, label: "M. Depth (m)", value: data.mDepth as number, type: 'n' as const },
    { r: 3, c: 3, label: "GLE / RTE (m)", value: data.gleRte as string },
    { r: 3, c: 6, label: "Rig Type", value: data.rigType as string },
    // R4
    { r: 4, c: 0, label: "Field Name", value: data.fieldName as string },
    { r: 4, c: 3, label: "W.D (m)", value: data.wD as number, type: 'n' as const },
    { r: 4, c: 6, label: "Customer", value: data.customer as string },
    // R5
    { r: 5, c: 0, label: "Well Purpose", value: data.wellPurpose as string },
    { r: 5, c: 3, label: "TVD (m)", value: data.tvd as number, type: 'n' as const },
    { r: 5, c: 6, label: "Contractor", value: data.contractor as string },
    // R6
    { r: 6, c: 0, label: "Well Type", value: data.wellType as string },
    { r: 6, c: 3, label: "ML Unit ID", value: data.mlUnitId as string },
    { r: 6, c: 6, label: "Last Survey @ m", value: data.lastSurveyM as number, type: 'n' as const },
    // R7
    { r: 7, c: 0, label: "Last Formation", value: data.lastFormation as string },
    { r: 7, c: 3, label: "Last Formation @ m", value: data.lastFormationM as number, type: 'n' as const },
    { r: 7, c: 6, label: "Last Casing Size (inch)", value: data.lastCasingSize as number, type: 'n' as const },
  ];
  
  generalInfoMap.forEach(item => {
    setCell(ws, item.r, item.c, item.label);
    setCell(ws, item.r, item.c + 1, item.value, item.type || 's'); 
    mergeCells(ws, item.r, item.c + 1, item.r, item.c + 2); 
  });


  // --- Rows 8-15: Bit Data ---
  let currentRow = 8;
  setCell(ws, currentRow, 0, "Present Bit"); mergeCells(ws, currentRow, 0, currentRow, 1);
  setCell(ws, currentRow, 2, "Pulled Out Bit"); mergeCells(ws, currentRow, 2, currentRow, 3);
  currentRow++;

  const presentBit = data.presentBit;
  const pulledOutBit = data.pulledOutBit || {};
  
  // R9: Bit no./Run no. | Depth In (m)
  setCell(ws, 9, 0, "Bit no./Run no."); setCell(ws, 9, 1, presentBit.bitRunNo as number, 'n');
  setCell(ws, 9, 2, "Depth In (m)"); setCell(ws, 9, 3, pulledOutBit.depthIn as number, 'n');
  
  // R10: Type | Daily on bottom time (hrs.)
  setCell(ws, 10, 0, "Type"); setCell(ws, 10, 1, presentBit.type as string);
  setCell(ws, 10, 2, "Daily on bottom time (hrs.)"); setCell(ws, 10, 3, presentBit.dailyOnBottomTime as number, 'n');
  
  // R11: Serial no. | Accumulative drilling Time (hrs.)
  setCell(ws, 11, 0, "Serial no."); setCell(ws, 11, 1, presentBit.serialNo as string);
  setCell(ws, 11, 2, "Accumulative drilling Time (hrs.)"); setCell(ws, 11, 3, presentBit.accDrillingTime as number, 'n');

  // R12: Manufacture | Accumulative Counter RPM (Krev)
  setCell(ws, 12, 0, "Manufacture"); setCell(ws, 12, 1, presentBit.manufacture as string);
  setCell(ws, 12, 2, "Accumulative Counter RPM (Krev)"); setCell(ws, 12, 3, presentBit.accCounterRpm as number, 'n');

  // R13: Nozzle (1/32") | Daily circ. Time (hrs.)
  setCell(ws, 13, 0, "Nozzle (1/32\")"); setCell(ws, 13, 1, presentBit.nozzle as string);
  setCell(ws, 13, 2, "Daily circ. Time (hrs.)"); setCell(ws, 13, 3, presentBit.dailyCircTime as number, 'n');

  // R14: Bit Size (in) | Accumulative circ. Time (hrs.)
  setCell(ws, 14, 0, "Bit Size (in)"); setCell(ws, 14, 1, presentBit.bitSize as string);
  setCell(ws, 14, 2, "Accumulative circ. Time (hrs.)"); setCell(ws, 14, 3, presentBit.accCircTime as number, 'n');
  
  // --- Row 16: Depth Interval Summary ---
  currentRow = 16;
  const depthTo = data.depthTo as number;
  const depthFrom = data.depthFrom as number;
  const hours = data.hours as number;
  
  const meterage = depthTo > depthFrom ? depthTo - depthFrom : 0;
  const avgRop = meterage > 0 && hours > 0 ? (meterage / hours).toFixed(2) : 0;

  setCell(ws, currentRow, 0, "Depth Interval (m)");
  setCell(ws, currentRow, 1, "From (m)"); setCell(ws, currentRow, 2, depthFrom, 'n');
  setCell(ws, currentRow, 3, "To (m)"); setCell(ws, currentRow, 4, depthTo, 'n');
  setCell(ws, currentRow, 5, "Meterage (m)"); setCell(ws, currentRow, 6, meterage, 'n');
  setCell(ws, currentRow, 7, "Hours (hr)"); setCell(ws, currentRow, 8, hours, 'n');
  setCell(ws, currentRow, 9, "AVG. ROP (m/hr.)"); setCell(ws, currentRow, 10, avgRop, 'n');

  // --- Rows 17-18: Hydraulic Data (Calculated) ---
  currentRow = 17;
  setCell(ws, currentRow, 0, "Hydraulic Data (Calculated)"); mergeCells(ws, currentRow, 0, currentRow, 0);
  setCell(ws, currentRow, 1, "Ann Velocity (m/min)");
  setCell(ws, currentRow, 2, "Jet Velocity (m/s)");
  setCell(ws, currentRow, 3, "Bit HHP");
  setCell(ws, currentRow, 4, "HSI (HHP/inch2)");
  setCell(ws, currentRow, 5, "ECD (pcf)");
  currentRow++;
  setCell(ws, currentRow, 1, data.annVelocity as number, 'n');
  setCell(ws, currentRow, 2, data.jetVelocity as number, 'n');
  setCell(ws, currentRow, 3, data.bitHhp as number, 'n');
  setCell(ws, currentRow, 4, data.hsi as number, 'n');
  setCell(ws, currentRow, 5, data.ecd as number, 'n');
  
  // --- Row 19: Mud Data ---
  currentRow = 19;
  setCell(ws, currentRow, 0, "Mud Weight (pcf)"); setCell(ws, currentRow, 1, data.mudWeight as number, 'n');
  setCell(ws, currentRow, 2, "Viscosity (s/qt.)"); setCell(ws, currentRow, 3, data.viscosity as number, 'n');
  setCell(ws, currentRow, 4, "P.V. (cp)"); setCell(ws, currentRow, 5, data.pv as number, 'n');
  setCell(ws, currentRow, 6, "YP (lbf/100ft^2)"); setCell(ws, currentRow, 7, data.yp as number, 'n');
  setCell(ws, currentRow, 8, "Gels (10sec/10min)"); setCell(ws, currentRow, 9, data.gels as string);
  setCell(ws, currentRow, 10, "W. L. (cc/30\")"); setCell(ws, currentRow, 11, data.wL as number, 'n');
  setCell(ws, currentRow, 12, "CL (gr/l)"); setCell(ws, currentRow, 13, data.cl as number, 'n');
  setCell(ws, currentRow, 14, "PH"); setCell(ws, currentRow, 15, data.ph as number, 'n');
  
  // --- Row 20: Rheology Inputs & Power Law Results ---
  currentRow = 20;
  setCell(ws, currentRow, 0, "Rheology @ 600 RPM"); setCell(ws, currentRow, 1, data.rheology600 as number, 'n');
  setCell(ws, currentRow, 2, "Rheology @ 300 RPM"); setCell(ws, currentRow, 3, data.rheology300 as number, 'n');
  setCell(ws, currentRow, 4, "Liner Size (in)"); setCell(ws, currentRow, 5, data.linerSizeIn as number, 'n');
  setCell(ws, currentRow, 6, "Stroke Length (in)"); setCell(ws, currentRow, 7, data.strokeLengthIn as number, 'n');
  setCell(ws, currentRow, 8, "Flow Index (n)"); setCell(ws, currentRow, 9, data.n as number, 'n');
  setCell(ws, currentRow, 10, "Consistency Index (k)"); setCell(ws, currentRow, 11, data.k as number, 'n');

  // --- Row 21: Pressure/Density Management ---
  currentRow = 21;
  setCell(ws, currentRow, 0, "Pressure & Density Management"); mergeCells(ws, currentRow, 0, currentRow, 0);
  setCell(ws, currentRow, 1, "Hydrostatic Pressure (PSI)"); setCell(ws, currentRow, 2, data.hydrostaticPressure as number, 'n');
  setCell(ws, currentRow, 3, "Annular Pressure Loss (PSI)"); setCell(ws, currentRow, 4, data.annularPressureLoss as number, 'n');
  setCell(ws, currentRow, 5, "EMW (pcf)"); setCell(ws, currentRow, 6, data.emw as number, 'n');
  setCell(ws, currentRow, 7, "MAMW (pcf)"); setCell(ws, currentRow, 8, data.mamw as number, 'n');
  setCell(ws, currentRow, 9, "Trip Margin (pcf)"); setCell(ws, currentRow, 10, data.tripMargin as number, 'n');
  
  // --- Rows 23-24: Volume and Circulation Data (Updated Section) ---
  currentRow = 23;
  setCell(ws, currentRow, 0, "Volume & Circulation Data"); mergeCells(ws, currentRow, 0, currentRow, 0);
  setCell(ws, currentRow, 1, "Total Hole Volume (bbl)"); setCell(ws, currentRow, 2, data.totalHoleVolume as number, 'n');
  setCell(ws, currentRow, 3, "Annulus Volume (bbl)"); setCell(ws, currentRow, 4, data.annulusVolume as number, 'n');
  setCell(ws, currentRow, 5, "Capacity Volume (bbl)"); setCell(ws, currentRow, 6, data.capacityVolume as number, 'n');
  setCell(ws, currentRow, 7, "Steel Volume (bbl)"); setCell(ws, currentRow, 8, data.steelVolume as number, 'n');
  setCell(ws, currentRow, 9, "Displace Volume (bbl)"); setCell(ws, currentRow, 10, data.displaceVolume as number, 'n');
  setCell(ws, currentRow, 11, "Lag Time (min)"); setCell(ws, currentRow, 12, data.lagTimeMin as number, 'n');
  setCell(ws, currentRow, 13, "Circulation Strokes"); setCell(ws, currentRow, 14, data.completeCirculationStrokes as number, 'n');

  // --- Rows 30-31: Drilling Parameters (WOB, SPP, etc.) ---
  currentRow = 30;
  setCell(ws, currentRow, 0, "WOB (Klbf)"); setCell(ws, currentRow, 1, data.wob as number, 'n');
  setCell(ws, currentRow, 2, "SPP (PSI)"); setCell(ws, currentRow, 3, data.spp as number, 'n');
  setCell(ws, currentRow, 4, "Flow Rate (GPM)"); setCell(ws, currentRow, 5, data.flowRate as number, 'n');
  setCell(ws, currentRow, 6, "RPM + TURB. (rpm)"); setCell(ws, currentRow, 7, data.rpmTurb as number, 'n');
  setCell(ws, currentRow, 8, "Torque (klbf.ft)"); setCell(ws, currentRow, 9, data.torque as number, 'n');
  
  // --- Rows 32-33: Lithological Data (Table Header) ---
  currentRow = 32;
  setCell(ws, currentRow, 0, "From (m)");
  setCell(ws, currentRow, 1, "To (m)");
  setCell(ws, currentRow, 2, "ROP (m/hr)"); mergeCells(ws, currentRow, 2, currentRow, 4);
  setCell(ws, currentRow, 5, "Lithological Description"); mergeCells(ws, currentRow, 5, currentRow, 10);
  currentRow++;
  
  currentRow = 33;
  setCell(ws, currentRow, 2, "(min)");
  setCell(ws, currentRow, 3, "(max)");
  setCell(ws, currentRow, 4, "(avg)");
  currentRow++;
  
  // Lithology Data Rows (starting at R34)
  (data.lithologyEntries as any[]).forEach(entry => {
    setCell(ws, currentRow, 0, entry.from, 'n');
    setCell(ws, currentRow, 1, entry.to, 'n');
    setCell(ws, currentRow, 2, entry.ropMin, 'n');
    setCell(ws, currentRow, 3, entry.ropMax, 'n');
    setCell(ws, currentRow, 4, entry.ropAvg, 'n');
    setCell(ws, currentRow, 5, entry.description); mergeCells(ws, currentRow, 5, currentRow, 10);
    currentRow++;
  });
  
  // --- Gas Data (Table Header) ---
  // Start Gas Data after Lithology, ensuring at least R39 if Lithology is empty
  currentRow = Math.max(currentRow, 39);
  const gasHeaderRow = currentRow;
  
  setCell(ws, gasHeaderRow, 0, "From (m)");
  setCell(ws, gasHeaderRow, 1, "To (m)");
  setCell(ws, gasHeaderRow, 2, "TYPE");
  setCell(ws, gasHeaderRow, 3, "TOT. GAS (%)");
  setCell(ws, gasHeaderRow, 4, "C1 (ppm)");
  setCell(ws, gasHeaderRow, 5, "C2 (ppm)");
  setCell(ws, gasHeaderRow, 6, "C3 (ppm)");
  setCell(ws, gasHeaderRow, 7, "iC4 (ppm)");
  setCell(ws, gasHeaderRow, 8, "nC4 (ppm)");
  setCell(ws, gasHeaderRow, 9, "iC5 (ppm)");
  setCell(ws, gasHeaderRow, 10, "nC5 (ppm)");
  setCell(ws, gasHeaderRow, 11, "Remarks"); mergeCells(ws, gasHeaderRow, 11, gasHeaderRow, 15);
  currentRow++;
  
  // Gas Data Rows
  (data.gasEntries as any[]).forEach(entry => {
    setCell(ws, currentRow, 0, entry.from, 'n');
    setCell(ws, currentRow, 1, entry.to, 'n');
    setCell(ws, currentRow, 2, entry.type);
    setCell(ws, currentRow, 3, entry.totGas, 'n');
    setCell(ws, currentRow, 4, entry.c1, 'n');
    setCell(ws, currentRow, 5, entry.c2, 'n');
    setCell(ws, currentRow, 6, entry.c3, 'n');
    setCell(ws, currentRow, 7, entry.iC4, 'n');
    setCell(ws, currentRow, 8, entry.nC4, 'n');
    setCell(ws, currentRow, 9, entry.iC5, 'n');
    setCell(ws, currentRow, 10, entry.nC5, 'n');
    setCell(ws, currentRow, 11, entry.remarks); mergeCells(ws, currentRow, 11, currentRow, 15);
    currentRow++;
  });
  
  // --- Operations Log (Table Header) ---
  // Start Operations Log after Gas Data, ensuring at least R49 if Gas Data is short
  currentRow = Math.max(currentRow, 49);
  
  setCell(ws, currentRow, 0, "From");
  setCell(ws, currentRow, 1, "To");
  setCell(ws, currentRow, 2, "Duration");
  setCell(ws, currentRow, 3, "Remark"); mergeCells(ws, currentRow, 3, currentRow, 10);
  currentRow++;
  
  (data.operationEntries as any[]).forEach(entry => {
    const duration = calculateDuration(entry.fromTime, entry.toTime);
    setCell(ws, currentRow, 0, entry.fromTime);
    setCell(ws, currentRow, 1, entry.toTime);
    setCell(ws, currentRow, 2, duration);
    setCell(ws, currentRow, 3, entry.remark); mergeCells(ws, currentRow, 3, currentRow, 10);
    currentRow++;
  });
  
  // Set column widths (optional but good practice)
  ws['!cols'] = [
    { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, 
    { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, 
    { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, 
    { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, 
    { wch: 10 }, { wch: 10 }, { wch: 10 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Data_Entry");
  return wb;
}