import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ScholarshipCard } from '@/components/ScholarshipCard';
import { scholarshipAPI, profileAPI } from '@/lib/api';
import { calculateMatchScore, type UserProfile, type Scholarship } from '@/lib/scholarships-data';
import { useAuth } from '@/hooks/useAuth';
import { useSavedScholarships } from '@/hooks/useSavedScholarships';

const ScholarshipsPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { authenticated } = useAuth();

  const [scholarships, setScholarships] = useState<(Scholarship & { matchScore: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const { savedScholarships, toggleSave } = useSavedScholarships();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [filterCriteria, setFilterCriteria] = useState<{
    income?: number;
    category?: string;
    gender?: string;
    educationLevel?: string;
    state?: string;
    percentage?: number;
  } | null>(null);

  // Read filter criteria from URL params (from Eligibility page)
  useEffect(() => {
    const income = searchParams.get('income');
    const category = searchParams.get('category');
    const gender = searchParams.get('gender');
    const educationLevel = searchParams.get('educationLevel');
    const state = searchParams.get('state');
    const percentage = searchParams.get('percentage');

    if (income || category || gender || educationLevel || state) {
      setFilterCriteria({
        income: income ? Number(income) : undefined,
        category: category || undefined,
        gender: gender || undefined,
        educationLevel: educationLevel || undefined,
        state: state || undefined,
        percentage: percentage ? Number(percentage) : undefined,
      });
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch profile if authenticated
        let profile = null;
        if (authenticated) {
          const rawProfile = await profileAPI.getProfile();
          if (rawProfile) {
            profile = {
              fullName: rawProfile.full_name,
              dateOfBirth: rawProfile.date_of_birth,
              gender: rawProfile.gender,
              category: rawProfile.category,
              state: rawProfile.state,
              district: rawProfile.district,
              hasDisability: rawProfile.has_disability,
              educationLevel: rawProfile.education_level,
              institution: rawProfile.institution,
              course: rawProfile.course,
              yearOfStudy: rawProfile.year_of_study,
              percentage: rawProfile.percentage,
              annualIncome: rawProfile.annual_income,
              incomeCategory: rawProfile.income_category,
              documents: {},
              profileComplete: true,
            };
            setUserProfile(profile);
          }
        }

        // Create a temporary profile if filter criteria exists but not authenticated
        const effectiveProfile: UserProfile = profile || {
          fullName: 'Guest',
          dateOfBirth: '2000-01-01',
          gender: (filterCriteria?.gender as any) || 'Male',
          category: (filterCriteria?.category as any) || 'General',
          state: filterCriteria?.state || 'All',
          district: '',
          hasDisability: false,
          educationLevel: (filterCriteria?.educationLevel as any) || 'graduation',
          institution: '',
          course: '',
          yearOfStudy: 1,
          percentage: filterCriteria?.percentage || 60,
          annualIncome: filterCriteria?.income || 500000,
          incomeCategory: 'General',
          documents: {},
          profileComplete: !!profile,
        };

        // Fetch scholarships
        const data = await scholarshipAPI.getAll();

        // Calculate match scores
        const scored = data.map((s: Scholarship) => ({
          ...s,
          matchScore: calculateMatchScore(effectiveProfile, s)
        }));

        // Sort by match score (eligible first, then ineligible)
        const sorted = scored.sort((a: any, b: any) => b.matchScore - a.matchScore);
        setScholarships(sorted);
      } catch (error) {
        console.error('Error fetching scholarships:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authenticated, filterCriteria]);

  const filters = [
    { id: 'all', label: t('scholarships.filters.all') },
    { id: 'government', label: t('scholarships.filters.government') },
    { id: 'private', label: t('scholarships.filters.private') },
    { id: 'ngo', label: t('scholarships.filters.ngo') },
  ];

  const filteredScholarships = scholarships.filter(s => {
    // Apply filter criteria if available
    if (filterCriteria) {
      if (filterCriteria.category && !s.eligibility.categories.includes(filterCriteria.category)) return false;
      if (filterCriteria.gender && !s.eligibility.genders.includes(filterCriteria.gender)) return false;
      if (filterCriteria.educationLevel && !s.eligibility.educationLevels.includes(filterCriteria.educationLevel)) return false;
      if (filterCriteria.state && !s.eligibility.states.includes('All') && !s.eligibility.states.includes(filterCriteria.state)) return false;
      if (filterCriteria.income && s.eligibility.maxIncome < filterCriteria.income) return false;
      if (filterCriteria.percentage && s.eligibility.minPercentage > filterCriteria.percentage) return false;
    }

    // Apply provider type filter
    if (activeFilter !== 'all' && s.providerType !== activeFilter) return false;

    // Apply search query
    if (searchQuery &&
      !s.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !s.provider.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold mb-2">{t('scholarships.title')}</h1>
          <p className="text-muted-foreground mb-6">{t('scholarships.subtitle')}</p>
        </motion.div>

        {/* Show filter criteria banner */}
        {filterCriteria && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Card className="p-4 bg-primary/10 border-primary/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary mb-1">Filtered by Eligibility Criteria</p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {filterCriteria.income && <Badge variant="outline">Income: ₹{filterCriteria.income.toLocaleString('en-IN')}</Badge>}
                    {filterCriteria.category && <Badge variant="outline">Category: {filterCriteria.category}</Badge>}
                    {filterCriteria.gender && <Badge variant="outline">Gender: {filterCriteria.gender}</Badge>}
                    {filterCriteria.educationLevel && <Badge variant="outline">Education: {filterCriteria.educationLevel}</Badge>}
                    {filterCriteria.state && <Badge variant="outline">State: {filterCriteria.state}</Badge>}
                    {filterCriteria.percentage && <Badge variant="outline">Percentage: {filterCriteria.percentage}%</Badge>}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => {
                  setFilterCriteria(null);
                  window.history.replaceState({}, '', '/scholarships');
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder={t('common.search')}
            className="pl-10 h-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <Badge
              key={filter.id}
              variant={activeFilter === filter.id ? 'default' : 'outline'}
              className="cursor-pointer px-4 py-2 text-sm whitespace-nowrap"
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </Badge>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Searching for matching scholarships...</p>
          </div>
        ) : filteredScholarships.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Card className="p-12 max-w-md mx-auto">
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                {filterCriteria
                  ? "Sorry, we can't find scholarships for you with your current criteria."
                  : t('scholarships.empty.title')}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Try adjusting your criteria or check back later for new scholarships.
              </p>
              {filterCriteria && (
                <Button variant="outline" onClick={() => {
                  setFilterCriteria(null);
                  window.history.replaceState({}, '', '/scholarships');
                }}>
                  Clear Filters
                </Button>
              )}
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScholarships.map((scholarship, index) => {
              const effectiveProfile: UserProfile = userProfile || {
                fullName: 'Guest',
                dateOfBirth: '2000-01-01',
                gender: (filterCriteria?.gender as any) || 'Male',
                category: (filterCriteria?.category as any) || 'General',
                state: filterCriteria?.state || 'All',
                district: '',
                hasDisability: false,
                educationLevel: (filterCriteria?.educationLevel as any) || 'graduation',
                institution: '',
                course: '',
                yearOfStudy: 1,
                percentage: filterCriteria?.percentage || 60,
                annualIncome: filterCriteria?.income || 500000,
                incomeCategory: 'General',
                documents: {},
                profileComplete: false,
              };

              return (
                <motion.div
                  key={scholarship.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ScholarshipCard
                    scholarship={scholarship}
                    userProfile={effectiveProfile}
                    isSaved={savedScholarships.includes(scholarship.id)}
                    onSave={() => toggleSave(scholarship.id)}
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default ScholarshipsPage;

