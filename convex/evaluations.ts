import { v } from "convex/values";
import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { logAction } from "./auditLog";
import { checkRateLimit } from "./utils";

// ============================================
// TYPES
// ============================================

export type Rating = "strong_yes" | "yes" | "maybe" | "no" | "strong_no";

export const ratingPoints: Record<Rating, number> = {
  strong_yes: 5,
  yes: 4,
  maybe: 3,
  no: 2,
  strong_no: 1,
};

export const ratingLabels: Record<Rating, string> = {
  strong_yes: "Strong Yes",
  yes: "Yes",
  maybe: "Maybe",
  no: "No",
  strong_no: "Strong No",
};

export const ratingEmojis: Record<Rating, string> = {
  strong_yes: "😍",
  yes: "😊",
  maybe: "😐",
  no: "😕",
  strong_no: "😞",
};

export const ratingColors: Record<Rating, string> = {
  strong_yes: "bg-green-100 text-green-800 border-green-200",
  yes: "bg-emerald-100 text-emerald-800 border-emerald-200",
  maybe: "bg-yellow-100 text-yellow-800 border-yellow-200",
  no: "bg-orange-100 text-orange-800 border-orange-200",
  strong_no: "bg-red-100 text-red-800 border-red-200",
};

// ============================================
// QUERIES
// ============================================

export const getByApplication = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, { applicationId }) => {
    return await ctx.db
      .query("evaluations")
      .withIndex("by_application", (q) => q.eq("applicationId", applicationId))
      .collect();
  },
});

export const getByEvaluator = query({
  args: { evaluatorId: v.id("users") },
  handler: async (ctx, { evaluatorId }) => {
    return await ctx.db
      .query("evaluations")
      .withIndex("by_evaluator", (q) => q.eq("evaluatorId", evaluatorId))
      .collect();
  },
});

export const getMyEvaluation = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, { applicationId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) return null;

    return await ctx.db
      .query("evaluations")
      .withIndex("by_application_evaluator", (q) => 
        q.eq("applicationId", applicationId).eq("evaluatorId", user._id)
      )
      .first();
  },
});

export const getAllEvaluationsWithDetails = query({
  args: {},
  handler: async (ctx) => {
    const evaluations = await ctx.db.query("evaluations").collect();
    
    // Get all applications and users for mapping
    const applications = await ctx.db.query("applications").collect();
    const users = await ctx.db.query("users").collect();
    
    const applicationMap = new Map(applications.map(a => [a._id, a]));
    const userMap = new Map(users.map(u => [u._id, u]));
    
    return evaluations.map(evaluation => ({
      ...evaluation,
      application: applicationMap.get(evaluation.applicationId),
      evaluator: userMap.get(evaluation.evaluatorId),
    }));
  },
});

export const getEvaluationStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) return null;

    // Get all submitted applications
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_status", (q) => q.eq("status", "submitted"))
      .collect();

    // Get all evaluations by current user
    const myEvaluations = await ctx.db
      .query("evaluations")
      .withIndex("by_evaluator", (q) => q.eq("evaluatorId", user._id))
      .collect();

    const myEvaluationIds = new Set(myEvaluations.map(e => e.applicationId));

    return {
      totalApplications: applications.length,
      myEvaluationsCompleted: myEvaluations.length,
      remainingToEvaluate: applications.length - myEvaluations.length,
    };
  },
});

export const getCandidatesForEvaluation = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) return [];

    // Get all submitted applications with AI summaries
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_status", (q) => q.eq("status", "submitted"))
      .collect();

    // Get all evaluations
    const allEvaluations = await ctx.db.query("evaluations").collect();

    // Get recommendations for counting
    const recommendations = await ctx.db.query("recommendations").collect();

    // Get user's evaluations
    const myEvaluations = allEvaluations.filter(e => e.evaluatorId === user._id);
    const myEvaluationMap = new Map(myEvaluations.map(e => [e.applicationId, e]));

    // Count evaluations per application
    const evaluationCounts = new Map<string, number>();
    allEvaluations.forEach(e => {
      const count = evaluationCounts.get(e.applicationId) || 0;
      evaluationCounts.set(e.applicationId, count + 1);
    });

    // Count recommendations per application
    const recommendationCounts = new Map<string, number>();
    recommendations.forEach(r => {
      if (r.status === "submitted") {
        const count = recommendationCounts.get(r.applicationId) || 0;
        recommendationCounts.set(r.applicationId, count + 1);
      }
    });

    return applications.map(app => ({
      ...app,
      myEvaluation: myEvaluationMap.get(app._id),
      evaluationCount: evaluationCounts.get(app._id) || 0,
      recommendationCount: recommendationCounts.get(app._id) || 0,
    }));
  },
});

export const getCandidateDetails = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, { applicationId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) return null;

    // Get application
    const application = await ctx.db.get(applicationId);
    if (!application) return null;

    // Get user's evaluation
    const myEvaluation = await ctx.db
      .query("evaluations")
      .withIndex("by_application_evaluator", (q) => 
        q.eq("applicationId", applicationId).eq("evaluatorId", user._id)
      )
      .first();

    // Get all evaluations if user has submitted theirs
    let otherEvaluations: typeof myEvaluation[] = [];
    if (myEvaluation) {
      const allEvaluations = await ctx.db
        .query("evaluations")
        .withIndex("by_application", (q) => q.eq("applicationId", applicationId))
        .collect();
      
      // Get evaluator details for each evaluation
      const evaluatorIds = allEvaluations.map(e => e.evaluatorId);
      const evaluators = await Promise.all(
        evaluatorIds.map(id => ctx.db.get(id))
      );
      
      otherEvaluations = allEvaluations
        .filter(e => e.evaluatorId !== user._id)
        .map(e => ({
          ...e,
          evaluator: evaluators.find(ev => ev?._id === e.evaluatorId),
        }));
    }

    // Get recommendations
    const recommendations = await ctx.db
      .query("recommendations")
      .withIndex("by_application", (q) => q.eq("applicationId", applicationId))
      .collect();

    const submittedRecommendations = recommendations.filter(r => r.status === "submitted");

    return {
      application,
      myEvaluation,
      otherEvaluations,
      recommendations: submittedRecommendations,
    };
  },
});

