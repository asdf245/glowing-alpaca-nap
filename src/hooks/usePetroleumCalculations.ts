import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ReportData, StringDataEntry, WellProfileEntry } from '@/types/report';

// --- Constants ---
const CONST_CAPACITY = 1029.4; // 1029.4 = 4 * 144 / (PI * 5.6146) -> (in^2 / 1029.4) = bbl/ft
const FT_PER_M = 3.28084;
const FRACTURE_GRADIENT_ASSUMPTION = 0.8; // psi/ft (Simplified assumption for MAMW)
const PUMP_EFFICIENCY = 0.95; // Assume 95% efficiency for triplex pump

// --- Helper Functions for Parsing & Conversion ---

const parseHoleSize = (sizeStr: string): number => {
  if (!sizeStr) return 8.5;
  const parts = sizeStr.split(' ');
  let size = 0;
  if (parts.length === 1) {
    size = parseFloat(parts[0]);
  } else if (parts.length === 2) {
    const whole = parseFloat(parts[0]);
    const fractionParts = parts[1].split('/');
    if (fractionParts.length === 2) {
      size = whole + (parseFloat(fractionParts[0]) / parseFloat(fractionParts[1]));
    }
  }
  return isNaN(size) || size <= 0 ? 8.5 : size;
};

const parseNozzleArea = (nozzleStr: string): number => {
  if (!nozzleStr) return 0.5;
  const nozzles = nozzleStr.split('-').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n) && n > 0);
  const totalAreaFactor = nozzles.reduce((sum, n) => sum + (n * n), 0);
  const At = (Math.PI / 4) * (totalAreaFactor / 1024);
  return At;
};

export interface CalculationResults {
    // Inputs
    flowRate: number;
    mudWeight: number;
    spp: number;
    holeSize: string;
    nozzle: string;
    tvd: number;
    pv: number;
    yp: number;
    linerSizeIn: number;
    strokeLengthIn: number;
    rheology600: number;
    rheology300: number;
    
    // Volumes
    totalHoleVolume: number;
    annulusVolume: number;
    capacityVolume: number;
    steelVolume: number;
    displaceVolume: number;
    lagTimeBbl: number;
    lagTimeMin: number;
    completeCirculationStrokes: number;
    
    // Hydraulics
    annVelocity: number;
    jetVelocity: number;
    bitHhp: number;
    hsi: number;
    
    // Pressure/Density
    hydrostaticPressure: number;
    annularPressureLoss: number;
    ecd: number;
    emw: number;
    mamw: number;
    tripMargin: number;
}

