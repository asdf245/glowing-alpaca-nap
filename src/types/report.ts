import { z } from 'zod';

// --- Sub-Schemas for Tables ---

const LithologyEntrySchema = z.object({
  id: z.string(),
  from: z.number().min(0),
  to: z.number().min(0),
  ropMin: z.number().min(0).optional(),
  ropMax: z.number().min(0).optional(),
  ropAvg: z.number().min(0).optional(),
  description: z.string().max(500).optional(),
}).refine(data => data.to >= data.from, {
  message: "To depth must be greater than or equal to From depth",
  path: ["to"],
});

const GasEntrySchema = z.object({
  id: z.string(),
  from: z.number().min(0),
  to: z.number().min(0),
  type: z.enum(['FG', 'CG', 'TG', 'BG']),
  totGas: z.number().min(0).max(100).optional(),
  c1: z.number().min(0).optional(),
  c2: z.number().min(0).optional(),
  c3: z.number().min(0).optional(),
  iC4: z.number().min(0).optional(),
  nC4: z.number().min(0).optional(),
  iC5: z.number().min(0).optional(),
  nC5: z.number().min(0).optional(),
  remarks: z.string().max(200).optional(),
}).refine(data => data.to >= data.from, {
  message: "To depth must be greater than or equal to From depth",
  path: ["to"],
});

const OperationEntrySchema = z.object({
  id: z.string(),
  fromTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Must be HH:MM:SS format"),
  toTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Must be HH:MM:SS format"),
  duration: z.string().optional(), // Calculated
  remark: z.string().max(500).optional(),
});

const StringDataEntrySchema = z.object({
  id: z.string(),
  type: z.string().min(1, "Type is required"),
  idIn: z.number().min(0).optional(), // ID (in)
  odIn: z.number().min(0).optional(), // OD (in)
  lbFt: z.number().min(0).optional(), // lb/ft
  lengthM: z.number().min(0).optional(), // Length (m)
});

const WellProfileEntrySchema = z.object({
  id: z.string(),
  type: z.string().min(1, "Type is required"), // e.g., LINER 7", OPEN HOLE 5.875"
  idIn: z.number().min(0).optional(), // ID (in)
  topM: z.number().min(0).optional(), // TOP (m)
  bottomM: z.number().min(0).optional(), // BOTTOM (m)
  lengthM: z.number().optional(), // Calculated: bottomM - topM
});


// --- Main Report Schema ---

