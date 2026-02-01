"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Users,
  GraduationCap,
  Award,
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-800", icon: FileText },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-800", icon: Clock },
  pending_recommendations: { label: "Pending Recommendations", color: "bg-amber-100 text-amber-800", icon: Users },
  submitted: { label: "Submitted", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  under_review: { label: "Under Review", color: "bg-purple-100 text-purple-800", icon: GraduationCap },
  finalist: { label: "Finalist", color: "bg-pink-100 text-pink-800", icon: Award },
  selected: { label: "Selected", color: "bg-green-100 text-green-800", icon: Award },
  not_selected: { label: "Not Selected", color: "bg-red-100 text-red-800", icon: AlertCircle },
  withdrawn: { label: "Withdrawn", color: "bg-gray-100 text-gray-800", icon: FileText },
};

export default function StatusPage() {
  const application = useQuery(api.applications.getMyApplication);
  const recommendations = useQuery(
    api.recommendations.getByApplication,
    application ? { applicationId: application._id } : "skip"
  );
  const deadline = useQuery(api.settings.getDeadline);

  if (!application) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              No Application Found
            </h1>
            <p className="text-gray-600">
              You haven&apos;t started your application yet. Visit the dashboard to begin.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusConfig[application.status] || statusConfig.draft;
  const StatusIcon = status.icon;
  const daysRemaining = deadline
    ? Math.max(0, Math.ceil((deadline - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const recReceived = recommendations?.filter((r: any) => r.status === "submitted").length || 0;
  const recTotal = recommendations?.length || 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Application Status</h1>
        <p className="text-gray-600 mt-1">
          Track the progress of your scholarship application
        </p>
      </div>

      {/* Main Status Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Status</p>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  {application.firstName} {application.lastName}
                </h2>
                <Badge className={status.color}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {status.label}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Application submitted on{" "}
                {application.submittedAt
                  ? new Date(application.submittedAt).toLocaleDateString()
                  : "Not yet submitted"}
              </p>
            </div>
            <div className="text-right">
              {daysRemaining !== null && daysRemaining > 0 && (
                <div className="text-amber-600">
                  <p className="text-3xl font-bold">{daysRemaining}</p>
                  <p className="text-sm">days until decision</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Application Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recommendations */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Recommendations
              </span>
              <span className="text-sm text-gray-600">
                {recReceived} of 2 received
              </span>
            </div>
            <Progress value={(recReceived / 2) * 100} className="h-2" />
            <div className="mt-2 space-y-1">
              {recommendations?.map((rec: any) => (
                <div
                  key={rec._id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-600">{rec.recommenderName}</span>
                  {rec.status === "submitted" ? (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Received
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600 text-xs">
                      {rec.status}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Documents</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Transcript</span>
                {application.transcriptFileId ? (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Uploaded
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    Missing
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Essay</span>
                {application.essayWordCount ? (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    {application.essayWordCount} words
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    Missing
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Application Details */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Application Details
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">High School:</span>
                <p className="font-medium text-gray-900">
                  {application.highSchoolName || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-gray-500">College:</span>
                <p className="font-medium text-gray-900">
                  {application.collegeName || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-gray-500">GPA:</span>
                <p className="font-medium text-gray-900">
                  {application.gpa || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Year:</span>
                <p className="font-medium text-gray-900 capitalize">
                  {application.yearInCollege || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Application Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Application Created</p>
                <p className="text-sm text-gray-500">
                  {new Date(application.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {application.submittedAt && (
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Application Submitted</p>
                  <p className="text-sm text-gray-500">
                    {new Date(application.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                application.status === "under_review" ||
                application.status === "finalist" ||
                application.status === "selected"
                  ? "bg-green-100"
                  : "bg-gray-100"
              }`}>
                <GraduationCap className={`h-4 w-4 ${
                  application.status === "under_review" ||
                  application.status === "finalist" ||
                  application.status === "selected"
                    ? "text-green-600"
                    : "text-gray-400"
                }`} />
              </div>
              <div>
                <p className={`font-medium ${
                  application.status === "under_review" ||
                  application.status === "finalist" ||
                  application.status === "selected"
                    ? "text-gray-900"
                    : "text-gray-400"
                }`}>
                  Under Review
                </p>
                <p className="text-sm text-gray-500">
                  Committee evaluation in progress
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                application.status === "selected" ||
                application.status === "not_selected"
                  ? "bg-green-100"
                  : "bg-gray-100"
              }`}>
                <Award className={`h-4 w-4 ${
                  application.status === "selected" ||
                  application.status === "not_selected"
                    ? "text-green-600"
                    : "text-gray-400"
                }`} />
              </div>
              <div>
                <p className={`font-medium ${
                  application.status === "selected" ||
                  application.status === "not_selected"
                    ? "text-gray-900"
                    : "text-gray-400"
                }`}>
                  Decision Announced
                </p>
                <p className="text-sm text-gray-500">
                  {application.status === "selected"
                    ? "Congratulations! You have been selected."
                    : application.status === "not_selected"
                    ? "Thank you for your application."
                    : "Expected by April 15, 2026"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="text-center text-sm text-gray-500">
        Questions? Contact the scholarship committee at{" "}
        <a
          href="mailto:blackgoldmine@sbcglobal.net"
          className="text-amber-600 hover:underline"
        >
          blackgoldmine@sbcglobal.net
        </a>
      </p>
    </div>
  );
}
