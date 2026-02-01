# William R. Stark Scholarship Platform - Implementation Plan

## Executive Summary

This document outlines the step-by-step implementation plan for the William R. Stark Financial Assistance Platform, a full-stack scholarship application system built with Next.js 14, Convex, Better Auth, and AI integration.

---

## Project Overview

| Aspect | Details |
|--------|---------|
| **Platform Name** | William R. Stark Financial Assistance Platform |
| **Domain** | starkscholars.com |
| **Purpose** | Scholarship application & evaluation system for Michigan students |
| **Award** | Two $500 scholarships |
| **Target Users** | Applicants (MI students), Recommenders, Committee (6 members), Admin |
| **Tech Stack** | Next.js 14, Convex, Better Auth, ShadCN/UI, Tailwind CSS, Framer Motion |
| **AI Integration** | Claude 3.5 Sonnet for candidate summaries |
| **Email Service** | Resend |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS APPLICATION                               │
├─────────────────────────────────────────────────────────────────────┤
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐        │
│  │  Landing   │ │ Applicant  │ │Recommender │ │   Admin    │        │
│  │   Page     │ │  Portal    │ │  Portal    │ │ Dashboard  │        │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘        │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │              COMMITTEE EVALUATION SYSTEM                    │     │
│  │      (AI Summaries, Candidate Cards, Selection Tools)      │     │
│  └────────────────────────────────────────────────────────────┘     │
├─────────────────────────────────────────────────────────────────────┤
│                         CONVEX BACKEND                               │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │ Database │ │  Better  │ │  File    │ │ Anthropic│               │
│  │          │ │   Auth   │ │ Storage  │ │  Claude  │               │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## URL Structure

All routes hosted on `starkscholars.com`:

### Public Routes
| URL | Description |
|-----|-------------|
| `/` | Landing page (marketing) |
| `/login` | Sign in page |
| `/register` | Create account |
| `/verify` | Email verification |

### Applicant Portal (Protected)
| URL | Description |
|-----|-------------|
| `/apply` | Redirect to dashboard |
| `/apply/dashboard` | Application home/progress |
| `/apply/step/1` | Personal Information |
| `/apply/step/2` | Address |
| `/apply/step/3` | Education |
| `/apply/step/4` | Eligibility Questions |
| `/apply/step/5` | Documents & Essay |
| `/apply/step/6` | Recommendations |
| `/apply/step/7` | Review & Submit |
| `/apply/confirmation` | Submission success |
| `/apply/status` | Application status |

### Recommender Portal (Token-based)
| URL | Description |
|-----|-------------|
| `/recommend/[token]` | Submit recommendation letter |
| `/recommend/[token]/thanks` | Confirmation page |

### Admin Dashboard (Admin only)
| URL | Description |
|-----|-------------|
| `/admin` | Dashboard overview |
| `/admin/applications` | All applications list |
| `/admin/applications/[id]` | Application detail view |
| `/admin/settings` | System settings |
| `/admin/committee` | Committee management |
| `/admin/reports` | Export & reports |

### Committee Portal (Committee/Admin)
| URL | Description |
|-----|-------------|
| `/committee` | Evaluation dashboard |
| `/committee/candidates` | All candidates list |
| `/committee/candidates/[id]` | Candidate detail + evaluation |
| `/committee/my-evaluations` | My completed evaluations |
| `/committee/results` | Rankings & selection |

---

## Phase 1: Foundation (Week 1-2)

### 1.1 Project Initialization

```bash
# Create Next.js project with shadcn
npx shadcn@latest init --yes --template next --base-color stone

# Install core dependencies
pnpm add convex better-auth @anthropic-ai/sdk resend framer-motion
pnpm add react-hook-form zod @hookform/resolvers date-fns recharts
pnpm add lucide-react

# Install shadcn components
npx shadcn add button card input label select textarea
npx shadcn add dialog dropdown-menu tabs table
npx shadcn add avatar badge progress separator
npx shadcn add toast skeleton sheet
```

### 1.2 Folder Structure Setup

