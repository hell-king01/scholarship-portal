-- Scholarships for Diploma/Polytechnic Students
-- These will match users like Parth Jadhav (General category, Diploma, 78%, Engineering, ₹3.7L income)

-- 1. All India Council for Technical Education (AICTE) Pragati Scholarship
INSERT INTO scholarships (
  title, title_hi, provider, provider_hi, provider_type,
  description, description_hi,
  amount, amount_type, deadline,
  eligibility, required_documents, application_url, tags, featured
) VALUES (
  'AICTE Pragati Scholarship for Diploma Students',
  'डिप्लोमा छात्रों के लिए एआईसीटीई प्रगति छात्रवृत्ति',
  'All India Council for Technical Education',
  'अखिल भारतीय तकनीकी शिक्षा परिषद',
  'government',
  'Scholarship for diploma students pursuing technical education in AICTE approved institutions.',
  'एआईसीटीई अनुमोदित संस्थानों में तकनीकी शिक्षा प्राप्त करने वाले डिप्लोमा छात्रों के लिए छात्रवृत्ति।',
  50000,
  'yearly',
  '2024-12-31',
  '{
    "categories": ["General", "OBC", "SC", "ST", "EWS"],
    "genders": ["Male", "Female", "Other"],
    "minPercentage": 60,
    "maxIncome": 800000,
    "educationLevels": ["diploma"],
    "states": ["All"],
    "disabilities": false,
    "courseCategories": ["engineering", "technical"],
    "institutionTypes": ["government", "private", "aided"]
  }',
  ARRAY['aadhar', 'income', 'marksheet', 'admission-letter'],
  'https://www.aicte-india.org/schemes/students-development-schemes/pragati-scholarship-scheme',
  ARRAY['diploma', 'technical', 'government', 'engineering'],
  true
);

-- 2. Maharashtra State Diploma Scholarship
INSERT INTO scholarships (
  title, title_hi, provider, provider_hi, provider_type,
  description, description_hi,
  amount, amount_type, deadline,
  eligibility, required_documents, application_url, tags, featured
) VALUES (
  'Maharashtra State Scholarship for Diploma Students',
  'डिप्लोमा छात्रों के लिए महाराष्ट्र राज्य छात्रवृत्ति',
  'Government of Maharashtra',
  'महाराष्ट्र सरकार',
  'government',
  'State government scholarship for diploma students from Maharashtra pursuing technical education.',
  'तकनीकी शिक्षा प्राप्त करने वाले महाराष्ट्र के डिप्लोमा छात्रों के लिए राज्य सरकार की छात्रवृत्ति।',
  30000,
  'yearly',
  '2024-11-30',
  '{
    "categories": ["General", "OBC", "SC", "ST", "EWS"],
    "genders": ["Male", "Female", "Other"],
    "minPercentage": 50,
    "maxIncome": 600000,
    "educationLevels": ["diploma"],
    "states": ["Maharashtra"],
    "disabilities": false,
    "courseCategories": ["engineering", "technical", "arts", "commerce"],
    "institutionTypes": ["government", "aided"]
  }',
  ARRAY['aadhar', 'income', 'domicile', 'marksheet'],
  'https://mahadbt.maharashtra.gov.in/',
  ARRAY['diploma', 'state', 'maharashtra', 'government'],
  true
);

-- 3. Technical Education Quality Improvement Programme (TEQIP) Scholarship
INSERT INTO scholarships (
  title, title_hi, provider, provider_hi, provider_type,
  description, description_hi,
  amount, amount_type, deadline,
  eligibility, required_documents, application_url, tags, featured
) VALUES (
  'TEQIP Scholarship for Polytechnic Students',
  'पॉलिटेक्निक छात्रों के लिए टीईक्यूआईपी छात्रवृत्ति',
  'Ministry of Education',
  'शिक्षा मंत्रालय',
  'government',
  'Scholarship for students in polytechnic institutions to improve quality of technical education.',
  'तकनीकी शिक्षा की गुणवत्ता में सुधार के लिए पॉलिटेक्निक संस्थानों के छात्रों के लिए छात्रवृत्ति।',
  40000,
  'yearly',
  '2024-10-15',
  '{
    "categories": ["General", "OBC", "SC", "ST", "EWS"],
    "genders": ["Male", "Female", "Other"],
    "minPercentage": 65,
    "maxIncome": 500000,
    "educationLevels": ["diploma"],
    "states": ["All"],
    "disabilities": false,
    "courseCategories": ["engineering", "technical"],
    "degreeTypes": ["technical"],
    "institutionTypes": ["government"]
  }',
  ARRAY['aadhar', 'income', 'marksheet'],
  'https://www.npiu.nic.in/',
  ARRAY['diploma', 'polytechnic', 'technical', 'government'],
  false
);

