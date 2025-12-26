import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  User, GraduationCap, FileText, IndianRupee, CheckCircle2, 
  ChevronRight, ChevronLeft, Upload, Camera, Loader2, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { indianStates } from '@/lib/scholarships-data';

const steps = [
  { id: 'personal', icon: User, label: 'Personal Details' },
  { id: 'academic', icon: GraduationCap, label: 'Academic Info' },
  { id: 'documents', icon: FileText, label: 'Documents' },
  { id: 'financial', icon: IndianRupee, label: 'Financial Details' },
  { id: 'review', icon: CheckCircle2, label: 'Review' },
];

const OnboardingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    category: '',
    state: '',
    district: '',
    hasDisability: 'no',
    educationLevel: '',
    institution: '',
    course: '',
    yearOfStudy: '',
    percentage: '',
    annualIncome: '',
    incomeCategory: '',
    documents: {
      aadhar: null as File | null,
      income: null as File | null,
      caste: null as File | null,
      marksheet: null as File | null,
    },
    extractedData: {} as Record<string, string>,
  });

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleDocumentUpload = async (type: 'aadhar' | 'income' | 'caste' | 'marksheet', file: File) => {
    setFormData(prev => ({
      ...prev,
      documents: { ...prev.documents, [type]: file }
    }));

    // Simulate OCR processing
    setIsProcessingOCR(true);
    
    setTimeout(() => {
      setIsProcessingOCR(false);
      
      // Mock extracted data based on document type
      const mockExtractions: Record<string, Record<string, string>> = {
        aadhar: {
          fullName: 'Priya Sharma',
          dateOfBirth: '2002-05-15',
        },
        income: {
          annualIncome: '180000',
        },
        marksheet: {
          percentage: '85',
          institution: 'Delhi Public School',
        },
      };

      if (mockExtractions[type]) {
        setFormData(prev => ({
          ...prev,
          ...mockExtractions[type],
          extractedData: { ...prev.extractedData, [type]: 'verified' }
        }));

        toast({
          title: "Document processed successfully!",
          description: "We've extracted your information. Please verify the details.",
        });
      }
    }, 2000);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    toast({
      title: "🎉 Profile Complete!",
      description: "You can now discover scholarships matched to your profile.",
    });
    navigate('/dashboard');
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('profile.personal.fullName')}</Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                className="h-12"
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
              />
              {formData.extractedData.aadhar && (
                <p className="text-xs text-accent flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Auto-filled from Aadhar
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">{t('profile.personal.dateOfBirth')}</Label>
              <Input
                id="dateOfBirth"
                type="date"
                className="h-12"
                value={formData.dateOfBirth}
                onChange={(e) => updateField('dateOfBirth', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('profile.personal.gender')}</Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => updateField('gender', value)}
                className="flex gap-4"
              >
                {['Male', 'Female', 'Other'].map((gender) => (
                  <div key={gender} className="flex items-center gap-2">
                    <RadioGroupItem value={gender} id={gender} />
                    <Label htmlFor={gender} className="cursor-pointer">
                      {gender === 'Male' ? t('profile.personal.male') : gender === 'Female' ? t('profile.personal.female') : t('profile.personal.other')}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>{t('profile.personal.category')}</Label>
              <Select value={formData.category} onValueChange={(value) => updateField('category', value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {['General', 'OBC', 'SC', 'ST', 'EWS'].map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('profile.personal.state')}</Label>
                <Select value={formData.state} onValueChange={(value) => updateField('state', value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {indianStates.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('profile.personal.district')}</Label>
                <Input
                  placeholder="Enter district"
                  className="h-12"
                  value={formData.district}
                  onChange={(e) => updateField('district', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('profile.personal.disability')}</Label>
              <RadioGroup
                value={formData.hasDisability}
                onValueChange={(value) => updateField('hasDisability', value)}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="disability-no" />
                  <Label htmlFor="disability-no" className="cursor-pointer">{t('profile.personal.no')}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="disability-yes" />
                  <Label htmlFor="disability-yes" className="cursor-pointer">{t('profile.personal.yes')}</Label>
                </div>
              </RadioGroup>
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label>{t('profile.academic.currentLevel')}</Label>
              <Select value={formData.educationLevel} onValueChange={(value) => updateField('educationLevel', value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class10">{t('profile.academic.class10')}</SelectItem>
                  <SelectItem value="class12">{t('profile.academic.class12')}</SelectItem>
                  <SelectItem value="graduation">{t('profile.academic.graduation')}</SelectItem>
                  <SelectItem value="postGrad">{t('profile.academic.postGrad')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('profile.academic.institution')}</Label>
              <Input
                placeholder="Enter institution name"
                className="h-12"
                value={formData.institution}
                onChange={(e) => updateField('institution', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('profile.academic.course')}</Label>
              <Input
                placeholder="e.g., B.Tech Computer Science"
                className="h-12"
                value={formData.course}
                onChange={(e) => updateField('course', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('profile.academic.yearOfStudy')}</Label>
                <Select value={formData.yearOfStudy} onValueChange={(value) => updateField('yearOfStudy', value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((year) => (
                      <SelectItem key={year} value={year.toString()}>{year}st/nd/rd/th Year</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('profile.academic.percentage')}</Label>
                <Input
                  type="number"
                  placeholder="e.g., 85"
                  className="h-12"
                  value={formData.percentage}
                  onChange={(e) => updateField('percentage', e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="font-semibold text-lg mb-2">{t('profile.documents.title')}</h3>
              <p className="text-muted-foreground text-sm">{t('profile.documents.subtitle')}</p>
            </div>

            {isProcessingOCR && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
              >
                <div className="bg-card p-8 rounded-3xl shadow-elevated text-center">
                  <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
                  <p className="font-medium">{t('profile.documents.processing')}</p>
                  <p className="text-sm text-muted-foreground mt-2">This will just take a moment</p>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {[
                { type: 'aadhar' as const, label: t('profile.documents.aadhar') },
                { type: 'income' as const, label: t('profile.documents.income') },
                { type: 'caste' as const, label: t('profile.documents.caste') },
                { type: 'marksheet' as const, label: t('profile.documents.marksheet') },
              ].map((doc) => (
                <label
                  key={doc.type}
                  className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                    formData.documents[doc.type]
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-primary hover:bg-secondary/50'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDocumentUpload(doc.type, file);
                    }}
                  />
                  {formData.documents[doc.type] ? (
                    <>
                      <CheckCircle2 className="h-8 w-8 text-accent mb-2" />
                      <span className="text-sm font-medium text-accent">Uploaded</span>
                    </>
                  ) : (
                    <>
                      <div className="flex gap-2 mb-2">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <Camera className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium text-center">{doc.label}</span>
                      <span className="text-xs text-muted-foreground mt-1">{t('profile.documents.uploadHint')}</span>
                    </>
                  )}
                </label>
              ))}
            </div>

            <p className="text-xs text-center text-muted-foreground">
              We'll automatically extract information from your documents to save you time
            </p>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label>{t('profile.financial.annualIncome')}</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="e.g., 250000"
                  className="h-12 pl-10"
                  value={formData.annualIncome}
                  onChange={(e) => updateField('annualIncome', e.target.value)}
                />
              </div>
              {formData.extractedData.income && (
                <p className="text-xs text-accent flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Auto-filled from Income Certificate
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('profile.financial.incomeCategory')}</Label>
              <Select value={formData.incomeCategory} onValueChange={(value) => updateField('incomeCategory', value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BPL">{t('profile.financial.bpl')}</SelectItem>
                  <SelectItem value="EWS">{t('profile.financial.ews')}</SelectItem>
                  <SelectItem value="General">{t('profile.financial.general')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Profile Complete!</h3>
              <p className="text-muted-foreground">Review your information before finding scholarships</p>
            </div>

            <div className="bg-secondary/50 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{formData.fullName || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{formData.category || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Education</span>
                <span className="font-medium">{formData.educationLevel || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Percentage</span>
                <span className="font-medium">{formData.percentage ? `${formData.percentage}%` : 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Annual Income</span>
                <span className="font-medium">{formData.annualIncome ? `₹${parseInt(formData.annualIncome).toLocaleString('en-IN')}` : 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Documents</span>
                <span className="font-medium">
                  {Object.values(formData.documents).filter(Boolean).length}/4 uploaded
                </span>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="font-display font-bold text-lg">{t('profile.title')}</h1>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              {t('profile.saveProgress')}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-primary">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex flex-col items-center gap-2 min-w-[60px] ${
                index <= currentStep ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  index < currentStep
                    ? 'bg-accent text-accent-foreground'
                    : index === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <span className="text-xs text-center hidden md:block">{step.label}</span>
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="bg-card rounded-3xl border border-border p-6 mb-6">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          {currentStep > 0 && (
            <Button variant="outline" onClick={prevStep} className="flex-1 h-12 gap-2">
              <ChevronLeft className="h-5 w-5" />
              {t('common.back')}
            </Button>
          )}
          {currentStep < steps.length - 1 ? (
            <Button onClick={nextStep} className="flex-1 h-12 gap-2">
              {t('common.next')}
              <ChevronRight className="h-5 w-5" />
            </Button>
          ) : (
            <Button onClick={handleComplete} className="flex-1 h-12 gap-2 bg-accent hover:bg-accent/90">
              Find My Scholarships
              <Sparkles className="h-5 w-5" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default OnboardingPage;
