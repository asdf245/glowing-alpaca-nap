import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { File, FolderOpen, Calculator } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { useReportActions } from '@/hooks/useReportActions';
import { RecentReportsList } from '@/components/RecentReportsList';
import { useReportStore } from '@/store/useReportStore';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { newReport } = useReportStore();
  
  // Use a simplified version of useReportActions just for the New/Open handlers
  const { handleOpenReport } = useReportActions(() => navigate('/report'));

  const handleStartNewReport = () => {
    newReport(); // Reset store state
    navigate('/report');
  };
  
  const handleRunCalculations = () => {
    navigate('/calculator');
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-background p-8">
      <div className="w-full max-w-4xl space-y-10">
        
        {/* Header and Quick Actions */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#003366]">
            NIDC Mudlog Reporter
          </h1>
          <p className="text-lg text-muted-foreground">
            Daily Report Generation and Engineering Calculations
          </p>
        </div>

        <Card className="shadow-xl border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Select Module</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap justify-center gap-6">
            <Button 
              onClick={handleStartNewReport} 
              size="lg" 
              className="h-14 px-8 text-lg bg-green-600 hover:bg-green-700"
            >
              <File className="h-6 w-6 mr-3" /> Start Reporting
            </Button>
            <Button 
              onClick={handleRunCalculations} 
              size="lg" 
              variant="secondary"
              className="h-14 px-8 text-lg"
            >
              <Calculator className="h-6 w-6 mr-3" /> Run Calculations
            </Button>
            <Button 
              onClick={handleOpenReport} 
              size="lg" 
              variant="outline"
              className="h-14 px-8 text-lg"
            >
              <FolderOpen className="h-6 w-6 mr-3" /> Open Existing Draft
            </Button>
          </CardContent>
        </Card>

        <Separator />

        {/* Recent Reports List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[#003366]">Recent Drafts (Local Storage)</h2>
          <RecentReportsList />
        </div>
      </div>
      
      <div className="mt-auto pt-10">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;