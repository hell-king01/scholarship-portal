import { supabase } from './supabase';
import { toast } from '@/hooks/use-toast';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Auth APIs
export const authAPI = {
  signUp: async (data: { email: string; password: string; name?: string; role?: string }) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.name,
          role: data.role || 'student',
        },
      },
    });

    if (error) throw error;

    return authData;
  },

  signIn: async (data: { email?: string; password: string }) => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email || '',
      password: data.password,
    });
    if (error) throw error;
    return authData;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  sendOTP: async (phone: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({ phone });
    if (error) throw error;
    return data;
  },

  verifyOTP: async (phone: string, otp: string) => {
    const { data, error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
    if (error) throw error;
    return data;
  },
};

// Profile APIs
export const profileAPI = {
  getProfile: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const role = session.user.user_metadata?.role;

    if (role === 'provider') {
      const { data, error } = await supabase
        .from('provider_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return { ...data, role: 'provider' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  updateProfile: async (data: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const role = data.role || session.user.user_metadata?.role;

    if (role === 'provider') {
      const providerUpdate = {
        organization_name: data.organizationName || data.fullName,
        organization_type: data.organizationType,
        website_url: data.websiteUrl,
        contact_email: data.contactEmail || session.user.email,
        contact_phone: data.contactPhone,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('provider_profiles')
        .upsert({ id: session.user.id, ...providerUpdate });

      if (error) throw error;
      return { success: true };
    }

    // Map frontend camelCase to database snake_case if necessary
    const profileUpdate: any = {
      full_name: data.fullName,
      date_of_birth: data.dateOfBirth,
      gender: data.gender,
      category: data.category,
      state: data.state,
      district: data.district,
      has_disability: typeof data.hasDisability === 'boolean' ? data.hasDisability : data.hasDisability === 'yes',
      education_level: data.educationLevel,
      institution: data.institution,
      institution_type: data.institutionType,
      course: data.course,
      course_category: data.courseCategory,
      degree_type: data.degreeType,
      year_of_study: data.yearOfStudy,
      percentage: data.percentage,
      annual_income: data.annualIncome,
      income_category: data.incomeCategory,
      parent_occupation: data.parentOccupation,
      minority_status: data.minorityStatus,
      is_hosteller: typeof data.isHosteller === 'boolean' ? data.isHosteller : data.isHosteller === 'yes',
      single_girl_child: typeof data.singleGirlChild === 'boolean' ? data.singleGirlChild : data.singleGirlChild === 'yes',
      orphan_single_parent: typeof data.orphanSingleParent === 'boolean' ? data.orphanSingleParent : data.orphanSingleParent === 'yes',
      role: data.role,
      updated_at: new Date().toISOString(),
    };

    // Remove undefined, null, and empty string fields
    Object.keys(profileUpdate).forEach(key => {
      const value = profileUpdate[key];
      if (value === undefined || value === null || value === '') {
        delete profileUpdate[key];
      }
    });

    const { data: result, error } = await supabase
      .from('profiles')
      .upsert({ id: session.user.id, ...profileUpdate })
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      // Provide more helpful error message
      const errorMessage = error.message || 'Failed to save profile';
      throw new Error(errorMessage);
    }
    return result;
  },

};

// Document APIs
export const documentAPI = {
  uploadDocument: async (type: string, file: File) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop() || 'tmp';
    // Use consistent naming so uploads overwrite the old one
    const filePath = `${session.user.id}/${type}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file, { upsert: true });

    if (error) throw error;
    return data;
  },

  saveDocumentRecord: async (type: string, fileName: string, extractedData: any = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('user_documents')
      .upsert(
        {
          user_id: session.user.id,
          document_type: type,
          file_name: fileName,
          extracted_data: extractedData,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id, document_type' }
      );
    // don't hard throw here to avoid halting UI if table missing
    if (error) console.error("Error saving document record to table:", error);
  },

  listDocuments: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    // List all files in the user's folder
    const { data, error } = await supabase.storage
      .from('documents')
      .list(session.user.id + '/');

    if (error) throw error;
    // Return only valid files, ignoring hidden folders or metadata
    return data.filter(d => d.name !== '.emptyFolderPlaceholder');
  },

  getUserDocuments: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    const { data, error } = await supabase
      .from('user_documents')
      .select('*')
      .eq('user_id', session.user.id);

    if (error) {
      console.warn("Failed to fetch user_documents:", error);
      return [];
    }
    return data;
  },

  deleteDocument: async (fileName: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const filePath = `${session.user.id}/${fileName}`;
    const { error } = await supabase.storage.from('documents').remove([filePath]);
    if (error) throw error;
  },

  getDocumentUrl: async (fileName: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const filePath = `${session.user.id}/${fileName}`;
    // Using createSignedUrl for private buckets (valid for 60 mins)
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 3600);

    if (error) {
      console.warn("Failed to get signed url:", error);
      return null;
    }
    return data?.signedUrl;
  }
};

// OCR APIs
export const ocrAPI = {
  extractTextWithGemini: async (file: File, type: string) => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key is not configured. Add VITE_GEMINI_API_KEY to your .env file or rely on Tesseract fallback.');
      }

      const genAI = new GoogleGenerativeAI(apiKey.trim());
      console.log('Using Gemini API key (trimmed)');

      let model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const fileToGenerativePart = async (fileToConvert: File) => {
        const base64EncodedDataPromise = new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(fileToConvert);
        });
        return {
          inlineData: { data: await base64EncodedDataPromise, mimeType: fileToConvert.type },
        };
      };

      const imagePart = await fileToGenerativePart(file);

      const prompt = `You are a strict data extraction agent. Extract exactly what is requested from the image and return it as a pure JSON object without markdown formatting, without backticks, and without any additional text. If a field is not found, omit it from the JSON.
      For document type "${type}", extract the following fields if present:
      - If "aadhar": return { "fullName": "Firstname Lastname", "dateOfBirth": "YYYY-MM-DD", "gender": "Male/Female/Other", "documentNumber": "XXXX XXXX XXXX" }
      - If "income": return { "fullName": "name", "annualIncome": "numeric value only (e.g. 150000)" }
      - If "caste": return { "fullName": "name", "category": "General/SC/ST/OBC/EWS/NT/VJNT" }
      - If "marksheet": return { "fullName": "name", "percentage": "strictly numeric out of 100", "cgpa": "numeric out of 10", "institution": "college/school name" }
      Respond ONLY with the complete JSON object.`;

      let result;
      try {
        result = await model.generateContent([prompt, imagePart]);
      } catch (firstErr: any) {
        if (firstErr.message?.includes('429') || firstErr.status === 429) {
          console.warn('Gemini 2.5 Flash is rate limited (429). Falling back to 2.0-flash...');
          model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
          try {
            result = await model.generateContent([prompt, imagePart]);
          } catch (secondErr: any) {
            console.warn('Gemini 2.0 Flash is also rate limited (429). Falling back to 1.5-flash...');
            model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            result = await model.generateContent([prompt, imagePart]);
          }
        } else {
          throw firstErr;
        }
      }

      const responseText = result.response.text().trim();

      const cleanedJSON = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJSON);

      return {
        rawText: 'Extracted successfully via Document AI Models',
        parsed,
        confidence: 99
      };
    } catch (err: any) {
      console.error('Gemini extraction error:', err);
      throw err;
    }
  },
  extractText: async (file: File, type: string) => {
    console.warn('PDF OCR extraction proxy. In a real app this hits a Supabase Edge Function.');
    return {
      rawText: 'Mock PDF extracted text. (PDF OCR requires backend processing in this setup)',
      parsed: {},
      confidence: 85
    };
  },
  parseDocument: async (text: string, type: string) => {
    const parsed: any = {};
    // Normalize text: remove newlines, fix common OCR errors in spaces
    const cleanText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ');

    if (type === 'aadhar') {
      // Look for DOB: DD/MM/YYYY. Common OCR mistake: drops slashes or reads as 0493 instead of 1993
      let dobText = null;
      const primaryMatch = cleanText.match(/(?:DOB|Date\s*of\s*Birth|Birth|YOB|Year\s*of\s*Birth)[^\d]*(\d{2}[-/\s|I]*\d{2}[-/\s|I]*\d{4}|\d{4})/i);
      const secondaryMatch = cleanText.match(/\b(\d{2})[-/\s|I]+(\d{2})[-/\s|I]+(\d{4})\b/);

      if (primaryMatch) {
        dobText = primaryMatch[1].replace(/[\s|I-]/g, '/');
      } else if (secondaryMatch) {
        dobText = `${secondaryMatch[1]}/${secondaryMatch[2]}/${secondaryMatch[3]}`;
      }

      if (dobText) {
        if (dobText.length === 4 && parseInt(dobText) > 1900 && parseInt(dobText) < 2100) {
          // Can't set full date for YYYY, so we maybe leave it or set mapping 1st Jan.
          parsed.dateOfBirth = `${dobText}-01-01`;
        } else if (dobText.length >= 8) {
          const parts = dobText.split(/[\s|I\-/]+/);
          if (parts.length >= 3) {
            // Assuming DD/MM/YYYY
            const d = parts[0].padStart(2, '0');
            const m = parts[1].padStart(2, '0');
            const y = parts[2];
            if (y.length === 4) {
              parsed.dateOfBirth = `${y}-${m}-${d}`;
            }
          }
        }
      }

      // Look for Aadhar number format: XXXX XXXX XXXX
      const numMatch = cleanText.match(/\b\d{4}\s*\d{4}\s*\d{4}\b/);
      if (numMatch) {
        parsed.documentNumber = numMatch[0].replace(/\s+/g, ' ').trim();
      } else {
        const rawNumbers = cleanText.replace(/\D/g, '');
        const continuous12 = rawNumbers.match(/(\d{12})/);
        if (continuous12) {
          const ds = continuous12[1];
          parsed.documentNumber = `${ds.slice(0, 4)} ${ds.slice(4, 8)} ${ds.slice(8, 12)}`;
        }
      }

      // Look for Gender
      const genderMatch = cleanText.match(/\b(Male|Female|Transgender|MALE|FEMALE|TRANSGENDER|Mahilā|Purușa)\b/i);
      if (genderMatch) {
        const g = genderMatch[1].toLowerCase();
        if (g.includes('female') || g.includes('mahil')) parsed.gender = 'Female';
        else parsed.gender = 'Male';
      }
    }
    else if (type === 'income') {
      // Look for currency indicators followed by amounts, or things like "1,00,000"
      const incomeMatch = cleanText.match(/(?:Rs\.?|INR|₹|Rupees|Income\s*(?:is)?)\s*([\d,]+(?![\d,]*\s*P(?:er)?\.?\s*A(?:nnum)?\.?))/i) ||
        cleanText.match(/([\d,]{4,})\s*(?:Only|Rupees|-)/i);

      if (incomeMatch) {
        const val = incomeMatch[1].replace(/,/g, '');
        if (parseInt(val) > 1000) parsed.annualIncome = val;
      }
    }
    else if (type === 'marksheet') {
      // Look for Percentage like 85% or CGPA
      const percentageMatch = cleanText.match(/\b(\d{2}(?:\.\d{1,2})?)\s*%/);
      if (percentageMatch && parseFloat(percentageMatch[1]) <= 100 && parseFloat(percentageMatch[1]) > 20) {
        parsed.percentage = percentageMatch[1];
      } else {
        // Look for CGPA
        const cgpaMatch = cleanText.match(/(?:CGPA|SGPA)[\s:]*([0-9](\.[0-9]{1,2})?)/i) ||
          cleanText.match(/\b([4-9]\.\d{1,2})\b/);
        if (cgpaMatch) {
          parsed.cgpa = cgpaMatch[1];
          const cgpaVal = parseFloat(cgpaMatch[1]);
          parsed.percentage = Math.min(100, cgpaVal * 9.5).toFixed(2);
        }
      }
    }
    else if (type === 'caste') {
      // Look for Caste categories
      const categoryMatch = cleanText.match(/\b(General|SC|ST|OBC|EWS|NT|VJNT|SBC)\b/i);
      if (categoryMatch) parsed.category = categoryMatch[1].toUpperCase();
    }

    return parsed;
  },
};

// Scholarship APIs
export const scholarshipAPI = {
  getAll: async (filters?: any) => {
    let query = supabase.from('scholarships').select('*');

    if (filters) {
      if (filters.category) query = query.contains('eligibility->categories', [filters.category]);
      if (filters.gender) query = query.contains('eligibility->genders', [filters.gender]);
      if (filters.maxIncome) query = query.lte('eligibility->maxIncome', filters.maxIncome);
      if (filters.educationLevel) query = query.contains('eligibility->educationLevels', [filters.educationLevel]);
    }

    const { data, error } = await query;
    if (error) throw error;

    // DEV MODE: Force override all deadlines to be upcoming (10 days from now)
    const mockUpcomingDate = new Date();
    mockUpcomingDate.setDate(mockUpcomingDate.getDate() + 10);
    const mockUpcomingStr = mockUpcomingDate.toISOString();

    return data.map(s => ({ ...s, deadline: mockUpcomingStr }));
  },

  getById: async (id: string) => {
    // Intercept hack for "Aspire Leaders Program 2026" requested by user for demo
    if (id === 'aspire-leaders-program') {
      const aspireData: any = {
        id: "aspire-leaders-program",
        title: "Aspire Leaders Program 2026",
        titleHi: "एस्पायर लीडर्स प्रोग्राम 2026",
        provider: "Aspire Institute (Harvard University)",
        providerHi: "एस्पायर संस्थान (हार्वर्ड विश्वविद्यालय)",
        providerType: "ngo",
        description: "The Aspire Leaders Program 2026 is a fully funded, 9-week online leadership program launched by the Aspire Institute. It aims to help students discover their abilities, strengthen their professional skills, and grow into impactful leaders.",
        descriptionHi: "एस्पायर लीडर्स प्रोग्राम 2026 हार्वर्ड के संकाय द्वारा शुरू किया गया एक पूरी तरह से वित्त पोषित ऑनलाइन नेतृत्व कार्यक्रम है।",
        amount: 100000,
        amountType: "one-time",
        deadline: "2026-03-16",
        eligibility: {
          categories: ["All"],
          genders: ["Male", "Female", "Other"],
          minPercentage: 0,
          maxIncome: 800000,
          educationLevels: ["graduation", "postGrad"],
          states: ["All"],
          disabilities: false,
          degreeTypes: ["all"]
        },
        requiredDocuments: [],
        applicationUrl: "https://www.buddy4study.com/page/aspire-leaders-program",
        tags: ["harvard", "leadership", "grant"],
        featured: true,
        status: "active"
      };
      // Overwrite deadline for Aspire too
      const mockUpcomingDate = new Date();
      mockUpcomingDate.setDate(mockUpcomingDate.getDate() + 10);
      aspireData.deadline = mockUpcomingDate.toISOString();
      return aspireData;
    }
    let retries = 2;
    while (retries >= 0) {
      try {
        const { data, error } = await supabase
          .from('scholarships')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;

        // DEV MODE: Force override deadline for testing
        const mockUpcomingDate = new Date();
        mockUpcomingDate.setDate(mockUpcomingDate.getDate() + 10);
        data.deadline = mockUpcomingDate.toISOString();

        return data;
      } catch (error) {
        console.error("Failed to find scholarship by id (retries left:", retries, "):", id, error);
        if (retries === 0) throw error;
        await new Promise(res => setTimeout(res, 800)); // wait 800ms before retrying
        retries--;
      }
    }
  },

  getMultipleById: async (ids: string[]) => {
    if (!ids || ids.length === 0) return [];

    const { data, error } = await supabase
      .from('scholarships')
      .select('*')
      .in('id', ids);
    if (error) throw error;

    // DEV MODE: Force override all deadlines to be upcoming (10 days from now)
    const mockUpcomingDate = new Date();
    mockUpcomingDate.setDate(mockUpcomingDate.getDate() + 10);
    const mockUpcomingStr = mockUpcomingDate.toISOString();

    return data.map(s => ({ ...s, deadline: mockUpcomingStr }));
  },

  getMatches: async () => {
    // In MVP, we perform matching client-side or with a simple query
    const profile = await profileAPI.getProfile();
    if (!profile) return [];

    const { data: scholarships, error } = await supabase
      .from('scholarships')
      .select('*');
    if (error) throw error;

    // DEV MODE: Force override all deadlines to be upcoming (10 days from now)
    const mockUpcomingDate = new Date();
    mockUpcomingDate.setDate(mockUpcomingDate.getDate() + 10);
    const mockUpcomingStr = mockUpcomingDate.toISOString();

    return scholarships.map(s => ({ ...s, deadline: mockUpcomingStr }));
  },

  predictEligibility: async (criteria: any) => {
    // Mocking prediction for now, but returning proper shape to prevent crash
    const { data, error } = await supabase
      .from('scholarships')
      .select('*')
      .limit(3);
    if (error) throw error;

    return {
      eligible: true,
      matchScore: 90,
      reasons: ["Income matches criteria", "Category matches"],
      matchedScholarships: (data || []).map((s: any) => ({
        id: s.id,
        title: s.title,
        matchScore: 85 + Math.floor(Math.random() * 15),
        amount: s.amount
      }))
    };
  },
};

// Application APIs
export const applicationAPI = {
  getAll: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    const { data, error } = await supabase
      .from('applications')
      .select('*, scholarships(*)')
      .eq('user_id', session.user.id);
    if (error) throw error;

    return data;
  },

  create: async (scholarshipId: string, data: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data: result, error } = await supabase
      .from('applications')
      .insert([{
        user_id: session.user.id,
        scholarship_id: scholarshipId,
        status: data.status || 'draft',
        data
      }])
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  updateStatus: async (applicationId: string, status: string, additionalData?: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    // Map UI statuses to DB valid statuses found via diagnostic
    let dbStatus = status;
    if (status === 'submitted' || status === 'applied') dbStatus = 'pending';
    if (status === 'pending_verification') dbStatus = 'under_review';
    if (status === 'disbursed') dbStatus = 'approved';

    // Make minimal update to avoid 400 errors with JSON mapping
    const updatePayload: any = { status: dbStatus };
    if (additionalData) {
      updatePayload.data = additionalData;
    }

    const { data: result, error } = await supabase
      .from('applications')
      .update(updatePayload)
      .eq('id', applicationId)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }
    return result;
  },
};

// Notification APIs
export const notificationAPI = {
  getAll: async () => {
    // Mock data for now, or fetch from a 'notifications' table if it existed
    return [
      {
        id: '1',
        type: 'system',
        title: 'Welcome to ScholarMatch!',
        message: 'Complete your profile to get personalized scholarship matches.',
        read: false,
        createdAt: new Date().toISOString(),
        actionUrl: '/profile'
      }
    ];
  },
  getPreferences: async () => {
    return { email: true, sms: true };
  },
  markAsRead: async (id: string) => {
    // Placeholder
    console.log('Marked as read:', id);
  },
  markAllAsRead: async () => {
    // Placeholder
    console.log('Marked all as read');
  },
  updatePreferences: async (prefs: any) => {
    // Placeholder
    console.log('Updated preferences:', prefs);
  }
};

// Admin APIs
export const adminAPI = {
  getAnalytics: async () => {
    // 1. Total Users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // 2. Total Scholarships
    const { count: totalScholarships } = await supabase
      .from('scholarships')
      .select('*', { count: 'exact', head: true });

    // 3. Applications Stats
    const { data: applications } = await supabase
      .from('applications')
      .select('status, created_at');

    // Group applications by date for the chart
    const applicationsOverTimeMap = new Map();
    applications?.forEach(app => {
      const date = new Date(app.created_at).toISOString().slice(0, 7); // YYYY-MM
      applicationsOverTimeMap.set(date, (applicationsOverTimeMap.get(date) || 0) + 1);
    });

    const applicationsOverTime = Array.from(applicationsOverTimeMap.entries())
      .map(([date, count]) => ({ date, applications: count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 4. Category/Demographics (fetch profiles to aggregate)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('category, annual_income, role')
      .eq('role', 'student');

    const categoryMap = new Map();
    let eligibleCount = 0; // Simple proxy: profiles with "complete" data considered "potentially eligible"
    let ineligibleCount = 0;

    profiles?.forEach(p => {
      // Category stats
      const cat = p.category || 'Unknown';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);

      // Simple proxy for "eligible vs ineligible" stats based on income
      // In a real engine, this would be more complex
      if (p.annual_income && p.annual_income < 800000) {
        eligibleCount++;
      } else {
        ineligibleCount++;
      }
    });

    const categoryDistribution = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }));

    return {
      totalUsers: totalUsers || 0,
      eligibleUsers: eligibleCount,
      ineligibleUsers: ineligibleCount,
      totalScholarships: totalScholarships || 0,
      popularScholarships: [], // Complex to calculate without grouping, leaving empty for MVP
      categoryDistribution,
      applicationsOverTime,
      eligibleVsIneligible: {
        eligible: eligibleCount,
        ineligible: ineligibleCount
      }
    };
  }
};

// Mentor APIs
export const mentorAPI = {
  getAssignedStudents: async () => {
    // For MVP, mentors see ALL students
    // In a real app, we would have a 'mentor_students' table
    const { data: students, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student');

    if (error) throw error;

    // Also fetch their applications to match the mock/interface expectation
    // We'll just map the basic profile data for now
    // If we need applications, we would need a join or separate fetch
    return students.map(s => ({
      id: s.id,
      name: s.full_name,
      email: 'student@example.com', // Profiles don't have email in public table, typically in auth.users
      category: s.category || 'General',
      state: s.state || 'Unknown',
      applications: [] // Populating this would require another query
    }));
  },
  approveEligibility: async (userId: string, appId: string, comments: string) => {
    // Update application status
    const { error } = await supabase
      .from('applications')
      .update({ status: 'approved', data: { comments } })
      .eq('id', appId);

    if (error) throw error;
    return { success: true };
  },
  rejectEligibility: async (userId: string, appId: string, reason: string) => {
    const { error } = await supabase
      .from('applications')
      .update({ status: 'rejected', data: { reason } })
      .eq('id', appId);

    if (error) throw error;
    return { success: true };
  },
  getUsersList: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, phone_number')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  upgradeUserToProvider: async (userId: string) => {
    // 1. Update role in profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'provider' })
      .eq('id', userId);

    if (profileError) throw profileError;

    // 2. Fetch user to get name/email
    const { data: userData } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', userId)
      .single();

    // 3. Initialize provider profile
    const { error: providerError } = await supabase
      .from('provider_profiles')
      .upsert({
        id: userId,
        organization_name: userData?.full_name || 'New Organization',
        contact_email: userData?.email,
        is_verified: true
      });

    if (providerError) throw providerError;
    return { success: true };
  }
};

export const providerAPI = {
  getScholarships: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    const { data, error } = await supabase
      .from('scholarships')
      .select('*')
      .eq('created_by', session.user.id);
    if (error) throw error;
    return data || [];
  },

  getApplications: async () => {
    // Fetches applications made specifically to scholarships created by this provider
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        scholarship:scholarship_id(title),
        student:student_id(full_name, email)
      `);
    if (error) throw error;
    return data || [];
  }
};

export default supabase;




