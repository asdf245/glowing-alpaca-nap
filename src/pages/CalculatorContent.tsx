import React from 'react';
import { Separator } from '@/components/ui/separator';
import { usePetroleumCalculations } from '@/hooks/usePetroleumCalculations';
import { WellProfileTable } from '@/components/calculator/WellProfileTable';
import { StringDataTable } from '@/components/calculator/StringDataTable';
import { PumpInputs } from '@/components/calculator/PumpInputs';
import { VolumeResults } from '@/components/calculator/VolumeResults';
import { HydraulicResults } from '@/components/calculator/HydraulicResults';
import { PressureResults } from '@/components/calculator/PressureResults';
import { InputSummary } from '@/components/calculator/InputSummary';
import { FormField } from '@/components/FormField';
import { useFormContext } from 'react-hook-form';
import { ReportData } from '@/types/report';

const CalculatorContent: React.FC = () => {
  // This component is now guaranteed to be inside FormProvider
  const { watch, setValue } = useFormContext<ReportData>();
  
  // Run calculations based on local form state
  const results = usePetroleumCalculations();

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      
      <h2 className="text-2xl font-bold text-[#003366]">Input Parameters</h2>
      
      {/* Core Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FormField
          label="True Vertical Depth (TVD)"
          unit="m"
          type="number"
          value={watch('tvd')}
          onChange={(val) => setValue('tvd', val as number)}
        />
        <FormField
          label="Hole Size"
          unit="in"
          type="text"
          value={watch('holeSize')}
          onChange={(val) => setValue('holeSize', val as string)}
        />
        <FormField
          label="Flow Rate (Q)"
          unit="GPM"
          type="number"
          value={watch('flowRate')}
          onChange={(val) => setValue('flowRate', val as number)}
        />
        <FormField
          label="Mud Weight (MW)"
          unit="pcf"
          type="number"
          value={watch('mudWeight')}
          onChange={(val) => setValue('mudWeight', val as number)}
        />
        <FormField
          label="Standpipe Pressure (SPP)"
          unit="PSI"
          type="number"
          value={watch('spp')}
          onChange={(val) => setValue('spp', val as number)}
        />
        <FormField
          label="Rheology @ 600 RPM"
          unit="°"
          type="number"
          value={watch('rheology600')}
          onChange={(val) => setValue('rheology600', val as number)}
        />
        <FormField
          label="Rheology @ 300 RPM"
          unit="°"
          type="number"
          value={watch('rheology300')}
          onChange={(val) => setValue('rheology300', val as number)}
        />
        <FormField
          label="Nozzle Sizes"
          unit="1/32&quot;"
          type="text"
          value={watch('presentBit.nozzle')}
          onChange={(val) => setValue('presentBit.nozzle', val as string)}
        />
      </div>
      <Separator />

      <h3 className="text-xl font-semibold text-[#003366]">Well Profile (Casing/Hole Sections)</h3>
      <WellProfileTable />
      <Separator />

      <h3 className="text-xl font-semibold text-[#003366]">Drill String Data (BHA/DP)</h3>
      <StringDataTable />
      <Separator />

      <h3 className="text-xl font-semibold text-[#003366]">Pump Inputs (Liner & Stroke)</h3>
      <PumpInputs />
      <Separator />
      
      {/* --- Calculation Results --- */}
      <h2 className="text-2xl font-bold text-[#003366]">Calculation Results</h2>

      <h3 className="text-xl font-semibold text-[#003366]">Rheology & Power Law Indices</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FormField
          label="Plastic Viscosity (PV)"
          unit="cp"
          type="number"
          value={results.pv}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Yield Point (YP)"
          unit="lbf/100ft²"
          type="number"
          value={results.yp}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Flow Index (n)"
          unit=""
          type="number"
          value={results.n}
          onChange={() => {}}
          isCalculated
          readOnly
        />
        <FormField
          label="Consistency Index (k)"
          unit=""
          type="number"
          value={results.k}
          onChange={() => {}}
          isCalculated
          readOnly
        />
      </div>
      <Separator />

      <h3 className="text-xl font-semibold text-[#003366]">Volume & Circulation Time</h3>
      <VolumeResults
        totalHoleVolume={results.totalHoleVolume}
        annulusVolume={results.annulusVolume}
        capacityVolume={results.capacityVolume}
        steelVolume={results.steelVolume}
        displaceVolume={results.displaceVolume}
        lagTimeMin={results.lagTimeMin}
        completeCirculationStrokes={results.completeCirculationStrokes}
      />
      <Separator />

      <h3 className="text-xl font-semibold text-[#003366]">Hydraulic Parameters (Simplified)</h3>
      <HydraulicResults
        annVelocity={results.annVelocity}
        jetVelocity={results.jetVelocity}
        bitHhp={results.bitHhp}
        hsi={results.hsi}
      />
      <Separator />

      <h3 className="text-xl font-semibold text-[#003366]">Pressure & Density Management</h3>
      <PressureResults
        hydrostaticPressure={results.hydrostaticPressure}
        annularPressureLoss={results.annularPressureLoss}
        ecd={results.ecd}
        emw={results.emw}
        mamw={results.mamw}
        tripMargin={results.tripMargin}
      />
      <Separator />

      <h3 className="text-xl font-semibold text-[#003366]">Input Data Used</h3>
      <InputSummary />
      <p className="text-xs text-muted-foreground mt-4">
        Note: Calculations are performed in real-time based on the inputs above. Use the 'Export to Report Draft' button to transfer these results to the main reporting module.
      </p>
    </div>
  );
};

export default CalculatorContent;