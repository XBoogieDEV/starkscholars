import { v } from "convex/values";
import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { checkRateLimit } from "./utils";
import { logAction, logStepUpdate } from "./auditLog";

// ============================================
// QUERIES
// ============================================

export const getByUser = query({
  args: { userId: v.id("user") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const getById = query({
  args: { id: v.id("applications") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// Get validation status for review step
export const getValidationStatus = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, { applicationId }) => {
    const application = await ctx.db.get(applicationId);
    if (!application) throw new Error("Application not found");

    // Get recommendations
    const recommendations = await ctx.db
      .query("recommendations")
      .withIndex("by_application", (q) => q.eq("applicationId", applicationId))
      .collect();

    const submittedRecommendations = recommendations.filter(
      (r) => r.status === "submitted"
    );

    // Calculate completion percentage
    const totalRequirements = 8;
    let metRequirements = 0;

    // 1. All 7 steps completed
    const allStepsCompleted = application.completedSteps.length >= 7;
    if (allStepsCompleted) metRequirements++;

    // 2. GPA >= 3.0
    const gpaMet = (application.gpa || 0) >= 3.0;
    if (gpaMet) metRequirements++;

    // 3. Michigan resident
    const michiganResident = application.isMichiganResident === true;
    if (michiganResident) metRequirements++;

    // 4. Full-time student
    const fullTimeStudent = application.isFullTimeStudent === true;
    if (fullTimeStudent) metRequirements++;

    // 5. At least 2 recommendations REQUESTED (not required to be submitted before application submission)
    const recommendationsRequested = recommendations.length >= 2;
    const recommendationsMet = recommendationsRequested; // Changed: only need requests, not submissions
    if (recommendationsMet) metRequirements++;

    // 6. Required files uploaded
    const profilePhotoUploaded = !!application.profilePhotoId;
    const transcriptUploaded = !!application.transcriptFileId;
    const essayUploaded = !!application.essayText || !!application.essayFileId;
    const filesMet = profilePhotoUploaded && transcriptUploaded && essayUploaded;
    if (filesMet) metRequirements++;

    // 7. Essay word count valid (250-500)
    const wordCount = application.essayWordCount || 0;
    const essayValid = wordCount >= 250 && wordCount <= 500;
    if (essayValid) metRequirements++;

    // 8. Eligibility info complete (name, address, education)
    const personalComplete = !!(application.firstName && application.lastName && application.phone && application.dateOfBirth);
    const addressComplete = !!(application.streetAddress && application.city && application.state && application.zipCode);
    const educationComplete = !!(application.highSchoolName && application.collegeName && application.yearInCollege);
    const infoMet = personalComplete && addressComplete && educationComplete;
    if (infoMet) metRequirements++;

    return {
      // Overall status
      completionPercentage: Math.round((metRequirements / totalRequirements) * 100),
      canSubmit: metRequirements === totalRequirements,

      // Individual validations
      allStepsCompleted,
      gpaMet,
      michiganResident,
      fullTimeStudent,
      recommendationsMet,
      recommendationsRequested,
      recommendationsCount: recommendations.length,
      recommendationsSubmittedCount: submittedRecommendations.length,
      filesMet,
      profilePhotoUploaded,
      transcriptUploaded,
      essayUploaded,
      essayValid,
      wordCount,
      infoMet,
      personalComplete,
      addressComplete,
      educationComplete,

      // Requirements detail
      requirements: [
        { id: "steps", label: "All 7 steps completed", met: allStepsCompleted },
        { id: "gpa", label: "GPA ≥ 3.0", met: gpaMet, value: application.gpa },
        { id: "resident", label: "Michigan resident confirmed", met: michiganResident },
        { id: "fulltime", label: "Full-time student confirmed", met: fullTimeStudent },
        { id: "recommendations", label: "At least 2 recommendations requested", met: recommendationsMet, value: `${recommendations.length}/2 requested` },
        { id: "photo", label: "Profile photo uploaded", met: profilePhotoUploaded },
        { id: "transcript", label: "Transcript uploaded", met: transcriptUploaded },
        { id: "essay", label: "Essay complete (250-500 words)", met: essayValid, value: `${wordCount} words` },
      ],
    };
  },
});

export const getMyApplication = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("user")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) return null;

    return await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
  },
});