export function usePetroleumCalculations(): CalculationResults {
  const { watch, setValue } = useFormContext<ReportData>();

  // Watch all relevant inputs
  const inputs = watch([
    'flowRate', 'mudWeight', 'spp', 'holeSize', 'tvd', 'pv', 'yp', 
    'rheology600', 'rheology300', 'linerSizeIn', 'strokeLengthIn', 
    'stringData', 'wellProfile', 'presentBit.nozzle'
  ]);

  const [
    flowRate, mudWeight, spp, holeSize, tvd, pv, yp, 
    rheology600, rheology300, linerSizeIn, strokeLengthIn, 
    stringData, wellProfile, nozzle
  ] = inputs as [
    number, number, number, string, number, number, number, 
    number, number, number, number, 
    StringDataEntry[], WellProfileEntry[], string
  ];

  // Defaulting inputs
  const Q = flowRate || 0; // Q in GPM
  const MW_PCF = mudWeight || 0; // MW in pcf
  const SPP = spp || 0; // SPP in PSI
  const Dh_str = holeSize || '8.5'; 
  const Nozzle_str = nozzle || '12-12-12'; 
  const TVD_M = tvd || 0; 
  const PV = pv || 0; 
  const YP = yp || 0; 
  const Liner_in = linerSizeIn || 6.5; 
  const Stroke_in = strokeLengthIn || 12; 
  
  // Conversion factors
  const TVD_FT = TVD_M * FT_PER_M; // TVD in feet
  const MW_PPG = MW_PCF / 7.48; // Mud Weight from pcf to ppg (7.48 pcf = 1 ppg)

  // --- Volume Calculations ---
  
  let totalHoleVolume = 0;
  let capacityVolume = 0;
  let steelVolume = 0;

  // 1. Calculate Total Hole Volume (V_Hole)
  wellProfile.forEach(wp => {
      const L_ft = (wp.bottomM || 0) - (wp.topM || 0);
      const ID_hole = wp.idIn || 0;
      if (ID_hole > 0 && L_ft > 0) {
          totalHoleVolume += (ID_hole * ID_hole / CONST_CAPACITY) * L_ft;
      }
  });

  // 2. Calculate Capacity Volume (V_Pipe) and Steel Volume (V_Steel)
  stringData.forEach(s => {
      const L_ft = (s.lengthM || 0) * FT_PER_M;
      const ID_in = s.idIn || 0;
      const OD_in = s.odIn || 0;
      
      if (ID_in > 0) {
          capacityVolume += (ID_in * ID_in / CONST_CAPACITY) * L_ft;
      }
      
      if (OD_in > 0 && ID_in > 0) {
          steelVolume += ((OD_in * OD_in - ID_in * ID_in) / CONST_CAPACITY) * L_ft;
      }
  });

  // 3. Annulus Volume (V_Annulus)
  const annulusVolume = totalHoleVolume - steelVolume;

  // 4. Displace Volume (V_Displace)
  const displaceVolume = capacityVolume + steelVolume; 

  // 5. Pump Output (Triplex Pump, bbl/stroke)
  // Formula: Pump Output (bbl/stroke) = 0.000243 * Liner Size^2 * Stroke Length * Efficiency
  let pumpOutput = 0;
  if (Liner_in > 0 && Stroke_in > 0) {
      pumpOutput = 0.000243 * (Liner_in * Liner_in) * Stroke_in * PUMP_EFFICIENCY;
  }

  // 6. Lag Time (Time for mud to travel from bit to surface)
  const flowRateBBL_min = Q / 42; // GPM to BBL/min (1 bbl = 42 gal)
  let lagTimeBbl = annulusVolume;
  let lagTimeMin = 0;
  if (flowRateBBL_min > 0) {
      lagTimeMin = annulusVolume / flowRateBBL_min;
  }

  // 7. Complete Circulation Strokes (Strokes)
  let completeCirculationStrokes = 0;
  if (pumpOutput > 0) {
      const totalCirculationVolume = capacityVolume + annulusVolume;
      completeCirculationStrokes = totalCirculationVolume / pumpOutput;
  }

  // --- Hydraulic Calculations ---

  const holeDiameter = parseHoleSize(Dh_str);
  const nozzleArea = parseNozzleArea(Nozzle_str); // Total nozzle area in sq. inches

  // 1. Annular Velocity (AV) - m/min (Simplified)
  const avgPipeOD = stringData.length > 0 ? stringData.reduce((sum, s) => sum + (s.odIn || 0), 0) / stringData.length : 3.5;
  const annularAreaFactor = (holeDiameter * holeDiameter) - (avgPipeOD * avgPipeOD);
  let annVelocity = 0;
  if (annularAreaFactor > 0 && Q > 0) {
    const flowRateLPM = Q * 3.785; // GPM to LPM
    const annularAreaSqM = annularAreaFactor * 0.00064516; // in^2 to m^2
    annVelocity = (flowRateLPM / annularAreaSqM) * 0.001; // m/min
  }
  
  // 2. Jet Velocity (JV) - m/s
  let jetVelocity = 0;
  if (Q > 0 && nozzleArea > 0) {
    const JV_ft_sec = 0.32 * (Q / nozzleArea);
    jetVelocity = JV_ft_sec * 0.3048;
  }

  // 3. Bit Hydraulic Horsepower (BHHP) - HP
  let bitHhp = 0;
  if (Q > 0 && SPP > 0) {
    bitHhp = (Q * SPP) / 1714;
  }

  // 4. Hydraulic Specific Index (HSI) - HHP/inch²
  let hsi = 0;
  if (bitHhp > 0 && holeDiameter > 0) {
    hsi = bitHhp / (holeDiameter * holeDiameter);
  }

  // 5. Annular Pressure Loss (APL) - PSI (Simplified)
  let annularPressureLoss = 0;
  if (MW_PPG > 0 && PV > 0 && Q > 0 && TVD_FT > 0) {
    // Simplified APL calculation (using a generic constant)
    annularPressureLoss = (MW_PPG * PV * Q * TVD_FT) / 1000000; 
  }

  // 6. Equivalent Circulating Density (ECD) - pcf
  let ecd = MW_PCF; 
  if (TVD_FT > 0 && MW_PCF > 0) {
    if (MW_PPG > 0 && annularPressureLoss > 0) {
        const ECD_PPG = MW_PPG + (annularPressureLoss / (0.052 * TVD_FT));
        ecd = ECD_PPG * 7.48; // Convert back to pcf
    }
  }
  
  // 7. Equivalent Mud Weight (EMW) based on SPP - pcf
  let emw = 0;
  if (SPP > 0 && TVD_FT > 0) {
    const EMW_PPG = SPP / (0.052 * TVD_FT);
    emw = EMW_PPG * 7.48; // Convert to pcf
  }

  // 8. Maximum Allowable Mud Weight (MAMW) - pcf
  let mamw = 0;
  if (FRACTURE_GRADIENT_ASSUMPTION > 0) {
    const MAMW_PPG = FRACTURE_GRADIENT_ASSUMPTION / 0.052;
    mamw = MAMW_PPG * 7.48; // Convert to pcf
  }

  // 9. Hydrostatic Pressure (HP) - PSI
  let hydrostaticPressure = 0;
  if (MW_PPG > 0 && TVD_FT > 0) {
    hydrostaticPressure = 0.052 * MW_PPG * TVD_FT;
  }

  // 10. Trip Margin (TM) - pcf
  const tripMargin = ecd - MW_PCF;


  // Update the form context with calculated values
  React.useEffect(() => {
    setValue('annVelocity', parseFloat(annVelocity.toFixed(2)));
    setValue('jetVelocity', parseFloat(jetVelocity.toFixed(2)));
    setValue('bitHhp', parseFloat(bitHhp.toFixed(2)));
    setValue('hsi', parseFloat(hsi.toFixed(2)));
    setValue('ecd', parseFloat(ecd.toFixed(2)));
    
    // Pressure/Density
    setValue('hydrostaticPressure', parseFloat(hydrostaticPressure.toFixed(2)));
    setValue('annularPressureLoss', parseFloat(annularPressureLoss.toFixed(2)));
    setValue('emw', parseFloat(emw.toFixed(2)));
    setValue('tripMargin', parseFloat(tripMargin.toFixed(2)));
    setValue('mamw', parseFloat(mamw.toFixed(2)));
    
    // New calculated fields
    setValue('totalHoleVolume', parseFloat(totalHoleVolume.toFixed(2)));
    setValue('annulusVolume', parseFloat(annulusVolume.toFixed(2)));
    setValue('capacityVolume', parseFloat(capacityVolume.toFixed(2)));
    setValue('steelVolume', parseFloat(steelVolume.toFixed(2)));
    setValue('displaceVolume', parseFloat(displaceVolume.toFixed(2)));
    setValue('lagTimeBbl', parseFloat(lagTimeBbl.toFixed(2)));
    setValue('lagTimeMin', parseFloat(lagTimeMin.toFixed(2)));
    setValue('completeCirculationStrokes', Math.round(completeCirculationStrokes));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, inputs); // Depend on all watched inputs

  return {
    flowRate: Q,
    mudWeight: MW_PCF,
    spp: SPP,
    holeSize: Dh_str,
    nozzle: Nozzle_str,
    tvd: TVD_M,
    pv: PV,
    yp: YP,
    linerSizeIn: Liner_in,
    strokeLengthIn: Stroke_in,
    rheology600: rheology600,
    rheology300: rheology300,
    
    totalHoleVolume: parseFloat(totalHoleVolume.toFixed(2)),
    annulusVolume: parseFloat(annulusVolume.toFixed(2)),
    capacityVolume: parseFloat(capacityVolume.toFixed(2)),
    steelVolume: parseFloat(steelVolume.toFixed(2)),
    displaceVolume: parseFloat(displaceVolume.toFixed(2)),
    lagTimeBbl: parseFloat(lagTimeBbl.toFixed(2)),
    lagTimeMin: parseFloat(lagTimeMin.toFixed(2)),
    completeCirculationStrokes: Math.round(completeCirculationStrokes),
    
    annVelocity: parseFloat(annVelocity.toFixed(2)),
    jetVelocity: parseFloat(jetVelocity.toFixed(2)),
    bitHhp: parseFloat(bitHhp.toFixed(2)),
    hsi: parseFloat(hsi.toFixed(2)),
    
    hydrostaticPressure: parseFloat(hydrostaticPressure.toFixed(2)),
    annularPressureLoss: parseFloat(annularPressureLoss.toFixed(2)),
    ecd: parseFloat(ecd.toFixed(2)),
    emw: parseFloat(emw.toFixed(2)),
    mamw: parseFloat(mamw.toFixed(2)),
    tripMargin: parseFloat(tripMargin.toFixed(2)),
  };
}