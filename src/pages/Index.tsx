import { useState, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useReportStore } from '@/store/useReportStore';
import { ReportData, ReportSchema } from '@/types/report';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Tab Imports
import GeneralTab from '@/components/tabs/GeneralTab';
import BitDataTab from '@/components/tabs/BitDataTab';
import DrillingTab from '@/components/tabs/DrillingTab';
import LithologyTab from '@/components/tabs/LithologyTab';
import GasDataTab from '@/components/tabs/GasDataTab';
import OperationsTab from '@/components/tabs/OperationsTab';
import EquipmentTab from '@/components/tabs/EquipmentTab';
import ExportTab from '@/components/tabs/ExportTab';

const Index = () => {
  const { report, setReport } = useReportStore();
  const [activeTab, setActiveTab] = useState('general');

  // Initialize React Hook Form with current Zustand state
  const methods = useForm<ReportData>({
    resolver: zodResolver(ReportSchema),
    defaultValues: report,
    mode: 'onChange',
  });

  const { watch, reset, handleSubmit } = methods;

  // Sync RHF changes back to Zustand store for persistence and global access
  useEffect(() => {
    const subscription = watch((value) => {
      setReport(value as ReportData);
    });
    return () => subscription.unsubscribe();
  }, [watch, setReport]);

  // Sync Zustand state changes (e.g., on load/new report) to RHF
  useEffect(() => {
    reset(report);
  }, [report, reset]);

  // Handle form submission (e.g., for export validation)
  const onSubmit = (data: ReportData) => {
    console.log("Form Data Validated:", data);
    // This is where we would trigger the final export logic if needed
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

  return (
    <FormProvider {...methods}>
      <Layout activeTab={activeTab}>
        <form onSubmit={handleSubmit(onSubmit)} className="h-full">
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
                <ExportTab onExport={handleSubmit(onSubmit, onError)} />
              </TabsContent>
            </div>
          </Tabs>
        </form>
      </Layout>
    </FormProvider>
  );
};

export default Index;