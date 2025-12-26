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
    description: 'A prestigious scholarship for meritorious students from economically weaker sections pursuing higher education.',
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
      minPercentage: 85,
      maxIncome: 600000,
      educationLevels: ['graduation'],
      states: ['All'],
      disabilities: false,
    },
    requiredDocuments: ['aadhar', 'marksheet'],
    applicationUrl: 'https://online-inspire.gov.in',
    tags: ['science', 'government', 'merit'],
    featured: true,
  },
  {
    id: '4',
    title: 'Tata Trust Education Scholarship',
    titleHi: 'टाटा ट्रस्ट शिक्षा छात्रवृत्ति',
    provider: 'Tata Trusts',
    providerHi: 'टाटा ट्रस्ट',
    providerType: 'private',
    description: 'Supporting bright students from underprivileged backgrounds to pursue quality education.',
    descriptionHi: 'वंचित पृष्ठभूमि के प्रतिभाशाली छात्रों को गुणवत्तापूर्ण शिक्षा प्राप्त करने में सहायता।',
    amount: 75000,
    amountType: 'yearly',
    deadline: '2024-05-01',
    eligibility: {
      categories: ['SC', 'ST', 'OBC', 'General', 'EWS'],
      genders: ['Male', 'Female', 'Other'],
      minPercentage: 70,
      maxIncome: 400000,
      educationLevels: ['graduation', 'postGrad'],
      states: ['All'],
      disabilities: false,
    },
    requiredDocuments: ['aadhar', 'income', 'marksheet'],
    applicationUrl: 'https://tatatrusts.org',
    tags: ['private', 'corporate', 'higher-education'],
    featured: false,
  },
  {
    id: '5',
    title: 'Pragati Scholarship for Girls',
    titleHi: 'लड़कियों के लिए प्रगति छात्रवृत्ति',
    provider: 'AICTE',
    providerHi: 'एआईसीटीई',
    providerType: 'government',
    description: 'Empowering girl students to pursue technical education and break barriers.',
    descriptionHi: 'लड़कियों को तकनीकी शिक्षा प्राप्त करने और बाधाओं को तोड़ने के लिए सशक्त बनाना।',
    amount: 50000,
    amountType: 'yearly',
    deadline: '2024-03-15',
    eligibility: {
      categories: ['SC', 'ST', 'OBC', 'General', 'EWS'],
      genders: ['Female'],
      minPercentage: 60,
      maxIncome: 800000,
      educationLevels: ['graduation'],
      states: ['All'],
      disabilities: false,
    },
    requiredDocuments: ['aadhar', 'income', 'marksheet'],
    applicationUrl: 'https://aicte-pragati-saksham.gov.in',
    tags: ['girls', 'government', 'technical'],
    featured: true,
  },
  {
    id: '6',
    title: 'PM Scholarship for Differently Abled',
    titleHi: 'दिव्यांगों के लिए पीएम छात्रवृत्ति',
    provider: 'Ministry of Social Justice',
    providerHi: 'सामाजिक न्याय मंत्रालय',
    providerType: 'government',
    description: 'Special scholarship for students with disabilities to pursue their educational dreams.',
    descriptionHi: 'विकलांग छात्रों के लिए अपने शैक्षिक सपनों को पूरा करने के लिए विशेष छात्रवृत्ति।',
    amount: 40000,
    amountType: 'yearly',
    deadline: '2024-04-30',
    eligibility: {
      categories: ['SC', 'ST', 'OBC', 'General', 'EWS'],
      genders: ['Male', 'Female', 'Other'],
      minPercentage: 40,
      maxIncome: 500000,
      educationLevels: ['class10', 'class12', 'graduation', 'postGrad'],
      states: ['All'],
      disabilities: true,
    },
    requiredDocuments: ['aadhar', 'income', 'marksheet'],
    applicationUrl: 'https://scholarships.gov.in',
    tags: ['disability', 'government', 'special'],
    featured: false,
  },
  {
    id: '7',
    title: 'Foundation for Excellence Scholarship',
    titleHi: 'उत्कृष्टता के लिए फाउंडेशन छात्रवृत्ति',
    provider: 'FFE India',
    providerHi: 'एफएफई इंडिया',
    providerType: 'ngo',
    description: 'Supporting first-generation learners from low-income families to achieve academic excellence.',
    descriptionHi: 'कम आय वाले परिवारों के प्रथम पीढ़ी के शिक्षार्थियों को शैक्षणिक उत्कृष्टता प्राप्त करने में सहायता।',
    amount: 60000,
    amountType: 'yearly',
    deadline: '2024-06-30',
    eligibility: {
      categories: ['SC', 'ST', 'OBC', 'General', 'EWS'],
      genders: ['Male', 'Female', 'Other'],
      minPercentage: 75,
      maxIncome: 300000,
      educationLevels: ['graduation'],
      states: ['All'],
      disabilities: false,
    },
    requiredDocuments: ['aadhar', 'income', 'marksheet'],
    applicationUrl: 'https://ffe.org',
    tags: ['ngo', 'first-generation', 'merit'],
    featured: false,
  },
  {
    id: '8',
    title: 'OBC Pre-Matric Scholarship',
    titleHi: 'ओबीसी प्री-मैट्रिक छात्रवृत्ति',
    provider: 'Ministry of Social Justice',
    providerHi: 'सामाजिक न्याय मंत्रालय',
    providerType: 'government',
    description: 'Supporting OBC students in classes 1-10 to continue their education.',
    descriptionHi: 'कक्षा 1-10 में ओबीसी छात्रों को उनकी शिक्षा जारी रखने में सहायता।',
    amount: 12000,
    amountType: 'yearly',
    deadline: '2024-03-20',
    eligibility: {
      categories: ['OBC'],
      genders: ['Male', 'Female', 'Other'],
      minPercentage: 50,
      maxIncome: 250000,
      educationLevels: ['class10'],
      states: ['All'],
      disabilities: false,
    },
    requiredDocuments: ['aadhar', 'income', 'caste', 'marksheet'],
    applicationUrl: 'https://scholarships.gov.in',
    tags: ['obc', 'government', 'pre-matric'],
    featured: false,
  },
];

