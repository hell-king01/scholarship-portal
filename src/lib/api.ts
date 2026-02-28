import { supabase } from './supabase';
import { toast } from '@/hooks/use-toast';

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

  uploadDocument: async (type: string, file: File) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const filePath = `${session.user.id}/${type}_${Date.now()}`;
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (error) throw error;
    return data;
  },
};

// OCR APIs (Keep as placeholders or integrate with a function)
export const ocrAPI = {
  extractText: async (file: File, type: string) => {
    // This would typically call a Supabase Edge Function or external service
    console.log('OCR extraction not yet implemented with Supabase');
    return { text: '', type };
  },
  parseDocument: async (text: string, type: string) => {
    return { parsed: {}, type };
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
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('scholarships')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  getMatches: async () => {
    // In MVP, we perform matching client-side or with a simple query
    const profile = await profileAPI.getProfile();
    if (!profile) return [];

    const { data: scholarships, error } = await supabase
      .from('scholarships')
      .select('*');
    if (error) throw error;

    // We'll return all and let the client score them based on profile
    return scholarships;
  },

  predictEligibility: async (criteria: any) => {
    // Mocking prediction for now, or just returning matches
    const { data, error } = await supabase
      .from('scholarships')
      .select('*');
    if (error) throw error;
    return { eligible: true, matches: data };
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
        status: 'draft',
        data
      }])
      .select()
      .single();
    if (error) throw error;
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
  }
};

export default supabase;




