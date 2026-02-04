// Utility functions for Convex
import { QueryCtx, MutationCtx } from "./_generated/server";

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
 * Check rate limit for a given key and identifier.
 * 
 * NOTE: Rate limiting is currently disabled as the implementation
 * requires proper user ID resolution from auth subject. This is a 
 * placeholder that always allows the request.
 * 
 * TODO: Implement proper rate limiting with user ID lookup
 */
export async function checkRateLimit(
  _ctx: MutationCtx | QueryCtx,
  _key: RateLimitKey,
  _identifier: string
): Promise<RateLimitResult> {
  // Temporarily disabled - always allow requests
  // The previous implementation had type mismatches between auth subject (string)
  // and userId (Id<"user">) that caused server errors
  return {
    allowed: true,
    remaining: 10
  };
}

/**
 * Check rate limit without incrementing (for pre-flight checks)
 * 
 * NOTE: Rate limiting is currently disabled. This is a placeholder
 * that always allows the request.
 */
export async function peekRateLimit(
  _ctx: MutationCtx | QueryCtx,
  _key: RateLimitKey,
  _identifier: string
): Promise<RateLimitResult> {
  // Temporarily disabled - always allow requests
  return {
    allowed: true,
    remaining: 10
  };
}