```
william-r-stark-scholarship/
├── app/
│   ├── (public)/               # Landing page → starkscholars.com/
│   ├── (auth)/                 # Login/Register/Verify → starkscholars.com/login
│   ├── (applicant)/apply/      # Application portal → starkscholars.com/apply/*
│   ├── (recommender)/recommend/ # Recommender portal → starkscholars.com/recommend/[token]
│   ├── (admin)/admin/          # Admin dashboard → starkscholars.com/admin/*
│   ├── (committee)/committee/  # Committee evaluation → starkscholars.com/committee/*
│   └── api/[...auth]/          # Better Auth routes → starkscholars.com/api/auth/*
├── components/
│   ├── ui/                     # ShadCN components
│   ├── landing/
│   ├── apply/
│   ├── admin/
│   └── committee/
├── convex/
│   ├── schema.ts
│   ├── applications.ts
│   ├── recommendations.ts
│   ├── evaluations.ts
│   ├── users.ts
│   ├── storage.ts
│   └── ai.ts
├── lib/
│   ├── auth.ts
│   ├── email.ts
│   ├── motion.ts
│   └── utils.ts
└── public/images/
```

### 1.3 Environment Configuration

```env
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="William R. Stark Financial Assistance"

# Convex (to be configured after convex init)
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Better Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000

# Anthropic (AI)
ANTHROPIC_API_KEY=sk-ant-...

# Resend (Email)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@starkscholars.com
```

### 1.4 Convex Setup

```bash
# Initialize Convex
npx convex dev

# This creates:
# - convex.json
# - convex/ folder with sample files
```

### 1.5 Database Schema Implementation

