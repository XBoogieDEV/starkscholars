"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  GraduationCap,
  MapPin,
  Award,
  Clock,
  FileText,
  Users,
  CheckCircle2,
  ChevronDown,
  Mail,
  ArrowRight,
  Sparkles,
  BookOpen,
  Calendar,
  UserCheck,
  Menu,
} from "lucide-react";
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  heroTextContainer,
  heroTextItem,
  statsContainer,
  statsItem,
  cardHover,
} from "@/lib/motion";
import { useState } from "react";

// Mobile navigation component for landing page
function MobileLandingNav({
  scrollToSection,
}: {
  scrollToSection: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const handleNavClick = (id: string) => {
    scrollToSection(id);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-11 w-11 touch-manipulation"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="flex flex-col gap-4 mt-8">
          <button
            onClick={() => handleNavClick("about")}
            className="text-left text-lg font-medium text-gray-700 hover:text-amber-600 py-2 min-h-[44px]"
          >
            About
          </button>
          <button
            onClick={() => handleNavClick("eligibility")}
            className="text-left text-lg font-medium text-gray-700 hover:text-amber-600 py-2 min-h-[44px]"
          >
            Eligibility
          </button>
          <button
            onClick={() => handleNavClick("process")}
            className="text-left text-lg font-medium text-gray-700 hover:text-amber-600 py-2 min-h-[44px]"
          >
            How to Apply
          </button>
          <button
            onClick={() => handleNavClick("faq")}
            className="text-left text-lg font-medium text-gray-700 hover:text-amber-600 py-2 min-h-[44px]"
          >
            FAQ
          </button>
          <hr className="my-2" />
          <Link
            href="/login"
            className="text-lg font-medium text-gray-700 hover:text-amber-600 py-2 min-h-[44px]"
            onClick={() => setOpen(false)}
          >
            Sign In
          </Link>
          <Button
            asChild
            className="bg-amber-600 hover:bg-amber-700 text-white w-full h-12"
          >
            <Link href="/register" onClick={() => setOpen(false)}>
              Apply Now
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function LandingPage() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const shouldReduceMotion = useReducedMotion();

  // Feature cards data
  const features = [
    {
      icon: BookOpen,
      title: "Our Mission",
      content:
        "The William R. Stark Financial Assistance Program was established by the Class of 2023 President's Club to honor the legacy of William R. Stark and support Michigan students pursuing higher education.",
    },
    {
      icon: Award,
      title: "What We Look For",
      content:
        "We seek students who demonstrate academic dedication, community involvement, and a clear vision for how their education will benefit others.",
    },
  ];

  // Eligibility items
  const eligibilityItems = [
    {
      icon: MapPin,
      title: "Michigan Resident",
      description: "Must be a current resident of the State of Michigan",
    },
    {
      icon: GraduationCap,
      title: "Full-Time Enrollment",
      description:
        "Enrolled or planning to enroll as a full-time student at an accredited college or university",
    },
    {
      icon: Award,
      title: "Minimum 3.0 GPA",
      description: "Must have maintained a cumulative GPA of 3.0 or higher",
    },
    {
      icon: UserCheck,
      title: "First-Time Applicant (Preferred)",
      description: "Priority given to first-time scholarship applicants",
    },
    {
      icon: FileText,
      title: "Two Recommendation Letters",
      description:
        "At least one letter must be from an educator or community organization",
    },
  ];

  // Process steps
  const processSteps = [
    {
      step: "01",
      title: "Create Your Account",
      description:
        "Register on our platform with your email address and create a secure password to begin your application.",
    },
    {
      step: "02",
      title: "Complete the Application",
      description:
        "Fill out all 7 sections including personal information, address, education, eligibility, essay, and documents.",
    },
    {
      step: "03",
      title: "Request Recommendations",
      description:
        "Provide contact information for two recommenders. At least one should be an educator or community group leader.",
    },
    {
      step: "04",
      title: "Submit Before Deadline",
      description:
        "Review your application thoroughly and submit by April 15, 2026 at 11:59 PM EST.",
    },
  ];

  // Important dates
  const importantDates = [
    {
      icon: Calendar,
      date: "January 15, 2026",
      title: "Application Opens",
      description: "Begin submitting your application materials",
      highlight: false,
    },
    {
      icon: Clock,
      date: "April 15, 2026",
      title: "Application Deadline",
      description: "All materials must be submitted by 11:59 PM EST",
      highlight: true,
    },
    {
      icon: Award,
      date: "May 15, 2026",
      title: "Selection Announcement",
      description: "Recipients will be notified via email",
      highlight: false,
    },
  ];

  // FAQ items
  const faqItems = [
    {
      question: "Who can apply for the William R. Stark Scholarship?",
      answer:
        "The scholarship is open to Michigan residents who are enrolled or planning to enroll as full-time students at an accredited college or university. Applicants must have a minimum 3.0 GPA and provide two recommendation letters (at least one from an educator or community group).",
    },
    {
      question: "What documents do I need to submit?",
      answer:
        'You will need to provide: (1) Personal and contact information, (2) Academic transcripts showing your GPA, (3) An essay on "How Will Furthering My Studies Help Me Improve My Community?", (4) Contact information for two recommenders who will submit letters on your behalf through our platform.',
    },
    {
      question: "How are recommendation letters submitted?",
      answer:
        "During your application, you will enter the email addresses of your two recommenders. Our system will automatically send them a secure link to upload their letters directly to your application. You can track the status of each recommendation in your applicant dashboard.",
    },
    {
      question: "When will I hear back about my application?",
      answer:
        "All applicants will be notified of the selection committee's decision by May 15, 2026 via email. Recipients will receive additional instructions about award acceptance and disbursement.",
    },
    {
      question: "Can I edit my application after submitting it?",
      answer:
        "No, once you submit your application, you cannot make changes. We recommend reviewing all sections carefully before submission. If you discover an error after submitting, please contact us immediately at blackgoldmine@sbcglobal.net.",
    },
  ];

  // Selection criteria
  const selectionCriteria = [
    "Quality and thoughtfulness of essay response",
    "Strength of recommendation letters",
    "Academic achievement and GPA",
    "Community involvement and leadership",
    "Alignment with scholarship mission",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md" role="navigation" aria-label="Main navigation">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2" aria-label="Stark Scholars - Home">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600">
              <GraduationCap className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-base sm:text-lg font-semibold text-gray-900 truncate">
              Stark Scholars
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection("about")}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
              aria-label="Jump to About section"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("eligibility")}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
              aria-label="Jump to Eligibility section"
            >
              Eligibility
            </button>
            <button
              onClick={() => scrollToSection("process")}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
              aria-label="Jump to How to Apply section"
            >
              How to Apply
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
              aria-label="Jump to FAQ section"
            >
              FAQ
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-gray-600 hover:text-gray-900 sm:block"
            >
              Sign In
            </Link>
            <Button
              asChild
              className="bg-amber-600 hover:bg-amber-700 text-white hidden sm:flex"
            >
              <Link href="/register">Apply Now</Link>
            </Button>
            <MobileLandingNav scrollToSection={scrollToSection} />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-amber-50/50">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-60 w-60 sm:h-80 sm:w-80 rounded-full bg-amber-200/20 blur-3xl" />
          <div className="absolute -right-20 top-10 sm:-right-40 sm:top-20 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-amber-300/20 blur-3xl" />
        </div>

        <div className="container relative mx-auto px-4 py-12 sm:py-20 lg:py-32 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              variants={shouldReduceMotion ? {} : heroTextContainer}
              initial="initial"
              animate="animate"
            >
              <motion.div
                variants={shouldReduceMotion ? {} : heroTextItem}
                className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 sm:px-4"
              >
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span className="text-xs sm:text-sm font-medium text-amber-800">
                  Class of 2023 President&apos;s Club
                </span>
              </motion.div>

              <motion.h1
                variants={shouldReduceMotion ? {} : heroTextItem}
                className="mb-4 sm:mb-6 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-gray-900"
              >
                Stark Scholars
                <br />
                <span className="text-amber-600">
                  William R. Stark Financial Assistance Program
                </span>
              </motion.h1>

              <motion.p
                variants={shouldReduceMotion ? {} : heroTextItem}
                className="mx-auto mb-6 sm:mb-8 max-w-2xl text-base sm:text-lg lg:text-xl text-gray-600 px-2 sm:px-0"
              >
                Empowering Michigan students to achieve their educational dreams
                and make a lasting impact on their communities through
                financial support and recognition.
              </motion.p>

              <motion.div
                variants={shouldReduceMotion ? {} : heroTextItem}
                className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
              >
                <Button
                  asChild
                  size="lg"
                  className="h-12 w-full sm:w-auto bg-amber-600 px-6 sm:px-8 text-base hover:bg-amber-700"
                >
                  <Link href="/register">
                    Apply Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 w-full sm:w-auto px-6 sm:px-8 text-base border-gray-300 hover:bg-gray-50"
                  onClick={() => scrollToSection("about")}
                >
                  Learn More
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              variants={shouldReduceMotion ? {} : statsContainer}
              initial="initial"
              animate="animate"
              className="mt-10 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-8 border-t border-gray-200 pt-6 sm:pt-8"
            >
              <motion.div variants={shouldReduceMotion ? {} : statsItem}>
                <div className="text-xl sm:text-3xl font-bold text-amber-600">
                  $500
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Each Award</div>
              </motion.div>
              <motion.div variants={shouldReduceMotion ? {} : statsItem}>
                <div className="text-xl sm:text-3xl font-bold text-amber-600">
                  2
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Scholarships</div>
              </motion.div>
              <motion.div variants={shouldReduceMotion ? {} : statsItem}>
                <div className="text-xl sm:text-3xl font-bold text-amber-600">
                  April 15
                </div>
                <div className="text-xs sm:text-sm text-gray-600">2026 Deadline</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <motion.section
        id="about"
        className="bg-white py-12 sm:py-20 lg:py-28"
        initial={shouldReduceMotion ? {} : "initial"}
        whileInView={shouldReduceMotion ? {} : "animate"}
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              About the Scholarship
            </h2>
            <p className="mb-8 sm:mb-12 text-base sm:text-lg text-gray-600">
              Continuing a legacy of educational excellence and community
              dedication
            </p>
          </div>

          <motion.div
            variants={shouldReduceMotion ? {} : staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            className="mx-auto grid max-w-5xl gap-4 sm:gap-8 grid-cols-1 lg:grid-cols-2"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={shouldReduceMotion ? {} : staggerItem}
                whileHover={shouldReduceMotion ? {} : "hover"}
                initial="rest"
                animate="rest"
              >
                <motion.div variants={cardHover}>
                  <Card className="border-gray-200 h-full">
                    <CardContent className="p-4 sm:p-6 lg:p-8">
                      <div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-amber-100">
                        <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                      </div>
                      <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-semibold text-gray-900">
                        {feature.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        {feature.content}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quote */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mx-auto mt-8 sm:mt-12 max-w-3xl text-center px-4"
          >
            <blockquote className="relative">
              <div className="text-3xl sm:text-4xl text-amber-300">&ldquo;</div>
              <p className="text-base sm:text-lg lg:text-xl italic text-gray-700 -mt-4 sm:-mt-6">
                Education is not just about personal advancement—it&apos;s about
                lifting up our communities and creating opportunities for those
                who come after us.
              </p>
              <footer className="mt-4">
                <cite className="text-xs sm:text-sm font-medium text-gray-600 not-italic">
                  — William R. Stark Scholarship Committee
                </cite>
              </footer>
            </blockquote>
          </motion.div>
        </div>
      </motion.section>

      {/* Eligibility Section */}
      <motion.section
        id="eligibility"
        className="bg-amber-50/50 py-12 sm:py-20 lg:py-28"
        initial={shouldReduceMotion ? {} : "initial"}
        whileInView={shouldReduceMotion ? {} : "animate"}
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Eligibility Requirements
            </h2>
            <p className="mb-8 sm:mb-12 text-base sm:text-lg text-gray-600">
              Are you eligible to apply? Review the requirements below
            </p>
          </div>

          <motion.div
            variants={shouldReduceMotion ? {} : staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            className="mx-auto grid max-w-4xl gap-3 sm:gap-4"
          >
            {eligibilityItems.map((item, index) => (
              <motion.div
                key={index}
                variants={shouldReduceMotion ? {} : staggerItem}
                whileHover={shouldReduceMotion ? {} : "hover"}
                initial="rest"
                animate="rest"
              >
                <motion.div variants={cardHover}>
                  <Card className="border-gray-200 transition-shadow hover:shadow-md">
                    <CardContent className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6">
                      <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                        <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {item.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Award Details Section */}
      <motion.section
        className="bg-white py-12 sm:py-20 lg:py-28"
        initial={shouldReduceMotion ? {} : "initial"}
        whileInView={shouldReduceMotion ? {} : "animate"}
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Award Details
            </h2>
            <p className="mb-8 sm:mb-12 text-base sm:text-lg text-gray-600">
              Two deserving students will each receive $500 to support their
              educational journey
            </p>
          </div>

          <motion.div
            variants={shouldReduceMotion ? {} : staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            className="mx-auto grid max-w-5xl gap-4 sm:gap-8 grid-cols-1 lg:grid-cols-2"
          >
            <motion.div variants={shouldReduceMotion ? {} : staggerItem}>
              <Card className="border-amber-200 bg-amber-50/50 h-full">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-amber-600 text-white shrink-0">
                      <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <span>Scholarship Amount</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                  <div className="mb-3 sm:mb-4">
                    <span className="text-3xl sm:text-5xl font-bold text-amber-600">
                      $500
                    </span>
                    <span className="text-base sm:text-lg text-gray-600"> each</span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600">
                    Two scholarships of $500 each will be awarded to selected
                    recipients. Funds will be disbursed directly to the
                    recipient&apos;s educational institution to be applied toward
                    tuition and fees.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={shouldReduceMotion ? {} : staggerItem}>
              <Card className="border-gray-200 h-full">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 shrink-0">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <span>Selection Criteria</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                  <ul className="space-y-2 sm:space-y-3">
                    {selectionCriteria.map((criterion, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 sm:gap-3"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-green-500" />
                        <span className="text-sm sm:text-base text-gray-600">
                          {criterion}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Application Process Section */}
      <motion.section
        id="process"
        className="bg-gray-900 py-12 sm:py-20 lg:py-28 text-white"
        initial={shouldReduceMotion ? {} : "initial"}
        whileInView={shouldReduceMotion ? {} : "animate"}
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold">
              Application Process
            </h2>
            <p className="mb-8 sm:mb-12 text-base sm:text-lg text-gray-400">
              Follow these steps to complete your application
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <motion.div
              variants={shouldReduceMotion ? {} : staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="relative"
            >
              {/* Timeline line - hidden on mobile */}
              <div className="absolute left-5 sm:left-6 top-0 h-full w-0.5 bg-gray-700 md:left-1/2 md:-ml-0.5 hidden sm:block" />

              {processSteps.map((item, index) => (
                <motion.div
                  key={index}
                  variants={shouldReduceMotion ? {} : staggerItem}
                  className={`relative mb-6 sm:mb-8 flex items-start gap-4 sm:gap-6 sm:items-center ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div
                    className={`hidden w-1/2 md:block ${
                      index % 2 === 0
                        ? "text-right pr-8 lg:pr-12"
                        : "text-left pl-8 lg:pl-12"
                    }`}
                  >
                    <h3 className="mb-1 sm:mb-2 text-lg sm:text-xl font-semibold">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-400">
                      {item.description}
                    </p>
                  </div>
                  <div className="relative z-10 flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-amber-600 text-base sm:text-lg font-bold">
                    {item.step}
                  </div>
                  <div className="md:hidden flex-1 min-w-0">
                    <h3 className="mb-1 text-base sm:text-lg font-semibold">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </div>
                  <div className="hidden w-1/2 md:block" />
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-8 sm:mt-12 text-center"
          >
            <Button
              asChild
              size="lg"
              className="h-12 w-full sm:w-auto bg-amber-600 px-6 sm:px-8 text-base hover:bg-amber-700"
            >
              <Link href="/register">
                Start Your Application
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Important Dates Section */}
      <motion.section
        className="bg-white py-12 sm:py-20 lg:py-28"
        initial={shouldReduceMotion ? {} : "initial"}
        whileInView={shouldReduceMotion ? {} : "animate"}
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Important Dates
            </h2>
            <p className="mb-8 sm:mb-12 text-base sm:text-lg text-gray-600">
              Mark your calendar with these key deadlines
            </p>
          </div>

          <motion.div
            variants={shouldReduceMotion ? {} : staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            className="mx-auto grid max-w-4xl gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {importantDates.map((item, index) => (
              <motion.div
                key={index}
                variants={shouldReduceMotion ? {} : staggerItem}
                whileHover={shouldReduceMotion ? {} : "hover"}
                initial="rest"
                animate="rest"
              >
                <motion.div variants={cardHover}>
                  <Card
                    className={`text-center h-full transition-shadow hover:shadow-lg ${
                      item.highlight
                        ? "border-amber-300 bg-amber-50/50 ring-1 ring-amber-200"
                        : "border-gray-200"
                    }`}
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div
                        className={`mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full ${
                          item.highlight ? "bg-amber-100" : "bg-gray-100"
                        }`}
                      >
                        <item.icon
                          className={`h-6 w-6 sm:h-7 sm:w-7 ${
                            item.highlight ? "text-amber-600" : "text-gray-600"
                          }`}
                        />
                      </div>
                      <p
                        className={`mb-1 sm:mb-2 text-xs sm:text-sm font-semibold ${
                          item.highlight ? "text-amber-600" : "text-gray-500"
                        }`}
                      >
                        {item.date}
                      </p>
                      <h3 className="mb-1 sm:mb-2 text-base sm:text-lg font-semibold text-gray-900">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        id="faq"
        className="bg-gray-50 py-12 sm:py-20 lg:py-28"
        initial={shouldReduceMotion ? {} : "initial"}
        whileInView={shouldReduceMotion ? {} : "animate"}
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="mb-8 sm:mb-12 text-base sm:text-lg text-gray-600">
              Find answers to common questions about the application process
            </p>
          </div>

          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mx-auto max-w-3xl"
          >
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-gray-900 text-sm sm:text-base py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-sm sm:text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="bg-amber-600 py-10 sm:py-16 lg:py-20"
        initial={shouldReduceMotion ? {} : "initial"}
        whileInView={shouldReduceMotion ? {} : "animate"}
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeInUp}
      >
        <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            Ready to Apply?
          </h2>
          <p className="mx-auto mb-6 sm:mb-8 max-w-2xl text-base sm:text-lg text-amber-100">
            Take the first step toward your educational goals. Create your
            account today and begin your application for the William R. Stark
            Financial Assistance Program.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button
              asChild
              size="lg"
              className="h-12 w-full sm:w-auto bg-white px-6 sm:px-8 text-base text-amber-600 hover:bg-amber-50"
            >
              <Link href="/register">Start Your Application</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 w-full sm:w-auto border-white px-6 sm:px-8 text-base text-white hover:bg-amber-700"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>

          {/* Contact Info */}
          <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-amber-100 text-sm sm:text-base">
            <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Questions? Contact us at</span>
            <a
              href="mailto:blackgoldmine@sbcglobal.net"
              className="font-medium underline underline-offset-4 hover:text-white break-all"
            >
              blackgoldmine@sbcglobal.net
            </a>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t bg-white py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  Stark Scholars
                </span>
              </Link>
              <p className="mt-3 sm:mt-4 max-w-sm text-sm text-gray-600">
                Financial Assistance Program by the Class of 2023 President&apos;s
                Club. Empowering Michigan students to achieve their educational
                dreams.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="mb-3 sm:mb-4 font-semibold text-gray-900">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => scrollToSection("about")}
                    className="text-gray-600 hover:text-gray-900 min-h-[24px]"
                  >
                    About
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("eligibility")}
                    className="text-gray-600 hover:text-gray-900 min-h-[24px]"
                  >
                    Eligibility
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("process")}
                    className="text-gray-600 hover:text-gray-900 min-h-[24px]"
                  >
                    How to Apply
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("faq")}
                    className="text-gray-600 hover:text-gray-900 min-h-[24px]"
                  >
                    FAQ
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-3 sm:mb-4 font-semibold text-gray-900">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="mailto:blackgoldmine@sbcglobal.net"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 min-h-[24px] break-all"
                  >
                    <Mail className="h-4 w-4 shrink-0" />
                    blackgoldmine@sbcglobal.net
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 sm:mt-12 border-t border-gray-200 pt-6 sm:pt-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-xs sm:text-sm text-gray-600">
                © {new Date().getFullYear()} Stark Scholars Platform. All rights reserved.
              </p>
              <div className="flex gap-4">
                <Link href="/terms" className="text-xs sm:text-sm text-gray-600 hover:text-gray-900">
                  Terms of Service
                </Link>
                <Link href="/privacy" className="text-xs sm:text-sm text-gray-600 hover:text-gray-900">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
