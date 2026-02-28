import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap, FileText, Clock, TrendingUp, ChevronRight,
  Calendar, Star, Target, Sparkles, ArrowRight, Upload,
  Calculator, Search, User, Shield, BarChart3, Settings,
  CheckCircle2, Loader2, Activity, Users, AlertTriangle, Download,
  Link as LinkIcon, ExternalLink, Zap, MousePointerClick, Globe, MoveUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ScholarshipCard } from '@/components/ScholarshipCard';
import { UserProfile, calculateMatchScore } from '@/lib/scholarships-data';
import { useAuth } from '@/hooks/useAuth';
import { profileAPI, scholarshipAPI, applicationAPI } from '@/lib/api';
import JourneyTracker from '@/components/JourneyTracker';
import { ApplicationAnalytics } from '@/components/ApplicationAnalytics';
import { DashboardActivity } from '@/components/DashboardActivity';
import { ExtensionTokenCard } from '@/components/ExtensionTokenCard';

const DashboardPage = () => {
  const { t } = useTranslation();
  const { role, authenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [matchedScholarships, setMatchedScholarships] = useState<any[]>([]);
  const [savedScholarships, setSavedScholarships] = useState<string[]>([]);
  const [applicationCount, setApplicationCount] = useState(0);
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return;
      if (!authenticated) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const profile = await profileAPI.getProfile();
        if (profile) {
          const mappedProfile: any = {
            fullName: profile.full_name,
            dateOfBirth: profile.date_of_birth,
            gender: profile.gender,
            category: profile.category,
            state: profile.state,
            district: profile.district,
            hasDisability: profile.has_disability,
            educationLevel: profile.education_level,
            institution: profile.institution,
            course: profile.course,
            yearOfStudy: profile.year_of_study,
            percentage: profile.percentage,
            annualIncome: profile.annual_income,
            incomeCategory: profile.income_category,
            profileComplete: true
          };

          setUserProfile({ ...mappedProfile, id: profile.id });

          const fields = [
            mappedProfile.fullName, mappedProfile.dateOfBirth, mappedProfile.gender,
            mappedProfile.category, mappedProfile.state, mappedProfile.educationLevel,
            mappedProfile.institution, mappedProfile.annualIncome
          ];
          const completed = fields.filter((f: any) => !!f).length;
          setProfileCompletion(Math.round((completed / fields.length) * 100));

          const data = await scholarshipAPI.getAll();
          const scored = data.map((s: any) => ({
            ...s,
            matchScore: calculateMatchScore(mappedProfile, s)
          }));

          const matched = scored
            .filter((s: any) => s.matchScore > 0)
            .sort((a: any, b: any) => b.matchScore - a.matchScore);

          setMatchedScholarships(matched);

          const apps = await applicationAPI.getAll();
          setApplicationCount(apps.length);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authenticated, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  const StudentDashboard = () => {
    if (!userProfile) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="bg-primary/10 p-6 rounded-full">
            <User className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Complete Your Profile</h1>
          <p className="text-muted-foreground max-w-md">
            To match you with the best scholarships, we need a few details about your education and background.
          </p>
          <Link to="/onboarding">
            <Button size="lg" className="gap-2">
              Set Up Profile <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      );
    }

    const quickActions = [
      { icon: Upload, label: 'Upload Documents', description: 'OCR Fill', path: '/documents', color: 'bg-orange-100 text-orange-600' },
      { icon: Calculator, label: 'Check Eligibility', description: 'Predict matches', path: '/eligibility', color: 'bg-emerald-100 text-emerald-600' },
      { icon: Search, label: 'Browse Scholarships', description: 'View all', path: '/scholarships', color: 'bg-blue-100 text-blue-600' },
      { icon: FileText, label: 'My Applications', description: 'Track status', path: '/applications', color: 'bg-teal-100 text-teal-600' },
      { icon: User, label: 'Profile', description: 'Edit details', path: '/profile', color: 'bg-purple-100 text-purple-600' },
    ];

    const upcomingDeadlines = matchedScholarships
      .filter(s => {
        const daysLeft = Math.ceil((new Date(s.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysLeft > 0 && daysLeft <= 30;
      })
      .slice(0, 3);

    return (
      <div className="space-y-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-[2.5rem] p-6 bg-white dark:bg-zinc-950 border-zinc-200/50 dark:border-zinc-800/50 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500">
            <div className="flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
                <GraduationCap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-4xl font-black tracking-tighter mb-1">{matchedScholarships.length}</div>
              <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Matched Scholarships</div>
            </div>
          </Card>

          <Card className="rounded-[2.5rem] p-6 bg-white dark:bg-zinc-950 border-zinc-200/50 dark:border-zinc-800/50 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-500">
            <div className="flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-6">
                <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-4xl font-black tracking-tighter mb-1">{applicationCount}</div>
              <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active Applications</div>
            </div>
          </Card>

          <Card className="rounded-[2.5rem] p-6 bg-white dark:bg-zinc-950 border-zinc-200/50 dark:border-zinc-800/50 shadow-sm hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-500">
            <div className="flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-6">
                <Clock className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="text-4xl font-black tracking-tighter mb-1">{upcomingDeadlines.length}</div>
              <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Upcoming Deadlines</div>
            </div>
          </Card>

          <Card className="rounded-[2.5rem] p-6 bg-white dark:bg-zinc-950 border-zinc-200/50 dark:border-zinc-800/50 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500">
            <div className="flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-4xl font-black tracking-tighter mb-1">{profileCompletion}%</div>
              <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Profile Status</div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            {profileCompletion < 100 && (
              <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-orange-500 via-orange-600 to-emerald-600 p-10 text-white shadow-2xl shadow-orange-500/20 hover:scale-[1.01] transition-all duration-700 group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-10">
                  <div className="flex-1 w-full">
                    <h2 className="text-2xl md:text-3xl font-black mb-8 tracking-tighter text-white">Complete your profile for matches</h2>
                    <div className="relative w-full h-4 bg-black/20 rounded-full overflow-hidden mb-4 p-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${profileCompletion}%` }}
                        transition={{ duration: 2, ease: "circOut" }}
                        className="h-full bg-emerald-300 rounded-full shadow-[0_0_20px_rgba(110,231,183,0.5)]"
                      />
                    </div>
                    <div className="flex justify-between items-center px-2">
                      <span className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] text-white">Current Progress</span>
                      <span className="text-lg font-black tracking-tighter text-white">{profileCompletion}% Complete</span>
                    </div>
                  </div>
                  <Link to="/onboarding">
                    <Button size="lg" className="rounded-full bg-white hover:bg-zinc-100 text-emerald-600 font-black px-10 h-16 text-lg shadow-2xl shadow-black/20 transition-all active:scale-95 flex items-center gap-3">
                      Complete Now
                      <ArrowRight className="h-6 w-6" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            <JourneyTracker userId={userProfile.id || 'guest'} />
          </div>
          <div className="lg:col-span-4 self-stretch">
            <ExtensionTokenCard />
          </div>
        </div>

        <section>
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="font-display font-black text-3xl tracking-tighter">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {quickActions.map((action, idx) => (
              <Link key={action.path} to={action.path} className="block group">
                <Card className={`rounded-[2.5rem] p-6 h-full border border-zinc-200/50 dark:border-zinc-800/50 group-hover:shadow-2xl group-hover:shadow-primary/10 transition-all duration-500 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl relative overflow-hidden flex items-center justify-between`}>
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                      <action.icon className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="font-black text-lg tracking-tighter text-zinc-900 dark:text-zinc-100">{action.label}</div>
                      <div className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.15em] opacity-60">{action.description}</div>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="pt-8">
          <ApplicationAnalytics />
        </section>

        <section className="pt-8 px-2">
          <DashboardActivity />
        </section>

        <div className="space-y-10 pt-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-display font-black text-3xl tracking-tighter flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shadow-inner">
                <Sparkles className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              Top Matches For You
            </h2>
            <Link to="/scholarships">
              <Button variant="link" className="text-orange-500 font-black text-base hover:no-underline hover:text-orange-600 transition-colors">
                View All Matches
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {matchedScholarships.length > 0 ? (
              matchedScholarships.slice(0, 3).map((scholarship) => (
                <ScholarshipCard
                  key={scholarship.id}
                  scholarship={scholarship}
                  userProfile={userProfile}
                  isSaved={savedScholarships.includes(scholarship.id)}
                  onSave={() => setSavedScholarships(prev =>
                    prev.includes(scholarship.id) ? prev.filter(s => s !== scholarship.id) : [...prev, scholarship.id]
                  )}
                />
              ))
            ) : (
              <Card className="col-span-full py-28 text-center rounded-[3rem] border-2 border-dashed border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-950/30">
                <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <AlertTriangle className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
                </div>
                <h3 className="text-zinc-600 dark:text-zinc-400 font-black text-2xl mb-4 tracking-tighter">No perfect matches found yet.</h3>
                <p className="text-zinc-400 mb-8 max-w-md mx-auto font-medium">Try updating your profile details to see more relevant scholarships.</p>
                <Button onClick={() => navigate('/onboarding')} className="rounded-full px-10 h-14 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black border-none shadow-xl hover:scale-105 transition-all">
                  Update My Profile
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  };

  const AdminDashboardRedirect = () => (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold mb-4">Admin Access</h2>
      <Link to="/admin">
        <Button>Go to Admin Dashboard</Button>
      </Link>
    </div>
  );

  const MentorDashboardRedirect = () => (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold mb-4">Mentor Access</h2>
      <Link to="/mentor">
        <Button>Go to Mentor Dashboard</Button>
      </Link>
    </div>
  );

  const renderDashboard = () => {
    switch (role) {
      case 'admin': return <AdminDashboardRedirect />;
      case 'mentor': return <MentorDashboardRedirect />;
      default: return <StudentDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 font-sans selection:bg-primary/20">
      <Header />
      <main className="container mx-auto px-4 py-8 lg:py-12">
        {renderDashboard()}
      </main>
      <BottomNav />
    </div>
  );
};

export default DashboardPage;
