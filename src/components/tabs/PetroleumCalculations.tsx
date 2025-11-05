import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ReportData, StringDataEntry, WellProfileEntry } from '@/types/report';
import { FormField } from '@/components/FormField';
import { Separator } from '@/components/ui/separator';
import { DynamicTable } from '@/components/DynamicTable';
import { usePetroleumCalculations } from '@/hooks/usePetroleumCalculations';

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
  const { setValue } = useFormContext<ReportData>();
  const results = usePetroleumCalculations();

  // Destructure inputs for display in the footer
  const { 
    flowRate, mudWeight, spp, holeSize, nozzle, tvd, pv, yp, 
    linerSizeIn, strokeLengthIn, rheology600, rheology300 
  } = results;

  // Helper function to parse hole size for display in the footer
  const parseHoleSizeForDisplay = (sizeStr: string): string => {
    if (!sizeStr) return '8.5';
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
    return isNaN(size) || size <= 0 ? '8.5' : size.toFixed(2);
  };
  
  // Helper function to parse nozzle area for display in the footer
  const parseNozzleAreaForDisplay = (nozzleStr: string): string => {
    if (!nozzleStr) return '0.5';
    const nozzles = nozzleStr.split('-').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n) && n > 0);
    const totalAreaFactor = nozzles.reduce((sum, n) => sum + (n * n), 0);
    const At = (Math.PI / 4) * (totalAreaFactor / 1024);
    return At.toFixed(4);
  };


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
      
      {/* Pump & Rheology Inputs */}
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
          value={results.totalHoleVolume}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Annulus Volume (Bit → Surface)"
          unit="bbl"
          type="number"
          value={results.annulusVolume}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Capacity Volume (Inside String)"
          unit="bbl"
          type="number"
          value={results.capacityVolume}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Steel Volume"
          unit="bbl"
          type="number"
          value={results.steelVolume}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Displace Volume (Steel + Capacity)"
          unit="bbl"
          type="number"
          value={results.displaceVolume}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Lag Time (Bit → Surface)"
          unit="min"
          type="number"
          value={results.lagTimeMin}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Complete Circulation Strokes"
          unit="strokes"
          type="number"
          value={results.completeCirculationStrokes}
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
          value={results.annVelocity}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Jet Velocity (JV)"
          unit="m/s"
          type="number"
          value={results.jetVelocity}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Bit Hydraulic Horsepower (BHHP)"
          unit="HP"
          type="number"
          value={results.bitHhp}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Hydraulic Specific Index (HSI)"
          unit="HHP/inch²"
          type="number"
          value={results.hsi}
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
          value={results.hydrostaticPressure}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Annular Pressure Loss (APL)"
          unit="PSI"
          type="number"
          value={results.annularPressureLoss}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Equivalent Circulating Density (ECD)"
          unit="pcf"
          type="number"
          value={results.ecd}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Equivalent Mud Weight (EMW)"
          unit="pcf"
          type="number"
          value={results.emw}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Max Allowable Mud Weight (MAMW)"
          unit="pcf"
          type="number"
          value={results.mamw}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Trip Margin (TM)"
          unit="pcf"
          type="number"
          value={results.tripMargin}
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
        <p>Hole Size (Dh): <span className="font-medium text-foreground">{holeSize} in ({parseHoleSizeForDisplay(holeSize as string)} parsed)</span></p>
        <p>Nozzle Sizes: <span className="font-medium text-foreground">{nozzle} (Total Area: {parseNozzleAreaForDisplay(nozzle as string)} in²)</span></p>
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