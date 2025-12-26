import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle2, XCircle, AlertCircle, ChevronRight, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';

const mockApplications = [
  { id: '1', scholarshipTitle: 'National Merit Scholarship', provider: 'Ministry of Education', status: 'submitted', progress: 100, appliedDate: '2024-01-15', amount: 50000 },
  { id: '2', scholarshipTitle: 'SC/ST Scholarship Scheme', provider: 'Ministry of Social Justice', status: 'underReview', progress: 100, appliedDate: '2024-01-20', amount: 36000 },
  { id: '3', scholarshipTitle: 'Pragati Scholarship for Girls', provider: 'AICTE', status: 'draft', progress: 60, appliedDate: '2024-01-25', amount: 50000 },
];

const ApplicationsPage = () => {
  const { t } = useTranslation();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft': return { icon: Clock, color: 'bg-muted text-muted-foreground', label: t('applications.status.draft') };
      case 'submitted': return { icon: CheckCircle2, color: 'bg-blue-100 text-blue-700', label: t('applications.status.submitted') };
      case 'underReview': return { icon: AlertCircle, color: 'bg-yellow-100 text-yellow-700', label: t('applications.status.underReview') };
      case 'approved': return { icon: CheckCircle2, color: 'bg-accent/10 text-accent', label: t('applications.status.approved') };
      case 'rejected': return { icon: XCircle, color: 'bg-destructive/10 text-destructive', label: t('applications.status.rejected') };
      default: return { icon: Clock, color: 'bg-muted text-muted-foreground', label: 'Unknown' };
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold mb-2">{t('applications.title')}</h1>
          <p className="text-muted-foreground mb-6">{t('applications.subtitle')}</p>
        </motion.div>

        {mockApplications.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{t('applications.empty.title')}</h3>
            <p className="text-muted-foreground mb-6">{t('applications.empty.subtitle')}</p>
            <Link to="/scholarships"><Button>{t('applications.empty.cta')}</Button></Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {mockApplications.map((app, index) => {
              const statusConfig = getStatusConfig(app.status);
              return (
                <motion.div key={app.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-card rounded-2xl border border-border p-5 hover:shadow-card transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={statusConfig.color}><statusConfig.icon className="h-3 w-3 mr-1" />{statusConfig.label}</Badge>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{app.scholarshipTitle}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{app.provider}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">Applied: {new Date(app.appliedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span className="font-medium text-accent">₹{app.amount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon"><ChevronRight className="h-5 w-5" /></Button>
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
