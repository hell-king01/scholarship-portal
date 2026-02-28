import {
  matchScholarship,
  type EnhancedUserProfile,
  type StandardizedEligibility
} from './eligibility-engine';

export interface Scholarship {
  id: string;
  title: string;
  titleHi: string;
  provider: string;
  providerHi: string;
  providerType: 'government' | 'private' | 'ngo';
  description: string;
  descriptionHi: string;
  amount: number;
  amountType: 'yearly' | 'one-time' | 'monthly';
  deadline: string;
  eligibility: {
    categories: string[];
    genders: string[];
    minPercentage: number;
    maxIncome: number;
    educationLevels: string[];
    states: string[];
    disabilities: boolean;
    courseCategories?: string[]; // New
    degreeTypes?: string[]; // New
    institutionTypes?: string[]; // New
    parentOccupations?: string[]; // New
    minorityStatuses?: string[]; // New
    isHosteller?: boolean; // New
  };
  requiredDocuments: string[];
  applicationUrl: string;
  tags: string[];
  featured: boolean;
}

export const scholarships: Scholarship[] = [
  {
    id: '1',
    title: 'National Merit Scholarship',
    titleHi: 'राष्ट्रीय मेरिट छात्रवृत्ति',
    provider: 'Ministry of Education',
    providerHi: 'शिक्षा मंत्रालय',
    providerType: 'government',
    description: 'A prestigious scholarship for meritorious students from economically weaker sections pursuing higher education in professional/technical courses.',
    descriptionHi: 'उच्च शिक्षा प्राप्त कर रहे आर्थिक रूप से कमजोर वर्गों के मेधावी छात्रों के लिए एक प्रतिष्ठित छात्रवृत्ति।',
    amount: 50000,
    amountType: 'yearly',
    deadline: '2024-03-31',
    eligibility: {
      categories: ['SC', 'ST', 'OBC', 'General', 'EWS'],
      genders: ['Male', 'Female', 'Other'],
      minPercentage: 60,
      maxIncome: 800000,
      educationLevels: ['graduation', 'postGrad'],
      states: ['All'],
      disabilities: false,
      degreeTypes: ['professional', 'technical'],
    },
    requiredDocuments: ['aadhar', 'income', 'marksheet'],
    applicationUrl: 'https://scholarships.gov.in',
    tags: ['merit', 'government', 'higher-education'],
    featured: true,
  },
  {
    id: '2',
    title: 'SC/ST Scholarship Scheme',
    titleHi: 'एससी/एसटी छात्रवृत्ति योजना',
    provider: 'Ministry of Social Justice',
    providerHi: 'सामाजिक न्याय मंत्रालय',
    providerType: 'government',
    description: 'Financial assistance for students belonging to Scheduled Castes and Scheduled Tribes to pursue education.',
    descriptionHi: 'अनुसूचित जाति और अनुसूचित जनजाति के छात्रों को शिक्षा प्राप्त करने के लिए वित्तीय सहायता।',
    amount: 36000,
    amountType: 'yearly',
    deadline: '2024-04-15',
    eligibility: {
      categories: ['SC', 'ST'],
      genders: ['Male', 'Female', 'Other'],
      minPercentage: 50,
      maxIncome: 250000,
      educationLevels: ['class10', 'class12', 'graduation', 'postGrad'],
      states: ['All'],
      disabilities: false,
      parentOccupations: ['farmer', 'daily_wage'],
    },
    requiredDocuments: ['aadhar', 'income', 'caste', 'marksheet'],
    applicationUrl: 'https://scholarships.gov.in',
    tags: ['sc-st', 'government', 'reserved'],
    featured: true,
  },
  {
    id: '3',
    title: 'INSPIRE Scholarship',
    titleHi: 'इंस्पायर छात्रवृत्ति',
    provider: 'Department of Science & Technology',
    providerHi: 'विज्ञान और प्रौद्योगिकी विभाग',
    providerType: 'government',
    description: 'For students pursuing science courses with exceptional academic performance.',
    descriptionHi: 'असाधारण शैक्षणिक प्रदर्शन के साथ विज्ञान पाठ्यक्रम करने वाले छात्रों के लिए।',
    amount: 80000,
    amountType: 'yearly',
    deadline: '2024-02-28',
    eligibility: {
      categories: ['SC', 'ST', 'OBC', 'General', 'EWS'],
      genders: ['Male', 'Female', 'Other'],
      minPercentage: 80,
      maxIncome: 1000000,
      educationLevels: ['graduation', 'postGrad', 'phd'],
      states: ['All'],
      disabilities: false,
      courseCategories: ['science', 'medical', 'engineering'],
    },
    requiredDocuments: ['aadhar', 'marksheet', 'admission-letter'],
    applicationUrl: 'https://online-inspire.gov.in',
    tags: ['science', 'merit', 'research'],
    featured: false,
  },
  {
    id: '4',
    title: 'HDFC Badhte Kadam',
    titleHi: 'एचडीएफसी बढ़ते कदम',
    provider: 'HDFC Bank',
    providerHi: 'एचडीएफसी बैंक',
    providerType: 'private',
    description: 'Scholarship to support high-performing students from underprivileged backgrounds.',
    descriptionHi: 'वंचित पृष्ठभूमि के उच्च प्रदर्शन वाले छात्रों का समर्थन करने के लिए छात्रवृत्ति।',
    amount: 100000,
    amountType: 'one-time',
    deadline: '2024-05-20',
    eligibility: {
      categories: ['SC', 'ST', 'OBC', 'General', 'EWS'],
      genders: ['Male', 'Female', 'Other'],
      minPercentage: 75,
      maxIncome: 600000,
      educationLevels: ['class10', 'class12', 'graduation'],
      states: ['All'],
      disabilities: false,
    },
    requiredDocuments: ['aadhar', 'income', 'marksheet', 'bank-passbook'],
    applicationUrl: 'https://www.hdfcbank.com/scholarship',
    tags: ['private', 'merit-cum-means', 'school'],
    featured: true,
  },
  {
    id: '5',
    title: 'Post-Matric Scholarship for Minorities',
    titleHi: 'अल्पसंख्यकों के लिए पोस्ट मैट्रिक छात्रवृत्ति',
    provider: 'Ministry of Minority Affairs',
    providerHi: 'अल्पसंख्यक मामलों के मंत्रालय',
    providerType: 'government',
    description: 'Scholarship scheme for meritorious students belonging to minority communities.',
    descriptionHi: 'अल्पसंख्यक समुदायों के मेधावी छात्रों के लिए छात्रवृत्ति योजना।',
    amount: 30000,
    amountType: 'yearly',
    deadline: '2024-10-31',
    eligibility: {
      categories: ['SC', 'ST', 'OBC', 'General', 'EWS'],
      genders: ['Male', 'Female', 'Other'],
      minPercentage: 50,
      maxIncome: 200000,
      educationLevels: ['class10', 'class12', 'graduation'],
      states: ['All'],
      disabilities: false,
      minorityStatuses: ['muslim', 'christian', 'sikh', 'buddhist', 'jain', 'parsi'],
    },
    requiredDocuments: ['aadhar', 'income', 'minority-certificate'],
    applicationUrl: 'https://scholarships.gov.in',
    tags: ['minority', 'government', 'school'],
    featured: false,
  },
];

