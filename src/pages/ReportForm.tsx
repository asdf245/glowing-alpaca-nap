import { useState, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useReportStore } from '@/store/useReportStore';
import { ReportData, ReportSchema } from '@/types/report';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useReportActions } from '@/hooks/useReportActions';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'; // Import useSearchParams
import { useElectronMenu } from '@/hooks/useElectronMenu';

// Tab Imports
import GeneralTab from '@/components/tabs/GeneralTab';
import BitDataTab from '@/components/tabs/BitDataTab';
import DrillingTab from '@/components/tabs/DrillingTab';
import PetroleumCalculations from '@/components/tabs/PetroleumCalculations';
import LithologyTab from '@/components/tabs/LithologyTab';
import GasDataTab from '@/components/tabs/GasDataTab';
import OperationsTab from '@/components/tabs/OperationsTab';
import EquipmentTab from '@/components/tabs/EquipmentTab';
import ExportTab from '@/components/tabs/ExportTab';

const VALID_TABS = [
  'general', 'bit', 'drilling', 'calculations', 'lithology', 'gas', 'operations', 'equipment', 'export'
];

const ReportForm = () => {
  const { report, setReport, currentReportId, loadReport } = useReportStore();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // Hook to read query parameters
  
  // Determine initial active tab from URL query parameter, defaulting to 'general'
  const initialTab = searchParams.get('tab');
  const defaultTab = (initialTab && VALID_TABS.includes(initialTab)) ? initialTab : 'general';
  
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Initialize React Hook Form with current Zustand state
  const methods = useForm<ReportData>({
    resolver: zodResolver(ReportSchema),
    defaultValues: report,
    mode: 'onChange',
  });

  const { watch, reset, handleSubmit, trigger } = methods;
  
  // Initialize Report Actions hook, passing trigger for validation on manual save
  const { handleExportExcel, handleExportPDF } = useReportActions(
    () => setActiveTab('general'),
    trigger
  );
  
  // Integrate Electron Menu Hook, passing RHF methods
  useElectronMenu(() => {
    setActiveTab('general');
    navigate('/report');
  }, methods); // <-- Pass methods here

  // Effect 0: Load report if ID is present in URL
  useEffect(() => {
    if (id && currentReportId !== parseInt(id)) {
        loadReport(parseInt(id));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Effect 1: Sync RHF changes back to Zustand store for persistence and global access
  useEffect(() => {
    const subscription = watch((value) => {
      // Use setReport to update Zustand state
      setReport(value as ReportData);
    });
    return () => subscription.unsubscribe();
  }, [watch, setReport]);

  // Effect 2: Sync Zustand state changes (e.g., on load/new report) to RHF
  useEffect(() => {
    // When currentReportId changes, it means we loaded a new report, so we reset RHF to that data.
    // We also update the URL if we loaded a report without an ID (e.g., from the homepage or a new save)
    if (currentReportId !== undefined) {
        reset(report);
        if (currentReportId && (!id || parseInt(id) !== currentReportId)) {
            // Update URL to reflect the loaded report ID
            navigate(`/report/${currentReportId}`, { replace: true });
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentReportId, reset, report]); 

  // RHF Success Callback (only runs if validation passes)
  const onSubmit = (data: ReportData, exportType: 'excel' | 'pdf') => {
    // Now, call the appropriate export handler from the hook with the validated data
    if (exportType === 'excel') {
        handleExportExcel(data);
    } else if (exportType === 'pdf') {
        handleExportPDF(data);
    }
  };

  const onError = (errors: any) => {
    console.error("Validation Errors:", errors);
    toast.error("Please fix the errors in the form before proceeding.");
    // Find the first tab with an error and switch to it
    const errorTabs = {
      general: ['date', 'reportNo', 'wellName', 'mDepth', 'fieldName', 'holeSize', 'rigName'],
      drilling: ['depthFrom', 'depthTo', 'hours', 'mudWeight', 'viscosity', 'ph'],
      // Add other tabs' fields here
    };

    for (const [tabId, fields] of Object.entries(errorTabs)) {
      if (fields.some(field => errors[field])) {
        setActiveTab(tabId);
        break;
      }
    }
  };

  // Function to trigger validation and then call the export handler inside ExportTab
  const handleValidateAndExport = (exportType: 'excel' | 'pdf') => {
    // We use the RHF handleSubmit wrapper, passing the exportType to the onSubmit callback
    handleSubmit((data) => onSubmit(data, exportType), onError)();
  };

  return (
    <FormProvider {...methods}>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        <form onSubmit={handleSubmit(() => {})} className="h-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            {/* TabsContent is used here to manage the content area */}
            <div className="flex-grow overflow-y-auto p-4">
              <TabsContent value="general" className="mt-0">
                <GeneralTab />
              </TabsContent>
              <TabsContent value="bit" className="mt-0">
                <BitDataTab />
              </TabsContent>
              <TabsContent value="drilling" className="mt-0">
                <DrillingTab />
              </TabsContent>
              <TabsContent value="calculations" className="mt-0">
                <PetroleumCalculations />
              </TabsContent>
              <TabsContent value="lithology" className="mt-0">
                <LithologyTab />
              </TabsContent>
              <TabsContent value="gas" className="mt-0">
                <GasDataTab />
              </TabsContent>
              <TabsContent value="operations" className="mt-0">
                <OperationsTab />
              </TabsContent>
              <TabsContent value="equipment" className="mt-0">
                <EquipmentTab />
              </TabsContent>
              <TabsContent value="export" className="mt-0">
                {/* Pass the validation wrapper function */}
                <ExportTab onExport={handleValidateAndExport} />
              </TabsContent>
            </div>
          </Tabs>
        </form>
      </Layout>
    </FormProvider>
  );
};

export default ReportForm;