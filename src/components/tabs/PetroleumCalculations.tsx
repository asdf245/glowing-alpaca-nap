import { Separator } from '@/components/ui/separator';
import { usePetroleumCalculations } from '@/hooks/usePetroleumCalculations';
import { WellProfileTable } from './petroleum/WellProfileTable';
import { StringDataTable } from './petroleum/StringDataTable';
import { PumpInputs } from './petroleum/PumpInputs';
import { VolumeResults } from './petroleum/VolumeResults';
import { HydraulicResults } from './petroleum/HydraulicResults';
import { PressureResults } from './petroleum/PressureResults';
import { InputSummary } from './petroleum/InputSummary';

export const PetroleumCalculations = () => {
  const {
    totalHoleVolume,
    annulusVolume,
    capacityVolume,
    steelVolume,
    displaceVolume,
    lagTimeMin,
    completeCirculationStrokes,
    annVelocity,
    jetVelocity,
    bitHhp,
    hsi,
    hydrostaticPressure,
    annularPressureLoss,
    ecd,
    emw,
    mamw,
    tripMargin,
  } = usePetroleumCalculations();

  return (
    <div className="space-y-8 p-4">
      <h2 className="text-2xl font-bold text-[#003366]">9. Engineering Calculations</h2>

      <h3 className="text-xl font-semibold text-[#003366]">Well Profile (Casing/Hole Sections)</h3>
      <WellProfileTable />
      <Separator />

      <h3 className="text-xl font-semibold text-[#003366]">Drill String Data (BHA/DP)</h3>
      <StringDataTable />
      <Separator />

      <h3 className="text-xl font-semibold text-[#003366]">Pump & Rheology Inputs</h3>
      <PumpInputs />
      <Separator />

      <h3 className="text-xl font-semibold text-[#003366]">Volume & Circulation Time</h3>
      <VolumeResults
        totalHoleVolume={totalHoleVolume}
        annulusVolume={annulusVolume}
        capacityVolume={capacityVolume}
        steelVolume={steelVolume}
        displaceVolume={displaceVolume}
        lagTimeMin={lagTimeMin}
        completeCirculationStrokes={completeCirculationStrokes}
      />
      <Separator />

      <h3 className="text-xl font-semibold text-[#003366]">Hydraulic Parameters (Simplified)</h3>
      <HydraulicResults
        annVelocity={annVelocity}
        jetVelocity={jetVelocity}
        bitHhp={bitHhp}
        hsi={hsi}
      />
      <Separator />

      <h3 className="text-xl font-semibold text-[#003366]">Pressure & Density Management</h3>
      <PressureResults
        hydrostaticPressure={hydrostaticPressure}
        annularPressureLoss={annularPressureLoss}
        ecd={ecd}
        emw={emw}
        mamw={mamw}
        tripMargin={tripMargin}
      />
      <Separator />

      <h3 className="text-xl font-semibold text-[#003366]">Input Data Used</h3>
      <InputSummary />
      <p className="text-xs text-muted-foreground mt-4">
        Note: Hydraulic calculations are simplified and use average string/hole dimensions. Accurate pressure loss modeling requires the Power Law Index (n) and Consistency Index (k) which can be derived from the 600/300 RPM readings.
      </p>
    </div>
  );
};

export default PetroleumCalculations;