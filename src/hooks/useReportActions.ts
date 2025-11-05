import { useReportStore } from '@/store/useReportStore';
import { ipcRenderer } from '@/ipc/ipcRenderer';
import { toast } from 'sonner';
import { ReportData } from '@/types/report';
import { generateNidcExcelBase64 } from '@/utils/excelExport'; // Import the new function

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
    
    await autoSave(); // Trigger IndexedDB persistence regardless of validation status

    if (!isValid) {
        toast.warning("Draft saved locally, but please fix validation errors.");
    } else {
        toast.info("Draft saved locally.");
    }
    
    if (window.electron) {
      // Trigger the main process to save to JSON file
      const result = await ipcRenderer.invoke('save-report', report);
      if (result?.success) {
        // Only show success toast for file save if validation passed or if we only care about file system success
        toast.success("Draft saved to Documents folder.");
      } else {
        toast.error("Failed to save draft to file system.");
      }
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
    // Placeholder for future load/open functionality
    handleOpenReport: () => toast.info("Open Report functionality coming soon."),
    handleExportPDF: (data: ReportData) => handleExport('pdf', data),
    handleExportExcel: (data: ReportData) => handleExport('excel', data),
  };
};