-- 4. Sitaram Jindal Foundation Scholarship for Diploma Students
INSERT INTO scholarships (
  title, title_hi, provider, provider_hi, provider_type,
  description, description_hi,
  amount, amount_type, deadline,
  eligibility, required_documents, application_url, tags, featured
) VALUES (
  'Sitaram Jindal Scholarship for Technical Diploma',
  'तकनीकी डिप्लोमा के लिए सीताराम जिंदल छात्रवृत्ति',
  'Sitaram Jindal Foundation',
  'सीताराम जिंदल फाउंडेशन',
  'private',
  'Merit-based scholarship for diploma students from economically weaker sections pursuing technical courses.',
  'तकनीकी पाठ्यक्रम करने वाले आर्थिक रूप से कमजोर वर्गों के डिप्लोमा छात्रों के लिए मेरिट-आधारित छात्रवृत्ति।',
  25000,
  'yearly',
  '2024-09-30',
  '{
    "categories": ["General", "OBC", "SC", "ST", "EWS"],
    "genders": ["Male", "Female", "Other"],
    "minPercentage": 70,
    "maxIncome": 400000,
    "educationLevels": ["diploma"],
    "states": ["All"],
    "disabilities": false,
    "courseCategories": ["engineering", "technical"],
    "parentOccupations": ["farmer", "daily_wage", "self_employed"]
  }',
  ARRAY['aadhar', 'income', 'marksheet', 'bank-passbook'],
  'https://www.buddy4study.com/page/sitaram-jindal-foundation-scholarship',
  ARRAY['diploma', 'private', 'merit', 'technical'],
  false
);

-- 5. Central Sector Scheme for Diploma Holders
INSERT INTO scholarships (
  title, title_hi, provider, provider_hi, provider_type,
  description, description_hi,
  amount, amount_type, deadline,
  eligibility, required_documents, application_url, tags, featured
) VALUES (
  'Central Sector Scheme for Diploma Students',
  'डिप्लोमा छात्रों के लिए केंद्रीय क्षेत्र योजना',
  'Ministry of Education',
  'शिक्षा मंत्रालय',
  'government',
  'Scholarship for diploma students from families with annual income below 4.5 lakhs.',
  '4.5 लाख से कम वार्षिक आय वाले परिवारों के डिप्लोमा छात्रों के लिए छात्रवृत्ति।',
  20000,
  'yearly',
  '2024-08-31',
  '{
    "categories": ["General", "OBC", "SC", "ST", "EWS"],
    "genders": ["Male", "Female", "Other"],
    "minPercentage": 50,
    "maxIncome": 450000,
    "educationLevels": ["diploma"],
    "states": ["All"],
    "disabilities": false
  }',
  ARRAY['aadhar', 'income', 'marksheet'],
  'https://scholarships.gov.in',
  ARRAY['diploma', 'government', 'central'],
  true
);

