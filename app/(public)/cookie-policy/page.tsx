"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  GraduationCap, 
  Cookie, 
  Shield, 
  Settings, 
  ExternalLink,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const cookieTypes = [
  {
    id: "essential",
    icon: Shield,
    title: "Essential Cookies",
    required: true,
    description: "These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and account access. You cannot disable these cookies.",
    examples: [
      "Session cookies to maintain your login state",
      "Security cookies to protect against CSRF attacks",
      "Load balancing cookies for server performance"
    ]
  },
  {
    id: "functional",
    icon: Settings,
    title: "Functional Cookies",
    required: false,
    description: "These cookies enable enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.",
    examples: [
      "Remembering your preferences and settings",
      "Storing form data temporarily",
      "Language preference cookies"
    ]
  },
  {
    id: "analytics",
    icon: Clock,
    title: "Analytics Cookies",
    required: false,
    description: "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our platform.",
    examples: [
      "Page view tracking",
      "User journey analysis",
      "Performance monitoring"
    ]
  }
];

const thirdPartyServices = [
  {
    name: "Convex",
    purpose: "Database and file storage",
    privacyUrl: "https://www.convex.dev/privacy"
  },
  {
    name: "Vercel",
    purpose: "Hosting and deployment",
    privacyUrl: "https://vercel.com/legal/privacy-policy"
  },
  {
    name: "Resend",
    purpose: "Email delivery",
    privacyUrl: "https://resend.com/legal/privacy-policy"
  }
];

export default function CookiePolicyPage() {
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
              <Cookie className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Cookie Policy
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
                  This Cookie Policy explains how the Stark Scholars Platform uses cookies and similar 
                  technologies to recognize you when you visit our website. It explains what these 
                  technologies are and why we use them, as well as your rights to control our use of them.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* What Are Cookies Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">
                  What Are Cookies?
                </h2>
                <p className="text-gray-600 mb-4">
                  Cookies are small data files that are placed on your computer or mobile device when 
                  you visit a website. Cookies are widely used by website owners to make their websites 
                  work more efficiently, as well as to provide reporting information.
                </p>
                <p className="text-gray-600">
                  Cookies set by the website owner (in this case, Stark Scholars) are called &quot;first-party 
                  cookies.&quot; Cookies set by parties other than the website owner are called &quot;third-party 
                  cookies.&quot; Third-party cookies enable third-party features or functionality to be 
                  provided on or through the website.
                </p>
              </CardContent>
            </Card>
          </motion.section>

          <Separator className="my-8" />

          {/* Types of Cookies Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              Types of Cookies We Use
            </h2>
          </motion.div>

          <div className="space-y-6">
            {cookieTypes.map((cookie, index) => (
              <motion.section
                key={cookie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * (index + 4) }}
              >
                <Card className="border-gray-200">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                        <cookie.icon className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {cookie.title}
                        </h3>
                      </div>
                      {cookie.required ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          <CheckCircle2 className="h-3 w-3" />
                          Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          Optional
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">{cookie.description}</p>
                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-sm font-medium text-gray-900 mb-2">Examples:</p>
                      <ul className="space-y-1">
                        {cookie.examples.map((example, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-amber-600 mt-1">•</span>
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            ))}
          </div>

          <Separator className="my-8" />

          {/* How to Manage Cookies Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mb-8"
          >
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                    <Settings className="h-5 w-5 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    How to Manage Cookies
                  </h2>
                </div>
                <div className="space-y-4 text-gray-600">
                  <p>
                    You have the right to decide whether to accept or reject cookies. You can exercise 
                    your cookie preferences by clicking on the appropriate opt-out links provided in 
                    the cookie banner or by adjusting your browser settings.
                  </p>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="font-medium text-gray-900 mb-2">Browser Settings:</p>
                    <p className="text-sm mb-3">
                      Most web browsers allow you to control cookies through their settings preferences. 
                      Here are links to instructions for popular browsers:
                    </p>
                    <ul className="space-y-1 text-sm">
                      <li>
                        <a 
                          href="https://support.google.com/chrome/answer/95647" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-amber-600 hover:text-amber-700 hover:underline"
                        >
                          Google Chrome
                        </a>
                      </li>
                      <li>
                        <a 
                          href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-amber-600 hover:text-amber-700 hover:underline"
                        >
                          Mozilla Firefox
                        </a>
                      </li>
                      <li>
                        <a 
                          href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-amber-600 hover:text-amber-700 hover:underline"
                        >
                          Safari
                        </a>
                      </li>
                      <li>
                        <a 
                          href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-amber-600 hover:text-amber-700 hover:underline"
                        >
                          Microsoft Edge
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4 border border-amber-200">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      <strong>Note:</strong> If you choose to reject cookies, you may still use our 
                      website, but your access to some functionality and areas may be restricted. 
                      Essential cookies cannot be disabled as they are necessary for the website 
                      to function.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Third-Party Cookies Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mb-8"
          >
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                    <ExternalLink className="h-5 w-5 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Third-Party Cookies
                  </h2>
                </div>
                <p className="text-gray-600 mb-4">
                  We use services from third-party providers that may set cookies on your device. 
                  These providers have their own privacy and cookie policies:
                </p>
                <div className="space-y-3">
                  {thirdPartyServices.map((service) => (
                    <div 
                      key={service.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{service.name}</p>
                        <p className="text-sm text-gray-600">{service.purpose}</p>
                      </div>
                      <a
                        href={service.privacyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-1"
                      >
                        Privacy Policy
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.section>

          <Separator className="my-8" />

          {/* Cookie Duration Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="mb-8"
          >
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">
                  How Long Do Cookies Last?
                </h2>
                <div className="space-y-3 text-gray-700">
                  <p>
                    <strong>Session Cookies:</strong> These cookies are temporary and expire once you 
                    close your browser. They are used to maintain your session state while using our platform.
                  </p>
                  <p>
                    <strong>Persistent Cookies:</strong> These cookies remain on your device for a set 
                    period or until you manually delete them. We use persistent cookies to remember your 
                    preferences and settings for future visits.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Contact Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Contact Us
                  </h2>
                </div>
                <p className="mb-4 text-gray-700">
                  If you have any questions about our use of cookies or other technologies, please 
                  contact us:
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
              <Link href="/cookie-policy" className="text-sm text-gray-600 hover:text-gray-900">
                Cookie Policy
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
