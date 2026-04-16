"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
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
  Send,
  Mail,
  RefreshCw,
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
  const { toast } = useToast();

  const isSubmitted = application?.status === "submitted";

  const recommendations = useQuery(
    api.recommendations.getByApplication,
    isSubmitted && application ? { applicationId: application._id } : "skip"
  );
  const sendReminderMutation = useMutation(api.recommendations.sendReminder);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);

  const handleSendReminder = async (recommendationId: Id<"recommendations">, name: string) => {
    setSendingReminderId(recommendationId);
    try {
      await sendReminderMutation({ recommendationId });
      toast({
        title: "Reminder sent!",
        description: `A reminder has been sent to ${name}. Ask them to check their Junk or Spam folder if they don't see it.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reminder. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingReminderId(null);
    }
  };

  if (!application) {
    return (
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Welcome!
        </h1>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-muted-foreground mb-4">
              You haven&apos;t started your application yet. Click below to begin.
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
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
            The application deadline has passed (April 20, 2026). You can no longer submit or edit your application.
          </AlertDescription>
        </Alert>
      )}

      {!isPassed && isUrgent && (
        <motion.div
          initial={shouldReduceMotion ? {} : { scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Alert className="border-primary/50 bg-primary/5">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <AlertTitle className="text-primary font-semibold">
              Deadline Approaching
            </AlertTitle>
            <AlertDescription className="text-primary">
              Only {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining until the April 20, 2026 deadline. Submit your application soon!
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Welcome back{application.firstName ? `, ${application.firstName}` : ""}!
        </h1>
      </div>

      {/* Progress Overview */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-foreground">
                  Application Progress
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {completedSteps.length} of 7 steps completed
                </p>
              </div>
              <div className="sm:text-right">
                <motion.span
                  initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="text-2xl sm:text-3xl font-bold text-primary"
                >
                  {progress}%
                </motion.span>
              </div>
            </div>
            <div 
              className="h-2 bg-muted rounded-full overflow-hidden" 
              role="progressbar" 
              aria-valuenow={progress} 
              aria-valuemin={0} 
              aria-valuemax={100}
              aria-label={`Application progress: ${progress}%`}
            >
              <motion.div
                className="h-full bg-primary rounded-full"
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
          <Card className={`${isUrgent ? "border-primary/30 bg-primary/5" : "border-blue-200 bg-blue-50"}`}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <Clock className={`h-5 w-5 shrink-0 mt-0.5 ${isUrgent ? "text-primary" : "text-blue-600"}`} />
                <div className="min-w-0">
                  <h3 className={`font-semibold text-sm sm:text-base ${isUrgent ? "text-primary" : "text-blue-900"}`}>
                    Deadline Reminder
                  </h3>
                  <p className={`text-xs sm:text-sm ${isUrgent ? "text-primary" : "text-blue-700"}`}>
                    Applications are due April 20, 2026 at 11:59 PM EST
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

      {isSubmitted ? (
        <>
          {/* Submission Confirmation Card */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-green-300 bg-green-50/50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 rounded-full bg-green-100 shrink-0">
                    <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-green-900">
                      Application Submitted
                    </h3>
                    <p className="text-sm text-green-700 mt-1">
                      {application.submittedAt
                        ? `Submitted on ${new Date(application.submittedAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`
                        : "Your application has been submitted successfully."}
                    </p>
                    <div className="mt-3">
                      <Button asChild variant="outline" size="sm" className="border-green-300 text-green-800 hover:bg-green-100">
                        <Link href="/apply/status">
                          <Eye className="mr-2 h-4 w-4" />
                          View Application Status
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pending Recommenders Card */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  Recommendation Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                {recommendations === undefined ? (
                  <p className="text-sm text-muted-foreground">Loading recommendations...</p>
                ) : recommendations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recommendations requested.</p>
                ) : (
                  <div className="space-y-3">
                    {recommendations.map((rec: any) => (
                      <div
                        key={rec._id}
                        className={`flex items-center justify-between gap-3 p-3 rounded-lg border ${
                          rec.status === "submitted"
                            ? "bg-green-50 border-green-200"
                            : "bg-muted/30 border-border"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-1.5 rounded-full shrink-0 ${
                            rec.status === "submitted" ? "bg-green-100" : "bg-muted"
                          }`}>
                            <Mail className={`h-4 w-4 ${
                              rec.status === "submitted" ? "text-green-600" : "text-muted-foreground"
                            }`} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">
                              {rec.recommenderName || rec.recommenderEmail}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {rec.recommenderEmail}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {rec.status === "submitted" ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Received
                            </Badge>
                          ) : (
                            <>
                              <Badge variant="outline" className="text-primary border-primary/20">
                                <Clock className="mr-1 h-3 w-3" />
                                {rec.status === "email_sent" ? "Sent" : rec.status === "viewed" ? "Viewed" : "Pending"}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendReminder(rec._id, rec.recommenderName || "")}
                                disabled={sendingReminderId === rec._id}
                              >
                                {sendingReminderId === rec._id ? (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : (
                                  <>
                                    <Send className="mr-1 h-3 w-3" />
                                    Remind
                                  </>
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      ) : (
        <>
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
                            ? "border-primary/20 bg-primary/5 ring-2 ring-primary/20"
                            : "border-border bg-muted/30 opacity-75"
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
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted text-muted-foreground/70"
                                }`}
                              >
                                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Step {step.id}</p>
                                <h3 className="font-medium text-foreground text-sm sm:text-base truncate">
                                  {step.title}
                                </h3>
                              </div>
                            </div>
                            <div className="shrink-0">
                              {status === "completed" ? (
                                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                              ) : status === "current" ? (
                                <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-primary/80" />
                              ) : (
                                <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50" />
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
                      <h3 className="font-medium text-foreground text-sm sm:text-base">
                        {steps[currentStep - 1]?.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {isPassed
                          ? "Applications are closed. You can no longer edit your application."
                          : "Complete this step to continue your application."
                        }
                      </p>
                    </div>
                    <Button
                      asChild
                      className="bg-primary hover:bg-primary/90 w-full sm:w-auto shrink-0"
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
                      <h3 className="font-medium text-foreground text-sm sm:text-base">
                        Application Complete
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
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
        </>
      )}
    </motion.div>
  );
}