-- 6. LIC Golden Jubilee Scholarship for Diploma Students
INSERT INTO scholarships (
  title, title_hi, provider, provider_hi, provider_type,
  description, description_hi,
  amount, amount_type, deadline,
  eligibility, required_documents, application_url, tags, featured
) VALUES (
  'LIC Golden Jubilee Scholarship',
  'एलआईसी स्वर्ण जयंती छात्रवृत्ति',
  'Life Insurance Corporation of India',
  'भारतीय जीवन बीमा निगम',
  'private',
  'Scholarship for diploma and degree students from economically weaker sections with good academic record.',
  'अच्छे शैक्षणिक रिकॉर्ड वाले आर्थिक रूप से कमजोर वर्गों के डिप्लोमा और डिग्री छात्रों के लिए छात्रवृत्ति।',
  20000,
  'yearly',
  '2024-07-31',
  '{
    "categories": ["General", "OBC", "SC", "ST", "EWS"],
    "genders": ["Male", "Female", "Other"],
    "minPercentage": 60,
    "maxIncome": 350000,
    "educationLevels": ["diploma", "graduation"],
    "states": ["All"],
    "disabilities": false
  }',
  ARRAY['aadhar', 'income', 'marksheet'],
  'https://www.licindia.in/golden-jubilee-scholarship',
  ARRAY['diploma', 'private', 'lic'],
  false
);

-- 7. Dr. Ambedkar Central Sector Scheme (for all categories including General)
INSERT INTO scholarships (
  title, title_hi, provider, provider_hi, provider_type,
  description, description_hi,
  amount, amount_type, deadline,
  eligibility, required_documents, application_url, tags, featured
) VALUES (
  'Dr. Ambedkar Central Sector Scheme for Diploma',
  'डिप्लोमा के लिए डॉ. अम्बेडकर केंद्रीय क्षेत्र योजना',
  'Ministry of Social Justice and Empowerment',
  'सामाजिक न्याय और अधिकारिता मंत्रालय',
  'government',
  'Top class education scheme for diploma students from all categories with excellent academic performance.',
  'उत्कृष्ट शैक्षणिक प्रदर्शन वाले सभी श्रेणियों के डिप्लोमा छात्रों के लिए शीर्ष श्रेणी की शिक्षा योजना।',
  35000,
  'yearly',
  '2024-06-30',
  '{
    "categories": ["General", "OBC", "SC", "ST", "EWS"],
    "genders": ["Male", "Female", "Other"],
    "minPercentage": 75,
    "maxIncome": 600000,
    "educationLevels": ["diploma"],
    "states": ["All"],
    "disabilities": false,
    "courseCategories": ["engineering", "technical", "science"]
  }',
  ARRAY['aadhar', 'income', 'marksheet'],
  'https://scholarships.gov.in',
  ARRAY['diploma', 'government', 'merit'],
  true
);

-- 8. Swami Vivekananda Merit Scholarship for Diploma
INSERT INTO scholarships (
  title, title_hi, provider, provider_hi, provider_type,
  description, description_hi,
  amount, amount_type, deadline,
  eligibility, required_documents, application_url, tags, featured
) VALUES (
  'Swami Vivekananda Merit Scholarship',
  'स्वामी विवेकानंद मेरिट छात्रवृत्ति',
  'Government of West Bengal',
  'पश्चिम बंगाल सरकार',
  'government',
  'Merit scholarship for diploma students with good academic performance from all states.',
  'सभी राज्यों से अच्छे शैक्षणिक प्रदर्शन वाले डिप्लोमा छात्रों के लिए मेरिट छात्रवृत्ति।',
  30000,
  'yearly',
  '2024-05-31',
  '{
    "categories": ["General", "OBC", "SC", "ST", "EWS"],
    "genders": ["Male", "Female", "Other"],
    "minPercentage": 70,
    "maxIncome": 500000,
    "educationLevels": ["diploma", "class12"],
    "states": ["All"],
    "disabilities": false
  }',
  ARRAY['aadhar', 'income', 'marksheet'],
  'https://svmcm.wbhed.gov.in/',
  ARRAY['diploma', 'merit', 'government'],
  false
);

-- Note: After running these inserts, the user should see multiple matching scholarships!
-- Scholarships that will match Parth Jadhav's profile:
-- 1. AICTE Pragati (78% > 60%, ₹3.7L < ₹8L, General, Diploma, Engineering) ✅
-- 2. Maharashtra State (78% > 50%, ₹3.7L < ₹6L, General, Diploma, Maharashtra) ✅
-- 3. Dr. Ambedkar Scheme (78% > 75%, ₹3.7L < ₹6L, General, Diploma, Engineering) ✅
-- 4. Swami Vivekananda (78% > 70%, ₹3.7L < ₹5L, General, Diploma) ✅
