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
        // Optionally redirect to login, but let's just let it load empty state
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const profile = await profileAPI.getProfile();
        setUserProfile(profile);
        const originalProfile = profile; // Keep the original for ID access

        if (profile) {
          // Map snake_case to CamelCase for local logic
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
            documents: {},
            profileComplete: true
          };

          setUserProfile({ ...mappedProfile, id: originalProfile.id });

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

          // New engine returns 0 for hard-rejected scholarships
          const matched = scored
            .filter((s: any) => s.matchScore > 0) // Only show eligible scholarships
            .sort((a: any, b: any) => b.matchScore - a.matchScore);

          setMatchedScholarships(matched);

          // 5. Fetch applications count
          const apps = await applicationAPI.getAll();
          setApplicationCount(apps.length);
        } else {
          // Handle no profile
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authenticated, authLoading, role]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  // Handle Redirects for Role-Based Dashboards
  if (role === 'admin') {
    // In a real app, we might redirect. For now, render the Admin View inline or link to it.
    // Since the user has a specific /admin route, let's redirect them there for a better experience.
    // But we can also keep the "Landing Dashboard" concept.
    // Let's redirect to be cleaner.
    // navigate('/admin'); // Warning: side-effect in render. Better to do in useEffect.
  }

  // Redirect Logic for Admin/Mentor to their specific pages if needed
  // For now, we will render specific views or the Student View

  const StudentDashboard = () => {
    // If no profile, force onboarding/setup
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
      { icon: Calculator, label: 'Check Eligibility', path: '/eligibility', color: 'bg-accent/10 text-accent', description: 'Find your perfect matches' },
      { icon: Search, label: 'Browse All', path: '/scholarships', color: 'bg-blue-100 text-blue-600', description: 'Explore all opportunities' },
      { icon: FileText, label: 'My Applications', path: '/applications', color: 'bg-green-100 text-green-600', description: 'Check your progress' },
      { icon: User, label: 'My Profile', path: '/onboarding', color: 'bg-purple-100 text-purple-600', description: 'Update details' },
    ];

    const upcomingDeadlines = matchedScholarships
      .filter(s => {
        const daysLeft = Math.ceil((new Date(s.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysLeft > 0 && daysLeft <= 30;
      })
      .slice(0, 3);

    return (
      <div className="space-y-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent border border-border/50"
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-3 tracking-tight">
                Welcome back, <span className="gradient-text">{userProfile.fullName.split(' ')[0]}</span>! 👋
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl">
                We've found <span className="text-foreground font-semibold font-display">{matchedScholarships.length} scholarships</span> that match your profile.
              </p>
            </div>
            {profileCompletion < 100 && (
              <div className="flex flex-col items-center gap-2 bg-card/50 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
                      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray={`${profileCompletion * 1.76} 176`} className="text-primary" strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{profileCompletion}%</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Profile Status</p>
                    <Link to="/onboarding" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                      Complete Now <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group p-6 hover:shadow-elevated transition-all duration-300 border-border/50 hover:border-primary/50 relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-1 tracking-tight">{matchedScholarships.length}</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Matched</div>
            </div>
          </Card>

          <Card className="group p-6 hover:shadow-elevated transition-all duration-300 border-border/50 hover:border-accent/50 relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <div className="text-3xl font-bold mb-1 tracking-tight">{applicationCount}</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Applied</div>
            </div>
          </Card>

          {/* Extension Quick Connect Card */}
          <Card className="group p-6 bg-primary/5 border-dashed border-primary/30 hover:shadow-elevated transition-all duration-300 relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="text-xs font-mono mb-1 truncate text-primary/80" id="user-id-display">
                Secure Token Ready
              </div>
              <div className="text-sm font-bold uppercase tracking-wider">Extension Token</div>
              <div className="flex flex-col gap-2 mt-3">
                <div className="p-4 bg-gradient-to-br from-accent/10 to-transparent rounded-xl border border-accent/30 mb-2 transition-shadow hover:shadow-lg hover:shadow-accent/5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[12px] font-bold text-accent flex items-center gap-1.5">
                      <Zap className="h-4 w-4 fill-accent" /> Zero-Install Magic
                    </p>
                    <span className="text-[9px] bg-accent/20 text-accent px-2 py-0.5 rounded-full font-bold uppercase tracking-widest shadow-sm">Hot</span>
                  </div>

                  <div className="flex gap-2 text-[10px] text-muted-foreground mb-4 font-medium">
                    <div className="flex bg-background/80 backdrop-blur-sm p-2 rounded-lg border border-border/50 border-b-2 flex-1 flex-col items-center text-center gap-1.5 shadow-sm">
                      <MoveUp className="h-4 w-4 text-primary" />
                      <span>1. Drag Up</span>
                    </div>
                    <div className="flex bg-background/80 backdrop-blur-sm p-2 rounded-lg border border-border/50 border-b-2 flex-1 flex-col items-center text-center gap-1.5 shadow-sm">
                      <Globe className="h-4 w-4 text-primary" />
                      <span>2. Visit .gov</span>
                    </div>
                    <div className="flex bg-primary/10 backdrop-blur-sm p-2 rounded-lg border border-primary/30 border-b-2 border-b-primary flex-[1.2] flex-col items-center text-center gap-1.5 shadow-sm">
                      <MousePointerClick className="h-4 w-4 text-primary fill-primary/20" />
                      <span className="text-primary font-bold">3. Click Bar</span>
                    </div>
                  </div>
                  <a
                    href={userProfile ? `javascript:(function(){
                      const data = JSON.parse(atob('${btoa(JSON.stringify({
                      fullName: userProfile.fullName,
                      aadhar: "XXXX-XXXX-XXXX",
                      income: userProfile.annualIncome,
                      state: userProfile.state,
                      category: userProfile.category,
                      education: userProfile.educationLevel
                    }))}'));
                      
                      const css = \`
                        #sm-bridge-sidebar { position: fixed; top: 0; right: 0; width: 320px; height: 100vh; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); z-index: 999999; box-shadow: -5px 0 25px rgba(0,0,0,0.1); font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; border-left: 1px solid rgba(255, 255, 255, 0.3); }
                        .sm-b-header { padding: 16px 20px; background: linear-gradient(135deg, #f97316, #ea580c); color: white; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(249, 115, 22, 0.2); }
                        .sm-b-content { padding: 20px; flex: 1; overflow: auto; }
                        .sm-b-field { margin-bottom: 12px; padding: 12px; background: rgba(255, 255, 255, 0.9); border: 1px solid rgba(241, 241, 241, 0.8); border-radius: 10px; position: relative; transition: all 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
                        .sm-b-field:hover { border-color: #f97316; box-shadow: 0 4px 10px rgba(249, 115, 22, 0.1); }
                        .sm-b-label { font-size: 10px; color: #64748b; text-transform: uppercase; margin-bottom: 6px; font-weight: 600; letter-spacing: 0.5px;}
                        .sm-b-value { font-size: 13px; font-weight: 600; color: #0f172a; }
                        .sm-b-copy { position: absolute; right: 10px; top: 12px; cursor: pointer; border: none; background: #f1f5f9; color: #475569; padding: 6px 10px; border-radius: 6px; font-size: 10px; font-weight: 600; transition: all 0.2s; }
                        .sm-b-copy:hover { background: #e2e8f0; color: #0f172a; }
                        .sm-b-autofill { width: 100%; padding: 12px; background: #f97316; color: white; border: none; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; display: flex; justify-content: center; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.25); margin-bottom: 20px; }
                        .sm-b-autofill:hover { background: #ea580c; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(249, 115, 22, 0.3); }
                        .sm-b-title { margin:0; font-size:15px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
                      \`;
                      
                      if(document.getElementById('sm-bridge-sidebar')) { document.getElementById('sm-bridge-sidebar').remove(); return; }
                      
                      const style = document.createElement('style'); style.innerHTML = css; document.head.appendChild(style);
                      
                      const sidebar = document.createElement('div'); sidebar.id = 'sm-bridge-sidebar';
                      sidebar.innerHTML = \`
                        <div class="sm-b-header">
                          <h3 class="sm-b-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> ScholarMatch</h3>
                          <button onclick="this.parentElement.parentElement.remove()" style="background:none;border:none;color:white;cursor:pointer;font-size:20px;opacity:0.8;">&times;</button>
                        </div>
                        <div class="sm-b-content">
                          <button class="sm-b-autofill" id="sm-b-autofill-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                            Magic Auto-Fill
                          </button>
                          <div style="font-size: 11px; color: #64748b; margin-bottom: 12px; font-weight: 700; letter-spacing: 0.5px;">OR COPY MANUALLY:</div>
                          \${Object.entries(data).map(([k,v]) => \`
                            <div class="sm-b-field">
                              <div class="sm-b-label">\${k.replace(/([A-Z])/g, ' $1').trim()}</div>
                              <div class="sm-b-value">\${v}</div>
                              <button class="sm-b-copy" onclick="navigator.clipboard.writeText('\${v}');this.innerText='Copied!';this.style.background='#dcfce7';this.style.color='#166534';setTimeout(()=> {this.innerText='Copy';this.style.background='';this.style.color='';}, 2000)">Copy</button>
                            </div>
                          \`).join('')}
                        </div>
                      \`;
                      document.body.appendChild(sidebar);
                      
                      document.getElementById('sm-b-autofill-btn').onclick = function() {
                        let filled = 0;
                        const inputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
                        inputs.forEach(el => {
                          const name = (el.name || el.id || el.getAttribute('placeholder') || '').toLowerCase();
                          let matchedVal = null;
                          if (name.includes('name') || name.includes('first')) matchedVal = data.fullName;
                          else if (name.includes('aadhar') || name.includes('uid')) matchedVal = data.aadhar;
                          else if (name.includes('income')) matchedVal = data.income;
                          else if (name.includes('state')) matchedVal = data.state;
                          else if (name.includes('category') || name.includes('caste')) matchedVal = data.category;
                          
                          if (matchedVal && !el.value) {
                            el.value = matchedVal;
                            el.dispatchEvent(new Event('input', { bubbles: true }));
                            el.dispatchEvent(new Event('change', { bubbles: true }));
                            el.style.border = '2px solid #f97316';
                            el.style.backgroundColor = '#fff7ed';
                            filled++;
                          }
                        });
                        alert('✨ Magic Auto-fill completed! ' + filled + ' fields populated. Please review before submitting.');
                      };
                    })()` : '#'}
                    onDragStart={(e) => {
                      if (!userProfile) e.preventDefault();
                    }}
                    onClick={(e) => {
                      if (!userProfile) {
                        e.preventDefault();
                        alert('Please wait for your profile to load...');
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 w-full py-2 bg-accent text-accent-foreground rounded-lg text-xs font-bold shadow-md hover:scale-[1.02] transition-transform cursor-move"
                  >
                    <LinkIcon className="h-3.5 w-3.5" /> ScholarMatch Bridge (Drag Me)
                  </a>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-[11px] px-3 flex-1 flex items-center justify-center gap-1.5 border-primary text-primary hover:bg-primary/5"
                    onClick={() => {
                      alert('Manual load requested. Check extension directory.');
                    }}
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Dev Mode Load
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-[10px] px-2 flex-1"
                    onClick={() => {
                      if (userProfile) {
                        const syncData = {
                          id: userProfile.id,
                          fullName: userProfile.fullName,
                          income: userProfile.annualIncome,
                          category: userProfile.category,
                          state: userProfile.state,
                          education: userProfile.educationLevel,
                          aadhar: "XXXX-XXXX-XXXX"
                        };
                        const token = btoa(JSON.stringify(syncData));
                        navigator.clipboard.writeText(token);
                        alert('✨ Sync Token Copied!');
                      }
                    }}
                  >
                    Copy Token
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <section>
          <div className="flex items-center justify-between mb-6 text-center lg:text-left">
            <h2 className="font-display font-bold text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, idx) => (
              <Link key={action.path} to={action.path}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                  className="group relative flex items-center gap-5 p-6 bg-card rounded-3xl border border-border/60 hover:border-primary/40 transition-all shadow-soft overflow-hidden"
                >
                  <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                    <action.icon className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-lg block mb-0.5">{action.label}</span>
                    <span className="text-sm text-muted-foreground line-clamp-1">{action.description}</span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-xl flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                Top Matches For You
              </h2>
              <Link to="/scholarships">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                  View All Matches
                </Button>
              </Link>
            </div>
            {matchedScholarships.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matchedScholarships.slice(0, 4).map((scholarship) => (
                  <ScholarshipCard
                    key={scholarship.id}
                    scholarship={scholarship}
                    userProfile={userProfile}
                    // Implement save logic with local state or API
                    isSaved={savedScholarships.includes(scholarship.id)}
                    onSave={() => setSavedScholarships(prev =>
                      prev.includes(scholarship.id) ? prev.filter(s => s !== scholarship.id) : [...prev, scholarship.id]
                    )}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center bg-muted/30 border-dashed">
                <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">No perfect matches found yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Try updating your profile details to see more relevant scholarships.</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/onboarding')}>Update Profile</Button>
              </Card>
            )}
          </div>

          <Card className="glass-card p-6 flex flex-col h-full border-border/40">
            <h2 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-destructive" />
              Deadlines Approaching
            </h2>
            <div className="space-y-6 flex-1">
              {upcomingDeadlines.length > 0 ? upcomingDeadlines.map((scholarship) => {
                const daysLeft = Math.ceil((new Date(scholarship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <Link
                    key={scholarship.id}
                    to={`/scholarship/${scholarship.id}`}
                    className="group relative pl-4 border-l-2 border-border hover:border-primary transition-colors block"
                  >
                    <div className="mb-1">
                      <p className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">{scholarship.title}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${daysLeft <= 7 ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                        {daysLeft} days left
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        {new Date(scholarship.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </Link>
                );
              }) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No urgent deadlines.</p>
                </div>
              )}
            </div>
          </Card>
          <Card className="glass-card p-6 flex flex-col h-full border-border/40 mt-8">
            <h2 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Success Tips
            </h2>
            <div className="space-y-4">
              {[
                { title: 'Keep Documents Ready', desc: 'Scan your income & caste certificates in advance.' },
                { title: 'Check Deadlines', desc: 'Apply at least 3 days before the closing date.' },
                { title: 'Verify Details', desc: 'Double check bank account details for DBT.' }
              ].map((tip, i) => (
                <div key={i} className="p-3 bg-muted/40 rounded-xl border border-border/50">
                  <p className="text-sm font-bold block mb-1">{tip.title}</p>
                  <p className="text-xs text-muted-foreground">{tip.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const AdminDashboardRedirect = () => {
    // Small component to redirect/link
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Admin Access</h2>
        <Link to="/admin">
          <Button>Go to Admin Dashboard</Button>
        </Link>
      </div>
    )
  };

  const MentorDashboardRedirect = () => {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Mentor Access</h2>
        <Link to="/mentor">
          <Button>Go to Mentor Dashboard</Button>
        </Link>
      </div>
    )
  };

  const renderDashboard = () => {
    switch (role) {
      case 'admin':
        return <AdminDashboardRedirect />;
      case 'mentor':
        return <MentorDashboardRedirect />;
      default:
        return <StudentDashboard />;
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
