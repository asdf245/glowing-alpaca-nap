import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useReportStore } from '@/store/useReportStore';
import { toast } from 'sonner';
import { FileSpreadsheet, FileText, Printer, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useFormContext } from 'react-hook-form';
import { ReportData } from '@/types/report';

interface ExportTabProps {
    onExport: (type: 'excel' | 'pdf') => void; // Triggers validation and subsequent export
}

const ExportTab: React.FC<ExportTabProps> = ({ onExport }) => {
    const { report } = useReportStore();
    const { watch, setValue } = useFormContext<ReportData>();
    
    // We no longer manage the export status here, as the IPC call is handled in Index.tsx
    // We can use a local state to track if an export attempt is ongoing for UI feedback.
    const [isExporting, setIsExporting] = useState(false);
    const [lastExportTime, setLastExportTime] = useState<string | null>(null);

    const handleExportClick = (type: 'excel' | 'pdf') => {
        setIsExporting(true);
        
        // Trigger validation in the parent component (Index.tsx)
        // The parent's onSubmit callback will handle the actual IPC export call if validation passes.
        onExport(type);
        
        // Since RHF handleSubmit is async, we can't reliably know success/failure here immediately.
        // We rely on the toast messages from the parent's export handlers.
        
        // Simulate status update for UI feedback (this is a simplification)
        setTimeout(() => {
            setIsExporting(false);
            setLastExportTime(new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }));
        }, 1000); 
    };

    const handlePrint = () => {
        // Since printing is usually a direct action without file saving, we can keep it simple.
        toast.info("Opening Windows Print Dialog (Simulated).");
    };

    return (
        <div className="space-y-8 p-4">
            <h2 className="text-2xl font-bold text-[#003366]">8. Export & Preview</h2>

            {/* Export Buttons */}
            <div className="flex flex-wrap gap-4">
                <Button 
                    onClick={() => handleExportClick('excel')} 
                    size="lg" 
                    className="bg-[#003366] hover:bg-[#004488] text-white"
                    disabled={isExporting}
                >
                    {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
                    Export to Excel
                </Button>
                <Button 
                    onClick={() => handleExportClick('pdf')} 
                    size="lg" 
                    variant="outline"
                    disabled={isExporting}
                >
                    <FileText className="mr-2 h-4 w-4" /> Export to PDF
                </Button>
                <Button 
                    onClick={handlePrint} 
                    size="lg" 
                    variant="secondary"
                >
                    <Printer className="mr-2 h-4 w-4" /> Print
                </Button>
            </div>

            <Separator />

            {/* Export Status */}
            <div className="space-y-2">
                <h3 className="text-xl font-semibold text-[#003366]">Export Status</h3>
                <p className="text-sm">
                    Status: <span className={`font-semibold ${isExporting ? 'text-orange-500' : 'text-green-600'}`}>{isExporting ? 'Exporting...' : 'Ready'}</span>
                </p>
                {lastExportTime && (
                    <p className="text-sm text-muted-foreground">
                        Last export attempt: {report.date as string} {lastExportTime}
                    </p>
                )}
            </div>

            <Separator />

            {/* Advanced Options */}
            <h3 className="text-xl font-semibold text-[#003366]">Advanced Options</h3>
            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Switch
                        id="include-signatures"
                        checked={watch('includeSignatures')}
                        onCheckedChange={(val) => setValue('includeSignatures', val)}
                    />
                    <Label htmlFor="include-signatures">Include signatures in export</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch
                        id="include-calibration"
                        checked={watch('includeCalibrationData')}
                        onCheckedChange={(val) => setValue('includeCalibrationData', val)}
                    />
                    <Label htmlFor="include-calibration">Include calibration data</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch
                        id="export-read-only"
                        checked={watch('exportReadOnly')}
                        onCheckedChange={(val) => setValue('exportReadOnly', val)}
                    />
                    <Label htmlFor="export-read-only">Export as read-only</Label>
                </div>
            </div>
        </div>
    );
};

export default ExportTab;