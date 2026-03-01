import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  User, IndianRupee, ChevronRight, Sparkles, UserCircle,
  CheckCircle2, AlertCircle, Loader2, ArrowLeft, School, MapPin
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
  const [extractedData, setExtractedData] = useState<Record<string, any>>({});

  const handleExtract = (type: string, data: any) => {
    setExtractedData(prev => ({ ...prev, [type]: data }));

    const parsed = data.parsed;
    if (parsed) {
      const updates: any = {};

      // Personal Details mappings
      if (parsed.fullName) updates.fullName = parsed.fullName;
      if (parsed.dateOfBirth) updates.dateOfBirth = parsed.dateOfBirth;
      if (parsed.gender) updates.gender = parsed.gender;
      if (parsed.category) updates.category = parsed.category;

      // Financial Details mappings
      if (parsed.annualIncome) updates.annualIncome = parsed.annualIncome;

      // Education Details mappings
      if (parsed.percentage) updates.percentage = parsed.percentage;
      if (parsed.institution) updates.institution = parsed.institution;

      // Update form data merging with existing values
      setFormData(prev => ({
        ...prev,
        ...updates
      }));
    }
  };

  // Form Data
  const [formData, setFormData] = useState({
    fullName: '',
    role: 'student' as UserRole,
    dateOfBirth: '',
    gender: 'Male',
    category: 'General',
    hasDisability: 'no',
    minorityStatus: 'none', // Moved to Step 1 (Mandatory)

    state: '',
    district: '',
    isHosteller: 'no', // Moved to Step 2 (Mandatory)

    educationLevel: 'class12',
    institution: '',
    institutionType: 'government', // New mandatory
    course: '',
    courseCategory: 'engineering', // New mandatory
    degreeType: 'general', // New mandatory
    yearOfStudy: '1',
    percentage: '',

    annualIncome: '',
    incomeCategory: 'General',
    parentOccupation: 'other', // Moved to Step 4 (Mandatory)
    singleGirlChild: 'no',
    orphanSingleParent: 'no',
  });

  // Fetch existing profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (authLoading) return;
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
            singleGirlChild: profile.single_girl_child ? 'yes' : 'no',
            orphanSingleParent: profile.orphan_single_parent ? 'yes' : 'no',
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

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      // Document Upload Step: No strict mandatory frontend validation needed, they can skip if they want, or we can make them upload at least one
      return null;
    }
    if (step === 2) {
      if (!formData.fullName.trim()) return "Full Name is required";
      if (!formData.dateOfBirth) return "Date of Birth is required";
      if (!formData.gender) return "Gender is required";
      if (!formData.category) return "Social Category is required";
      // minorityStatus has default 'none', hasDisability has default 'no'
      return null;
    }
    if (step === 3) {
      if (!formData.state) return "State is required";
      if (!formData.district) return "District is required";
      // isHosteller has default 'no'
      return null;
    }
    if (step === 4) {
      if (!formData.educationLevel) return "Education Level is required";
      if (!formData.institution.trim()) return "Institution Name is required";
      if (!formData.course.trim()) return "Course Name is required";
      if (!formData.percentage) return "Percentage/CGPA is required";
      // institutionType, courseCategory, degreeType have defaults
      return null;
    }
    if (step === 5) {
      if (!formData.annualIncome) return "Annual Family Income is required";
      if (!formData.parentOccupation) return "Parent's Occupation is required";
      return null;
    }
    return null;
  };

  const handleNext = async () => {
    const error = validateStep(currentStep);
    if (error) {
      toast({ title: "Please complete the form", description: error, variant: "destructive" });
      return;
    }

    // Save progress after each step
    setLoading(true);
    try {
      await profileAPI.updateProfile({
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        category: formData.category,
        state: formData.state,
        district: formData.district,
        hasDisability: formData.hasDisability === 'yes',
        educationLevel: formData.educationLevel,
        institution: formData.institution,
        institutionType: formData.institutionType,
        course: formData.course,
        courseCategory: formData.courseCategory,
        degreeType: formData.degreeType,
        yearOfStudy: parseInt(formData.yearOfStudy) || 1,
        percentage: parseFloat(formData.percentage) || 0,
        annualIncome: parseInt(formData.annualIncome) || 0,
        incomeCategory: formData.incomeCategory,
        role: formData.role,
        parentOccupation: formData.parentOccupation,
        minorityStatus: formData.minorityStatus,
        isHosteller: formData.isHosteller === 'yes',
        singleGirlChild: formData.singleGirlChild === 'yes',
        orphanSingleParent: formData.orphanSingleParent === 'yes',
      });

      toast({
        title: "✓ Progress saved",
        description: `Step ${currentStep} completed successfully.`,
      });

      window.scrollTo(0, 0);
      setCurrentStep(prev => prev + 1);
    } catch (error: any) {
      console.error('Error saving progress:', error);
      toast({
        title: 'Error saving progress',
        description: error.message || 'Failed to save. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.scrollTo(0, 0);
    setCurrentStep(prev => prev - 1);
  };

  const handleComplete = async () => {
    const error = validateStep(currentStep);
    if (error) {
      toast({ title: "Please complete the form", description: error, variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await profileAPI.updateProfile({
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        category: formData.category,
        state: formData.state,
        district: formData.district,
        hasDisability: formData.hasDisability === 'yes',
        educationLevel: formData.educationLevel,
        institution: formData.institution,
        institutionType: formData.institutionType,
        course: formData.course,
        courseCategory: formData.courseCategory,
        degreeType: formData.degreeType,
        yearOfStudy: parseInt(formData.yearOfStudy) || 1,
        percentage: parseFloat(formData.percentage) || 0,
        annualIncome: parseInt(formData.annualIncome) || 0,
        incomeCategory: formData.incomeCategory,
        role: formData.role,
        // Additional fields for better matching
        parentOccupation: formData.parentOccupation,
        minorityStatus: formData.minorityStatus,
        isHosteller: formData.isHosteller === 'yes',
      });

      toast({
        title: "🎉 Profile Complete!",
        description: "Your profile has been saved successfully."
      });

      const role = formData.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'mentor') navigate('/mentor');
      else navigate('/dashboard');
    } catch (error: any) {
      if (!authenticated) {
        toast({ title: "Not Signed In", description: "You need to sign in to save your profile.", variant: "destructive" });
        navigate('/auth');
        return;
      }
      toast({ title: 'Error', description: error.message || 'Failed to save profile', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  const steps = [
    { id: 1, title: "Documents", icon: Sparkles },
    { id: 2, title: "Personal", icon: User },
    { id: 3, title: "Location", icon: MapPin },
    { id: 4, title: "Education", icon: School },
    { id: 5, title: "Family", icon: IndianRupee },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">

        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl border border-primary/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-xl mb-2">Complete Your Profile</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Help us understand you better so we can match you with the most relevant scholarships.
                This will only take 5-10 minutes and you'll never have to re-enter this information again.
              </p>
              <p className="text-xs text-primary/80 mt-2 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Your progress is automatically saved after each step
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress Tracker */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step) => (
              <div key={step.id} className={`flex flex-col items-center gap-2 relative z-10 ${currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep >= step.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-muted'}`}>
                  {currentStep > step.id ? <CheckCircle2 className="h-6 w-6" /> : <step.icon className="h-5 w-5" />}
                </div>
                <span className="text-xs font-medium hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
          <div className="relative h-2 bg-secondary rounded-full overflow-hidden top-[-40px] z-0 mx-6 opacity-0 sm:opacity-100 hidden sm:block">
            <div
              className="absolute h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
          {/* Mobile Progress Bar */}
          <div className="sm:hidden mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Step {currentStep} of 5</span>
              <span className="text-muted-foreground">{steps[currentStep - 1].title}</span>
            </div>
            <Progress value={((currentStep) / 5) * 100} className="h-2" />
          </div>
        </div>

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 md:p-8 shadow-lg border-primary/10">
            {/* Step 1: Document Upload */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Smart Document Setup</h2>
                  <p className="text-muted-foreground">Upload your documents and let our AI auto-fill the form for you!</p>
                </div>

                <OCRFillSection
                  onExtract={handleExtract}
                  extractedData={extractedData}
                />
              </div>
            )}

            {/* Step 2: Personal Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Let's get to know you</h2>
                  <p className="text-muted-foreground">Basic details to set up your profile</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
                    <Input
                      id="fullName"
                      placeholder="Your full name as per Aadhaar"
                      className="h-12"
                      value={formData.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Enter your name exactly as it appears on official documents</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth <span className="text-destructive">*</span></Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        className="h-12"
                        value={formData.dateOfBirth}
                        onChange={(e) => updateField('dateOfBirth', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Gender <span className="text-destructive">*</span></Label>
                      <Select value={formData.gender} onValueChange={(val) => updateField('gender', val)}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Social Category <span className="text-destructive">*</span></Label>
                      <Select value={formData.category} onValueChange={(val) => updateField('category', val)}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {['General', 'OBC', 'SC', 'ST', 'EWS'].map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Minority Status <span className="text-destructive">*</span></Label>
                      <Select value={formData.minorityStatus} onValueChange={(val) => updateField('minorityStatus', val)}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Religion" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (Hindu)</SelectItem>
                          <SelectItem value="muslim">Muslim</SelectItem>
                          <SelectItem value="christian">Christian</SelectItem>
                          <SelectItem value="sikh">Sikh</SelectItem>
                          <SelectItem value="buddhist">Buddhist</SelectItem>
                          <SelectItem value="jain">Jain</SelectItem>
                          <SelectItem value="parsi">Parsi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Do you have any disability? <span className="text-destructive">*</span></Label>
                    <RadioGroup
                      value={formData.hasDisability}
                      onValueChange={(val) => updateField('hasDisability', val)}
                      className="flex gap-4"
                    >
                      <div className={`flex items-center space-x-2 border rounded-lg p-3 cursor-pointer flex-1 ${formData.hasDisability === 'no' ? 'bg-primary/5 border-primary' : 'hover:bg-accent'}`}>
                        <RadioGroupItem value="no" id="disability-no" />
                        <Label htmlFor="disability-no" className="cursor-pointer flex-1 user-select-none">No</Label>
                      </div>
                      <div className={`flex items-center space-x-2 border rounded-lg p-3 cursor-pointer flex-1 ${formData.hasDisability === 'yes' ? 'bg-primary/5 border-primary' : 'hover:bg-accent'}`}>
                        <RadioGroupItem value="yes" id="disability-yes" />
                        <Label htmlFor="disability-yes" className="cursor-pointer flex-1 user-select-none">Yes</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Location & Residence */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Where do you live?</h2>
                  <p className="text-muted-foreground">Scholarships often depend on your domicile and residence type</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>State <span className="text-destructive">*</span></Label>
                    <Select value={formData.state} onValueChange={(val) => updateField('state', val)}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select your state" />
                      </SelectTrigger>
                      <SelectContent>
                        {indianStates.map(st => (
                          <SelectItem key={st} value={st}>{st}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>District <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="Enter your district"
                      className="h-12"
                      value={formData.district}
                      onChange={(e) => updateField('district', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Residential Status <span className="text-destructive">*</span></Label>
                    <RadioGroup
                      value={formData.isHosteller}
                      onValueChange={(val) => updateField('isHosteller', val)}
                      className="flex gap-4"
                    >
                      <div className={`flex items-center space-x-2 border rounded-lg p-3 cursor-pointer flex-1 ${formData.isHosteller === 'no' ? 'bg-primary/5 border-primary' : 'hover:bg-accent'}`}>
                        <RadioGroupItem value="no" id="hosteller-no" />
                        <Label htmlFor="hosteller-no" className="cursor-pointer flex-1 user-select-none">Day Scholar</Label>
                      </div>
                      <div className={`flex items-center space-x-2 border rounded-lg p-3 cursor-pointer flex-1 ${formData.isHosteller === 'yes' ? 'bg-primary/5 border-primary' : 'hover:bg-accent'}`}>
                        <RadioGroupItem value="yes" id="hosteller-yes" />
                        <Label htmlFor="hosteller-yes" className="cursor-pointer flex-1 user-select-none">Hosteller</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Detailed Education */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Education Details</h2>
                  <p className="text-muted-foreground">Tell us about your current course</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Education Level <span className="text-destructive">*</span></Label>
                      <Select value={formData.educationLevel} onValueChange={(val) => updateField('educationLevel', val)}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="class10">Class 10</SelectItem>
                          <SelectItem value="class12">Class 12</SelectItem>
                          <SelectItem value="graduation">Graduation (UG)</SelectItem>
                          <SelectItem value="postGrad">Post Graduation (PG)</SelectItem>
                          <SelectItem value="phd">PhD/Research</SelectItem>
                          <SelectItem value="diploma">Diploma</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Degree Type <span className="text-destructive">*</span></Label>
                      <Select value={formData.degreeType} onValueChange={(val) => updateField('degreeType', val)}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General (BA/BSc/BCom)</SelectItem>
                          <SelectItem value="professional">Professional (MBBS/BTech)</SelectItem>
                          <SelectItem value="technical">Technical (Diploma/ITI)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Course Category <span className="text-destructive">*</span></Label>
                      <Select value={formData.courseCategory} onValueChange={(val) => updateField('courseCategory', val)}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="engineering">Engineering</SelectItem>
                          <SelectItem value="medical">Medical</SelectItem>
                          <SelectItem value="arts">Arts/Humanities</SelectItem>
                          <SelectItem value="science">Science</SelectItem>
                          <SelectItem value="commerce">Commerce</SelectItem>
                          <SelectItem value="law">Law</SelectItem>
                          <SelectItem value="management">Management</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Current Year <span className="text-destructive">*</span></Label>
                      <Select value={formData.yearOfStudy.toString()} onValueChange={(val) => updateField('yearOfStudy', val)}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map(y => (
                            <SelectItem key={y} value={y.toString()}>Year {y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="courseName">Course Name <span className="text-destructive">*</span></Label>
                    <Input
                      id="courseName"
                      placeholder="e.g. B.Tech in Computer Science / Class 12 Science"
                      className="h-12"
                      value={formData.course}
                      onChange={(e) => updateField('course', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Institution Name <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="School/College Name"
                      className="h-12"
                      value={formData.institution}
                      onChange={(e) => updateField('institution', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Institution Type <span className="text-destructive">*</span></Label>
                      <Select value={formData.institutionType} onValueChange={(val) => updateField('institutionType', val)}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="government">Government</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="aided">Govt Aided</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Percentage/CGPA <span className="text-destructive">*</span></Label>
                      <Input
                        type="number"
                        placeholder="e.g. 85"
                        className="h-12"
                        value={formData.percentage}
                        onChange={(e) => updateField('percentage', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Family & Economy */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Family & Financials</h2>
                  <p className="text-muted-foreground">Income details help us find need-based scholarships</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Annual Family Income (₹) <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="e.g. 250000"
                        className="h-12 pl-10"
                        value={formData.annualIncome}
                        onChange={(e) => updateField('annualIncome', e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Total annual income of all earning members</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parentOccupation">Parent's Occupation <span className="text-destructive">*</span></Label>
                    <Select
                      value={formData.parentOccupation}
                      onValueChange={(value) => updateField('parentOccupation', value)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select parent's occupation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="farmer">Farmer</SelectItem>
                        <SelectItem value="daily_wage">Daily Wage Laborer</SelectItem>
                        <SelectItem value="govt_employee">Government Employee</SelectItem>
                        <SelectItem value="private_salaried">Private Salaried</SelectItem>
                        <SelectItem value="self_employed">Self Employed</SelectItem>
                        <SelectItem value="unemployed">Unemployed</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm font-medium text-primary mb-2">💡 Note</p>
                    <p className="text-xs text-muted-foreground">
                      Many scholarships are specifically reserved for children of farmers, laborers, or government employees. Accurate info here increases your match chances significantly.
                    </p>
                  </div>

                  {formData.gender === 'Female' && (
                    <div className="space-y-2">
                      <Label htmlFor="singleGirlChild">Single Girl Child? <span className="text-destructive">*</span></Label>
                      <Select
                        value={formData.singleGirlChild}
                        onValueChange={(value) => updateField('singleGirlChild', value)}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Massive specific funding available for single girl child.</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="orphanSingleParent">Orphan / Single Parent Status? <span className="text-destructive">*</span></Label>
                    <Select
                      value={formData.orphanSingleParent}
                      onValueChange={(value) => updateField('orphanSingleParent', value)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8 pt-4 border-t">
              {currentStep > 1 && (
                <Button variant="outline" className="flex-1 h-12" onClick={handleBack} disabled={loading}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
              )}

              {currentStep < 5 ? (
                <Button className="flex-1 h-12" onClick={handleNext} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {loading ? 'Saving...' : 'Next Step'} <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button className="flex-1 h-12 bg-green-600 hover:bg-green-700" onClick={handleComplete} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                  Complete Profile
                </Button>
              )}
            </div>

          </Card>
        </motion.div>
      </main>
      <BottomNav />
    </div >
  );
};

export default OnboardingPage;
