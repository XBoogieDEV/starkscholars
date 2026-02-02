import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Log levels
export type LogLevel = "info" | "warning" | "error" | "security";

// Action types
export const AUDIT_ACTIONS = {
  // Auth actions
  "auth:login": "User logged in",
  "auth:logout": "User logged out",
  "auth:register": "User registered",
  "auth:verify_email": "Email verified",
  "auth:password_reset": "Password reset",
  "auth:failed_login": "Failed login attempt",
  
  // Application actions
  "application:created": "Application created",
  "application:updated": "Application updated",
  "application:submitted": "Application submitted",
  "application:withdrawn": "Application withdrawn",
  "application:status_changed": "Application status changed",
  
  // Document actions
  "document:uploaded": "Document uploaded",
  "document:deleted": "Document deleted",
  
  // Recommendation actions
  "recommendation:requested": "Recommendation requested",
  "recommendation:reminder_sent": "Recommendation reminder sent",
  "recommendation:submitted": "Recommendation submitted",
  "recommendation:viewed": "Recommendation viewed",
  
  // Evaluation actions
  "evaluation:submitted": "Evaluation submitted",
  "evaluation:updated": "Evaluation updated",
  
  // Admin actions
  "admin:user_created": "User created by admin",
  "admin:user_deleted": "User deleted by admin",
  "admin:selection_finalized": "Selection finalized",
  "admin:export": "Data exported",
  
  // Security
  "security:unauthorized_access": "Unauthorized access attempt",
  "security:rate_limit_exceeded": "Rate limit exceeded",
} as const;

// Helper function to log actions
export async function logAction(
  ctx: MutationCtx,
  params: {
    action: keyof typeof AUDIT_ACTIONS;
    userId?: Id<"users"> | string;
    applicationId?: Id<"applications"> | string;
    details?: Record<string, unknown>;
    level?: LogLevel;
    ipAddress?: string;
    userAgent?: string;
  }
) {
  await ctx.db.insert("activityLog", {
    userId: params.userId as Id<"users"> | undefined,
    applicationId: params.applicationId as Id<"applications"> | undefined,
    action: params.action,
    details: params.details ? JSON.stringify(params.details) : undefined,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    createdAt: Date.now(),
  });
}

// Helper to log step updates with specific details
export async function logStepUpdate(
  ctx: MutationCtx,
  params: {
    userId: Id<"users"> | string;
    applicationId: Id<"applications"> | string;
    step: number;
    stepName: string;
    details?: Record<string, unknown>;
  }
) {
  await logAction(ctx, {
    action: "application:updated",
    userId: params.userId,
    applicationId: params.applicationId,
    details: {
      step: params.step,
      stepName: params.stepName,
      ...params.details,
    },
  });
}

// Queries
export const getRecentActivity = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 50 }) => {
    return await ctx.db
      .query("activityLog")
      .order("desc")
      .take(limit);
  }
});

export const getActivityByApplication = query({
  args: { 
    applicationId: v.id("applications"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, { applicationId, limit = 50 }) => {
    return await ctx.db
      .query("activityLog")
      .withIndex("by_application", q => q.eq("applicationId", applicationId))
      .order("desc")
      .take(limit);
  }
});

export const getActivityByUser = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, { userId, limit = 50 }) => {
    return await ctx.db
      .query("activityLog")
      .withIndex("by_user", q => q.eq("userId", userId))
      .order("desc")
      .take(limit);
  }
});

export const getSecurityEvents = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 50 }) => {
    const allLogs = await ctx.db
      .query("activityLog")
      .order("desc")
      .take(limit * 2);
    
    return allLogs.filter(log => 
      log.action?.startsWith("security:") ||
      log.action?.startsWith("auth:failed") ||
      log.action?.startsWith("admin:")
    ).slice(0, limit);
  }
});

// Internal mutation for system logging
export const logSystemEvent = internalMutation({
  args: {
    action: v.string(),
    userId: v.optional(v.id("users")),
    applicationId: v.optional(v.id("applications")),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activityLog", {
      userId: args.userId,
      applicationId: args.applicationId,
      action: args.action,
      details: args.details,
      createdAt: Date.now(),
    });
  }
});
