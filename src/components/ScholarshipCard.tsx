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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group relative bg-white dark:bg-zinc-950 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300"
    >
      {/* Header Badges */}
      <div className="flex items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-2">
          {matchScore && matchScore >= 90 && (
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none rounded-full px-3 py-1 text-[11px] font-bold tracking-tight">
              ✨ Perfect Match • {matchScore}%
            </Badge>
          )}
          {scholarship.providerType && (
            <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-none rounded-full px-3 py-1 text-[11px] font-bold flex items-center gap-1">
              {scholarship.providerType === 'government' ? <Building2 className="h-3 w-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
              {scholarship.providerType.charAt(0).toUpperCase() + scholarship.providerType.slice(1)}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onSave}
          className={`rounded-full h-8 w-8 transition-colors ${isSaved ? 'text-primary bg-primary/10' : 'text-zinc-400 hover:text-zinc-600'}`}
        >
          <Bookmark className={`h-4.5 w-4.5 ${isSaved ? 'fill-current' : ''}`} />
        </Button>
      </div>

      <h3 className="font-display font-bold text-xl mb-2 group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">
        {isHindi ? scholarship.titleHi : scholarship.title}
      </h3>

      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
        <div className="w-2 h-2 rounded-full bg-zinc-300" />
        <span className="font-medium">{isHindi ? scholarship.providerHi : scholarship.provider}</span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <IndianRupee className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Amount</p>
            <p className="font-bold text-zinc-900 dark:text-zinc-100">₹{scholarship.amount.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
          <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
            <Calendar className="h-4.5 w-4.5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Deadline</p>
            <p className="font-bold text-zinc-900 dark:text-zinc-100">
              {new Date(scholarship.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>
      </div>

      {/* Qualification List */}
      <div className="mb-6 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-3">You qualify because:</p>
        <div className="space-y-2">
          {matchReasons.length > 0 ? (
            matchReasons.slice(0, 3).map((reason, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {reason}
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium text-orange-600">
              <AlertCircle className="h-3.5 w-3.5" />
              Criteria matching in progress...
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Link to={`/scholarship/${scholarship.id}`} className="flex-1">
          <Button variant="outline" className="w-full h-11 rounded-xl font-bold bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50">
            View Details
          </Button>
        </Link>
        <Link to={`/scholarship/${scholarship.id}?apply=true`} className="flex-1">
          <Button className="w-full h-11 rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white border-none shadow-lg shadow-orange-500/20 gap-2">
            Apply Now
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};
