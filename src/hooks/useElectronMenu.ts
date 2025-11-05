import { useEffect, useCallback } from 'react';
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
  const { trigger, handleSubmit } = useFormContext<ReportData>();
  
  // Get report actions, passing the RHF trigger for validation
  const { 
    handleNewReport, 
    handleSaveDraft, 
    handleOpenReport, 
    handleExportExcel, 
    handleExportPDF 
  } = useReportActions(onNewReport, trigger);

  // Define the error handler for exports
  const onError = useCallback((errors: any) => {
    console.error("Validation Errors:", errors);
    toast.error("Please fix the errors in the form before exporting.");
  }, []);

  // Stabilize handlers using useCallback
  const handleNew = useCallback(() => handleNewReport(), [handleNewReport]);
  const handleOpen = useCallback(() => handleOpenReport(), [handleOpenReport]);
  const handleSave = useCallback(() => handleSaveDraft(), [handleSaveDraft]);
  
  // Export handlers require validation and data retrieval from RHF
  const handleExportExcelMenu = useCallback(() => {
      handleSubmit((data) => handleExportExcel(data), onError)();
  }, [handleSubmit, handleExportExcel, onError]);
  
  const handleExportPDFMenu = useCallback(() => {
      handleSubmit((data) => handleExportPDF(data), onError)();
  }, [handleSubmit, handleExportPDF, onError]);
  
  // View Actions
  const handleToggleDarkMode = useCallback(() => {
      // Simple dark mode toggle logic (assuming Tailwind/shadcn setup)
      document.documentElement.classList.toggle('dark');
      toast.info(`Dark mode toggled.`);
  }, []);


  useEffect(() => {
    if (!window.electron) {
      console.warn("Not running in Electron environment. Menu commands disabled.");
      return;
    }

    // Register listeners
    ipcRenderer.on('menu-new-report', handleNew);
    ipcRenderer.on('menu-open-report', handleOpen);
    ipcRenderer.on('menu-save-draft', handleSave);
    ipcRenderer.on('menu-export-excel', handleExportExcelMenu);
    ipcRenderer.on('menu-export-pdf', handleExportPDFMenu);
    ipcRenderer.on('menu-toggle-dark-mode', handleToggleDarkMode);

    // Cleanup listeners
    return () => {
      ipcRenderer.removeListener('menu-new-report', handleNew);
      ipcRenderer.removeListener('menu-open-report', handleOpen);
      ipcRenderer.removeListener('menu-save-draft', handleSave);
      ipcRenderer.removeListener('menu-export-excel', handleExportExcelMenu);
      ipcRenderer.removeListener('menu-export-pdf', handleExportPDFMenu);
      ipcRenderer.removeListener('menu-toggle-dark-mode', handleToggleDarkMode);
    };
  }, [handleNew, handleOpen, handleSave, handleExportExcelMenu, handleExportPDFMenu, handleToggleDarkMode]);
};