import { v } from "convex/values";
import { query, mutation, internalQuery, internalMutation, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { generateSecureToken, checkRateLimit } from "./utils";
import { logAction } from "./auditLog";

// ============================================
// QUERIES
// ============================================

export const getByApplication = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, { applicationId }) => {
    return await ctx.db
      .query("recommendations")
      .withIndex("by_application", (q) => q.eq("applicationId", applicationId))
      .collect();
  },
});

export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    return await ctx.db
      .query("recommendations")
      .withIndex("by_token", (q) => q.eq("accessToken", token))
      .first();
  },
});

export const getById = query({
  args: { id: v.id("recommendations") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// ============================================
// MUTATIONS
// ============================================

export const create = mutation({
  args: {
    applicationId: v.id("applications"),
    recommenderEmail: v.string(),
    recommenderName: v.string(),
    recommenderType: v.union(v.literal("educator"), v.literal("community_group"), v.literal("other")),
    recommenderOrganization: v.optional(v.string()),
    relationship: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Rate limiting check
    const rateLimit = await checkRateLimit(ctx, "recommendation:create", identity.subject);
    if (!rateLimit.allowed) {
      throw new Error(`Rate limit exceeded. Try again in ${rateLimit.retryAfter} seconds.`);
    }

    // Check if application exists and belongs to user
    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error("Application not found");

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

    // Send email notification
    await ctx.scheduler.runAfter(0, api.emails.sendRecommendationRequest, {
      recommendationId,
    });

    // Update recommendation status
    await ctx.db.patch(recommendationId, {
      status: "email_sent",
      emailSentAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log recommendation request
    await logAction(ctx, {
      action: "recommendation:requested",
      userId: identity.subject,
      applicationId: args.applicationId,
      details: {
        recommenderEmail: args.recommenderEmail,
        recommenderName: args.recommenderName,
      },
    });

    return recommendationId;
  },
});

export const submitRecommendation = mutation({
  args: {
    token: v.string(),
    letterFileId: v.id("_storage"),
    letterText: v.optional(v.string()),
    recommenderName: v.string(),
    recommenderTitle: v.optional(v.string()),
    recommenderOrganization: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find recommendation by token
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
      recommenderName: args.recommenderName,
      recommenderOrganization: args.recommenderOrganization,
      submittedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log recommendation submission
    await logAction(ctx, {
      action: "recommendation:submitted",
      applicationId: rec.applicationId,
      details: {
        recommenderName: args.recommenderName,
        hasFile: !!args.letterFileId,
      },
    });

    // Notify applicant
    await ctx.scheduler.runAfter(0, api.emails.notifyRecommendationReceived, {
      applicationId: rec.applicationId,
      recommenderName: args.recommenderName,
    });

    // Trigger AI summary regeneration
    await ctx.scheduler.runAfter(0, internal.ai.generateSummary, {
      applicationId: rec.applicationId,
    });

    return { success: true };
  },
});

export const sendReminder = mutation({
  args: { recommendationId: v.id("recommendations") },
  handler: async (ctx, { recommendationId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Rate limiting check
    const rateLimit = await checkRateLimit(ctx, "recommendation:sendReminder", identity.subject);
    if (!rateLimit.allowed) {
      throw new Error(`Rate limit exceeded. Try again in ${rateLimit.retryAfter} seconds.`);
    }

    const rec = await ctx.db.get(recommendationId);
    if (!rec) throw new Error("Recommendation not found");

    // Check if can send reminder (max 2 reminders, 7 days apart)
    if (rec.emailRemindersSent >= 2) {
      throw new Error("Maximum reminders sent");
    }

    if (rec.lastReminderAt && Date.now() - rec.lastReminderAt < 7 * 24 * 60 * 60 * 1000) {
      throw new Error("Please wait 7 days between reminders");
    }

    // Send reminder email
    await ctx.scheduler.runAfter(0, api.emails.sendRecommendationReminder, {
      recommendationId,
    });

    // Update reminder count
    await ctx.db.patch(recommendationId, {
      emailRemindersSent: rec.emailRemindersSent + 1,
      lastReminderAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log reminder sent
    await logAction(ctx, {
      action: "recommendation:reminder_sent",
      userId: identity.subject,
      applicationId: rec.applicationId,
      details: {
        recommenderEmail: rec.recommenderEmail,
        reminderNumber: rec.emailRemindersSent + 1,
      },
    });

    return { success: true };
  },
});

export const markAsViewed = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const rec = await ctx.db
      .query("recommendations")
      .withIndex("by_token", (q) => q.eq("accessToken", token))
      .first();

    if (!rec) throw new Error("Invalid token");

    if (rec.status === "email_sent") {
      await ctx.db.patch(rec._id, {
        status: "viewed",
        updatedAt: Date.now(),
      });

      // Log recommendation viewed
      await logAction(ctx, {
        action: "recommendation:viewed",
        applicationId: rec.applicationId,
        details: { recommenderEmail: rec.recommenderEmail },
      });
    }

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
      .query("recommendations")
      .withIndex("by_application", (q) => q.eq("applicationId", applicationId))
      .collect();
  },
});

export const updateStatusInternal = internalMutation({
  args: {
    recommendationId: v.id("recommendations"),
    status: v.union(v.literal("pending"), v.literal("email_sent"), v.literal("viewed"), v.literal("submitted")),
  },
  handler: async (ctx, { recommendationId, status }) => {
    await ctx.db.patch(recommendationId, {
      status,
      updatedAt: Date.now(),
    });
  },
});

// ============================================
// AUTOMATED CRON REMINDERS
// ============================================

/**
 * Automated reminder system called by cron job.
 * Sends reminders at 7 and 14 days after initial email.
 * Maximum 2 automated reminders per recommendation.
 */
export const sendAutoReminders = internalAction({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    // Get all pending recommendations (not submitted)
    const pendingRecs = await ctx.runQuery(internal.recommendations.getPendingForReminders);

    let remindersSent = 0;

    for (const rec of pendingRecs) {
      // Skip if already submitted or token expired
      if (rec.status === "submitted" || rec.tokenExpiresAt < now) {
        continue;
      }

      // Skip if already sent max automated reminders
      if (rec.emailRemindersSent >= 2) {
        continue;
      }

      // Calculate time since email was sent
      const timeSinceEmail = now - (rec.emailSentAt || rec.createdAt);
      const timeSinceLastReminder = rec.lastReminderAt ? now - rec.lastReminderAt : null;

      // Determine if reminder is due
      let shouldSendReminder = false;

      if (rec.emailRemindersSent === 0) {
        // First reminder: 7 days after initial email
        shouldSendReminder = timeSinceEmail >= sevenDaysMs;
      } else if (rec.emailRemindersSent === 1 && timeSinceLastReminder) {
        // Second reminder: 7 days after first reminder
        shouldSendReminder = timeSinceLastReminder >= sevenDaysMs;
      }

      if (shouldSendReminder) {
        try {
          // Send the reminder email
          await ctx.runAction(api.emails.sendRecommendationReminder, {
            recommendationId: rec._id,
          });

          // Update the recommendation record
          await ctx.runMutation(internal.recommendations.updateReminderSent, {
            recommendationId: rec._id,
          });

          remindersSent++;
          console.log(`[Cron] Sent auto-reminder to ${rec.recommenderEmail} for application ${rec.applicationId}`);
        } catch (error) {
          console.error(`[Cron] Failed to send reminder to ${rec.recommenderEmail}:`, error);
        }
      }
    }

    console.log(`[Cron] Automated reminder job complete. Sent ${remindersSent} reminders.`);
    return { remindersSent };
  },
});

/**
 * Internal query to get recommendations eligible for automated reminders.
 */
export const getPendingForReminders = internalQuery({
  args: {},
  handler: async (ctx) => {
    // Get all non-submitted recommendations
    return await ctx.db
      .query("recommendations")
      .filter((q) =>
        q.and(
          q.neq(q.field("status"), "submitted"),
          q.lt(q.field("emailRemindersSent"), 2)
        )
      )
      .collect();
  },
});

/**
 * Internal mutation to update reminder count after automated send.
 */
export const updateReminderSent = internalMutation({
  args: { recommendationId: v.id("recommendations") },
  handler: async (ctx, { recommendationId }) => {
    const rec = await ctx.db.get(recommendationId);
    if (!rec) return;

    await ctx.db.patch(recommendationId, {
      emailRemindersSent: rec.emailRemindersSent + 1,
      lastReminderAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
