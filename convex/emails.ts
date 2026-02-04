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
  console.log(`[sendEmail] Attempting to send email to: ${to}`);
  console.log(`[sendEmail] Subject: ${subject}`);
  console.log(`[sendEmail] From: ${FROM_EMAIL}`);
  console.log(`[sendEmail] API Key exists: ${!!RESEND_API_KEY}`);

  if (!RESEND_API_KEY) {
    console.error("[sendEmail] RESEND_API_KEY is not set!");
    throw new Error("RESEND_API_KEY is not configured");
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
      throw new Error(`Failed to send email: ${responseText}`);
    }

    const result = JSON.parse(responseText);
    console.log(`[sendEmail] Email sent successfully! ID: ${result.id}`);
    return result;
  } catch (error) {
    console.error(`[sendEmail] Error sending email:`, error);
    throw error;
  }
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
      subject: `Recommendation Request for ${application.firstName} ${application.lastName} - Stark Scholars`,
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
      subject: "Recommendation Received - Stark Scholars",
      html,
    });

    return { success: true };
  },
});

// Import api for internal use
import { api } from "./_generated/api";

// ============================================
// USER ACCOUNT EMAILS
// ============================================

export const sendWelcomeEmail = action({
  args: { userId: v.id("user") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.runQuery(api.users.getById, { id: userId });
    if (!user) throw new Error("User not found");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://starkscholars.com";

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Georgia', 'Times New Roman', serif; background-color: #f8f5f0; line-height: 1.6;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8f5f0;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <!-- Header Banner -->
                <tr>
                  <td style="background: linear-gradient(135deg, #92400e 0%, #b45309 50%, #d97706 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 8px 0; font-weight: normal; letter-spacing: 1px;">
                      ★ STARK SCHOLARS ★
                    </h1>
                    <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">
                      William R. Stark Financial Assistance Program
                    </p>
                  </td>
                </tr>
                
                <!-- Welcome Message -->
                <tr>
                  <td style="padding: 40px 40px 20px 40px;">
                    <h2 style="color: #92400e; font-size: 24px; margin: 0 0 20px 0; font-weight: normal;">
                      Welcome, ${user.name || "Future Scholar"}!
                    </h2>
                    <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                      Thank you for joining the William R. Stark Class of 2023 President's Club scholarship program. 
                      We're honored that you're considering us on your educational journey.
                    </p>
                  </td>
                </tr>
                
                <!-- Next Steps Box -->
                <tr>
                  <td style="padding: 0 40px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #d97706;">
                      <tr>
                        <td style="padding: 24px;">
                          <h3 style="color: #92400e; font-size: 18px; margin: 0 0 16px 0; font-weight: bold;">
                            📋 Next Steps
                          </h3>
                          <table role="presentation" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="padding: 4px 0; color: #78350f;">
                                <span style="display: inline-block; width: 24px; text-align: center; font-weight: bold;">1.</span>
                                Complete your application (7 steps)
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 4px 0; color: #78350f;">
                                <span style="display: inline-block; width: 24px; text-align: center; font-weight: bold;">2.</span>
                                Request 2 recommendation letters
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 4px 0; color: #78350f;">
                                <span style="display: inline-block; width: 24px; text-align: center; font-weight: bold;">3.</span>
                                Submit before <strong>April 15, 2026</strong>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- CTA Button -->
                <tr>
                  <td align="center" style="padding: 40px;">
                    <a href="${appUrl}/apply/dashboard" 
                       style="display: inline-block; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);">
                      Start Your Application →
                    </a>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #1f2937; padding: 30px 40px; text-align: center;">
                    <p style="color: #d1d5db; font-size: 14px; margin: 0 0 12px 0;">
                      Questions? Contact us at 
                      <a href="mailto:blackgoldmine@sbcglobal.net" style="color: #fcd34d; text-decoration: none;">
                        blackgoldmine@sbcglobal.net
                      </a>
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                      © 2026 William R. Stark Financial Assistance Committee<br>
                      <em>Fraternally, GIG Kenny R. Askew 33°, Chairman</em>
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: "Welcome to Stark Scholars - Your Journey Begins!",
      html,
    });

    return { success: true };
  }
});

