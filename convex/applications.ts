import { v } from "convex/values";
import { query, mutation, internalQuery, internalMutation } from "./_generated/server";

// ============================================
// QUERIES
// ============================================

export const getByUser = query({
  args: { userId: v.id("users") },
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

export const getMyApplication = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
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
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const existing = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (existing) return existing._id;
    
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
    const { applicationId, ...data } = args;
    const application = await ctx.db.get(applicationId);
    if (!application) throw new Error("Application not found");
    
    const completedSteps = application.completedSteps.includes(1) 
      ? application.completedSteps 
      : [...application.completedSteps, 1];
    
    await ctx.db.patch(applicationId, {
      ...data,
      completedSteps,
      updatedAt: Date.now(),
    });
    
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
    const { applicationId, ...data } = args;
    const application = await ctx.db.get(applicationId);
    if (!application) throw new Error("Application not found");
    
    const completedSteps = application.completedSteps.includes(5) 
      ? application.completedSteps 
      : [...application.completedSteps, 5];
    
    await ctx.db.patch(applicationId, {
      ...data,
      completedSteps,
      updatedAt: Date.now(),
    });
    
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
