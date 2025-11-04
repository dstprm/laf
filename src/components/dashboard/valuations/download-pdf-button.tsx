'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateReportPDF, sanitizeFilename } from '@/utils/pdf/generate-report-pdf';
import { useToast } from '@/components/ui/use-toast';

interface DownloadPDFButtonProps {
  reportElementId: string;
  companyName?: string | null;
  reportName?: string | null;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function DownloadPDFButton({
  reportElementId,
  companyName,
  reportName,
  variant = 'default',
  size = 'default',
  className = '',
}: DownloadPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleDownloadPDF = async () => {
    setIsGenerating(true);

    try {
      const element = document.getElementById(reportElementId);
      if (!element) {
        throw new Error('Report element not found');
      }

      // Generate filename based on company name or report name
      const baseName = companyName || reportName || 'valuation-report';
      const filename = `${sanitizeFilename(baseName)}-${new Date().toISOString().split('T')[0]}.pdf`;

      await generateReportPDF(element, { filename });

      toast({
        title: 'PDF Generated Successfully',
        description: 'Your valuation report has been downloaded.',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error Generating PDF',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleDownloadPDF}
      disabled={isGenerating}
      variant={variant}
      size={size}
      className={className}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </>
      )}
    </Button>
  );
}

