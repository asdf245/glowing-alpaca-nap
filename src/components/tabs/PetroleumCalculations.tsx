import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ReportData, StringDataEntry, WellProfileEntry } from '@/types/report';
import { FormField } from '@/components/FormField';
import { Separator } from '@/components/ui/separator';
import { DynamicTable } from '@/components/DynamicTable';

// Constants
const CONST_CAPACITY = 1029.4; // 1029.4 = 4 * 144 / (PI * 5.6146) -> (in^2 / 1029.4) = bbl/ft
const FT_PER_M = 3.28084;
const FRACTURE_GRADIENT_ASSUMPTION = 0.8; // psi/ft (Simplified assumption for MAMW)
const PUMP_EFFICIENCY = 0.95; // Assume 95% efficiency for triplex pump

// --- Dynamic Table Definitions ---

const STRING_COLUMNS = [
  { header: 'Type', accessor: 'type', type: 'text', width: '25%' },
  { header: 'ID', accessor: 'idIn', type: 'number', unit: 'in', width: '15%' },
  { header: 'OD', accessor: 'odIn', type: 'number', unit: 'in', width: '15%' },
  { header: 'lb/ft', accessor: 'lbFt', type: 'number', width: '15%' },
  { header: 'Length', accessor: 'lengthM', type: 'number', unit: 'm', width: '20%' },
];

