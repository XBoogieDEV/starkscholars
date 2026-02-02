"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  GraduationCap, 
  FileText, 
  UserCheck, 
  ClipboardList, 
  Shield, 
  Ban, 
  AlertTriangle, 
  Scale, 
  RefreshCw, 
  Mail,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const sections = [
  {
    id: "acceptance",
    icon: FileText,
    title: "1. Acceptance of Terms",
    content: `
      By accessing or using the Stark Scholars Platform (the "Platform"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms"). These Terms constitute a legally binding agreement between you and the William R. Stark Financial Assistance Program ("we," "us," or "our").
      
      If you do not agree to these Terms in their entirety, you must not access or use the Platform. Your continued use of the Platform following any changes to these Terms constitutes acceptance of those changes.
    `
  },
  {
    id: "eligibility",
    icon: UserCheck,
    title: "2. Eligibility",
    content: `
      To use the Platform and apply for the scholarship, you must meet the following eligibility requirements:
      
      • Be a current resident of the State of Michigan
      • Be enrolled or planning to enroll as a full-time student at an accredited college or university
      • Have maintained a cumulative GPA of 3.0 or higher
      • Be a first-time scholarship applicant (preferred)
      • Be at least 13 years of age (if under 18, parental consent is required)
      
      We reserve the right to verify your eligibility at any point during the application process. Providing false information regarding eligibility may result in immediate disqualification and account termination.
    `
  },
  {
    id: "application",
    icon: ClipboardList,
    title: "3. Application Process",
    content: `
      When submitting your application through the Platform, you agree to the following:
      
      • All information provided must be accurate, complete, and truthful to the best of your knowledge
      • Application deadlines are final. Late submissions will not be considered under any circumstances
      • All documents submitted (transcripts, essays, recommendations) must be authentic and your own work
      • You may only submit one application per scholarship cycle
      • You are responsible for ensuring all required materials are submitted before the deadline
      
      The application deadline for the 2026 scholarship cycle is April 15, 2026 at 11:59 PM EST.
    `
  },
  {
    id: "accounts",
    icon: Shield,
    title: "4. User Accounts",
    content: `
      When creating an account on the Platform, you agree to:
      
      • Create only one account per applicant
      • Provide accurate and complete registration information
      • Maintain the security of your account credentials
      • Not share your account credentials with any other person
      • Notify us immediately of any unauthorized use of your account
      
      You are solely responsible for all activities that occur under your account. We reserve the right to suspend or terminate accounts that violate these Terms or show suspicious activity.
    `
  },
  {
    id: "intellectual",
    icon: FileText,
    title: "5. Intellectual Property",
    content: `
      • Your Content: Essays and personal statements submitted as part of your application remain your intellectual property. However, by submitting them to the Platform, you grant us a limited license to use them solely for the purpose of evaluating your application.
      
      • Platform Content: All content on the Platform, including but not limited to text, graphics, logos, icons, images, and software, is the property of the William R. Stark Financial Assistance Program or its licensors and is protected by copyright and other intellectual property laws.
      
      • Limited License: We grant you a limited, non-exclusive, non-transferable license to access and use the Platform for its intended purpose—submitting scholarship applications.
    `
  },
  {
    id: "prohibited",
    icon: Ban,
    title: "6. Prohibited Activities",
    content: `
      You agree not to engage in any of the following prohibited activities:
      
      • Providing false, misleading, or fraudulent information in your application
      • Creating multiple accounts or submitting multiple applications
      • Attempting to manipulate, interfere with, or disrupt the Platform or its systems
      • Using automated scripts, bots, or other means to access the Platform
      • Attempting to access other users' accounts or unauthorized areas of the Platform
      • Uploading malicious software, viruses, or harmful code
      • Harassing, threatening, or intimidating other users, staff, or committee members
      • Using the Platform for any illegal or unauthorized purpose
      
      Violation of these prohibitions may result in immediate disqualification, account termination, and potential legal action.
    `
  },
  {
    id: "termination",
    icon: AlertTriangle,
    title: "7. Termination",
    content: `
      We reserve the right to terminate or suspend your account and access to the Platform at our sole discretion, without notice, for any reason, including but not limited to:
      
      • Violation of these Terms
      • Providing false or fraudulent information
      • Engaging in prohibited activities
      • Conduct that we determine to be harmful to other users or the Platform
      
      If you wish to withdraw your application, you may do so through your applicant dashboard or by contacting us at blackgoldmine@sbcglobal.net. Withdrawn applications will be deleted from our systems in accordance with our Privacy Policy.
    `
  },
  {
    id: "liability",
    icon: Scale,
    title: "8. Limitation of Liability",
    content: `
      The Platform is provided on an "as-is" and "as-available" basis without warranties of any kind, either express or implied.
      
      To the fullest extent permitted by law, the William R. Stark Financial Assistance Program and its affiliates, officers, directors, employees, and agents shall not be liable for:
      
      • Any technical issues, downtime, or service interruptions
      • Loss of data or inability to access your application
      • Any indirect, incidental, special, consequential, or punitive damages
      • Any damages arising from your use of or inability to use the Platform
      
      In no event shall our total liability exceed the amount of the scholarship award you may have been eligible to receive.
    `
  },
  {
    id: "changes",
    icon: RefreshCw,
    title: "9. Changes to Terms",
    content: `
      We reserve the right to modify or update these Terms at any time. Changes will be effective immediately upon posting to the Platform, with the "Last Updated" date revised accordingly.
      
      Your continued use of the Platform after any changes constitutes your acceptance of the revised Terms. We encourage you to review these Terms periodically.
      
      For significant changes that may affect your rights, we will make reasonable efforts to notify users through the email associated with their account or through a notice on the Platform.
      
      Last Updated: February 2, 2026
    `
  }
];

export default function TermsOfServicePage() {
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
              <FileText className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Terms of Service
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
                  Welcome to the Stark Scholars Platform. These Terms of Service govern your use 
                  of our scholarship application system. Please read these Terms carefully before 
                  creating an account or submitting an application. By using our Platform, you 
                  agree to these Terms.
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

          {/* Terms Sections */}
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
                        
                        if (isList) {
                          const title = lines[0].startsWith('•') ? null : lines[0];
                          const listItems = lines.filter(line => line.trim().startsWith('•'));
                          
                          return (
                            <div key={pIndex} className="mb-4">
                              {title && <p className="mb-2 font-medium text-gray-900">{title}</p>}
                              <ul className="ml-4 list-disc space-y-1 text-gray-600">
                                {listItems.map((item, i) => (
                                  <li key={i}>{item.replace('•', '').trim()}</li>
                                ))}
                              </ul>
                            </div>
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
                    10. Contact Information
                  </h2>
                </div>
                <p className="mb-4 text-gray-700">
                  If you have any questions about these Terms of Service, please contact us:
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
