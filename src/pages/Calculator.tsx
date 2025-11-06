import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calculator as CalculatorIcon, FileText } from 'lucide-react';
import { usePetroleumCalculations } from '@/hooks/usePetroleumCalculations';
import { ReportData, ReportSchema, initialReportData } from '@/types/report';
import { WellProfileTable } from '@/components/calculator/WellProfileTable';
import { StringDataTable } from '@/components/calculator/StringDataTable';
import { PumpInputs } from '@/components/calculator/PumpInputs';
import { VolumeResults } from '@/components/calculator/VolumeResults';
import { HydraulicResults } from '@/components/calculator/HydraulicResults';
import { PressureResults } from '@/components/calculator/PressureResults';
import { InputSummary } from '@/components/calculator/InputSummary';
import { FormField } from '@/components/FormField';
import { toast } from 'sonner';
import { useReportStore } from '@/store/useReportStore';
import { z } from 'zod'; // Ensure z is imported if we use z.object

// Define a minimal schema for the calculator inputs by explicitly defining the fields
// This avoids the ReportSchema.pick() error.
const CalculatorSchema = z.object({
    // General Inputs
    mDepth: ReportSchema.shape.mDepth,
    tvd: ReportSchema.shape.tvd,
    holeSize: ReportSchema.shape.holeSize,
    
    // Drilling/Mud Inputs
    flowRate: ReportSchema.shape.flowRate,
    mudWeight: ReportSchema.shape.mudWeight,
    spp: ReportSchema.shape.spp,
    rheology600: ReportSchema.shape.rheology600,
    rheology300: ReportSchema.shape.rheology300,
    
    // Pump Inputs
    linerSizeIn: ReportSchema.shape.linerSizeIn,
    strokeLengthIn: ReportSchema.shape.strokeLengthIn,
    
    // Table Inputs
    stringData: ReportSchema.shape.stringData,
    wellProfile: ReportSchema.shape.wellProfile,
    
    // Bit Data (for nozzle)
    presentBit: ReportSchema.shape.presentBit,
});

type CalculatorInputs = ReportData; // We use the full ReportData type for convenience, but only validate/use the fields above

const Calculator: React.FC = () => {
  const navigate = useNavigate();
  const { setReport } = useReportStore();

  // Use local form state, initialized with relevant data from initialReportData
  const methods = useForm<CalculatorInputs>({
    defaultValues: {
        ...initialReportData,
        // Ensure only relevant fields are initialized if needed, 
        // but using initialReportData as a base is fine since we only watch specific fields.
    },
    mode: 'onChange',
  });

  const { watch, setValue, getValues } = methods;
  
  // Run calculations based on local form state
  const results = usePetroleumCalculations();
  
  const handleExportToReport = () => {
    const currentInputs = getValues();
    
    // 1. Validate inputs before exporting to report
    const validation = CalculatorSchema.safeParse(currentInputs);
    
    if (!validation.success) {
        toast.error("Please ensure all required calculation inputs are valid before exporting to report.");
        return;
    }
    
    // 2. Extract calculated results
    const calculatedData = {
        annVelocity: results.annVelocity,
        jetVelocity: results.jetVelocity,
        bitHhp: results.bitHhp,
        hsi: results.hsi,
        ecd: results.ecd,
        hydrostaticPressure: results.hydrostaticPressure,
        annularPressureLoss: results.annularPressureLoss,
        emw: results.emw,
        mamw: results.mamw,
        tripMargin: results.tripMargin,
        pv: results.pv,
        yp: results.yp,
        n: results.n,
        k: results.k,
        totalHoleVolume: results.totalHoleVolume,
        annulusVolume: results.annulusVolume,
        capacityVolume: results.capacityVolume,
        steelVolume: results.steelVolume,
        displaceVolume: results.displaceVolume,
        lagTimeMin: results.lagTimeMin,
        completeCirculationStrokes: results.completeCirculationStrokes,
        
        // Also export the inputs used for calculation
        rheology600: currentInputs.rheology600,
        rheology300: currentInputs.rheology300,
        linerSizeIn: currentInputs.linerSizeIn,
        strokeLengthIn: currentInputs.strokeLengthIn,
        stringData: currentInputs.stringData,
        wellProfile: currentInputs.wellProfile,
        
        // Export core drilling inputs that might have been adjusted in the calculator
        flowRate: currentInputs.flowRate,
        mudWeight: currentInputs.mudWeight,
        spp: currentInputs.spp,
        tvd: currentInputs.tvd,
        holeSize: currentInputs.holeSize,
        presentBit: {
            ...initialReportData.presentBit, // Keep existing bit data
            nozzle: currentInputs.presentBit?.nozzle, // Update nozzle
        }
    };
    
    // 3. Update the global report store with the calculated values
    // We merge the calculated data into the existing report draft
    setReport({ ...useReportStore.getState().report, ...calculatedData });
    
    toast.success("Calculated values exported to the current report draft.");
    navigate('/report');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 border-b border-border flex items-center justify-between">
        <h1 className="font-bold text-xl text-[#003366] flex items-center">
          <CalculatorIcon className="h-6 w-6 mr-2" /> Engineering Calculations Module
        </h1>
        <div className="flex space-x-2">
            <Button onClick={handleExportToReport} variant="default" size="sm">
                <FileText className="h-4 w-4 mr-2" /> Export to Report Draft
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Main Menu
            </Button>
        </div>
      </header>
      
      <FormProvider {...methods}>
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
      </FormProvider>
    </div>
  );
};

export default Calculator;