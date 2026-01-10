import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  User, FileText, IndianRupee, CheckCircle2, 
  ChevronRight, Sparkles, UserCircle, Shield, Users, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { indianStates } from '@/lib/scholarships-data';
import { OCRFillSection } from '@/components/OCRFillSection';
import { profileAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';

type UserRole = 'student' | 'mentor' | 'admin';

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

const OnboardingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { authenticated } = useAuth();
  
  // Account Details
  const [accountDetails, setAccountDetails] = useState({
    fullName: '',
    role: 'student' as UserRole,
  });

  // OCR Extracted Data
  const [ocrExtractedData, setOcrExtractedData] = useState<Record<string, ExtractedData>>({});

  // Personal Details (auto-filled from Account Details and OCR)
  const [personalDetails, setPersonalDetails] = useState({
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
  });

  // Auto-fill personal details when account name or OCR data changes
  useEffect(() => {
    // Auto-fill name from account details
    if (accountDetails.fullName) {
      setPersonalDetails(prev => ({ ...prev, fullName: accountDetails.fullName }));
    }
  }, [accountDetails.fullName]);

  // Auto-fill from OCR data
  useEffect(() => {
    const updates: Partial<typeof personalDetails> = {};

    // Extract from Aadhar
    if (ocrExtractedData.aadhar?.parsed) {
      const parsed = ocrExtractedData.aadhar.parsed;
      if (parsed.fullName && !personalDetails.fullName) updates.fullName = parsed.fullName;
      if (parsed.dateOfBirth) updates.dateOfBirth = parsed.dateOfBirth;
      if (parsed.category) updates.category = parsed.category;
    }

    // Extract from Income Certificate
    if (ocrExtractedData.income?.parsed) {
      const parsed = ocrExtractedData.income.parsed;
      if (parsed.annualIncome) updates.annualIncome = parsed.annualIncome;
    }

    // Extract from Marksheet
    if (ocrExtractedData.marksheet?.parsed) {
      const parsed = ocrExtractedData.marksheet.parsed;
      if (parsed.percentage) updates.percentage = parsed.percentage;
      if (parsed.institution) updates.institution = parsed.institution;
    }

    if (Object.keys(updates).length > 0) {
      setPersonalDetails(prev => ({ ...prev, ...updates }));
    }
  }, [ocrExtractedData]);

  const handleOCRExtract = (type: 'aadhar' | 'income' | 'caste' | 'marksheet', data: ExtractedData) => {
    setOcrExtractedData(prev => ({ ...prev, [type]: data }));
  };

  const handleSaveAccountDetails = async () => {
    if (!accountDetails.fullName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Full Name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Save role and name to profile
      if (authenticated) {
        await profileAPI.updateProfile({
          fullName: accountDetails.fullName,
          role: accountDetails.role,
          username: accountDetails.fullName, // Use fullName as username
        });
      }
      
      toast({
        title: 'Account Details Saved',
        description: 'Your account information has been saved',
      });
    } catch (error: any) {
      // Allow guest mode - don't block if API fails
      console.warn('Failed to save account details:', error);
    }
  };

  const handleSaveProfile = async () => {
    // Validation
    if (!personalDetails.fullName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Full Name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!personalDetails.dateOfBirth) {
      toast({
        title: 'Validation Error',
        description: 'Date of Birth is required',
        variant: 'destructive',
      });
      return;
    }

    if (!personalDetails.category) {
      toast({
        title: 'Validation Error',
        description: 'Category is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Save profile to backend
      await profileAPI.updateProfile({
        fullName: personalDetails.fullName,
        dateOfBirth: personalDetails.dateOfBirth,
        gender: personalDetails.gender,
        category: personalDetails.category,
        state: personalDetails.state,
        district: personalDetails.district,
        hasDisability: personalDetails.hasDisability === 'yes',
        educationLevel: personalDetails.educationLevel,
        institution: personalDetails.institution,
        course: personalDetails.course,
        yearOfStudy: personalDetails.yearOfStudy ? parseInt(personalDetails.yearOfStudy) : undefined,
        percentage: personalDetails.percentage ? parseFloat(personalDetails.percentage) : undefined,
        annualIncome: personalDetails.annualIncome ? parseInt(personalDetails.annualIncome) : undefined,
        incomeCategory: personalDetails.incomeCategory,
        role: accountDetails.role,
      });

      toast({
        title: "🎉 Profile Complete!",
        description: "You can now discover scholarships matched to your profile.",
      });
      
      // Redirect based on role
      if (accountDetails.role === 'admin') {
        navigate('/admin');
      } else if (accountDetails.role === 'mentor') {
        navigate('/mentor');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      // If not authenticated, allow guest mode
      if (!authenticated) {
        toast({
          title: 'Profile Preview Saved',
          description: 'Sign in to save your profile permanently',
        });
        return;
      }

      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save profile',
        variant: 'destructive',
      });
    }
  };

  const updatePersonalField = (field: keyof typeof personalDetails, value: string) => {
    setPersonalDetails(prev => ({ ...prev, [field]: value }));
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return Shield;
      case 'mentor':
        return Users;
      default:
        return UserCircle;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">{t('profile.title')}</h1>
            <p className="text-muted-foreground">
              Complete your profile to discover matching scholarships
            </p>
          </div>

          {/* Section 1: Account Details */}
          <Card className="p-6">
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-bold">Account Details</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Set up your account information
              </p>
            </div>

            <Separator className="mb-6" />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountFullName">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="accountFullName"
                  placeholder="Enter your full name"
                  className="h-12"
                  value={accountDetails.fullName}
                  onChange={(e) => {
                    setAccountDetails(prev => ({ ...prev, fullName: e.target.value }));
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  This will be used as your username
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">
                  Role <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={accountDetails.role}
                  onValueChange={(value) => {
                    setAccountDetails(prev => ({ ...prev, role: value as UserRole }));
                  }}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-4 w-4" />
                        <span>Student</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="mentor">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Mentor</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>Admin</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveAccountDetails} className="w-full">
                Save Account Details
              </Button>
            </div>
          </Card>

          {/* Section 2: OCR Fill */}
          <OCRFillSection
            onExtract={handleOCRExtract}
            extractedData={ocrExtractedData}
          />

          {/* Section 3: Personal Details */}
          <Card className="p-6">
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-bold">Personal Details</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Review and complete your personal information (auto-filled from OCR)
              </p>
            </div>

            <Separator className="mb-6" />

            <div className="space-y-6">
              {/* Full Name - Auto-filled from Account Details */}
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  className="h-12"
                  value={personalDetails.fullName}
                  onChange={(e) => updatePersonalField('fullName', e.target.value)}
                />
                {accountDetails.fullName && (
                  <p className="text-xs text-accent flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Auto-filled from Account Details
                  </p>
                )}
                {ocrExtractedData.aadhar?.parsed?.fullName && (
                  <p className="text-xs text-accent flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Also found in Aadhar
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">
                  Date of Birth <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  className="h-12"
                  value={personalDetails.dateOfBirth}
                  onChange={(e) => updatePersonalField('dateOfBirth', e.target.value)}
                />
                {ocrExtractedData.aadhar?.parsed?.dateOfBirth && (
                  <p className="text-xs text-accent flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Auto-filled from Aadhar
                  </p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label>Gender <span className="text-destructive">*</span></Label>
                <RadioGroup
                  value={personalDetails.gender}
                  onValueChange={(value) => updatePersonalField('gender', value)}
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

              {/* Category */}
              <div className="space-y-2">
                <Label>Category <span className="text-destructive">*</span></Label>
                <Select
                  value={personalDetails.category}
                  onValueChange={(value) => updatePersonalField('category', value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {['General', 'OBC', 'SC', 'ST', 'EWS'].map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {ocrExtractedData.aadhar?.parsed?.category && (
                  <p className="text-xs text-accent flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Auto-filled from Aadhar
                  </p>
                )}
              </div>

              {/* State and District */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>State <span className="text-destructive">*</span></Label>
                  <Select
                    value={personalDetails.state}
                    onValueChange={(value) => updatePersonalField('state', value)}
                  >
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
                  <Label>District</Label>
                  <Input
                    placeholder="Enter district"
                    className="h-12"
                    value={personalDetails.district}
                    onChange={(e) => updatePersonalField('district', e.target.value)}
                  />
                </div>
              </div>

              {/* Disability */}
              <div className="space-y-2">
                <Label>Do you have any disability?</Label>
                <RadioGroup
                  value={personalDetails.hasDisability}
                  onValueChange={(value) => updatePersonalField('hasDisability', value)}
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

              {/* Education Level */}
              <div className="space-y-2">
                <Label>Education Level</Label>
                <Select
                  value={personalDetails.educationLevel}
                  onValueChange={(value) => updatePersonalField('educationLevel', value)}
                >
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

              {/* Institution */}
              <div className="space-y-2">
                <Label>Institution</Label>
                <Input
                  placeholder="Enter institution name"
                  className="h-12"
                  value={personalDetails.institution}
                  onChange={(e) => updatePersonalField('institution', e.target.value)}
                />
                {ocrExtractedData.marksheet?.parsed?.institution && (
                  <p className="text-xs text-accent flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Auto-filled from Marksheet
                  </p>
                )}
              </div>

              {/* Course */}
              <div className="space-y-2">
                <Label>Course/Stream</Label>
                <Input
                  placeholder="e.g., B.Tech Computer Science"
                  className="h-12"
                  value={personalDetails.course}
                  onChange={(e) => updatePersonalField('course', e.target.value)}
                />
              </div>

              {/* Year of Study and Percentage */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Year of Study</Label>
                  <Select
                    value={personalDetails.yearOfStudy}
                    onValueChange={(value) => updatePersonalField('yearOfStudy', value)}
                  >
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
                  <Label>Percentage/CGPA</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 85"
                    className="h-12"
                    value={personalDetails.percentage}
                    onChange={(e) => updatePersonalField('percentage', e.target.value)}
                  />
                  {ocrExtractedData.marksheet?.parsed?.percentage && (
                    <p className="text-xs text-accent flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Auto-filled from Marksheet
                    </p>
                  )}
                </div>
              </div>

              {/* Annual Income */}
              <div className="space-y-2">
                <Label>Annual Family Income (₹)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="e.g., 250000"
                    className="h-12 pl-10"
                    value={personalDetails.annualIncome}
                    onChange={(e) => updatePersonalField('annualIncome', e.target.value)}
                  />
                </div>
                {ocrExtractedData.income?.parsed?.annualIncome && (
                  <p className="text-xs text-accent flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Auto-filled from Income Certificate
                  </p>
                )}
              </div>

              {/* Income Category */}
              <div className="space-y-2">
                <Label>Income Category</Label>
                <Select
                  value={personalDetails.incomeCategory}
                  onValueChange={(value) => updatePersonalField('incomeCategory', value)}
                >
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
            </div>

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-border">
              <Button
                onClick={handleSaveProfile}
                className="w-full h-12 text-base gap-2"
                size="lg"
              >
                <Sparkles className="h-5 w-5" />
                Save Profile & Continue
              </Button>
              {!authenticated && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Sign in to save your profile permanently
                </p>
              )}
            </div>
          </Card>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default OnboardingPage;