export interface UserProfile {
  id?: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  category: 'SC' | 'ST' | 'OBC' | 'General' | 'EWS';
  state: string;
  district: string;
  hasDisability: boolean;
  educationLevel: 'class10' | 'class12' | 'graduation' | 'postGrad';
  institution: string;
  course: string;
  yearOfStudy: number;
  percentage: number;
  annualIncome: number;
  incomeCategory: 'BPL' | 'EWS' | 'General';
  documents: {
    aadhar?: { uploaded: boolean; verified: boolean };
    income?: { uploaded: boolean; verified: boolean };
    caste?: { uploaded: boolean; verified: boolean };
    marksheet?: { uploaded: boolean; verified: boolean };
  };
  profileComplete: boolean;
}

export const calculateMatchScore = (profile: UserProfile, scholarship: Scholarship): number => {
  let score = 0;
  let totalWeight = 0;

  // Income eligibility (30% weight)
  const incomeWeight = 30;
  totalWeight += incomeWeight;
  if (profile.annualIncome <= scholarship.eligibility.maxIncome) {
    score += incomeWeight;
  }

  // Category match (20% weight)
  const categoryWeight = 20;
  totalWeight += categoryWeight;
  if (scholarship.eligibility.categories.includes(profile.category)) {
    score += categoryWeight;
  }

  // Education level (15% weight)
  const eduWeight = 15;
  totalWeight += eduWeight;
  if (scholarship.eligibility.educationLevels.includes(profile.educationLevel)) {
    score += eduWeight;
  }

  // Academic performance (15% weight)
  const academicWeight = 15;
  totalWeight += academicWeight;
  if (profile.percentage >= scholarship.eligibility.minPercentage) {
    score += academicWeight;
  }

  // State eligibility (10% weight)
  const stateWeight = 10;
  totalWeight += stateWeight;
  if (scholarship.eligibility.states.includes('All') || scholarship.eligibility.states.includes(profile.state)) {
    score += stateWeight;
  }

  // Gender match (5% weight)
  const genderWeight = 5;
  totalWeight += genderWeight;
  if (scholarship.eligibility.genders.includes(profile.gender)) {
    score += genderWeight;
  }

  // Disability match (5% weight)
  const disabilityWeight = 5;
  totalWeight += disabilityWeight;
  if (!scholarship.eligibility.disabilities || profile.hasDisability === scholarship.eligibility.disabilities) {
    score += disabilityWeight;
  }

  return Math.round((score / totalWeight) * 100);
};

export const getMatchReasons = (profile: UserProfile, scholarship: Scholarship): string[] => {
  const reasons: string[] = [];

  if (profile.annualIncome <= scholarship.eligibility.maxIncome) {
    reasons.push('Your income qualifies');
  }
  if (scholarship.eligibility.categories.includes(profile.category)) {
    reasons.push(`Your category (${profile.category}) is eligible`);
  }
  if (scholarship.eligibility.educationLevels.includes(profile.educationLevel)) {
    reasons.push('Your education level matches');
  }
  if (profile.percentage >= scholarship.eligibility.minPercentage) {
    reasons.push(`Your marks (${profile.percentage}%) meet the minimum`);
  }
  if (scholarship.eligibility.genders.includes(profile.gender)) {
    reasons.push('Gender requirement met');
  }

  return reasons;
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
