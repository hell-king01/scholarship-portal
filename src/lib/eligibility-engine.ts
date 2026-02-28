/**
 * Advanced Eligibility Engine for Indian Scholarship Matching
 * 
 * This implements a two-phase matching system:
 * Phase A: Hard Rejection (NSP-style strict filtering)
 * Phase B: Weighted Scoring (confidence-based ranking)
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface StandardizedEligibility {
    hard: {
        categories?: string[];           // SC, ST, OBC, EWS, General
        max_income?: number;              // Annual family income ceiling
        min_percentage?: number;          // Minimum academic percentage
        education_levels?: string[];      // class10, class12, graduation, postGrad
        genders?: string[];               // Male, Female, Other
        states?: string[];                // State restrictions
        parent_occupations?: string[];    // farmer, daily_wage, govt_employee, etc.
        minority_statuses?: string[];     // muslim, christian, sikh, buddhist, jain
        requires_hosteller?: boolean;     // Must be hostel resident
        has_disability?: boolean;         // Disability requirement
    };
    soft: {
        course_categories?: string[];     // engineering, medical, arts, science, commerce
        degree_types?: string[];          // professional, technical, general
        institution_types?: string[];     // government, private, aided
        preferred_districts?: string[];   // Bonus for specific districts
    };
}

export interface EnhancedUserProfile {
    // Core fields (Level 1 - Always present)
    fullName: string;
    dateOfBirth?: string;
    gender: string;
    category: string;
    state: string;
    district?: string;
    hasDisability?: boolean;
    educationLevel: string;
    institution?: string;
    course?: string;
    yearOfStudy?: string;
    percentage?: number;
    annualIncome: number;

    // Enhanced fields (Level 2 - Optional boosters)
    parentOccupation?: string;
    minorityStatus?: string;
    isHosteller?: boolean;

    // Precision fields (Level 3 - Advanced)
    degreeType?: string;
    courseCategory?: string;
    institutionType?: string;
}

export interface MatchResult {
    scholarshipId: string;
    matchScore: number;
    confidenceLevel: 'high' | 'medium' | 'low';
    passedHardCriteria: boolean;
    matchReasons: string[];
    rejectionReasons: string[];
    missingDataWarnings: string[];
    eligibilityBreakdown: {
        hardCriteriaScore: number;
        softCriteriaScore: number;
        incomeProximity: number;
        academicScore: number;
    };
}

// ============================================================================
// CONSTANTS & ENUMS
// ============================================================================

export const PARENT_OCCUPATIONS = [
    'farmer',
    'daily_wage',
    'govt_employee',
    'private_salaried',
    'self_employed',
    'unemployed',
    'other'
] as const;

export const MINORITY_STATUSES = [
    'muslim',
    'christian',
    'sikh',
    'buddhist',
    'jain',
    'none'
] as const;

export const COURSE_CATEGORIES = [
    'engineering',
    'medical',
    'arts',
    'science',
    'commerce',
    'law',
    'management',
    'agriculture',
    'other'
] as const;

export const DEGREE_TYPES = [
    'professional',  // MBBS, B.Tech, LLB
    'technical',     // Diploma, ITI
    'general'        // BA, BSc, BCom
] as const;

// ============================================================================
// PHASE A: HARD REJECTION LOGIC
// ============================================================================

function checkHardCriteria(
    profile: EnhancedUserProfile,
    eligibility: StandardizedEligibility
): { passed: boolean; reasons: string[] } {
    const reasons: string[] = [];

    // 1. Category Check (CRITICAL)
    if (eligibility.hard.categories && eligibility.hard.categories.length > 0) {
        if (!eligibility.hard.categories.includes(profile.category)) {
            reasons.push(`Category ${profile.category} not eligible (requires: ${eligibility.hard.categories.join(', ')})`);
        }
    }

    // 2. Income Check (CRITICAL)
    if (eligibility.hard.max_income !== undefined) {
        if (profile.annualIncome > eligibility.hard.max_income) {
            reasons.push(`Income ₹${profile.annualIncome.toLocaleString()} exceeds limit of ₹${eligibility.hard.max_income.toLocaleString()}`);
        }
    }

    // 3. Gender Check
    if (eligibility.hard.genders && eligibility.hard.genders.length > 0) {
        if (!eligibility.hard.genders.includes(profile.gender)) {
            reasons.push(`Gender ${profile.gender} not eligible (requires: ${eligibility.hard.genders.join(', ')})`);
        }
    }

    // 4. Education Level Check
    if (eligibility.hard.education_levels && eligibility.hard.education_levels.length > 0) {
        if (!eligibility.hard.education_levels.includes(profile.educationLevel)) {
            reasons.push(`Education level ${profile.educationLevel} not eligible`);
        }
    }

    // 5. State Restriction Check
    if (eligibility.hard.states && eligibility.hard.states.length > 0) {
        // "All" means scholarship is available in all states
        const isAllStates = eligibility.hard.states.includes('All');
        if (!isAllStates && !eligibility.hard.states.includes(profile.state)) {
            reasons.push(`Not available in ${profile.state}`);
        }
    }

    // 6. Minimum Percentage Check
    if (eligibility.hard.min_percentage !== undefined && profile.percentage !== undefined) {
        if (profile.percentage < eligibility.hard.min_percentage) {
            reasons.push(`Percentage ${profile.percentage}% below minimum ${eligibility.hard.min_percentage}%`);
        }
    }

    // 7. Parent Occupation Check (if specified)
    if (eligibility.hard.parent_occupations && eligibility.hard.parent_occupations.length > 0) {
        if (!profile.parentOccupation) {
            // Don't auto-reject, but flag
            // This will be handled in confidence scoring
        } else if (!eligibility.hard.parent_occupations.includes(profile.parentOccupation)) {
            reasons.push(`Parent occupation ${profile.parentOccupation} not eligible`);
        }
    }

    // 8. Minority Status Check
    if (eligibility.hard.minority_statuses && eligibility.hard.minority_statuses.length > 0) {
        if (!profile.minorityStatus) {
            // Don't auto-reject, flag as missing data
        } else if (!eligibility.hard.minority_statuses.includes(profile.minorityStatus)) {
            reasons.push(`Minority status requirement not met`);
        }
    }

    // 9. Hosteller Requirement
    if (eligibility.hard.requires_hosteller === true) {
        if (profile.isHosteller === false) {
            reasons.push(`Only for hostel residents`);
        }
    }

    // 10. Disability Requirement
    if (eligibility.hard.has_disability === true) {
        if (!profile.hasDisability) {
            reasons.push(`Only for persons with disabilities`);
        }
    }

    return {
        passed: reasons.length === 0,
        reasons
    };
}

// ============================================================================
// PHASE B: WEIGHTED SCORING
// ============================================================================

function calculateWeightedScore(
    profile: EnhancedUserProfile,
    eligibility: StandardizedEligibility
): {
    score: number;
    reasons: string[];
    breakdown: MatchResult['eligibilityBreakdown'];
} {
    let score = 0;
    const reasons: string[] = [];

    // Base score for passing hard criteria
    let hardScore = 100;

    // Income Proximity Score (0-20 points)
    // Closer to income limit = higher score (shows genuine need)
    let incomeScore = 0;
    if (eligibility.hard.max_income) {
        const incomeRatio = profile.annualIncome / eligibility.hard.max_income;
        if (incomeRatio <= 0.5) {
            incomeScore = 20;
            reasons.push('Income well within limit (high priority)');
        } else if (incomeRatio <= 0.75) {
            incomeScore = 15;
            reasons.push('Income within comfortable range');
        } else if (incomeRatio <= 1.0) {
            incomeScore = 10;
            reasons.push('Income near upper limit');
        }
    }

    // Academic Performance Score (0-20 points)
    let academicScore = 0;
    if (profile.percentage) {
        if (profile.percentage >= 85) {
            academicScore = 20;
            reasons.push('Excellent academic performance');
        } else if (profile.percentage >= 75) {
            academicScore = 15;
            reasons.push('Strong academic performance');
        } else if (profile.percentage >= 60) {
            academicScore = 10;
            reasons.push('Good academic performance');
        } else {
            academicScore = 5;
        }
    }

    // Soft Criteria Matches (0-15 points)
    let softScore = 0;

    if (eligibility.soft?.course_categories && profile.courseCategory) {
        if (eligibility.soft.course_categories.includes(profile.courseCategory)) {
            softScore += 5;
            reasons.push(`Course category ${profile.courseCategory} matches`);
        }
    }

    if (eligibility.soft?.degree_types && profile.degreeType) {
        if (eligibility.soft.degree_types.includes(profile.degreeType)) {
            softScore += 5;
            reasons.push(`Degree type ${profile.degreeType} preferred`);
        }
    }

    if (eligibility.soft?.institution_types && profile.institutionType) {
        if (eligibility.soft.institution_types.includes(profile.institutionType)) {
            softScore += 5;
            reasons.push(`Institution type ${profile.institutionType} preferred`);
        }
    }

    // Category-based priority (0-10 points)
    let categoryBonus = 0;
    if (['SC', 'ST'].includes(profile.category)) {
        categoryBonus = 10;
        reasons.push('Priority category (SC/ST)');
    } else if (profile.category === 'OBC') {
        categoryBonus = 7;
        reasons.push('Reserved category (OBC)');
    } else if (profile.category === 'EWS') {
        categoryBonus = 5;
        reasons.push('EWS category');
    }

    // Disability bonus (0-10 points)
    let disabilityBonus = 0;
    if (profile.hasDisability) {
        disabilityBonus = 10;
        reasons.push('Person with disability (priority)');
    }

    score = hardScore + incomeScore + academicScore + softScore + categoryBonus + disabilityBonus;

    // Normalize to 0-100
    score = Math.min(100, score);

    return {
        score,
        reasons,
        breakdown: {
            hardCriteriaScore: hardScore,
            softCriteriaScore: softScore,
            incomeProximity: incomeScore,
            academicScore
        }
    };
}

// ============================================================================
// CONFIDENCE LEVEL CALCULATION
// ============================================================================

function calculateConfidenceLevel(
    profile: EnhancedUserProfile,
    eligibility: StandardizedEligibility,
    missingDataWarnings: string[]
): 'high' | 'medium' | 'low' {
    // High confidence: All required data present
    if (missingDataWarnings.length === 0) {
        return 'high';
    }

    // Low confidence: Missing critical hard criteria data
    const criticalMissing = missingDataWarnings.some(w =>
        w.includes('parent occupation') ||
        w.includes('minority status') ||
        w.includes('hosteller')
    );

    if (criticalMissing && (
        eligibility.hard.parent_occupations?.length ||
        eligibility.hard.minority_statuses?.length ||
        eligibility.hard.requires_hosteller
    )) {
        return 'low';
    }

    // Medium confidence: Missing soft criteria data
    return 'medium';
}

// ============================================================================
// MAIN MATCHING FUNCTION
// ============================================================================

export function matchScholarship(
    profile: EnhancedUserProfile,
    eligibility: StandardizedEligibility,
    scholarshipId: string
): MatchResult {
    const missingDataWarnings: string[] = [];

    // Check for missing data that affects eligibility
    if (eligibility.hard.parent_occupations?.length && !profile.parentOccupation) {
        missingDataWarnings.push('Complete parent occupation to confirm eligibility');
    }

    if (eligibility.hard.minority_statuses?.length && !profile.minorityStatus) {
        missingDataWarnings.push('Complete minority status to confirm eligibility');
    }

    if (eligibility.hard.requires_hosteller !== undefined && profile.isHosteller === undefined) {
        missingDataWarnings.push('Specify if you are a hosteller to confirm eligibility');
    }

    if (eligibility.soft?.course_categories?.length && !profile.courseCategory) {
        missingDataWarnings.push('Add course category to improve match accuracy');
    }

    // PHASE A: Hard Rejection
    const hardCheck = checkHardCriteria(profile, eligibility);

    if (!hardCheck.passed) {
        return {
            scholarshipId,
            matchScore: 0,
            confidenceLevel: 'high', // High confidence in rejection
            passedHardCriteria: false,
            matchReasons: [],
            rejectionReasons: hardCheck.reasons,
            missingDataWarnings: [],
            eligibilityBreakdown: {
                hardCriteriaScore: 0,
                softCriteriaScore: 0,
                incomeProximity: 0,
                academicScore: 0
            }
        };
    }

    // PHASE B: Weighted Scoring
    const scoring = calculateWeightedScore(profile, eligibility);
    const confidenceLevel = calculateConfidenceLevel(profile, eligibility, missingDataWarnings);

    return {
        scholarshipId,
        matchScore: scoring.score,
        confidenceLevel,
        passedHardCriteria: true,
        matchReasons: scoring.reasons,
        rejectionReasons: [],
        missingDataWarnings,
        eligibilityBreakdown: scoring.breakdown
    };
}

// ============================================================================
// BATCH MATCHING (For Dashboard/Browse)
// ============================================================================

export function matchMultipleScholarships(
    profile: EnhancedUserProfile,
    scholarships: Array<{ id: string; eligibility: StandardizedEligibility }>
): MatchResult[] {
    return scholarships
        .map(s => matchScholarship(profile, s.eligibility, s.id))
        .filter(result => result.passedHardCriteria) // Only return eligible scholarships
        .sort((a, b) => {
            // Sort by confidence first, then score
            const confidenceOrder = { high: 3, medium: 2, low: 1 };
            if (confidenceOrder[a.confidenceLevel] !== confidenceOrder[b.confidenceLevel]) {
                return confidenceOrder[b.confidenceLevel] - confidenceOrder[a.confidenceLevel];
            }
            return b.matchScore - a.matchScore;
        });
}
