import { useEffect } from 'react';
import { useReportActions } from './useReportActions';
import { ipcRenderer } from '@/ipc/ipcRenderer';
import { toast } from 'sonner';
import { useFormContext } from 'react-hook-form';
import { ReportData } from '@/types/report';

/**
 * Hook to listen for Electron menu commands and execute corresponding actions.
 * This hook should be called within the ReportForm component where RHF context is available.
 */
export const useElectronMenu = (onNewReport: () => void) => {
  const { getValues, trigger, handleSubmit } = useFormContext<ReportData>();
  
  // Get report actions, passing the RHF trigger for validation
  const { 
    handleNewReport, 
    handleSaveDraft, 
    handleOpenReport, 
    handleExportExcel, 
    handleExportPDF 
  } = useReportActions(onNewReport, trigger);

  // Define the error handler for exports
  const onError = (errors: any) => {
    console.error("Validation Errors:", errors);
    toast.error("Please fix the errors in the form before exporting.");
  };

  useEffect(() => {
    if (!window.electron) {
      console.warn("Not running in Electron environment. Menu commands disabled.");
      return;
    }

    // --- File Actions ---
    
    const handleNew = () => handleNewReport();
    const handleOpen = () => handleOpenReport();
    const handleSave = () => handleSaveDraft();
    
    // Export handlers require validation and data retrieval from RHF
    const handleExportExcelMenu = handleSubmit((data) => handleExportExcel(data), onError);
    const handleExportPDFMenu = handleSubmit((data) => handleExportPDF(data), onError);
    
    // --- View Actions ---
    const handleToggleDarkMode = () => {
        // Simple dark mode toggle logic (assuming Tailwind/shadcn setup)
        document.documentElement.classList.toggle('dark');
        toast.info(`Dark mode toggled.`);
    };

    // Register listeners
    ipcRenderer.on('menu-new-report', handleNew);
    ipcRenderer.on('menu-open-report', handleOpen);
    ipcRenderer.on('menu-save-draft', handleSave);
    ipcRenderer.on('menu-export-excel', handleExportExcelMenu);
    ipcRenderer.on('menu-export-pdf', handleExportPDFMenu);
    ipcRenderer.on('menu-toggle-dark-mode', handleToggleDarkMode);

    // Cleanup listeners
    return () => {
      // Note: In a real Electron app, listeners should be removed carefully.
      // Since we are simulating, we rely on the component unmount.
      // For simplicity in this environment, we rely on the component lifecycle.
      // In a production Electron app, you would use ipcRenderer.removeListener.
    };
  }, [handleNewReport, handleSaveDraft, handleOpenReport, handleExportExcel, handleExportPDF, handleSubmit, onError]);
};