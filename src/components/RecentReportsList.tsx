import React, { useEffect, useState } from 'react';
import { useReportStore } from '@/store/useReportStore';
import { ReportRecord } from '@/db/db';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RecentReportsList: React.FC = () => {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const listReports = useReportStore((state) => state.listReports);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      const recent = await listReports();
      setReports(recent);
      setLoading(false);
    };
    fetchReports();
  }, [listReports]);

  const handleOpenReport = (id: number) => {
    navigate(`/report/${id}`);
  };
  
  const handleExportReport = (id: number) => {
    // Load the report and navigate directly to the export tab
    navigate(`/report/${id}?tab=export`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6 text-center text-muted-foreground">
          No recent reports found. Start a new report to see it listed here.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Card key={report.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <FileText className="h-6 w-6 text-[#003366]" />
              <div>
                <p className="font-semibold text-lg">{report.wellName} (Rpt No. {report.data.reportNo})</p>
                <p className="text-sm text-muted-foreground flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Last Modified: {report.reportDate} at {new Date(report.lastModified).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => handleOpenReport(report.id!)}
              >
                Open Report
              </Button>
              <Button 
                onClick={() => handleExportReport(report.id!)}
                className="bg-green-600 hover:bg-green-700"
              >
                Export <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};