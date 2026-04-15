import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
// IMPORTANT: Must use verified subdomain mail.starkscholars.com, not root domain
const FROM_EMAIL = "Stark Scholars <info@mail.starkscholars.com>";

// ============================================
// EMAIL LOG TYPES
// ============================================

type EmailType =
  | "recommendation_request"
  | "recommendation_reminder"
  | "recommendation_received"
  | "welcome"
  | "email_verification"
  | "password_reset"
  | "application_submitted"
  | "application_withdrawn"
  | "selection_congratulations"
  | "selection_not_selected"
  | "user_invite";

type EmailStatus = "pending" | "sent" | "failed" | "bounced";

// ============================================
// EMAIL LOGGING MUTATIONS
// ============================================

export const createEmailLog = internalMutation({
  args: {
    type: v.string(),
    recipientEmail: v.string(),
    subject: v.string(),
    relatedId: v.optional(v.string()),
    relatedType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("emailLogs", {
      type: args.type,
      recipientEmail: args.recipientEmail,
      subject: args.subject,
      status: "pending",
      relatedId: args.relatedId,
      relatedType: args.relatedType,
      attempts: 0,
      lastAttemptAt: Date.now(),
      createdAt: Date.now(),
    });
  },
});

export const updateEmailLogSuccess = internalMutation({
  args: {
    logId: v.id("emailLogs"),
    resendId: v.string(),
  },
  handler: async (ctx, { logId, resendId }) => {
    await ctx.db.patch(logId, {
      status: "sent",
      resendId,
      sentAt: Date.now(),
      lastAttemptAt: Date.now(),
    });
  },
});

export const updateEmailLogFailure = internalMutation({
  args: {
    logId: v.id("emailLogs"),
    error: v.string(),
    attempts: v.number(),
  },
  handler: async (ctx, { logId, error, attempts }) => {
    await ctx.db.patch(logId, {
      status: "failed",
      error,
      attempts,
      lastAttemptAt: Date.now(),
    });
  },
});

export const incrementEmailAttempts = internalMutation({
  args: { logId: v.id("emailLogs") },
  handler: async (ctx, { logId }) => {
    const log = await ctx.db.get(logId);
    if (!log) return;
    await ctx.db.patch(logId, {
      attempts: log.attempts + 1,
      lastAttemptAt: Date.now(),
    });
  },
});

// ============================================
// EMAIL LOG QUERIES
// ============================================

export const listEmailLogs = query({
  args: {
    status: v.optional(v.string()),
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { status, type, limit = 100 }) => {
    let query = ctx.db.query("emailLogs").order("desc");

    const logs = await query.collect();

    // Filter in memory (Convex doesn't support multiple index filters)
    let filtered = logs;
    if (status) {
      filtered = filtered.filter(l => l.status === status);
    }
    if (type) {
      filtered = filtered.filter(l => l.type === type);
    }

    return filtered.slice(0, limit);
  },
});

export const getEmailLogsByRelated = query({
  args: {
    relatedType: v.string(),
    relatedId: v.string(),
  },
  handler: async (ctx, { relatedType, relatedId }) => {
    return await ctx.db
      .query("emailLogs")
      .withIndex("by_related", q => q.eq("relatedType", relatedType).eq("relatedId", relatedId))
      .collect();
  },
});

export const getEmailLogById = internalQuery({
  args: { logId: v.id("emailLogs") },
  handler: async (ctx, { logId }) => {
    return await ctx.db.get(logId);
  },
});

// ============================================
// EMAIL SENDING HELPER (with logging)
// ============================================

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

interface SendEmailResult {
  success: boolean;
  resendId?: string;
  error?: string;
}