export const sendEmailVerification = action({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    url: v.string() // Verification URL from Better Auth
  },
  handler: async (ctx, { email, name, url }) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d97706;">Verify Your Email Address</h2>
        
        <p>Hello ${name || "Scholar"},</p>
        
        <p>
          Please verify your email address to complete your registration for the 
          William R. Stark Financial Assistance Program.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a 
            href="${url}" 
            style="background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;"
          >
            Verify Email Address
          </a>
        </div>
        
        <p style="font-size: 12px; color: #666;">
          Or copy and paste this link: ${url}
        </p>
        
        <p>
          If you didn't create an account, you can safely ignore this email.
        </p>
        
        <p>
          <em>Best regards,</em><br>
          <strong>William R. Stark Financial Assistance Committee</strong>
        </p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: "Verify Your Email - Stark Scholars",
      html,
    });

    return { success: true };
  }
});

export const sendPasswordResetEmail = action({
  args: {
    email: v.string(),
    url: v.string()  // Reset URL from Better Auth
  },
  handler: async (ctx, { email, url }) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d97706;">Reset Your Password</h2>
        
        <p>Hello,</p>
        
        <p>
          You requested a password reset for your Stark Scholars account.
          Click the button below to create a new password.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a 
            href="${url}" 
            style="background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;"
          >
            Reset Password
          </a>
        </div>
        
        <p style="font-size: 12px; color: #666;">
          Or copy and paste this link: ${url}
        </p>
        
        <p>
          This link will expire in 1 hour. If you didn't request this reset, 
          you can safely ignore this email.
        </p>
        
        <p>
          <em>Best regards,</em><br>
          <strong>Stark Scholars Platform</strong>
        </p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: "Reset Your Password - Stark Scholars",
      html
    });

    return { success: true };
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

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #15803d;">Application Submitted!</h2>
        
        <p>Hello ${application.firstName || user.name || "Applicant"},</p>
        
        <p>
          Congratulations! Your application for the <strong>William R. Stark Financial Assistance Program</strong>
          has been submitted successfully.
        </p>
        
        <div style="background: #dcfce7; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #166534;">What Happens Next?</h3>
          <ul style="margin-bottom: 0; padding-left: 20px;">
            <li>Your application will be reviewed by the scholarship committee</li>
            <li>All committee members will evaluate your application</li>
            <li>Selections will be announced after the deadline (April 15, 2026)</li>
            <li>You will be notified via email of the decision</li>
          </ul>
        </div>
        
        <p>
          <strong>Application Reference:</strong> ${application._id}<br>
          <strong>Submitted:</strong> ${new Date().toLocaleDateString()}
        </p>
        
        <p>
          You can track the status of your application at any time by visiting your
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/apply/status">application status page</a>.
        </p>
        
        <p>
          <em>Best regards,</em><br>
          <strong>William R. Stark Financial Assistance Committee</strong>
        </p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: "Application Submitted - Stark Scholars",
      html,
    });

    return { success: true };
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

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Application Withdrawn</h2>
        
        <p>Hello ${application.firstName || user.name || "Applicant"},</p>
        
        <p>
          Your application for the William R. Stark Financial Assistance Program 
          has been withdrawn as requested.
        </p>
        
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
        
        <div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;">
            If you withdrew before the deadline (April 15, 2026), you may submit 
            a new application if you wish.
          </p>
        </div>
        
        <p>
          If you have any questions, please contact us at 
          <a href="mailto:blackgoldmine@sbcglobal.net">blackgoldmine@sbcglobal.net</a>.
        </p>
        
        <p>
          <em>Best regards,</em><br>
          <strong>William R. Stark Financial Assistance Committee</strong>
        </p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: "Application Withdrawn - Stark Scholars",
      html,
    });

    return { success: true };
  },
});
