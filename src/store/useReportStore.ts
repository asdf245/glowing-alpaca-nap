import { create } from 'zustand';
import { ReportData, initialReportData } from '@/types/report';
import { db } from '@/db/db';
import { toast } from 'sonner';

interface ReportState {
  report: ReportData;
  currentReportId: number | null;
  status: 'idle' | 'loading' | 'saving' | 'error';
  lastAutoSave: string | null;
  setReport: (data: ReportData) => void;
  updateField: <K extends keyof ReportData>(key: K, value: ReportData[K]) => void;
  loadReport: (id: number) => Promise<void>;
  newReport: () => void;
  autoSave: () => Promise<void>;
}

const AUTO_SAVE_INTERVAL = 120000; // 2 minutes

export const useReportStore = create<ReportState>((set, get) => {
  let autoSaveTimer: ReturnType<typeof setInterval> | null = null;

  const startAutoSave = () => {
    if (autoSaveTimer) clearInterval(autoSaveTimer);
    autoSaveTimer = setInterval(() => {
      get().autoSave();
    }, AUTO_SAVE_INTERVAL);
  };

  // Start auto-save on initialization
  startAutoSave();

  return {
    report: initialReportData,
    currentReportId: null,
    status: 'idle',
    lastAutoSave: null,

    setReport: (data) => {
      set({ report: data });
    },

    updateField: (key, value) => {
      set((state) => ({
        report: {
          ...state.report,
          [key]: value,
        },
      }));
    },

    loadReport: async (id) => {
      set({ status: 'loading' });
      try {
        const record = await db.reports.get(id);
        if (record) {
          set({ 
            report: record.data, 
            currentReportId: record.id,
            status: 'idle' 
          });
          toast.success(`Report loaded: ${record.wellName}`);
        } else {
          set({ status: 'error' });
          toast.error("Report not found.");
        }
      } catch (error) {
        set({ status: 'error' });
        console.error("Failed to load report:", error);
        toast.error("Failed to load report from local storage.");
      }
    },

    newReport: () => {
      set({ report: initialReportData, currentReportId: null });
      toast.info("New report started.");
    },

    autoSave: async () => {
      const state = get();
      if (!state.report.wellName || !state.report.date) {
        // Skip auto-save if essential metadata is missing
        return;
      }

      set({ status: 'saving' });
      const now = new Date();
      const reportRecord = {
        wellName: state.report.wellName,
        reportDate: state.report.date,
        data: state.report,
        lastModified: now,
      };

      try {
        // Save to IndexedDB
        if (state.currentReportId) {
          await db.reports.update(state.currentReportId, reportRecord);
        } else {
          const id = await db.reports.add(reportRecord);
          set({ currentReportId: id });
        }
        
        // Simulate saving to temp JSON file via IPC (Electron only)
        if (window.electron) {
            window.electron.send('auto-save-temp', state.report);
        }

        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        set({ status: 'idle', lastAutoSave: timeString });
      } catch (error) {
        set({ status: 'error' });
        console.error("Auto-save failed:", error);
        toast.error("Auto-save failed.");
      }
    },
  };
});