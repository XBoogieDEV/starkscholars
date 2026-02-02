/**
 * Email Templates for Stark Scholars Platform
 * 
 * This file contains all HTML email templates with inline CSS for maximum
 * email client compatibility. All templates use a consistent gold/amber
 * color scheme representing the "Stark" branding.
 * 
 * Usage:
 *   import { renderTemplate } from "@/lib/email-templates";
 *   const html = renderTemplate("welcome", { name: "John", url: "..." });
 */

// ============================================
// TEMPLATE DEFINITIONS
// ============================================

const templates: Record<string, string> = {
  // ----------------------------------------
  // 1. WELCOME - Account creation welcome email
  // ----------------------------------------
  welcome: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Stark Scholars</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); padding: 40px 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">🎓</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">Stark Scholars</h1>
              <p style="color: #fef3c7; margin: 8px 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Financial Assistance Program</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px; font-weight: 600;">Welcome, {{name}}!</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                Thank you for creating an account with the <strong style="color: #b45309;">William R. Stark Financial Assistance Program</strong>. We're excited to help you on your educational journey.
              </p>
              
              <div style="background-color: #fffbeb; border-left: 4px solid #d97706; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <h3 style="color: #92400e; margin: 0 0 12px; font-size: 16px; font-weight: 600;">What's Next?</h3>
                <p style="color: #78350f; margin: 0; font-size: 15px; line-height: 1.6;">
                  Complete your application to be considered for one of two $500 scholarships awarded to Michigan students committed to improving their communities.
                </p>
              </div>
              
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{url}}" style="display: inline-block; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 2px 4px rgba(217, 119, 6, 0.3);">Start Your Application</a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0; text-align: center;">
                Or copy and paste this link:<br>
                <span style="color: #d97706; word-break: break-all;">{{url}}</span>
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 35px 0;">
              
              <p style="color: #4b5563; font-size: 14px; line-height: 1.7; margin: 0;">
                If you have any questions, our committee is here to help. Simply reply to this email or contact us at <a href="mailto:blackgoldmine@sbcglobal.net" style="color: #d97706; text-decoration: none; font-weight: 500;">blackgoldmine@sbcglobal.net</a>.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-radius: 0 0 12px 12px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px; font-style: italic;">
                Fraternally,<br>
                <strong style="color: #92400e;">GIG Kenny R. Askew 33°, Chairman</strong><br>
                William R. Stark Financial Assistance Committee
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0;">
                © {{year}} Stark Scholars Platform. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,

  // ----------------------------------------
  // 2. EMAIL VERIFICATION - Verification link
  // ----------------------------------------
  "email-verification": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - Stark Scholars</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); padding: 40px 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">✉️</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">Verify Your Email</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px; font-weight: 600;">Hello {{name}},</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                Thank you for registering with the <strong style="color: #b45309;">William R. Stark Financial Assistance Program</strong>. To complete your registration and secure your account, please verify your email address.
              </p>
              
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <p style="color: #1e40af; margin: 0; font-size: 14px; line-height: 1.6;">
                  <strong>Why verify?</strong> Email verification helps us ensure the security of your application and allows us to keep you updated on important scholarship information.
                </p>
              </div>
              
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 35px 0;">
                <tr>
                  <td align="center">
                    <a href="{{url}}" style="display: inline-block; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 2px 4px rgba(217, 119, 6, 0.3);">Verify Email Address</a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0; text-align: center;">
                Or copy and paste this link into your browser:<br>
                <span style="color: #d97706; word-break: break-all; font-size: 13px;">{{url}}</span>
              </p>
              
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <p style="color: #991b1b; margin: 0; font-size: 13px; line-height: 1.6;">
                  <strong>Link expires in 24 hours.</strong> If you didn't create an account with us, please disregard this email.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-radius: 0 0 12px 12px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 13px; margin: 0;">
                Need help? Contact us at <a href="mailto:blackgoldmine@sbcglobal.net" style="color: #d97706; text-decoration: none; font-weight: 500;">blackgoldmine@sbcglobal.net</a>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0;">
                © {{year}} Stark Scholars Platform. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,

  // ----------------------------------------
  // 3. RECOMMENDATION REQUEST - Most important template
  // ----------------------------------------
  "recommendation-request": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recommendation Request - Stark Scholars</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); padding: 40px 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">📝</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">Letter of Recommendation Request</h1>
              <p style="color: #fef3c7; margin: 8px 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">William R. Stark Financial Assistance Program</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                Dear <strong>{{recommenderName}}</strong>,
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                <strong style="color: #b45309; font-size: 18px;">{{applicantName}}</strong> has requested that you provide a letter of recommendation for their application to the <strong>William R. Stark Financial Assistance Program</strong>.
              </p>
              
              <!-- About Scholarship Box -->
              <div style="background-color: #fffbeb; border: 1px solid #fcd34d; padding: 24px; margin: 25px 0; border-radius: 10px;">
                <h3 style="color: #92400e; margin: 0 0 12px; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">📚 About the Scholarship</h3>
                <p style="color: #78350f; margin: 0; font-size: 15px; line-height: 1.7;">
                  The William R. Stark Class of 2023 President's Club awards two $500 scholarships to Michigan students committed to using their education to improve their communities.
                </p>
              </div>
              
              <!-- Applicant Info -->
              <div style="background-color: #f3f4f6; border-left: 4px solid #6b7280; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <h3 style="color: #374151; margin: 0 0 15px; font-size: 15px; font-weight: 600;">Applicant Information</h3>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px; width: 120px;">Name:</td>
                    <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 500;">{{applicantName}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Relationship:</td>
                    <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 500;">{{relationship}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">High School:</td>
                    <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 500;">{{highSchool}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">College:</td>
                    <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 500;">{{college}}</td>
                  </tr>
                </table>
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 35px 0;">
                <tr>
                  <td align="center">
                    <a href="{{url}}" style="display: inline-block; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff; text-decoration: none; padding: 18px 44px; border-radius: 8px; font-weight: 600; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 6px rgba(217, 119, 6, 0.3);">Submit Recommendation Letter</a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0 0 25px; text-align: center;">
                Or copy and paste this link:<br>
                <span style="color: #d97706; word-break: break-all;">{{url}}</span>
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <!-- What to Include -->
              <h3 style="color: #92400e; margin: 0 0 15px; font-size: 16px; font-weight: 600;">What to Include in Your Letter</h3>
              <ul style="color: #4b5563; font-size: 15px; line-height: 1.8; margin: 0 0 25px; padding-left: 25px;">
                <li style="margin-bottom: 8px;">How long and in what capacity you've known the applicant</li>
                <li style="margin-bottom: 8px;">The applicant's academic abilities and achievements</li>
                <li style="margin-bottom: 8px;">The applicant's character and personal qualities</li>
                <li style="margin-bottom: 8px;">Examples of community involvement or leadership</li>
                <li>Why you believe they deserve this scholarship</li>
              </ul>
              
              <!-- Deadline Alert -->
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 16px 20px; margin: 25px 0; border-radius: 8px;">
                <p style="color: #991b1b; margin: 0; font-size: 14px; font-weight: 500;">
                  ⏰ <strong>Important:</strong> This recommendation link expires on <strong>{{deadline}}</strong>
                </p>
              </div>
              
              <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 25px 0 0;">
                If you have any questions, please contact the scholarship committee at <a href="mailto:blackgoldmine@sbcglobal.net" style="color: #d97706; text-decoration: none; font-weight: 500;">blackgoldmine@sbcglobal.net</a>.
              </p>
              
              <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 20px 0 0;">
                Thank you for supporting {{applicantFirstName}}'s educational journey.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-radius: 0 0 12px 12px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0; font-style: italic; line-height: 1.7;">
                Fraternally,<br>
                <strong style="color: #92400e;">GIG Kenny R. Askew 33°, Chairman</strong><br>
                William R. Stark Financial Assistance Committee
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0;">
                © {{year}} Stark Scholars Platform. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,

  // ----------------------------------------
  // 4. RECOMMENDATION REMINDER - 7-day reminder
  // ----------------------------------------
  "recommendation-reminder": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reminder: Recommendation Request - Stark Scholars</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">⏰</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">Friendly Reminder</h1>
              <p style="color: #fef3c7; margin: 8px 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Recommendation Request</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                Dear <strong>{{recommenderName}}</strong>,
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                This is a friendly reminder that <strong style="color: #b45309; font-size: 17px;">{{applicantName}}</strong> is still waiting for your letter of recommendation for the <strong>William R. Stark Financial Assistance Program</strong>.
              </p>
              
              <div style="background-color: #fffbeb; border: 2px solid #fbbf24; padding: 24px; margin: 25px 0; border-radius: 10px; text-align: center;">
                <p style="color: #92400e; margin: 0 0 8px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Application From</p>
                <p style="color: #b45309; margin: 0; font-size: 22px; font-weight: 700;">{{applicantName}}</p>
              </div>
              
              <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 25px;">
                Your recommendation plays a crucial role in helping the scholarship committee evaluate this deserving student. The deadline is approaching, and we would greatly appreciate your timely submission.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{url}}" style="display: inline-block; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff; text-decoration: none; padding: 18px 44px; border-radius: 8px; font-weight: 600; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 6px rgba(217, 119, 6, 0.3);">Submit Recommendation Now</a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0 0 25px; text-align: center;">
                Or use this link:<br>
                <span style="color: #d97706; word-break: break-all;">{{url}}</span>
              </p>
              
              <!-- Deadline Alert -->
              <div style="background-color: #fef2f2; border: 2px solid #ef4444; padding: 20px; margin: 25px 0; border-radius: 8px;">
                <p style="color: #991b1b; margin: 0; font-size: 15px; font-weight: 600; text-align: center;">
                  ⚠️ Deadline: {{deadline}}
                </p>
                <p style="color: #b91c1c; margin: 8px 0 0; font-size: 13px; text-align: center;">
                  This link will expire after the deadline and cannot be extended.
                </p>
              </div>
              
              <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 25px 0 0;">
                If you are unable to provide a recommendation, please let us know as soon as possible so {{applicantFirstName}} can request an alternative reference.
              </p>
              
              <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 20px 0 0;">
                Questions? Contact us at <a href="mailto:blackgoldmine@sbcglobal.net" style="color: #d97706; text-decoration: none; font-weight: 500;">blackgoldmine@sbcglobal.net</a>
              </p>
              
              <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 20px 0 0;">
                Thank you for your time and support.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-radius: 0 0 12px 12px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0; font-style: italic; line-height: 1.7;">
                Fraternally,<br>
                <strong style="color: #92400e;">William R. Stark Financial Assistance Committee</strong>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0;">
                © {{year}} Stark Scholars Platform. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,

  // ----------------------------------------
  // 5. RECOMMENDATION RECEIVED - Notify applicant
  // ----------------------------------------
  "recommendation-received": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recommendation Received - Stark Scholars</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <div style="font-size: 56px; margin-bottom: 10px;">✓</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">Recommendation Received!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px; font-weight: 600;">Hello {{name}},</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                Great news! <strong style="color: #059669; font-size: 17px;">{{recommenderName}}</strong> has submitted their letter of recommendation for your William R. Stark Financial Assistance application.
              </p>
              
              <!-- Success Box -->
              <div style="background-color: #d1fae5; border: 1px solid #6ee7b7; padding: 24px; margin: 25px 0; border-radius: 10px; text-align: center;">
                <div style="font-size: 40px; margin-bottom: 12px;">🎉</div>
                <h3 style="color: #065f46; margin: 0 0 8px; font-size: 18px; font-weight: 600;">One Step Closer!</h3>
                <p style="color: #047857; margin: 0; font-size: 15px; line-height: 1.6;">
                  Your application now has <strong>{{recommendationCount}} of 2</strong> required recommendations.
                </p>
              </div>
              
              <!-- Status Box -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <h3 style="color: #1e40af; margin: 0 0 12px; font-size: 15px; font-weight: 600;">📋 Application Status</h3>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #059669; font-size: 14px;">✓ Recommendation from {{recommenderName}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: {{secondRecStatusColor}}; font-size: 14px;">{{secondRecStatus}} Second recommendation</td>
                  </tr>
                </table>
              </div>
              
              <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 25px 0;">
                You can check the status of all your recommendations and view your complete application by visiting your dashboard.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{url}}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">View Your Dashboard</a>
                  </td>
                </tr>
              </table>
              
              <div style="background-color: #fffbeb; border: 1px solid #fcd34d; padding: 16px 20px; margin: 25px 0; border-radius: 8px;">
                <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
                  <strong>Remember:</strong> You need 2 recommendations before you can submit your final application. Keep track of your pending requests on your dashboard.
                </p>
              </div>
              
              <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 25px 0 0;">
                Keep up the great work!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-radius: 0 0 12px 12px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0; font-style: italic; line-height: 1.7;">
                Best regards,<br>
                <strong style="color: #059669;">William R. Stark Financial Assistance Committee</strong>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0;">
                © {{year}} Stark Scholars Platform. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,

  // ----------------------------------------
  // 6. APPLICATION SUBMITTED - Confirmation email
  // ----------------------------------------
  "application-submitted": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Submitted - Stark Scholars</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 50px 40px 40px; border-radius: 12px 12px 0 0; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 15px;">🎓</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px;">Application Submitted!</h1>
              <p style="color: #d1fae5; margin: 12px 0 0; font-size: 15px; letter-spacing: 0.5px;">William R. Stark Financial Assistance Program</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px; font-weight: 600;">Congratulations, {{name}}!</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                Your application for the <strong style="color: #059669;">William R. Stark Financial Assistance Program</strong> has been successfully submitted. Thank you for taking this important step toward your educational future!
              </p>
              
              <!-- Success Box -->
              <div style="background-color: #d1fae5; border: 2px solid #34d399; padding: 28px; margin: 30px 0; border-radius: 12px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
                <h3 style="color: #065f46; margin: 0 0 10px; font-size: 20px; font-weight: 700;">Successfully Submitted</h3>
                <p style="color: #047857; margin: 0; font-size: 15px; line-height: 1.6;">
                  Your application is now in the review queue
                </p>
              </div>
              
              <!-- Reference Info -->
              <div style="background-color: #f3f4f6; padding: 20px; margin: 25px 0; border-radius: 10px;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 150px;">Reference ID:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; font-family: monospace;">{{applicationId}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Submitted:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">{{submittedDate}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Applicant:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">{{applicantName}}</td>
                  </tr>
                </table>
              </div>
              
              <!-- What Happens Next -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 24px; margin: 25px 0; border-radius: 0 10px 10px 0;">
                <h3 style="color: #1e40af; margin: 0 0 15px; font-size: 16px; font-weight: 600;">📅 What Happens Next?</h3>
                <ul style="color: #1e3a8a; font-size: 14px; line-height: 1.9; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 6px;">Your application will be reviewed by the scholarship committee</li>
                  <li style="margin-bottom: 6px;">All committee members will evaluate your application thoroughly</li>
                  <li style="margin-bottom: 6px;">Selections will be announced after the deadline (April 15, 2026)</li>
                  <li>You will be notified via email of the committee's decision</li>
                </ul>
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 35px 0;">
                <tr>
                  <td align="center">
                    <a href="{{url}}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">Track Application Status</a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 25px 0;">
                You can track the status of your application at any time by visiting your <a href="{{url}}" style="color: #059669; text-decoration: none; font-weight: 600;">application status page</a>.
              </p>
              
              <div style="background-color: #fffbeb; border: 1px solid #fcd34d; padding: 18px 20px; margin: 25px 0; border-radius: 8px;">
                <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
                  <strong>💡 Tip:</strong> Save this email for your records. Your reference ID may be needed for future correspondence.
                </p>
              </div>
              
              <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 25px 0 0;">
                We wish you the best of luck in the selection process!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-radius: 0 0 12px 12px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0; font-style: italic; line-height: 1.7;">
                Best regards,<br>
                <strong style="color: #059669;">William R. Stark Financial Assistance Committee</strong>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0;">
                Questions? Contact us at <a href="mailto:blackgoldmine@sbcglobal.net" style="color: #d97706; text-decoration: none; font-weight: 500;">blackgoldmine@sbcglobal.net</a>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0;">
                © {{year}} Stark Scholars Platform. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
};

