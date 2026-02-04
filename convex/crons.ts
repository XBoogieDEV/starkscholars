import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

/**
 * Cron Jobs for William R. Stark Scholarship Platform
 * 
 * Scheduled tasks for automated email reminders and maintenance.
 */
const crons = cronJobs();

// ============================================
// RECOMMENDATION REMINDERS
// ============================================

/**
 * Daily check for pending recommendations that need reminders.
 * Runs at 10:00 AM EST (15:00 UTC) every day.
 * 
 * Logic:
 * - Find recommendations with status "email_sent" or "viewed"
 * - Send first reminder after 7 days
 * - Send second reminder after 14 days
 * - Maximum 2 automated reminders per recommendation
 */
crons.daily(
    "send-recommendation-reminders",
    { hourUTC: 15, minuteUTC: 0 }, // 10:00 AM EST
    internal.recommendations.sendAutoReminders
);

export default crons;
