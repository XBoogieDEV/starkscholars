# PRD: William R. Stark Financial Assistance Platform

**Version:** 2.0  
**Date:** February 1, 2026  
**Author:** Claude (via Landing Page PRD Skill)  
**Status:** Draft  
**Tech Stack:** Next.js 14+, ShadCN/UI, Convex, Better Auth, TypeScript, Tailwind CSS, Framer Motion

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture Overview](#system-architecture-overview)
3. [Tech Stack Specifications](#tech-stack-specifications)
4. [Database Schema (Convex)](#database-schema-convex)
5. [Authentication & Authorization](#authentication--authorization)
6. [Part A: Public Landing Page](#part-a-public-landing-page)
7. [Part B: Applicant Portal](#part-b-applicant-portal)
8. [Part C: Recommender Portal](#part-c-recommender-portal)
9. [Part D: Admin Dashboard](#part-d-admin-dashboard)
10. [Part E: Committee Evaluation System](#part-e-committee-evaluation-system)
11. [AI Integration](#ai-integration)
12. [File Storage & Document Handling](#file-storage--document-handling)
13. [Email System](#email-system)
14. [Motion & Animation Specifications](#motion--animation-specifications)
15. [Implementation Roadmap](#implementation-roadmap)

---

## Executive Summary

This PRD outlines a complete scholarship application platform for the **William R. Stark Financial Assistance Program**. The system consists of five interconnected parts:

1. **Public Landing Page** — Marketing and conversion (detailed in v1.0 PRD)
2. **Applicant Portal** — Multi-step application workflow with document uploads
3. **Recommender Portal** — Secure portal for recommendation letter submission
4. **Admin Dashboard** — Application tracking, statistics, and management
5. **Committee Evaluation System** — AI-enhanced candidate review and selection

The platform serves Michigan students applying for two $500 scholarships, with a committee of 6 members reviewing and selecting recipients.

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           NEXT.JS APPLICATION                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Landing    │  │  Applicant   │  │ Recommender  │  │    Admin    │ │
│  │    Page      │  │   Portal     │  │   Portal     │  │  Dashboard  │ │
│  │   (Public)   │  │   (Auth)     │  │  (Token)     │  │   (Auth)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    COMMITTEE EVALUATION SYSTEM                    │  │
│  │         (AI Summaries, Candidate Cards, Selection Tools)         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                           API LAYER (CONVEX)                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Convex     │  │   Better     │  │   Convex     │  │  Anthropic  │ │
│  │   Database   │  │    Auth      │  │   Storage    │  │   Claude    │ │
│  │              │  │              │  │   (Files)    │  │    API      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                          EXTERNAL SERVICES                              │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   Resend     │  │  Vercel      │  │   Sentry     │                  │
│  │   (Email)    │  │  (Hosting)   │  │  (Errors)    │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack Specifications

### Core Framework
```json
{
  "framework": "Next.js 14.x (App Router)",
  "runtime": "Node.js 20.x",
  "language": "TypeScript 5.x",
  "package_manager": "pnpm"
}
```

### Frontend
| Library | Version | Purpose |
|---------|---------|---------|
| React | 18.x | UI Framework |
| ShadCN/UI | Latest | Component Library |
| Tailwind CSS | 3.4.x | Styling |
| Framer Motion | 11.x | Animations |
| Lucide React | Latest | Icons |
| React Hook Form | 7.x | Form Management |
| Zod | 3.x | Schema Validation |
| date-fns | 3.x | Date Formatting |
| recharts | 2.x | Charts (Admin Dashboard) |

### Backend & Database
| Service | Purpose |
|---------|---------|
| Convex | Database, Real-time Sync, File Storage, Backend Functions |
| Better Auth | Authentication (Email/Password, Magic Link) |
| Anthropic Claude API | AI Summaries (Claude 3.5 Sonnet) |
| Resend | Transactional Email |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Vercel | Hosting, Edge Functions, Analytics |
| Convex Cloud | Database Hosting, File Storage |
| Sentry | Error Monitoring |

---

## Database Schema (Convex)

### Tables

```typescript
// schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================
  // USERS & AUTH
  // ============================================
  users: defineTable({
    // Better Auth managed fields
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
    
    // Custom fields
    role: v.union(
      v.literal("applicant"),
      v.literal("admin"),
      v.literal("committee")
    ),
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // ============================================
  // APPLICATIONS
  // ============================================
  applications: defineTable({
    // Relationships
    userId: v.id("users"),
    
    // Status tracking
    status: v.union(
      v.literal("draft"),
      v.literal("in_progress"),
      v.literal("pending_recommendations"),
      v.literal("submitted"),
      v.literal("under_review"),
      v.literal("finalist"),
      v.literal("selected"),
      v.literal("not_selected"),
      v.literal("withdrawn")
    ),
    currentStep: v.number(), // 1-6
    completedSteps: v.array(v.number()),
    
    // Step 1: Personal Information
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    profilePhotoId: v.optional(v.id("_storage")),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    
    // Step 2: Address
    streetAddress: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()), // Should always be "MI"
    zipCode: v.optional(v.string()),
    
    // Step 3: Education - High School
    highSchoolName: v.optional(v.string()),
    highSchoolCity: v.optional(v.string()),
    highSchoolState: v.optional(v.string()),
    graduationDate: v.optional(v.string()),
    gpa: v.optional(v.number()),
    actScore: v.optional(v.number()),
    satScore: v.optional(v.number()),
    
    // Step 3: Education - College
    collegeName: v.optional(v.string()),
    collegeCity: v.optional(v.string()),
    collegeState: v.optional(v.string()),
    yearInCollege: v.optional(v.union(
      v.literal("freshman"),
      v.literal("sophomore"),
      v.literal("junior"),
      v.literal("senior")
    )),
    major: v.optional(v.string()),
    
    // Step 4: Eligibility Questions
    isFirstTimeApplying: v.optional(v.boolean()),
    isPreviousRecipient: v.optional(v.boolean()),
    isFullTimeStudent: v.optional(v.boolean()),
    isMichiganResident: v.optional(v.boolean()),
    
    // Step 5: Documents
    transcriptFileId: v.optional(v.id("_storage")),
    essayFileId: v.optional(v.id("_storage")),
    essayText: v.optional(v.string()), // For AI analysis
    essayWordCount: v.optional(v.number()),
    
    // Step 6: Member Endorsement
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
    
    // AI Generated Content
    aiSummary: v.optional(v.string()),
    aiHighlights: v.optional(v.array(v.string())),
    aiSummaryGeneratedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_city", ["city"])
    .index("by_submitted", ["submittedAt"]),

  // ============================================
  // RECOMMENDATIONS
  // ============================================
  recommendations: defineTable({
    applicationId: v.id("applications"),
    
    // Recommender info (provided by applicant)
    recommenderEmail: v.string(),
    recommenderName: v.optional(v.string()),
    recommenderType: v.union(
      v.literal("educator"),
      v.literal("community_group"),
      v.literal("other")
    ),
    recommenderOrganization: v.optional(v.string()),
    relationship: v.optional(v.string()),
    
    // Token for secure access
    accessToken: v.string(),
    tokenExpiresAt: v.number(),
    
    // Status
    status: v.union(
      v.literal("pending"),
      v.literal("email_sent"),
      v.literal("viewed"),
      v.literal("submitted")
    ),
    
    // Submitted recommendation
    letterFileId: v.optional(v.id("_storage")),
    letterText: v.optional(v.string()), // For AI analysis
    submittedAt: v.optional(v.number()),
    
    // Email tracking
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

  // ============================================
  // COMMITTEE EVALUATIONS
  // ============================================
  evaluations: defineTable({
    applicationId: v.id("applications"),
    evaluatorId: v.id("users"),
    
    // Simple subjective rating
    rating: v.union(
      v.literal("strong_yes"),
      v.literal("yes"),
      v.literal("maybe"),
      v.literal("no"),
      v.literal("strong_no")
    ),
    
    // Optional notes
    notes: v.optional(v.string()),
    
    // Tracking
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_application", ["applicationId"])
    .index("by_evaluator", ["evaluatorId"])
    .index("by_application_evaluator", ["applicationId", "evaluatorId"]),

  // ============================================
  // COMMITTEE MEMBERS
  // ============================================
  committeeMembers: defineTable({
    userId: v.id("users"),
    name: v.string(),
    title: v.string(),
    phone: v.optional(v.string()),
    isChairman: v.boolean(),
    isExOfficio: v.boolean(),
    order: v.number(), // Display order
  })
    .index("by_user", ["userId"]),

  // ============================================
  // ACTIVITY LOG
  // ============================================
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

  // ============================================
  // SYSTEM SETTINGS
  // ============================================
  settings: defineTable({
    key: v.string(),
    value: v.string(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.id("users")),
  })
    .index("by_key", ["key"]),
});
```

---

## Authentication & Authorization

### Better Auth Configuration

```typescript
// lib/auth.ts

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
      // Use Resend to send magic link
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
      // Add role to session
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

### Role-Based Access Control

| Role | Access |
|------|--------|
| `applicant` | Own application, profile, document uploads |
| `committee` | All applications (read), evaluations (read/write), AI summaries |
| `admin` | Everything + settings, user management, bulk operations |

### Route Protection

```typescript
// middleware.ts

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
      return redirectToLogin(request);
    }
    if (session.user.role !== "applicant") {
      return redirectToHome(request);
    }
  }
  
  // Admin routes
  if (pathname.startsWith("/admin")) {
    if (!session || session.user.role !== "admin") {
      return redirectToUnauthorized(request);
    }
  }
  
  // Committee routes
  if (pathname.startsWith("/committee")) {
    if (!session || !["admin", "committee"].includes(session.user.role)) {
      return redirectToUnauthorized(request);
    }
  }
  
  return NextResponse.next();
}
```

---

## Part A: Public Landing Page

*See PRD v1.0 for complete landing page specifications.*

### CTA Integration Points

| CTA Location | Destination | Action |
|--------------|-------------|--------|
| Hero Primary CTA | `/apply` | If logged in → Dashboard; If not → Login/Register modal |
| Value Stack CTA | `/apply` | Same as above |
| Secondary CTA | `/apply` | Same as above |
| Sticky Bar CTA | `/apply` | Same as above |

### Registration Flow

```
Landing Page CTA Click
         │
         ▼
┌─────────────────────┐
│  Auth Modal Opens   │
│  ┌───────────────┐  │
│  │ Create Account│  │
│  │ ─────────────│  │
│  │ Email         │  │
│  │ Password      │  │
│  │ Confirm Pass  │  │
│  │               │  │
│  │ [Sign Up]     │  │
│  │               │  │
│  │ Already have  │  │
│  │ an account?   │  │
│  │ [Sign In]     │  │
│  └───────────────┘  │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Verification Email  │
│ Sent                │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Email Verified      │
│ → Redirect to       │
│   /apply/dashboard  │
└─────────────────────┘
```

---

## Part B: Applicant Portal

### URL Structure

```
/apply                    → Redirect to dashboard or login
/apply/dashboard          → Application dashboard/home
/apply/step/1             → Personal Information
/apply/step/2             → Address
/apply/step/3             → Education
/apply/step/4             → Eligibility
/apply/step/5             → Documents & Essay
/apply/step/6             → Recommendations
/apply/step/7             → Review & Submit
/apply/confirmation       → Submission confirmation
/apply/status             → Track application status
```

### Application Dashboard

**Route:** `/apply/dashboard`

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌─────────┐                                           [Profile ▼]     │
│  │  LOGO   │  William R. Stark Financial Assistance                    │
│  └─────────┘                                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Welcome, [First Name]!                                                 │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    APPLICATION PROGRESS                          │   │
│  │                                                                  │   │
│  │  ████████████████████████░░░░░░░░░░░░░░░░░░░  45% Complete      │   │
│  │                                                                  │   │
│  │  Steps: 3 of 7 completed                                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                                                                   │ │
│  │   ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐│ │
│  │   │  ✓  │────│  ✓  │────│  ✓  │────│  ○  │────│  ○  │────│  ○  ││ │
│  │   └─────┘    └─────┘    └─────┘    └─────┘    └─────┘    └─────┘│ │
│  │   Personal   Address   Education  Eligibility Documents  Review │ │
│  │                                                                   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  ⚠️  DEADLINE REMINDER                                           │  │
│  │                                                                   │  │
│  │  Applications due April 15, 2026 at 11:59 PM EST                 │  │
│  │                                                                   │  │
│  │  Time remaining: 73 days, 14 hours, 23 minutes                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────┐  ┌──────────────────────────┐           │
│  │  📋 NEXT STEP            │  │  📨 RECOMMENDATIONS      │           │
│  │                          │  │                          │           │
│  │  Complete Eligibility    │  │  0 of 2 received         │           │
│  │  Questions               │  │                          │           │
│  │                          │  │  • [Pending] Educator    │           │
│  │  [Continue Application]  │  │  • [Not sent] Community  │           │
│  │                          │  │                          │           │
│  └──────────────────────────┘  └──────────────────────────┘           │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  📄 REQUIRED DOCUMENTS                                           │  │
│  │                                                                   │  │
│  │  ☑️  Profile Photo (uploaded)                                    │  │
│  │  ☐  Transcript (official or unofficial)                          │  │
│  │  ☐  Essay (500 words)                                            │  │
│  │  ☐  Recommendation Letter 1                                      │  │
│  │  ☐  Recommendation Letter 2                                      │  │
│  │                                                                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Step-by-Step Application Workflow

#### Step 1: Personal Information

**Route:** `/apply/step/1`

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  STEP 1 OF 7                                                           │
│  ───────────────────────────────────────────                           │
│  Personal Information                                                   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  PROFILE PHOTO                                                  │   │
│  │  ┌─────────────────┐                                            │   │
│  │  │                 │  Upload a clear photo of yourself.         │   │
│  │  │    [Camera]     │  This will be used for your                │   │
│  │  │    [Upload]     │  application ID card.                      │   │
│  │  │                 │                                            │   │
│  │  │  + Add Photo    │  Requirements:                             │   │
│  │  │                 │  • JPEG or PNG format                      │   │
│  │  └─────────────────┘  • Max 5MB                                 │   │
│  │                       • Square or portrait orientation          │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────────────┐  ┌──────────────────────────┐           │
│  │  First Name *            │  │  Last Name *             │           │
│  │  ┌────────────────────┐  │  │  ┌────────────────────┐  │           │
│  │  │                    │  │  │  │                    │  │           │
│  │  └────────────────────┘  │  │  └────────────────────┘  │           │
│  └──────────────────────────┘  └──────────────────────────┘           │
│                                                                         │
│  ┌──────────────────────────┐  ┌──────────────────────────┐           │
│  │  Phone Number *          │  │  Date of Birth *         │           │
│  │  ┌────────────────────┐  │  │  ┌────────────────────┐  │           │
│  │  │ (___) ___-____     │  │  │  │ MM / DD / YYYY     │  │           │
│  │  └────────────────────┘  │  │  └────────────────────┘  │           │
│  └──────────────────────────┘  └──────────────────────────┘           │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Email Address *                                                │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │ [Pre-filled from account]                                 │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  │  ℹ️ This is the email associated with your account              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│                                                                         │
│  ┌────────────────┐                           ┌────────────────────┐   │
│  │     Back       │                           │   Save & Continue  │   │
│  └────────────────┘                           └────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Profile Photo Upload Component:**

```typescript
// components/apply/ProfilePhotoUpload.tsx

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
}

// Features:
// - Drag & drop zone
// - Click to select file
// - Camera capture option (mobile)
// - Crop/adjust modal before upload
// - Progress indicator during upload
// - Preview with edit/remove options
// - Framer Motion animations for all states
```

#### Step 2: Address

**Route:** `/apply/step/2`

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  STEP 2 OF 7                                                           │
│  ───────────────────────────────────────────                           │
│  Permanent Address                                                      │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  ⚠️  MICHIGAN RESIDENTS ONLY                                    │   │
│  │                                                                  │   │
│  │  This scholarship is only available to permanent residents      │   │
│  │  of the State of Michigan.                                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Street Address *                                               │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │                                                           │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────────────┐  ┌───────────┐  ┌────────────────┐       │
│  │  City *                  │  │  State *  │  │  ZIP Code *    │       │
│  │  ┌────────────────────┐  │  │  ┌─────┐  │  │  ┌──────────┐  │       │
│  │  │                    │  │  │  │ MI ▼│  │  │  │          │  │       │
│  │  └────────────────────┘  │  │  └─────┘  │  │  └──────────┘  │       │
│  │                          │  │  (locked) │  │                │       │
│  └──────────────────────────┘  └───────────┘  └────────────────┘       │
│                                                                         │
│  ┌────────────────┐                           ┌────────────────────┐   │
│  │     Back       │                           │   Save & Continue  │   │
│  └────────────────┘                           └────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Validation:**
- State field is locked to "MI" (Michigan) only
- ZIP code validation for Michigan ZIP codes (480xx-499xx)
- City auto-suggest from Michigan cities database

#### Step 3: Education

**Route:** `/apply/step/3`

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  STEP 3 OF 7                                                           │
│  ───────────────────────────────────────────                           │
│  Education Information                                                  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  HIGH SCHOOL                                                    │   │
│  │                                                                  │   │
│  │  High School Name *                                             │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │ 🔍 Start typing to search...                              │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  │                                                                  │   │
│  │  ┌──────────────────────────┐  ┌──────────────────────────┐    │   │
│  │  │  City *                  │  │  State *                 │    │   │
│  │  │  ┌────────────────────┐  │  │  ┌────────────────────┐  │    │   │
│  │  │  │                    │  │  │  │                    │  │    │   │
│  │  │  └────────────────────┘  │  │  └────────────────────┘  │    │   │
│  │  └──────────────────────────┘  └──────────────────────────┘    │   │
│  │                                                                  │   │
│  │  Graduation Date *                                              │   │
│  │  ┌────────────────────────────┐                                 │   │
│  │  │  Month ▼    Year ▼        │                                 │   │
│  │  └────────────────────────────┘                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  ACADEMIC PERFORMANCE                                           │   │
│  │                                                                  │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │   │
│  │  │  GPA *      │  │  ACT Score  │  │  SAT Score  │              │   │
│  │  │  ┌───────┐  │  │  ┌───────┐  │  │  ┌───────┐  │              │   │
│  │  │  │  3.5  │  │  │  │  28   │  │  │  │ 1320  │  │              │   │
│  │  │  └───────┘  │  │  └───────┘  │  │  └───────┘  │              │   │
│  │  │  Min: 3.0   │  │  Optional   │  │  Optional   │              │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘              │   │
│  │                                                                  │   │
│  │  ℹ️ GPA must be 3.0 or higher on a 4.0 scale                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  COLLEGE/UNIVERSITY (Current or Planned)                        │   │
│  │                                                                  │   │
│  │  College Name *                                                 │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │ 🔍 Start typing to search...                              │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  │  ℹ️ Must be a U.S. accredited 4-year institution                │   │
│  │                                                                  │   │
│  │  ┌──────────────────────────┐  ┌──────────────────────────┐    │   │
│  │  │  City                    │  │  State                   │    │   │
│  │  │  ┌────────────────────┐  │  │  ┌────────────────────┐  │    │   │
│  │  │  │ (Auto-filled)      │  │  │  │ (Auto-filled)      │  │    │   │
│  │  │  └────────────────────┘  │  │  └────────────────────┘  │    │   │
│  │  └──────────────────────────┘  └──────────────────────────┘    │   │
│  │                                                                  │   │
│  │  ┌──────────────────────────┐  ┌──────────────────────────┐    │   │
│  │  │  Year in College *       │  │  Intended Major          │    │   │
│  │  │  ┌────────────────────┐  │  │  ┌────────────────────┐  │    │   │
│  │  │  │ Freshman        ▼  │  │  │  │                    │  │    │   │
│  │  │  └────────────────────┘  │  │  └────────────────────┘  │    │   │
│  │  └──────────────────────────┘  └──────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────┐                           ┌────────────────────┐   │
│  │     Back       │                           │   Save & Continue  │   │
│  └────────────────┘                           └────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Auto-complete search for high schools and colleges
- Auto-fill city/state when school is selected
- GPA validation (minimum 3.0)
- Year in college dropdown: Freshman, Sophomore, Junior, Senior

#### Step 4: Eligibility Questions

**Route:** `/apply/step/4`

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  STEP 4 OF 7                                                           │
│  ───────────────────────────────────────────                           │
│  Eligibility Questions                                                  │
│                                                                         │
│  Please answer the following questions honestly.                        │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  1. Is this your first time applying for this scholarship? *    │   │
│  │                                                                  │   │
│  │     ┌─────────────────┐  ┌─────────────────┐                    │   │
│  │     │  ○  Yes         │  │  ○  No          │                    │   │
│  │     └─────────────────┘  └─────────────────┘                    │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  2. Are you a previous recipient of this scholarship? *         │   │
│  │                                                                  │   │
│  │     ┌─────────────────┐  ┌─────────────────┐                    │   │
│  │     │  ○  Yes         │  │  ○  No          │                    │   │
│  │     └─────────────────┘  └─────────────────┘                    │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  3. Are you currently enrolled as a full-time student? *        │   │
│  │                                                                  │   │
│  │     ┌─────────────────┐  ┌─────────────────┐                    │   │
│  │     │  ○  Yes         │  │  ○  No          │                    │   │
│  │     └─────────────────┘  └─────────────────┘                    │   │
│  │                                                                  │   │
│  │     ⚠️  You must be a full-time student to qualify              │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  4. Are you a permanent resident of Michigan? *                 │   │
│  │                                                                  │   │
│  │     ┌─────────────────┐  ┌─────────────────┐                    │   │
│  │     │  ○  Yes         │  │  ○  No          │                    │   │
│  │     └─────────────────┘  └─────────────────┘                    │   │
│  │                                                                  │   │
│  │     ⚠️  You must be a Michigan resident to qualify              │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────┐                           ┌────────────────────┐   │
│  │     Back       │                           │   Save & Continue  │   │
│  └────────────────┘                           └────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Validation:**
- Full-time student = Yes required
- Michigan resident = Yes required
- Show warning/blocker if eligibility criteria not met

#### Step 5: Documents & Essay

**Route:** `/apply/step/5`

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  STEP 5 OF 7                                                           │
│  ───────────────────────────────────────────                           │
│  Documents & Essay                                                      │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  📄 TRANSCRIPT                                                  │   │
│  │                                                                  │   │
│  │  Upload your official or unofficial transcript showing          │   │
│  │  your current GPA.                                              │   │
│  │                                                                  │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │                                                         │    │   │
│  │  │     ┌──────────────────────┐                            │    │   │
│  │  │     │   📎                 │                            │    │   │
│  │  │     │                      │                            │    │   │
│  │  │     │  Drop file here      │                            │    │   │
│  │  │     │  or click to browse  │                            │    │   │
│  │  │     │                      │                            │    │   │
│  │  │     └──────────────────────┘                            │    │   │
│  │  │                                                         │    │   │
│  │  │  Accepted: PDF, JPG, PNG • Max size: 10MB               │    │   │
│  │  │                                                         │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  │                                                                  │   │
│  │  ☑️ Transcript uploaded: transcript_2026.pdf (2.3 MB)           │   │
│  │     [View] [Replace] [Remove]                                   │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  ✍️ ESSAY                                                       │   │
│  │                                                                  │   │
│  │  Write a 500-word essay on the following topic:                 │   │
│  │                                                                  │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │  "How Will Furthering My Studies Help Me Improve         │  │   │
│  │  │   My Community?"                                          │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  │                                                                  │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │  Choose how to submit your essay:                       │    │   │
│  │  │                                                         │    │   │
│  │  │  ┌─────────────────────┐  ┌─────────────────────┐      │    │   │
│  │  │  │  ☑️ Type directly   │  │  ○ Upload document  │      │    │   │
│  │  │  └─────────────────────┘  └─────────────────────┘      │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  │                                                                  │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │                                                           │  │   │
│  │  │  [Rich text editor with formatting toolbar]               │  │   │
│  │  │                                                           │  │   │
│  │  │  Education has always been the cornerstone of progress   │  │   │
│  │  │  in my community. Growing up in Detroit, I witnessed...  │  │   │
│  │  │                                                           │  │   │
│  │  │                                                           │  │   │
│  │  │                                                           │  │   │
│  │  │                                                           │  │   │
│  │  │                                                           │  │   │
│  │  │                                                           │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  │                                                                  │   │
│  │  Word count: 342 / 500 (minimum 450, maximum 550)               │   │
│  │  ████████████████████████████████░░░░░░░░░░░░░  68%             │   │
│  │                                                                  │   │
│  │  💡 Tips for a strong essay:                                    │   │
│  │  • Be specific about your community and its needs               │   │
│  │  • Explain how your field of study relates to community impact  │   │
│  │  • Share personal experiences that shaped your perspective      │   │
│  │  • Describe concrete actions you plan to take                   │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────┐   ┌────────────────┐   ┌────────────────────┐     │
│  │     Back       │   │   Save Draft   │   │   Save & Continue  │     │
│  └────────────────┘   └────────────────┘   └────────────────────┘     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Essay Features:**
- Toggle between typing directly or uploading a document
- Live word count with visual progress bar
- Auto-save every 30 seconds
- Word count validation (450-550 words)
- Simple rich text formatting (bold, italic, paragraphs)
- Writing tips/prompts displayed

**Document Upload Component:**

```typescript
// components/apply/DocumentUpload.tsx

interface DocumentUploadProps {
  type: "transcript" | "essay" | "recommendation";
  acceptedFormats: string[];
  maxSize: number; // in MB
  currentFile?: {
    name: string;
    size: string;
    uploadedAt: Date;
    url: string;
  };
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
}

// Features:
// - Drag & drop zone with visual feedback
// - File type validation
// - Size validation with clear error messages
// - Upload progress indicator
// - Preview for images/PDFs
// - Replace and remove options
// - Animated states (Framer Motion)
```

#### Step 6: Recommendations

**Route:** `/apply/step/6`

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  STEP 6 OF 7                                                           │
│  ───────────────────────────────────────────                           │
│  Letters of Recommendation                                              │
│                                                                         │
│  You need TWO letters of recommendation. At least one must be from     │
│  a community group or an educator.                                      │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  📝 RECOMMENDATION 1 (Educator or Community Leader) *           │   │
│  │                                                                  │   │
│  │  ┌────────────────────────────────────────────────────────────┐ │   │
│  │  │  Recommender's Full Name *                                 │ │   │
│  │  │  ┌──────────────────────────────────────────────────────┐  │ │   │
│  │  │  │                                                      │  │ │   │
│  │  │  └──────────────────────────────────────────────────────┘  │ │   │
│  │  └────────────────────────────────────────────────────────────┘ │   │
│  │                                                                  │   │
│  │  ┌────────────────────────────────────────────────────────────┐ │   │
│  │  │  Recommender's Email Address *                             │ │   │
│  │  │  ┌──────────────────────────────────────────────────────┐  │ │   │
│  │  │  │                                                      │  │ │   │
│  │  │  └──────────────────────────────────────────────────────┘  │ │   │
│  │  │  ℹ️ We'll send them a secure link to upload their letter   │ │   │
│  │  └────────────────────────────────────────────────────────────┘ │   │
│  │                                                                  │   │
│  │  ┌──────────────────────────┐  ┌──────────────────────────┐    │   │
│  │  │  Recommender Type *      │  │  Organization/School     │    │   │
│  │  │  ┌────────────────────┐  │  │  ┌────────────────────┐  │    │   │
│  │  │  │ Educator        ▼  │  │  │  │                    │  │    │   │
│  │  │  └────────────────────┘  │  │  └────────────────────┘  │    │   │
│  │  └──────────────────────────┘  └──────────────────────────┘    │   │
│  │                                                                  │   │
│  │  ┌────────────────────────────────────────────────────────────┐ │   │
│  │  │  How does this person know you?                            │ │   │
│  │  │  ┌──────────────────────────────────────────────────────┐  │ │   │
│  │  │  │ e.g., "AP History teacher for 2 years"              │  │ │   │
│  │  │  └──────────────────────────────────────────────────────┘  │ │   │
│  │  └────────────────────────────────────────────────────────────┘ │   │
│  │                                                                  │   │
│  │  Status: ⏳ Email not yet sent                                  │   │
│  │          [Send Request Now]                                      │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  📝 RECOMMENDATION 2 *                                          │   │
│  │                                                                  │   │
│  │  [Same fields as above]                                         │   │
│  │                                                                  │   │
│  │  Recommender Type options:                                      │   │
│  │  • Educator (teacher, professor, counselor)                     │   │
│  │  • Community Group (church, nonprofit, organization leader)     │   │
│  │  • Other (employer, mentor, coach)                              │   │
│  │                                                                  │   │
│  │  Status: ✅ Submitted on Jan 28, 2026                           │   │
│  │          [View Letter] [Thank Recommender]                       │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  📋 RECOMMENDATION STATUS OVERVIEW                              │   │
│  │                                                                  │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │  Rec 1: Dr. Sarah Johnson (Educator)                    │    │   │
│  │  │  ⏳ Request sent Jan 15, 2026                           │    │   │
│  │  │  Last reminder: Jan 22, 2026                            │    │   │
│  │  │  [Send Reminder] [Change Recommender]                   │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  │                                                                  │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │  Rec 2: Pastor Michael Williams (Community Group)       │    │   │
│  │  │  ✅ Submitted Jan 28, 2026                              │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  │                                                                  │   │
│  │  ⚠️  Both recommendations must be received before you can       │   │
│  │     submit your application.                                    │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────┐                           ┌────────────────────┐   │
│  │     Back       │                           │   Save & Continue  │   │
│  └────────────────┘                           └────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Recommendation Workflow:**

```
Applicant enters recommender email
              │
              ▼
    [Send Request Now]
              │
              ▼
System generates unique access token
              │
              ▼
Email sent to recommender with secure link
              │
              ▼
Status updates to "Email Sent"
              │
              ▼
Recommender clicks link → Recommender Portal
              │
              ▼
Recommender uploads letter
              │
              ▼
Status updates to "Submitted" ✅
              │
              ▼
Applicant notified via email
              │
              ▼
Applicant can view letter (optional)
```

**Recommendation Status States:**
| Status | Icon | Description |
|--------|------|-------------|
| `pending` | ⚪ | Recommender info entered, email not sent |
| `email_sent` | ⏳ | Request email sent, awaiting response |
| `viewed` | 👀 | Recommender viewed the upload page |
| `submitted` | ✅ | Letter received |

#### Step 7: Review & Submit

**Route:** `/apply/step/7`

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  STEP 7 OF 7                                                           │
│  ───────────────────────────────────────────                           │
│  Review & Submit                                                        │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  ✅ APPLICATION CHECKLIST                                       │   │
│  │                                                                  │   │
│  │  ☑️  Personal Information complete                              │   │
│  │  ☑️  Address verified (Michigan resident)                       │   │
│  │  ☑️  Education information complete                             │   │
│  │  ☑️  GPA requirement met (3.5 ≥ 3.0)                            │   │
│  │  ☑️  Eligibility questions answered                             │   │
│  │  ☑️  Profile photo uploaded                                     │   │
│  │  ☑️  Transcript uploaded                                        │   │
│  │  ☑️  Essay complete (498 words)                                 │   │
│  │  ☑️  Recommendation 1 received                                  │   │
│  │  ☑️  Recommendation 2 received                                  │   │
│  │                                                                  │   │
│  │  10 of 10 requirements complete                                 │   │
│  │  ████████████████████████████████████████████  100%             │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  👤 PERSONAL INFORMATION                              [Edit]    │   │
│  │  ────────────────────────────────────────────────────────────   │   │
│  │  Name: Marcus Johnson                                           │   │
│  │  Phone: (313) 555-0123                                          │   │
│  │  Email: marcus.johnson@email.com                                │   │
│  │  Date of Birth: March 15, 2006                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  🏠 ADDRESS                                            [Edit]    │   │
│  │  ────────────────────────────────────────────────────────────   │   │
│  │  123 Main Street                                                │   │
│  │  Detroit, MI 48201                                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  🎓 EDUCATION                                          [Edit]    │   │
│  │  ────────────────────────────────────────────────────────────   │   │
│  │  High School: Cass Technical High School, Detroit, MI           │   │
│  │  Graduation: June 2024                                          │   │
│  │  GPA: 3.5 | ACT: 28 | SAT: --                                   │   │
│  │                                                                  │   │
│  │  College: University of Michigan, Ann Arbor, MI                 │   │
│  │  Year: Freshman                                                 │   │
│  │  Major: Public Health                                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  📄 DOCUMENTS                                          [Edit]    │   │
│  │  ────────────────────────────────────────────────────────────   │   │
│  │  Profile Photo: ✅ Uploaded                           [View]    │   │
│  │  Transcript: ✅ transcript_2026.pdf                   [View]    │   │
│  │  Essay: ✅ 498 words                                  [View]    │   │
│  │  Recommendation 1: ✅ Submitted by Dr. Sarah Johnson  [View]    │   │
│  │  Recommendation 2: ✅ Submitted by Pastor M. Williams [View]    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  📋 USC/OGC MEMBER ENDORSEMENT                                  │   │
│  │  ────────────────────────────────────────────────────────────   │   │
│  │                                                                  │   │
│  │  Your application must be endorsed by a member who is           │   │
│  │  financial with the United Supreme Council or the Order         │   │
│  │  of the Golden Circle.                                          │   │
│  │                                                                  │   │
│  │  Endorser's Name *                                              │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │                                                           │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  │                                                                  │   │
│  │  Orient and Consistory/Assembly *                               │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │                                                           │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  │                                                                  │   │
│  │  ┌──────────────────────────┐  ┌──────────────────────────┐    │   │
│  │  │  Phone (optional)        │  │  Email (optional)        │    │   │
│  │  │  ┌────────────────────┐  │  │  ┌────────────────────┐  │    │   │
│  │  │  │                    │  │  │  │                    │  │    │   │
│  │  │  └────────────────────┘  │  │  └────────────────────┘  │    │   │
│  │  └──────────────────────────┘  └──────────────────────────┘    │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  ✍️ CERTIFICATION & SIGNATURE                                   │   │
│  │  ────────────────────────────────────────────────────────────   │   │
│  │                                                                  │   │
│  │  ☐ I certify that all information provided in this application │   │
│  │    is true and accurate to the best of my knowledge.            │   │
│  │                                                                  │   │
│  │  ☐ I understand that if selected, my name, photograph, city,   │   │
│  │    state, major, and university may be published on the         │   │
│  │    William R. Stark Class website, social media, and            │   │
│  │    publications nationally or internationally.                  │   │
│  │                                                                  │   │
│  │  ☐ I understand that false information may result in           │   │
│  │    disqualification from this scholarship program.              │   │
│  │                                                                  │   │
│  │  Electronic Signature *                                         │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │  ✍️ Type your full legal name                              │  │   │
│  │  │  ┌─────────────────────────────────────────────────────┐   │  │   │
│  │  │  │                                                     │   │  │   │
│  │  │  └─────────────────────────────────────────────────────┘   │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  │                                                                  │   │
│  │  Date: February 1, 2026                                         │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────┐                           ┌────────────────────┐   │
│  │     Back       │                           │   SUBMIT           │   │
│  │                │                           │   APPLICATION      │   │
│  └────────────────┘                           └────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Submission Validation:**
- All required fields complete
- GPA ≥ 3.0
- Michigan resident confirmed
- Full-time student confirmed
- Both recommendations received
- All certifications checked
- Electronic signature matches name on application

---

## Part C: Recommender Portal

### URL Structure

```
/recommend/[token]        → Recommendation submission form
/recommend/[token]/thanks → Thank you page after submission
```

### Recommender Upload Interface

**Route:** `/recommend/[token]`

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌─────────┐                                                           │
│  │  LOGO   │  William R. Stark Financial Assistance Program            │
│  └─────────┘                                                           │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  LETTER OF RECOMMENDATION                                               │
│  ═══════════════════════════════════════════                           │
│                                                                         │
│  You have been asked to provide a letter of recommendation for:        │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │     ┌──────────┐                                                │   │
│  │     │  Photo   │   Marcus Johnson                               │   │
│  │     │          │   Applying for: William R. Stark               │   │
│  │     │          │                 Financial Assistance           │   │
│  │     └──────────┘                                                │   │
│  │                                                                  │   │
│  │     School: University of Michigan                              │   │
│  │     Relationship: AP History teacher for 2 years                │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  ℹ️ WHAT TO INCLUDE IN YOUR LETTER                              │   │
│  │                                                                  │   │
│  │  • How long and in what capacity you have known the applicant   │   │
│  │  • The applicant's academic abilities and achievements          │   │
│  │  • The applicant's character and personal qualities             │   │
│  │  • Examples of community involvement or leadership              │   │
│  │  • Why you believe they deserve this scholarship                │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  📄 UPLOAD YOUR LETTER                                          │   │
│  │                                                                  │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │                                                         │    │   │
│  │  │     ┌──────────────────────┐                            │    │   │
│  │  │     │   📎                 │                            │    │   │
│  │  │     │                      │                            │    │   │
│  │  │     │  Drop your letter    │                            │    │   │
│  │  │     │  here or click to    │                            │    │   │
│  │  │     │  browse              │                            │    │   │
│  │  │     │                      │                            │    │   │
│  │  │     └──────────────────────┘                            │    │   │
│  │  │                                                         │    │   │
│  │  │  Accepted: PDF, DOC, DOCX • Max size: 5MB               │    │   │
│  │  │                                                         │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  👤 YOUR INFORMATION                                            │   │
│  │                                                                  │   │
│  │  ┌──────────────────────────┐  ┌──────────────────────────┐    │   │
│  │  │  Your Full Name *        │  │  Your Title/Position     │    │   │
│  │  │  ┌────────────────────┐  │  │  ┌────────────────────┐  │    │   │
│  │  │  │ Dr. Sarah Johnson  │  │  │  │ AP History Teacher │  │    │   │
│  │  │  └────────────────────┘  │  │  └────────────────────┘  │    │   │
│  │  │  (Pre-filled)            │  │                          │    │   │
│  │  └──────────────────────────┘  └──────────────────────────┘    │   │
│  │                                                                  │   │
│  │  ┌────────────────────────────────────────────────────────────┐ │   │
│  │  │  Organization/School                                       │ │   │
│  │  │  ┌──────────────────────────────────────────────────────┐  │ │   │
│  │  │  │ Cass Technical High School                           │  │ │   │
│  │  │  └──────────────────────────────────────────────────────┘  │ │   │
│  │  └────────────────────────────────────────────────────────────┘ │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  ☐ I confirm that this letter is my own work and accurately    │   │
│  │    represents my assessment of the applicant.                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│                        ┌────────────────────────────┐                  │
│                        │   SUBMIT RECOMMENDATION    │                  │
│                        └────────────────────────────┘                  │
│                                                                         │
│  ⏰ This link expires on March 15, 2026                                │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Questions? Contact the scholarship committee at                       │
│  blackgoldmine@sbcglobal.net                                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Security:**
- Token-based access (no login required)
- Token expires 30 days after creation or on application deadline
- IP logging for security
- One-time submission (cannot edit after submit)

---

## Part D: Admin Dashboard

### URL Structure

```
/admin                    → Dashboard overview
/admin/applications       → All applications list
/admin/applications/[id]  → Single application detail
/admin/settings           → System settings
/admin/committee          → Committee member management
/admin/reports            → Export and reports
```

### Dashboard Overview

**Route:** `/admin`

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌─────────┐                                         [🔔] [👤 Admin ▼] │
│  │  LOGO   │  Admin Dashboard                                          │
│  └─────────┘                                                           │
│                                                                         │
├───────────────┬─────────────────────────────────────────────────────────┤
│               │                                                         │
│  NAVIGATION   │  OVERVIEW                                               │
│               │                                                         │
│  ┌─────────┐  │  ┌─────────────────────────────────────────────────┐   │
│  │ 📊      │  │  │                                                 │   │
│  │Dashboard│  │  │  Welcome back, Administrator                    │   │
│  └─────────┘  │  │                                                 │   │
│               │  │  Deadline: April 15, 2026 (73 days remaining)   │   │
│  ┌─────────┐  │  │                                                 │   │
│  │ 📋      │  │  └─────────────────────────────────────────────────┘   │
│  │ Apps    │  │                                                         │
│  └─────────┘  │  ┌─────────────────────────────────────────────────┐   │
│               │  │                                                 │   │
│  ┌─────────┐  │  │  KEY METRICS                                    │   │
│  │ 👥      │  │  │                                                 │   │
│  │Committee│  │  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│  └─────────┘  │  │  │    47     │ │    12     │ │    31     │ │     4     │
│               │  │  │  ─────    │ │  ─────    │ │  ─────    │ │  ─────    │
│  ┌─────────┐  │  │  │  Total    │ │ Submitted │ │  Draft    │ │ Pending   │
│  │ 📈      │  │  │  │ Accounts  │ │  Apps     │ │  Apps     │ │ Recs      │
│  │ Reports │  │  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘
│  └─────────┘  │  │                                                 │   │
│               │  │  ┌────────────────────────────────────────────┐ │   │
│  ┌─────────┐  │  │  │  📈 Applications Over Time                 │ │   │
│  │ ⚙️      │  │  │  │                                            │ │   │
│  │Settings │  │  │  │  [Line chart showing daily submissions]    │ │   │
│  └─────────┘  │  │  │                                            │ │   │
│               │  │  │  ▲                                         │ │   │
│               │  │  │  │    ●                                    │ │   │
│               │  │  │  │   ╱ ╲     ●                             │ │   │
│               │  │  │  │  ╱   ╲   ╱ ╲   ●                        │ │   │
│               │  │  │  │ ●     ╲ ╱   ╲ ╱ ╲                       │ │   │
│               │  │  │  │        ●     ●   ╲  ●                   │ │   │
│               │  │  │  └──────────────────────────────▶          │ │   │
│               │  │  │    Feb 1    Feb 7   Feb 14   Feb 21        │ │   │
│               │  │  │                                            │ │   │
│               │  │  └────────────────────────────────────────────┘ │   │
│               │  │                                                 │   │
│               │  └─────────────────────────────────────────────────┘   │
│               │                                                         │
│               │  ┌──────────────────────┐  ┌────────────────────────┐  │
│               │  │                      │  │                        │  │
│               │  │  🗺️ APPLICANTS       │  │  📊 STATUS             │  │
│               │  │     BY CITY          │  │     BREAKDOWN          │  │
│               │  │                      │  │                        │  │
│               │  │  Detroit ████████ 18 │  │  [Pie Chart]           │  │
│               │  │  Flint   ████░░░░  7 │  │                        │  │
│               │  │  GR      ███░░░░░  5 │  │  ● Submitted (25%)     │  │
│               │  │  Lansing ██░░░░░░  4 │  │  ● Draft (66%)         │  │
│               │  │  Other   ███░░░░░  5 │  │  ● Pending Rec (9%)    │  │
│               │  │                      │  │                        │  │
│               │  │  Total: 39 Michigan  │  │                        │  │
│               │  │         residents    │  │                        │  │
│               │  │                      │  │                        │  │
│               │  └──────────────────────┘  └────────────────────────┘  │
│               │                                                         │
│               │  ┌─────────────────────────────────────────────────┐   │
│               │  │  🕐 RECENT ACTIVITY                              │   │
│               │  │                                                  │   │
│               │  │  • Marcus Johnson submitted application (2h ago)│   │
│               │  │  • New account: Ashley Davis (5h ago)           │   │
│               │  │  • Rec received: Dr. Sarah Johnson → M.J. (1d)  │   │
│               │  │  • Draft saved: Tyrone Williams (1d ago)        │   │
│               │  │                                                  │   │
│               │  │  [View All Activity →]                          │   │
│               │  │                                                  │   │
│               │  └─────────────────────────────────────────────────┘   │
│               │                                                         │
└───────────────┴─────────────────────────────────────────────────────────┘
```

### Applications List View

**Route:** `/admin/applications`

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  APPLICATIONS                                                          │
│  ═══════════════════════════════════════════════════════════════════   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  🔍 Search by name or email...           [City ▼] [Status ▼]   │   │
│  │                                          [GPA ▼]  [Export CSV] │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Showing 12 submitted applications                                      │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  ┌─────┬──────────────┬────────────┬───────┬─────────┬────────┐ │   │
│  │  │Photo│ Name         │ City       │ GPA   │ Status  │ Recs   │ │   │
│  │  ├─────┼──────────────┼────────────┼───────┼─────────┼────────┤ │   │
│  │  │ 👤  │ Marcus       │ Detroit    │ 3.5   │ ✅      │ 2/2    │ │   │
│  │  │     │ Johnson      │            │       │Submitted│        │ │   │
│  │  ├─────┼──────────────┼────────────┼───────┼─────────┼────────┤ │   │
│  │  │ 👤  │ Ashley       │ Flint      │ 3.7   │ ✅      │ 2/2    │ │   │
│  │  │     │ Davis        │            │       │Submitted│        │ │   │
│  │  ├─────┼──────────────┼────────────┼───────┼─────────┼────────┤ │   │
│  │  │ 👤  │ Tyrone       │ Detroit    │ 3.2   │ ✅      │ 2/2    │ │   │
│  │  │     │ Williams     │            │       │Submitted│        │ │   │
│  │  ├─────┼──────────────┼────────────┼───────┼─────────┼────────┤ │   │
│  │  │ 👤  │ Keisha       │ Grand      │ 3.9   │ ✅      │ 2/2    │ │   │
│  │  │     │ Thompson     │ Rapids     │       │Submitted│        │ │   │
│  │  ├─────┼──────────────┼────────────┼───────┼─────────┼────────┤ │   │
│  │  │ 👤  │ Darnell      │ Lansing    │ 3.4   │ ⏳      │ 1/2    │ │   │
│  │  │     │ Brown        │            │       │Pending  │        │ │   │
│  │  └─────┴──────────────┴────────────┴───────┴─────────┴────────┘ │   │
│  │                                                                  │   │
│  │  Click any row to view full application details                 │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ◄ Prev  1  2  3  Next ►                                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Application Detail View (Admin)

**Route:** `/admin/applications/[id]`

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  [← Back to Applications]                                              │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  ┌───────────┐                                                  │   │
│  │  │           │  MARCUS JOHNSON                                  │   │
│  │  │   Photo   │  ══════════════════════════                      │   │
│  │  │           │                                                  │   │
│  │  │           │  Detroit, MI • GPA: 3.5 • Freshman               │   │
│  │  └───────────┘  University of Michigan                          │   │
│  │                                                                  │   │
│  │  Status: ✅ Submitted on February 1, 2026                       │   │
│  │                                                                  │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐                │   │
│  │  │ View Essay │  │View Transc │  │ View Recs  │                │   │
│  │  └────────────┘  └────────────┘  └────────────┘                │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  [Personal Info] [Education] [Documents] [Endorsement] [Activity Log]  │
│  ════════════════════════════════════════════════════════════════════  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  PERSONAL INFORMATION                                           │   │
│  │  ────────────────────────────────────────────────────────────   │   │
│  │                                                                  │   │
│  │  Full Name:    Marcus Johnson                                   │   │
│  │  Email:        marcus.johnson@email.com                         │   │
│  │  Phone:        (313) 555-0123                                   │   │
│  │  DOB:          March 15, 2006 (19 years old)                    │   │
│  │                                                                  │   │
│  │  Address:      123 Main Street                                  │   │
│  │                Detroit, MI 48201                                │   │
│  │                                                                  │   │
│  │  Account Created: January 10, 2026                              │   │
│  │  Last Login:      February 1, 2026 at 3:42 PM                   │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  COMMITTEE EVALUATIONS                                          │   │
│  │  ────────────────────────────────────────────────────────────   │   │
│  │                                                                  │   │
│  │  [Go to Evaluation Page →]                                      │   │
│  │                                                                  │   │
│  │  Current Ratings:                                               │   │
│  │  • GIG Askew: Strong Yes ⭐⭐⭐⭐⭐                              │   │
│  │  • GIG Snipe: Yes ⭐⭐⭐⭐                                       │   │
│  │  • GIG Rogers: Not yet rated                                    │   │
│  │  • GIG Allen: Maybe ⭐⭐⭐                                       │   │
│  │  • GIG Lamb: Not yet rated                                      │   │
│  │  • GIG Wilson: Not yet rated                                    │   │
│  │                                                                  │   │
│  │  Average: Strong Candidate                                      │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part E: Committee Evaluation System

### URL Structure

```
/committee                   → Evaluation dashboard
/committee/candidates        → All candidates (submitted applications)
/committee/candidates/[id]   → Single candidate evaluation view
/committee/my-evaluations    → Committee member's own evaluations
/committee/results           → Aggregated results and selection
```

### Committee Dashboard

**Route:** `/committee`

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌─────────┐                                      [🔔] [👤 GIG Askew ▼]│
│  │  LOGO   │  Committee Evaluation Portal                              │
│  └─────────┘                                                           │
│                                                                         │
├───────────────┬─────────────────────────────────────────────────────────┤
│               │                                                         │
│  NAVIGATION   │  EVALUATION OVERVIEW                                    │
│               │                                                         │
│  ┌─────────┐  │  ┌─────────────────────────────────────────────────┐   │
│  │ 📊      │  │  │                                                 │   │
│  │Overview │  │  │  Welcome, Illustrious GIG Kenny R. Askew 33°   │   │
│  └─────────┘  │  │  Financial Assistance Chairman                  │   │
│               │  │                                                 │   │
│  ┌─────────┐  │  └─────────────────────────────────────────────────┘   │
│  │ 👥      │  │                                                         │
│  │Candidates│ │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│  └─────────┘  │  │    12     │ │     8     │ │     4     │ │     2     │
│               │  │  ─────    │ │  ─────    │ │  ─────    │ │  ─────    │
│  ┌─────────┐  │  │ Submitted │ │  You've   │ │ Remaining │ │  Awards   │
│  │ ✓       │  │  │ Apps      │ │  Rated    │ │ to Rate   │ │ Available │
│  │My Evals │  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘
│  └─────────┘  │                                                         │
│               │  ┌─────────────────────────────────────────────────┐   │
│  ┌─────────┐  │  │                                                 │   │
│  │ 🏆      │  │  │  📋 CANDIDATES TO REVIEW                        │   │
│  │ Results │  │  │                                                 │   │
│  └─────────┘  │  │  These candidates are awaiting your evaluation: │   │
│               │  │                                                 │   │
│               │  │  ┌─────────────────────────────────────────────┐│   │
│               │  │  │                                             ││   │
│               │  │  │  [AI-Generated Candidate Card 1]            ││   │
│               │  │  │  [AI-Generated Candidate Card 2]            ││   │
│               │  │  │  [AI-Generated Candidate Card 3]            ││   │
│               │  │  │  [AI-Generated Candidate Card 4]            ││   │
│               │  │  │                                             ││   │
│               │  │  └─────────────────────────────────────────────┘│   │
│               │  │                                                 │   │
│               │  │  [View All Candidates →]                        │   │
│               │  │                                                 │   │
│               │  └─────────────────────────────────────────────────┘   │
│               │                                                         │
│               │  ┌─────────────────────────────────────────────────┐   │
│               │  │                                                 │   │
│               │  │  🏆 TOP CANDIDATES (by committee consensus)     │   │
│               │  │                                                 │   │
│               │  │  1. Keisha Thompson (Grand Rapids) — 4.2 avg   │   │
│               │  │  2. Marcus Johnson (Detroit) — 4.0 avg         │   │
│               │  │  3. Ashley Davis (Flint) — 3.8 avg             │   │
│               │  │                                                 │   │
│               │  │  [View Full Results →]                          │   │
│               │  │                                                 │   │
│               │  └─────────────────────────────────────────────────┘   │
│               │                                                         │
└───────────────┴─────────────────────────────────────────────────────────┘
```

### AI-Generated Candidate Card

The candidate card is a compact, scannable summary of each applicant generated by Claude AI.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                                                                   │ │
│  │  ┌──────────┐  MARCUS JOHNSON                                    │ │
│  │  │          │  ════════════════════                              │ │
│  │  │  Photo   │                                                    │ │
│  │  │          │  📍 Detroit, MI                                    │ │
│  │  │          │  🎓 University of Michigan • Freshman              │ │
│  │  └──────────┘  📊 GPA: 3.5 | ACT: 28                             │ │
│  │                🎯 Major: Public Health                           │ │
│  │                                                                   │ │
│  │  ─────────────────────────────────────────────────────────────   │ │
│  │                                                                   │ │
│  │  🤖 AI SUMMARY                                                   │ │
│  │                                                                   │ │
│  │  "Marcus demonstrates strong commitment to community health      │ │
│  │  initiatives. His essay articulates a clear vision for          │ │
│  │  establishing free health screening programs in Detroit's       │ │
│  │  underserved neighborhoods. Both recommenders highlight his     │ │
│  │  leadership in organizing a successful blood drive that         │ │
│  │  collected 150+ units."                                         │ │
│  │                                                                   │ │
│  │  ─────────────────────────────────────────────────────────────   │ │
│  │                                                                   │ │
│  │  ✨ HIGHLIGHTS                                                   │ │
│  │  • Organized school blood drive (150+ units collected)          │ │
│  │  • Volunteers at local free clinic (2 years)                    │ │
│  │  • First-generation college student                             │ │
│  │  • Plans to return to Detroit after graduation                  │ │
│  │                                                                   │ │
│  │  ─────────────────────────────────────────────────────────────   │ │
│  │                                                                   │ │
│  │  📝 RECOMMENDATIONS                                              │ │
│  │  ✅ Dr. Sarah Johnson (AP History Teacher)                       │ │
│  │  ✅ Pastor Michael Williams (Community Church)                   │ │
│  │                                                                   │ │
│  │  ┌───────────────────────────────────────────────────────────┐   │ │
│  │  │                YOUR RATING                                │   │ │
│  │  │                                                           │   │ │
│  │  │  ○ Strong Yes  ○ Yes  ○ Maybe  ○ No  ○ Strong No         │   │ │
│  │  │                                                           │   │ │
│  │  └───────────────────────────────────────────────────────────┘   │ │
│  │                                                                   │ │
│  │  ┌─────────────────┐  ┌─────────────────┐                       │ │
│  │  │  View Details   │  │  Submit Rating  │                       │ │
│  │  └─────────────────┘  └─────────────────┘                       │ │
│  │                                                                   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Candidate Detail View (Committee)

**Route:** `/committee/candidates/[id]`

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  [← Back to Candidates]                                                │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │                                                           │  │   │
│  │  │  [AI Candidate Card - Expanded Version]                   │  │   │
│  │  │                                                           │  │   │
│  │  │  With full AI summary and all highlights                  │  │   │
│  │  │                                                           │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  📖 ESSAY VIEWER                                                │   │
│  │  ────────────────────────────────────────────────────────────   │   │
│  │                                                                  │   │
│  │  Topic: "How Will Furthering My Studies Help Me Improve         │   │
│  │         My Community?"                                          │   │
│  │                                                                  │   │
│  │  Word Count: 498                                                │   │
│  │                                                                  │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │                                                           │  │   │
│  │  │  Education has always been the cornerstone of progress   │  │   │
│  │  │  in my community. Growing up in Detroit, I witnessed     │  │   │
│  │  │  firsthand how health disparities affected families...   │  │   │
│  │  │                                                           │  │   │
│  │  │  [Full essay text with comfortable reading font]         │  │   │
│  │  │                                                           │  │   │
│  │  │  ...and that is why I am committed to returning to       │  │   │
│  │  │  Detroit after completing my Public Health degree.       │  │   │
│  │  │                                                           │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  │                                                                  │   │
│  │  [Download PDF]                                                 │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────────────────┐  ┌───────────────────────────────┐  │
│  │                              │  │                               │  │
│  │  📄 TRANSCRIPT               │  │  📝 RECOMMENDATION 1          │  │
│  │                              │  │                               │  │
│  │  [PDF Viewer]                │  │  From: Dr. Sarah Johnson      │  │
│  │                              │  │  Title: AP History Teacher    │  │
│  │  GPA: 3.5                    │  │  Cass Technical High School   │  │
│  │                              │  │                               │  │
│  │  [Download] [Fullscreen]     │  │  [View Letter]                │  │
│  │                              │  │                               │  │
│  └──────────────────────────────┘  └───────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────┐                                      │
│  │                              │                                      │
│  │  📝 RECOMMENDATION 2         │                                      │
│  │                              │                                      │
│  │  From: Pastor Michael Williams                                      │
│  │  Title: Senior Pastor                                               │
│  │  Greater Grace Community Church                                     │
│  │                                                                      │
│  │  [View Letter]               │                                      │
│  │                              │                                      │
│  └──────────────────────────────┘                                      │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  🗳️ YOUR EVALUATION                                             │   │
│  │  ────────────────────────────────────────────────────────────   │   │
│  │                                                                  │   │
│  │  Rate this candidate:                                           │   │
│  │                                                                  │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │                                                         │    │   │
│  │  │   😍          😊          😐          😕          😞    │    │   │
│  │  │                                                         │    │   │
│  │  │  Strong      Yes       Maybe       No        Strong    │    │   │
│  │  │   Yes                                          No      │    │   │
│  │  │                                                         │    │   │
│  │  │   ○           ●          ○           ○          ○      │    │   │
│  │  │                                                         │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  │                                                                  │   │
│  │  Notes (optional):                                              │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │ Strong community focus. Essay clearly articulates vision │  │   │
│  │  │ for giving back. Good recommendations.                   │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  │                                                                  │   │
│  │  ┌────────────────────────────────┐                             │   │
│  │  │     Submit Evaluation          │                             │   │
│  │  └────────────────────────────────┘                             │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  👥 OTHER COMMITTEE RATINGS                                     │   │
│  │  ────────────────────────────────────────────────────────────   │   │
│  │                                                                  │   │
│  │  (Visible only after you submit your evaluation)                │   │
│  │                                                                  │   │
│  │  GIG Askew (Chairman): Strong Yes                               │   │
│  │  GIG Snipe: Yes                                                 │   │
│  │  GIG Rogers: Not yet rated                                      │   │
│  │  GIG Allen: Maybe                                               │   │
│  │  GIG Lamb: Yes                                                  │   │
│  │  GIG Wilson (Ex-Officio): Not yet rated                         │   │
│  │                                                                  │   │
│  │  Committee Average: 4.0 / 5.0                                   │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Selection Results View

**Route:** `/committee/results`

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  SELECTION RESULTS                                                      │
│  ═══════════════════════════════════════════════════════════════════   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  📊 EVALUATION PROGRESS                                         │   │
│  │                                                                  │   │
│  │  ████████████████████████████████████░░░░░  85% Complete        │   │
│  │                                                                  │   │
│  │  Committee members who have completed all evaluations:          │   │
│  │  ✅ GIG Askew  ✅ GIG Snipe  ✅ GIG Allen  ✅ GIG Lamb          │   │
│  │  ⏳ GIG Rogers  ⏳ GIG Wilson                                    │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  🏆 CANDIDATE RANKINGS                                          │   │
│  │     (sorted by average committee rating)                        │   │
│  │                                                                  │   │
│  │  ┌─────┬──────────────────┬────────────┬───────────┬──────────┐ │   │
│  │  │Rank │ Candidate        │ City       │ Avg Rating│ Votes    │ │   │
│  │  ├─────┼──────────────────┼────────────┼───────────┼──────────┤ │   │
│  │  │ 🥇 │ Keisha Thompson  │ Grand      │ 4.5 / 5   │ 4 Strong │ │   │
│  │  │  1  │                  │ Rapids     │ ⭐⭐⭐⭐⭐ │ 2 Yes    │ │   │
│  │  ├─────┼──────────────────┼────────────┼───────────┼──────────┤ │   │
│  │  │ 🥈 │ Marcus Johnson   │ Detroit    │ 4.2 / 5   │ 3 Strong │ │   │
│  │  │  2  │                  │            │ ⭐⭐⭐⭐  │ 2 Yes    │ │   │
│  │  │     │                  │            │           │ 1 Maybe  │ │   │
│  │  ├─────┼──────────────────┼────────────┼───────────┼──────────┤ │   │
│  │  │  3  │ Ashley Davis     │ Flint      │ 3.8 / 5   │ 2 Strong │ │   │
│  │  │     │                  │            │ ⭐⭐⭐⭐  │ 3 Yes    │ │   │
│  │  │     │                  │            │           │ 1 Maybe  │ │   │
│  │  ├─────┼──────────────────┼────────────┼───────────┼──────────┤ │   │
│  │  │  4  │ Tyrone Williams  │ Detroit    │ 3.5 / 5   │ 1 Strong │ │   │
│  │  │     │                  │            │ ⭐⭐⭐⭐  │ 2 Yes    │ │   │
│  │  │     │                  │            │           │ 3 Maybe  │ │   │
│  │  └─────┴──────────────────┴────────────┴───────────┴──────────┘ │   │
│  │                                                                  │   │
│  │  Click any row to view candidate details                        │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  🎯 SELECTION (Admin Only)                                      │   │
│  │  ────────────────────────────────────────────────────────────   │   │
│  │                                                                  │   │
│  │  Awards available: 2                                            │   │
│  │                                                                  │   │
│  │  ☑️ Select Keisha Thompson as Recipient #1                      │   │
│  │  ☑️ Select Marcus Johnson as Recipient #2                       │   │
│  │                                                                  │   │
│  │  ┌────────────────────────────────┐                             │   │
│  │  │   Finalize Selection           │                             │   │
│  │  └────────────────────────────────┘                             │   │
│  │                                                                  │   │
│  │  ⚠️ This action will mark selected candidates as recipients     │   │
│  │     and notify them via email.                                  │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Rating System Design

The committee uses a simple, subjective 5-point scale:

| Rating | Value | Visual | Description |
|--------|-------|--------|-------------|
| Strong Yes | 5 | 😍 | Outstanding candidate, highly recommend |
| Yes | 4 | 😊 | Good candidate, recommend |
| Maybe | 3 | 😐 | Decent candidate, neutral |
| No | 2 | 😕 | Weak candidate, don't recommend |
| Strong No | 1 | 😞 | Very weak candidate, strongly don't recommend |

**Evaluation Rules:**
- Committee members cannot see others' ratings until they submit their own
- Once submitted, ratings can be updated until selection is finalized
- Anonymous mode available (committee members see aggregate only)
- Chairman can toggle between anonymous and transparent modes

---

## AI Integration

### Claude API Usage

**Model:** Claude 3.5 Sonnet (claude-3-5-sonnet-20241022)

### AI Summary Generation

```typescript
// convex/ai.ts

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const generateCandidateSummary = action({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, { applicationId }) => {
    // Fetch application data
    const application = await ctx.runQuery(internal.applications.getById, { id: applicationId });
    
    // Fetch essay and recommendations
    const essay = application.essayText;
    const recommendations = await ctx.runQuery(internal.recommendations.getByApplication, { 
      applicationId 
    });
    
    const prompt = `You are reviewing a scholarship application for the William R. Stark Financial Assistance Program. This scholarship awards $500 to Michigan students committed to using their education to improve their communities.

## Applicant Information
- Name: ${application.firstName} ${application.lastName}
- City: ${application.city}, Michigan
- High School: ${application.highSchoolName}
- College: ${application.collegeName}
- Major: ${application.major}
- GPA: ${application.gpa}
- Year: ${application.yearInCollege}

## Essay (Topic: "How Will Furthering My Studies Help Me Improve My Community?")
${essay}

## Recommendation Letters
${recommendations.map((rec, i) => `
### Recommendation ${i + 1}
From: ${rec.recommenderName} (${rec.recommenderType})
Organization: ${rec.recommenderOrganization}
${rec.letterText}
`).join('\n')}

Please provide:
1. A 2-3 sentence summary of this candidate's key strengths and community vision
2. 4 bullet points highlighting their most notable qualities or achievements

Format your response as JSON:
{
  "summary": "...",
  "highlights": ["...", "...", "...", "..."]
}`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === "text") {
      const parsed = JSON.parse(content.text);
      
      // Save to database
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

### AI Summary Triggers

| Trigger | Action |
|---------|--------|
| Application submitted | Generate summary automatically |
| Recommendation received | Regenerate summary with new data |
| Admin request | Manual regeneration |

### AI Summary Display

The AI summary appears on:
1. **Candidate Cards** — Compact summary + highlights
2. **Candidate Detail View** — Full summary with expandable sections
3. **Committee Dashboard** — Summary snippets for quick scanning

---

## File Storage & Document Handling

### Convex Storage Configuration

```typescript
// convex/storage.ts

export const generateUploadUrl = mutation({
  args: {
    type: v.union(
      v.literal("profile_photo"),
      v.literal("transcript"),
      v.literal("essay"),
      v.literal("recommendation")
    ),
  },
  handler: async (ctx, { type }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Generate pre-signed upload URL
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveFile = mutation({
  args: {
    storageId: v.id("_storage"),
    type: v.string(),
    applicationId: v.optional(v.id("applications")),
    recommendationId: v.optional(v.id("recommendations")),
  },
  handler: async (ctx, { storageId, type, applicationId, recommendationId }) => {
    // Validate and save file reference
    // ...
  },
});
```

### File Type Restrictions

| Document Type | Allowed Formats | Max Size |
|---------------|-----------------|----------|
| Profile Photo | JPEG, PNG, WebP | 5 MB |
| Transcript | PDF, JPEG, PNG | 10 MB |
| Essay (upload) | PDF, DOC, DOCX | 5 MB |
| Recommendation | PDF, DOC, DOCX | 5 MB |

### Document Viewer

Integrated document viewer for committee review:

```typescript
// components/DocumentViewer.tsx

interface DocumentViewerProps {
  fileId: string;
  type: "pdf" | "image" | "document";
  title: string;
}

// Features:
// - PDF rendering with page navigation
// - Image display with zoom
// - DOC/DOCX preview (converted server-side)
// - Download option
// - Fullscreen mode
// - Print option
```

---

## Email System

### Email Templates

| Template | Trigger | Recipient |
|----------|---------|-----------|
| `welcome` | Account creation | Applicant |
| `email-verification` | Registration | Applicant |
| `application-started` | First step completed | Applicant |
| `application-submitted` | Application submitted | Applicant |
| `recommendation-request` | Applicant requests rec | Recommender |
| `recommendation-reminder` | 7 days after request | Recommender |
| `recommendation-received` | Rec submitted | Applicant |
| `application-complete` | All requirements met | Applicant |
| `recipient-selected` | Selection finalized | Selected applicant |
| `recipient-not-selected` | Selection finalized | Non-selected applicant |
| `deadline-reminder` | 7 days before deadline | All incomplete applicants |

### Resend Integration

```typescript
// lib/email.ts

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
    from: "William R. Stark Scholarship <noreply@wrstark.org>",
    to,
    subject,
    html,
  });
}
```

### Recommendation Request Email

```
Subject: Recommendation Request for Marcus Johnson - William R. Stark Scholarship

Dear Dr. Sarah Johnson,

Marcus Johnson has requested that you provide a letter of recommendation 
for the William R. Stark Financial Assistance Program.

About the Scholarship:
The William R. Stark Class of 2023 President's Club awards two $500 
scholarships to Michigan students committed to using their education 
to improve their communities.

Marcus indicated that you are their: AP History Teacher
Relationship duration: 2 years

To submit your recommendation letter, please click the secure link below:

[Submit Recommendation Letter]
https://wrstark.org/recommend/abc123xyz

This link will expire on March 15, 2026.

What to include in your letter:
• How long and in what capacity you've known the applicant
• The applicant's academic abilities and achievements  
• The applicant's character and personal qualities
• Examples of community involvement or leadership
• Why you believe they deserve this scholarship

If you have any questions, please contact the scholarship committee at
blackgoldmine@sbcglobal.net.

Thank you for supporting Marcus's educational journey.

Fraternally,
GIG Kenny R. Askew 33°, Chairman
William R. Stark Financial Assistance Committee
```

---

## Motion & Animation Specifications

### Global Animation Tokens

```css
:root {
  /* Durations */
  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --duration-slower: 800ms;
  
  /* Easings */
  --ease-out: cubic-bezier(0.33, 1, 0.68, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Framer Motion Variants

```typescript
// lib/motion.ts

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] },
};

export const slideInFromRight = {
  initial: { x: 50, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  transition: { duration: 0.4, ease: [0.33, 1, 0.68, 1] },
};
```

### Component Animations

| Component | Animation | Trigger |
|-----------|-----------|---------|
| Page transitions | Fade + slide up | Route change |
| Step progress | Fill animation | Step completion |
| Form fields | Subtle scale on focus | Focus state |
| Upload zone | Pulse on drag over | Drag event |
| Progress bar | Smooth fill | Progress update |
| Cards | Lift + shadow | Hover |
| Buttons | Scale + glow | Hover |
| Checkmarks | Draw path animation | Completion |
| Rating buttons | Scale + color | Selection |
| Candidate cards | Stagger reveal | List render |
| Toast notifications | Slide in from right | Event trigger |
| Modal | Scale + fade | Open/close |
| Sidebar | Slide from left | Toggle |
| Charts | Progressive draw | Scroll into view |

### Loading States

```typescript
// components/ui/Skeleton.tsx

// Shimmer animation for loading states
const shimmer = {
  animate: {
    backgroundPosition: ["200% 0%", "-200% 0%"],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear",
    },
  },
};
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

- [ ] Project setup (Next.js, Tailwind, ShadCN)
- [ ] Convex database setup and schema
- [ ] Better Auth integration
- [ ] Basic route structure
- [ ] Landing page implementation

### Phase 2: Applicant Portal (Week 3-4)

- [ ] User registration flow
- [ ] Application dashboard
- [ ] Steps 1-4 (Personal, Address, Education, Eligibility)
- [ ] Step 5 (Documents & Essay)
- [ ] File upload components
- [ ] Progress tracking

### Phase 3: Recommendations (Week 5)

- [ ] Step 6 (Recommendations)
- [ ] Recommender portal (token-based)
- [ ] Email notifications (Resend)
- [ ] Recommendation status tracking

### Phase 4: Review & Submit (Week 6)

- [ ] Step 7 (Review & Submit)
- [ ] Application validation
- [ ] Submission flow
- [ ] Confirmation page
- [ ] Status tracking page

### Phase 5: Admin Dashboard (Week 7-8)

- [ ] Admin authentication
- [ ] Dashboard overview
- [ ] Applications list
- [ ] Application detail view
- [ ] Statistics and charts
- [ ] Export functionality

### Phase 6: Committee System (Week 9-10)

- [ ] Committee authentication
- [ ] AI summary generation (Claude)
- [ ] Candidate cards
- [ ] Evaluation interface
- [ ] Results aggregation
- [ ] Selection workflow

### Phase 7: Polish & Testing (Week 11-12)

- [ ] Framer Motion animations
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] End-to-end testing
- [ ] Security review
- [ ] Deployment

---

## Appendix

### Environment Variables

```env
# App
NEXT_PUBLIC_APP_URL=https://wrstark.org
NEXT_PUBLIC_APP_NAME="William R. Stark Financial Assistance"

# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

# Anthropic (AI)
ANTHROPIC_API_KEY=

# Resend (Email)
RESEND_API_KEY=
EMAIL_FROM=noreply@wrstark.org

# Sentry (Error Tracking)
SENTRY_DSN=

# Vercel
VERCEL_URL=
```

### Key Third-Party Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.2.0",
    "convex": "^1.10.0",
    "better-auth": "^0.5.0",
    "@anthropic-ai/sdk": "^0.20.0",
    "resend": "^3.0.0",
    "framer-motion": "^11.0.0",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-*": "latest",
    "react-hook-form": "^7.50.0",
    "zod": "^3.22.0",
    "recharts": "^2.12.0",
    "date-fns": "^3.3.0",
    "lucide-react": "^0.350.0"
  }
}
```

### Folder Structure

```
william-r-stark-scholarship/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                    # Landing page
│   │   └── layout.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── verify/page.tsx
│   ├── (applicant)/
│   │   └── apply/
│   │       ├── dashboard/page.tsx
│   │       ├── step/[step]/page.tsx
│   │       ├── confirmation/page.tsx
│   │       └── status/page.tsx
│   ├── (recommender)/
│   │   └── recommend/
│   │       ├── [token]/page.tsx
│   │       └── [token]/thanks/page.tsx
│   ├── (admin)/
│   │   └── admin/
│   │       ├── page.tsx                # Dashboard
│   │       ├── applications/
│   │       │   ├── page.tsx            # List
│   │       │   └── [id]/page.tsx       # Detail
│   │       ├── committee/page.tsx
│   │       ├── settings/page.tsx
│   │       └── reports/page.tsx
│   ├── (committee)/
│   │   └── committee/
│   │       ├── page.tsx                # Dashboard
│   │       ├── candidates/
│   │       │   ├── page.tsx            # List
│   │       │   └── [id]/page.tsx       # Detail + Evaluate
│   │       ├── my-evaluations/page.tsx
│   │       └── results/page.tsx
│   ├── api/
│   │   └── [...auth]/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/                             # ShadCN components
│   ├── landing/                        # Landing page sections
│   ├── apply/                          # Application form components
│   ├── admin/                          # Admin dashboard components
│   ├── committee/                      # Committee evaluation components
│   └── shared/                         # Shared components
├── convex/
│   ├── schema.ts
│   ├── applications.ts
│   ├── recommendations.ts
│   ├── evaluations.ts
│   ├── users.ts
│   ├── storage.ts
│   ├── ai.ts
│   └── _generated/
├── lib/
│   ├── auth.ts
│   ├── email.ts
│   ├── motion.ts
│   ├── utils.ts
│   └── validations.ts
├── public/
│   └── images/
├── styles/
│   └── globals.css
├── .env.local
├── convex.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

**Document History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 1, 2026 | Claude | Initial landing page PRD |
| 2.0 | Feb 1, 2026 | Claude | Added full platform: applicant portal, recommender portal, admin dashboard, committee evaluation system, AI integration |
