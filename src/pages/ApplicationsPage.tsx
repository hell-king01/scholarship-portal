import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle2, XCircle, AlertCircle, ChevronRight, GraduationCap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { applicationAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

const ApplicationsPage = () => {
  const { t } = useTranslation();
  const { authenticated, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft': return { icon: Clock, color: 'bg-muted text-muted-foreground', label: 'Draft' };
      case 'submitted': return { icon: CheckCircle2, color: 'bg-blue-100 text-blue-700', label: 'Submitted' };
      case 'under_review': return { icon: AlertCircle, color: 'bg-yellow-100 text-yellow-700', label: 'Under Review' };
      case 'approved': return { icon: CheckCircle2, color: 'bg-accent/10 text-accent', label: 'Approved' };
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
                  onClick={() => scholarship && (window.location.href = `/scholarship/${scholarship.id}`)}
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
                          {app.status === 'draft' ? 'Created' : 'Submitted'}: {new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {scholarship?.amount && (
                          <span className="font-medium text-accent">₹{scholarship.amount.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default ApplicationsPage;
