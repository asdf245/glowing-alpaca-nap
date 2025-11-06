import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calculator as CalculatorIcon, FileText } from 'lucide-react';
import { ReportData, ReportSchema, initialReportData } from '@/types/report';
import { toast } from 'sonner';
import { useReportStore } from '@/store/useReportStore';
import { z } from 'zod'; 
import CalculatorContent from './CalculatorContent';

// Access the underlying shape of the ReportSchema
const ReportShape = ReportSchema._def.schema.shape;

// Define a minimal schema for the calculator inputs by explicitly defining the fields
const CalculatorSchema = z.object({
    // General Inputs
    mDepth: ReportShape.mDepth,
    tvd: ReportShape.tvd,
    holeSize: ReportShape.holeSize,
    
    // Drilling/Mud Inputs
    flowRate: ReportShape.flowRate,
    mudWeight: ReportShape.mudWeight,
    spp: ReportShape.spp,
    rheology600: ReportShape.rheology600,
    rheology300: ReportShape.rheology300,
    
    // Pump Inputs
    linerSizeIn: ReportShape.linerSizeIn,
    strokeLengthIn: ReportShape.strokeLengthIn,
    
    // Table Inputs
    stringData: ReportShape.stringData,
    wellProfile: ReportShape.wellProfile,
    
    // Bit Data (for nozzle)
    presentBit: ReportShape.presentBit,
});

type CalculatorInputs = ReportData; // We use the full ReportData type for convenience, but only validate/use the fields above

const Calculator: React.FC = () => {
  const navigate = useNavigate();
  const { setReport } = useReportStore();

  // Get the current report data from the store
  const currentReport = useReportStore.getState().report;

  // Use local form state, initialized with relevant data from the current report
  const methods = useForm<CalculatorInputs>({
    defaultValues: {
        // Use currentReport as the base for default values
        ...currentReport, 
    },
    mode: 'onChange',
  });

  const { getValues } = methods;
  
  const handleExportToReport = () => {
    const currentInputs = getValues();
    
    // 1. Validate inputs before exporting to report
    const validation = CalculatorSchema.safeParse(currentInputs);
    
    if (!validation.success) {
        toast.error("Please ensure all required calculation inputs are valid before exporting to report.");
        return;
    }
    
    // 2. Extract calculated results (These are available in the form state because CalculatorContent ran usePetroleumCalculations)
    const calculatedData = {
        // We manually pull all calculated fields from the form state using getValues()
        annVelocity: currentInputs.annVelocity,
        jetVelocity: currentInputs.jetVelocity,
        bitHhp: currentInputs.bitHhp,
        hsi: currentInputs.hsi,
        ecd: currentInputs.ecd,
        hydrostaticPressure: currentInputs.hydrostaticPressure,
        annularPressureLoss: currentInputs.annularPressureLoss,
        emw: currentInputs.emw,
        mamw: currentInputs.mamw,
        tripMargin: currentInputs.tripMargin,
        pv: currentInputs.pv,
        yp: currentInputs.yp,
        n: currentInputs.n,
        k: currentInputs.k,
        totalHoleVolume: currentInputs.totalHoleVolume,
        annulusVolume: currentInputs.annulusVolume,
        capacityVolume: currentInputs.capacityVolume,
        steelVolume: currentInputs.steelVolume,
        displaceVolume: currentInputs.displaceVolume,
        lagTimeMin: currentInputs.lagTimeMin,
        completeCirculationStrokes: currentInputs.completeCirculationStrokes,
        
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
            ...currentReport.presentBit, // Keep existing bit data
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
        <CalculatorContent />
      </FormProvider>
    </div>
  );
};

export default Calculator;