export interface UserProfile {
  id?: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  category: 'SC' | 'ST' | 'OBC' | 'General' | 'EWS';
  minorityStatus?: string; // New
  state: string;
  district: string;
  hasDisability: boolean;
  isHosteller?: 'yes' | 'no'; // New ('yes' | 'no')
  educationLevel: 'class10' | 'class12' | 'graduation' | 'postGrad' | 'phd' | 'diploma'; // Expanded
  institution: string;
  institutionType?: string; // New
  course: string;
  courseCategory?: string; // New
  degreeType?: string; // New
  yearOfStudy: number;
  percentage: number;
  annualIncome: number;
  parentOccupation?: string; // New
  incomeCategory: 'BPL' | 'EWS' | 'General';
  documents: {
    aadhar?: { uploaded: boolean; verified: boolean };
    income?: { uploaded: boolean; verified: boolean };
    caste?: { uploaded: boolean; verified: boolean };
    marksheet?: { uploaded: boolean; verified: boolean };
  };
  profileComplete: boolean;
}

// OLD MATCHING LOGIC REMOVED - Now using advanced eligibility engine

/**
 * ADVANCED MATCHING ENGINE INTEGRATION
 * Uses two-phase matching: Hard Rejection + Weighted Scoring
 */

export const calculateMatchScore = (profile: UserProfile, scholarship: Scholarship): number => {
  // Convert legacy profile to enhanced profile
  const enhancedProfile: EnhancedUserProfile = {
    fullName: profile.fullName,
    dateOfBirth: profile.dateOfBirth,
    gender: profile.gender,
    category: profile.category,
    minorityStatus: profile.minorityStatus,
    state: profile.state,
    district: profile.district,
    hasDisability: profile.hasDisability,
    isHosteller: profile.isHosteller === 'yes',
    educationLevel: profile.educationLevel,
    institution: profile.institution,
    institutionType: profile.institutionType,
    course: profile.course,
    courseCategory: profile.courseCategory,
    degreeType: profile.degreeType,
    yearOfStudy: profile.yearOfStudy?.toString(), // Converted to string
    percentage: profile.percentage,
    annualIncome: profile.annualIncome,
    parentOccupation: profile.parentOccupation,
  };

  // Convert legacy eligibility to standardized format
  const standardizedEligibility: StandardizedEligibility = {
    hard: {
      categories: scholarship.eligibility.categories?.length ? scholarship.eligibility.categories : undefined,
      max_income: scholarship.eligibility.maxIncome || undefined,
      min_percentage: scholarship.eligibility.minPercentage || undefined,
      education_levels: scholarship.eligibility.educationLevels?.length ? scholarship.eligibility.educationLevels : undefined,
      genders: scholarship.eligibility.genders?.length ? scholarship.eligibility.genders : undefined,
      states: scholarship.eligibility.states?.length ? scholarship.eligibility.states : undefined,
      parent_occupations: scholarship.eligibility.parentOccupations?.length ? scholarship.eligibility.parentOccupations : undefined,
      minority_statuses: scholarship.eligibility.minorityStatuses?.length ? scholarship.eligibility.minorityStatuses : undefined,
      requires_hosteller: scholarship.eligibility.isHosteller || undefined,
    },
    soft: {
      course_categories: scholarship.eligibility.courseCategories?.length ? scholarship.eligibility.courseCategories : undefined,
      degree_types: scholarship.eligibility.degreeTypes?.length ? scholarship.eligibility.degreeTypes : undefined,
      institution_types: scholarship.eligibility.institutionTypes?.length ? scholarship.eligibility.institutionTypes : undefined,
    }
  };

  const result = matchScholarship(enhancedProfile, standardizedEligibility, scholarship.id);
  return result.matchScore;
};

