"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, Save, XCircle, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fadeInUp, fadeInLeft, fadeInRight, scaleIn, staggerContainer, staggerItem } from "@/lib/motion";

// Import step components
import { PersonalInfoStep } from "@/components/apply/steps/personal-info-step";
import { AddressStep } from "@/components/apply/steps/address-step";
import { EducationStep } from "@/components/apply/steps/education-step";
import { EligibilityStep } from "@/components/apply/steps/eligibility-step";
import { DocumentsStep } from "@/components/apply/steps/documents-step";
import { RecommendationsStep } from "@/components/apply/steps/recommendations-step";
import { ReviewSubmitStep } from "@/components/apply/steps/review-submit-step";

const steps = [
  { id: 1, title: "Personal Information", component: PersonalInfoStep },
  { id: 2, title: "Address", component: AddressStep },
  { id: 3, title: "Education", component: EducationStep },
  { id: 4, title: "Eligibility", component: EligibilityStep },
  { id: 5, title: "Documents & Essay", component: DocumentsStep },
  { id: 6, title: "Recommendations", component: RecommendationsStep },
  { id: 7, title: "Review & Submit", component: ReviewSubmitStep },
];


export default function StepPage() {
  const params = useParams();
  const router = useRouter();
  const stepNumber = parseInt(params.step as string, 10);
  const shouldReduceMotion = useReducedMotion();
  const [direction, setDirection] = useState(0); // -1 for back, 1 for forward
  const [isCreatingApp, setIsCreatingApp] = useState(false);

  const application = useQuery(api.applications.getMyApplication);
  const user = useQuery(api.users.getCurrentUser);
  const updateCurrentStep = useMutation(api.applications.updateCurrentStep);
  const createApplication = useMutation(api.applications.create);
  const isDeadlinePassed = useQuery(api.settings.isDeadlinePassed);

  // Validate step number
  useEffect(() => {
    if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 7) {
      router.push("/apply/dashboard");
    }
  }, [stepNumber, router]);

  useEffect(() => {
    async function createApp() {
      if (application === null && user && !isCreatingApp) {
        setIsCreatingApp(true);
        try {
          await createApplication({ userId: user._id });
        } catch {
          // Application creation failed - layout will show loading
        } finally {
          setIsCreatingApp(false);
        }
      }
    }
    createApp();
  }, [application, user, createApplication, isCreatingApp]);

  // Update current step when visiting
  useEffect(() => {
    if (application && stepNumber >= 1 && stepNumber <= 7) {
      updateCurrentStep({
        applicationId: application._id,
        step: stepNumber,
      });
    }
  }, [application, stepNumber, updateCurrentStep]);

  // Show loading while queries are loading OR creating application
  if (application === undefined || user === undefined || isCreatingApp ||
    !application || isNaN(stepNumber) || stepNumber < 1 || stepNumber > 7) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  const step = steps[stepNumber - 1];
  const StepComponent = step.component;

  const prevStep = stepNumber > 1 ? stepNumber - 1 : null;
  const nextStep = stepNumber < 7 ? stepNumber + 1 : null;

  const isPassed = isDeadlinePassed ?? false;

  const handleComplete = () => {
    setDirection(1);
    if (nextStep) {
      router.push(`/apply/step/${nextStep}`);
    }
  };

  // Handle manual navigation
  const handleNavClick = (newStep: number) => {
    setDirection(newStep > stepNumber ? 1 : -1);
    router.push(`/apply/step/${newStep}`);
  };

  // Slide animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: shouldReduceMotion ? 0 : direction > 0 ? 50 : -50,
      opacity: shouldReduceMotion ? 1 : 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: shouldReduceMotion ? 0 : direction > 0 ? -50 : 50,
      opacity: shouldReduceMotion ? 1 : 0,
    }),
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : "initial"}
      animate="animate"
      variants={fadeInUp}
      className="max-w-3xl mx-auto"
    >
      {/* Deadline Alert */}
      {isPassed && (
        <Alert variant="destructive" className="border-red-500 bg-red-50 mb-6">
          <XCircle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-900 font-semibold">
            Applications Closed
          </AlertTitle>
          <AlertDescription className="text-red-700">
            The application deadline has passed. You can view but not edit your application.
          </AlertDescription>
        </Alert>
      )}

      {/* Step Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
          <Link href="/apply/dashboard" className="hover:text-primary">
            Dashboard
          </Link>
          <span>/</span>
          <span>Step {stepNumber} of 7</span>
        </div>
        <motion.h1
          key={step.title}
          initial={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl sm:text-2xl font-bold text-foreground"
        >
          {step.title}
        </motion.h1>
      </div>

      {/* Progress Bar */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex gap-1">
          {steps.map((s) => (
            <motion.div
              key={s.id}
              initial={shouldReduceMotion ? {} : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: s.id * 0.05, duration: 0.3 }}
              className={`h-2 flex-1 rounded-full origin-left ${s.id <= stepNumber ? "bg-primary" : "bg-muted"
                }`}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>Start</span>
          <span>{Math.round((stepNumber / 7) * 100)}% Complete</span>
          <span>Finish</span>
        </div>
      </motion.div>

      {/* Step Content */}
      <Card className="overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={stepNumber}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {StepComponent ? (
                <StepComponent
                  application={application}
                  onComplete={handleComplete}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">This step is coming soon.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-4 sm:mt-6 gap-3"
      >
        <div>
          {prevStep ? (
            <Button
              variant="outline"
              onClick={() => handleNavClick(prevStep)}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : (
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/apply/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {nextStep && !isPassed && (
            <Button
              variant="outline"
              onClick={() => handleNavClick(nextStep)}
              className="w-full sm:w-auto"
            >
              Skip for now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </motion.div>

      {/* Step indicator dots - mobile friendly */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2 sm:hidden"
      >
        {steps.map((s) => (
          <button
            key={s.id}
            onClick={() => handleNavClick(s.id)}
            disabled={isPassed && s.id !== stepNumber}
            className={`w-8 h-8 rounded-full text-xs font-medium transition-colors touch-manipulation ${s.id === stepNumber
              ? "bg-primary text-white"
              : s.id < stepNumber
                ? "bg-green-100 text-green-700"
                : "bg-muted text-muted-foreground"
              }`}
          >
            {s.id < stepNumber ? (
              <CheckCircle2 className="w-4 h-4 mx-auto" />
            ) : (
              s.id
            )}
          </button>
        ))}
      </motion.div>
    </motion.div>
  );
}
