import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================
  // USERS & AUTH
  // ============================================
  user: defineTable({
    // Better Auth managed fields
    email: v.string(),
    name: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),

    // Optional Better Auth fields
    twoFactorEnabled: v.optional(v.boolean()),
    isAnonymous: v.optional(v.boolean()),
    username: v.optional(v.string()),
    displayUsername: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    phoneNumberVerified: v.optional(v.boolean()),

    // Custom fields
    role: v.optional(v.union(
      v.literal("applicant"),
      v.literal("admin"),
      v.literal("committee")
    )),
    lastLoginAt: v.optional(v.number()),
  })
    .index("email", ["email"])

    .index("by_role", ["role"]),

  session: defineTable({
    userId: v.id("user"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  })
    .index("token", ["token"])
    .index("userId", ["userId"])
    .index("expiresAt", ["expiresAt"])
    .index("expiresAt_userId", ["expiresAt", "userId"]),

  account: defineTable({
    userId: v.id("user"),
    accountId: v.string(),
    providerId: v.string(),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    accessTokenExpiresAt: v.optional(v.number()),
    refreshTokenExpiresAt: v.optional(v.number()),
    scope: v.optional(v.string()),
    idToken: v.optional(v.string()),
    password: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("userId", ["userId"])
    .index("accountId", ["accountId"])
    .index("providerId", ["providerId"]),

  verification: defineTable({
    identifier: v.string(),
    value: v.string(),
    expiresAt: v.number(),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("identifier", ["identifier"]),

  // ============================================
  // APPLICATIONS
  // ============================================
  applications: defineTable({
    // Relationships
    userId: v.id("user"),

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
    currentStep: v.number(), // 1-7
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

    // Withdrawal tracking
    withdrawnAt: v.optional(v.number()),
    withdrawnReason: v.optional(v.string()),

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
    evaluatorId: v.id("user"),

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
    userId: v.id("user"),
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
    userId: v.optional(v.id("user")),
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
    updatedBy: v.optional(v.id("user")),
  })
    .index("by_key", ["key"]),
});