export const ReportSchema = z.object({
  // 1. General Information
  date: z.string().min(1, "Date is required"),
  reportNo: z.number().min(1, "Report No. is required"),
  rigSpudDate: z.string().optional(),
  unitSpudDate: z.string().optional(),
  wellName: z.string().min(1, "Well Name is required"),
  mDepth: z.number().min(0, "M. Depth is required"),
  fieldName: z.string().min(1, "Field Name is required"),
  wellPurpose: z.enum(['Workover', 'Drilling', 'Exploration', 'Appraisal']).default('Drilling'),
  wellType: z.enum(['Vertical', 'Directional', 'Horizontal']).default('Vertical'),
  holeSize: z.string().min(1, "Hole Size is required"),
  gleRte: z.string().optional(),
  wD: z.number().min(0).optional(),
  tvd: z.number().min(0).optional(),
  rigName: z.string().min(1, "Rig Name is required"),
  rigType: z.enum(['Workover', 'Drilling']).optional(),
  customer: z.string().default('NISOC'),
  contractor: z.string().default('NIDC'),
  mlUnitId: z.string().optional(),
  lastSurveyM: z.number().min(0).optional(),
  inc: z.number().optional(),
  azi: z.number().optional(),
  lastSurveyTvdM: z.number().min(0).optional(),
  lastKickOfPointM: z.number().min(0).optional(),
  lastFormation: z.string().optional(),
  lastFormationM: z.number().min(0).optional(),
  lastCasingSize: z.number().min(0).optional(),
  lastCasingM: z.number().min(0).optional(),

  // 2. Bit Data
  presentBit: z.object({
    bitRunNo: z.number().min(0).optional(),
    type: z.enum(['PDC', 'Tricone', 'Roller Cone', 'Diamond', '']).optional(),
    serialNo: z.string().optional(),
    manufacture: z.string().optional(),
    nozzle: z.string().optional(),
    bitSize: z.string().optional(),
    dailyOnBottomTime: z.number().min(0).optional(),
    accDrillingTime: z.number().min(0).optional(),
    accCounterRpm: z.number().min(0).optional(),
    dailyCircTime: z.number().min(0).optional(),
    accCircTime: z.number().min(0).optional(),
  }).default({}),
  pulledOutBit: z.object({
    depthIn: z.number().min(0).optional(),
    bitRunNo: z.number().min(0).optional(),
    type: z.enum(['PDC', 'Tricone', 'Roller Cone', 'Diamond', '']).optional(),
    serialNo: z.string().optional(),
    manufacture: z.string().optional(),
    nozzle: z.string().optional(),
    bitSize: z.string().optional(),
    dailyOnBottomTime: z.number().min(0).optional(),
    accDrillingTime: z.number().min(0).optional(),
    accCounterRpm: z.number().min(0).optional(),
    dailyCircTime: z.number().min(0).optional(),
    accCircTime: z.number().min(0).optional(),
  }).optional(),
  
  // 3. Drilling Parameters
  depthFrom: z.number().min(0, "From depth is required"),
  depthTo: z.number().min(0, "To depth is required"),
  hours: z.number().min(0, "Hours is required"),
  wob: z.number().min(0).optional(),
  spp: z.number().min(0).optional(),
  flowRate: z.number().min(0).optional(),
  rpmTurb: z.number().min(0).optional(),
  torque: z.number().min(0).optional(),
  
  // Calculated Hydraulic Data (Inputs from Drilling Tab)
  annVelocity: z.number().min(0).optional(),
  jetVelocity: z.number().min(0).optional(),
  bitHhp: z.number().min(0).optional(),
  hsi: z.number().min(0).optional(),
  ecd: z.number().min(0).optional(),
  hydrostaticPressure: z.number().optional(), // Added
  annularPressureLoss: z.number().optional(), // Added
  emw: z.number().optional(), // Added
  tripMargin: z.number().optional(), // Added
  
  mudWeight: z.number().min(0, "Mud Weight is required"),
  viscosity: z.number().min(0, "Viscosity is required"),
  pv: z.number().min(0).optional(),
  yp: z.number().min(0).optional(),
  gels: z.string().optional(),
  wL: z.number().min(0).optional(),
  cl: z.number().min(0).optional(),
  ph: z.number().min(0).max(14, "PH must be between 0 and 14"), // Removed .required()
  totalDailyLosses: z.number().min(0).optional(),
  totalDailyFlow: z.number().min(0).optional(),
  totalWellLosses: z.number().min(0).optional(),
  totalWellFlow: z.number().min(0).optional(),

  // 4. Lithology Data
  lithologyEntries: z.array(LithologyEntrySchema).max(10).default([]),

  // 5. Gas Data
  gasEntries: z.array(GasEntrySchema).max(10).default([]),

  // 6. Operations Log
  operationEntries: z.array(OperationEntrySchema).max(20).default([]),

  // 7. Equipment Tab
  equipmentCalibration: z.object({
    gasDetector: z.object({ testDate: z.string().optional(), calibratedDate: z.string().optional(), result: z.enum(['OK', 'Failed', '']).optional() }).default({}),
    chromatograph: z.object({ testDate: z.string().optional(), calibratedDate: z.string().optional(), result: z.enum(['OK', 'Failed', '']).optional() }).default({}),
    h2s1: z.object({ testDate: z.string().optional(), calibratedDate: z.string().optional(), result: z.enum(['OK', 'Failed', '']).optional() }).default({}),
    h2s2: z.object({ testDate: z.string().optional(), calibratedDate: z.string().optional(), result: z.enum(['OK', 'Failed', '']).optional() }).default({}),
    h2s3: z.object({ testDate: z.string().optional(), calibratedDate: z.string().optional(), result: z.enum(['OK', 'Failed', '']).optional() }).default({}),
    calcimeter: z.object({ testDate: z.string().optional(), calibratedDate: z.string().optional(), result: z.enum(['OK', 'Failed', '']).optional() }).default({}),
  }).default({}),
  safetyMeeting: z.enum(['Yes', 'No']).optional(),
  dayCrew: z.array(z.object({ number: z.number().optional(), name: z.string().optional() })).max(2).default([{ number: 1, name: '' }, { number: 2, name: '' }]),
  nightCrew: z.array(z.object({ number: z.number().optional(), name: z.string().optional() })).max(2).default([{ number: 1, name: '' }, { number: 2, name: '' }]),

  // 8. Export Options
  includeSignatures: z.boolean().default(true),
  includeCalibrationData: z.boolean().default(true),
  exportReadOnly: z.boolean().default(false),
  
  // 9. Calculation Inputs (New)
  stringData: z.array(StringDataEntrySchema).default([]),
  wellProfile: z.array(WellProfileEntrySchema).default([]),
  rheology600: z.number().min(0).optional(),
  rheology300: z.number().min(0).optional(),
  
  // Calculated Volume/Time Data (New)
  totalHoleVolume: z.number().optional(),
  annulusVolume: z.number().optional(),
  capacityVolume: z.number().optional(),
  steelVolume: z.number().optional(),
  displaceVolume: z.number().optional(),
  lagTimeBbl: z.number().optional(),
  lagTimeMin: z.number().optional(),
  completeCirculationStrokes: z.number().optional(),
  
}).refine(data => (data.depthTo as number) >= (data.depthFrom as number), {
  message: "To depth must be greater than or equal to From depth",
  path: ["depthTo"],
});