// ============================================
// RENDER FUNCTION
// ============================================

/**
 * Renders an email template with the provided data.
 * 
 * @param template - The template name (welcome, email-verification, recommendation-request, etc.)
 * @param data - Object containing template variables (e.g., { name: "John", url: "..." })
 * @returns The rendered HTML string with all variables replaced
 * 
 * @example
 * ```typescript
 * const html = renderTemplate("welcome", {
 *   name: "John Doe",
 *   url: "https://starkscholars.com/apply",
 *   year: "2025"
 * });
 * ```
 */
export function renderTemplate(template: string, data: Record<string, any>): string {
  const templateHtml = templates[template];
  
  if (!templateHtml) {
    throw new Error(`Template "${template}" not found. Available templates: ${Object.keys(templates).join(", ")}`);
  }
  
  let rendered = templateHtml;
  
  // Replace all template variables like {{variableName}}
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    rendered = rendered.replace(regex, String(value ?? ""));
  }
  
  // Auto-populate year if not provided
  if (!data.year) {
    rendered = rendered.replace(/\{\{year\}\}/g, new Date().getFullYear().toString());
  }
  
  return rendered;
}

// ============================================
// TEMPLATE LIST EXPORT
// ============================================

/**
 * List of all available email template names.
 */
export const availableTemplates = Object.keys(templates);

