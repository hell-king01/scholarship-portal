import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { OCRUpload } from './OCRUpload';

interface ExtractedData {
  rawText: string;
  parsed: {
    fullName?: string;
    dateOfBirth?: string;
    category?: string;
    annualIncome?: string;
    percentage?: string;
    institution?: string;
    [key: string]: any;
  };
  confidence: number;
}

interface OCRFillSectionProps {
  onExtract: (type: 'aadhar' | 'income' | 'caste' | 'marksheet', data: ExtractedData) => void;
  extractedData: Record<string, ExtractedData>;
}

export const OCRFillSection = ({ onExtract, extractedData }: OCRFillSectionProps) => {
  const { t } = useTranslation();

  const documents = [
    { type: 'aadhar' as const, label: t('profile.documents.aadhar'), required: true },
    { type: 'income' as const, label: t('profile.documents.income'), required: true },
    { type: 'caste' as const, label: t('profile.documents.caste'), required: true },
    { type: 'marksheet' as const, label: t('profile.documents.marksheet'), required: false },
  ];

  const getExtractedSummary = (type: string) => {
    const data = extractedData[type];
    if (!data) return null;

    const parsed = data.parsed || {};
    const fields: string[] = [];

    if (parsed.fullName) fields.push(`Name: ${parsed.fullName}`);
    if (parsed.dateOfBirth) fields.push(`DOB: ${parsed.dateOfBirth}`);
    if (parsed.category) fields.push(`Category: ${parsed.category}`);
    if (parsed.annualIncome) fields.push(`Income: ₹${parsed.annualIncome}`);
    if (parsed.percentage) fields.push(`Percentage: ${parsed.percentage}%`);
    if (parsed.institution) fields.push(`Institution: ${parsed.institution}`);

    return fields.length > 0 ? fields : null;
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-display text-xl font-bold">OCR Fill</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Upload your documents to automatically extract and fill your information
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => {
          const summary = getExtractedSummary(doc.type);
          const isExtracted = !!extractedData[doc.type];

          return (
            <div key={doc.type} className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {doc.label}
                  {doc.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {isExtracted && (
                  <div className="flex items-center gap-1 text-xs text-accent">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Extracted</span>
                  </div>
                )}
              </div>

              <OCRUpload
                type={doc.type}
                label={doc.label}
                onExtract={(data) => onExtract(doc.type, data)}
              />

              {summary && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 bg-accent/10 rounded-lg border border-accent/20"
                >
                  <p className="text-xs font-medium text-accent mb-2">Extracted Information:</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {summary.map((field, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3 w-3 text-accent mt-0.5 flex-shrink-0" />
                        <span>{field}</span>
                      </li>
                    ))}
                  </ul>
                  {extractedData[doc.type] && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Confidence: {Math.round(extractedData[doc.type].confidence)}%
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {Object.keys(extractedData).length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-primary/10 rounded-lg border border-primary/20"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-primary mb-1">
                OCR Data Ready
              </p>
              <p className="text-xs text-muted-foreground">
                The extracted information will be auto-filled in the Personal Details section below.
                You can review and edit the values there.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  );
};

// Add Label import
import { Label } from '@/components/ui/label';

