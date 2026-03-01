import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Calculator, CheckCircle2, XCircle, AlertCircle, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { scholarshipAPI, profileAPI } from '@/lib/api';
import { indianStates } from '@/lib/scholarships-data';
import { useAuth } from '@/hooks/useAuth';

interface EligibilityResult {
  eligible: boolean;
  matchScore: number;
  reasons: string[];
  rejectionReasons?: string[];
  matchedScholarships: Array<{
    id: string;
    title: string;
    matchScore: number;
    amount: number;
  }>;
}

export const EligibilityPredictor = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { authenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    income: '',
    category: '',
    gender: '',
    educationLevel: '',
    state: '',
    percentage: '',
    minorityStatus: 'none',
    district: '',
    hasDisability: 'no',
    isHosteller: 'no',
    institutionType: 'government',
    degreeType: 'general',
    parentOccupation: '',
    singleGirlChild: 'no',
    orphanSingleParent: 'no',
  });

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'income':
        if (!value) return 'Annual income is required';
        if (isNaN(Number(value)) || Number(value) < 0) return 'Income must be a valid number';
        if (Number(value) > 100000000) return 'Income seems too high. Please check.';
        return '';
      case 'category':
        if (!value) return 'Category is required';
        return '';
      case 'gender':
        if (!value) return 'Gender is required';
        return '';
      case 'educationLevel':
        if (!value) return 'Education level is required';
        return '';
      case 'state':
        if (!value) return 'State is required';
        return '';
      case 'percentage':
        if (value && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100)) {
          return 'Percentage must be between 0 and 100';
        }
        return '';
      default:
        return '';
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Validate on blur for income field (no numbers in income field is handled by input type)
    if (name === 'income' && value) {
      const error = validateField(name, value);
      if (error) {
        setErrors(prev => ({ ...prev, [name]: error }));
      }
    }
  };

  const handleBlur = (name: string) => {
    const value = formData[name as keyof typeof formData];
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleImportProfile = async () => {
    if (!authenticated) {
      toast({ title: 'Not logged in', description: 'Please login to import data.', variant: 'destructive' });
      return;
    }
    setIsImporting(true);
    try {
      const profile = await profileAPI.getProfile();
      if (profile) {
        setFormData(prev => ({
          ...prev,
          income: profile.annual_income?.toString() || prev.income,
          category: profile.category || prev.category,
          gender: profile.gender || prev.gender,
          educationLevel: profile.education_level || prev.educationLevel,
          state: profile.state || prev.state,
          percentage: profile.percentage?.toString() || prev.percentage,
          minorityStatus: profile.minority_status || prev.minorityStatus,
          hasDisability: profile.has_disability ? 'yes' : 'no',
          isHosteller: profile.is_hosteller ? 'yes' : 'no',
          institutionType: profile.institution_type || prev.institutionType,
          courseCategory: profile.course_category || prev.courseCategory,
          degreeType: profile.degree_type || prev.degreeType,
          parentOccupation: profile.parent_occupation || prev.parentOccupation,
          district: profile.district || prev.district,
          singleGirlChild: profile.single_girl_child ? 'yes' : 'no',
          orphanSingleParent: profile.orphan_single_parent ? 'yes' : 'no',
        }));
        setErrors({});
        toast({ title: 'Profile Loaded', description: 'Your data has been populated successfully.' });
      }
    } catch (e) {
      toast({ title: 'Failed to import', description: 'Could not load your profile.', variant: 'destructive' });
    } finally {
      setIsImporting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'percentage') {
        const error = validateField(key, formData[key as keyof typeof formData]);
        if (error) newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: 'Validation error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const criteria = {
        income: Number(formData.income),
        category: formData.category,
        gender: formData.gender,
        educationLevel: formData.educationLevel,
        state: formData.state,
        percentage: formData.percentage ? Number(formData.percentage) : undefined,
      };

      const response = await scholarshipAPI.predictEligibility(criteria);
      setResult(response);

      // Build query params for redirect
      const params = new URLSearchParams({
        income: formData.income,
        category: formData.category,
        gender: formData.gender,
        educationLevel: formData.educationLevel,
        state: formData.state,
      });
      if (formData.percentage) {
        params.append('percentage', formData.percentage);
      }

      // Redirect to scholarships page with criteria
      navigate(`/scholarships?${params.toString()}`);

      toast({
        title: 'Eligibility calculated!',
        description: response.eligible
          ? `Redirecting to ${response.matchedScholarships.length} matching scholarships...`
          : 'Redirecting to scholarships page...',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to check eligibility',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">Check Your Eligibility</h2>
              <p className="text-sm text-muted-foreground">
                Enter your details to see which scholarships you qualify for
              </p>
            </div>
          </div>
          {authenticated && (
            <Button variant="outline" onClick={handleImportProfile} disabled={isImporting} type="button" className="shrink-0">
              {isImporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              Import from Profile
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Annual Income */}
            <div className="space-y-2">
              <Label htmlFor="income">
                Annual Family Income (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="income"
                type="number"
                placeholder="e.g., 250000"
                className={`h-12 ${errors.income ? 'border-destructive' : ''}`}
                value={formData.income}
                onChange={(e) => {
                  const value = e.target.value;
                  // Prevent non-numeric characters
                  if (value === '' || /^\d+$/.test(value)) {
                    handleChange('income', value);
                  }
                }}
                onBlur={() => handleBlur('income')}
              />
              {errors.income && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.income}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter total annual family income in Indian Rupees
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange('category', value)}
              >
                <SelectTrigger className={`h-12 ${errors.category ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Select your category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="OBC">OBC (Other Backward Classes)</SelectItem>
                  <SelectItem value="SC">SC (Scheduled Caste)</SelectItem>
                  <SelectItem value="ST">ST (Scheduled Tribe)</SelectItem>
                  <SelectItem value="EWS">EWS (Economically Weaker Section)</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.category}
                </p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">
                Gender <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleChange('gender', value)}
              >
                <SelectTrigger className={`h-12 ${errors.gender ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.gender}
                </p>
              )}
            </div>

            {/* Education Level */}
            <div className="space-y-2">
              <Label htmlFor="educationLevel">
                Current Education Level <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.educationLevel}
                onValueChange={(value) => handleChange('educationLevel', value)}
              >
                <SelectTrigger className={`h-12 ${errors.educationLevel ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class10">Class 10th</SelectItem>
                  <SelectItem value="class12">Class 12th</SelectItem>
                  <SelectItem value="graduation">Graduation</SelectItem>
                  <SelectItem value="postGrad">Post Graduation</SelectItem>
                </SelectContent>
              </Select>
              {errors.educationLevel && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.educationLevel}
                </p>
              )}
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="state">
                State <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.state}
                onValueChange={(value) => handleChange('state', value)}
              >
                <SelectTrigger className={`h-12 ${errors.state ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Select your state" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {indianStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.state}
                </p>
              )}
            </div>

            {/* Percentage (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="percentage">Percentage/CGPA (Optional)</Label>
              <Input
                id="percentage"
                type="number"
                placeholder="e.g., 85"
                min="0"
                max="100"
                step="0.01"
                className={`h-12 ${errors.percentage ? 'border-destructive' : ''}`}
                value={formData.percentage}
                onChange={(e) => handleChange('percentage', e.target.value)}
                onBlur={() => handleBlur('percentage')}
              />
              {errors.percentage && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.percentage}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Your academic percentage or CGPA (if available)
              </p>
            </div>

            {/* Minority Status */}
            <div className="space-y-2">
              <Label>Minority Status</Label>
              <Select value={formData.minorityStatus} onValueChange={(v) => handleChange('minorityStatus', v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="muslim">Muslim</SelectItem>
                  <SelectItem value="christian">Christian</SelectItem>
                  <SelectItem value="sikh">Sikh</SelectItem>
                  <SelectItem value="buddhist">Buddhist</SelectItem>
                  <SelectItem value="parsi">Parsi</SelectItem>
                  <SelectItem value="jain">Jain</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* District */}
            <div className="space-y-2">
              <Label>District</Label>
              <Input className="h-12" placeholder="e.g. Pune" value={formData.district} onChange={e => handleChange('district', e.target.value)} />
            </div>

            {/* Has Disability */}
            <div className="space-y-2">
              <Label>Has Disability?</Label>
              <Select value={formData.hasDisability} onValueChange={(v) => handleChange('hasDisability', v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Is Hosteller */}
            <div className="space-y-2">
              <Label>Hosteller Status</Label>
              <Select value={formData.isHosteller} onValueChange={(v) => handleChange('isHosteller', v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Day Scholar (No)</SelectItem>
                  <SelectItem value="yes">Hosteller (Yes)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Institution Type */}
            <div className="space-y-2">
              <Label>Institution Type</Label>
              <Select value={formData.institutionType} onValueChange={(v) => handleChange('institutionType', v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="aided">Govt Aided</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Course Category */}
            <div className="space-y-2">
              <Label>Course Category</Label>
              <Select value={formData.courseCategory} onValueChange={(v) => handleChange('courseCategory', v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="arts">Arts</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="commerce">Commerce</SelectItem>
                  <SelectItem value="law">Law</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Degree Type */}
            <div className="space-y-2">
              <Label>Degree Type</Label>
              <Select value={formData.degreeType} onValueChange={(v) => handleChange('degreeType', v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Parent Occupation */}
            <div className="space-y-2">
              <Label>Parent Occupation</Label>
              <Select value={formData.parentOccupation} onValueChange={(v) => handleChange('parentOccupation', v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="agriculture">Agriculture / Farmer</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="service">Govt / Private Service</SelectItem>
                  <SelectItem value="labour">Daily Wage / Labour</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Single Girl Child (Only shows if female) */}
            {formData.gender === 'Female' && (
              <div className="space-y-2">
                <Label>Single Girl Child?</Label>
                <Select value={formData.singleGirlChild} onValueChange={(v) => handleChange('singleGirlChild', v)}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Orphan / Single Parent */}
            <div className="space-y-2">
              <Label>Orphan / Single Parent</Label>
              <Select value={formData.orphanSingleParent} onValueChange={(v) => handleChange('orphanSingleParent', v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Checking Eligibility...
              </>
            ) : (
              <>
                <Calculator className="h-5 w-5 mr-2" />
                Check Eligibility
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Results */}
      {
        result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className={`p-6 ${result.eligible ? 'bg-accent/10 border-accent' : 'bg-destructive/10 border-destructive'}`}>
              <div className="flex items-start gap-4">
                {result.eligible ? (
                  <CheckCircle2 className="h-8 w-8 text-accent flex-shrink-0 mt-1" />
                ) : (
                  <XCircle className="h-8 w-8 text-destructive flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">
                    {result.eligible ? 'You Are Eligible!' : 'Eligibility Issues Found'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Match Score: <span className="font-bold">{result.matchScore}%</span>
                  </p>

                  {result.eligible && result.reasons.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <p className="font-medium text-sm">Why you qualify:</p>
                      <ul className="space-y-1">
                        {result.reasons.map((reason, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!result.eligible && result.rejectionReasons && result.rejectionReasons.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <p className="font-medium text-sm">Issues:</p>
                      <ul className="space-y-1">
                        {result.rejectionReasons.map((reason, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {result.matchedScholarships.length > 0 && (
              <Card className="p-6">
                <h4 className="font-semibold mb-4">Matched Scholarships ({result.matchedScholarships.length})</h4>
                <div className="space-y-3">
                  {result.matchedScholarships.map((scholarship) => (
                    <div
                      key={scholarship.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{scholarship.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Match: {scholarship.matchScore}% • ₹{scholarship.amount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        )
      }
    </div >
  );
};


