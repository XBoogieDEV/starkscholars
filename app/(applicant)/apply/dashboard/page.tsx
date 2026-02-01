"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

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

  if (!application) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome!</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600 mb-4">
              You haven&apos;t started your application yet. Click below to begin.
            </p>
            <Button asChild className="bg-amber-600 hover:bg-amber-700">
              <Link href="/apply/step/1">Start Application</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back{application.firstName ? `, ${application.firstName}` : ""}!
        </h1>
      </div>

      {/* Progress Overview */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Application Progress
              </h2>
              <p className="text-sm text-gray-600">
                {completedSteps.length} of 7 steps completed
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-amber-600">
                {progress}%
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Deadline Reminder */}
      {daysRemaining !== null && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Deadline Reminder</h3>
                <p className="text-sm text-red-700">
                  Applications are due April 15, 2026 at 11:59 PM EST
                  {daysRemaining > 0 && (
                    <span className="font-medium">
                      {" "}
                      — {daysRemaining} days remaining
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Application Steps */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((step) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;

          return (
            <Link key={step.id} href={step.path}>
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${
                  status === "completed"
                    ? "border-green-200 bg-green-50/50"
                    : status === "current"
                    ? "border-amber-200 bg-amber-50/50 ring-2 ring-amber-200"
                    : "border-gray-200 bg-gray-50/50 opacity-75"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          status === "completed"
                            ? "bg-green-100 text-green-600"
                            : status === "current"
                            ? "bg-amber-100 text-amber-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Step {step.id}</p>
                        <h3 className="font-medium text-gray-900">
                          {step.title}
                        </h3>
                      </div>
                    </div>
                    <div>
                      {status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : status === "current" ? (
                        <Circle className="h-5 w-5 text-amber-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Next Action */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Next Step
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {currentStep <= 7 ? (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">
                  {steps[currentStep - 1]?.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Complete this step to continue your application.
                </p>
              </div>
              <Button asChild className="bg-amber-600 hover:bg-amber-700">
                <Link href={steps[currentStep - 1]?.path || "/apply/step/1"}>
                  Continue
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">
                  Application Complete
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your application has been submitted successfully.
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                Submitted
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