**File: `convex/schema.ts`**

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users & Auth (Better Auth managed + custom fields)
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
    role: v.union(v.literal("applicant"), v.literal("admin"), v.literal("committee")),
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // Applications
  applications: defineTable({
    userId: v.id("users"),
    status: v.union(
      v.literal("draft"), v.literal("in_progress"), 
      v.literal("pending_recommendations"), v.literal("submitted"),
      v.literal("under_review"), v.literal("finalist"), 
      v.literal("selected"), v.literal("not_selected"), v.literal("withdrawn")
    ),
    currentStep: v.number(),
    completedSteps: v.array(v.number()),
    
    // Step 1: Personal
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    profilePhotoId: v.optional(v.id("_storage")),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    
    // Step 2: Address
    streetAddress: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    
    // Step 3: Education
    highSchoolName: v.optional(v.string()),
    highSchoolCity: v.optional(v.string()),
    highSchoolState: v.optional(v.string()),
    graduationDate: v.optional(v.string()),
    gpa: v.optional(v.number()),
    actScore: v.optional(v.number()),
    satScore: v.optional(v.number()),
    collegeName: v.optional(v.string()),
    collegeCity: v.optional(v.string()),
    collegeState: v.optional(v.string()),
    yearInCollege: v.optional(v.union(v.literal("freshman"), v.literal("sophomore"), v.literal("junior"), v.literal("senior"))),
    major: v.optional(v.string()),
    
    // Step 4: Eligibility
    isFirstTimeApplying: v.optional(v.boolean()),
    isPreviousRecipient: v.optional(v.boolean()),
    isFullTimeStudent: v.optional(v.boolean()),
    isMichiganResident: v.optional(v.boolean()),
    
    // Step 5: Documents
    transcriptFileId: v.optional(v.id("_storage")),
    essayFileId: v.optional(v.id("_storage")),
    essayText: v.optional(v.string()),
    essayWordCount: v.optional(v.number()),
    
    // Step 6: Recommendations (references to recommendations table)
    
    // Step 7: Endorsement
    endorserName: v.optional(v.string()),
    endorserOrient: v.optional(v.string()),
    endorserConsistoryAssembly: v.optional(v.string()),
    endorserEmail: v.optional(v.string()),
    endorserPhone: v.optional(v.string()),
    endorsementConfirmed: v.optional(v.boolean()),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    submittedAt: v.optional(v.number()),
    
    // AI Generated
    aiSummary: v.optional(v.string()),
    aiHighlights: v.optional(v.array(v.string())),
    aiSummaryGeneratedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_city", ["city"])
    .index("by_submitted", ["submittedAt"]),

  // Recommendations
  recommendations: defineTable({
    applicationId: v.id("applications"),
    recommenderEmail: v.string(),
    recommenderName: v.optional(v.string()),
    recommenderType: v.union(v.literal("educator"), v.literal("community_group"), v.literal("other")),
    recommenderOrganization: v.optional(v.string()),
    relationship: v.optional(v.string()),
    accessToken: v.string(),
    tokenExpiresAt: v.number(),
    status: v.union(v.literal("pending"), v.literal("email_sent"), v.literal("viewed"), v.literal("submitted")),
    letterFileId: v.optional(v.id("_storage")),
    letterText: v.optional(v.string()),
    submittedAt: v.optional(v.number()),
    emailSentAt: v.optional(v.number()),
    emailRemindersSent: v.number(),
    lastReminderAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_application", ["applicationId"])
    .index("by_token", ["accessToken"])
    .index("by_email", ["recommenderEmail"])
    .index("by_status", ["status"]),

  // Committee Evaluations
  evaluations: defineTable({
    applicationId: v.id("applications"),
    evaluatorId: v.id("users"),
    rating: v.union(v.literal("strong_yes"), v.literal("yes"), v.literal("maybe"), v.literal("no"), v.literal("strong_no")),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_application", ["applicationId"])
    .index("by_evaluator", ["evaluatorId"])
    .index("by_application_evaluator", ["applicationId", "evaluatorId"]),

  // Committee Members
  committeeMembers: defineTable({
    userId: v.id("users"),
    name: v.string(),
    title: v.string(),
    phone: v.optional(v.string()),
    isChairman: v.boolean(),
    isExOfficio: v.boolean(),
    order: v.number(),
  })
    .index("by_user", ["userId"]),

  // Activity Log
  activityLog: defineTable({
    userId: v.optional(v.id("users")),
    applicationId: v.optional(v.id("applications")),
    action: v.string(),
    details: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_application", ["applicationId"])
    .index("by_user", ["userId"])
    .index("by_created", ["createdAt"]),

  // System Settings
  settings: defineTable({
    key: v.string(),
    value: v.string(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.id("users")),
  })
    .index("by_key", ["key"]),
});
```

### 1.6 Better Auth Integration

**File: `lib/auth.ts`**

```typescript
import { betterAuth } from "better-auth";
import { convexAdapter } from "better-auth/adapters/convex";
import { convex } from "./convex";

export const auth = betterAuth({
  database: convexAdapter(convex),
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  
  magicLink: {
    enabled: true,
    sendMagicLink: async ({ email, url }) => {
      await sendEmail({
        to: email,
        subject: "Sign in to William R. Stark Scholarship Portal",
        template: "magic-link",
        data: { url },
      });
    },
  },
  
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  
  callbacks: {
    async session({ session, user }) {
      const dbUser = await convex.query("users:getById", { id: user.id });
      return {
        ...session,
        user: {
          ...session.user,
          role: dbUser?.role || "applicant",
        },
      };
    },
  },
});
```

**File: `app/api/[...auth]/route.ts`**

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
```

### 1.7 Route Protection Middleware

**File: `middleware.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "better-auth/next-js";

export const config = {
  matcher: [
    "/apply/:path*",
    "/admin/:path*",
    "/committee/:path*",
    "/api/:path*",
  ],
};

export default async function middleware(request: NextRequest) {
  const session = await getSession(request);
  const pathname = request.nextUrl.pathname;
  
  // Applicant routes
  if (pathname.startsWith("/apply")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login?redirect=/apply", request.url));
    }
    if (session.user.role !== "applicant") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  
  // Admin routes
  if (pathname.startsWith("/admin")) {
    if (!session || session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }
  
  // Committee routes
  if (pathname.startsWith("/committee")) {
    if (!session || !["admin", "committee"].includes(session.user.role)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }
  
  return NextResponse.next();
}
```

### Phase 1 Deliverables
- [ ] Project initialized with Next.js + ShadCN
- [ ] Convex database connected and schema deployed
- [ ] Better Auth configured with email/password + magic link
- [ ] Route protection middleware implemented
- [ ] Basic layout structure in place
- [ ] Landing page skeleton (ready for content)

---

## Phase 2: Applicant Portal (Week 3-4)

### 2.1 Application Dashboard

**File: `app/(applicant)/apply/dashboard/page.tsx`**

```typescript
// Key components:
// - ProgressIndicator (steps 1-7)
// - DeadlineCountdown
// - NextStepCard
// - RecommendationsStatus
// - DocumentsChecklist
```

**Components to build:**
- `components/apply/ProgressIndicator.tsx`
- `components/apply/DeadlineCountdown.tsx`
- `components/apply/StepCard.tsx`
- `components/apply/RecommendationsStatus.tsx`
- `components/apply/DocumentsChecklist.tsx`

### 2.2 Multi-Step Form Navigation

**File: `app/(applicant)/apply/step/[step]/page.tsx`**

```typescript
const steps = [
  { id: 1, title: "Personal Information", component: PersonalInfoStep },
  { id: 2, title: "Address", component: AddressStep },
  { id: 3, title: "Education", component: EducationStep },
  { id: 4, title: "Eligibility", component: EligibilityStep },
  { id: 5, title: "Documents & Essay", component: DocumentsStep },
  { id: 6, title: "Recommendations", component: RecommendationsStep },
  { id: 7, title: "Review & Submit", component: ReviewStep },
];

export default function StepPage({ params }: { params: { step: string } }) {
  // Validate step, render appropriate component
  // Handle navigation between steps
  // Auto-save functionality
}
```

### 2.3 Step 1: Personal Information

**File: `components/apply/steps/PersonalInfoStep.tsx`**

```typescript
// Fields:
// - Profile Photo (upload with crop/preview)
// - First Name (required)
// - Last Name (required)
// - Phone Number (required, formatted)
// - Date of Birth (required, date picker)
// - Email (read-only from account)

// Features:
// - ProfilePhotoUpload component with drag-drop
// - Form validation with Zod
// - Auto-save on field change
```

### 2.4 Step 2: Address

**File: `components/apply/steps/AddressStep.tsx`**

```typescript
// Fields:
// - Street Address (required)
// - City (required)
// - State (locked to "MI")
// - ZIP Code (required, MI validation 480xx-499xx)

// Validation:
// - Michigan residents only warning
// - ZIP code format validation
```

### 2.5 Step 3: Education

**File: `components/apply/steps/EducationStep.tsx`**

```typescript
// Fields:
// High School:
// - Name (searchable dropdown)
// - City
// - State
// - Graduation Date (month/year)
// - GPA (required, min 3.0)
// - ACT Score (optional)
// - SAT Score (optional)

// College:
// - Name (searchable dropdown)
// - City (auto-fill)
// - State (auto-fill)
// - Year in College (dropdown)
// - Intended Major

// Features:
// - School search API integration (or static list)
// - Auto-fill city/state
// - GPA validation warning
```

### 2.6 Step 4: Eligibility Questions

**File: `components/apply/steps/EligibilityStep.tsx`**

```typescript
// Questions:
// 1. Is this your first time applying? (yes/no)
// 2. Are you a previous recipient? (yes/no)
// 3. Are you currently enrolled as a full-time student? (yes/no) - REQUIRED
// 4. Are you a permanent resident of Michigan? (yes/no) - REQUIRED

// Validation:
// - Block submission if full-time != yes
// - Block submission if Michigan resident != yes
// - Show eligibility warnings
```

### 2.7 Step 5: Documents & Essay

**File: `components/apply/steps/DocumentsStep.tsx`**

```typescript
// Transcript Upload:
// - Accepted: PDF, JPG, PNG
// - Max: 10MB

// Essay:
// - Topic: "How Will Furthering My Studies Help Me Improve My Community?"
// - Toggle: Type directly OR Upload document
// - Word count: 450-550 (validate)
// - Rich text editor (basic formatting)
// - Auto-save every 30 seconds
// - Live word count with progress bar

// Components:
// - DocumentUpload (reusable)
// - EssayEditor (with word count)
```

### 2.8 Convex Mutations for Application

**File: `convex/applications.ts`**

```typescript
import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";

// Create application for new user
export const create = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.insert("applications", {
      userId,
      status: "draft",
      currentStep: 1,
      completedSteps: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update step data
export const updateStep = mutation({
  args: {
    applicationId: v.id("applications"),
    step: v.number(),
    data: v.object({ /* field validations */ }),
  },
  handler: async (ctx, { applicationId, step, data }) => {
    const application = await ctx.db.get(applicationId);
    if (!application) throw new Error("Application not found");
    
    // Update fields based on step
    const updatedData = {
      ...data,
      updatedAt: Date.now(),
    };
    
    // Mark step as completed
    if (!application.completedSteps.includes(step)) {
      updatedData.completedSteps = [...application.completedSteps, step];
    }
    
    return await ctx.db.patch(applicationId, updatedData);
  },
});

// Get application by user
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});
```

### Phase 2 Deliverables
- [ ] Application dashboard with progress tracking
- [ ] Steps 1-4 complete (Personal, Address, Education, Eligibility)
- [ ] Document upload component
- [ ] Essay editor with word count
- [ ] Auto-save functionality
- [ ] Form validation throughout

---

## Phase 3: Recommendations (Week 5)

### 3.1 Step 6: Recommendations

**File: `components/apply/steps/RecommendationsStep.tsx`**

```typescript
// Features:
// - Add up to 2 recommenders
// - At least 1 must be Educator or Community Group
// - Fields per recommender:
//   - Full Name
//   - Email
//   - Type (Educator/Community/Other)
//   - Organization/School
//   - Relationship description
// - Send request button
// - Status tracking (pending/email_sent/viewed/submitted)
// - Send reminder functionality
// - Change recommender option
```

### 3.2 Recommender Portal

**File: `app/(recommender)/recommend/[token]/page.tsx`**

```typescript
// Token-based access (no login required)
// Features:
// - Display applicant info (name, photo, school)
// - Letter upload (PDF, DOC, DOCX, max 5MB)
// - Recommender info form (name, title, organization)
// - Confirmation checkbox
// - Submit button
// - Expiration notice

// Validation:
// - Token validity check
// - IP logging for security
// - One-time submission
```

### 3.3 Recommendation Workflow

**Convex Mutations:**

```typescript
// Create recommendation request
export const createRecommendation = mutation({
  args: {
    applicationId: v.id("applications"),
    recommenderEmail: v.string(),
    recommenderName: v.string(),
    recommenderType: v.string(),
    recommenderOrganization: v.optional(v.string()),
    relationship: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate secure token
    const token = generateSecureToken();
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
    
    const recommendationId = await ctx.db.insert("recommendations", {
      ...args,
      accessToken: token,
      tokenExpiresAt: expiresAt,
      status: "pending",
      emailRemindersSent: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Send email
    await ctx.scheduler.runAfter(0, "emails:sendRecommendationRequest", {
      recommendationId,
    });
    
    return recommendationId;
  },
});

// Submit recommendation letter
export const submitRecommendation = mutation({
  args: {
    token: v.string(),
    letterFileId: v.id("_storage"),
    letterText: v.optional(v.string()),
    recommenderInfo: v.object({
      name: v.string(),
      title: v.optional(v.string()),
      organization: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    // Validate token
    const rec = await ctx.db
      .query("recommendations")
      .withIndex("by_token", (q) => q.eq("accessToken", args.token))
      .first();
    
    if (!rec) throw new Error("Invalid token");
    if (rec.tokenExpiresAt < Date.now()) throw new Error("Token expired");
    if (rec.status === "submitted") throw new Error("Already submitted");
    
    // Update recommendation
    await ctx.db.patch(rec._id, {
      status: "submitted",
      letterFileId: args.letterFileId,
      letterText: args.letterText,
      recommenderName: args.recommenderInfo.name,
      submittedAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Notify applicant
    await ctx.scheduler.runAfter(0, "emails:notifyRecommendationReceived", {
      applicationId: rec.applicationId,
      recommenderName: args.recommenderInfo.name,
    });
    
    // Trigger AI summary regeneration
    await ctx.scheduler.runAfter(0, "ai:generateSummary", {
      applicationId: rec.applicationId,
    });
    
    return { success: true };
  },
});
```

### 3.4 Email Integration

**File: `lib/email.ts`**

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  template,
  data,
}: {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}) {
  const html = await renderTemplate(template, data);
  
  await resend.emails.send({
    from: process.env.EMAIL_FROM || "noreply@starkscholars.com",
    to,
    subject,
    html,
  });
}
```

**Templates needed:**
- `welcome` - Account creation
- `email-verification` - Registration
- `recommendation-request` - Request to recommender
- `recommendation-reminder` - 7-day reminder
- `recommendation-received` - Notify applicant

### Phase 3 Deliverables
- [ ] Step 6: Recommendations UI
- [ ] Recommender portal (token-based)
- [ ] Email notifications (Resend integration)
- [ ] Recommendation status tracking
- [ ] Reminder system

---

## Phase 4: Review & Submit (Week 6)

### 4.1 Step 7: Review & Submit

**File: `components/apply/steps/ReviewStep.tsx`**

```typescript
// Features:
// - Application checklist (10 requirements)
// - Collapsible sections for each step
// - Edit links to each section
// - USC/OGC Member Endorsement section
// - Certifications (3 checkboxes)
// - Electronic signature
// - Submit button

// Validation before submit:
// - All steps complete
// - GPA >= 3.0
// - Michigan resident confirmed
// - Full-time student confirmed
// - Both recommendations received
// - All certifications checked
// - Signature matches name
```

### 4.2 Submission Flow

```typescript
// On Submit:
// 1. Validate all requirements
// 2. Update status to "submitted"
// 3. Set submittedAt timestamp
// 4. Trigger AI summary generation
// 5. Send confirmation email
// 6. Redirect to confirmation page
```

### 4.3 Confirmation Page

**File: `app/(applicant)/apply/confirmation/page.tsx`**

```typescript
// Display:
// - Success message
// - Application reference number
// - Next steps information
// - Timeline for decisions
// - Contact information
// - Option to download application summary
```

### 4.4 Status Tracking Page

**File: `app/(applicant)/apply/status/page.tsx`**

```typescript
// Display:
// - Current application status
// - Submission date
// - Recommendation status
// - Estimated decision timeline
// - Committee review progress (if submitted)
```

### Phase 4 Deliverables
- [ ] Step 7: Review & Submit
- [ ] Application validation
- [ ] Submission flow
- [ ] Confirmation page
- [ ] Status tracking
- [ ] Email confirmations

---

## Phase 5: Admin Dashboard (Week 7-8)

### 5.1 Admin Layout & Navigation

**File: `app/(admin)/admin/layout.tsx`**

```typescript
// Sidebar navigation:
// - Dashboard (overview)
// - Applications (list)
// - Committee (member management)
// - Settings (system config)
// - Reports (export)
```

### 5.2 Dashboard Overview

**File: `app/(admin)/admin/page.tsx`**

```typescript
// Key Metrics:
// - Total accounts
// - Submitted applications
// - Draft applications
// - Pending recommendations

// Charts:
// - Applications over time (line chart)
// - Applicants by city (bar chart)
// - Status breakdown (pie chart)

// Recent Activity:
// - New submissions
// - New accounts
// - Recommendation received
// - Draft saves
```

### 5.3 Applications List

**File: `app/(admin)/admin/applications/page.tsx`**

```typescript
// Features:
// - Search by name/email
// - Filter by city, status, GPA
// - Sortable columns
// - Pagination
// - Export to CSV
// - Quick view row click

// Columns:
// - Photo
// - Name
// - City
// - GPA
// - Status
// - Recommendations (X/2)
```

### 5.4 Application Detail View

**File: `app/(admin)/admin/applications/[id]/page.tsx`**

```typescript
// Sections:
// - Personal Information
// - Address
// - Education
// - Documents (view/download)
// - Endorsement
// - Activity Log
// - Committee Evaluations summary

// Actions:
// - View full details
// - Download all documents
// - View evaluation page
```

### 5.5 Convex Queries for Admin

```typescript
// Get application statistics
export const getStats = query({
  handler: async (ctx) => {
    const total = await ctx.db.query("applications").collect();
    const submitted = total.filter(a => a.status === "submitted");
    const byCity = groupBy(total, "city");
    
    return {
      totalAccounts: total.length,
      submittedApps: submitted.length,
      draftApps: total.filter(a => a.status === "draft").length,
      byCity,
      // ... more stats
    };
  },
});

// Get applications with filters
export const getApplications = query({
  args: {
    status: v.optional(v.string()),
    city: v.optional(v.string()),
    search: v.optional(v.string()),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Filter and paginate applications
    // Join with users for name/email
  },
});
```

### Phase 5 Deliverables
- [ ] Admin dashboard overview
- [ ] Applications list with filters
- [ ] Application detail view
- [ ] Statistics and charts
- [ ] Export functionality
- [ ] Committee member management

---

## Phase 6: Committee Evaluation System (Week 9-10)

### 6.1 Committee Dashboard

**File: `app/(committee)/committee/page.tsx`**

```typescript
// Welcome message with member name
// Key metrics:
// - Submitted applications count
// - Evaluations completed by user
// - Remaining to evaluate
// - Awards available

// Candidates to Review:
// - AI-generated candidate cards
// - Quick rating interface

// Top Candidates:
// - Sorted by committee consensus
```

### 6.2 AI Summary Generation

**File: `convex/ai.ts`**

```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const generateCandidateSummary = action({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, { applicationId }) => {
    const app = await ctx.runQuery(internal.applications.getByIdInternal, {
      id: applicationId,
    });
    
    const recommendations = await ctx.runQuery(
      internal.recommendations.getByApplicationInternal,
      { applicationId }
    );
    
    const prompt = `You are reviewing a scholarship application for the William R. Stark Financial Assistance Program...

## Applicant Information
- Name: ${app.firstName} ${app.lastName}
- City: ${app.city}, Michigan
- High School: ${app.highSchoolName}
- College: ${app.collegeName}
- Major: ${app.major}
- GPA: ${app.gpa}

## Essay
${app.essayText}

## Recommendations
${recommendations.map(r => r.letterText).join("\n\n")}

Please provide:
1. A 2-3 sentence summary
2. 4 bullet points highlighting notable qualities

Format as JSON: { "summary": "...", "highlights": [...] }`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });
    
    const content = response.content[0];
    if (content.type === "text") {
      const parsed = JSON.parse(content.text);
      await ctx.runMutation(internal.applications.updateAISummary, {
        id: applicationId,
        summary: parsed.summary,
        highlights: parsed.highlights,
      });
      return parsed;
    }
    throw new Error("Failed to generate summary");
  },
});
```

### 6.3 AI-Generated Candidate Card

**File: `components/committee/CandidateCard.tsx`**

```typescript
// Display:
// - Applicant photo
// - Name, city, school
// - GPA, test scores
// - Major
// - AI Summary (2-3 sentences)
// - AI Highlights (4 bullets)
// - Recommendation status
// - Rating selector (5-point scale)
// - View Details link
```

### 6.4 Candidate Detail & Evaluation

**File: `app/(committee)/committee/candidates/[id]/page.tsx`**

```typescript
// Layout:
// - AI Candidate Card (expanded)
// - Essay viewer
// - Transcript viewer
// - Recommendation letters
// - Your Evaluation (rating + notes)
// - Other committee ratings (visible after submit)

// Rating System:
// - Strong Yes (5) 😍
// - Yes (4) 😊
// - Maybe (3) 😐
// - No (2) 😕
// - Strong No (1) 😞
```

### 6.5 Evaluation Mutations

```typescript
// Submit or update evaluation
export const submitEvaluation = mutation({
  args: {
    applicationId: v.id("applications"),
    rating: v.union(
      v.literal("strong_yes"), v.literal("yes"),
      v.literal("maybe"), v.literal("no"), v.literal("strong_no")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const existing = await ctx.db
      .query("evaluations")
      .withIndex("by_application_evaluator", (q) =>
        q.eq("applicationId", args.applicationId).eq("evaluatorId", identity.subject)
      )
      .first();
    
    if (existing) {
      return await ctx.db.patch(existing._id, {
        rating: args.rating,
        notes: args.notes,
        updatedAt: Date.now(),
      });
    }
    
    return await ctx.db.insert("evaluations", {
      ...args,
      evaluatorId: identity.subject,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get aggregated results
export const getResults = query({
  handler: async (ctx) => {
    const evaluations = await ctx.db.query("evaluations").collect();
    // Aggregate by application, calculate averages
    // Return sorted list
  },
});
```

### 6.6 Results & Selection Page

**File: `app/(committee)/committee/results/page.tsx`**

```typescript
// Evaluation Progress:
// - Percentage complete
// - List of committee members with completion status

// Candidate Rankings:
// - Sorted by average rating
// - Show all ratings breakdown

// Selection (Admin only):
// - Checkboxes to select 2 recipients
// - Finalize button
// - Confirmation modal
```

### Phase 6 Deliverables
- [ ] Committee dashboard
- [ ] AI summary generation (Claude integration)
- [ ] Candidate cards with AI summaries
- [ ] Evaluation interface
- [ ] Results aggregation
- [ ] Selection workflow (admin)
- [ ] Rating visibility rules

---

## Phase 7: Polish & Deployment (Week 11-12)

### 7.1 Animation System

**File: `lib/motion.ts`**

```typescript
import { Variants } from "framer-motion";

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] },
};

export const staggerContainer: Variants = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

export const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] },
};
```

### 7.2 Component Animations

```typescript
// Page transitions
// Step progress animations
// Upload zone pulse on drag
// Card hover effects
// Button hover scale + glow
// Checkmark draw animation
// Toast notifications slide-in
// Modal scale + fade
```

### 7.3 Accessibility Audit

- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast checks
- [ ] Focus management
- [ ] Form labels and ARIA

### 7.4 Performance Optimization

- [ ] Image optimization (Next.js Image)
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Convex query optimization
- [ ] File upload chunking
- [ ] Caching strategies

### 7.5 Mobile Responsiveness

- [ ] Mobile-first design
- [ ] Touch-friendly inputs
- [ ] Responsive tables
- [ ] Mobile navigation
- [ ] Camera capture for photos

### 7.6 Testing

```bash
# Unit tests
pnpm test

# E2E tests with Playwright
pnpm test:e2e

# Test coverage
pnpm test:coverage
```

### 7.7 Security Review

- [ ] Input sanitization
- [ ] File upload validation
- [ ] Token security
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] CSP headers
- [ ] Secrets management

### 7.8 Deployment

```bash
# Build
pnpm build

# Deploy to Vercel
vercel --prod

# Configure Convex production
npx convex deploy
```

### Phase 7 Deliverables
- [ ] Framer Motion animations throughout
- [ ] Accessibility audit passed
- [ ] Performance optimized
- [ ] Mobile responsive
- [ ] Test coverage > 80%
- [ ] Security review passed
- [ ] Production deployment

---

## Key Implementation Details

### File Upload Strategy

```typescript
// 1. Client requests upload URL from Convex
const uploadUrl = await convex.mutation("storage:generateUploadUrl", {
  type: "transcript",
});

// 2. Client uploads file directly to Convex storage
const result = await fetch(uploadUrl, {
  method: "POST",
  headers: { "Content-Type": file.type },
  body: file,
});
const { storageId } = await result.json();

// 3. Client saves file reference to application
await convex.mutation("applications:saveFile", {
  applicationId,
  storageId,
  type: "transcript",
});
```

### Email Triggers

| Event | Email Sent | Recipient |
|-------|------------|-----------|
| Account created | Welcome | Applicant |
| Email verification | Verification link | Applicant |
| First step saved | Application started | Applicant |
| Recommendation requested | Request letter | Recommender |
| 7 days no response | Reminder | Recommender |
| Recommendation submitted | Confirmation | Applicant |
| Application submitted | Confirmation | Applicant |
| Selection finalized | Selected/Not selected | All applicants |

### AI Summary Triggers

1. Application submitted → Generate summary
2. Recommendation received → Regenerate summary
3. Admin manual refresh → Regenerate

### Rating Visibility Rules

- Before submitting: Show only your rating (if any)
- After submitting: Show all committee ratings
- Anonymous mode: Show aggregate only (chairman toggle)

---

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| 1. Foundation | Week 1-2 | Project setup, auth, database, landing skeleton |
| 2. Applicant Portal | Week 3-4 | Dashboard, steps 1-5, documents |
| 3. Recommendations | Week 5 | Step 6, recommender portal, emails |
| 4. Review & Submit | Week 6 | Step 7, confirmation, status tracking |
| 5. Admin Dashboard | Week 7-8 | Dashboard, applications list, detail view |
| 6. Committee System | Week 9-10 | AI summaries, evaluation, results |
| 7. Polish & Deploy | Week 11-12 | Animations, testing, security, deployment |

**Total Estimated Duration: 12 weeks**

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| AI API failures | Fallback to manual summaries; retry logic |
| Email delivery issues | Use Resend with fallback; in-app notifications |
| File upload size limits | Client-side validation; chunking for large files |
| Concurrent editing | Optimistic UI; conflict resolution |
| Token expiration | Clear messaging; re-request workflow |

---

## Next Steps

1. **Review and approve** this implementation plan
2. **Set up accounts:** Convex, Resend, Anthropic, Vercel
3. **Configure domain** and email DNS records
4. **Begin Phase 1** - Foundation setup
5. **Weekly check-ins** to review progress and adjust timeline

---

*Plan Version: 1.0*
*Created: February 1, 2026*
