import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = "noreply@starkscholars.com";

// ============================================
// EMAIL SENDING HELPERS
// ============================================

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
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

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return await response.json();
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

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #b45309;">Recommendation Request</h2>
        
        <p>Dear ${rec.recommenderName || "Recommender"},</p>
        
        <p>
          <strong>${application.firstName} ${application.lastName}</strong> has requested that you 
          provide a letter of recommendation for the <strong>William R. Stark Financial Assistance Program</strong>.
        </p>
        
        <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #92400e;">About the Scholarship</h3>
          <p style="margin-bottom: 0;">
            The William R. Stark Class of 2023 President&apos;s Club awards two $500 
            scholarships to Michigan students committed to using their education 
            to improve their communities.
          </p>
        </div>
        
        <p>
          <strong>Relationship:</strong> ${rec.relationship || "Not specified"}<br>
          <strong>Applicant:</strong> ${application.firstName} ${application.lastName}<br>
          <strong>High School:</strong> ${application.highSchoolName || "Not provided"}<br>
          <strong>College:</strong> ${application.collegeName || "Not provided"}
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a 
            href="${recommendationUrl}" 
            style="background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;"
          >
            Submit Recommendation Letter
          </a>
        </div>
        
        <p style="font-size: 12px; color: #666;">
          Or copy and paste this link: ${recommendationUrl}
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <h3 style="color: #92400e;">What to Include</h3>
        <ul>
          <li>How long and in what capacity you&apos;ve known the applicant</li>
          <li>The applicant&apos;s academic abilities and achievements</li>
          <li>The applicant&apos;s character and personal qualities</li>
          <li>Examples of community involvement or leadership</li>
          <li>Why you believe they deserve this scholarship</li>
        </ul>
        
        <p>
          <strong>Deadline:</strong> This link will expire on ${new Date(rec.tokenExpiresAt).toLocaleDateString()}.
        </p>
        
        <p>
          If you have any questions, please contact the scholarship committee at 
          <a href="mailto:blackgoldmine@sbcglobal.net">blackgoldmine@sbcglobal.net</a>.
        </p>
        
        <p>
          Thank you for supporting ${application.firstName}&apos;s educational journey.<br>
          <em>Fraternally,</em><br>
          <strong>GIG Kenny R. Askew 33°, Chairman</strong><br>
          William R. Stark Financial Assistance Committee
        </p>
      </div>
    `;

    await sendEmail({
      to: rec.recommenderEmail,
      subject: `Recommendation Request for ${application.firstName} ${application.lastName} - William R. Stark Scholarship`,
      html,
    });

    return { success: true };
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

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #b45309;">Friendly Reminder: Recommendation Request</h2>
        
        <p>Dear ${rec.recommenderName || "Recommender"},</p>
        
        <p>
          This is a friendly reminder that <strong>${application.firstName} ${application.lastName}</strong> 
          is still waiting for your letter of recommendation for the William R. Stark Financial Assistance Program.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a 
            href="${recommendationUrl}" 
            style="background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;"
          >
            Submit Recommendation Letter
          </a>
        </div>
        
        <p>
          <strong>Deadline:</strong> This link will expire on ${new Date(rec.tokenExpiresAt).toLocaleDateString()}.
        </p>
        
        <p>
          If you have any questions, please contact the scholarship committee at 
          <a href="mailto:blackgoldmine@sbcglobal.net">blackgoldmine@sbcglobal.net</a>.
        </p>
        
        <p>
          Thank you for your time and support.<br>
          <em>Fraternally,</em><br>
          <strong>William R. Stark Financial Assistance Committee</strong>
        </p>
      </div>
    `;

    await sendEmail({
      to: rec.recommenderEmail,
      subject: `Reminder: Recommendation Request for ${application.firstName} ${application.lastName}`,
      html,
    });

    return { success: true };
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

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #15803d;">Recommendation Received!</h2>
        
        <p>Hello ${application.firstName || user.name || "Applicant"},</p>
        
        <p>
          Good news! <strong>${recommenderName}</strong> has submitted their letter of recommendation 
          for your William R. Stark Financial Assistance application.
        </p>
        
        <div style="background: #dcfce7; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;">
            You can check the status of all your recommendations by visiting your 
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/apply/dashboard">application dashboard</a>.
          </p>
        </div>
        
        <p>
          Remember, you need 2 recommendations before you can submit your application.
        </p>
        
        <p>
          <em>Best regards,</em><br>
          <strong>William R. Stark Financial Assistance Committee</strong>
        </p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: "Recommendation Received - William R. Stark Scholarship",
      html,
    });

    return { success: true };
  },
});

// Import api for internal use
import { api } from "./_generated/api";
