import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useReportStore } from '@/store/useReportStore';
import { ipcRenderer } from '@/ipc/ipcRenderer';
import { toast } from 'sonner';
import { FileSpreadsheet, FileText, Printer, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useFormContext } from 'react-hook-form';
import { ReportData } from '@/types/report';

interface ExportTabProps {
    onExport: () => void;
}

const ExportTab: React.FC<ExportTabProps> = ({ onExport }) => {
    const { report } = useReportStore();
    const { watch, setValue } = useFormContext<ReportData>();
    const [exportStatus, setExportStatus] = useState<'Ready' | 'Exporting...' | 'Complete' | 'Error'>('Ready');
    const [lastExportTime, setLastExportTime] = useState<string | null>(null);

    const handleExport = async (type: 'excel' | 'pdf') => {
        setExportStatus('Exporting...');
        
        // 1. Validate the form before attempting export
        // We rely on the parent component (Index.tsx) to trigger RHF validation via onExport prop
        
        // 2. If validation passes (handled by parent), proceed with IPC call
        try {
            const channel = type === 'excel' ? 'export-excel' : 'export-pdf';
            
            // Simulate the IPC call to the main process
            const result = await ipcRenderer.invoke(channel, report);

            if (result?.success) {
                setExportStatus('Complete');
                setLastExportTime(new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }));
                toast.success(`${type.toUpperCase()} export successful!`);
            } else {
                setExportStatus('Ready');
                toast.error(`${type.toUpperCase()} export failed or cancelled.`);
            }
        } catch (error) {
            console.error(`Export Error (${type}):`, error);
            setExportStatus('Error');
            toast.error(`An error occurred during ${type} export.`);
        } finally {
            // Reset status after a short delay if successful
            if (exportStatus === 'Complete') {
                setTimeout(() => setExportStatus('Ready'), 3000);
            }
        }
    };

    const handlePrint = () => {
        if (window.electron) {
            window.electron.send('export-pdf', report); // Use PDF channel for print simulation
            toast.info("Opening Windows Print Dialog (Simulated).");
        } else {
            toast.info("Print functionality simulated.");
        }
    };

    const statusColor = {
        'Ready': 'text-green-600',
        'Exporting...': 'text-orange-500',
        'Complete': 'text-green-600',
        'Error': 'text-red-600',
    }[exportStatus];

    return (
        <div className="space-y-8 p-4">
            <h2 className="text-2xl font-bold text-[#003366]">8. Export & Preview</h2>

            {/* Export Buttons */}
            <div className="flex flex-wrap gap-4">
                <Button 
                    onClick={() => handleExport('excel')} 
                    size="lg" 
                    className="bg-[#003366] hover:bg-[#004488] text-white"
                    disabled={exportStatus === 'Exporting...'}
                >
                    {exportStatus === 'Exporting...' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
                    Export to Excel
                </Button>
                <Button 
                    onClick={() => handleExport('pdf')} 
                    size="lg" 
                    variant="outline"
                    disabled={exportStatus === 'Exporting...'}
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
                    Status: <span className={`font-semibold ${statusColor}`}>{exportStatus}</span>
                </p>
                {lastExportTime && (
                    <p className="text-sm text-muted-foreground">
                        Last exported: {report.date} {lastExportTime}
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