# Onboarding Flow - User Journey

## Entry Points

### 1. New User Signup
```
User visits /auth → Signs up → Redirected to /onboarding
```

### 2. Existing User Profile Update
```
User on /dashboard → Clicks "Update Profile" → Goes to /onboarding
User on /dashboard → Clicks "My Profile" quick action → Goes to /onboarding
User on /dashboard → Profile completion < 100% → Clicks "Complete Now" → Goes to /onboarding
```

## Onboarding Steps

### Welcome Banner (Always Visible)
```
┌─────────────────────────────────────────────────────┐
│ ✨ Complete Your Profile                            │
│                                                      │
│ Help us understand you better so we can match you   │
│ with the most relevant scholarships. This will only │
│ take 5-10 minutes and you'll never have to re-enter │
│ this information again.                              │
└─────────────────────────────────────────────────────┘
```

### Progress Tracker
```
Desktop:
○ Personal ━━━━ ○ Location ━━━━ ○ Education ━━━━ ○ Family
✓ Personal ━━━━ ● Location      ○ Education      ○ Family

Mobile:
Step 2 of 4                                   Location
[████████████████░░░░░░░░░░░░] 50%
```

### Step 1: Personal Details
```
┌─────────────────────────────────────────────────────┐
│ Let's get to know you                                │
│ Basic details to set up your profile                 │
│                                                      │
│ Full Name *                                          │
│ [Your full name as per Aadhaar________________]     │
│ Enter your name exactly as it appears on official   │
│ documents                                            │
│                                                      │
│ Date of Birth *          Gender *                    │
│ [DD/MM/YYYY____]        [Male ▼]                    │
│                                                      │
│ Social Category *        Minority Status *           │
│ [General ▼]             [None (Hindu) ▼]            │
│                                                      │
│ Do you have any disability? *                        │
│ ○ No    ○ Yes                                        │
│                                                      │
│                              [Next Step →]           │
└─────────────────────────────────────────────────────┘
```

### Step 2: Location & Residence
```
┌─────────────────────────────────────────────────────┐
│ Where do you live?                                   │
│ Scholarships often depend on your domicile and       │
│ residence type                                       │
│                                                      │
│ State *                                              │
│ [Select your state_________________________▼]       │
│                                                      │
│ District *                                           │
│ [Enter your district_______________________]        │
│                                                      │
│ Residential Status *                                 │
│ ○ Day Scholar    ○ Hosteller                         │
│                                                      │
│ [← Back]                     [Next Step →]           │
└─────────────────────────────────────────────────────┘
```

### Step 3: Education Details
```
┌─────────────────────────────────────────────────────┐
│ Education Details                                    │
│ Tell us about your current course                    │
│                                                      │
│ Education Level *        Degree Type *               │
│ [Class 12 ▼]            [General (BA/BSc/BCom) ▼]   │
│                                                      │
│ Course Category *        Current Year *              │
│ [Engineering ▼]         [Year 1 ▼]                  │
│                                                      │
│ Course Name *                                        │
│ [e.g. B.Tech in Computer Science / Class 12 Science]│
│                                                      │
│ Institution Name *                                   │
│ [School/College Name_______________________]        │
│                                                      │
│ Institution Type *       Percentage/CGPA *           │
│ [Government ▼]          [e.g. 85____]               │
│                                                      │
│ [← Back]                     [Next Step →]           │
└─────────────────────────────────────────────────────┘
```

### Step 4: Family & Financials
```
┌─────────────────────────────────────────────────────┐
│ Family & Financials                                  │
│ Income details help us find need-based scholarships  │
│                                                      │
│ Annual Family Income (₹) *                           │
│ [₹ e.g. 250000_____________________________]        │
│ Total annual income of all earning members           │
│                                                      │
│ Parent's Occupation *                                │
│ [Select parent's occupation________________▼]       │
│                                                      │
│ ┌───────────────────────────────────────────────┐   │
│ │ 💡 Note                                        │   │
│ │ Many scholarships are specifically reserved    │   │
│ │ for children of farmers, laborers, or          │   │
│ │ government employees. Accurate info here       │   │
│ │ increases your match chances significantly.    │   │
│ └───────────────────────────────────────────────┘   │
│                                                      │
│ [← Back]                     [✓ Complete Profile]    │
└─────────────────────────────────────────────────────┘
```

## After Completion

### Success Flow
```
Profile Saved Successfully! 🎉
↓
Redirect based on role:
- Student → /dashboard (see matched scholarships)
- Mentor → /mentor
- Admin → /admin
```

### Dashboard View (Student)
```
┌─────────────────────────────────────────────────────┐
│ Welcome back, [Name]! 👋                             │
│ We've found 15 scholarships that match your profile.│
│                                                      │
│ Profile Status: 100% ✓                               │
└─────────────────────────────────────────────────────┘

Quick Actions:
[Calculator] Check Eligibility
[Search] Browse All
[FileText] My Applications
[User] My Profile

Top Matches For You:
┌─────────────────────────────────────────────────────┐
│ Post Matric Scholarship for SC Students              │
│ ₹50,000 | Deadline: 30 days left                     │
│ Match Score: 95% ⭐⭐⭐⭐⭐                              │
└─────────────────────────────────────────────────────┘
```

## Data Validation

### Required Fields by Step

**Step 1:**
- Full Name ✓
- Date of Birth ✓
- Gender ✓
- Social Category ✓
- Minority Status (default: none) ✓
- Disability Status (default: no) ✓

**Step 2:**
- State ✓
- District ✓
- Residential Status (default: Day Scholar) ✓

**Step 3:**
- Education Level ✓
- Institution Name ✓
- Course Name ✓
- Percentage/CGPA ✓
- Institution Type (default: government) ✓
- Course Category (default: engineering) ✓
- Degree Type (default: general) ✓

**Step 4:**
- Annual Family Income ✓
- Parent's Occupation ✓

## Error Handling

### Validation Errors
```
Toast Notification:
┌─────────────────────────────────────┐
│ ⚠ Please complete the form          │
│ State is required                   │
└─────────────────────────────────────┘
```

### Save Errors
```
Toast Notification:
┌─────────────────────────────────────┐
│ ❌ Error                             │
│ Failed to save profile              │
└─────────────────────────────────────┘
```

### Authentication Errors
```
Toast Notification:
┌─────────────────────────────────────┐
│ ⚠ Not Signed In                     │
│ You need to sign in to save your   │
│ profile.                            │
└─────────────────────────────────────┘
↓
Redirect to /auth
```

## Mobile Responsiveness

All steps are fully responsive:
- Single column layout on mobile
- Touch-friendly buttons (h-12 height)
- Clear step indicators
- Progress bar instead of stepper on small screens
- Bottom navigation for easy access