/**
 * Get template metadata for documentation or UI purposes.
 */
export function getTemplateInfo(template: string): { name: string; description: string; requiredVars: string[] } | null {
  const info: Record<string, { description: string; requiredVars: string[] }> = {
    welcome: {
      description: "Sent to users after account creation",
      requiredVars: ["name", "url"],
    },
    "email-verification": {
      description: "Sent to verify user's email address",
      requiredVars: ["name", "url"],
    },
    "recommendation-request": {
      description: "Sent to recommenders to request a letter of recommendation",
      requiredVars: ["recommenderName", "applicantName", "applicantFirstName", "relationship", "highSchool", "college", "url", "deadline"],
    },
    "recommendation-reminder": {
      description: "7-day reminder sent to recommenders who haven't submitted",
      requiredVars: ["recommenderName", "applicantName", "applicantFirstName", "url", "deadline"],
    },
    "recommendation-received": {
      description: "Sent to applicant when a recommendation is submitted",
      requiredVars: ["name", "recommenderName", "recommendationCount", "secondRecStatus", "secondRecStatusColor", "url"],
    },
    "application-submitted": {
      description: "Confirmation sent after application submission",
      requiredVars: ["name", "applicationId", "submittedDate", "applicantName", "url"],
    },
  };
  
  const templateInfo = info[template];
  if (!templateInfo) return null;
  
  return {
    name: template,
    ...templateInfo,
  };
}

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  renderTemplate,
  availableTemplates,
  getTemplateInfo,
};
