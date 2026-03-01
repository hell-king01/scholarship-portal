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
  onExtract: (type: string, data: ExtractedData) => void;
  extractedData: Record<string, ExtractedData>;
  uploadedDocs?: Record<string, { name: string, url: string, extracted_data?: any }>;
}

export const OCRFillSection = ({ onExtract, extractedData, uploadedDocs = {} }: OCRFillSectionProps) => {
  const { t } = useTranslation();

  const documents = [
    { type: 'aadhar', label: t('profile.documents.aadhar') || 'Aadhar Card', required: true, enableOCR: true },
    { type: 'income', label: t('profile.documents.income') || 'Income Certificate', required: true, enableOCR: true },
    { type: 'caste', label: t('profile.documents.caste') || 'Caste Certificate', required: false, enableOCR: true },
    { type: 'marksheet', label: t('profile.documents.marksheet') || 'Previous Marksheet', required: false, enableOCR: true },
    { type: 'domicile', label: 'Domicile Certificate', required: true, enableOCR: false },
    { type: 'medical', label: 'Medical Certificate (if disabled)', required: false, enableOCR: false },
    { type: 'parent_death', label: "Parent's Death Certificate (if applicable)", required: false, enableOCR: false },
    { type: 'passbook', label: 'Bank Passbook / Cancelled Cheque', required: true, enableOCR: false },
  ];

  const getExtractedSummary = (type: string) => {
    const data = extractedData[type];
    if (!data) return null;

    const parsed = data.parsed || {};
    const fields: string[] = [];

    Object.entries(parsed).forEach(([key, value]) => {
      if (value) {
        // CamelCase to Title Case
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        fields.push(`${formattedKey}: ${value}`);
      }
    });

    return fields.length > 0 ? fields : ['No recognizable data found for auto-fill'];
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
                {(isExtracted || uploadedDocs[doc.type]) && (
                  <div className="flex items-center gap-2">
                    {uploadedDocs[doc.type] && (
                      <a href={uploadedDocs[doc.type].url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                        View Saved
                      </a>
                    )}
                    <div className="flex items-center gap-1 text-xs text-accent">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{isExtracted ? 'Extracted' : 'Uploaded'}</span>
                    </div>
                  </div>
                )}
              </div>

              <OCRUpload
                type={doc.type}
                label={doc.label}
                enableOCR={doc.enableOCR}
                onExtract={(data) => onExtract(doc.type, data)}
                existingUrl={uploadedDocs[doc.type]?.url}
                existingData={uploadedDocs[doc.type]?.extracted_data}
                existingName={uploadedDocs[doc.type]?.name}
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

