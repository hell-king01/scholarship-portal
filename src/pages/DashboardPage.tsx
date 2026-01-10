import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap, FileText, Clock, TrendingUp, ChevronRight,
  Calendar, Bell, Star, Target, Sparkles, ArrowRight, Upload,
  Calculator, Search, User, Shield, Users, BarChart3, Settings,
  CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ScholarshipCard } from '@/components/ScholarshipCard';
import { scholarships, UserProfile, calculateMatchScore } from '@/lib/scholarships-data';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { profileAPI } from '@/lib/api';

// Mock user profile - in production, fetch from API
const mockUserProfile: UserProfile = {
  fullName: 'Priya Sharma',
  dateOfBirth: '2002-05-15',
  gender: 'Female',
  category: 'OBC',
  state: 'Bihar',
  district: 'Patna',
  hasDisability: false,
  educationLevel: 'graduation',
  institution: 'Patna University',
  course: 'B.Sc. Chemistry',
  yearOfStudy: 2,
  percentage: 78,
  annualIncome: 180000,
  incomeCategory: 'EWS',
  documents: {
    aadhar: { uploaded: true, verified: true },
    income: { uploaded: true, verified: true },
    marksheet: { uploaded: true, verified: true },
  },
  profileComplete: true,
};

const DashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role, authenticated } = useAuth();
  const [savedScholarships, setSavedScholarships] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Fetch user profile if authenticated
    if (authenticated) {
      profileAPI.getProfile()
        .then((data) => {
          // Map API response to UserProfile type
          setUserProfile(data as UserProfile);
        })
        .catch(() => {
          // Use mock profile if API fails
          setUserProfile(mockUserProfile);
        });
    } else {
      setUserProfile(mockUserProfile);
    }
  }, [authenticated]);

  const profile = userProfile || mockUserProfile;

  // Calculate matched scholarships (only for students)
  const matchedScholarships = role === 'student' ? scholarships
    .map(s => ({ ...s, matchScore: calculateMatchScore(profile, s) }))
    .filter(s => s.matchScore >= 50)
    .sort((a, b) => b.matchScore - a.matchScore) : [];

  const topMatches = matchedScholarships.slice(0, 3);
  const profileCompletion = 85;

  // STUDENT Dashboard
  const StudentDashboard = () => {
    const quickActions = [
      { icon: Upload, label: 'Upload Documents', path: '/onboarding', color: 'bg-primary/10 text-primary', description: 'OCR Fill' },
      { icon: Calculator, label: 'Check Eligibility', path: '/eligibility', color: 'bg-accent/10 text-accent', description: 'Predict matches' },
      { icon: Search, label: 'Browse Scholarships', path: '/scholarships', color: 'bg-blue-100 text-blue-600', description: 'View all' },
      { icon: FileText, label: 'My Applications', path: '/applications', color: 'bg-green-100 text-green-600', description: 'Track status' },
      { icon: User, label: 'Profile', path: '/profile', color: 'bg-purple-100 text-purple-600', description: 'Edit details' },
    ];

    const upcomingDeadlines = matchedScholarships
      .filter(s => {
        const daysLeft = Math.ceil((new Date(s.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysLeft > 0 && daysLeft <= 30;
      })
      .slice(0, 3);

    return (
      <>
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
            {t('dashboard.welcome')}, {profile.fullName.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground">
            You have {matchedScholarships.length} scholarships waiting for you
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-accent" />
              </div>
            </div>
            <div className="text-2xl font-bold">{matchedScholarships.length}</div>
            <div className="text-sm text-muted-foreground">{t('dashboard.matchedScholarships')}</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold">2</div>
            <div className="text-sm text-muted-foreground">{t('dashboard.activeApplications')}</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center">
                <Clock className="h-5 w-5 text-destructive" />
              </div>
            </div>
            <div className="text-2xl font-bold">{upcomingDeadlines.length}</div>
            <div className="text-sm text-muted-foreground">{t('dashboard.upcomingDeadlines')}</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-secondary-foreground" />
              </div>
            </div>
            <div className="text-2xl font-bold">{profileCompletion}%</div>
            <div className="text-sm text-muted-foreground">{t('dashboard.profileStatus')}</div>
          </Card>
        </motion.div>

        {/* Profile Completion Banner */}
        {profileCompletion < 100 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-primary to-accent rounded-2xl p-5 mb-8 text-primary-foreground"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <h3 className="font-semibold mb-2">Complete your profile for better matches</h3>
                <div className="flex items-center gap-3">
                  <Progress value={profileCompletion} className="flex-1 h-2 bg-white/20" />
                  <span className="text-sm font-medium">{profileCompletion}%</span>
                </div>
              </div>
              <Link to="/profile">
                <Button variant="secondary" size="sm" className="gap-2">
                  Complete Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="font-display font-semibold text-lg mb-4">{t('dashboard.quickActions')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link key={action.path} to={action.path}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:shadow-card transition-all"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium block">{action.label}</span>
                    <span className="text-xs text-muted-foreground">{action.description}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Top Matches */}
        {topMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Top Matches for You
              </h2>
              <Link to="/scholarships" className="text-sm text-primary font-medium hover:underline">
                {t('common.viewAll')}
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topMatches.map((scholarship) => (
                <ScholarshipCard
                  key={scholarship.id}
                  scholarship={scholarship}
                  userProfile={profile}
                  isSaved={savedScholarships.includes(scholarship.id)}
                  onSave={() => setSavedScholarships(prev =>
                    prev.includes(scholarship.id) ? prev.filter(s => s !== scholarship.id) : [...prev, scholarship.id]
                  )}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Upcoming Deadlines */}
        {upcomingDeadlines.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-destructive" />
              {t('dashboard.upcomingDeadlines')}
            </h2>
            <Card className="divide-y divide-border">
              {upcomingDeadlines.map((scholarship) => {
                const daysLeft = Math.ceil((new Date(scholarship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <Link
                    key={scholarship.id}
                    to={`/scholarships`}
                    className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{scholarship.title}</p>
                      <p className="text-sm text-muted-foreground">{scholarship.provider}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${daysLeft <= 7 ? 'text-destructive' : 'text-foreground'}`}>
                        {daysLeft} days left
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(scholarship.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </Card>
          </motion.div>
        )}
      </>
    );
  };

  // MENTOR Dashboard
  const MentorDashboard = () => {
    const mentorActions = [
      { icon: Users, label: 'Mentor Dashboard', path: '/mentor', color: 'bg-primary/10 text-primary', description: 'View assigned students' },
      { icon: CheckCircle2, label: 'Pending Reviews', path: '/mentor?tab=pending', color: 'bg-yellow-100 text-yellow-600', description: 'Review applications' },
      { icon: FileText, label: 'Approved/Rejected', path: '/mentor?tab=reviewed', color: 'bg-green-100 text-green-600', description: 'View history' },
      { icon: GraduationCap, label: 'View Students', path: '/mentor?tab=students', color: 'bg-blue-100 text-blue-600', description: 'All students' },
    ];

    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
            Mentor Dashboard
          </h1>
          <p className="text-muted-foreground">
            Review and manage student applications
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="text-2xl font-bold mb-1">12</div>
            <div className="text-sm text-muted-foreground">Assigned Students</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold mb-1">5</div>
            <div className="text-sm text-muted-foreground">Pending Reviews</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold mb-1">8</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold mb-1">2</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mentorActions.map((action) => (
            <Link key={action.path} to={action.path}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:shadow-card transition-all"
              >
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <span className="font-medium block">{action.label}</span>
                  <span className="text-xs text-muted-foreground">{action.description}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </motion.div>
            </Link>
          ))}
        </div>
      </>
    );
  };

  // ADMIN Dashboard
  const AdminDashboard = () => {
    const adminActions = [
      { icon: Shield, label: 'Admin Dashboard', path: '/admin', color: 'bg-primary/10 text-primary', description: 'Full analytics' },
      { icon: BarChart3, label: 'Analytics', path: '/admin?tab=analytics', color: 'bg-blue-100 text-blue-600', description: 'View metrics' },
      { icon: Users, label: 'Manage Users', path: '/admin?tab=users', color: 'bg-green-100 text-green-600', description: 'User management' },
      { icon: GraduationCap, label: 'Manage Scholarships', path: '/admin?tab=scholarships', color: 'bg-purple-100 text-purple-600', description: 'Edit scholarships' },
    ];

    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage the scholarship portal
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="text-2xl font-bold mb-1">1,234</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold mb-1">856</div>
            <div className="text-sm text-muted-foreground">Eligible Users</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold mb-1">378</div>
            <div className="text-sm text-muted-foreground">Ineligible Users</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold mb-1">24</div>
            <div className="text-sm text-muted-foreground">Total Scholarships</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adminActions.map((action) => (
            <Link key={action.path} to={action.path}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:shadow-card transition-all"
              >
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <span className="font-medium block">{action.label}</span>
                  <span className="text-xs text-muted-foreground">{action.description}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </motion.div>
            </Link>
          ))}
        </div>
      </>
    );
  };

  // Render based on role
  const renderDashboard = () => {
    switch (role) {
      case 'admin':
        return <AdminDashboard />;
      case 'mentor':
        return <MentorDashboard />;
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 py-6">
        {renderDashboard()}
      </main>
      <BottomNav />
    </div>
  );
};

export default DashboardPage;
