"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  GraduationCap, 
  Database, 
  Target, 
  Share2, 
  Lock, 
  UserCircle, 
  Cookie,
  Clock,
  Users,
  RefreshCw,
  Mail,
  ArrowLeft,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const sections = [
  {
    id: "collection",
    icon: Database,
    title: "1. Information We Collect",
    content: `
      We collect the following types of information through the Platform:
      
      Personal Information
      • Full name and contact details (email address, phone number, mailing address)
      • Date of birth
      • Demographic information (optional)
      
      Academic Information
      • School name and address
      • Current GPA and academic standing
      • Test scores (if provided)
      • Academic transcripts
      
      Application Materials
      • Essays and personal statements
      • Uploaded documents (transcripts, photos)
      • Recommendation letters submitted on your behalf
      
      Recommender Information
      • Names and contact information of your recommenders
      • Their professional affiliations
      
      Technical Information
      • IP address and browser information
      • Device information
      • Usage data and analytics
    `
  },
  {
    id: "usage",
    icon: Target,
    title: "2. How We Use Information",
    content: `
      We use the information we collect for the following purposes:
      
      Scholarship Evaluation
      • To evaluate your scholarship application
      • To assess eligibility based on stated criteria
      • To compare applications during the selection process
      
      Communication
      • To send application confirmations and updates
      • To notify you of important deadlines
      • To inform you of selection decisions
      • To respond to your inquiries
      
      Platform Operations
      • To maintain and improve the Platform
      • To generate anonymous analytics about application trends
      • To troubleshoot technical issues
      • To ensure platform security
      
      Legal Compliance
      • To comply with applicable laws and regulations
      • To maintain records for tax and audit purposes
      • To protect our legal rights
    `
  },
  {
    id: "sharing",
    icon: Share2,
    title: "3. Information Sharing",
    content: `
      We respect your privacy and limit sharing of your personal information:
      
      Within Our Organization
      • Selection committee members who evaluate applications
      • Program administrators who manage the scholarship
      
      Service Providers
      We work with trusted third-party service providers who assist us in operating the Platform:
      • Convex (database and file storage)
      • Resend (email delivery)
      • Vercel (hosting and deployment)
      
      These providers only access information necessary to perform their services and are bound by confidentiality obligations.
      
      Legal Requirements
      We may disclose information if required to do so by law or in response to valid requests by public authorities.
      
      What We Don't Do
      • We do not sell your personal information to third parties
      • We do not share your information for marketing purposes
      • We do not share your essay content outside the evaluation process
    `
  },
  {
    id: "security",
    icon: Lock,
    title: "4. Data Storage & Security",
    content: `
      We take the security of your information seriously:
      
      Storage Infrastructure
      • All data is stored securely on Convex, a SOC 2 Type II compliant cloud database
      • Files are stored in Convex Storage with enterprise-grade security
      • Data is backed up regularly to prevent loss
      
      Security Measures
      • Encryption in transit using TLS/SSL
      • Encryption at rest for stored data
      • Access controls limiting data access to authorized personnel only
      • Regular security audits and monitoring
      
      Access Limitations
      • Only authorized committee members and administrators can access application data
      • Each user account is protected by authentication
      • Administrative access is logged and monitored
      
      While we implement robust security measures, no internet-based system is 100% secure. We continuously work to protect your information but cannot guarantee absolute security.
    `
  },
  {
    id: "rights",
    icon: UserCircle,
    title: "5. Your Rights",
    content: `
      You have the following rights regarding your personal information:
      
      Access and Review
      • You can view your submitted application data through your dashboard
      • You can download copies of documents you've uploaded
      
      Correction
      • You may request corrections to inaccurate information before the application deadline
      • After submission, contact us to discuss corrections needed
      
      Withdrawal
      • You may withdraw your application at any time before the selection announcement
      • Withdrawal will result in deletion of your application data (see Data Retention)
      
      Deletion
      • You may request deletion of your account and data
      • Note that winners' data must be retained for 7 years for tax purposes
      • Data deletion requests must be submitted before the selection announcement to avoid retention requirements
      
      To exercise these rights, contact us at blackgoldmine@sbcglobal.net.
    `
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "6. Cookies & Tracking",
    content: `
      Our Platform uses cookies and similar technologies:
      
      Essential Cookies
      • Session cookies to maintain your login state
      • Security cookies to protect against unauthorized access
      • Preference cookies to remember your settings
      
      Analytics
      • We may use analytics cookies to understand how users interact with the Platform
      • This helps us improve the user experience
      • Analytics data is aggregated and anonymized
      
      What We Don't Use
      • No third-party advertising cookies
      • No tracking for targeted advertising
      • No cross-site tracking pixels
      
      Managing Cookies
      You can control cookies through your browser settings. However, disabling essential cookies may affect the functionality of the Platform.
    `
  },
  {
    id: "retention",
    icon: Clock,
    title: "7. Data Retention",
    content: `
      We retain your information for the following periods:
      
      Application Data (Non-Winners)
      • Applications are kept for 1 year after the selection announcement
      • After 1 year, all application data is permanently deleted
      
      Winners' Data
      • Winners' information is retained for 7 years
      • This retention is required for tax reporting and audit purposes
      • After 7 years, this data is also permanently deleted
      
      Account Information
      • Active accounts remain until deletion is requested
      • Deleted accounts are processed according to the above timelines
      
      Anonymized Data
      • We may retain anonymized statistical data indefinitely
      • This data cannot be linked back to individual applicants
      
      Early Deletion Requests
      Contact us at blackgoldmine@sbcglobal.net to request early deletion of your data, keeping in mind the retention requirements for winners.
    `
  },
  {
    id: "children",
    icon: Users,
    title: "8. Children's Privacy",
    content: `
      The Stark Scholars Platform is designed for high school seniors and college students:
      
      Age Requirements
      • Applicants must be at least 13 years of age
      • Most applicants are 17-22 years old
      
      Under 13
      • We do not knowingly collect information from children under 13
      • If we discover we have collected information from a child under 13 without parental consent, we will delete it immediately
      
      Under 18
      • Applicants under 18 should have parental or guardian consent
      • We recommend parents review this Privacy Policy with their children
      
      If you believe we may have collected information from a child under 13 without appropriate consent, please contact us immediately at blackgoldmine@sbcglobal.net.
    `
  },
  {
    id: "changes",
    icon: RefreshCw,
    title: "9. Changes to Privacy Policy",
    content: `
      We may update this Privacy Policy from time to time:
      
      Notification of Changes
      • We will post the updated Privacy Policy on this page
      • The "Last Updated" date will be revised
      • Significant changes may be notified via email to registered users
      
      Continued Use
      • Your continued use of the Platform after changes constitutes acceptance
      • We encourage you to review this policy periodically
      
      Material Changes
      If we make material changes to how we handle your personal information, we will provide notice through the Platform or email at least 30 days before the changes take effect.
      
      Last Updated: February 2, 2026
    `
  }
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-base sm:text-lg font-semibold text-gray-900 truncate">
              Stark Scholars
            </span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-amber-100 p-3">
              <Shield className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-2 text-gray-600">
              William R. Stark Financial Assistance Program
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Last Updated: February 2, 2026
            </p>
          </motion.div>

          {/* Introduction Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="mb-8 border-amber-200 bg-amber-50/50">
              <CardContent className="p-6">
                <p className="text-gray-700">
                  The William R. Stark Financial Assistance Program ("we," "us," or "our") 
                  is committed to protecting your privacy. This Privacy Policy explains how 
                  we collect, use, disclose, and safeguard your information when you use the 
                  Stark Scholars Platform. Please read this policy carefully. By using the 
                  Platform, you consent to the practices described in this policy.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Table of Contents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Table of Contents</h2>
                <nav className="grid gap-2 sm:grid-cols-2">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-amber-50 hover:text-amber-700"
                    >
                      <section.icon className="h-4 w-4" />
                      {section.title}
                    </a>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </motion.div>

          <Separator className="my-8" />

          {/* Privacy Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.section
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * (index + 3) }}
              >
                <Card className="border-gray-200">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                        <section.icon className="h-5 w-5 text-amber-600" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {section.title}
                      </h2>
                    </div>
                    <div className="prose prose-gray max-w-none">
                      {section.content.split('\n\n').map((paragraph, pIndex) => {
                        const lines = paragraph.trim().split('\n');
                        const isList = lines.some(line => line.trim().startsWith('•'));
                        const hasSubheading = lines.length > 0 && !lines[0].trim().startsWith('•') && lines.slice(1).some(l => l.trim().startsWith('•'));
                        
                        if (hasSubheading) {
                          const subheading = lines[0];
                          const listItems = lines.filter(line => line.trim().startsWith('•'));
                          
                          return (
                            <div key={pIndex} className="mb-4">
                              <p className="mb-2 font-medium text-gray-900">{subheading}</p>
                              <ul className="ml-4 list-disc space-y-1 text-gray-600">
                                {listItems.map((item, i) => (
                                  <li key={i}>{item.replace('•', '').trim()}</li>
                                ))}
                              </ul>
                            </div>
                          );
                        }
                        
                        if (isList) {
                          return (
                            <ul key={pIndex} className="mb-4 ml-4 list-disc space-y-1 text-gray-600">
                              {lines.filter(l => l.trim().startsWith('•')).map((item, i) => (
                                <li key={i}>{item.replace('•', '').trim()}</li>
                              ))}
                            </ul>
                          );
                        }
                        
                        return (
                          <p key={pIndex} className="mb-4 whitespace-pre-line text-gray-600 last:mb-0">
                            {paragraph.trim()}
                          </p>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            ))}
          </div>

          <Separator className="my-8" />

          {/* Contact Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    10. Contact Us
                  </h2>
                </div>
                <p className="mb-4 text-gray-700">
                  If you have any questions about this Privacy Policy, our data practices, 
                  or would like to exercise your privacy rights, please contact us:
                </p>
                <div className="rounded-lg bg-white p-4">
                  <p className="text-gray-900 font-medium">William R. Stark Financial Assistance Program</p>
                  <p className="text-gray-600">Email: <a href="mailto:blackgoldmine@sbcglobal.net" className="text-amber-600 hover:underline">blackgoldmine@sbcglobal.net</a></p>
                  <p className="text-gray-600">Platform: Stark Scholars</p>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Back to Top */}
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="border-amber-200 hover:bg-amber-50"
            >
              Back to Top
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                Stark Scholars
              </span>
            </div>
            <div className="flex gap-4">
              <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                Privacy Policy
              </Link>
            </div>
          </div>
          <div className="mt-6 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Stark Scholars Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
