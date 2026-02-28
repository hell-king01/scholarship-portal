import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  User, IndianRupee, ChevronRight, Sparkles, UserCircle,
  CheckCircle2, AlertCircle, Loader2, ArrowLeft, School, MapPin, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { indianStates } from '@/lib/scholarships-data';
import { profileAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { OCRFillSection } from '@/components/OCRFillSection';

type UserRole = 'student' | 'mentor' | 'admin';

const OnboardingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { authenticated, user, loading: authLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [extractedDocs, setExtractedDocs] = useState<Record<string, any>>({});

  // Form Data
  const [formData, setFormData] = useState({
    fullName: '',
    role: 'student' as UserRole,
    dateOfBirth: '',
    gender: 'Male',
    category: 'General',
    hasDisability: 'no',
    minorityStatus: 'none',
    aadharNumber: '',

    state: '',
    district: '',
    isHosteller: 'no',

    educationLevel: 'class12',
    institution: '',
    institutionType: 'government',
    course: '',
    courseCategory: 'engineering',
    degreeType: 'general',
    yearOfStudy: '1',
    percentage: '',

    annualIncome: '',
    incomeCategory: 'General',
    parentOccupation: 'other',
  });

  const handleDocExtract = (type: string, data: any) => {
    setExtractedDocs(prev => {
      const updated = { ...prev, [type]: data };
      // Save to local storage for "local cache" requirement
      localStorage.setItem('docVaultCache', JSON.stringify(updated));
      return updated;
    });

    if (data.parsed) {
      const p = data.parsed;
      setFormData(prev => ({
        ...prev,
        fullName: p.fullName || prev.fullName,
        dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('/').reverse().join('-') : prev.dateOfBirth,
        gender: p.gender || prev.gender,
        annualIncome: p.annualIncome || prev.annualIncome,
        percentage: p.percentage || prev.percentage,
        category: p.category || prev.category,
        aadharNumber: p.aadharNumber || prev.aadharNumber,
        state: p.state || prev.state,
        district: p.district || prev.district,
        institution: p.institution || prev.institution,
        course: p.course || prev.course,
      }));
    }
  };

  const docProgress = Math.min(100, (Object.keys(extractedDocs).length / 4) * 100);

  // Fetch existing profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (authLoading) return;

      // Load from cache if available
      const cachedDocs = localStorage.getItem('docVaultCache');
      if (cachedDocs) setExtractedDocs(JSON.parse(cachedDocs));

      if (!authenticated) {
        setDataLoading(false);
        return;
      }

      try {
        const profile = await profileAPI.getProfile();
        if (profile) {
          setFormData(prev => ({
            ...prev,
            fullName: profile.full_name || user?.user_metadata?.full_name || '',
            role: (profile.role as UserRole) || 'student',
            dateOfBirth: profile.date_of_birth || '',
            gender: profile.gender || 'Male',
            category: profile.category || 'General',
            minorityStatus: profile.minority_status || 'none',
            hasDisability: profile.has_disability ? 'yes' : 'no',
            aadharNumber: profile.aadhar_number || '',

            state: profile.state || '',
            district: profile.district || '',
            isHosteller: profile.is_hosteller ? 'yes' : 'no',

            educationLevel: profile.education_level || 'class12',
            institution: profile.institution || '',
            institutionType: profile.institution_type || 'government',
            course: profile.course || '',
            courseCategory: profile.course_category || 'engineering',
            degreeType: profile.degree_type || 'general',
            yearOfStudy: profile.year_of_study?.toString() || '1',
            percentage: profile.percentage?.toString() || '',

            annualIncome: profile.annual_income?.toString() || '',
            incomeCategory: profile.income_category || 'General',
            parentOccupation: profile.parent_occupation || 'other',
          }));
        } else if (user?.user_metadata?.full_name) {
          setFormData(prev => ({ ...prev, fullName: user.user_metadata.full_name }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchProfile();
  }, [authenticated, authLoading, user]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const steps = [
    { id: 1, title: "Documents", icon: FileText },
    { id: 2, title: "Personal", icon: User },
    { id: 3, title: "Location", icon: MapPin },
    { id: 4, title: "Education", icon: School },
    { id: 5, title: "Family", icon: IndianRupee },
  ];

  const validateStep = (step: number) => {
    if (step === 1) return null; // Flexible for now
    if (step === 2) {
      if (!formData.fullName.trim()) return "Full Name is required";
      if (!formData.dateOfBirth) return "Date of Birth is required";
      return null;
    }
    if (step === 3) {
      if (!formData.state) return "State is required";
      if (!formData.district) return "District is required";
      return null;
    }
    if (step === 4) {
      if (!formData.institution) return "Institution name is required";
      if (!formData.course) return "Course name is required";
      return null;
    }
    return null;
  };

  const handleNext = async () => {
    const error = validateStep(currentStep);
    if (error) {
      toast({ title: "Validation Error", description: error, variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await profileAPI.updateProfile({
        ...formData,
        yearOfStudy: parseInt(formData.yearOfStudy) || 1,
        percentage: parseFloat(formData.percentage) || 0,
        annualIncome: parseInt(formData.annualIncome) || 0,
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentStep(prev => prev + 1);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save progress', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(prev => prev - 1);
  };

  const handleComplete = async () => {
    const error = validateStep(currentStep);
    if (error) {
      toast({ title: "Validation Error", description: error, variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await profileAPI.updateProfile({
        ...formData,
        yearOfStudy: parseInt(formData.yearOfStudy) || 1,
        percentage: parseFloat(formData.percentage) || 0,
        annualIncome: parseInt(formData.annualIncome) || 0,
      });

      toast({ title: "🎉 Welcome Aboard!", description: "Your profile is now verified and complete." });
      navigate('/dashboard');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to complete profile', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-display font-medium">Preparing your personalized experience...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Modern Step Tracker */}
        <div className="mb-12 relative px-4">
          <div className="flex justify-between items-center relative z-10">
            {steps.map((step) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div key={step.id} className="flex flex-col items-center gap-3">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isCurrent ? 1.1 : 1,
                      backgroundColor: isCurrent || isCompleted ? 'hsl(var(--primary))' : 'hsl(var(--background))',
                      borderColor: isCurrent || isCompleted ? 'hsl(var(--primary))' : 'hsl(var(--muted))'
                    }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors duration-300 shadow-xl ${isCurrent ? 'shadow-primary/40' : ''}`}
                  >
                    {isCompleted ? <CheckCircle2 className="h-6 w-6 text-primary-foreground" /> : <Icon className={`h-5 w-5 ${isCurrent || isCompleted ? 'text-primary-foreground' : 'text-muted-foreground'}`} />}
                  </motion.div>
                  <span className={`text-[10px] uppercase tracking-wider font-bold ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Connecting Line */}
          <div className="absolute top-6 left-12 right-12 h-[2px] bg-muted -z-0">
            <motion.div
              className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="overflow-hidden border-primary/10 shadow-2xl bg-card/50 backdrop-blur-sm">
            <div className="p-8 md:p-12">
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-display font-black tracking-tight">Smart Document Upload</h2>
                    <p className="text-muted-foreground">Skip manual entry. Our AI will extract details from your documents.</p>
                  </div>

                  <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                        <span className="text-sm font-bold uppercase tracking-wide">Auto-fill Status</span>
                      </div>
                      <span className="text-xl font-black text-primary">{Math.round(docProgress)}%</span>
                    </div>
                    <Progress value={docProgress} className="h-3 rounded-full bg-primary/20" />
                  </div>

                  <OCRFillSection onExtract={handleDocExtract as any} extractedData={extractedDocs} />
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-display font-black tracking-tight">Let's get to know you</h2>
                    <p className="text-muted-foreground font-medium">Basic details to set up your profile</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2 space-y-3">
                      <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Full Name <span className="text-primary">*</span></Label>
                      <Input
                        placeholder="Enter your name exactly as it appears on documents"
                        className="h-14 text-lg font-medium bg-background/50 focus:bg-background border-muted"
                        value={formData.fullName}
                        onChange={(e) => updateField('fullName', e.target.value)}
                      />
                      <p className="text-[10px] text-muted-foreground italic">Enter your name exactly as it appears on official documents</p>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Date of Birth <span className="text-primary">*</span></Label>
                      <Input
                        type="date"
                        className="h-14 bg-background/50 border-muted"
                        value={formData.dateOfBirth}
                        onChange={(e) => updateField('dateOfBirth', e.target.value)}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Gender <span className="text-primary">*</span></Label>
                      <Select value={formData.gender} onValueChange={(v) => updateField('gender', v)}>
                        <SelectTrigger className="h-14 bg-background/50 border-muted">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Social Category <span className="text-primary">*</span></Label>
                      <Select value={formData.category} onValueChange={(v) => updateField('category', v)}>
                        <SelectTrigger className="h-14 bg-background/50 border-muted">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General">General</SelectItem>
                          <SelectItem value="OBC">OBC</SelectItem>
                          <SelectItem value="SC">SC</SelectItem>
                          <SelectItem value="ST">ST</SelectItem>
                          <SelectItem value="EWS">EWS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Minority Status <span className="text-primary">*</span></Label>
                      <Select value={formData.minorityStatus} onValueChange={(v) => updateField('minorityStatus', v)}>
                        <SelectTrigger className="h-14 bg-background/50 border-muted">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (Hindu)</SelectItem>
                          <SelectItem value="muslim">Muslim</SelectItem>
                          <SelectItem value="christian">Christian</SelectItem>
                          <SelectItem value="sikh">Sikh</SelectItem>
                          <SelectItem value="buddhist">Buddhist</SelectItem>
                          <SelectItem value="parsi">Parsi</SelectItem>
                          <SelectItem value="jain">Jain</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                      <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Do you have any disability? <span className="text-primary">*</span></Label>
                      <RadioGroup
                        value={formData.hasDisability}
                        onValueChange={(v) => updateField('hasDisability', v)}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div className={`flex items-center space-x-3 h-16 rounded-2xl border-2 px-6 transition-all ${formData.hasDisability === 'no' ? 'border-primary bg-primary/5' : 'border-muted hover:bg-muted/30'}`}>
                          <RadioGroupItem value="no" id="no" />
                          <Label htmlFor="no" className="flex-1 font-bold cursor-pointer">No</Label>
                        </div>
                        <div className={`flex items-center space-x-3 h-16 rounded-2xl border-2 px-6 transition-all ${formData.hasDisability === 'yes' ? 'border-primary bg-primary/5' : 'border-muted hover:bg-muted/30'}`}>
                          <RadioGroupItem value="yes" id="yes" />
                          <Label htmlFor="yes" className="flex-1 font-bold cursor-pointer">Yes</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="md:col-span-2 space-y-3">
                      <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Aadhaar Card Number (AI Verified)</Label>
                      <Input
                        placeholder="XXXX XXXX XXXX"
                        className="h-14 bg-primary/5 border-primary/20 font-mono text-lg"
                        value={formData.aadharNumber}
                        onChange={(e) => updateField('aadharNumber', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-display font-black tracking-tight">Where do you live?</h2>
                    <p className="text-muted-foreground font-medium">Scholarships often depend on your domicile and residence type</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">State <span className="text-primary">*</span></Label>
                      <Select value={formData.state} onValueChange={(v) => updateField('state', v)}>
                        <SelectTrigger className="h-14 bg-background/50 border-muted">
                          <SelectValue placeholder="Select Domicile State" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {indianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">District <span className="text-primary">*</span></Label>
                      <Input
                        placeholder="Enter your residential district"
                        className="h-14 bg-background/50 border-muted"
                        value={formData.district}
                        onChange={(e) => updateField('district', e.target.value)}
                      />
                    </div>

                    <div className="space-y-4">
                      <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Residential Status <span className="text-primary">*</span></Label>
                      <RadioGroup
                        value={formData.isHosteller}
                        onValueChange={(v) => updateField('isHosteller', v)}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                      >
                        <div className={`flex items-center space-x-3 h-16 rounded-2xl border-2 px-6 transition-all ${formData.isHosteller === 'no' ? 'border-primary bg-primary/5' : 'border-muted'}`}>
                          <RadioGroupItem value="no" id="dayscholar" />
                          <Label htmlFor="dayscholar" className="font-bold cursor-pointer">Day Scholar</Label>
                        </div>
                        <div className={`flex items-center space-x-3 h-16 rounded-2xl border-2 px-6 transition-all ${formData.isHosteller === 'yes' ? 'border-primary bg-primary/5' : 'border-muted'}`}>
                          <RadioGroupItem value="yes" id="hosteller" />
                          <Label htmlFor="hosteller" className="font-bold cursor-pointer">Hosteller</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-8">
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-display font-black tracking-tight">Education Details</h2>
                    <p className="text-muted-foreground font-medium">Tell us about your current course</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Education Level <span className="text-primary">*</span></Label>
                      <Select value={formData.educationLevel} onValueChange={(v) => updateField('educationLevel', v)}>
                        <SelectTrigger className="h-12 bg-background/50 border-muted">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="class10">Class 10th</SelectItem>
                          <SelectItem value="class12">Class 12th</SelectItem>
                          <SelectItem value="diploma">Diploma</SelectItem>
                          <SelectItem value="graduation">Graduation</SelectItem>
                          <SelectItem value="postGrad">Post Graduation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Degree Type <span className="text-primary">*</span></Label>
                      <Select value={formData.degreeType} onValueChange={(v) => updateField('degreeType', v)}>
                        <SelectTrigger className="h-12 bg-background/50 border-muted">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General (BA/BSc/BCom)</SelectItem>
                          <SelectItem value="professional">Professional (BE/BTech/MBBS)</SelectItem>
                          <SelectItem value="vocational">Vocational/ITI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Course Category <span className="text-primary">*</span></Label>
                      <Select value={formData.courseCategory} onValueChange={(v) => updateField('courseCategory', v)}>
                        <SelectTrigger className="h-12 bg-background/50 border-muted">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="engineering">Engineering</SelectItem>
                          <SelectItem value="medical">Medical</SelectItem>
                          <SelectItem value="arts">Arts/Commerce/Science</SelectItem>
                          <SelectItem value="law">Law</SelectItem>
                          <SelectItem value="management">Management</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Current Year <span className="text-primary">*</span></Label>
                      <Select value={formData.yearOfStudy} onValueChange={(v) => updateField('yearOfStudy', v)}>
                        <SelectTrigger className="h-12 bg-background/50 border-muted">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Year 1</SelectItem>
                          <SelectItem value="2">Year 2</SelectItem>
                          <SelectItem value="3">Year 3</SelectItem>
                          <SelectItem value="4">Year 4</SelectItem>
                          <SelectItem value="5">Year 5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Course Name <span className="text-primary">*</span></Label>
                      <Input
                        placeholder="e.g. B.Tech in IT"
                        className="h-12 bg-background border-muted"
                        value={formData.course}
                        onChange={(e) => updateField('course', e.target.value)}
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Institution Name <span className="text-primary">*</span></Label>
                      <Input
                        placeholder="e.g. Agnel Polytechnic"
                        className="h-12 bg-background border-muted"
                        value={formData.institution}
                        onChange={(e) => updateField('institution', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Institution Type <span className="text-primary">*</span></Label>
                      <Select value={formData.institutionType} onValueChange={(v) => updateField('institutionType', v)}>
                        <SelectTrigger className="h-12 bg-background/50 border-muted text-sm font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="government">Government</SelectItem>
                          <SelectItem value="private_aided">Private Aided</SelectItem>
                          <SelectItem value="private_unaided">Private Unaided</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Percentage/CGPA <span className="text-primary">*</span></Label>
                      <Input
                        type="number"
                        placeholder="e.g. 78"
                        className="h-12 bg-background border-muted font-bold text-lg"
                        value={formData.percentage}
                        onChange={(e) => updateField('percentage', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-8">
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-display font-black tracking-tight">Family & Financials</h2>
                    <p className="text-muted-foreground font-medium">Income details help us find need-based scholarships</p>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-3">
                      <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Annual Family Income (₹) <span className="text-primary">*</span></Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
                        <Input
                          type="number"
                          placeholder="370000"
                          className="h-16 pl-10 text-xl font-black bg-background border-muted"
                          value={formData.annualIncome}
                          onChange={(e) => updateField('annualIncome', e.target.value)}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">Total annual income of all earning members</p>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Parent's Occupation <span className="text-primary">*</span></Label>
                      <Select value={formData.parentOccupation} onValueChange={(v) => updateField('parentOccupation', v)}>
                        <SelectTrigger className="h-14 bg-background border-muted">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="farmer">Farmer/Agriculture</SelectItem>
                          <SelectItem value="laborer">Daily Wage Laborer</SelectItem>
                          <SelectItem value="salaried">Private Salaried</SelectItem>
                          <SelectItem value="govt">Government Employee</SelectItem>
                          <SelectItem value="business">Self Employed / Business</SelectItem>
                          <SelectItem value="retired">Retired</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-6 bg-accent/10 rounded-2xl border border-accent/20 flex gap-4 items-start shadow-inner">
                      <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center shrink-0">
                        <Sparkles className="h-5 w-5 text-accent" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-accent italic">Note</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Many scholarships are specifically reserved for children of farmers, laborers, or government employees. Accurate info here increases your match chances significantly.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 mt-12 pt-8 border-t border-muted/50">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    className="h-14 sm:w-1/3 rounded-2xl font-bold bg-background/50"
                    onClick={handleBack}
                    disabled={loading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                )}

                <div className="flex-1 space-y-4">
                  {currentStep < 5 ? (
                    <Button
                      className="w-full h-14 rounded-2xl font-bold text-lg shadow-xl shadow-primary/25 group overflow-hidden relative"
                      onClick={handleNext}
                      disabled={loading}
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                          <>
                            Next Step <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </span>
                    </Button>
                  ) : (
                    <Button
                      className="w-full h-14 rounded-2xl font-bold text-lg shadow-xl shadow-green-600/25 bg-green-600 hover:bg-green-700"
                      onClick={handleComplete}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                        <span className="flex items-center justify-center">
                          <CheckCircle2 className="mr-2 h-5 w-5" /> Complete Profile
                        </span>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>
      <BottomNav />
    </div>
  );
};

export default OnboardingPage;
