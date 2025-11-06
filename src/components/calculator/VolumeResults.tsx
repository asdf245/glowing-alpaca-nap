import { FormField } from '@/components/FormField';

interface VolumeResultsProps {
  totalHoleVolume: number;
  annulusVolume: number;
  capacityVolume: number;
  steelVolume: number;
  displaceVolume: number;
  lagTimeMin: number;
  completeCirculationStrokes: number;
}

export const VolumeResults = ({
  totalHoleVolume,
  annulusVolume,
  capacityVolume,
  steelVolume,
  displaceVolume,
  lagTimeMin,
  completeCirculationStrokes,
}: VolumeResultsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <FormField
        label="Total Hole Volume"
        unit="bbl"
        type="number"
        value={totalHoleVolume}
        onChange={() => {}}
        isCalculated
        readOnly
      />
      <FormField
        label="Annulus Volume (Bit → Surface)"
        unit="bbl"
        type="number"
        value={annulusVolume}
        onChange={() => {}}
        isCalculated
        readOnly
      />
      <FormField
        label="Capacity Volume (Inside String)"
        unit="bbl"
        type="number"
        value={capacityVolume}
        onChange={() => {}}
        isCalculated
        readOnly
      />
      <FormField
        label="Steel Volume"
        unit="bbl"
        type="number"
        value={steelVolume}
        onChange={() => {}}
        isCalculated
        readOnly
      />
      <FormField
        label="Displace Volume (Steel + Capacity)"
        unit="bbl"
        type="number"
        value={displaceVolume}
        onChange={() => {}}
        isCalculated
        readOnly
      />
      <FormField
        label="Lag Time (Bit → Surface)"
        unit="min"
        type="number"
        value={lagTimeMin}
        onChange={() => {}}
        isCalculated
        readOnly
      />
      <FormField
        label="Complete Circulation Strokes"
        unit="strokes"
        type="number"
        value={completeCirculationStrokes}
        onChange={() => {}}
        isCalculated
        readOnly
      />
    </div>
  );
};