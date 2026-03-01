import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Calendar, Building2, IndianRupee, CheckCircle2,
    ExternalLink, Loader2, Share2, Info, AlertCircle, Copy, Navigation, Bookmark, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { scholarshipAPI, applicationAPI, profileAPI } from '@/lib/api';
import { Scholarship, UserProfile, calculateMatchScore, getMatchReasons } from '@/lib/scholarships-data';
import { Target } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSavedScholarships } from '@/hooks/useSavedScholarships';

const ScholarshipDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const { authenticated, loading: authLoading } = useAuth();

    const [scholarship, setScholarship] = useState<Scholarship | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [showAssistant, setShowAssistant] = useState(false);
    const [showWizard, setShowWizard] = useState(false);
    const { savedScholarships, toggleSave } = useSavedScholarships();

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const [scholarshipData, profileData, applications] = await Promise.all([
                    scholarshipAPI.getById(id),
                    authenticated ? profileAPI.getProfile() : null,
                    authenticated ? applicationAPI.getAll() : []
                ]);

                setScholarship(scholarshipData);

                if (profileData) {
                    const mappedProfile: any = {
                        fullName: profileData.full_name,
                        dateOfBirth: profileData.date_of_birth,
                        gender: profileData.gender,
                        category: profileData.category,
                        state: profileData.state,
                        district: profileData.district,
                        hasDisability: profileData.has_disability,
                        educationLevel: profileData.education_level,
                        institution: profileData.institution,
                        course: profileData.course,
                        yearOfStudy: profileData.year_of_study,
                        percentage: profileData.percentage,
                        annualIncome: profileData.annual_income,
                        incomeCategory: profileData.income_category,
                        documents: {},
                        profileComplete: true
                    };
                    setProfile(mappedProfile);
                } else {
                    setProfile(null);
                }

                if (applications.some((app: any) => app.scholarship_id === id)) {
                    setHasApplied(true);
                }
            } catch (error) {
                console.error('Error fetching details:', error);
                toast({ title: "Error", description: "Failed to load scholarship details", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchData();
        }
    }, [id, authenticated, authLoading]);



    const handleApply = async () => {
        if (!authenticated) {
            toast({ title: "Sign in required", description: "Please sign in to apply for scholarships" });
            navigate('/auth');
            return;
        }

        if (!scholarship) return;

        // Proceed directly since we now have the widget in the sidebar
        handleProceedToPortal();
    };

    const handleProceedToPortal = async () => {
        if (!scholarship || hasApplied) {
            if (scholarship?.applicationUrl) window.open(scholarship.applicationUrl, '_blank');
            return;
        }

        setApplying(true);
        try {
            await applicationAPI.create(scholarship.id, {
                appliedAt: new Date().toISOString(),
                status: 'draft' // Mark as draft until they confirm on ApplicationsPage
            });

            setHasApplied(true);
            toast({
                title: "Application Tracked!",
                description: "Opening official portal..."
            });

            if (scholarship.applicationUrl) {
                window.open(scholarship.applicationUrl, '_blank');
            }
        } catch (error) {
            console.error('Application error:', error);
            toast({ title: "Error", description: "Failed to process application", variant: "destructive" });
        } finally {
            setApplying(false);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied!", description: `${label} copied to clipboard` });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Loading details...</p>
            </div>
        );
    }

    if (!scholarship) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold mb-2">Scholarship Not Found</h2>
                <Button variant="outline" onClick={() => navigate('/scholarships')}>Back to Browsing</Button>
            </div>
        );
    }

    const matchScore = profile ? calculateMatchScore(profile, scholarship) : null;
    const matchReasons = profile ? getMatchReasons(profile, scholarship) : [];
    const daysLeft = Math.ceil((new Date(scholarship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const isHindi = i18n.language === 'hi';

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            <Header />
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 pl-0 hover:pl-2 transition-all">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {scholarship.providerType && (
                                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                        {scholarship.providerType.toUpperCase()}
                                    </Badge>
                                )}
                                {matchScore !== null && matchScore >= 80 && (
                                    <Badge className="bg-green-100 text-green-700 border-green-200">
                                        <CheckCircle2 className="h-3 w-3 mr-1" /> {matchScore}% Match
                                    </Badge>
                                )}
                                {daysLeft <= 10 && (
                                    <Badge variant="destructive" className="animate-pulse">
                                        Closing Soon
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-center justify-between gap-4 mb-4">
                                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                                    {isHindi ? scholarship.titleHi : scholarship.title}
                                </h1>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => toggleSave(scholarship.id)}
                                    className={`shrink-0 rounded-full h-12 w-12 ${savedScholarships.includes(scholarship.id) ? 'bg-primary/10 text-primary border-primary/30' : 'text-muted-foreground'}`}
                                >
                                    <Bookmark className={`h-6 w-6 ${savedScholarships.includes(scholarship.id) ? 'fill-current' : ''}`} />
                                </Button>
                            </div>

                            <div className="flex items-center gap-2 text-muted-foreground mb-6">
                                <Building2 className="h-5 w-5" />
                                <span className="font-medium">{isHindi ? scholarship.providerHi : scholarship.provider}</span>
                            </div>
                        </div>

                        <Card className="p-6 md:p-8 space-y-6">
                            <div>
                                <h3 className="font-display text-lg font-semibold mb-3">About the Scholarship</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {isHindi ? scholarship.descriptionHi : scholarship.description}
                                </p>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="font-display text-lg font-semibold mb-4">Eligibility Criteria</h3>
                                <ul className="space-y-3">
                                    {scholarship.eligibility.categories?.length > 0 && !scholarship.eligibility.categories.includes('All') && (
                                        <li className="flex items-start gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                            <span className="text-sm">Must belong to categories: {scholarship.eligibility.categories.join(', ')}</span>
                                        </li>
                                    )}
                                    {scholarship.eligibility.maxIncome > 0 && (
                                        <li className="flex items-start gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                            <span className="text-sm">Annual family income must be less than ₹{scholarship.eligibility.maxIncome.toLocaleString('en-IN')}</span>
                                        </li>
                                    )}
                                    {scholarship.eligibility.minPercentage > 0 && (
                                        <li className="flex items-start gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                            <span className="text-sm">Minimum {scholarship.eligibility.minPercentage}% marks in previous exam</span>
                                        </li>
                                    )}
                                    {scholarship.eligibility.genders?.length > 0 && !scholarship.eligibility.genders.includes('Other') && (
                                        <li className="flex items-start gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                            <span className="text-sm">Open to {scholarship.eligibility.genders.join(', ')} applicants</span>
                                        </li>
                                    )}
                                </ul>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="font-display text-lg font-semibold mb-4">Required Documents</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {scholarship.requiredDocuments?.map((doc, idx) => (
                                        <div key={idx} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm">
                                            <Info className="h-4 w-4 text-muted-foreground" /> {doc}
                                        </div>
                                    ))}
                                    {(!scholarship.requiredDocuments || scholarship.requiredDocuments.length === 0) && (
                                        <p className="text-sm text-muted-foreground">No specific documents listed.</p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {matchScore !== null && (
                            <Card className="p-6 bg-accent/5 border-accent/20">
                                <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Target className="h-5 w-5 text-accent" /> Why you match
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-muted-foreground">Compatibility</span>
                                        <span className="font-bold text-accent">{matchScore}%</span>
                                    </div>
                                    <div className="w-full bg-accent/10 rounded-full h-2 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${matchScore}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="bg-accent h-full"
                                        />
                                    </div>
                                    <ul className="pt-2 space-y-2">
                                        {matchReasons.map((reason, idx) => (
                                            <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                                                {reason}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Card>
                        )}

                        <Card className="p-6 sticky top-24">
                            <div className="space-y-4 mb-6">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Scholarship Value</p>
                                    <div className="flex items-center gap-2">
                                        <IndianRupee className="h-6 w-6 text-green-600" />
                                        <span className="text-2xl font-bold">
                                            {scholarship.amount > 0 ? `₹${scholarship.amount.toLocaleString('en-IN')}` : 'Variable'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Application Deadline</p>
                                    <div className="flex items-center gap-2">
                                        <Calendar className={`h-5 w-5 ${daysLeft <= 10 ? 'text-destructive' : 'text-primary'}`} />
                                        <span className={`font-semibold ${daysLeft <= 10 ? 'text-destructive' : ''}`}>
                                            {new Date(scholarship.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                    {daysLeft > 0 && <p className="text-xs text-muted-foreground mt-1">{daysLeft} days remaining</p>}
                                </div>
                            </div>

                            {hasApplied ? (
                                <Button className="w-full h-12 bg-green-600 hover:bg-green-700 cursor-default" disabled>
                                    <CheckCircle2 className="h-5 w-5 mr-2" /> Application Submitted
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleApply}
                                    className="w-full h-12 text-base shadow-lg hover:shadow-xl transition-all"
                                    disabled={applying || daysLeft < 0}
                                >
                                    {applying ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ExternalLink className="h-5 w-5 mr-2" />}
                                    {daysLeft < 0 ? 'Deadline Passed' : t('scholarships.applyNow')}
                                </Button>
                            )}

                            <p className="text-xs text-center text-muted-foreground mt-4">
                                Application typically takes ~15 mins on the official portal.
                            </p>
                        </Card>

                        {/* External Assistant Card */}
                        <Card className="group p-6 bg-primary/5 border-dashed border-primary/30 hover:shadow-elevated transition-all duration-300 relative overflow-visible">
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-mono font-bold text-primary/80 uppercase tracking-widest">Secure Token Ready</div>
                                        <div className="text-sm font-bold uppercase tracking-wider">Smart Assistant</div>
                                    </div>
                                </div>

                                <div className="p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-primary/10 mb-2">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-[12px] font-bold text-accent flex items-center gap-1.5">
                                            <Navigation className="h-4 w-4 fill-accent rotate-90" /> Zero-Install Magic
                                        </p>
                                        <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Active</span>
                                    </div>

                                    <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
                                        Instantly inject your profile into government scholarship forms without installing anything.
                                    </p>

                                    <div className="relative w-full">
                                        <a
                                            href={profile ? `javascript:(function(){
                                                const data = JSON.parse(atob('${btoa(JSON.stringify({
                                                fullName: profile.fullName || '',
                                                aadhar: "XXXX-XXXX-XXXX",
                                                income: profile.annualIncome || '',
                                                state: profile.state || '',
                                                category: profile.category || '',
                                                education: profile.educationLevel || '',
                                                dob: profile.dateOfBirth || '',
                                                gender: profile.gender || '',
                                                percentage: profile.percentage || '',
                                                disability: profile.hasDisability ? 'Yes' : 'No',
                                                course: profile.course || '',
                                                institution: profile.institution || ''
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
                                                if (!profile) {
                                                    e.preventDefault();
                                                    return;
                                                }
                                                e.preventDefault();
                                                setShowWizard(true);
                                            }}
                                            onDragStart={(e) => {
                                                if (!profile) e.preventDefault();
                                                setShowWizard(false);
                                            }}
                                            className="inline-flex items-center justify-center gap-2 w-full h-10 bg-primary text-primary-foreground rounded-xl text-xs font-bold shadow-md hover:scale-[1.02] transition-transform cursor-grab active:cursor-grabbing"
                                        >
                                            <Sparkles className="h-4 w-4 fill-primary-foreground" /> Install Apply Widget
                                        </a>

                                        {showWizard && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                className="absolute bottom-[calc(100%+16px)] right-0 w-80 bg-card border border-border p-4 rounded-3xl shadow-xl z-[100]"
                                            >
                                                <div className="flex justify-between items-center mb-3">
                                                    <h3 className="font-bold text-sm flex items-center gap-2">
                                                        <Navigation className="h-4 w-4 text-primary rotate-90" /> Drag to Bookmarks
                                                    </h3>
                                                    <button onClick={() => setShowWizard(false)} className="text-muted-foreground hover:bg-muted p-1 rounded-full">
                                                        <AlertCircle className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground mb-3">
                                                    Drag the button above to your bookmarks bar. Open it on any government portal to auto-fill!
                                                </p>
                                                <div className="bg-primary/5 p-2 rounded-lg border border-primary/20 text-[10px]">
                                                    <span className="font-bold">Shortcut:</span> Ctrl + Shift + B to show bookmarks bar.
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4 bg-primary/5 border-primary/10">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <Share2 className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">Share this opportunity</h4>
                                    <p className="text-xs text-muted-foreground mb-2">Help your friends find scholarships too.</p>
                                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        toast({ title: "Copied", description: "Link copied to clipboard" });
                                    }}>Copy Link</Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </motion.div>
            </main>
            <BottomNav />

            {/* Removed Sidepanel Sheet */}
        </div>
    );
};

export default ScholarshipDetailsPage;
