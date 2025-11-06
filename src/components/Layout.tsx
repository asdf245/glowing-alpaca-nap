import React, { useState } from 'react';
import { FileText, FolderOpen, Save, FileSpreadsheet, File, Menu, Clock, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MadeWithDyad } from './made-with-dyad';
import { useReportStore } from '@/store/useReportStore';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useReportActions } from '@/hooks/useReportActions'; // Import the new hook

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TABS = [
  { id: 'general', label: 'General', icon: FileText },
  { id: 'bit', label: 'Bit Data', icon: FileText },
  { id: 'drilling', label: 'Drilling', icon: FileText },
  // { id: 'calculations', label: 'Calculations', icon: Calculator }, // Removed
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

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { report, lastAutoSave } = useReportStore();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Use the new hook, passing a callback to handle tab change on new report
  const { handleNewReport, handleSaveDraft, handleOpenReport } = useReportActions(() => onTabChange('general'));

  // Note: Export functions are now handled by ExportTab, which receives validated data.
  // The buttons here are for general file management (New, Open, Save Draft).

  const QuickSummary = () => (
    <div className="p-4 border-t border-border mt-auto bg-sidebar-accent/50">
      <h3 className="font-semibold text-sm mb-2 text-sidebar-foreground">QUICK SUMMARY</h3>
      <p className="text-xs text-sidebar-foreground/80">Well: <span className="font-medium">{report.wellName as string || 'N/A'}</span></p>
      <p className="text-xs text-sidebar-foreground/80">Date: <span className="font-medium">{report.date as string || 'N/A'}</span></p>
      <p className="text-xs text-sidebar-foreground/80">Report: <span className="font-medium">{report.reportNo as number || 'N/A'}</span></p>
      <p className="text-xs text-sidebar-foreground/80">Depth: <span className="font-medium">{report.depthTo as number || 'N/A'}m</span></p>
    </div>
  );

  const HeaderActions = () => (
    <div className="flex items-center space-x-2">
      <Button onClick={handleNewReport} variant="outline" size="sm">
        <File className="h-4 w-4 mr-2" /> New
      </Button>
      <Button onClick={handleOpenReport} variant="outline" size="sm">
        <FolderOpen className="h-4 w-4 mr-2" /> Open
      </Button>
      <Button onClick={handleSaveDraft} variant="secondary" size="sm">
        <Save className="h-4 w-4 mr-2" /> Save Draft
      </Button>
      {/* Export buttons removed from Layout header, as they are now centralized in ExportTab 
          and require form validation first. */}
      <span className="text-sm text-muted-foreground ml-4">Status &gt;&gt;</span>
    </div>
  );

  const FooterStatus = () => (
    <div className="flex justify-between items-center p-2 border-t border-border text-xs text-muted-foreground">
      <span>
        {report.wellName as string}: {report.depthFrom as number}-{report.depthTo as number}m | Report No. {report.reportNo as number}
      </span>
      <span className="flex items-center">
        <Clock className="h-3 w-3 mr-1" />
        {lastAutoSave ? `Auto-saved at ${lastAutoSave}` : 'Ready'}
      </span>
    </div>
  );
  
  // Handler for desktop navigation
  const handleDesktopTabSelect = (tabId: string) => {
    onTabChange(tabId);
  };

  // Handler for mobile navigation: selects tab and closes sheet
  const handleMobileTabSelect = (tabId: string) => {
    onTabChange(tabId);
    setIsSheetOpen(false);
  };

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
              <SidebarNavigation activeTab={activeTab} onSelectTab={handleMobileTabSelect} />
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
          <SidebarNavigation activeTab={activeTab} onSelectTab={handleDesktopTabSelect} />
        </div>
        <QuickSummary />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-grow">
        <header className="p-4 border-b border-border flex items-center justify-between">
          <HeaderActions />
          <span className={`text-sm font-medium text-muted-foreground`}>
            {lastAutoSave ? `Auto-saved at ${lastAutoSave}` : 'Ready'}
          </span>
        </header>
        <div className="flex-grow p-6 overflow-y-auto">
          {children}
        </div>
        <FooterStatus />
        <MadeWithDyad />
      </div>
    </div>
  );
};