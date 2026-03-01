import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, Loader2, CheckCircle2, X, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ocrAPI, documentAPI } from '@/lib/api';
import Tesseract from 'tesseract.js';

interface OCRUploadProps {
  type: 'aadhar' | 'income' | 'caste' | 'marksheet' | 'domicile' | 'medical' | 'parent_death' | 'passbook' | string;
  label: string;
  onExtract: (data: any) => void;
  accept?: string;
  enableOCR?: boolean;
  existingUrl?: string;
  existingData?: any;
  existingName?: string;
}

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

export const OCRUpload = ({ type, label, onExtract, accept = 'image/*,.pdf', enableOCR = true, existingUrl, existingData, existingName }: OCRUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCleared, setIsCleared] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (existingUrl && !isCleared) {
      if (existingUrl.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i)) {
        setPreview(existingUrl);
      } else {
        // Just indicate file is there by having a non-null preview or showing file info
        setPreview('non-image');
      }

      if (enableOCR && existingData && Object.keys(existingData).length > 0) {
        setExtractedData({
          rawText: "Loaded from secure vault.",
          parsed: existingData,
          confidence: 100
        });
      } else if (!enableOCR) {
        setExtractedData({
          rawText: 'Document safely synced.',
          parsed: {},
          confidence: 100
        } as ExtractedData);
      }
    }
  }, [existingUrl, existingData, enableOCR]);

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.pdf')) {
      setError('Please upload a JPG, PNG, or PDF file');
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setExtractedData(null);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setPreview(null);
    }

    // Auto-process as soon as file is selected
    processOCR(selectedFile);
  };

  const processOCR = async (fileToProcess?: File) => {
    const targetFile = fileToProcess || file;
    if (!targetFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Upload to Supabase Storage securely for all documents
      await documentAPI.uploadDocument(type, targetFile);

      const savedFileName = `${type}.${targetFile.name.split('.').pop() || 'tmp'}`;

      // 2. If it's just a file upload (no OCR needed), exit early
      if (!enableOCR) {
        // Save database record with empty JSON
        await documentAPI.saveDocumentRecord(type, savedFileName, {});
        const dummyResult = {
          rawText: 'Document uploaded securely.',
          parsed: {},
          confidence: 100
        };
        setExtractedData(dummyResult as ExtractedData);
        onExtract(dummyResult);
        toast({
          title: 'Document Saved!',
          description: 'Your document was successfully stored.',
        });
        return;
      }

      if (targetFile.type === 'application/pdf' || targetFile.name.endsWith('.pdf')) {
        // Use backend API for PDF
        const result = await ocrAPI.extractText(targetFile, type);
        await documentAPI.saveDocumentRecord(type, savedFileName, result.parsed);

        setExtractedData(result);
        onExtract(result);
        toast({
          title: 'Document processed successfully!',
          description: 'Information extracted. Please verify the details.',
        });
      } else {
        try {
          // Try Gemini first as it has infinitely better accuracy
          const result = await ocrAPI.extractTextWithGemini(targetFile, type);
          await documentAPI.saveDocumentRecord(type, savedFileName, result.parsed);

          setExtractedData(result as unknown as ExtractedData);
          onExtract(result);
          toast({
            title: 'Smart Extract Complete!',
            description: `Document perfectly scanned. Please verify.`,
          });
        } catch (geminiError) {
          console.warn('Gemini extraction failed or no key, falling back to Tesseract:', geminiError);
          // Fallback: Use Tesseract.js for images in the browser
          const { data } = await Tesseract.recognize(targetFile, 'eng', {
            logger: (m) => {
              if (m.status === 'recognizing text') {
                // Could show progress here
              }
            },
          });

          const rawText = data.text;
          const confidence = data.confidence || 0;

          // Send to parser 
          const parsed = await ocrAPI.parseDocument(rawText, type);

          await documentAPI.saveDocumentRecord(type, savedFileName, parsed);

          const result: ExtractedData = {
            rawText,
            parsed,
            confidence,
          };

          setExtractedData(result);
          onExtract(result);
          toast({
            title: 'Document processed',
            description: `Extracted with ${Math.round(confidence)}% confidence via basic OCR.`,
          });
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to process document';
      setError(errorMessage);
      toast({
        title: 'Processing failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setExtractedData(null);
    setError(null);
    setIsCleared(true);
    // Note: We're clearing the state, but we don't implicitly delete the actual file 
    // from Supabase storage here to prevent accidental data loss until they save/submit.
    // If they refresh, the existing document will reappear unless explicitly deleted through a profile update.
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReupload = () => {
    handleRemove();
    fileInputRef.current?.click();
  };

  return (
    <Card className="p-4 border-2 border-dashed border-border hover:border-primary transition-colors">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const selectedFile = e.target.files?.[0];
          if (selectedFile) handleFileSelect(selectedFile);
        }}
      />

      <AnimatePresence mode="wait">
        {!file && (!existingUrl || isCleared) ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-8 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex gap-3 mb-4">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <Camera className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">{label}</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Tap to upload or take a photo
            </p>
            <p className="text-xs text-muted-foreground">
              Supports JPG, PNG, PDF (max 10MB)
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Preview */}
            {preview && preview !== 'non-image' && (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img src={preview} alt="Preview" className="w-full h-48 object-contain bg-muted" />
                <button
                  onClick={handleRemove}
                  className="absolute top-2 right-2 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {(!preview || preview === 'non-image') && (file || existingName) && (
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium truncate">{file ? file.name : existingName}</p>
                  <p className="text-sm text-muted-foreground">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : `Secured Document`}
                  </p>
                </div>
                <button onClick={handleRemove}>
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Processing */}
            {isProcessing && (
              <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Processing document...</p>
                  <p className="text-xs text-muted-foreground">This may take a few seconds</p>
                </div>
              </div>
            )}

            {/* Extracted Data */}
            {extractedData && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3 p-4 bg-accent/10 rounded-lg border border-accent/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <h4 className="font-semibold text-sm">Extracted Information</h4>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(extractedData.confidence)}% confidence
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  {Object.entries(extractedData.parsed).map(([key, value]) => (
                    value && (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="font-medium">{value}</span>
                      </div>
                    )
                  ))}
                </div>

                <div className="pt-3 border-t border-accent/20">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Show raw text in a dialog
                      toast({
                        title: 'Raw Extracted Text',
                        description: extractedData.rawText.substring(0, 200) + '...',
                      });
                    }}
                    className="w-full"
                  >
                    View Raw Text
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Actions */}
            {!isProcessing && !extractedData && error && (
              <div className="flex gap-2">
                <Button onClick={() => processOCR()} className="flex-1">
                  Retry Processing
                </Button>
                <Button variant="outline" onClick={handleReupload}>
                  Re-upload
                </Button>
              </div>
            )}

            {extractedData && !isProcessing && (
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to use this extracted data to automatically update your scholarship profile?")) {
                      onExtract(extractedData);
                      toast({
                        title: 'Data prepared for save',
                        description: 'Please click Save Verified Data to finalize your profile update.',
                      });
                    }
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Use this Extracted Data in Profile
                </Button>
                <Button onClick={handleReupload} variant="outline" className="w-full">
                  Upload a Different File
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};



