import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Calendar, Building2, IndianRupee, CheckCircle2,
    ExternalLink, Loader2, Share2, Info, AlertCircle, Copy, Navigation, Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
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

    // Auto-open assistant if coming from "Apply Now" button
    useEffect(() => {
        if (!loading && scholarship && new URLSearchParams(location.search).get('apply') === 'true') {
            if (authenticated) {
                setShowAssistant(true);
            } else {
                toast({ title: "Sign in required", description: "Please sign in to apply for scholarships" });
                navigate('/auth');
            }
            // Remove the param so it doesn't keep triggering on re-renders
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [loading, scholarship, authenticated, location.search, toast, navigate]);

    const handleApply = async () => {
        if (!authenticated) {
            toast({ title: "Sign in required", description: "Please sign in to apply for scholarships" });
            navigate('/auth');
            return;
        }

        if (!scholarship) return;

        // Instead of immediate redirect, open the assistant
        setShowAssistant(true);
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
                                    {daysLeft < 0 ? 'Deadline Passed' : 'Apply Now'}
                                </Button>
                            )}

                            <p className="text-xs text-center text-muted-foreground mt-4">
                                Application typically takes ~15 mins on the official portal.
                            </p>
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

            {/* Apply Assistant Sidebar */}
            <Sheet open={showAssistant} onOpenChange={setShowAssistant}>
                <SheetContent side="right" className="w-full sm:w-[400px] sm:max-w-md overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-2xl font-display flex items-center gap-2">
                            Apply Assistant
                        </SheetTitle>
                        <SheetDescription>
                            Copy your details directly from here to paste into the `{scholarship.provider}` portal.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1.5 p-3 rounded-lg border bg-muted/30 relative group">
                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Aadhar Number</span>
                                <span className="font-mono text-sm">XXXX-XXXX-XXXX</span>
                                <Button size="icon" variant="ghost" className="h-8 w-8 absolute right-2 top-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard('XXXX-XXXX-XXXX', 'Aadhar')}>
                                    <Copy className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </div>

                            <div className="flex flex-col gap-1.5 p-3 rounded-lg border bg-muted/30 relative group">
                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Full Name</span>
                                <span className="font-medium text-sm">{profile?.fullName || 'Not Profiled'}</span>
                                <Button size="icon" variant="ghost" className="h-8 w-8 absolute right-2 top-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(profile?.fullName || '', 'Name')}>
                                    <Copy className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </div>

                            <div className="flex flex-col gap-1.5 p-3 rounded-lg border bg-muted/30 relative group">
                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Annual Income</span>
                                <span className="font-medium text-sm">₹{profile?.annualIncome?.toLocaleString('en-IN') || 'Not Set'}</span>
                                <Button size="icon" variant="ghost" className="h-8 w-8 absolute right-2 top-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(String(profile?.annualIncome || ''), 'Income')}>
                                    <Copy className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </div>

                            <div className="flex flex-col gap-1.5 p-3 rounded-lg border bg-muted/30 relative group">
                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Category</span>
                                <span className="font-medium text-sm">{profile?.category || 'Not Set'}</span>
                                <Button size="icon" variant="ghost" className="h-8 w-8 absolute right-2 top-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(profile?.category || '', 'Category')}>
                                    <Copy className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </div>
                        </div>

                        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                            <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" /> Recommended Steps
                            </h4>
                            <ol className="list-decimal pl-4 space-y-2 text-sm text-muted-foreground">
                                <li>Register on the official portal.</li>
                                <li>Go to the 'Personal Details' tab.</li>
                                <li>Paste the values from above.</li>
                                <li>After applying, track status in ScholarMatch.</li>
                            </ol>
                        </div>

                        <Button
                            onClick={handleProceedToPortal}
                            className="w-full h-12 text-base shadow-lg bg-green-600 hover:bg-green-700 mt-4"
                            disabled={applying}
                        >
                            {applying ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Navigation className="mr-2 h-5 w-5" />}
                            Open Official Portal Let's Go
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default ScholarshipDetailsPage;
