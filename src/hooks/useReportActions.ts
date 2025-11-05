import { useReportStore } from '@/store/useReportStore';
import { ipcRenderer } from '@/ipc/ipcRenderer';
import { toast } from 'sonner';
import { ReportData, ReportSchema } from '@/types/report';
import { generateNidcExcelBase64 } from '@/utils/excelExport';
import { z } from 'zod'; // Import Zod for schema validation

export const useReportActions = (onNewReport: () => void, triggerValidation?: () => Promise<boolean>) => {
  const { report, autoSave, newReport } = useReportStore();

  const handleExport = async (type: 'excel' | 'pdf', data: ReportData) => {
    if (!window.electron) {
      toast.error("Electron IPC not available. Cannot export.");
      return { success: false };
    }
    
    const channel = type === 'excel' ? 'export-excel' : 'export-pdf';
    const loadingToastId = toast.loading(`Preparing ${type.toUpperCase()} export...`);

    try {
      let fileData: string | null = null;
      
      if (type === 'excel') {
        // Generate Excel file as Base64 string
        fileData = generateNidcExcelBase64(data);
      } else {
        // PDF generation logic would go here (currently unimplemented)
        toast.warning("PDF export is not yet implemented.");
        toast.dismiss(loadingToastId);
        return { success: false };
      }

      if (!fileData) {
        toast.dismiss(loadingToastId);
        toast.error(`Failed to generate ${type.toUpperCase()} data.`);
        return { success: false };
      }

      // Trigger the main process to handle file save dialog and file write
      // We send the file data (Base64 string) along with metadata for the default filename
      const result = await ipcRenderer.invoke(channel, {
          data: fileData,
          wellName: data.wellName,
          date: data.date,
          type: type,
      });
      
      toast.dismiss(loadingToastId);
      
      if (result?.success) {
        toast.success(`${type.toUpperCase()} export successful! File saved to: ${result.path}`);
        return { success: true, path: result.path };
      } else {
        toast.error(`${type.toUpperCase()} export failed or cancelled.`);
        return { success: false };
      }
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error(`Export failed due to an internal error.`);
      console.error("Export error:", error);
      return { success: false };
    }
  };

  const handleSaveDraft = async () => {
    let isValid = true;
    if (triggerValidation) {
        // Trigger validation for all fields
        isValid = await triggerValidation();
    }
    
    // 1. Always trigger IndexedDB persistence (autoSave handles this)
    await autoSave(); 

    if (!isValid) {
        toast.warning("Draft saved locally, but please fix validation errors.");
    } else {
        toast.info("Draft saved locally.");
    }
    
    // 2. Trigger file system save via IPC
    if (window.electron) {
      const loadingToastId = toast.loading("Saving draft to file system...");
      // Pass the current report data for saving
      const result = await ipcRenderer.invoke('save-report', report);
      toast.dismiss(loadingToastId);
      
      if (result?.success) {
        toast.success(`Draft saved to file: ${result.path}`);
      } else {
        toast.error("Failed to save draft to file system.");
      }
    }
  };
  
  const handleOpenReport = async () => {
    if (!window.electron) {
      toast.error("Electron IPC not available. Cannot open file.");
      return;
    }
    
    const loadingToastId = toast.loading("Waiting for file selection...");
    
    try {
        // Invoke IPC to open file dialog and read JSON content
        const result = await ipcRenderer.invoke('load-report');
        toast.dismiss(loadingToastId);

        if (result?.success && result.data) {
            // 1. Validate loaded data against Zod schema
            const validation = ReportSchema.safeParse(result.data);
            
            if (validation.success) {
                // 2. Update Zustand store with loaded data
                // We use setReport to update the data, and newReport to clear the DB ID, 
                // treating the file load as a new, unsaved draft in the DB.
                useReportStore.getState().setReport(validation.data);
                useReportStore.getState().newReport(); 
                
                toast.success(`Report loaded successfully from file: ${result.path}`);
                onNewReport(); // Navigate to /report
            } else {
                console.error("Loaded data failed schema validation:", validation.error);
                toast.error("Loaded file is corrupted or incompatible with the current report format.");
            }
        } else if (!result?.success) {
            // Error or cancellation handled by main process
            if (result?.message !== 'Open cancelled') {
                toast.error(`Failed to open report: ${result?.message || 'Unknown error'}`);
            }
        }
    } catch (error) {
        toast.dismiss(loadingToastId);
        console.error("IPC Load error:", error);
        toast.error("An error occurred while loading the file.");
    }
  };
  
  const handleNewReport = () => {
    newReport();
    onNewReport(); // Callback to switch tab in Index/Layout
  };

  return {
    report,
    handleExport,
    handleSaveDraft,
    handleNewReport,
    handleOpenReport,
    handleExportPDF: (data: ReportData) => handleExport('pdf', data),
    handleExportExcel: (data: ReportData) => handleExport('excel', data),
  };
};