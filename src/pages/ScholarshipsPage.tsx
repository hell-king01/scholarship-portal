import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ScholarshipCard } from '@/components/ScholarshipCard';
import { scholarships, UserProfile, calculateMatchScore } from '@/lib/scholarships-data';

const mockUserProfile: UserProfile = {
  fullName: 'Priya Sharma', dateOfBirth: '2002-05-15', gender: 'Female', category: 'OBC',
  state: 'Bihar', district: 'Patna', hasDisability: false, educationLevel: 'graduation',
  institution: 'Patna University', course: 'B.Sc. Chemistry', yearOfStudy: 2, percentage: 78,
  annualIncome: 180000, incomeCategory: 'EWS',
  documents: { aadhar: { uploaded: true, verified: true }, income: { uploaded: true, verified: true }, marksheet: { uploaded: true, verified: true } },
  profileComplete: true,
};

const ScholarshipsPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [savedScholarships, setSavedScholarships] = useState<string[]>([]);

  const filters = [
    { id: 'all', label: t('scholarships.filters.all') },
    { id: 'government', label: t('scholarships.filters.government') },
    { id: 'private', label: t('scholarships.filters.private') },
    { id: 'ngo', label: t('scholarships.filters.ngo') },
  ];

  const matchedScholarships = scholarships
    .map(s => ({ ...s, matchScore: calculateMatchScore(mockUserProfile, s) }))
    .filter(s => s.matchScore >= 50)
    .filter(s => activeFilter === 'all' || s.providerType === activeFilter)
    .filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.provider.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold mb-2">{t('scholarships.title')}</h1>
          <p className="text-muted-foreground mb-6">{t('scholarships.subtitle')}</p>
        </motion.div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder={t('common.search')} className="pl-10 h-12" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-5 w-5 text-muted-foreground" /></button>}
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <Badge key={filter.id} variant={activeFilter === filter.id ? 'default' : 'outline'} className="cursor-pointer px-4 py-2 text-sm whitespace-nowrap" onClick={() => setActiveFilter(filter.id)}>
              {filter.label}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matchedScholarships.map((scholarship, index) => (
            <motion.div key={scholarship.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <ScholarshipCard scholarship={scholarship} userProfile={mockUserProfile} isSaved={savedScholarships.includes(scholarship.id)} onSave={() => setSavedScholarships(prev => prev.includes(scholarship.id) ? prev.filter(s => s !== scholarship.id) : [...prev, scholarship.id])} />
            </motion.div>
          ))}
        </div>

        {matchedScholarships.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('scholarships.empty.title')}</p>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default ScholarshipsPage;