// ============================================
// MUTATIONS
// ============================================

export const create = mutation({
  args: { userId: v.id("user") },
  handler: async (ctx, { userId }) => {
    const existing = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) return existing._id;

    const applicationId = await ctx.db.insert("applications", {
      userId,
      status: "draft",
      currentStep: 1,
      completedSteps: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log application creation
    await logAction(ctx, {
      action: "application:created",
      userId,
      applicationId,
    });

    return applicationId;
  },
});

export const updateStep1 = mutation({
  args: {
    applicationId: v.id("applications"),
    firstName: v.string(),
    lastName: v.string(),
    phone: v.string(),
    dateOfBirth: v.string(),
    profilePhotoId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { applicationId, profilePhotoId, ...data } = args;
    const application = await ctx.db.get(applicationId);
    if (!application) throw new Error("Application not found");

    // Photo already uploaded client-side - we trust the storageId from our upload URL
    const completedSteps = application.completedSteps.includes(1)
      ? application.completedSteps
      : [...application.completedSteps, 1];

    await ctx.db.patch(applicationId, {
      ...data,
      ...(profilePhotoId && { profilePhotoId }),
      completedSteps,
      updatedAt: Date.now(),
    });

    // Log step completion (non-blocking - errors shouldn't fail the save)
    try {
      await logStepUpdate(ctx, {
        userId: application.userId, // Use proper Convex ID from application
        applicationId,
        step: 1,
        stepName: "Personal Information",
        details: { profilePhotoUpdated: !!profilePhotoId },
      });
    } catch (logError) {
      console.error("Failed to log step update:", logError);
    }

    return applicationId;
  },
});

export const updateStep2 = mutation({
  args: {
    applicationId: v.id("applications"),
    streetAddress: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
  },
  handler: async (ctx, args) => {
    const { applicationId, ...data } = args;
    const application = await ctx.db.get(applicationId);
    if (!application) throw new Error("Application not found");

    const completedSteps = application.completedSteps.includes(2)
      ? application.completedSteps
      : [...application.completedSteps, 2];

    await ctx.db.patch(applicationId, {
      ...data,
      completedSteps,
      updatedAt: Date.now(),
    });

    // Log step completion (non-blocking)
    try {
      await logStepUpdate(ctx, {
        userId: application.userId,
        applicationId,
        step: 2,
        stepName: "Address",
        details: { city: data.city },
      });
    } catch (logError) {
      console.error("Failed to log step update:", logError);
    }

    return applicationId;
  },
});

export const updateStep3 = mutation({
  args: {
    applicationId: v.id("applications"),
    highSchoolName: v.string(),
    highSchoolCity: v.string(),
    highSchoolState: v.string(),
    graduationDate: v.string(),
    gpa: v.number(),
    actScore: v.optional(v.number()),
    satScore: v.optional(v.number()),
    collegeName: v.string(),
    collegeCity: v.string(),
    collegeState: v.string(),
    yearInCollege: v.union(v.literal("freshman"), v.literal("sophomore"), v.literal("junior"), v.literal("senior")),
    major: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { applicationId, ...data } = args;
    const application = await ctx.db.get(applicationId);
    if (!application) throw new Error("Application not found");

    const completedSteps = application.completedSteps.includes(3)
      ? application.completedSteps
      : [...application.completedSteps, 3];

    await ctx.db.patch(applicationId, {
      ...data,
      completedSteps,
      updatedAt: Date.now(),
    });

    // Log step completion (non-blocking)
    try {
      await logStepUpdate(ctx, {
        userId: application.userId,
        applicationId,
        step: 3,
        stepName: "Education",
        details: { gpa: data.gpa, collegeName: data.collegeName },
      });
    } catch (logError) {
      console.error("Failed to log step update:", logError);
    }

    return applicationId;
  },
});

export const updateStep4 = mutation({
  args: {
    applicationId: v.id("applications"),
    isFirstTimeApplying: v.boolean(),
    isPreviousRecipient: v.boolean(),
    isFullTimeStudent: v.boolean(),
    isMichiganResident: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { applicationId, ...data } = args;
    const application = await ctx.db.get(applicationId);
    if (!application) throw new Error("Application not found");

    const completedSteps = application.completedSteps.includes(4)
      ? application.completedSteps
      : [...application.completedSteps, 4];

    await ctx.db.patch(applicationId, {
      ...data,
      completedSteps,
      updatedAt: Date.now(),
    });

    // Log step completion (non-blocking)
    try {
      await logStepUpdate(ctx, {
        userId: application.userId,
        applicationId,
        step: 4,
        stepName: "Eligibility",
        details: {
          isMichiganResident: data.isMichiganResident,
          isFullTimeStudent: data.isFullTimeStudent,
        },
      });
    } catch (logError) {
      console.error("Failed to log step update:", logError);
    }

    return applicationId;
  },
});

export const updateStep5 = mutation({
  args: {
    applicationId: v.id("applications"),
    transcriptFileId: v.optional(v.id("_storage")),
    essayFileId: v.optional(v.id("_storage")),
    essayText: v.optional(v.string()),
    essayWordCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { applicationId, transcriptFileId, essayFileId, ...data } = args;
    const application = await ctx.db.get(applicationId);
    if (!application) throw new Error("Application not found");

    // Files already uploaded client-side - storageIds are trusted from our upload URLs

    const completedSteps = application.completedSteps.includes(5)
      ? application.completedSteps
      : [...application.completedSteps, 5];

    await ctx.db.patch(applicationId, {
      ...data,
      ...(transcriptFileId && { transcriptFileId }),
      ...(essayFileId && { essayFileId }),
      completedSteps,
      updatedAt: Date.now(),
    });

    // Log step completion (non-blocking)
    try {
      await logStepUpdate(ctx, {
        userId: application.userId,
        applicationId,
        step: 5,
        stepName: "Documents & Essay",
        details: {
          transcriptUploaded: !!transcriptFileId,
          essayUploaded: !!essayFileId,
          wordCount: data.essayWordCount,
        },
      });
    } catch (logError) {
      console.error("Failed to log step update:", logError);
    }

    return applicationId;
  },
});

export const updateCurrentStep = mutation({
  args: {
    applicationId: v.id("applications"),
    step: v.number(),
  },
  handler: async (ctx, { applicationId, step }) => {
    await ctx.db.patch(applicationId, {
      currentStep: step,
      updatedAt: Date.now(),
    });
  },
});

export const submit = mutation({
  args: {
    applicationId: v.id("applications"),
    signature: v.string(),
  },
  handler: async (ctx, { applicationId, signature }) => {
    // DEADLINE CHECK: Must be first - server-side enforcement
    const DEADLINE = new Date("2026-04-15T23:59:59-04:00").getTime();
    if (Date.now() > DEADLINE) {
      throw new Error("Application deadline has passed. Applications closed on April 15, 2026.");
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Rate limiting check
    const rateLimit = await checkRateLimit(ctx, "application:submit", identity.subject);
    if (!rateLimit.allowed) {
      throw new Error(`Rate limit exceeded. Try again in ${rateLimit.retryAfter} seconds.`);
    }

    const application = await ctx.db.get(applicationId);
    if (!application) throw new Error("Application not found");

    // Validate all requirements are met
    const validations = [
      { check: !!application.firstName && !!application.lastName, error: "Personal information incomplete" },
      { check: !!application.streetAddress && application.state === "MI", error: "Address incomplete" },
      { check: !!application.highSchoolName && !!application.gpa && (application.gpa || 0) >= 3.0, error: "Education requirements not met" },
      { check: application.isFullTimeStudent === true && application.isMichiganResident === true, error: "Eligibility requirements not met" },
      { check: !!application.essayText && (application.essayWordCount || 0) >= 250 && (application.essayWordCount || 0) <= 500, error: "Essay must be between 250-500 words" },
      { check: !!application.transcriptFileId, error: "Transcript not uploaded" },
    ];

    for (const validation of validations) {
      if (!validation.check) {
        throw new Error(validation.error);
      }
    }

    // Check recommendations - only need to be REQUESTED, not submitted
    // Users can submit their application while waiting for recommenders
    const recommendations = await ctx.db
      .query("recommendations")
      .withIndex("by_application", (q) => q.eq("applicationId", applicationId))
      .collect();

    if (recommendations.length < 2) {
      throw new Error("Please request at least 2 recommendations before submitting");
    }

    // Note: We no longer require recommendations to be submitted before application submission
    // Recommendations can arrive after the application is submitted

    // Validate signature matches name
    const fullName = `${application.firstName} ${application.lastName}`.toLowerCase().trim();
    const sigLower = signature.toLowerCase().trim();
    if (sigLower !== fullName) {
      throw new Error("Signature does not match name");
    }

    // Update application status
    await ctx.db.patch(applicationId, {
      status: "submitted",
      submittedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log submission
    const currentUser = await ctx.db
      .query("user")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first();

    await logAction(ctx, {
      action: "application:submitted",
      userId: currentUser?._id,
      applicationId,
      details: { signature: signature.toLowerCase().trim() },
    });

    // Send confirmation email
    await ctx.scheduler.runAfter(0, api.emails.sendApplicationSubmitted, {
      applicationId,
    });

    // Trigger AI summary generation
    await ctx.scheduler.runAfter(0, internal.ai.generateSummary, {
      applicationId,
    });

    return { success: true };
  },
});

export const withdraw = mutation({
  args: {
    applicationId: v.id("applications"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { applicationId, reason }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Rate limiting check
    const rateLimit = await checkRateLimit(ctx, "application:withdraw", identity.subject);
    if (!rateLimit.allowed) {
      throw new Error(`Rate limit exceeded. Try again in ${rateLimit.retryAfter} seconds.`);
    }

    const application = await ctx.db.get(applicationId);
    if (!application) throw new Error("Application not found");

    // Verify user owns this application
    const user = await ctx.db
      .query("user")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user || application.userId !== user._id) {
      throw new Error("Not authorized to withdraw this application");
    }

    // Check if application is in a withdrawable state
    if (application.status === "withdrawn") {
      throw new Error("Application already withdrawn");
    }

    if (application.status === "selected" || application.status === "not_selected") {
      throw new Error("Cannot withdraw after selection decision");
    }

    // Check deadline (can only reapply if withdrawn before deadline)
    const DEADLINE = new Date("2026-04-15T23:59:59-04:00").getTime();
    const canReapply = Date.now() <= DEADLINE;

    // Update application status
    await ctx.db.patch(applicationId, {
      status: "withdrawn",
      withdrawnAt: Date.now(),
      withdrawnReason: reason,
      updatedAt: Date.now(),
    });

    // Log the withdrawal using the audit log function
    await logAction(ctx, {
      action: "application:withdrawn",
      userId: user._id,
      applicationId,
      details: { reason, canReapply },
    });

    // Send confirmation email
    await ctx.scheduler.runAfter(0, api.emails.sendWithdrawalConfirmation, {
      applicationId,
      reason,
    });

    return { success: true, canReapply };
  },
});

// ============================================
// INTERNAL
// ============================================

export const getByIdInternal = internalQuery({
  args: { id: v.id("applications") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const updateAISummary = internalMutation({
  args: {
    id: v.id("applications"),
    summary: v.string(),
    highlights: v.array(v.string()),
  },
  handler: async (ctx, { id, summary, highlights }) => {
    await ctx.db.patch(id, {
      aiSummary: summary,
      aiHighlights: highlights,
      aiSummaryGeneratedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