async function sendEmailToResend({ to, subject, html }: SendEmailParams): Promise<SendEmailResult> {
  console.log(`[sendEmail] Attempting to send email to: ${to}`);
  console.log(`[sendEmail] Subject: ${subject}`);
  console.log(`[sendEmail] From: ${FROM_EMAIL}`);
  console.log(`[sendEmail] API Key exists: ${!!RESEND_API_KEY}`);

  if (!RESEND_API_KEY) {
    console.error("[sendEmail] RESEND_API_KEY is not set!");
    return { success: false, error: "RESEND_API_KEY is not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    });

    const responseText = await response.text();
    console.log(`[sendEmail] Response status: ${response.status}`);
    console.log(`[sendEmail] Response body: ${responseText}`);

    if (!response.ok) {
      console.error(`[sendEmail] Failed to send email: ${responseText}`);
      return { success: false, error: responseText };
    }

    const result = JSON.parse(responseText);
    console.log(`[sendEmail] Email sent successfully! ID: ${result.id}`);
    return { success: true, resendId: result.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[sendEmail] Error sending email:`, error);
    return { success: false, error: errorMessage };
  }
}

// ============================================
// BRAND DESIGN SYSTEM — "Modern Elegance with Classic Prestige"
// ============================================

type EmailVariant = 'default' | 'success' | 'alert';

interface VariantColors {
  ctaBg: string;
  infoBoxBg: string;
  infoBoxBorder: string;
}

const VARIANT_COLORS: Record<EmailVariant, VariantColors> = {
  default: { ctaBg: '#D4AF37', infoBoxBg: '#F7F0D8', infoBoxBorder: '#D4AF37' },
  success: { ctaBg: '#16A34A', infoBoxBg: '#F0FDF4', infoBoxBorder: '#16A34A' },
  alert:   { ctaBg: '#DC2626', infoBoxBg: '#FEF2F2', infoBoxBorder: '#DC2626' },
};

// Brand constants
const GOLD = '#D4AF37';
const NAVY = '#0F172A';
const WARM_PAPER = '#F9F8F6';
const BODY_TEXT = '#334155';
const MUTED_TEXT = '#64748B';
const LIGHT_BORDER = '#E2E8F0';
const HEADING_FONT = "Georgia, 'Times New Roman', Times, serif";
const BODY_FONT = "Arial, Helvetica, sans-serif";

function emailHeader(): string {
  return `
    <tr>
      <td style="background-color: ${NAVY}; padding: 40px 30px 32px 30px; text-align: center;">
        <!-- Gold accent line top -->
        <table role="presentation" width="80" cellspacing="0" cellpadding="0" style="margin: 0 auto 20px auto;">
          <tr><td style="border-top: 2px solid ${GOLD}; font-size: 0; line-height: 0;">&nbsp;</td></tr>
        </table>
        <img src="https://starkscholars.com/images/Stark2023_heritage.png" alt="Stark Scholars" width="240" style="display:block; margin:0 auto 16px auto;" />
        <!-- Gold accent line below logo -->
        <table role="presentation" width="80" cellspacing="0" cellpadding="0" style="margin: 0 auto 16px auto;">
          <tr><td style="border-top: 2px solid ${GOLD}; font-size: 0; line-height: 0;">&nbsp;</td></tr>
        </table>
        <h1 style="color: #ffffff; font-family: ${HEADING_FONT}; font-size: 26px; margin: 0 0 8px 0; font-weight: normal; letter-spacing: 3px; text-transform: uppercase;">
          &#9733; STARK SCHOLARS &#9733;
        </h1>
        <p style="color: ${GOLD}; font-family: ${BODY_FONT}; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">
          WILLIAM R. STARK FINANCIAL ASSISTANCE PROGRAM
        </p>
      </td>
    </tr>`;
}

function goldDivider(): string {
  return `
    <tr>
      <td style="padding: 0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td width="25%" style="border-top: 3px solid rgba(212,175,55,0.15);"></td>
            <td width="50%" style="border-top: 3px solid ${GOLD};"></td>
            <td width="25%" style="border-top: 3px solid rgba(212,175,55,0.15);"></td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function goldSectionDivider(): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
      <tr>
        <td width="40%" style="border-top: 1px solid ${LIGHT_BORDER};"></td>
        <td width="20%" style="border-top: 1px solid ${GOLD};"></td>
        <td width="40%" style="border-top: 1px solid ${LIGHT_BORDER};"></td>
      </tr>
    </table>`;
}

function emailFooter(): string {
  return `
    <tr>
      <td style="background-color: ${NAVY}; border-top: 3px solid ${GOLD}; padding: 32px 40px; text-align: center;">
        <p style="color: #94A3B8; font-family: ${BODY_FONT}; font-size: 14px; margin: 0 0 12px 0;">
          Questions? Contact us at
          <a href="mailto:blackgoldmine@sbcglobal.net" style="color: ${GOLD}; text-decoration: none;">
            blackgoldmine@sbcglobal.net
          </a>
        </p>
        <p style="color: #64748B; font-family: ${HEADING_FONT}; font-size: 13px; margin: 0 0 8px 0; letter-spacing: 1px;">
          &#9733; Stark Scholars &#9733;
        </p>
        <p style="color: #475569; font-family: ${BODY_FONT}; font-size: 11px; margin: 0;">
          &copy; 2026 William R. Stark Financial Assistance Committee
        </p>
      </td>
    </tr>`;
}

function signatureBlock(closing: string, includeChairman?: boolean): string {
  return `
    <p style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 16px; line-height: 1.7; margin: 0 0 4px 0;">
      <em>${closing}</em>
    </p>
    ${includeChairman ? `
    <p style="color: ${NAVY}; font-family: ${BODY_FONT}; font-size: 14px; margin: 0 0 2px 0; font-weight: bold;">
      GIG Kenny R. Askew 33&deg;, Chairman
    </p>` : ''}
    <p style="color: ${MUTED_TEXT}; font-family: ${BODY_FONT}; font-size: 14px; margin: 0;">
      William R. Stark Financial Assistance Committee
    </p>`;
}

function ctaButton(url: string, label: string, variant: EmailVariant = 'default'): string {
  const bg = VARIANT_COLORS[variant].ctaBg;
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
      <tr>
        <td style="background-color: ${bg}; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <a href="${url}" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-family: ${BODY_FONT}; font-size: 16px; font-weight: bold; letter-spacing: 0.5px;">
            ${label}
          </a>
        </td>
      </tr>
    </table>`;
}

function infoBox(variant: EmailVariant, title: string, bodyHtml: string): string {
  const v = VARIANT_COLORS[variant];
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${v.infoBoxBg}; border-radius: 8px; border-left: 4px solid ${v.infoBoxBorder};">
      <tr>
        <td style="padding: 20px 24px;">
          <h3 style="color: ${NAVY}; font-family: ${HEADING_FONT}; font-size: 16px; margin: 0 0 10px 0; font-weight: bold;">${title}</h3>
          <div style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px; line-height: 1.6;">${bodyHtml}</div>
        </td>
      </tr>
    </table>`;
}

function wrapEmail(innerHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: ${BODY_FONT}; background-color: ${WARM_PAPER}; line-height: 1.7;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${WARM_PAPER};">
    <tr>
      <td align="center" style="padding: 48px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.04); border: 1px solid ${LIGHT_BORDER};">
          ${innerHtml}
        </table>
        <!-- Star tagline below card -->
        <p style="color: ${MUTED_TEXT}; font-family: ${HEADING_FONT}; font-size: 12px; margin: 16px 0 0 0; letter-spacing: 1px;">
          &#9733; Stark Scholars &#9733;
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function contentSection(html: string): string {
  return `
    <tr>
      <td style="padding: 48px 48px 0 48px;">
        ${html}
      </td>
    </tr>`;
}

function contentSectionBottom(html: string): string {
  return `
    <tr>
      <td style="padding: 0 48px 48px 48px;">
        ${html}
      </td>
    </tr>`;
}

function contentSectionFull(html: string): string {
  return `
    <tr>
      <td style="padding: 0 48px;">
        ${html}
      </td>
    </tr>`;
}

function ctaSection(url: string, label: string, variant: EmailVariant = 'default', fallbackUrl?: string): string {
  return `
    <tr>
      <td style="padding: 32px 48px;" align="center">
        ${ctaButton(url, label, variant)}
        ${fallbackUrl !== undefined ? `<p style="font-family: ${BODY_FONT}; font-size: 12px; color: ${MUTED_TEXT}; margin: 12px 0 0 0; word-break: break-all;">Or copy and paste this link: ${fallbackUrl}</p>` : ''}
      </td>
    </tr>`;
}

function sectionHeading(text: string): string {
  return `<h2 style="color: ${NAVY}; font-family: ${HEADING_FONT}; font-size: 28px; margin: 0 0 20px 0; font-weight: normal;">${text}</h2>`;
}

function bodyText(text: string): string {
  return `<p style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">${text}</p>`;
}

// ============================================
// RECOMMENDATION EMAILS
// ============================================

export const sendRecommendationRequest = action({
  args: { recommendationId: v.id("recommendations") },
  handler: async (ctx, { recommendationId }) => {
    const rec = await ctx.runQuery(api.recommendations.getById, { id: recommendationId });
    if (!rec) throw new Error("Recommendation not found");

    const application = await ctx.runQuery(api.applications.getById, {
      id: rec.applicationId,
    });
    if (!application) throw new Error("Application not found");

    const applicant = await ctx.runQuery(api.users.getById, { id: application.userId });
    if (!applicant) throw new Error("Applicant not found");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://starkscholars.com";
    const recommendationUrl = `${appUrl}/recommend/${rec.accessToken}`;

    const subject = `Recommendation Request for ${application.firstName} ${application.lastName} - Stark Scholars`;

    const html = wrapEmail(`
      ${emailHeader()}
      ${goldDivider()}
      ${contentSection(`
        ${sectionHeading('Recommendation Request')}
        ${bodyText(`Dear ${rec.recommenderName || "Recommender"},`)}
        ${bodyText(`<strong>${application.firstName} ${application.lastName}</strong> has requested that you provide a letter of recommendation for the <strong>William R. Stark Financial Assistance Program</strong>.`)}
      `)}
      ${contentSectionFull(infoBox('default', 'About the Scholarship',
        `The William R. Stark Class of 2023 President&apos;s Club awards two $500 scholarships to Michigan students committed to using their education to improve their communities.`
      ))}
      ${contentSectionFull(`
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
          <tr><td style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px; line-height: 1.8;">
            <strong>Relationship:</strong> ${rec.relationship || "Not specified"}<br>
            <strong>Applicant:</strong> ${application.firstName} ${application.lastName}<br>
            <strong>High School:</strong> ${application.highSchoolName || "Not provided"}<br>
            <strong>College:</strong> ${application.collegeName || "Not provided"}
          </td></tr>
        </table>
      `)}
      ${ctaSection(recommendationUrl, 'Submit Recommendation Letter', 'default', recommendationUrl)}
      ${contentSectionFull(`
        ${goldSectionDivider()}
        <h3 style="color: ${NAVY}; font-family: ${HEADING_FONT}; font-size: 16px; margin: 0 0 12px 0;">What to Include</h3>
        <ul style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px; padding-left: 20px; margin: 0; line-height: 1.8;">
          <li>How long and in what capacity you&apos;ve known the applicant</li>
          <li>The applicant&apos;s academic abilities and achievements</li>
          <li>The applicant&apos;s character and personal qualities</li>
          <li>Examples of community involvement or leadership</li>
          <li>Why you believe they deserve this scholarship</li>
        </ul>
      `)}
      ${contentSectionFull(`
        <p style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px; margin: 20px 0 16px 0;">
          <strong>Deadline:</strong> This link will expire on ${new Date(rec.tokenExpiresAt).toLocaleDateString()}.
        </p>
        <p style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px; margin: 0 0 16px 0;">
          If you have any questions, please contact the scholarship committee at
          <a href="mailto:blackgoldmine@sbcglobal.net" style="color: ${GOLD};">blackgoldmine@sbcglobal.net</a>.
        </p>
      `)}
      ${contentSectionBottom(`
        ${bodyText(`Thank you for supporting ${application.firstName}&apos;s educational journey.`)}
        ${signatureBlock('Fraternally,', true)}
      `)}
      ${emailFooter()}
    `);

    // Create email log
    const logId = await ctx.runMutation(internal.emails.createEmailLog, {
      type: "recommendation_request",
      recipientEmail: rec.recommenderEmail,
      subject,
      relatedId: recommendationId,
      relatedType: "recommendation",
    });

    // Send email
    const result = await sendEmailToResend({
      to: rec.recommenderEmail,
      subject,
      html,
    });

    // Update log with result
    if (result.success && result.resendId) {
      await ctx.runMutation(internal.emails.updateEmailLogSuccess, {
        logId,
        resendId: result.resendId,
      });
    } else {
      await ctx.runMutation(internal.emails.updateEmailLogFailure, {
        logId,
        error: result.error || "Unknown error",
        attempts: 1,
      });
      throw new Error(`Failed to send email: ${result.error}`);
    }

    return { success: true, resendId: result.resendId };
  },
});

export const sendRecommendationReminder = action({
  args: { recommendationId: v.id("recommendations") },
  handler: async (ctx, { recommendationId }) => {
    const rec = await ctx.runQuery(api.recommendations.getById, { id: recommendationId });
    if (!rec) throw new Error("Recommendation not found");

    const application = await ctx.runQuery(api.applications.getById, {
      id: rec.applicationId,
    });
    if (!application) throw new Error("Application not found");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://starkscholars.com";
    const recommendationUrl = `${appUrl}/recommend/${rec.accessToken}`;

    const subject = `Reminder: Recommendation Request for ${application.firstName} ${application.lastName}`;

    const html = wrapEmail(`
      ${emailHeader()}
      ${goldDivider()}
      ${contentSection(`
        ${sectionHeading('Friendly Reminder: Recommendation Request')}
        ${bodyText(`Dear ${rec.recommenderName || "Recommender"},`)}
        ${bodyText(`This is a friendly reminder that <strong>${application.firstName} ${application.lastName}</strong> is still waiting for your letter of recommendation for the William R. Stark Financial Assistance Program.`)}
      `)}
      ${ctaSection(recommendationUrl, 'Submit Recommendation Letter', 'default')}
      ${contentSectionFull(`
        <p style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px; margin: 0 0 16px 0;">
          <strong>Deadline:</strong> This link will expire on ${new Date(rec.tokenExpiresAt).toLocaleDateString()}.
        </p>
        <p style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px; margin: 0 0 16px 0;">
          If you have any questions, please contact the scholarship committee at
          <a href="mailto:blackgoldmine@sbcglobal.net" style="color: ${GOLD};">blackgoldmine@sbcglobal.net</a>.
        </p>
      `)}
      ${contentSectionBottom(`
        ${bodyText('Thank you for your time and support.')}
        ${signatureBlock('Fraternally,')}
      `)}
      ${emailFooter()}
    `);

    // Create email log
    const logId = await ctx.runMutation(internal.emails.createEmailLog, {
      type: "recommendation_reminder",
      recipientEmail: rec.recommenderEmail,
      subject,
      relatedId: recommendationId,
      relatedType: "recommendation",
    });

    // Send email
    const result = await sendEmailToResend({
      to: rec.recommenderEmail,
      subject,
      html,
    });

    // Update log with result
    if (result.success && result.resendId) {
      await ctx.runMutation(internal.emails.updateEmailLogSuccess, {
        logId,
        resendId: result.resendId,
      });
    } else {
      await ctx.runMutation(internal.emails.updateEmailLogFailure, {
        logId,
        error: result.error || "Unknown error",
        attempts: 1,
      });
      throw new Error(`Failed to send email: ${result.error}`);
    }

    return { success: true, resendId: result.resendId };
  },
});

export const notifyRecommendationReceived = action({
  args: {
    applicationId: v.id("applications"),
    recommenderName: v.string(),
  },
  handler: async (ctx, { applicationId, recommenderName }) => {
    const application = await ctx.runQuery(api.applications.getById, {
      id: applicationId,
    });
    if (!application) throw new Error("Application not found");

    const user = await ctx.runQuery(api.users.getById, { id: application.userId });
    if (!user) throw new Error("User not found");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://starkscholars.com";

    const subject = "Recommendation Received - Stark Scholars";

    const html = wrapEmail(`
      ${emailHeader()}
      ${goldDivider()}
      ${contentSection(`
        ${sectionHeading('Recommendation Received!')}
        ${bodyText(`Hello ${application.firstName || user.name || "Applicant"},`)}
        ${bodyText(`Good news! <strong>${recommenderName}</strong> has submitted their letter of recommendation for your William R. Stark Financial Assistance application.`)}
      `)}
      ${contentSectionFull(infoBox('success', 'Status Update',
        `You can check the status of all your recommendations by visiting your application dashboard.`
      ))}
      ${ctaSection(`${appUrl}/apply/dashboard`, 'View Application Status', 'success')}
      ${contentSectionBottom(signatureBlock('Best regards,'))}
      ${emailFooter()}
    `);

    // Create email log
    const logId = await ctx.runMutation(internal.emails.createEmailLog, {
      type: "recommendation_received",
      recipientEmail: user.email,
      subject,
      relatedId: applicationId,
      relatedType: "application",
    });

    // Send email
    const result = await sendEmailToResend({
      to: user.email,
      subject,
      html,
    });

    // Update log with result
    if (result.success && result.resendId) {
      await ctx.runMutation(internal.emails.updateEmailLogSuccess, {
        logId,
        resendId: result.resendId,
      });
    } else {
      await ctx.runMutation(internal.emails.updateEmailLogFailure, {
        logId,
        error: result.error || "Unknown error",
        attempts: 1,
      });
      throw new Error(`Failed to send email: ${result.error}`);
    }

    return { success: true, resendId: result.resendId };
  },
});

// ============================================
// USER ACCOUNT EMAILS
// ============================================

export const sendWelcomeEmail = action({
  args: { userId: v.id("user") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.runQuery(api.users.getById, { id: userId });
    if (!user) throw new Error("User not found");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://starkscholars.com";

    const subject = "Welcome to Stark Scholars - Your Journey Begins!";

    const html = wrapEmail(`
      ${emailHeader()}
      ${goldDivider()}
      ${contentSection(`
        ${sectionHeading(`Welcome, ${user.name || "Future Scholar"}!`)}
        ${bodyText(`Thank you for joining the William R. Stark Class of 2023 President's Club scholarship program. We're honored that you're considering us on your educational journey.`)}
      `)}
      ${contentSectionFull(infoBox('default', 'Next Steps', `
        <table role="presentation" cellspacing="0" cellpadding="0" width="100%">
          <tr><td style="padding: 4px 0; color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px;">
            <span style="display: inline-block; width: 28px; text-align: center; font-weight: bold; color: ${GOLD};">1.</span>
            Complete your application (7 steps)
          </td></tr>
          <tr><td style="padding: 4px 0; color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px;">
            <span style="display: inline-block; width: 28px; text-align: center; font-weight: bold; color: ${GOLD};">2.</span>
            Request 2 recommendation letters
          </td></tr>
          <tr><td style="padding: 4px 0; color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px;">
            <span style="display: inline-block; width: 28px; text-align: center; font-weight: bold; color: ${GOLD};">3.</span>
            Submit before <strong>April 15, 2026</strong>
          </td></tr>
        </table>
      `))}
      ${ctaSection(`${appUrl}/apply/dashboard`, 'Start Your Application &rarr;', 'default')}
      ${contentSectionBottom(signatureBlock('Fraternally,', true))}
      ${emailFooter()}
    `);

    // Create email log
    const logId = await ctx.runMutation(internal.emails.createEmailLog, {
      type: "welcome",
      recipientEmail: user.email,
      subject,
      relatedId: userId,
      relatedType: "user",
    });

    // Send email
    const result = await sendEmailToResend({
      to: user.email,
      subject,
      html,
    });

    // Update log with result
    if (result.success && result.resendId) {
      await ctx.runMutation(internal.emails.updateEmailLogSuccess, {
        logId,
        resendId: result.resendId,
      });
    } else {
      await ctx.runMutation(internal.emails.updateEmailLogFailure, {
        logId,
        error: result.error || "Unknown error",
        attempts: 1,
      });
      throw new Error(`Failed to send email: ${result.error}`);
    }

    return { success: true, resendId: result.resendId };
  }
});

export const sendInviteEmail = action({
  args: { inviteId: v.id("userInvites") },
  handler: async (ctx, { inviteId }) => {
    const invite2 = await ctx.runQuery(internal.userInvites.getById, { id: inviteId });
    if (!invite2) throw new Error("Invite not found");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://starkscholars.com";
    const acceptUrl = `${appUrl}/invite/accept?token=${invite2.token}`;
    const roleName = invite2.role === "admin" ? "Administrator" : "Committee Member";
    const expiresDate = new Date(invite2.expiresAt).toLocaleDateString();

    const subject = `You're Invited to Stark Scholars ${roleName} Portal`;

    const html = wrapEmail(`
      ${emailHeader()}
      ${goldDivider()}
      ${contentSection(`
        ${sectionHeading(`You're Invited!`)}
        ${bodyText(`Hello${invite2.name ? ` ${invite2.name}` : ''},`)}
        ${bodyText(`You have been invited to join the <strong>William R. Stark Financial Assistance Program</strong> as ${invite2.role === "admin" ? "an <strong>Administrator</strong>" : "a <strong>Committee Member</strong>"}.`)}
      `)}
      ${contentSectionFull(infoBox('default', `About the ${roleName} Role`,
        invite2.role === "admin"
          ? 'As an administrator, you will have full access to manage applications, committee members, and program settings.'
          : 'As a committee member, you will review and evaluate scholarship applications from students across Michigan.'
      ))}
      ${ctaSection(acceptUrl, 'Accept Invitation', 'default', acceptUrl)}
      ${contentSectionFull(`
        <p style="color: ${MUTED_TEXT}; font-family: ${BODY_FONT}; font-size: 14px; margin: 0;">
          This invitation will expire on <strong>${expiresDate}</strong>. If you have any questions, please contact the scholarship committee.
        </p>
      `)}
      ${contentSectionBottom(signatureBlock('Fraternally,', true))}
      ${emailFooter()}
    `);

    // Create email log
    const logId = await ctx.runMutation(internal.emails.createEmailLog, {
      type: "user_invite",
      recipientEmail: invite2.email,
      subject,
      relatedId: inviteId,
      relatedType: "invite",
    });

    // Send email
    const result = await sendEmailToResend({
      to: invite2.email,
      subject,
      html,
    });

    // Update log with result
    if (result.success && result.resendId) {
      await ctx.runMutation(internal.emails.updateEmailLogSuccess, {
        logId,
        resendId: result.resendId,
      });
    } else {
      await ctx.runMutation(internal.emails.updateEmailLogFailure, {
        logId,
        error: result.error || "Unknown error",
        attempts: 1,
      });
      throw new Error(`Failed to send invite email: ${result.error}`);
    }

    return { success: true, resendId: result.resendId };
  },
});

export const sendEmailVerification = action({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    url: v.string() // Verification URL from Better Auth
  },
  handler: async (ctx, { email, name, url }) => {
    const subject = "Verify Your Email - Stark Scholars";

    const html = wrapEmail(`
      ${emailHeader()}
      ${goldDivider()}
      ${contentSection(`
        ${sectionHeading('Verify Your Email Address')}
        ${bodyText(`Hello ${name || "Scholar"},`)}
        ${bodyText('Please verify your email address to complete your registration for the William R. Stark Financial Assistance Program.')}
      `)}
      ${ctaSection(url, 'Verify Email Address', 'default', url)}
      ${contentSectionFull(`
        <p style="color: ${MUTED_TEXT}; font-family: ${BODY_FONT}; font-size: 14px; margin: 0;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      `)}
      ${contentSectionBottom(signatureBlock('Best regards,'))}
      ${emailFooter()}
    `);

    // Create email log
    const logId = await ctx.runMutation(internal.emails.createEmailLog, {
      type: "email_verification",
      recipientEmail: email,
      subject,
    });

    // Send email
    const result = await sendEmailToResend({
      to: email,
      subject,
      html,
    });

    // Update log with result
    if (result.success && result.resendId) {
      await ctx.runMutation(internal.emails.updateEmailLogSuccess, {
        logId,
        resendId: result.resendId,
      });
    } else {
      await ctx.runMutation(internal.emails.updateEmailLogFailure, {
        logId,
        error: result.error || "Unknown error",
        attempts: 1,
      });
      throw new Error(`Failed to send email: ${result.error}`);
    }

    return { success: true, resendId: result.resendId };
  }
});

export const sendPasswordResetEmail = action({
  args: {
    email: v.string(),
    url: v.string()  // Reset URL from Better Auth
  },
  handler: async (ctx, { email, url }) => {
    const subject = "Reset Your Password - Stark Scholars";

    const html = wrapEmail(`
      ${emailHeader()}
      ${goldDivider()}
      ${contentSection(`
        ${sectionHeading('Reset Your Password')}
        ${bodyText('Hello,')}
        ${bodyText('You requested a password reset for your Stark Scholars account. Click the button below to create a new password.')}
      `)}
      ${ctaSection(url, 'Reset Password', 'default', url)}
      ${contentSectionFull(`
        <p style="color: ${MUTED_TEXT}; font-family: ${BODY_FONT}; font-size: 14px; margin: 0;">
          This link will expire in 1 hour. If you didn't request this reset, you can safely ignore this email.
        </p>
      `)}
      ${contentSectionBottom(signatureBlock('Best regards,'))}
      ${emailFooter()}
    `);

    // Create email log
    const logId = await ctx.runMutation(internal.emails.createEmailLog, {
      type: "password_reset",
      recipientEmail: email,
      subject,
    });

    // Send email
    const result = await sendEmailToResend({
      to: email,
      subject,
      html,
    });

    // Update log with result
    if (result.success && result.resendId) {
      await ctx.runMutation(internal.emails.updateEmailLogSuccess, {
        logId,
        resendId: result.resendId,
      });
    } else {
      await ctx.runMutation(internal.emails.updateEmailLogFailure, {
        logId,
        error: result.error || "Unknown error",
        attempts: 1,
      });
      throw new Error(`Failed to send email: ${result.error}`);
    }

    return { success: true, resendId: result.resendId };
  }
});

// ============================================
// APPLICATION EMAILS
// ============================================

export const sendApplicationSubmitted = action({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, { applicationId }) => {
    const application = await ctx.runQuery(api.applications.getById, {
      id: applicationId,
    });
    if (!application) throw new Error("Application not found");

    const user = await ctx.runQuery(api.users.getById, { id: application.userId });
    if (!user) throw new Error("User not found");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://starkscholars.com";

    const subject = "Application Submitted - Stark Scholars";

    const html = wrapEmail(`
      ${emailHeader()}
      ${goldDivider()}
      ${contentSection(`
        ${sectionHeading('Application Submitted!')}
        ${bodyText(`Hello ${application.firstName || user.name || "Applicant"},`)}
        ${bodyText('Congratulations! Your application for the <strong>William R. Stark Financial Assistance Program</strong> has been submitted successfully.')}
      `)}
      ${contentSectionFull(infoBox('success', 'What Happens Next?', `
        <ul style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px; padding-left: 20px; margin: 0; line-height: 1.8;">
          <li>Your application will be reviewed by the scholarship committee</li>
          <li>All committee members will evaluate your application</li>
          <li>Selections will be announced by May 1, 2026</li>
          <li>You will be notified via email of the decision</li>
        </ul>
      `))}
      ${contentSectionFull(`
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
          <tr><td style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px; line-height: 1.8;">
            <strong>Application Reference:</strong> ${application._id}<br>
            <strong>Submitted:</strong> ${new Date().toLocaleDateString()}
          </td></tr>
        </table>
      `)}
      ${ctaSection(`${appUrl}/apply/status`, 'View Application Status', 'success')}
      ${contentSectionBottom(signatureBlock('Best regards,'))}
      ${emailFooter()}
    `);

    // Create email log
    const logId = await ctx.runMutation(internal.emails.createEmailLog, {
      type: "application_submitted",
      recipientEmail: user.email,
      subject,
      relatedId: applicationId,
      relatedType: "application",
    });

    // Send email
    const result = await sendEmailToResend({
      to: user.email,
      subject,
      html,
    });

    // Update log with result
    if (result.success && result.resendId) {
      await ctx.runMutation(internal.emails.updateEmailLogSuccess, {
        logId,
        resendId: result.resendId,
      });
    } else {
      await ctx.runMutation(internal.emails.updateEmailLogFailure, {
        logId,
        error: result.error || "Unknown error",
        attempts: 1,
      });
      throw new Error(`Failed to send email: ${result.error}`);
    }

    return { success: true, resendId: result.resendId };
  },
});

export const sendWithdrawalConfirmation = action({
  args: {
    applicationId: v.id("applications"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { applicationId, reason }) => {
    const application = await ctx.runQuery(api.applications.getById, {
      id: applicationId,
    });
    if (!application) throw new Error("Application not found");

    const user = await ctx.runQuery(api.users.getById, { id: application.userId });
    if (!user) throw new Error("User not found");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://starkscholars.com";

    const subject = "Application Withdrawn - Stark Scholars";

    const html = wrapEmail(`
      ${emailHeader()}
      ${goldDivider()}
      ${contentSection(`
        ${sectionHeading('Application Withdrawn')}
        ${bodyText(`Hello ${application.firstName || user.name || "Applicant"},`)}
        ${bodyText('Your application for the William R. Stark Financial Assistance Program has been withdrawn as requested.')}
        ${reason ? bodyText(`<strong>Reason:</strong> ${reason}`) : ''}
      `)}
      ${contentSectionFull(infoBox('alert', 'Reapply?',
        'If you withdrew before the deadline (April 15, 2026), you may submit a new application if you wish.'
      ))}
      ${ctaSection(`${appUrl}/apply/dashboard`, 'Start New Application', 'alert')}
      ${contentSectionFull(`
        <p style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px; margin: 0;">
          If you have any questions, please contact us at
          <a href="mailto:blackgoldmine@sbcglobal.net" style="color: ${GOLD};">blackgoldmine@sbcglobal.net</a>.
        </p>
      `)}
      ${contentSectionBottom(signatureBlock('Best regards,'))}
      ${emailFooter()}
    `);

    // Create email log
    const logId = await ctx.runMutation(internal.emails.createEmailLog, {
      type: "application_withdrawn",
      recipientEmail: user.email,
      subject,
      relatedId: applicationId,
      relatedType: "application",
    });

    // Send email
    const result = await sendEmailToResend({
      to: user.email,
      subject,
      html,
    });

    // Update log with result
    if (result.success && result.resendId) {
      await ctx.runMutation(internal.emails.updateEmailLogSuccess, {
        logId,
        resendId: result.resendId,
      });
    } else {
      await ctx.runMutation(internal.emails.updateEmailLogFailure, {
        logId,
        error: result.error || "Unknown error",
        attempts: 1,
      });
      throw new Error(`Failed to send email: ${result.error}`);
    }

    return { success: true, resendId: result.resendId };
  },
});

// ============================================
// RETRY FAILED EMAILS (for admin use)
// ============================================

export const retryFailedEmail = internalAction({
  args: { logId: v.id("emailLogs") },
  handler: async (ctx, { logId }) => {
    // Get the email log
    const log = await ctx.runQuery(internal.emails.getEmailLogById, { logId });
    if (!log) throw new Error("Email log not found");
    if (log.status !== "failed") throw new Error("Email is not in failed status");

    // Increment attempts
    await ctx.runMutation(internal.emails.incrementEmailAttempts, { logId });

    // Re-send based on type (simplified - would need to reconstruct HTML)
    console.log(`[retryFailedEmail] Retrying email ${logId} of type ${log.type} to ${log.recipientEmail}`);

    // For now, just mark as needing manual resend
    // A full implementation would need to store the HTML or reconstruct it
    throw new Error("Retry not implemented - use resend mutation directly");
  },
});

// ============================================
// TEST: Send all email templates to a test address (keep for future use)
// ============================================

export const sendAllTestEmails = action({
  args: { testEmail: v.string() },
  handler: async (ctx, { testEmail }) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://starkscholars.com";
    const results: { template: string; success: boolean; error?: string }[] = [];
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const sampleRecUrl = `${appUrl}/recommend/sample-test-token-12345`;
    const sampleDate = new Date().toLocaleDateString();

    // ---- 1. Recommendation Request ----
    const recRequestHtml = wrapEmail(`
      ${emailHeader()}
      ${goldDivider()}
      ${contentSection(`
        ${sectionHeading('Recommendation Request')}
        ${bodyText('Dear Dr. Martin Luther King,')}
        ${bodyText('<strong>Aaron Dickason</strong> has requested that you provide a letter of recommendation for the <strong>William R. Stark Financial Assistance Program</strong>.')}
      `)}
      ${contentSectionFull(infoBox('default', 'About the Scholarship',
        'The William R. Stark Class of 2023 President&apos;s Club awards two $500 scholarships to Michigan students committed to using their education to improve their communities.'
      ))}
      ${contentSectionFull(`
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
          <tr><td style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px; line-height: 1.8;">
            <strong>Relationship:</strong> Academic Advisor<br>
            <strong>Applicant:</strong> Aaron Dickason<br>
            <strong>High School:</strong> Cass Technical High School<br>
            <strong>College:</strong> University of Michigan
          </td></tr>
        </table>
      `)}
      ${ctaSection(sampleRecUrl, 'Submit Recommendation Letter', 'default', sampleRecUrl)}
      ${contentSectionFull(`
        ${goldSectionDivider()}
        <h3 style="color: ${NAVY}; font-family: ${HEADING_FONT}; font-size: 16px; margin: 0 0 12px 0;">What to Include</h3>
        <ul style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px; padding-left: 20px; margin: 0; line-height: 1.8;">
          <li>How long and in what capacity you&apos;ve known the applicant</li>
          <li>The applicant&apos;s academic abilities and achievements</li>
          <li>The applicant&apos;s character and personal qualities</li>
          <li>Examples of community involvement or leadership</li>
          <li>Why you believe they deserve this scholarship</li>
        </ul>
      `)}
      ${contentSectionFull(`
        <p style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px; margin: 20px 0 16px 0;">
          <strong>Deadline:</strong> This link will expire on ${sampleDate}.
        </p>
      `)}
      ${contentSectionBottom(`
        ${bodyText('Thank you for supporting Aaron&apos;s educational journey.')}
        ${signatureBlock('Fraternally,', true)}
      `)}
      ${emailFooter()}
    `);

    let r = await sendEmailToResend({ to: testEmail, subject: "[TEST 1/8] Recommendation Request - Stark Scholars", html: recRequestHtml });
    results.push({ template: "Recommendation Request", success: r.success, error: r.error });

    // ---- 2. Recommendation Reminder ----
    const recReminderHtml = wrapEmail(`
      ${emailHeader()}
      ${goldDivider()}
      ${contentSection(`
        ${sectionHeading('Friendly Reminder: Recommendation Request')}
        ${bodyText('Dear Dr. Martin Luther King,')}
        ${bodyText('This is a friendly reminder that <strong>Aaron Dickason</strong> is still waiting for your letter of recommendation for the William R. Stark Financial Assistance Program.')}
      `)}
      ${ctaSection(sampleRecUrl, 'Submit Recommendation Letter', 'default')}
      ${contentSectionFull(`
        <p style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px; margin: 0 0 16px 0;">
          <strong>Deadline:</strong> This link will expire on ${sampleDate}.
        </p>
        <p style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px; margin: 0;">
          If you have any questions, please contact the scholarship committee at
          <a href="mailto:blackgoldmine@sbcglobal.net" style="color: ${GOLD};">blackgoldmine@sbcglobal.net</a>.
        </p>
      `)}
      ${contentSectionBottom(`
        ${bodyText('Thank you for your time and support.')}
        ${signatureBlock('Fraternally,')}
      `)}
      ${emailFooter()}
    `);

    await delay(1500);
    r = await sendEmailToResend({ to: testEmail, subject: "[TEST 2/8] Recommendation Reminder - Stark Scholars", html: recReminderHtml });
    results.push({ template: "Recommendation Reminder", success: r.success, error: r.error });

    // ---- 3. Recommendation Received ----
    const recReceivedHtml = wrapEmail(`
      ${emailHeader()}
      ${goldDivider()}
      ${contentSection(`
        ${sectionHeading('Recommendation Received!')}
        ${bodyText('Hello Aaron,')}
        ${bodyText('Good news! <strong>Dr. Martin Luther King</strong> has submitted their letter of recommendation for your William R. Stark Financial Assistance application.')}
      `)}
      ${contentSectionFull(infoBox('success', 'Status Update',
        'You can check the status of all your recommendations by visiting your application dashboard.'
      ))}
      ${ctaSection(`${appUrl}/apply/dashboard`, 'View Application Status', 'success')}
      ${contentSectionBottom(signatureBlock('Best regards,'))}
      ${emailFooter()}
    `);

    await delay(1500);
    r = await sendEmailToResend({ to: testEmail, subject: "[TEST 3/8] Recommendation Received - Stark Scholars", html: recReceivedHtml });
    results.push({ template: "Recommendation Received", success: r.success, error: r.error });

    // ---- 4. Welcome Email ----
    const welcomeHtml = wrapEmail(`
      ${emailHeader()}
      ${goldDivider()}
      ${contentSection(`
        ${sectionHeading('Welcome, Aaron Dickason!')}
        ${bodyText("Thank you for joining the William R. Stark Class of 2023 President's Club scholarship program. We're honored that you're considering us on your educational journey.")}
      `)}
      ${contentSectionFull(infoBox('default', 'Next Steps', `
        <table role="presentation" cellspacing="0" cellpadding="0" width="100%">
          <tr><td style="padding: 4px 0; color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px;">
            <span style="display: inline-block; width: 28px; text-align: center; font-weight: bold; color: ${GOLD};">1.</span>
            Complete your application (7 steps)
          </td></tr>
          <tr><td style="padding: 4px 0; color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px;">
            <span style="display: inline-block; width: 28px; text-align: center; font-weight: bold; color: ${GOLD};">2.</span>
            Request 2 recommendation letters
          </td></tr>
          <tr><td style="padding: 4px 0; color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px;">
            <span style="display: inline-block; width: 28px; text-align: center; font-weight: bold; color: ${GOLD};">3.</span>
            Submit before <strong>April 15, 2026</strong>
          </td></tr>
        </table>
      `))}
      ${ctaSection(`${appUrl}/apply/dashboard`, 'Start Your Application &rarr;', 'default')}
      ${contentSectionBottom(signatureBlock('Fraternally,', true))}
      ${emailFooter()}
    `);

    await delay(1500);
    r = await sendEmailToResend({ to: testEmail, subject: "[TEST 4/8] Welcome to Stark Scholars - Your Journey Begins!", html: welcomeHtml });
    results.push({ template: "Welcome", success: r.success, error: r.error });

    // ---- 5. Email Verification ----
    const verifyHtml = wrapEmail(`
      ${emailHeader()}
      ${goldDivider()}
      ${contentSection(`
        ${sectionHeading('Verify Your Email Address')}
        ${bodyText('Hello Aaron,')}
        ${bodyText('Please verify your email address to complete your registration for the William R. Stark Financial Assistance Program.')}
      `)}
      ${ctaSection(`${appUrl}/verify-email?token=sample-test-token`, 'Verify Email Address', 'default', `${appUrl}/verify-email?token=sample-test-token`)}
      ${contentSectionFull(`
        <p style="color: ${MUTED_TEXT}; font-family: ${BODY_FONT}; font-size: 14px; margin: 0;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      `)}
      ${contentSectionBottom(signatureBlock('Best regards,'))}
      ${emailFooter()}
    `);

    await delay(1500);
    r = await sendEmailToResend({ to: testEmail, subject: "[TEST 5/8] Verify Your Email - Stark Scholars", html: verifyHtml });
    results.push({ template: "Email Verification", success: r.success, error: r.error });

    // ---- 6. Password Reset ----
    const resetHtml = wrapEmail(`
      ${emailHeader()}
      ${goldDivider()}
      ${contentSection(`
        ${sectionHeading('Reset Your Password')}
        ${bodyText('Hello,')}
        ${bodyText('You requested a password reset for your Stark Scholars account. Click the button below to create a new password.')}
      `)}
      ${ctaSection(`${appUrl}/reset-password?token=sample-test-token`, 'Reset Password', 'default', `${appUrl}/reset-password?token=sample-test-token`)}
      ${contentSectionFull(`
        <p style="color: ${MUTED_TEXT}; font-family: ${BODY_FONT}; font-size: 14px; margin: 0;">
          This link will expire in 1 hour. If you didn't request this reset, you can safely ignore this email.
        </p>
      `)}
      ${contentSectionBottom(signatureBlock('Best regards,'))}
      ${emailFooter()}
    `);

    await delay(1500);
    r = await sendEmailToResend({ to: testEmail, subject: "[TEST 6/8] Reset Your Password - Stark Scholars", html: resetHtml });
    results.push({ template: "Password Reset", success: r.success, error: r.error });

    // ---- 7. Application Submitted ----
    const submittedHtml = wrapEmail(`
      ${emailHeader()}
      ${goldDivider()}
      ${contentSection(`
        ${sectionHeading('Application Submitted!')}
        ${bodyText('Hello Aaron,')}
        ${bodyText('Congratulations! Your application for the <strong>William R. Stark Financial Assistance Program</strong> has been submitted successfully.')}
      `)}
      ${contentSectionFull(infoBox('success', 'What Happens Next?', `
        <ul style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px; padding-left: 20px; margin: 0; line-height: 1.8;">
          <li>Your application will be reviewed by the scholarship committee</li>
          <li>All committee members will evaluate your application</li>
          <li>Selections will be announced by May 1, 2026</li>
          <li>You will be notified via email of the decision</li>
        </ul>
      `))}
      ${contentSectionFull(`
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
          <tr><td style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px; line-height: 1.8;">
            <strong>Application Reference:</strong> test-app-ref-12345<br>
            <strong>Submitted:</strong> ${sampleDate}
          </td></tr>
        </table>
      `)}
      ${ctaSection(`${appUrl}/apply/status`, 'View Application Status', 'success')}
      ${contentSectionBottom(signatureBlock('Best regards,'))}
      ${emailFooter()}
    `);

    await delay(1500);
    r = await sendEmailToResend({ to: testEmail, subject: "[TEST 7/8] Application Submitted - Stark Scholars", html: submittedHtml });
    results.push({ template: "Application Submitted", success: r.success, error: r.error });

    // ---- 8. Withdrawal Confirmation ----
    const withdrawHtml = wrapEmail(`
      ${emailHeader()}
      ${goldDivider()}
      ${contentSection(`
        ${sectionHeading('Application Withdrawn')}
        ${bodyText('Hello Aaron,')}
        ${bodyText('Your application for the William R. Stark Financial Assistance Program has been withdrawn as requested.')}
        ${bodyText('<strong>Reason:</strong> Changed educational plans')}
      `)}
      ${contentSectionFull(infoBox('alert', 'Reapply?',
        'If you withdrew before the deadline (April 15, 2026), you may submit a new application if you wish.'
      ))}
      ${ctaSection(`${appUrl}/apply/dashboard`, 'Start New Application', 'alert')}
      ${contentSectionFull(`
        <p style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px; margin: 0;">
          If you have any questions, please contact us at
          <a href="mailto:blackgoldmine@sbcglobal.net" style="color: ${GOLD};">blackgoldmine@sbcglobal.net</a>.
        </p>
      `)}
      ${contentSectionBottom(signatureBlock('Best regards,'))}
      ${emailFooter()}
    `);

    await delay(1500);
    r = await sendEmailToResend({ to: testEmail, subject: "[TEST 8/8] Application Withdrawn - Stark Scholars", html: withdrawHtml });
    results.push({ template: "Withdrawal Confirmation", success: r.success, error: r.error });

    console.log("[sendAllTestEmails] Results:", JSON.stringify(results, null, 2));
    return results;
  },
});

// ============================================
// SELECTION NOTIFICATION EMAILS
// ============================================

export const sendSelectionNotification = action({
  args: {
    applicationId: v.id("applications"),
    isSelected: v.boolean(),
  },
  handler: async (ctx, { applicationId, isSelected }) => {
    const application = await ctx.runQuery(api.applications.getById, {
      id: applicationId,
    });
    if (!application) throw new Error("Application not found");

    const user = await ctx.runQuery(api.users.getById, { id: application.userId });
    if (!user) throw new Error("User not found");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://starkscholars.com";

    const subject = isSelected
      ? "Congratulations! You've Been Selected - Stark Scholars"
      : "Thank You for Applying - Stark Scholars";

    const html = isSelected
      ? wrapEmail(`
          ${emailHeader()}
          ${goldDivider()}
          ${contentSection(`
            ${sectionHeading('Congratulations!')}
            ${bodyText(`Dear ${application.firstName || user.name || "Applicant"},`)}
            ${bodyText('We are delighted to inform you that you have been <strong>selected as a recipient</strong> of the William R. Stark Financial Assistance Program scholarship!')}
          `)}
          ${contentSectionFull(infoBox('success', 'Your Scholarship', `
            <p style="margin: 0;">You have been awarded a <strong>$500 scholarship</strong> in recognition of your academic excellence, community involvement, and commitment to using your education to improve your community.</p>
          `))}
          ${contentSectionFull(`
            ${bodyText('A representative from the scholarship committee will be in touch with you shortly regarding the details of your award and next steps.')}
            ${bodyText('Once again, congratulations on this wonderful achievement!')}
          `)}
          ${ctaSection(`${appUrl}/apply/dashboard`, 'View Your Dashboard', 'success')}
          ${contentSectionBottom(signatureBlock('Fraternally,', true))}
          ${emailFooter()}
        `)
      : wrapEmail(`
          ${emailHeader()}
          ${goldDivider()}
          ${contentSection(`
            ${sectionHeading('Thank You for Applying')}
            ${bodyText(`Dear ${application.firstName || user.name || "Applicant"},`)}
            ${bodyText('Thank you for your application to the William R. Stark Financial Assistance Program. After careful review by our scholarship committee, we regret to inform you that you were not selected as a recipient for this cycle.')}
          `)}
          ${contentSectionFull(`
            ${bodyText('Please know that the selection process was highly competitive, and your application demonstrated many admirable qualities. We encourage you to continue your educational pursuits and to apply again in future cycles.')}
            ${bodyText('We wish you the very best in your academic journey and future endeavors.')}
          `)}
          ${contentSectionBottom(signatureBlock('Fraternally,', true))}
          ${emailFooter()}
        `);

    const logId = await ctx.runMutation(internal.emails.createEmailLog, {
      type: isSelected ? "selection_congratulations" : "selection_not_selected",
      recipientEmail: user.email,
      subject,
      relatedId: applicationId,
      relatedType: "application",
    });

    const result = await sendEmailToResend({ to: user.email, subject, html });

    if (result.success && result.resendId) {
      await ctx.runMutation(internal.emails.updateEmailLogSuccess, {
        logId,
        resendId: result.resendId,
      });
    } else {
      await ctx.runMutation(internal.emails.updateEmailLogFailure, {
        logId,
        error: result.error || "Unknown error",
        attempts: 1,
      });
    }

    return { success: result.success };
  },
});

// ============================================
// RECOMMENDATION RETRY NOTIFICATION
// ============================================

export const sendRecommendationRetryNotification = action({

  args: {
    recommendationId: v.id("recommendations"),
    applicantName: v.string(),
  },
  handler: async (ctx, { recommendationId, applicantName }) => {
    const rec = await ctx.runQuery(api.recommendations.getById, { id: recommendationId });
    if (!rec) throw new Error("Recommendation not found");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://starkscholars.com";
    const recommendationUrl = `${appUrl}/recommend/${rec.accessToken}`;

    const subject = `Action Required: Please Resubmit Your Recommendation for ${applicantName}`;

    const html = wrapEmail(`
      ${emailHeader()}
      ${goldDivider()}
      ${contentSection(`
        ${sectionHeading('We Need Your Help')}
        ${bodyText(`Dear ${rec.recommenderName || "Recommender"},`)}
        ${bodyText(`We sincerely apologize for the inconvenience. We recently identified and resolved a technical issue on our website that was preventing recommendation letters from being uploaded successfully.`)}
        ${bodyText(`We understand you previously attempted to submit your letter of recommendation for <strong>${applicantName}</strong> and encountered difficulties. The issue has now been fully corrected, and we kindly ask that you please try again using the button below.`)}
      `)}
      ${ctaSection(recommendationUrl, 'Submit Recommendation Letter', 'default', recommendationUrl)}
      ${contentSectionFull(`
        ${infoBox('default', 'Your Original Link Still Works', `
          <p style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px; margin: 0;">
            You do not need a new link. Your original submission page is ready and waiting for your upload. Simply click the button above or use the link provided.
          </p>
        `)}
      `)}
      ${contentSectionFull(`
        <p style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px; margin: 0 0 16px 0;">
          <strong>Deadline:</strong> Please submit by ${new Date(rec.tokenExpiresAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
        </p>
        <p style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px; margin: 0 0 16px 0;">
          <strong>Accepted formats:</strong> PDF, DOC, or DOCX (up to 5MB).
        </p>
        <p style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px; margin: 0 0 16px 0;">
          If you experience any further issues, please contact the scholarship committee at
          <a href="mailto:blackgoldmine@sbcglobal.net" style="color: ${GOLD};">blackgoldmine@sbcglobal.net</a>.
        </p>
      `)}
      ${contentSectionBottom(`
        ${bodyText('We greatly appreciate your time, patience, and continued support of our scholars.')}
        ${signatureBlock('Fraternally,', true)}
      `)}
      ${emailFooter()}
    `);

    // Create email log
    const logId = await ctx.runMutation(internal.emails.createEmailLog, {
      type: "recommendation_retry_notification",
      recipientEmail: rec.recommenderEmail,
      subject,
      relatedId: recommendationId,
      relatedType: "recommendation",
    });

    // Send email
    const result = await sendEmailToResend({
      to: rec.recommenderEmail,
      subject,
      html,
    });

    // Update log with result
    if (result.success && result.resendId) {
      await ctx.runMutation(internal.emails.updateEmailLogSuccess, {
        logId,
        resendId: result.resendId,
      });
    } else {
      await ctx.runMutation(internal.emails.updateEmailLogFailure, {
        logId,
        error: result.error || "Unknown error",
        attempts: 1,
      });
      throw new Error(`Failed to send retry notification: ${result.error}`);
    }

    return { success: true, resendId: result.resendId };
  },
});

// ============================================
// BULK OUTREACH ACTIONS
// ============================================

/**
 * Sends the "issue resolved — please submit" email to ALL non-submitted recommenders.
 * Expired tokens are refreshed before sending. Safe to run once.
 */
export const sendBulkRecommenderOutreach = action({
  args: {},
  handler: async (ctx) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://starkscholars.com";
    const now = Date.now();

    const allRecs = await ctx.runQuery(internal.emails.getAllPendingRecommendations, {});

    let sent = 0;
    let failed = 0;

    for (const rec of allRecs) {
      try {
        let accessToken = rec.accessToken;

        // Refresh expired tokens before sending
        if (rec.tokenExpiresAt < now) {
          const refreshed = await ctx.runMutation(
            internal.recommendations.refreshTokenForOutreach,
            { recommendationId: rec._id }
          );
          accessToken = refreshed.newToken;
        }

        const recommendationUrl = `${appUrl}/recommend/${accessToken}`;
        const applicantName = rec.applicantName;
        const subject = `Action Required: Please Submit Your Recommendation for ${applicantName}`;

        const html = wrapEmail(`
          ${emailHeader()}
          ${goldDivider()}
          ${contentSection(`
            ${sectionHeading('We Need Your Help')}
            ${bodyText(`Dear ${rec.recommenderName || "Recommender"},`)}
            ${bodyText(`We are reaching out regarding your letter of recommendation for <strong>${applicantName}</strong> for the <strong>William R. Stark Financial Assistance Program</strong>.`)}
            ${bodyText(`We recently resolved a technical issue on our website that was preventing recommendation letters from being uploaded. If you previously attempted to submit and encountered difficulties, we sincerely apologize — the issue has been fully corrected.`)}
            ${bodyText(`Please use the button below to submit (or resubmit) your letter at your earliest convenience.`)}
          `)}
          ${ctaSection(recommendationUrl, 'Submit Recommendation Letter', 'default', recommendationUrl)}
          ${contentSectionFull(infoBox('default', 'Submission Details', `
            <p style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px; margin: 0 0 8px 0;">
              <strong>Applicant:</strong> ${applicantName}
            </p>
            <p style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px; margin: 0 0 8px 0;">
              <strong>Accepted formats:</strong> PDF, DOC, or DOCX (up to 5MB)
            </p>
            <p style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px; margin: 0;">
              If you experience any issues, contact us at
              <a href="mailto:blackgoldmine@sbcglobal.net" style="color: ${GOLD};">blackgoldmine@sbcglobal.net</a>.
            </p>
          `))}
          ${contentSectionBottom(`
            ${bodyText('We greatly appreciate your time, patience, and continued support of our scholars.')}
            ${signatureBlock('Fraternally,', true)}
          `)}
          ${emailFooter()}
        `);

        const logId = await ctx.runMutation(internal.emails.createEmailLog, {
          type: "recommendation_retry_notification",
          recipientEmail: rec.recommenderEmail,
          subject,
          relatedId: rec._id,
          relatedType: "recommendation",
        });

        const result = await sendEmailToResend({ to: rec.recommenderEmail, subject, html });

        if (result.success && result.resendId) {
          await ctx.runMutation(internal.emails.updateEmailLogSuccess, { logId, resendId: result.resendId });
          sent++;
        } else {
          await ctx.runMutation(internal.emails.updateEmailLogFailure, { logId, error: result.error || "Unknown error", attempts: 1 });
          failed++;
        }
      } catch (error) {
        console.error(`[BulkOutreach] Failed for ${rec.recommenderEmail}:`, error);
        failed++;
      }
    }

    console.log(`[BulkOutreach] Complete. Sent: ${sent}, Failed: ${failed}`);
    return { sent, failed };
  },
});

/**
 * Sends an alert to every applicant who has at least one non-submitted recommendation,
 * asking them to personally follow up with their recommenders.
 */
export const sendApplicantPendingAlert = action({
  args: {},
  handler: async (ctx) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://starkscholars.com";

    const pendingByApplicant = await ctx.runQuery(internal.emails.getPendingRecsByApplicant, {});

    let sent = 0;
    let failed = 0;

    for (const entry of pendingByApplicant) {
      try {
        const pendingNames = entry.pendingRecommenders
          .map((r: string) => `<li style="margin-bottom: 4px;">${r}</li>`)
          .join("");

        const subject = "Action Required: Recommender Follow-Up — Stark Scholars";

        const html = wrapEmail(`
          ${emailHeader()}
          ${goldDivider()}
          ${contentSection(`
            ${sectionHeading('Recommender Follow-Up Needed')}
            ${bodyText(`Dear ${entry.firstName},`)}
            ${bodyText(`We are writing to let you know that we recently resolved a technical issue on our website that was preventing recommendation letters from being uploaded. We have sent fresh submission links directly to your recommender(s) listed below.`)}
            ${bodyText(`We strongly encourage you to also reach out to them personally to ensure they received our email and are aware of the submission deadline.`)}
          `)}
          ${contentSectionFull(infoBox('alert', 'Your Pending Recommenders', `
            <ul style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px; padding-left: 20px; margin: 0; line-height: 2;">
              ${pendingNames}
            </ul>
          `))}
          ${ctaSection(`${appUrl}/apply/status`, 'View Your Application Status', 'default')}
          ${contentSectionFull(`
            <p style="color: ${BODY_TEXT}; font-family: ${BODY_FONT}; font-size: 15px; margin: 0;">
              If you have any questions, contact the scholarship committee at
              <a href="mailto:blackgoldmine@sbcglobal.net" style="color: ${GOLD};">blackgoldmine@sbcglobal.net</a>.
            </p>
          `)}
          ${contentSectionBottom(signatureBlock('Fraternally,', true))}
          ${emailFooter()}
        `);

        const logId = await ctx.runMutation(internal.emails.createEmailLog, {
          type: "recommendation_reminder",
          recipientEmail: entry.userEmail,
          subject,
          relatedId: entry.applicationId,
          relatedType: "application",
        });

        const result = await sendEmailToResend({ to: entry.userEmail, subject, html });

        if (result.success && result.resendId) {
          await ctx.runMutation(internal.emails.updateEmailLogSuccess, { logId, resendId: result.resendId });
          sent++;
        } else {
          await ctx.runMutation(internal.emails.updateEmailLogFailure, { logId, error: result.error || "Unknown error", attempts: 1 });
          failed++;
        }
      } catch (error) {
        console.error(`[ApplicantAlert] Failed for ${entry.userEmail}:`, error);
        failed++;
      }
    }

    console.log(`[ApplicantAlert] Complete. Sent: ${sent}, Failed: ${failed}`);
    return { sent, failed };
  },
});

// ============================================
// INTERNAL QUERIES FOR BULK OUTREACH
// ============================================

export const getAllPendingRecommendations = internalQuery({
  args: {},
  handler: async (ctx) => {
    const recs = await ctx.db
      .query("recommendations")
      .filter((q) => q.neq(q.field("status"), "submitted"))
      .collect();

    const results = [];
    for (const rec of recs) {
      const application = await ctx.db.get(rec.applicationId);
      if (!application) continue;
      results.push({
        _id: rec._id,
        recommenderEmail: rec.recommenderEmail,
        recommenderName: rec.recommenderName,
        accessToken: rec.accessToken,
        tokenExpiresAt: rec.tokenExpiresAt,
        applicantName: `${application.firstName} ${application.lastName}`,
      });
    }
    return results;
  },
});

export const getPendingRecsByApplicant = internalQuery({
  args: {},
  handler: async (ctx) => {
    const recs = await ctx.db
      .query("recommendations")
      .filter((q) => q.neq(q.field("status"), "submitted"))
      .collect();

    const byApp = new Map<string, typeof recs>();
    for (const rec of recs) {
      const key = rec.applicationId as string;
      if (!byApp.has(key)) byApp.set(key, []);
      byApp.get(key)!.push(rec);
    }

    const results = [];
    for (const [, appRecs] of byApp.entries()) {
      const application = await ctx.db.get(appRecs[0].applicationId);
      if (!application) continue;
      const user = await ctx.db.get(application.userId);
      if (!user) continue;
      results.push({
        applicationId: application._id as string,
        userEmail: user.email,
        firstName: application.firstName || user.name || "Applicant",
        pendingRecommenders: appRecs.map((r) => r.recommenderName || r.recommenderEmail),
      });
    }
    return results;
  },
});
