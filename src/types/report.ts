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
  annVelocity: z.number().min(0).optional(),
  jetVelocity: z.number().min(0).optional(),
  bitHhp: z.number().min(0).optional(),
  hsi: z.number().min(0).optional(),
  ecd: z.number().min(0).optional(),
  mudWeight: z.number().min(0, "Mud Weight is required"),
  viscosity: z.number().min(0, "Viscosity is required"),
  pv: z.number().min(0).optional(),
  yp: z.number().min(0).optional(),
  gels: z.string().optional(),
  wL: z.number().min(0).optional(),
  cl: z.number().min(0).optional(),
  ph: z.number().min(0).max(14, "PH must be between 0 and 14").required(),
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
}).refine(data => data.depthTo >= data.depthFrom, {
  message: "To depth must be greater than or equal to From depth",
  path: ["depthTo"],
});

export type ReportData = z.infer<typeof ReportSchema>;
export type LithologyEntry = z.infer<typeof LithologyEntrySchema>;
export type GasEntry = z.infer<typeof GasEntrySchema>;
export type OperationEntry = z.infer<typeof OperationEntrySchema>;

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
  presentBit: {},
  equipmentCalibration: {},
  dayCrew: [{ number: 1, name: '' }, { number: 2, name: '' }],
  nightCrew: [{ number: 1, name: '' }, { number: 2, name: '' }],
  includeSignatures: true,
  includeCalibrationData: true,
  exportReadOnly: false,
};