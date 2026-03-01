import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Users, Search, FolderOpen, Loader2, Save, FileText, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase'; // Direct supabase client for simplicity

export const ProviderDashboard = () => {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<'scholarships' | 'applications' | 'create'>('scholarships');
    const [scholarships, setScholarships] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Create Form State
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        deadline: '',
        description: '',
        categories: 'General, SC, ST, OBC, EWS',
        genders: 'Male, Female, Other',
        minPercentage: '0',
        maxIncome: '800000',
        educationLevels: 'graduation, postGrad',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (activeTab === 'scholarships') {
            loadScholarships();
        } else if (activeTab === 'applications') {
            loadApplications();
        }
    }, [activeTab]);

    const loadScholarships = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const { data } = await supabase.from('scholarships').select('*').eq('created_by', session.user.id);
            setScholarships(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadApplications = async () => {
        setIsLoading(true);
        try {
            // If they don't have the table, we just mock to avoid crashing
            const { data, error } = await supabase.from('applications').select('*, profiles!student_id(full_name, email), scholarships!scholarship_id(title)').limit(10);
            if (error) {
                console.log("No applications table found or error", error);
                setApplications([]);
            } else {
                setApplications(data || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateScholarship = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Not logged in");

            const insertData = {
                title: formData.title,
                titleHi: formData.title,
                description: formData.description,
                descriptionHi: formData.description,
                provider: 'Partner Provider',
                providerHi: 'Partner Provider',
                providerType: 'private',
                amount: parseInt(formData.amount.replace(/[^0-9]/g, '')) || 0,
                amountType: 'yearly',
                deadline: formData.deadline,
                eligibility: {
                    categories: formData.categories.split(',').map(s => s.trim()).filter(Boolean),
                    genders: formData.genders.split(',').map(s => s.trim()).filter(Boolean),
                    minPercentage: parseInt(formData.minPercentage) || 0,
                    maxIncome: parseInt(formData.maxIncome) || 0,
                    educationLevels: formData.educationLevels.split(',').map(s => s.trim()).filter(Boolean),
                    states: ["All"],
                    disabilities: false
                },
                requiredDocuments: ['aadhar', 'income'],
                applicationUrl: 'internal',
                tags: ['private'],
                featured: false,
                created_by: session.user.id,
                is_internal: true,
                status: 'active'
            };

            const { error } = await supabase.from('scholarships').insert([insertData]);

            if (error) throw error;

            toast({ title: 'Success', description: 'Scholarship created successfully!' });
            setFormData({
                title: '', amount: '', deadline: '', description: '',
                categories: 'General, SC, ST, OBC, EWS', genders: 'Male, Female, Other',
                minPercentage: '0', maxIncome: '800000', educationLevels: 'graduation, postGrad'
            });
            setActiveTab('scholarships');
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to create scholarship.', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            <Header />

            <main className="container mx-auto px-4 py-8 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                    <div>
                        <h1 className="font-display text-4xl font-bold mb-2">Provider <span className="gradient-text">Dashboard</span></h1>
                        <p className="text-muted-foreground">Manage your scholarship listings and review student applications directly.</p>
                    </div>
                    {activeTab !== 'create' && (
                        <Button size="lg" className="w-full md:w-auto" onClick={() => setActiveTab('create')}>
                            <Plus className="mr-2 h-5 w-5" />
                            Create Scholarship
                        </Button>
                    )}
                </motion.div>

                {/* Tab Navigation */}
                <div className="flex bg-muted p-1 rounded-xl mb-8 max-w-md">
                    <button
                        className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${activeTab === 'scholarships' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setActiveTab('scholarships')}
                    >
                        My Scholarships
                    </button>
                    <button
                        className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${activeTab === 'applications' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setActiveTab('applications')}
                    >
                        Applications
                    </button>
                    <button
                        className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${activeTab === 'create' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setActiveTab('create')}
                    >
                        Create
                    </button>
                </div>

                {/* View Areas */}
                {isLoading && (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}

                {!isLoading && activeTab === 'scholarships' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {scholarships.length === 0 ? (
                            <Card className="col-span-full p-12 text-center flex flex-col items-center justify-center border-dashed">
                                <FolderOpen className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                                <h3 className="text-xl font-bold mb-2">No Scholarships Yet</h3>
                                <p className="text-muted-foreground mb-6 max-w-sm">You haven't listed any scholarships on the platform yet. Create one to start receiving applications.</p>
                                <Button onClick={() => setActiveTab('create')}>Create First Scholarship</Button>
                            </Card>
                        ) : (
                            scholarships.map(s => (
                                <Card key={s.id} className="p-6">
                                    <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{s.description}</p>
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-primary">{s.amount}</span>
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md">Active</span>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                )}

                {!isLoading && activeTab === 'applications' && (
                    <div className="space-y-4">
                        {applications.length === 0 ? (
                            <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed">
                                <Users className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                                <h3 className="text-xl font-bold mb-2">No Applications</h3>
                                <p className="text-muted-foreground mb-6 max-w-sm">Once students start applying for your scholarships, they will securely appear here along with their verified documents.</p>
                            </Card>
                        ) : (
                            applications.map(app => (
                                <Card key={app.id} className="p-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <div>
                                        <h3 className="font-semibold">{app.profiles?.full_name || 'Student'} <span className="text-muted-foreground font-normal text-sm ml-2">({app.profiles?.email})</span></h3>
                                        <p className="text-sm mt-1">Applied for: <span className="font-medium">{app.scholarships?.title}</span></p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm"><FileText className="w-4 h-4 mr-2" /> View Docs</Button>
                                        <Button size="sm"><CheckCircle2 className="w-4 h-4 mr-2" /> Approve</Button>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'create' && (
                    <Card className="max-w-2xl mx-auto p-6 md:p-8">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold flex items-center gap-2"><Plus className="w-5 h-5 text-primary" /> New Scholarship Listing</h2>
                            <p className="text-muted-foreground text-sm mt-1">Fill out the details below. It will be instantly available for students to apply directly through our internal system.</p>
                        </div>
                        <form onSubmit={handleCreateScholarship} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Scholarship Title</Label>
                                <Input id="title" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Tech Excellence Grant 2026" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Award Amount</Label>
                                    <Input id="amount" required value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="e.g., ₹50,000" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="deadline">Application Deadline</Label>
                                    <Input id="deadline" type="date" required value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-4 pt-4 border-t border-border">
                                <h3 className="font-semibold text-mg">Eligibility Criteria</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="categories">Eligible Categories (comma separated)</Label>
                                        <Input id="categories" value={formData.categories} onChange={e => setFormData({ ...formData, categories: e.target.value })} placeholder="e.g., General, SC, ST, OBC" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="genders">Eligible Genders (comma separated)</Label>
                                        <Input id="genders" value={formData.genders} onChange={e => setFormData({ ...formData, genders: e.target.value })} placeholder="e.g., Male, Female, Other" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="minPercentage">Minimum Percentage Required (%)</Label>
                                        <Input id="minPercentage" type="number" value={formData.minPercentage} onChange={e => setFormData({ ...formData, minPercentage: e.target.value })} placeholder="e.g., 60" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maxIncome">Maximum Annual Income (₹)</Label>
                                        <Input id="maxIncome" type="number" value={formData.maxIncome} onChange={e => setFormData({ ...formData, maxIncome: e.target.value })} placeholder="e.g., 800000" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="educationLevels">Education Levels (comma separated)</Label>
                                    <Input id="educationLevels" value={formData.educationLevels} onChange={e => setFormData({ ...formData, educationLevels: e.target.value })} placeholder="e.g., class10, class12, graduation, postGrad" />
                                </div>
                            </div>

                            <div className="space-y-2 border-t border-border pt-4">
                                <Label htmlFor="description">Scholarship Description</Label>
                                <textarea
                                    id="description"
                                    className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the scholarship details..."
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Publish Scholarship
                            </Button>
                        </form>
                    </Card>
                )}

            </main>
            <BottomNav />
        </div>
    );
};
