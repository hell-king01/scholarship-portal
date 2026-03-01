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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ScholarshipCard } from '@/components/ScholarshipCard';
import { UserProfile, calculateMatchScore } from '@/lib/scholarships-data';
import { useAuth } from '@/hooks/useAuth';
import { profileAPI, scholarshipAPI, applicationAPI } from '@/lib/api';
import { useSavedScholarships } from '@/hooks/useSavedScholarships';

const DashboardPage = () => {
  const { t } = useTranslation();
  const { role, authenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [matchedScholarships, setMatchedScholarships] = useState<any[]>([]);
  const { savedScholarships, toggleSave } = useSavedScholarships();
  const [applicationCount, setApplicationCount] = useState(0);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

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

  // Handle Redirects for Role-Based Dashboards
  useEffect(() => {
    if (!loading && authenticated) {
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'provider') {
        navigate('/provider');
      }
    }
  }, [loading, authenticated, role, navigate]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  if (role === 'admin' || role === 'provider') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    );
  }

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
          <Link to="/scholarships" className="block h-full">
            <Card className="group p-6 hover:shadow-elevated transition-all duration-300 border-border/50 hover:border-primary/50 relative overflow-hidden flex flex-col h-full bg-gradient-to-br from-card to-primary/5">
              <div className="relative z-10 flex-1">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold mb-1 tracking-tight">{matchedScholarships.length}</div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Matched</div>
              </div>
              <div className="mt-auto pointer-events-none">
                <Button variant="secondary" className="w-full justify-between pointer-events-none group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  View List <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </Link>

          <Link to="/applications" className="block h-full">
            <Card className="group p-6 hover:shadow-elevated transition-all duration-300 border-border/50 hover:border-accent/50 relative overflow-hidden flex flex-col h-full bg-gradient-to-br from-card to-accent/5">
              <div className="relative z-10 flex-1">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-accent/20 transition-all">
                  <FileText className="h-6 w-6 text-accent" />
                </div>
                <div className="text-3xl font-bold mb-1 tracking-tight">{applicationCount}</div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Applied</div>
              </div>
              <div className="mt-auto pointer-events-none">
                <Button variant="secondary" className="w-full justify-between pointer-events-none group-hover:bg-accent group-hover:text-accent-foreground transition-all">
                  Track Status <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </Link>

          {/* Extension Quick Connect Card */}
          <Card className="hidden md:block group p-6 bg-primary/5 border-dashed border-primary/30 hover:shadow-elevated transition-all duration-300 relative">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="text-xs font-mono mb-1 truncate text-primary/80" id="user-id-display">
                Secure Token Ready
              </div>
              <div className="text-sm font-bold uppercase tracking-wider">Smart Assistant</div>
              <div className="flex flex-col gap-2 mt-3">
                <div className="p-4 bg-gradient-to-br from-accent/10 to-transparent rounded-xl border border-accent/30 mb-2 transition-shadow hover:shadow-lg hover:shadow-accent/5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[12px] font-bold text-accent flex items-center gap-1.5">
                      <Zap className="h-4 w-4 fill-accent" /> Zero-Install Magic
                    </p>
                    <span className="text-[9px] bg-accent/20 text-accent px-2 py-0.5 rounded-full font-bold uppercase tracking-widest shadow-sm">Active</span>
                  </div>

                  <p className="text-[10px] text-muted-foreground leading-tight mb-4">
                    Instantly inject your profile into government scholarship forms without installing anything.
                  </p>

                  <div className="relative w-full">
                    <a
                      href={userProfile ? `javascript:(function(){
                        const data = JSON.parse(atob('${btoa(JSON.stringify({
                        fullName: userProfile.fullName || '',
                        aadhar: "XXXX-XXXX-XXXX",
                        income: userProfile.annualIncome || '',
                        state: userProfile.state || '',
                        category: userProfile.category || '',
                        education: userProfile.educationLevel || '',
                        dob: userProfile.dateOfBirth || '',
                        gender: userProfile.gender || '',
                        percentage: userProfile.percentage || '',
                        disability: userProfile.hasDisability ? 'Yes' : 'No',
                        course: userProfile.course || '',
                        institution: userProfile.institution || ''
                      }))}'));

                        var css='#sm-bridge-sidebar{position:fixed;top:0;right:0;width:320px;height:100vh;background:rgba(255,255,255,0.95);backdrop-filter:blur(12px);z-index:999999;box-shadow:-5px 0 25px rgba(0,0,0,0.15);font-family:Inter,system-ui,sans-serif;display:flex;flex-direction:column;animation:sm-slide-in .3s ease-out}@keyframes sm-slide-in{from{transform:translateX(100%)}to{transform:translateX(0)}}.sm-b-header{padding:16px 20px;background:linear-gradient(135deg,#f97316,#ea580c);color:white;display:flex;justify-content:space-between;align-items:center}.sm-b-content{padding:16px;flex:1;overflow:auto}.sm-b-field{margin-bottom:10px;padding:10px 12px;background:white;border:1px solid #e5e7eb;border-radius:10px;position:relative;transition:all .2s}.sm-b-field:hover{border-color:#f97316;box-shadow:0 2px 8px rgba(249,115,22,.1)}.sm-b-label{font-size:9px;color:#64748b;text-transform:uppercase;margin-bottom:4px;font-weight:700;letter-spacing:.5px}.sm-b-value{font-size:13px;font-weight:600;color:#0f172a;padding-right:50px}.sm-b-copy{position:absolute;right:8px;top:10px;cursor:pointer;border:none;background:#f1f5f9;color:#475569;padding:5px 10px;border-radius:6px;font-size:10px;font-weight:600}.sm-b-autofill{width:100%;padding:14px;background:linear-gradient(135deg,#f97316,#ea580c);color:white;border:none;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer;display:flex;justify-content:center;align-items:center;gap:8px;box-shadow:0 4px 15px rgba(249,115,22,.3);margin-bottom:12px}.sm-b-title{margin:0;font-size:15px;font-weight:700;display:flex;align-items:center;gap:6px}.sm-b-hint{background:linear-gradient(135deg,#0f172a,#1e293b);color:white;padding:12px;border-radius:12px;font-size:11px;margin-bottom:14px;line-height:1.5}.sm-b-guide{width:100%;padding:10px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;border-radius:10px;font-weight:600;font-size:12px;cursor:pointer;margin-bottom:14px;text-align:center}#sm-toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#0f172a;color:white;padding:12px 24px;border-radius:10px;font-weight:700;font-size:13px;z-index:10000000;box-shadow:0 10px 30px rgba(0,0,0,.3);pointer-events:none;animation:sm-ti .3s ease-out}@keyframes sm-ti{from{opacity:0;transform:translateX(-50%) translateY(-20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
                        if(document.getElementById('sm-bridge-sidebar')){document.getElementById('sm-bridge-sidebar').remove();var os=document.getElementById('sm-css');if(os)os.remove();return;}
                        var st=document.createElement('style');st.id='sm-css';st.textContent=css;document.head.appendChild(st);
                        function smSV(el,v){try{var p=Object.getPrototypeOf(el);var d=Object.getOwnPropertyDescriptor(p,'value');if(d&&d.set)d.set.call(el,v);else el.value=v;}catch(e){el.value=v;}el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));el.dispatchEvent(new Event('blur',{bubbles:true}));}
                        function smFS(el,v){if(!v)return false;var tg=String(v).toLowerCase().trim();var o=el.options;var b=null;for(var i=1;i<o.length;i++){var ot=o[i].text.toLowerCase().trim();var ov=o[i].value.toLowerCase().trim();if(ot===tg||ov===tg){b=i;break;}if(tg==='male'&&(ot==='male'||ot==='m')){b=i;break;}if(tg==='female'&&(ot==='female'||ot==='f')){b=i;break;}if(ot.indexOf(tg)>-1){b=i;break;}if(tg.indexOf(ot)>-1&&ot.length>2&&ot.indexOf('select')<0)b=i;}if(b!==null){el.selectedIndex=b;el.value=o[b].value;el.dispatchEvent(new Event('change',{bubbles:true}));el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('blur',{bubbles:true}));return true;}return false;}
                        function smToast(m){var o=document.getElementById('sm-toast');if(o)o.remove();var t=document.createElement('div');t.id='sm-toast';t.innerHTML=m;document.body.appendChild(t);setTimeout(function(){var x=document.getElementById('sm-toast');if(x)x.remove();},4000);}
                        function smHL(el,m){if(!el)return;el.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(function(){try{el.focus();}catch(e){}el.style.outline='3px solid #f97316';el.style.outlineOffset='2px';el.style.boxShadow='0 0 0 6px rgba(249,115,22,.3)';var o=document.getElementById('sm-tooltip');if(o)o.remove();var r=el.getBoundingClientRect();var t=document.createElement('div');t.id='sm-tooltip';t.innerHTML=m;t.style.cssText='position:fixed;top:'+Math.max(5,r.top-40)+'px;left:'+Math.max(5,r.left)+'px;background:#f97316;color:white;padding:8px 14px;border-radius:8px;font-weight:700;font-size:12px;z-index:9999999;box-shadow:0 4px 15px rgba(0,0,0,.25);pointer-events:none;max-width:280px';document.body.appendChild(t);setTimeout(function(){el.style.outline='';el.style.outlineOffset='';el.style.boxShadow='';var x=document.getElementById('sm-tooltip');if(x)x.remove();},5000);},400);}
                        function smLF(lb){var inp=null;if(lb.htmlFor){inp=document.getElementById(lb.htmlFor);if(inp)return inp;}inp=lb.querySelector('input,select,textarea');if(inp)return inp;var p=lb.parentElement;if(p){inp=p.querySelector('input:not([type=hidden]),select,textarea');if(inp&&inp!==lb)return inp;var ns=lb.nextElementSibling;while(ns){if(ns.matches&&ns.matches('input,select,textarea'))return ns;var inner=ns.querySelector('input:not([type=hidden]),select,textarea');if(inner)return inner;ns=ns.nextElementSibling;}}var gp=p?p.parentElement:null;if(gp){var a=gp.querySelectorAll('input:not([type=hidden]),select,textarea');if(a.length===1)return a[0];}return null;}
                        var rules=[{k:'fullName',v:data.fullName,m:function(t){return(t.indexOf('applicant')>-1||t.indexOf('student name')>-1||t.indexOf('candidate')>-1||t.indexOf('full name')>-1||(t.indexOf('name')>-1&&t.indexOf('institute')<0&&t.indexOf('college')<0&&t.indexOf('school')<0&&t.indexOf('scheme')<0&&t.indexOf('bank')<0&&t.indexOf('user')<0&&t.indexOf('parent')<0&&t.indexOf('father')<0&&t.indexOf('mother')<0&&t.indexOf('course')<0&&t.indexOf('roll')<0));}},{k:'aadhar',v:data.aadhar,m:function(t){return t.indexOf('aadhar')>-1||t.indexOf('aadhaar')>-1;}},{k:'gender',v:data.gender,m:function(t){return t.indexOf('gender')>-1;}},{k:'dob',v:data.dob,m:function(t){return t.indexOf('date of birth')>-1||t.indexOf('dob')>-1||t.indexOf('birth date')>-1||t.indexOf('d.o.b')>-1;}},{k:'income',v:String(data.income),m:function(t){return t.indexOf('income')>-1;}},{k:'state',v:data.state,m:function(t){return t.indexOf('state')>-1&&t.indexOf('marital')<0;}},{k:'category',v:data.category,m:function(t){return t.indexOf('community')>-1||t.indexOf('category')>-1||t.indexOf('caste')>-1;}},{k:'religion',v:data.category,m:function(t){return t.indexOf('religion')>-1;}},{k:'education',v:data.education,m:function(t){return(t.indexOf('education')>-1||t.indexOf('qualification')>-1)&&t.indexOf('loan')<0;}},{k:'percentage',v:String(data.percentage),m:function(t){return t.indexOf('percentage')>-1||t.indexOf('percent')>-1||(t.indexOf('marks')>-1&&t.indexOf('remark')<0);}},{k:'disability',v:data.disability,m:function(t){return t.indexOf('divyang')>-1||t.indexOf('disability')>-1||t.indexOf('handicap')>-1||t.indexOf('pwd')>-1;}},{k:'institution',v:data.institution,m:function(t){return t.indexOf('institute')>-1||t.indexOf('institution')>-1||t.indexOf('college')>-1||t.indexOf('school name')>-1||t.indexOf('university')>-1;}},{k:'course',v:data.course,m:function(t){return(t.indexOf('course')>-1||t.indexOf('degree')>-1||t.indexOf('programme')>-1)&&t.indexOf('source')<0;}},{k:'domicile',v:data.state,m:function(t){return t.indexOf('domicile')>-1;}}];
                        function smBFM(){var fm=[];var used={};var lbs=document.querySelectorAll('label,th,dt');for(var i=0;i<lbs.length;i++){var lb=lbs[i];if(lb.closest&&lb.closest('#sm-bridge-sidebar'))continue;var txt=(lb.textContent||'').trim();if(txt.length<2||txt.length>80)continue;var inp=smLF(lb);if(!inp||inp.type==='hidden')continue;if(inp.closest&&inp.closest('#sm-bridge-sidebar'))continue;var tl=txt.toLowerCase();for(var r=0;r<rules.length;r++){var rl=rules[r];if(used[rl.k])continue;if(!rl.v||String(rl.v).trim()==='')continue;if(rl.m(tl)){fm.push({r:rl,i:inp,l:txt});used[rl.k]=true;break;}}}var ai=document.querySelectorAll('input:not([type=hidden]),select,textarea');for(var i=0;i<ai.length;i++){var el=ai[i];if(el.closest&&el.closest('#sm-bridge-sidebar'))continue;var at=((el.name||'')+' '+(el.id||'')+' '+(el.placeholder||'')+' '+(el.getAttribute('formcontrolname')||'')+' '+(el.getAttribute('ng-model')||'')).toLowerCase();if(at.trim().length<2)continue;for(var r=0;r<rules.length;r++){var rl=rules[r];if(used[rl.k])continue;if(!rl.v||String(rl.v).trim()==='')continue;if(rl.m(at)){fm.push({r:rl,i:el,l:at});used[rl.k]=true;break;}}}return fm;}
                        window.smCopyAndHighlight=function(key,val,btn){navigator.clipboard.writeText(val);btn.innerText='Copied!';btn.style.background='#dcfce7';btn.style.color='#166534';setTimeout(function(){btn.innerText='Copy';btn.style.background='';btn.style.color='';},2000);var fm=smBFM();var tgt=null;key=key.toLowerCase();for(var i=0;i<fm.length;i++){if(fm[i].r.k.toLowerCase().indexOf(key)>-1||key.indexOf(fm[i].r.k.toLowerCase())>-1){tgt=fm[i].i;break;}}if(tgt){smHL(tgt,'Paste here! (Ctrl+V)');}else{smToast('Copied! Find the matching field and press Ctrl+V');}};
                        var sb=document.createElement('div');sb.id='sm-bridge-sidebar';var fh='';var en=Object.entries(data);for(var fi=0;fi<en.length;fi++){var ek=en[fi][0];var ev=en[fi][1];fh+='<div class="sm-b-field"><div class="sm-b-label">'+ek.replace(/([A-Z])/g,' $1').trim()+'</div><div class="sm-b-value">'+ev+'</div><button class="sm-b-copy" data-k="'+ek+'" data-v="'+ev+'">Copy</button></div>';}
                        sb.innerHTML='<div class="sm-b-header"><h3 class="sm-b-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> ScholarMatch</h3><button id="sm-close-btn" style="background:none;border:none;color:white;cursor:pointer;font-size:22px">&times;</button></div><div class="sm-b-content"><div class="sm-b-hint"><b>Step 1:</b> Click <b>Magic Auto-Fill</b> to fill all matching fields.<br><b>Step 2:</b> Click <b>Guided Fill</b> for step-by-step help.<br><b>Step 3:</b> Click <b>Copy</b> on any field for manual paste.</div><button class="sm-b-autofill" id="sm-b-autofill-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg> Magic Auto-Fill</button><button class="sm-b-guide" id="sm-b-guide-btn">Start Guided Fill (Step-by-Step)</button><div style="font-size:10px;color:#64748b;margin-bottom:10px;font-weight:700;letter-spacing:.5px">YOUR PROFILE DATA:</div>'+fh+'</div>';
                        document.body.appendChild(sb);
                        document.getElementById('sm-close-btn').onclick=function(){document.getElementById('sm-bridge-sidebar').remove();};
                        var cbs=sb.querySelectorAll('.sm-b-copy');for(var ci=0;ci<cbs.length;ci++){cbs[ci].onclick=function(){window.smCopyAndHighlight(this.getAttribute('data-k'),this.getAttribute('data-v'),this);};}
                        document.getElementById('sm-b-autofill-btn').onclick=function(){var fm=smBFM();var f=0;var s=0;for(var i=0;i<fm.length;i++){var el=fm[i].i;var v=fm[i].r.v;if(!v||String(v).trim()==='')continue;if(el.tagName==='SELECT'){if(smFS(el,v)){el.style.outline='3px solid #22c55e';el.style.backgroundColor='#f0fdf4';f++;}else{s++;}}else if(el.type==='radio'){var rn=document.querySelectorAll('input[type=radio][name="'+el.name+'"]');for(var ri=0;ri<rn.length;ri++){if(rn[ri].value.toLowerCase()===String(v).toLowerCase()){rn[ri].checked=true;rn[ri].dispatchEvent(new Event('change',{bubbles:true}));f++;break;}}}else if(el.type==='date'){smSV(el,v);el.style.outline='3px solid #22c55e';el.style.backgroundColor='#f0fdf4';f++;}else{if(!el.value||el.value.trim()===''){smSV(el,String(v));el.style.outline='3px solid #22c55e';el.style.backgroundColor='#f0fdf4';f++;}}}smToast('Auto-filled '+f+' fields!'+(s>0?' '+s+' need manual selection.':''));};
                        document.getElementById('sm-b-guide-btn').onclick=function(){var fm=smBFM();var steps=[];for(var i=0;i<fm.length;i++){var el=fm[i].i;var v=fm[i].r.v;if(!v||String(v).trim()==='')continue;var cv=el.tagName==='SELECT'?((el.options[el.selectedIndex]||{}).text||''):el.value;if(cv&&cv.trim()!==''&&cv.toLowerCase().indexOf('select')<0)continue;steps.push({el:el,k:fm[i].r.k,v:String(v)});}if(steps.length===0){smToast('All detectable fields are already filled!');return;}var idx=0;function go(){if(idx>=steps.length){smToast('Guided fill complete! Review all fields.');return;}var s=steps[idx];navigator.clipboard.writeText(s.v);smHL(s.el,'Step '+(idx+1)+'/'+steps.length+': '+s.k+' = '+s.v);smToast('Step '+(idx+1)+'/'+steps.length+': Copied '+s.k+'! Paste in highlighted field.');idx++;setTimeout(function(){var o=document.getElementById('sm-tooltip');if(o)o.remove();go();},6000);}go();};
                      })()` : '#'}

                      onClick={(e) => {
                        if (!userProfile) {
                          e.preventDefault();
                          return;
                        }
                        e.preventDefault();
                        setShowWizard(true);
                      }}
                      onDragStart={(e) => {
                        if (!userProfile) e.preventDefault();
                        setShowWizard(false); // Hide the tutorial while dragging
                      }}
                      className="inline-flex items-center justify-center gap-2 w-full h-10 bg-accent text-accent-foreground rounded-lg text-sm font-bold shadow-md hover:scale-[1.02] transition-transform cursor-grab active:cursor-grabbing"
                    >
                      <Sparkles className="h-4 w-4 fill-accent-foreground" /> Install Apply Widget
                    </a>

                    {showWizard && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10, x: "-50%" }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, scale: 0.95, y: 10, x: "-50%" }}
                        className="absolute bottom-[calc(100%+16px)] left-1/2 w-80 md:w-[420px] bg-card border border-border p-4 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] z-[100] cursor-default pointer-events-auto text-left"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[14px] border-r-[14px] border-t-[18px] border-l-transparent border-r-transparent border-t-card drop-shadow-sm"></div>

                        <div className="flex justify-between items-center mb-3 px-1">
                          <h3 className="font-extrabold text-base flex items-center gap-2 text-foreground tracking-tight">
                            <div className="bg-accent/20 p-1.5 rounded-lg">
                              <MoveUp className="h-5 w-5 text-accent animate-bounce" />
                            </div>
                            Drag to Bookmarks Bar
                          </h3>
                          <button onClick={(e) => { e.preventDefault(); setShowWizard(false); }} className="text-muted-foreground hover:bg-muted p-1.5 rounded-full transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                          </button>
                        </div>

                        <div className="mb-4 rounded-2xl overflow-hidden border border-border/60 bg-muted/30 shadow-inner">
                          <img src="/widget-drop-guide.jpeg" alt="Guide to drag widget" className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-500" onError={(e) => e.currentTarget.style.display = 'none'} />
                        </div>

                        <div className="bg-accent/5 p-3 rounded-2xl border border-accent/20">
                          <p className="text-[11px] text-foreground font-bold flex items-center gap-2 mb-2">
                            <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                            If your bookmarks bar is hidden:
                          </p>
                          <div className="flex gap-2 text-[11px] justify-center items-center">
                            <kbd className="px-2 py-1 border border-border rounded-lg font-mono font-bold shadow-sm text-foreground bg-white dark:bg-black">Ctrl + Shift + B</kbd>
                            <span className="text-muted-foreground font-medium italic">or</span>
                            <kbd className="px-2 py-1 border border-border rounded-lg font-mono font-bold shadow-sm text-foreground bg-white dark:bg-black">Cmd + Shift + B</kbd>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-[10px] px-2 flex-1"
                    onClick={() => {
                      if (userProfile) {
                        const syncData = {
                          id: userProfile.id,
                          fullName: userProfile.fullName || '',
                          income: userProfile.annualIncome || '',
                          category: userProfile.category || '',
                          state: userProfile.state || '',
                          education: userProfile.educationLevel || '',
                          aadhar: "XXXX-XXXX-XXXX",
                          dob: userProfile.dateOfBirth || '',
                          gender: userProfile.gender || '',
                          percentage: userProfile.percentage || '',
                          disability: userProfile.hasDisability ? 'Yes' : 'No',
                          course: userProfile.course || '',
                          institution: userProfile.institution || ''
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
                    onSave={() => toggleSave(scholarship.id)}
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