export type ReportData = z.infer<typeof ReportSchema>;
export type LithologyEntry = z.infer<typeof LithologyEntrySchema>;
export type GasEntry = z.infer<typeof GasEntrySchema>;
export type OperationEntry = z.infer<typeof OperationEntrySchema>;
export type StringDataEntry = z.infer<typeof StringDataEntrySchema>;
export type WellProfileEntry = z.infer<typeof WellProfileEntrySchema>;

// Helper for initial state with sample data
export const initialReportData: ReportData = {
  date: '1404.08.12',
  reportNo: 221,
  rigSpudDate: '1404.01.07',
  unitSpudDate: '1404.01.08',
  wellName: 'AHVAZ#31',
  mDepth: 2113,
  fieldName: 'AHVAZ#31',
  wellPurpose: 'Workover',
  wellType: 'Vertical',
  holeSize: '5 7/8"',
  rigName: '84-FATH',
  rigType: 'Workover',
  customer: 'NISOC',
  contractor: 'NIDC',
  
  depthFrom: 2586,
  depthTo: 2607,
  hours: 15,
  mudWeight: 65,
  ph: 8,
  viscosity: 27,
  wob: 5,
  spp: 1000,
  flowRate: 120,
  rpmTurb: 50,
  torque: 1,

  lithologyEntries: [],
  gasEntries: [],
  operationEntries: [
    { id: 'op1', fromTime: '00:00:00', toTime: '09:00:00', remark: 'CONT RIH W/ 4-1/8 PDC BIT...', duration: '09:00:00' },
    { id: 'op2', fromTime: '09:00:00', toTime: '00:00:00', remark: 'RESUME DRLG FORMATION F/ 2586-2607...', duration: '15:00:00' },
  ],
  presentBit: {
    nozzle: '12-12-12', // Add nozzle for calculation inputs
  },
  equipmentCalibration: {
    gasDetector: {},
    chromatograph: {},
    h2s1: {},
    h2s2: {},
    h2s3: {},
    calcimeter: {},
  },
  dayCrew: [{ number: 1, name: '' }, { number: 2, name: '' }],
  nightCrew: [{ number: 1, name: '' }, { number: 2, name: '' }],
  includeSignatures: true,
  includeCalibrationData: true,
  exportReadOnly: false,
  
  // Initial Calculation Inputs (based on image structure)
  stringData: [
    { id: 's1', type: 'DC 4 3/4"', idIn: 3, odIn: 4.75, lbFt: 43.6, lengthM: 100 },
    { id: 's2', type: 'HWDP 3 1/2"', idIn: 2.06, odIn: 3.5, lbFt: 25.3, lengthM: 50 },
    { id: 's3', type: 'DP 2 7/8"', idIn: 2.15, odIn: 2.875, lbFt: 10.6, lengthM: 1056.26 },
    { id: 's4', type: 'DP 3.5"', idIn: 2.764, odIn: 3.5, lbFt: 13.3, lengthM: 1000 },
  ],
  wellProfile: [
    { id: 'w1', type: 'LINER 7"', idIn: 6.154, topM: 0, bottomM: 1656, lengthM: 1656 },
    { id: 'w2', type: 'LINER 5"', idIn: 4.28, topM: 1656, bottomM: 2585, lengthM: 929 },
    { id: 'w3', type: 'OPEN HOLE 5.875"', idIn: 5.875, topM: 2585, bottomM: 2607, lengthM: 22 },
  ],
  rheology600: 60,
  rheology300: 30,
};