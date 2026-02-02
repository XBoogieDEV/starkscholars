"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  User,
  Home,
  GraduationCap,
  HelpCircle,
  Upload,
  Users,
  Eye,
  AlertTriangle,
  XCircle,
  ArrowRight,
} from "lucide-react";
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  cardHover,
  progressBarAnimation,
} from "@/lib/motion";

const steps = [
  { id: 1, title: "Personal Information", icon: User, path: "/apply/step/1" },
  { id: 2, title: "Address", icon: Home, path: "/apply/step/2" },
  { id: 3, title: "Education", icon: GraduationCap, path: "/apply/step/3" },
  { id: 4, title: "Eligibility", icon: HelpCircle, path: "/apply/step/4" },
  { id: 5, title: "Documents & Essay", icon: Upload, path: "/apply/step/5" },
  { id: 6, title: "Recommendations", icon: Users, path: "/apply/step/6" },
  { id: 7, title: "Review & Submit", icon: Eye, path: "/apply/step/7" },
];

export default function DashboardPage() {
  const application = useQuery(api.applications.getMyApplication);
  const deadline = useQuery(api.settings.getDeadline);
  const isDeadlinePassed = useQuery(api.settings.isDeadlinePassed);
  const shouldReduceMotion = useReducedMotion();

  if (!application) {
    return (
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome!
        </h1>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-gray-600 mb-4">
              You haven&apos;t started your application yet. Click below to begin.
            </p>
            <Button asChild className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto">
              <Link href="/apply/step/1">Start Application</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const completedSteps = application.completedSteps || [];
  const currentStep = application.currentStep || 1;
  const progress = Math.round((completedSteps.length / 7) * 100);

  const getStepStatus = (stepId: number) => {
    if (completedSteps.includes(stepId)) return "completed";
    if (stepId === currentStep) return "current";
    return "pending";
  };

  const daysRemaining = deadline
    ? Math.max(0, Math.ceil((deadline - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  // Determine deadline urgency status
  const isPassed = isDeadlinePassed ?? false;
  const isUrgent = daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0;

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : "initial"}
      animate="animate"
      variants={fadeInUp}
      className="space-y-6 sm:space-y-8"
    >
      {/* Deadline Alert - Show when passed or urgent */}
      {isPassed && (
        <Alert variant="destructive" className="border-red-500 bg-red-50">
          <XCircle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-900 font-semibold">
            Applications Closed
          </AlertTitle>
          <AlertDescription className="text-red-700">
            The application deadline has passed (April 15, 2026). You can no longer submit or edit your application.
          </AlertDescription>
        </Alert>
      )}

      {!isPassed && isUrgent && (
        <motion.div
          initial={shouldReduceMotion ? {} : { scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Alert className="border-amber-500 bg-amber-50">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-900 font-semibold">
              Deadline Approaching
            </AlertTitle>
            <AlertDescription className="text-amber-700">
              Only {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining until the April 15, 2026 deadline. Submit your application soon!
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome back{application.firstName ? `, ${application.firstName}` : ""}!
        </h1>
      </div>

      {/* Progress Overview */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  Application Progress
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  {completedSteps.length} of 7 steps completed
                </p>
              </div>
              <div className="sm:text-right">
                <motion.span
                  initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="text-2xl sm:text-3xl font-bold text-amber-600"
                >
                  {progress}%
                </motion.span>
              </div>
            </div>
            <div 
              className="h-2 bg-gray-200 rounded-full overflow-hidden" 
              role="progressbar" 
              aria-valuenow={progress} 
              aria-valuemin={0} 
              aria-valuemax={100}
              aria-label={`Application progress: ${progress}%`}
            >
              <motion.div
                className="h-full bg-amber-600 rounded-full"
                initial={shouldReduceMotion ? {} : { width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1], delay: 0.2 }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Deadline Reminder */}
      {daysRemaining !== null && !isPassed && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className={`${isUrgent ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <Clock className={`h-5 w-5 shrink-0 mt-0.5 ${isUrgent ? "text-amber-600" : "text-blue-600"}`} />
                <div className="min-w-0">
                  <h3 className={`font-semibold text-sm sm:text-base ${isUrgent ? "text-amber-900" : "text-blue-900"}`}>
                    Deadline Reminder
                  </h3>
                  <p className={`text-xs sm:text-sm ${isUrgent ? "text-amber-700" : "text-blue-700"}`}>
                    Applications are due April 15, 2026 at 11:59 PM EST
                    {daysRemaining > 0 && (
                      <span className="font-medium">
                        {" "}
                        — {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Application Steps */}
      <motion.div
        variants={shouldReduceMotion ? {} : staggerContainer}
        initial="initial"
        animate="animate"
        className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      >
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;

          return (
            <motion.div
              key={step.id}
              variants={shouldReduceMotion ? {} : staggerItem}
              whileHover={shouldReduceMotion ? {} : "hover"}
              initial="rest"
              animate="rest"
              custom={index}
            >
              <motion.div variants={cardHover}>
                <Link href={step.path}>
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md h-full ${
                      status === "completed"
                        ? "border-green-200 bg-green-50/50"
                        : status === "current"
                        ? "border-amber-200 bg-amber-50/50 ring-2 ring-amber-200"
                        : "border-gray-200 bg-gray-50/50 opacity-75"
                    }`}
                    role="link"
                    aria-label={`Step ${step.id}: ${step.title} - ${status === "completed" ? "Completed" : status === "current" ? "In progress" : "Pending"}`}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <div
                            className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${
                              status === "completed"
                                ? "bg-green-100 text-green-600"
                                : status === "current"
                                ? "bg-amber-100 text-amber-600"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">Step {step.id}</p>
                            <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                              {step.title}
                            </h3>
                          </div>
                        </div>
                        <div className="shrink-0">
                          {status === "completed" ? (
                            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                          ) : status === "current" ? (
                            <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                          ) : (
                            <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Next Action */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              Next Step
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            {currentStep <= 7 && application.status !== "submitted" ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                    {steps[currentStep - 1]?.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {isPassed 
                      ? "Applications are closed. You can no longer edit your application."
                      : "Complete this step to continue your application."
                    }
                  </p>
                </div>
                <Button 
                  asChild 
                  className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto shrink-0"
                  disabled={isPassed}
                >
                  <Link href={steps[currentStep - 1]?.path || "/apply/step/1"} className="flex items-center justify-center">
                    {isPassed ? "Closed" : (
                      <>
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                    Application Complete
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Your application has been submitted successfully.
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800 w-fit">
                  Submitted
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
