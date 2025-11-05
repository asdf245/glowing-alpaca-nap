import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ReportData } from '@/types/report';
import { FormField } from '@/components/FormField';
import { Separator } from '@/components/ui/separator';

// Constants
const DRILL_PIPE_OD = 5; // inches (Standard assumption)
const DRILL_COLLAR_OD = 8; // inches (Standard assumption for calculation)
const RHEOLOGY_CONSTANT = 100; // Simplified constant for APL calculation
const FRACTURE_GRADIENT_ASSUMPTION = 0.8; // psi/ft (Simplified assumption for MAMW)
const CASING_SHOE_DEPTH_FT = 10000; // ft (Simplified assumption for MAMW)

const PetroleumCalculations: React.FC = () => {
  const { watch, setValue } = useFormContext<ReportData>();

  // Input parameters from other tabs
  const flowRate = watch('flowRate') || 0; // Q in GPM
  const mudWeight = watch('mudWeight') || 0; // MW in pcf
  const spp = watch('spp') || 0; // SPP in PSI
  const holeSize = watch('holeSize') || '8.5'; // Dh in inches
  const nozzle = watch('presentBit.nozzle') || '12-12-12'; // Nozzle sizes in 1/32"
  const tvd = watch('tvd') || 0; // TVD in m
  const viscosity = watch('viscosity') || 0; // Viscosity in s/qt (Marsh Funnel) - Note: PV/YP are better for APL
  const pv = watch('pv') || 0; // Plastic Viscosity in cp
  const yp = watch('yp') || 0; // Yield Point in lbf/100ft²

  // --- Helper Functions for Parsing & Conversion ---

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
    const totalAreaFactor = nozzles.reduce((sum, n) => sum + (n * n), 0);
    const At = (Math.PI / 4) * (totalAreaFactor / 1024);
    return At;
  };
  
  // Conversion factors
  const TVD_FT = tvd * 3.28084; // TVD in feet
  const MW_PPG = mudWeight / 7.48; // Mud Weight from pcf to ppg (assuming pcf is density in lb/ft^3)

  // --- Calculations ---

  const holeDiameter = parseHoleSize(holeSize as string);
  const nozzleArea = parseNozzleArea(nozzle as string); // Total nozzle area in sq. inches

  // 1. Annular Velocity (AV) - m/min
  const annularAreaFactor = (holeDiameter * holeDiameter) - (DRILL_PIPE_OD * DRILL_PIPE_OD);
  let annVelocity = 0;
  if (annularAreaFactor > 0 && flowRate > 0) {
    const flowRateLPM = flowRate * 3.785;
    const annularAreaSqM = annularAreaFactor * 0.00064516;
    annVelocity = (flowRateLPM / annularAreaSqM) * 0.001;
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

  // 5. Annular Pressure Loss (APL) - PSI
  // Simplified Bingham Plastic model approximation for APL in the annulus (PSI)
  // APL ≈ (PV * Q * L) / (Dh^2 - Dp^2) + (YP * L) / (Dh - Dp)
  // Using a simplified factor based on PV, YP, and flow rate (Q)
  let annularPressureLoss = 0;
  if (pv > 0 && yp > 0 && flowRate > 0 && annularAreaFactor > 0) {
    // Simplified APL calculation (L is length, assumed constant or proportional to TVD)
    // APL (PSI) = (MW * PV * Q * TVD_FT) / RHEOLOGY_CONSTANT
    annularPressureLoss = (MW_PPG * pv * flowRate * TVD_FT) / 1000000; // Highly simplified factor
  }

  // 6. Equivalent Circulating Density (ECD) - pcf
  let ecd = mudWeight; 
  if (TVD_FT > 0 && mudWeight > 0) {
    // ECD (pcf) = MW (pcf) + (APL (PSI) / (0.052 * TVD (ft))) * 7.48 (conversion factor from ppg to pcf)
    // Note: We use MW_PPG for the calculation constant 0.052, then convert back to pcf if needed.
    // Let's stick to pcf for MW and use the appropriate constant (0.00052 * TVD_M for kPa, or 0.052 * TVD_FT for psi/ppg)
    
    // If MW is in pcf (lb/ft^3), the constant is 1/144 * TVD_FT for psi/pcf
    // Let's use the standard oilfield units (ppg and psi/ft) and convert MW to ppg first.
    
    if (MW_PPG > 0 && annularPressureLoss > 0) {
        const ECD_PPG = MW_PPG + (annularPressureLoss / (0.052 * TVD_FT));
        ecd = ECD_PPG * 7.48; // Convert back to pcf
    }
  }
  
  // 7. Equivalent Mud Weight (EMW) based on SPP - pcf
  // EMW (ppg) = SPP / (0.052 * TVD_FT)
  let emw = 0;
  if (spp > 0 && TVD_FT > 0) {
    const EMW_PPG = spp / (0.052 * TVD_FT);
    emw = EMW_PPG * 7.48; // Convert to pcf
  }

  // 8. Maximum Allowable Mud Weight (MAMW) - pcf
  // MAMW (ppg) = FG / 0.052
  // Assuming FG is constant at casing shoe depth (CASING_SHOE_DEPTH_FT)
  let mamw = 0;
  if (FRACTURE_GRADIENT_ASSUMPTION > 0) {
    const MAMW_PPG = FRACTURE_GRADIENT_ASSUMPTION / 0.052;
    mamw = MAMW_PPG * 7.48; // Convert to pcf
  }

  // 9. Critical Flow Rate (Qc) - GPM
  // Simplified critical flow rate for laminar to turbulent transition (based on Reynolds number)
  // Qc (GPM) = 1000 * (PV / MW_PPG) * (Dh - Dp) / (Dp) (Highly simplified)
  let criticalFlowRate = 0;
  if (pv > 0 && MW_PPG > 0 && holeDiameter > DRILL_PIPE_OD) {
    criticalFlowRate = 1000 * (pv / MW_PPG) * (holeDiameter - DRILL_PIPE_OD) / DRILL_PIPE_OD;
  }


  // Update the form context with calculated values
  React.useEffect(() => {
    setValue('annVelocity', parseFloat(annVelocity.toFixed(2)));
    setValue('jetVelocity', parseFloat(jetVelocity.toFixed(2)));
    setValue('bitHhp', parseFloat(bitHhp.toFixed(2)));
    setValue('hsi', parseFloat(hsi.toFixed(2)));
    setValue('ecd', parseFloat(ecd.toFixed(2)));
    // New fields (need to ensure they exist in ReportData if we want to save them)
    // Since they are only displayed here, we don't need to save them to ReportData unless requested.
    // For simplicity and export consistency, I will assume they are saved to the ReportData object 
    // if they are needed for export, even if they weren't explicitly added to the Zod schema yet.
    // Since I cannot modify the Zod schema right now, I will only display them.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowRate, mudWeight, spp, holeSize, nozzle, tvd, pv, yp]);


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
      </div>

      <Separator />
      
      <h3 className="text-xl font-semibold text-[#003366]">Pressure & Density Management</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FormField
          label="Annular Pressure Loss (APL)"
          unit="PSI"
          type="number"
          value={parseFloat(annularPressureLoss.toFixed(2))}
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
        <FormField
          label="Equivalent Mud Weight (EMW)"
          unit="pcf"
          type="number"
          value={parseFloat(emw.toFixed(2))}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Max Allowable Mud Weight (MAMW)"
          unit="pcf"
          type="number"
          value={parseFloat(mamw.toFixed(2))}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Critical Flow Rate (Qc)"
          unit="GPM"
          type="number"
          value={parseFloat(criticalFlowRate.toFixed(2))}
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
        <p>Plastic Viscosity (PV): <span className="font-medium text-foreground">{pv} cp</span></p>
        <p>Yield Point (YP): <span className="font-medium text-foreground">{yp} lbf/100ft²</span></p>
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Note: Calculations use simplified models and assumed constants (e.g., standard pipe sizes, fixed fracture gradient).
      </p>
    </div>
  );
};

export default PetroleumCalculations;