import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Loader2, Save, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { profileAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { OCRFillSection } from '@/components/OCRFillSection';

const DocumentsPage = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { authenticated, loading: authLoading } = useAuth();
    const [saving, setSaving] = useState(false);
    const [extractedData, setExtractedData] = useState<Record<string, any>>({});
    const [uploadedDocs, setUploadedDocs] = useState<Record<string, { name: string, url: string, extracted_data?: any }>>({});

    // Track what we plan to update in the profile
    const [pendingUpdates, setPendingUpdates] = useState<Record<string, any>>({});

    useEffect(() => {
        const fetchUploadedDocs = async () => {
            if (!authenticated || authLoading) return;
            try {
                const { documentAPI } = await import('@/lib/api');
                const userDocs = await documentAPI.getUserDocuments();

                const docsMap: Record<string, { name: string, url: string, extracted_data: any }> = {};
                for (const doc of userDocs) {
                    const type = doc.document_type;
                    const url = await documentAPI.getDocumentUrl(doc.file_name);
                    if (url) {
                        docsMap[type] = { name: doc.file_name, url, extracted_data: doc.extracted_data };
                    }
                }
                setUploadedDocs(docsMap);
            } catch (err) {
                console.error("Failed to fetch documents", err);
            }
        };
        fetchUploadedDocs();
    }, [authenticated, authLoading]);

    const handleExtract = (type: string, data: any) => {
        setExtractedData(prev => ({ ...prev, [type]: data }));

        const parsed = data.parsed;
        if (parsed) {
            const updates: any = {};
            if (parsed.fullName) updates.fullName = parsed.fullName;
            if (parsed.dateOfBirth) updates.dateOfBirth = parsed.dateOfBirth.split('/').reverse().join('-');
            if (parsed.gender) updates.gender = parsed.gender;
            if (parsed.category) {
                const cat = ['General', 'OBC', 'SC', 'ST', 'EWS'].find(c => c.toLowerCase() === parsed.category?.toLowerCase());
                if (cat) updates.category = cat;
            }
            if (parsed.annualIncome) updates.annualIncome = parsed.annualIncome;
            if (parsed.percentage) updates.percentage = parsed.percentage;
            if (parsed.institution) updates.institution = parsed.institution;

            setPendingUpdates(prev => ({ ...prev, ...updates }));
        }
    };

    const handleSaveToProfile = async () => {
        if (Object.keys(pendingUpdates).length === 0) {
            toast({ title: "Nothing to save", description: "Please upload and extract a document first." });
            return;
        }

        setSaving(true);
        try {
            // First fetch current profile so we don't accidentally blank out fields
            const currentProfile = await profileAPI.getProfile();

            const payload = {
                fullName: currentProfile?.full_name,
                dateOfBirth: currentProfile?.date_of_birth,
                gender: currentProfile?.gender,
                category: currentProfile?.category,
                state: currentProfile?.state,
                district: currentProfile?.district,
                hasDisability: currentProfile?.has_disability ? 'yes' : 'no',
                educationLevel: currentProfile?.education_level,
                institution: currentProfile?.institution,
                institutionType: currentProfile?.institution_type,
                course: currentProfile?.course,
                courseCategory: currentProfile?.course_category,
                degreeType: currentProfile?.degree_type,
                yearOfStudy: currentProfile?.year_of_study || 1,
                percentage: currentProfile?.percentage || 0,
                annualIncome: currentProfile?.annual_income || 0,
                incomeCategory: currentProfile?.income_category,
                role: currentProfile?.role || 'student',
                parentOccupation: currentProfile?.parent_occupation,
                minorityStatus: currentProfile?.minority_status,
                isHosteller: currentProfile?.is_hosteller ? 'yes' : 'no',
                ...pendingUpdates
            };

            await profileAPI.updateProfile(payload);

            toast({
                title: "Profile Updated",
                description: "Your verified document data has been saved to your profile."
            });
            // Clear pending updates after save
            setPendingUpdates({});
        } catch (error: any) {
            toast({
                title: "Error saving data",
                description: error.message || "Failed to update profile.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            <Header />
            <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                    <div>
                        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
                            <FileText className="h-8 w-8 text-primary" />
                            Document Verification
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Upload your official documents to automatically verify and fill your scholarship profile.
                        </p>
                    </div>

                    <Button
                        size="lg"
                        onClick={handleSaveToProfile}
                        disabled={saving || Object.keys(pendingUpdates).length === 0}
                        className="w-full md:w-auto"
                    >
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Verified Data
                    </Button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <OCRFillSection
                        onExtract={handleExtract}
                        extractedData={extractedData}
                        uploadedDocs={uploadedDocs}
                    />
                </motion.div>

                {Object.keys(pendingUpdates).length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-accent/10 border border-accent/20 p-6 rounded-xl"
                    >
                        <h3 className="font-semibold text-lg mb-4 text-accent">Data ready to sync:</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            {Object.entries(pendingUpdates).map(([k, v]) => (
                                <div key={k} className="bg-background rounded-lg p-3 border">
                                    <div className="text-xs text-muted-foreground uppercase mb-1">{k.replace(/([A-Z])/g, ' $1').trim()}</div>
                                    <div className="font-medium">{String(v)}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </main>
            <BottomNav />
        </div>
    );
};

export default DocumentsPage;