const WELL_PROFILE_COLUMNS = [
  { header: 'Type', accessor: 'type', type: 'text', width: '25%' },
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

const DEFAULT_STRING_ROW: Omit<StringDataEntry, 'id'> = { type: '', idIn: undefined, odIn: undefined, lbFt: undefined, lengthM: undefined };
const DEFAULT_WELL_PROFILE_ROW: Omit<WellProfileEntry, 'id'> = { type: '', idIn: undefined, topM: undefined, bottomM: undefined, lengthM: undefined };


const PetroleumCalculations: React.FC = () => {
  const { watch, setValue } = useFormContext<ReportData>();

  // Input parameters
  const flowRate = watch('flowRate') || 0; // Q in GPM
  const mudWeight = watch('mudWeight') || 0; // MW in pcf
  const spp = watch('spp') || 0; // SPP in PSI
  const holeSize = watch('holeSize') || '8.5'; // Dh in inches (used for simplified calcs)
  const nozzle = watch('presentBit.nozzle') || '12-12-12'; // Nozzle sizes in 1/32"
  const tvd = watch('tvd') || 0; // TVD in m
  const pv = watch('pv') || 0; // Plastic Viscosity in cp
  const yp = watch('yp') || 0; // Yield Point in lbf/100ft²
  const rheology600 = watch('rheology600') || 0;
  const rheology300 = watch('rheology300') || 0;
  const linerSizeIn = watch('linerSizeIn') || 6.5; // Liner Size (in)
  const strokeLengthIn = watch('strokeLengthIn') || 12; // Stroke Length (in)
  
  const stringData = watch('stringData') || [];
  const wellProfile = watch('wellProfile') || [];

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
  
  // Conversion factors
  const TVD_FT = tvd * FT_PER_M; // TVD in feet
  const MW_PPG = mudWeight / 7.48; // Mud Weight from pcf to ppg (7.48 pcf = 1 ppg)

  // --- Volume Calculations (Based on String Data and Well Profile) ---
  
  let totalHoleVolume = 0;
  let capacityVolume = 0;
  let steelVolume = 0;

  // 1. Calculate Total Hole Volume (V_Hole)
  wellProfile.forEach(wp => {
      const L_ft = (wp.lengthM || 0) * FT_PER_M;
      const ID_hole = wp.idIn || 0;
      if (ID_hole > 0) {
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
  if (linerSizeIn > 0 && strokeLengthIn > 0) {
      pumpOutput = 0.000243 * (linerSizeIn * linerSizeIn) * strokeLengthIn * PUMP_EFFICIENCY;
  }

  // 6. Lag Time (Time for mud to travel from bit to surface)
  const flowRateBBL_min = flowRate / 42; // GPM to BBL/min (1 bbl = 42 gal)
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

  // --- Hydraulic Calculations (Recalculated) ---

  const holeDiameter = parseHoleSize(holeSize as string);
  const nozzleArea = parseNozzleArea(nozzle as string); // Total nozzle area in sq. inches

  // 1. Annular Velocity (AV) - m/min (Simplified, using average OD of string and average hole ID)
  const avgPipeOD = stringData.length > 0 ? stringData.reduce((sum, s) => sum + (s.odIn || 0), 0) / stringData.length : 3.5;
  const annularAreaFactor = (holeDiameter * holeDiameter) - (avgPipeOD * avgPipeOD);
  let annVelocity = 0;
  if (annularAreaFactor > 0 && flowRate > 0) {
    const flowRateLPM = flowRate * 3.785; // GPM to LPM
    const annularAreaSqM = annularAreaFactor * 0.00064516; // in^2 to m^2
    annVelocity = (flowRateLPM / annularAreaSqM) * 0.001; // m/min
  }
  
  // 2. Jet Velocity (JV) - m/s
  let jetVelocity = 0;
  if (flowRate > 0 && nozzleArea > 0) {
    const JV_ft_sec = 0.32 * (flowRate / nozzleArea);
    jetVelocity = JV_ft_sec * 0.3048;
  }

  // 3. Bit Hydraulic Horsepower (BHHP) - HP
  let bitHhp = 0;
  if (flowRate > 0 && spp > 0) {
    bitHhp = (flowRate * spp) / 1714;
  }

  // 4. Hydraulic Specific Index (HSI) - HHP/inch²
  let hsi = 0;
  if (bitHhp > 0 && holeDiameter > 0) {
    hsi = bitHhp / (holeDiameter * holeDiameter);
  }

  // 5. Annular Pressure Loss (APL) - PSI (Simplified)
  let annularPressureLoss = 0;
  if (MW_PPG > 0 && pv > 0 && flowRate > 0 && TVD_FT > 0) {
    // Simplified APL calculation (using a generic constant)
    annularPressureLoss = (MW_PPG * pv * flowRate * TVD_FT) / 1000000; 
  }

  // 6. Equivalent Circulating Density (ECD) - pcf
  let ecd = mudWeight; 
  if (TVD_FT > 0 && mudWeight > 0) {
    if (MW_PPG > 0 && annularPressureLoss > 0) {
        const ECD_PPG = MW_PPG + (annularPressureLoss / (0.052 * TVD_FT));
        ecd = ECD_PPG * 7.48; // Convert back to pcf
    }
  }
  
  // 7. Equivalent Mud Weight (EMW) based on SPP - pcf
  let emw = 0;
  if (spp > 0 && TVD_FT > 0) {
    const EMW_PPG = spp / (0.052 * TVD_FT);
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
  const tripMargin = ecd - mudWeight;


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
  }, [flowRate, mudWeight, spp, holeSize, nozzle, tvd, pv, yp, stringData, wellProfile, linerSizeIn, strokeLengthIn]);


  return (
    <div className="space-y-8 p-4">
      <h2 className="text-2xl font-bold text-[#003366]">9. Engineering Calculations</h2>

      {/* Input Tables */}
      <h3 className="text-xl font-semibold text-[#003366]">Well Profile (Casing/Hole Sections)</h3>
      <DynamicTable
        name="wellProfile"
        columns={WELL_PROFILE_COLUMNS as any}
        defaultRow={DEFAULT_WELL_PROFILE_ROW}
        maxRows={10}
        note="Define the ID and depth of each casing/liner/open hole section."
      />
      
      <Separator />

      <h3 className="text-xl font-semibold text-[#003366]">Drill String Data (BHA/DP)</h3>
      <DynamicTable
        name="stringData"
        columns={STRING_COLUMNS as any}
        defaultRow={DEFAULT_STRING_ROW}
        maxRows={10}
        note="Define the dimensions and length of each drill string component currently in the hole."
      />

      <Separator />
      
      {/* Rheology Inputs for Power Law Model (n, k) */}
      <h3 className="text-xl font-semibold text-[#003366]">Pump & Rheology Inputs</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FormField
          label="Liner Size"
          unit="in"
          type="number"
          value={linerSizeIn}
          onChange={(val) => setValue('linerSizeIn', val as number)}
        />
        <FormField
          label="Stroke Length"
          unit="in"
          type="number"
          value={strokeLengthIn}
          onChange={(val) => setValue('strokeLengthIn', val as number)}
        />
        <FormField
          label="Rheology @ 600 RPM"
          unit="°"
          type="number"
          value={rheology600}
          onChange={(val) => setValue('rheology600', val as number)}
        />
        <FormField
          label="Rheology @ 300 RPM"
          unit="°"
          type="number"
          value={rheology300}
          onChange={(val) => setValue('rheology300', val as number)}
        />
      </div>

      <Separator />

      {/* Volume Calculations */}
      <h3 className="text-xl font-semibold text-[#003366]">Volume & Circulation Time</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FormField
          label="Total Hole Volume"
          unit="bbl"
          type="number"
          value={watch('totalHoleVolume')}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Annulus Volume (Bit → Surface)"
          unit="bbl"
          type="number"
          value={watch('annulusVolume')}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Capacity Volume (Inside String)"
          unit="bbl"
          type="number"
          value={watch('capacityVolume')}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Steel Volume"
          unit="bbl"
          type="number"
          value={watch('steelVolume')}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Displace Volume (Steel + Capacity)"
          unit="bbl"
          type="number"
          value={watch('displaceVolume')}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Lag Time (Bit → Surface)"
          unit="min"
          type="number"
          value={watch('lagTimeMin')}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Complete Circulation Strokes"
          unit="strokes"
          type="number"
          value={watch('completeCirculationStrokes')}
          onChange={() => {}}
          isCalculated
          readOnly
        />
      </div>

      <Separator />

      {/* Hydraulic Parameters */}
      <h3 className="text-xl font-semibold text-[#003366]">Hydraulic Parameters (Simplified)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FormField
          label="Annular Velocity (AV)"
          unit="m/min"
          type="number"
          value={watch('annVelocity')}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Jet Velocity (JV)"
          unit="m/s"
          type="number"
          value={watch('jetVelocity')}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Bit Hydraulic Horsepower (BHHP)"
          unit="HP"
          type="number"
          value={watch('bitHhp')}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Hydraulic Specific Index (HSI)"
          unit="HHP/inch²"
          type="number"
          value={watch('hsi')}
          onChange={() => {}}
          isCalculated
          readOnly
        />
      </div>

      <Separator />
      
      {/* Pressure & Density Management */}
      <h3 className="text-xl font-semibold text-[#003366]">Pressure & Density Management</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FormField
          label="Hydrostatic Pressure (HP)"
          unit="PSI"
          type="number"
          value={watch('hydrostaticPressure')}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Annular Pressure Loss (APL)"
          unit="PSI"
          type="number"
          value={watch('annularPressureLoss')}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Equivalent Circulating Density (ECD)"
          unit="pcf"
          type="number"
          value={watch('ecd')}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Equivalent Mud Weight (EMW)"
          unit="pcf"
          type="number"
          value={watch('emw')}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Max Allowable Mud Weight (MAMW)"
          unit="pcf"
          type="number"
          value={watch('mamw')}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Trip Margin (TM)"
          unit="pcf"
          type="number"
          value={watch('tripMargin')}
          onChange={() => {}}
          isCalculated
          readOnly
        />
      </div>

      <Separator />

      <h3 className="text-xl font-semibold text-[#003366]">Input Data Used</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-muted-foreground">
        <p>Flow Rate (Q): <span className="font-medium text-foreground">{flowRate} GPM</span></p>
        <p>Mud Weight (MW): <span className="font-medium text-foreground">{mudWeight} pcf</span></p>
        <p>Standpipe Pressure (SPP): <span className="font-medium text-foreground">{spp} PSI</span></p>
        <p>Hole Size (Dh): <span className="font-medium text-foreground">{holeSize} in ({parseHoleSize(holeSize as string).toFixed(2)} parsed)</span></p>
        <p>Nozzle Sizes: <span className="font-medium text-foreground">{nozzle} (Total Area: {parseNozzleArea(nozzle as string).toFixed(4)} in²)</span></p>
        <p>True Vertical Depth (TVD): <span className="font-medium text-foreground">{tvd} m</span></p>
        <p>Plastic Viscosity (PV): <span className="font-medium text-foreground">{pv} cp</span></p>
        <p>Yield Point (YP): <span className="font-medium text-foreground">{yp} lbf/100ft²</span></p>
        <p>Liner Size: <span className="font-medium text-foreground">{linerSizeIn} in</span></p>
        <p>Stroke Length: <span className="font-medium text-foreground">{strokeLengthIn} in</span></p>
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Note: Hydraulic calculations are simplified and use average string/hole dimensions. Accurate pressure loss modeling requires the Power Law Index (n) and Consistency Index (k) which can be derived from the 600/300 RPM readings.
      </p>
    </div>
  );
};

export default PetroleumCalculations;