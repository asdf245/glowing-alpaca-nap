import { useReportStore } from '@/store/useReportStore';
import { ipcRenderer } from '@/ipc/ipcRenderer';
import { toast } from 'sonner';
import { ReportData } from '@/types/report';

export const useReportActions = (onNewReport: () => void) => {
  const { report, autoSave, newReport } = useReportStore();

  const handleExport = async (type: 'excel' | 'pdf', data: ReportData) => {
    if (!window.electron) {
      toast.error("Electron IPC not available. Cannot export.");
      return { success: false };
    }
    
    const channel = type === 'excel' ? 'export-excel' : 'export-pdf';
    const loadingToastId = toast.loading(`Preparing ${type.toUpperCase()} export...`);

    try {
      // Trigger the main process to handle file generation and save dialog
      const result = await ipcRenderer.invoke(channel, data);
      toast.dismiss(loadingToastId);
      
      if (result?.success) {
        toast.success(`${type.toUpperCase()} export successful!`);
        return { success: true };
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
    await autoSave(); // Trigger IndexedDB persistence
    if (window.electron) {
      // Trigger the main process to save to JSON file
      const result = await ipcRenderer.invoke('save-report', report);
      if (result?.success) {
        toast.success("Draft saved to Documents folder.");
      } else {
        toast.error("Failed to save draft to file system.");
      }
    } else {
      toast.success("Draft saved locally (IndexedDB).");
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