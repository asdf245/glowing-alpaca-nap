import { usePetroleumCalculations } from '@/hooks/usePetroleumCalculations';

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

const parseNozzleAreaForDisplay = (nozzleStr: string): string => {
  if (!nozzleStr) return '0.5';
  const nozzles = nozzleStr.split('-').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n) && n > 0);
  const totalAreaFactor = nozzles.reduce((sum, n) => sum + (n * n), 0);
  const At = (Math.PI / 4) * (totalAreaFactor / 1024);
  return At.toFixed(4);
};

export const InputSummary = () => {
  const {
    flowRate, mudWeight, spp, holeSize, nozzle, tvd, pv, yp,
    linerSizeIn, strokeLengthIn,
  } = usePetroleumCalculations();

  return (
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
  );
};