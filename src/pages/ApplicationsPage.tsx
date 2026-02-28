import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle2, XCircle, AlertCircle, ChevronRight, GraduationCap, Loader2, UploadCloud, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { applicationAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ApplicationsPage = () => {
  const { t } = useTranslation();
  const { authenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!authenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await applicationAPI.getAll();
        setApplications(data);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchApplications();
    }
  }, [authenticated, authLoading]);

  const handleStatusUpdate = async (appId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      await applicationAPI.updateStatus(appId, newStatus);
      setApplications(prev => prev.map(app =>
        app.id === appId ? { ...app, status: newStatus } : app
      ));
      if (selectedApp?.id === appId) {
        setSelectedApp((prev: any) => ({ ...prev, status: newStatus }));
        if (newStatus === 'disbursed') {
          toast({ title: "🎉 Congratulations!", description: "Awesome! Your scholarship money has been received." });
        } else {
          toast({ title: "Status Updated", description: "Your application progress has been saved." });
        }
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Update Failed", description: "Could not update status", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft': return { icon: Clock, color: 'bg-muted text-muted-foreground', label: 'Draft' };
      case 'submitted': return { icon: CheckCircle2, color: 'bg-blue-100 text-blue-700', label: 'Applied on Portal' };
      case 'pending_verification': return { icon: AlertCircle, color: 'bg-yellow-100 text-yellow-700', label: 'Under Verification' };
      case 'under_review': return { icon: AlertCircle, color: 'bg-orange-100 text-orange-700', label: 'Under Review' };
      case 'approved': return { icon: CheckCircle2, color: 'bg-green-100 text-green-700', label: 'Approved' };
      case 'disbursed': return { icon: IndianRupee, color: 'bg-emerald-100 text-emerald-800', label: 'Money Received' };
      case 'rejected': return { icon: XCircle, color: 'bg-destructive/10 text-destructive', label: 'Rejected' };
      default: return { icon: Clock, color: 'bg-muted text-muted-foreground', label: status };
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Loading your applications...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold mb-2">My Applications</h1>
          <p className="text-muted-foreground mb-6">Track the status of your scholarship applications</p>
        </motion.div>

        {!authenticated ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Card className="p-8 max-w-md mx-auto">
              <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Sign in to track applications</h3>
              <p className="text-muted-foreground mb-6">You need to be logged in to view and manage your scholarship applications.</p>
              <Link to="/auth?mode=signin"><Button className="w-full">Sign In</Button></Link>
            </Card>
          </motion.div>
        ) : applications.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No applications yet</h3>
            <p className="text-muted-foreground mb-6">Start your journey by applying for scholarships that match your profile.</p>
            <Link to="/scholarships"><Button>Browse Scholarships</Button></Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {applications.map((app, index) => {
              const statusConfig = getStatusConfig(app.status);
              const scholarship = app.scholarships;
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl border border-border p-5 hover:shadow-card transition-shadow cursor-pointer"
                  onClick={() => setSelectedApp(app)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={statusConfig.color}>
                          <statusConfig.icon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{scholarship?.title || 'Unknown Scholarship'}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{scholarship?.provider || 'Unknown Provider'}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          {app.status === 'draft' ? 'Created' : 'Updated'}: {new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {scholarship?.amount > 0 && (
                          <span className="font-medium text-accent">₹{scholarship.amount.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground mt-2" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Action Portal Dialog */}
        <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>Update Progress</DialogTitle>
              <DialogDescription>
                Track where your scholarship money is.
              </DialogDescription>
            </DialogHeader>
            {selectedApp && (
              <div className="space-y-6 pt-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${selectedApp.status === 'submitted' ? 'bg-blue-100 text-blue-700' : 'bg-muted'}`}>
                      <UploadCloud className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Applied on Portal</p>
                      <p className="text-xs text-muted-foreground">Application ID attached.</p>
                    </div>
                    {selectedApp.status === 'draft' && (
                      <Button size="sm" onClick={() => handleStatusUpdate(selectedApp.id, 'submitted')} disabled={isUpdating}>
                        Mark Applied
                      </Button>
                    )}
                    {['submitted', 'pending_verification', 'approved', 'disbursed'].includes(selectedApp.status) && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${selectedApp.status === 'pending_verification' ? 'bg-yellow-100 text-yellow-700' : 'bg-muted'}`}>
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Under Verification</p>
                      <p className="text-xs text-muted-foreground">Govt. is reviewing documents.</p>
                    </div>
                    {selectedApp.status === 'submitted' && (
                      <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(selectedApp.id, 'pending_verification')} disabled={isUpdating}>
                        Mark as Verifying
                      </Button>
                    )}
                    {['pending_verification', 'approved', 'disbursed'].includes(selectedApp.status) && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${selectedApp.status === 'disbursed' ? 'bg-emerald-100 text-emerald-800' : 'bg-muted'}`}>
                      <IndianRupee className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Money Received</p>
                      <p className="text-xs text-muted-foreground">Amount credited to bank.</p>
                    </div>
                    {['pending_verification', 'approved'].includes(selectedApp.status) && (
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleStatusUpdate(selectedApp.id, 'disbursed')} disabled={isUpdating}>
                        Mark Received
                      </Button>
                    )}
                    {selectedApp.status === 'disbursed' && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <Button variant="ghost" onClick={() => window.open(`/scholarship/${selectedApp.scholarships?.id}`, '_self')}>
                    View Scholarship Details
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <BottomNav />
    </div>
  );
};

export default ApplicationsPage;
