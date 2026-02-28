import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    Loader2, FileText, Download, Trash2, Eye, RefreshCw,
    FileCheck, Shield, Clock, Plus, Wand2, Languages,
    AlertTriangle, History, CheckCircle2, ChevronRight, Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { profileAPI, documentsAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';

const DocumentsPage = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [documents, setDocuments] = useState<any[]>([]);
    const [cachedDocs, setCachedDocs] = useState<any[]>([]);
    const [generating, setGenerating] = useState(false);
    const [genType, setGenType] = useState('income_affidavit');
    const [genLang, setGenLang] = useState('en');

    // Preview/Edit State
    const [showEditSheet, setShowEditSheet] = useState(false);
    const [editData, setEditData] = useState<any>(null);

    const fetchDocuments = async () => {
        if (!user?.id) return;
        try {
            const cache = localStorage.getItem('docVaultCache');
            if (cache) {
                const parsedCache = JSON.parse(cache);
                const transformed = Object.entries(parsedCache).map(([type, data]: [string, any]) => ({
                    type: type.toUpperCase(),
                    fileName: data.file?.name || `${type}.pdf`,
                    uploadDate: new Date().toISOString(),
                    confidenceScore: data.confidence || 95,
                    isCached: true,
                    raw: data
                }));
                setCachedDocs(transformed);
            }

            const resp = await documentsAPI.listDocuments(user.id);
            if (resp.success) setDocuments(resp.documents);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [user]);

    const allDocuments = [...cachedDocs, ...documents];

    const startGenerationFlow = async () => {
        setGenerating(true);
        try {
            const profile = await profileAPI.getProfile();
            setEditData({
                ...profile,
                financialYear: "2024-25",
                scholarshipName: "National Merit Scholarship",
                institutionName: profile.institution || "",
                courseName: profile.course || ""
            });
            setShowEditSheet(true);
        } catch (err) {
            toast({ title: "Error", description: "Could not fetch profile data.", variant: "destructive" });
        } finally {
            setGenerating(false);
        }
    };

    const handleFinalGenerate = async () => {
        setGenerating(true);
        try {
            const ocrCache = JSON.parse(localStorage.getItem('docVaultCache') || '{}');
            const resp = await documentsAPI.generateDocument(genType, { ...editData, userId: user?.id }, genLang, ocrCache);
            if (resp.success) {
                toast({ title: "Success", description: "Document generated and versioned." });
                setShowEditSheet(false);
                fetchDocuments();
            }
        } catch (err: any) {
            const isConsistencyError = err.message.includes("CONSISTENCY_ERROR");
            toast({
                title: isConsistencyError ? "Identity Mismatch" : "Generation Failed",
                description: err.message.replace("CONSISTENCY_ERROR: ", ""),
                variant: "destructive"
            });
        } finally {
            setGenerating(false);
        }
    };

    const handleDownload = (fileName: string) => {
        if (!user?.id) return;
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/documents/${user.id}/${fileName}`;
        window.open(url, '_blank');
    };

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            <Header />
            <main className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
                            <Shield className="h-8 w-8 text-primary" />
                            Document Vault & Generator
                        </h1>
                        <p className="text-muted-foreground mt-2">Verified extracts and structured scholarship documents.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Document Generator Section */}
                    <Card className="p-6 h-fit border-primary/20 bg-primary/5 shadow-lg shadow-primary/5">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Wand2 className="h-5 w-5 text-primary" />
                            Document Factory
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-muted-foreground">Select Document Type</label>
                                <Select value={genType} onValueChange={setGenType}>
                                    <SelectTrigger className="bg-background h-12 border-primary/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="income_affidavit">Income Affidavit</SelectItem>
                                        <SelectItem value="income_declaration">Income Declaration</SelectItem>
                                        <SelectItem value="caste_declaration">Caste Declaration</SelectItem>
                                        <SelectItem value="bonafide_letter">Bonafide Request Letter</SelectItem>
                                        <SelectItem value="scholarship_cover_letter">Scholarship Cover Letter</SelectItem>
                                        <SelectItem value="gap_year_declaration">Gap Year Declaration</SelectItem>
                                        <SelectItem value="disability_declaration">Disability Declaration</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-muted-foreground">Output Language</label>
                                <Select value={genLang} onValueChange={setGenLang}>
                                    <SelectTrigger className="bg-background h-12 border-primary/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="hi">Hindi (हिंदी)</SelectItem>
                                        <SelectItem value="mr">Marathi (मराठी)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                onClick={startGenerationFlow}
                                disabled={generating}
                                className="w-full mt-4 h-12 bg-primary hover:bg-primary/90 text-lg font-bold"
                            >
                                {generating ? <Loader2 className="animate-spin mr-2" /> : <Edit3 className="mr-2 h-5 w-5" />}
                                Preview & Edit
                            </Button>
                        </div>
                    </Card>

                    {/* List Section */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
                            <History className="h-5 w-5 text-muted-foreground" />
                            Recent Activities
                        </h3>
                        {loading ? (
                            <div className="flex justify-center p-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : allDocuments.length === 0 ? (
                            <Card className="p-12 text-center border-dashed">
                                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                <h3 className="text-lg font-medium">No documents yet</h3>
                                <p className="text-muted-foreground text-sm">Upload documents or use the Generator to create new ones.</p>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {allDocuments.map((doc, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <Card className={`p-4 hover:shadow-xl transition-all cursor-default relative overflow-hidden ${doc.isCached ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
                                            {doc.isCached && <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rotate-45 translate-x-8 -translate-y-8" />}
                                            <div className="flex items-start justify-between mb-3 relative z-10">
                                                <div className={`p-2 rounded-xl ${doc.isCached ? 'bg-primary' : 'bg-primary/10'}`}>
                                                    <FileText className={`h-6 w-6 ${doc.isCached ? 'text-white' : 'text-primary'}`} />
                                                </div>
                                                <Badge variant={doc.isCached ? "default" : "secondary"} className="font-bold">
                                                    {doc.isCached ? "OCR VERIFIED" : `V${doc.version || 1}`}
                                                </Badge>
                                            </div>
                                            <h4 className="font-bold text-sm uppercase truncate mb-1">{doc.type.replace(/_/g, ' ')}</h4>
                                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-4">
                                                <Clock className="h-3 w-3" />
                                                {new Date(doc.uploadDate || doc.generatedAt).toLocaleDateString()}
                                            </div>

                                            <div className="flex gap-2 border-t pt-3 relative z-10">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 h-8 text-xs border-primary/20 hover:bg-primary/5"
                                                    onClick={() => doc.isCached ? toast({ title: "Vault Extract", description: "Viewing locally cached OCR data." }) : handleDownload(doc.fileName)}
                                                >
                                                    {doc.isCached ? <Eye className="h-3 w-3 mr-1" /> : <Download className="h-3 w-3 mr-1" />}
                                                    {doc.isCached ? "View Extract" : "Download PDF"}
                                                </Button>
                                                {!doc.isCached && (
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10">
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Edit Before Generate Sheet */}
            <Sheet open={showEditSheet} onOpenChange={setShowEditSheet}>
                <SheetContent className="sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Edit3 className="h-5 w-5 text-primary" />
                            Review Document Details
                        </SheetTitle>
                        <SheetDescription>
                            Confirm or adjust info before generating the final legal PDF.
                        </SheetDescription>
                    </SheetHeader>

                    {editData && (
                        <div className="space-y-4 py-6">
                            <div className="space-y-2">
                                <Label>Full Name (as per Aadhaar)</Label>
                                <Input
                                    value={editData.fullName}
                                    onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                                    className="border-primary/20"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Annual Income (₹)</Label>
                                    <Input
                                        type="number"
                                        value={editData.annualIncome}
                                        onChange={(e) => setEditData({ ...editData, annualIncome: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Input value={editData.category} disabled />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Institution Name</Label>
                                <Input
                                    value={editData.institutionName}
                                    onChange={(e) => setEditData({ ...editData, institutionName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Course Name</Label>
                                <Input
                                    value={editData.courseName}
                                    onChange={(e) => setEditData({ ...editData, courseName: e.target.value })}
                                />
                            </div>
                            {genType === 'scholarship_cover_letter' && (
                                <div className="space-y-2">
                                    <Label>Scholarship Name</Label>
                                    <Input
                                        value={editData.scholarshipName}
                                        onChange={(e) => setEditData({ ...editData, scholarshipName: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg flex gap-3">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
                                <p className="text-[11px] text-yellow-800 font-medium">
                                    Note: Your identity data will be cross-checked with your uploaded Aadhaar/Income documents for legal consistency.
                                </p>
                            </div>
                        </div>
                    )}

                    <SheetFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowEditSheet(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleFinalGenerate}
                            disabled={generating}
                            className="flex-1 bg-primary"
                        >
                            {generating ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2" />}
                            Generate Final
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <BottomNav />
        </div>
    );
};

export default DocumentsPage;
