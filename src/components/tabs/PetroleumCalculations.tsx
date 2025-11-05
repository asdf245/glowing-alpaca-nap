import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ReportData } from '@/types/report';
import { FormField } from '@/components/FormField';
import { Separator } from '@/components/ui/separator';

// Constants (Simplified for demonstration, real values depend on units and geometry)
const PUMP_EFFICIENCY = 0.9; // 90%
const CONSTANT_1 = 0.0000245; // Constant for BHHP calculation (simplified)
const CONSTANT_2 = 0.0005; // Constant for HSI calculation (simplified)

const PetroleumCalculations: React.FC = () => {
  const { watch, setValue } = useFormContext<ReportData>();

  // Input parameters from other tabs
  const flowRate = watch('flowRate') || 0; // GPM
  const mudWeight = watch('mudWeight') || 0; // pcf
  const spp = watch('spp') || 0; // PSI
  const holeSize = watch('holeSize') || '8.5'; // inch (Need to parse this string)
  const nozzle = watch('presentBit.nozzle') || '12-12-12'; // 1/32" (Need to parse this string)
  const tvd = watch('tvd') || 0; // m (Used for ECD calculation)

  // --- Helper Functions for Parsing ---

  // Parses hole size string (e.g., "8.5", "5 7/8") into a number (inches)
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

  // Parses nozzle string (e.g., "12-12-12") into total nozzle area (sq. inches)
  const parseNozzleArea = (nozzleStr: string): number => {
    if (!nozzleStr) return 0.5;
    const nozzles = nozzleStr.split('-').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n) && n > 0);
    
    // Area of one nozzle (A = pi * (d/2)^2) where d is in inches (n/32)
    // Total Area (At) = Sum(pi * (ni/32)^2 / 4)
    // Since we only need the sum of squares of nozzle sizes (n^2) for the calculation:
    const totalAreaFactor = nozzles.reduce((sum, n) => sum + (n * n), 0);
    
    // Convert factor (32nds squared) to square inches: (1/32)^2 * totalAreaFactor
    // (1/1024) * totalAreaFactor * (pi/4) is the actual area, but for JV/BHHP we often use the total area in 32nds squared.
    // Let's use the standard formula which relies on total nozzle area (At) in sq. inches.
    // At = (pi/4) * (Sum(ni^2) / 32^2)
    const At = (Math.PI / 4) * (totalAreaFactor / 1024);
    
    return At;
  };

  // --- Calculations ---

  const holeDiameter = parseHoleSize(holeSize as string);
  const nozzleArea = parseNozzleArea(nozzle as string); // Total nozzle area in sq. inches

  // 1. Annular Velocity (AV) - m/min
  // Assuming standard drill pipe OD (e.g., 5 inches) and using GPM for flow rate
  // AV (ft/min) = (24.5 * Q) / (Dh^2 - Dp^2)
  // Q in GPM, Dh in inches, Dp in inches.
  // Conversion factor from ft/min to m/min is 0.3048
  const drillPipeOD = 5; // Standard assumption for calculation
  const annularAreaFactor = (holeDiameter * holeDiameter) - (drillPipeOD * drillPipeOD);
  
  let annVelocity = 0;
  if (annularAreaFactor > 0 && flowRate > 0) {
    // Convert GPM to L/min (3.785 L/gal)
    const flowRateLPM = flowRate * 3.785;
    // Convert annular area (sq. inches) to sq. meters (0.00064516 sq. m / sq. inch)
    const annularAreaSqM = annularAreaFactor * 0.00064516;
    
    // AV (m/min) = Flow Rate (L/min) / Annular Area (sq. m) * 0.001 (L to m^3)
    annVelocity = (flowRateLPM / annularAreaSqM) * 0.001;
  }
  
  // 2. Jet Velocity (JV) - m/s
  // JV (ft/sec) = 0.32 * (Q / At)
  // Q in GPM, At in sq. inches.
  // Conversion factor from ft/sec to m/s is 0.3048
  let jetVelocity = 0;
  if (flowRate > 0 && nozzleArea > 0) {
    const JV_ft_sec = 0.32 * (flowRate / nozzleArea);
    jetVelocity = JV_ft_sec * 0.3048;
  }

  // 3. Bit Hydraulic Horsepower (BHHP) - HP
  // BHHP = (Q * SPP) / 1714
  // Q in GPM, SPP in PSI
  let bitHhp = 0;
  if (flowRate > 0 && spp > 0) {
    bitHhp = (flowRate * spp) / 1714;
  }

  // 4. Hydraulic Specific Index (HSI) - HHP/inch²
  // HSI = BHHP / (Hole Diameter)^2
  let hsi = 0;
  if (bitHhp > 0 && holeDiameter > 0) {
    hsi = bitHhp / (holeDiameter * holeDiameter);
  }

  // 5. Equivalent Circulating Density (ECD) - pcf
  // ECD = MW + (Annular Pressure Loss / (0.052 * TVD))
  // Annular Pressure Loss (APL) is complex. For simplicity, we'll use a simplified approximation 
  // or assume a fixed pressure loss factor for now, as calculating APL requires rheology data (PV, YP).
  // Simplified ECD: Assume APL is proportional to SPP and flow rate.
  // APL (PSI) = SPP * (1 - Jet Pressure Loss Ratio)
  // Let's use a simpler approximation based on a pressure drop factor (e.g., 100 PSI per 1000m TVD)
  
  let ecd = mudWeight; // Start with static mud weight
  if (tvd > 0 && mudWeight > 0) {
    // Simplified pressure loss factor (e.g., 50 PSI per 1000m TVD)
    const pressureLossFactor = 50; 
    const pressureLossPSI = (tvd / 1000) * pressureLossFactor;
    
    // ECD (pcf) = MW (pcf) + (Pressure Loss (PSI) / (0.052 * TVD (ft)))
    // Need to convert TVD from meters to feet (1m = 3.28084 ft)
    const tvdFt = tvd * 3.28084;
    
    if (tvdFt > 0) {
        ecd = mudWeight + (pressureLossPSI / (0.052 * tvdFt));
    }
  }
  
  // Update the form context with calculated values (optional, but useful for export)
  React.useEffect(() => {
    setValue('annVelocity', parseFloat(annVelocity.toFixed(2)));
    setValue('jetVelocity', parseFloat(jetVelocity.toFixed(2)));
    setValue('bitHhp', parseFloat(bitHhp.toFixed(2)));
    setValue('hsi', parseFloat(hsi.toFixed(2)));
    setValue('ecd', parseFloat(ecd.toFixed(2)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowRate, mudWeight, spp, holeSize, nozzle, tvd]);


  return (
    <div className="space-y-8 p-4">
      <h2 className="text-2xl font-bold text-[#003366]">9. Engineering Calculations</h2>

      <h3 className="text-xl font-semibold text-[#003366]">Hydraulic Parameters</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FormField
          label="Annular Velocity (AV)"
          unit="m/min"
          type="number"
          value={parseFloat(annVelocity.toFixed(2))}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Jet Velocity (JV)"
          unit="m/s"
          type="number"
          value={parseFloat(jetVelocity.toFixed(2))}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Bit Hydraulic Horsepower (BHHP)"
          unit="HP"
          type="number"
          value={parseFloat(bitHhp.toFixed(2))}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Hydraulic Specific Index (HSI)"
          unit="HHP/inch²"
          type="number"
          value={parseFloat(hsi.toFixed(2))}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Equivalent Circulating Density (ECD)"
          unit="pcf"
          type="number"
          value={parseFloat(ecd.toFixed(2))}
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
        <p>Hole Size (Dh): <span className="font-medium text-foreground">{holeSize} in ({holeDiameter.toFixed(2)} parsed)</span></p>
        <p>Nozzle Sizes: <span className="font-medium text-foreground">{nozzle} (Total Area: {nozzleArea.toFixed(4)} in²)</span></p>
        <p>True Vertical Depth (TVD): <span className="font-medium text-foreground">{tvd} m</span></p>
      </div>
      <p className="text-xs text-muted-foreground">Note: ECD calculation uses a simplified annular pressure loss approximation.</p>
    </div>
  );
};

export default PetroleumCalculations;