export const getMatchReasons = (profile: UserProfile, scholarship: Scholarship): string[] => {
  const enhancedProfile: EnhancedUserProfile = {
    fullName: profile.fullName,
    dateOfBirth: profile.dateOfBirth,
    gender: profile.gender,
    category: profile.category,
    minorityStatus: profile.minorityStatus,
    state: profile.state,
    district: profile.district,
    hasDisability: profile.hasDisability,
    isHosteller: profile.isHosteller === 'yes',
    educationLevel: profile.educationLevel,
    institution: profile.institution,
    institutionType: profile.institutionType,
    course: profile.course,
    courseCategory: profile.courseCategory,
    degreeType: profile.degreeType,
    yearOfStudy: profile.yearOfStudy?.toString(), // Converted to string
    percentage: profile.percentage,
    annualIncome: profile.annualIncome,
    parentOccupation: profile.parentOccupation,
  };

  const standardizedEligibility: StandardizedEligibility = {
    hard: {
      categories: scholarship.eligibility.categories?.length ? scholarship.eligibility.categories : undefined,
      max_income: scholarship.eligibility.maxIncome || undefined,
      min_percentage: scholarship.eligibility.minPercentage || undefined,
      education_levels: scholarship.eligibility.educationLevels?.length ? scholarship.eligibility.educationLevels : undefined,
      genders: scholarship.eligibility.genders?.length ? scholarship.eligibility.genders : undefined,
      states: scholarship.eligibility.states?.length ? scholarship.eligibility.states : undefined,
      parent_occupations: scholarship.eligibility.parentOccupations?.length ? scholarship.eligibility.parentOccupations : undefined,
      minority_statuses: scholarship.eligibility.minorityStatuses?.length ? scholarship.eligibility.minorityStatuses : undefined,
      requires_hosteller: scholarship.eligibility.isHosteller || undefined,
    },
    soft: {
      course_categories: scholarship.eligibility.courseCategories?.length ? scholarship.eligibility.courseCategories : undefined,
      degree_types: scholarship.eligibility.degreeTypes?.length ? scholarship.eligibility.degreeTypes : undefined,
      institution_types: scholarship.eligibility.institutionTypes?.length ? scholarship.eligibility.institutionTypes : undefined,
    }
  };

  const result = matchScholarship(enhancedProfile, standardizedEligibility, scholarship.id);
  return result.matchReasons;
};

export const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];
