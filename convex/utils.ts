// Utility functions for Convex
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * Generate a secure random token for recommendation access
 */
export function generateSecureToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Generate a unique access code
 */
export function generateAccessCode(): string {
  const chars = "0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ============================================
// RATE LIMITING
// ============================================

// Rate limit configuration
const RATE_LIMITS = {
  // Auth endpoints
  "auth:login": { limit: 5, windowMs: 15 * 60 * 1000 },      // 5 per 15 min
  "auth:register": { limit: 3, windowMs: 60 * 60 * 1000 },   // 3 per hour
  "auth:verify": { limit: 3, windowMs: 60 * 60 * 1000 },     // 3 per hour

  // Application actions
  "application:submit": { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  "application:withdraw": { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  "application:create": { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour

  // Recommendations
  "recommendation:create": { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  "recommendation:sendReminder": { limit: 5, windowMs: 24 * 60 * 60 * 1000 }, // 5 per day

  // Evaluations
  "evaluation:submit": { limit: 50, windowMs: 60 * 60 * 1000 }, // 50 per hour

  // General API
  "api:general": { limit: 100, windowMs: 60 * 1000 }, // 100 per minute
};

type RateLimitKey = keyof typeof RATE_LIMITS;

interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
  remaining?: number;
}

/**
 * Check rate limit for a given key and identifier
 * Uses the activityLog table to track attempts
 */
export async function checkRateLimit(
  ctx: MutationCtx | QueryCtx,
  key: RateLimitKey,
  identifier: Id<"user"> | string
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[key];
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Get recent attempts from activity log
  const recentAttempts = await ctx.db
    .query("activityLog")
    .withIndex("by_user", q => q.eq("userId", identifier as Id<"user">))
    .filter(q => q.gte(q.field("createdAt"), windowStart))
    .filter(q => q.eq(q.field("action"), `rate_limit:${key}`))
    .collect();

  if (recentAttempts.length >= config.limit) {
    const oldestAttempt = Math.min(...recentAttempts.map(a => a.createdAt));
    const retryAfter = Math.ceil((oldestAttempt + config.windowMs - now) / 1000);
    return { allowed: false, retryAfter, remaining: 0 };
  }

  // Log this attempt - note: this function can be called from both queries and mutations
  // but inserting requires a mutation context. This is a limitation of the current design.
  // For now, we skip logging in query contexts.
  if ('db' in ctx && 'insert' in ctx.db) {
    await (ctx.db as any).insert("activityLog", {
      userId: identifier as Id<"user">,
      action: `rate_limit:${key}`,
      details: JSON.stringify({ timestamp: now, key }),
      createdAt: now,
    });
  }

  return {
    allowed: true,
    remaining: config.limit - recentAttempts.length - 1
  };
}

/**
 * Check rate limit without incrementing (for pre-flight checks)
 */
export async function peekRateLimit(
  ctx: MutationCtx | QueryCtx,
  key: RateLimitKey,
  identifier: Id<"user"> | string
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[key];
  const now = Date.now();
  const windowStart = now - config.windowMs;

  const recentAttempts = await ctx.db
    .query("activityLog")
    .withIndex("by_user", q => q.eq("userId", identifier as Id<"user">))
    .filter(q => q.gte(q.field("createdAt"), windowStart))
    .filter(q => q.eq(q.field("action"), `rate_limit:${key}`))
    .collect();

  if (recentAttempts.length >= config.limit) {
    const oldestAttempt = Math.min(...recentAttempts.map(a => a.createdAt));
    const retryAfter = Math.ceil((oldestAttempt + config.windowMs - now) / 1000);
    return { allowed: false, retryAfter, remaining: 0 };
  }

  return {
    allowed: true,
    remaining: config.limit - recentAttempts.length
  };
}
