import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, FolderOpen, Save, FileSpreadsheet, File, Menu, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MadeWithDyad } from './made-with-dyad';
import { useReportStore } from '@/store/useReportStore';
import { ipcRenderer } from '@/ipc/ipcRenderer';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

const TABS = [
  { id: 'general', label: 'General', icon: FileText },
  { id: 'bit', label: 'Bit Data', icon: FileText },
  { id: 'drilling', label: 'Drilling', icon: FileText },
  { id: 'lithology', label: 'Lithology', icon: FileText },
  { id: 'gas', label: 'Gas Data', icon: FileText },
  { id: 'operations', label: 'Operations', icon: FileText },
  { id: 'equipment', label: 'Equipment', icon: FileText },
  { id: 'export', label: 'Export', icon: FileSpreadsheet },
];

const SidebarNavigation = ({ activeTab, onSelectTab }: { activeTab: string, onSelectTab: (id: string) => void }) => (
  <nav className="flex flex-col space-y-1 p-4">
    {TABS.map((tab) => {
      const Icon = tab.icon;
      const isActive = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          onClick={() => onSelectTab(tab.id)}
          className={`flex items-center p-3 rounded-lg transition-colors ${
            isActive
              ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }`}
        >
          <Icon className="w-5 h-5 mr-3" />
          <span className="font-medium">{tab.label}</span>
        </button>
      );
    })}
  </nav>
);

export const Layout: React.FC<LayoutProps> = ({ children, activeTab }) => {
  const { report, lastAutoSave, newReport, autoSave } = useReportStore();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(activeTab);

  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);

  const handleExportExcel = async () => {
    if (!window.electron) {
      toast.error("Electron IPC not available. Cannot export.");
      return;
    }
    toast.loading("Preparing Excel export...");
    try {
      // Trigger the main process to handle file generation and save dialog
      const result = await ipcRenderer.invoke('export-excel', report);
      toast.dismiss();
      if (result?.success) {
        toast.success(`Export successful!`);
      } else {
        toast.error("Export failed or cancelled.");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Export failed due to an internal error.");
      console.error("Export error:", error);
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
    setCurrentTab('general');
  };

  const QuickSummary = () => (
    <div className="p-4 border-t border-border mt-auto bg-sidebar-accent/50">
      <h3 className="font-semibold text-sm mb-2 text-sidebar-foreground">QUICK SUMMARY</h3>
      <p className="text-xs text-sidebar-foreground/80">Well: <span className="font-medium">{report.wellName || 'N/A'}</span></p>
      <p className="text-xs text-sidebar-foreground/80">Date: <span className="font-medium">{report.date || 'N/A'}</span></p>
      <p className="text-xs text-sidebar-foreground/80">Report: <span className="font-medium">{report.reportNo || 'N/A'}</span></p>
      <p className="text-xs text-sidebar-foreground/80">Depth: <span className="font-medium">{report.depthTo || 'N/A'}m</span></p>
    </div>
  );

  const HeaderActions = () => (
    <div className="flex items-center space-x-2">
      <Button onClick={handleNewReport} variant="outline" size="sm">
        <File className="h-4 w-4 mr-2" /> New
      </Button>
      <Button variant="outline" size="sm">
        <FolderOpen className="h-4 w-4 mr-2" /> Open
      </Button>
      <Button onClick={handleSaveDraft} variant="secondary" size="sm">
        <Save className="h-4 w-4 mr-2" /> Save Draft
      </Button>
      <Button onClick={handleExportExcel} size="sm" className="bg-[#003366] hover:bg-[#004488] text-white">
        <FileSpreadsheet className="h-4 w-4 mr-2" /> Export Excel
      </Button>
      <Button variant="outline" size="sm">
        <File className="h-4 w-4 mr-2" /> Export PDF
      </Button>
      <span className="text-sm text-muted-foreground ml-4">Status &gt;&gt;</span>
    </div>
  );

  const FooterStatus = () => (
    <div className="flex justify-between items-center p-2 border-t border-border text-xs text-muted-foreground">
      <span>
        {report.wellName}: {report.depthFrom}-{report.depthTo}m | Report No. {report.reportNo}
      </span>
      <span className="flex items-center">
        <Clock className="h-3 w-3 mr-1" />
        {lastAutoSave ? `Auto-saved at ${lastAutoSave}` : 'Ready'}
      </span>
    </div>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="flex justify-between items-center p-4 border-b border-border">
          <h1 className="font-bold text-lg text-[#003366]">NIDC Mudlog Reporter</h1>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col w-[250px] sm:w-[300px] p-0">
              <div className="p-4 border-b">
                <h2 className="font-bold text-xl text-[#003366]">Menu</h2>
              </div>
              <SidebarNavigation activeTab={currentTab} onSelectTab={setCurrentTab} />
              <QuickSummary />
            </SheetContent>
          </Sheet>
        </header>
        <div className="flex-grow p-4 overflow-y-auto">
          {children}
        </div>
        <FooterStatus />
        <MadeWithDyad />
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar */}
      <div className="w-64 flex flex-col border-r border-border bg-sidebar">
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="font-bold text-xl text-[#003366]">NIDC Mudlog Reporter</h1>
        </div>
        <div className="flex-grow overflow-y-auto">
          <SidebarNavigation activeTab={currentTab} onSelectTab={setCurrentTab} />
        </div>
        <QuickSummary />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-grow">
        <HeaderActions />
        <Separator />
        <div className="flex-grow p-6 overflow-y-auto">
          {children}
        </div>
        <FooterStatus />
        <MadeWithDyad />
      </div>
    </div>
  );
};