export const getRankings = query({
  args: {},
  handler: async (ctx) => {
    // Get all submitted applications
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_status", (q) => q.eq("status", "submitted"))
      .collect();

    // Get all evaluations
    const evaluations = await ctx.db.query("evaluations").collect();

    // Get all committee members and admins
    const users = await ctx.db
      .query("users")
      .collect();
    
    const committeeMembers = users.filter(u => u.role === "committee" || u.role === "admin");

    // Calculate rankings
    const rankings = applications.map(app => {
      const appEvaluations = evaluations.filter(e => e.applicationId === app._id);
      const ratings = appEvaluations.map(e => ratingPoints[e.rating as Rating]);
      const averageRating = ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : 0;

      return {
        application: app,
        evaluations: appEvaluations,
        averageRating: Math.round(averageRating * 100) / 100,
        evaluationCount: appEvaluations.length,
      };
    });

    // Sort by average rating (descending)
    rankings.sort((a, b) => b.averageRating - a.averageRating);

    return {
      rankings,
      committeeMembers,
      totalApplications: applications.length,
      totalEvaluations: evaluations.length,
    };
  },
});

export const getMyEvaluationsWithDetails = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) return [];

    const evaluations = await ctx.db
      .query("evaluations")
      .withIndex("by_evaluator", (q) => q.eq("evaluatorId", user._id))
      .collect();

    // Get application details for each evaluation
    const evaluationsWithDetails = await Promise.all(
      evaluations.map(async (evaluation) => {
        const application = await ctx.db.get(evaluation.applicationId);
        return {
          ...evaluation,
          application,
        };
      })
    );

    return evaluationsWithDetails.filter(e => e.application);
  },
});

// ============================================
// MUTATIONS
// ============================================

export const submit = mutation({
  args: {
    applicationId: v.id("applications"),
    rating: v.union(
      v.literal("strong_yes"),
      v.literal("yes"),
      v.literal("maybe"),
      v.literal("no"),
      v.literal("strong_no")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { applicationId, rating, notes }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) {
      throw new Error("Not authenticated");
    }
    
    // Rate limiting check
    const rateLimit = await checkRateLimit(ctx, "evaluation:submit", identity.subject);
    if (!rateLimit.allowed) {
      throw new Error(`Rate limit exceeded. Try again in ${rateLimit.retryAfter} seconds.`);
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is committee or admin
    if (user.role !== "committee" && user.role !== "admin") {
      throw new Error("Not authorized to submit evaluations");
    }

    // Check if application exists
    const application = await ctx.db.get(applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    // Check if evaluation already exists
    const existingEvaluation = await ctx.db
      .query("evaluations")
      .withIndex("by_application_evaluator", (q) => 
        q.eq("applicationId", applicationId).eq("evaluatorId", user._id)
      )
      .first();

    const now = Date.now();

    if (existingEvaluation) {
      // Update existing evaluation
      await ctx.db.patch(existingEvaluation._id, {
        rating,
        notes: notes || undefined,
        updatedAt: now,
      });

      // Log evaluation update
      await logAction(ctx, {
        action: "evaluation:updated",
        userId: user._id,
        applicationId,
        details: { rating, evaluationId: existingEvaluation._id },
      });

      return existingEvaluation._id;
    } else {
      // Create new evaluation
      const evaluationId = await ctx.db.insert("evaluations", {
        applicationId,
        evaluatorId: user._id,
        rating,
        notes: notes || undefined,
        createdAt: now,
        updatedAt: now,
      });

      // Log evaluation submission
      await logAction(ctx, {
        action: "evaluation:submitted",
        userId: user._id,
        applicationId,
        details: { rating, evaluationId },
      });

      return evaluationId;
    }
  },
});

export const update = mutation({
  args: {
    evaluationId: v.id("evaluations"),
    rating: v.union(
      v.literal("strong_yes"),
      v.literal("yes"),
      v.literal("maybe"),
      v.literal("no"),
      v.literal("strong_no")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { evaluationId, rating, notes }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const evaluation = await ctx.db.get(evaluationId);
    if (!evaluation) {
      throw new Error("Evaluation not found");
    }

    // Only allow updating own evaluations
    if (evaluation.evaluatorId !== user._id) {
      throw new Error("Not authorized to update this evaluation");
    }

    await ctx.db.patch(evaluationId, {
      rating,
      notes: notes || undefined,
      updatedAt: Date.now(),
    });

    // Log evaluation update
    await logAction(ctx, {
      action: "evaluation:updated",
      userId: user._id,
      applicationId: evaluation.applicationId,
      details: { rating, evaluationId },
    });

    return { success: true };
  },
});

// ============================================
// INTERNAL
// ============================================

export const getByApplicationInternal = internalQuery({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, { applicationId }) => {
    return await ctx.db
      .query("evaluations")
      .withIndex("by_application", (q) => q.eq("applicationId", applicationId))
      .collect();
  },
});

export const deleteByIdInternal = internalMutation({
  args: { evaluationId: v.id("evaluations") },
  handler: async (ctx, { evaluationId }) => {
    await ctx.db.delete(evaluationId);
  },
});
