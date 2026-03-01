import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Scholarship, UserProfile, calculateMatchScore, getMatchReasons } from '@/lib/scholarships-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, IndianRupee, Building2, CheckCircle2, AlertCircle, Bookmark, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  userProfile?: UserProfile;
  onSave?: () => void;
  isSaved?: boolean;
}

export const ScholarshipCard = ({ scholarship, userProfile, onSave, isSaved }: ScholarshipCardProps) => {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  const matchScore = userProfile ? calculateMatchScore(userProfile, scholarship) : null;
  const matchReasons = userProfile ? getMatchReasons(userProfile, scholarship) : [];

  const getMatchBadge = () => {
    if (!matchScore) return null;

    if (matchScore >= 90) {
      return (
        <Badge className="match-badge match-perfect">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {t('scholarships.perfectMatch')} • {matchScore}%
        </Badge>
      );
    } else if (matchScore >= 70) {
      return (
        <Badge className="match-badge match-good">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {t('scholarships.goodMatch')} • {matchScore}%
        </Badge>
      );
    } else {
      return (
        <Badge className="match-badge match-possible">
          <AlertCircle className="h-3.5 w-3.5" />
          {t('scholarships.possibleMatch')} • {matchScore}%
        </Badge>
      );
    }
  };

  const daysUntilDeadline = () => {
    const deadline = new Date(scholarship.deadline);
    const today = new Date();
    const diff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const days = daysUntilDeadline();

  const providerTypeColors = {
    government: 'bg-blue-100 text-blue-700',
    private: 'bg-purple-100 text-purple-700',
    ngo: 'bg-green-100 text-green-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="card-scholarship"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {getMatchBadge()}
            {scholarship.providerType && (
              <Badge variant="outline" className={providerTypeColors[scholarship.providerType as keyof typeof providerTypeColors] || 'bg-secondary'}>
                {scholarship.providerType === 'government' ? '🏛️' : scholarship.providerType === 'private' ? '🏢' : '🤝'}{' '}
                {scholarship.providerType.charAt(0).toUpperCase() + scholarship.providerType.slice(1)}
              </Badge>
            )}
            {days <= 7 && days > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                ⏰ {days} {t('scholarships.daysLeft')}
              </Badge>
            )}
          </div>
          <h3 className="font-display font-semibold text-lg leading-tight">
            {isHindi ? scholarship.titleHi : scholarship.title}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onSave}
          className={isSaved ? 'text-primary' : 'text-muted-foreground'}
        >
          <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
        </Button>
      </div>

      {/* Provider */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Building2 className="h-4 w-4" />
        <span>{isHindi ? scholarship.providerHi : scholarship.provider}</span>
      </div>

      {/* Amount & Deadline */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <IndianRupee className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('scholarships.amount')}</p>
            <p className="font-semibold">₹{scholarship.amount.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${days <= 7 ? 'bg-destructive/10' : 'bg-secondary'}`}>
            <Calendar className={`h-5 w-5 ${days <= 7 ? 'text-destructive' : 'text-secondary-foreground'}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('scholarships.deadline')}</p>
            <p className={`font-semibold ${days <= 7 ? 'text-destructive' : ''}`}>
              {new Date(scholarship.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>
      </div>

      {/* Match Reasons */}
      {matchReasons.length > 0 && (
        <div className="mb-4 p-3 bg-accent/5 rounded-xl">
          <p className="text-xs font-medium text-accent mb-2">{t('scholarships.youQualify')}</p>
          <div className="flex flex-wrap gap-1.5">
            {matchReasons.slice(0, 3).map((reason, idx) => (
              <span key={idx} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                ✓ {reason}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link to={`/scholarship/${scholarship.id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            {t('scholarships.viewDetails')}
          </Button>
        </Link>

        {/* Show Apply button only if eligible (matchScore > 0) */}
        {matchScore !== null && matchScore > 0 ? (
          <Link to={`/scholarship/${scholarship.id}`} className="flex-1">
            <Button className="w-full gap-2">
              {t('scholarships.applyNow')}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : matchScore === 0 ? (
          <div className="flex-1 flex items-center justify-center px-4 py-2 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="font-semibold text-sm">Not Eligible</span>
          </div>
        ) : (
          <Link to={`/scholarship/${scholarship.id}`} className="flex-1">
            <Button className="w-full gap-2">
              {t('scholarships.applyNow')}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </motion.div>
  );
};
