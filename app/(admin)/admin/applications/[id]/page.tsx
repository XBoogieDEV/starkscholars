"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  User,
  MapPin,
  GraduationCap,
  FileText,
  HelpCircle,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Mail,
  Building2,
  Calendar,
  Sparkles,
  Activity,
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "in_progress", label: "In Progress" },
  { value: "pending_recommendations", label: "Pending Recommendations" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "finalist", label: "Finalist" },
  { value: "selected", label: "Selected" },
  { value: "not_selected", label: "Not Selected" },
  { value: "withdrawn", label: "Withdrawn" },
];

const ratingOptions = [
  { value: "strong_yes", label: "Strong Yes", color: "text-green-600" },
  { value: "yes", label: "Yes", color: "text-green-500" },
  { value: "maybe", label: "Maybe", color: "text-amber-500" },
  { value: "no", label: "No", color: "text-red-500" },
  { value: "strong_no", label: "Strong No", color: "text-red-600" },
];

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "submitted":
    case "under_review":
      return "secondary";
    case "finalist":
    case "selected":
      return "default";
    case "not_selected":
    case "withdrawn":
      return "destructive";
    default:
      return "outline";
  }
}

function getStatusLabel(status: string) {
  return statusOptions.find((s) => s.value === status)?.label || status;
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(timestamp: number) {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium text-sm truncate">{value || "Not provided"}</p>
      </div>
    </div>
  );
}

function AISummaryCard({ summary, highlights }: { summary?: string; highlights?: string[] }) {
  if (!summary && (!highlights || highlights.length === 0)) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <p className="text-sm">AI summary not yet generated</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-amber-500" />
          AI-Generated Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {summary && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Summary</p>
            <p className="text-sm">{summary}</p>
          </div>
        )}
        {highlights && highlights.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Key Highlights</p>
            <ul className="space-y-1">
              {highlights.map((highlight, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-amber-500 mt-1">•</span>
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecommendationCard({
  recommendation,
}: {
  recommendation: {
    _id: string;
    recommenderName?: string;
    recommenderEmail: string;
    recommenderType: string;
    status: string;
    submittedAt?: number;
  };
}) {
  const getStatusIcon = () => {
    switch (recommendation.status) {
      case "submitted":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "pending":
      case "email_sent":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
      <div className="mt-0.5">{getStatusIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">
          {recommendation.recommenderName || recommendation.recommenderEmail}
        </p>
        <p className="text-xs text-muted-foreground capitalize">
          {recommendation.recommenderType.replace("_", " ")}
        </p>
        {recommendation.submittedAt && (
          <p className="text-xs text-muted-foreground mt-1">
            Submitted {formatDate(recommendation.submittedAt)}
          </p>
        )}
      </div>
      <Badge variant={recommendation.status === "submitted" ? "default" : "outline"}>
        {recommendation.status === "submitted" ? "Received" : "Pending"}
      </Badge>
    </div>
  );
}

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const applicationId = id as Id<"applications">;

  const data = useQuery(api.admin.getApplicationDetails, { id: applicationId });

  if (data === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/applications">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const { application, recommendations, evaluations, activityLog } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href="/admin/applications">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold tracking-tight">
              {application.firstName} {application.lastName}
            </h2>
            <Badge variant={getStatusBadgeVariant(application.status)}>
              {getStatusLabel(application.status)}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Application ID: {application._id}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue={application.status}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Change status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="recommendations">
            Recommendations ({recommendations.length})
          </TabsTrigger>
          <TabsTrigger value="evaluations">
            Evaluations ({evaluations.length})
          </TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-4 w-4" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <InfoRow
                    label="Full Name"
                    value={`${application.firstName} ${application.lastName}`}
                    icon={User}
                  />
                  <InfoRow
                    label="Phone"
                    value={application.phone}
                    icon={Mail}
                  />
                  <InfoRow
                    label="Date of Birth"
                    value={
                      application.dateOfBirth
                        ? formatDate(new Date(application.dateOfBirth).getTime())
                        : undefined
                    }
                    icon={Calendar}
                  />
                </CardContent>
              </Card>

              {/* Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4" />
                    Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <InfoRow
                    label="Street Address"
                    value={application.streetAddress}
                    icon={MapPin}
                  />
                  <InfoRow label="City" value={application.city} icon={Building2} />
                  <InfoRow label="State" value={application.state} icon={Building2} />
                  <InfoRow label="ZIP Code" value={application.zipCode} icon={Building2} />
                </CardContent>
              </Card>

              {/* Education */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <GraduationCap className="h-4 w-4" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="font-medium text-sm mb-2">High School</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <InfoRow label="School Name" value={application.highSchoolName} />
                        <InfoRow label="City" value={application.highSchoolCity} />
                        <InfoRow label="State" value={application.highSchoolState} />
                        <InfoRow
                          label="Graduation Date"
                          value={
                            application.graduationDate
                              ? formatDate(new Date(application.graduationDate).getTime())
                              : undefined
                          }
                        />
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="font-medium text-sm mb-2">College/University</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <InfoRow label="College Name" value={application.collegeName} />
                        <InfoRow label="City" value={application.collegeCity} />
                        <InfoRow label="State" value={application.collegeState} />
                        <InfoRow
                          label="Year"
                          value={
                            application.yearInCollege
                              ? application.yearInCollege.charAt(0).toUpperCase() +
                                application.yearInCollege.slice(1)
                              : undefined
                          }
                        />
                        <InfoRow label="Major" value={application.major} />
                        <InfoRow
                          label="GPA"
                          value={application.gpa?.toFixed(2)}
                        />
                        {application.actScore && (
                          <InfoRow label="ACT Score" value={application.actScore.toString()} />
                        )}
                        {application.satScore && (
                          <InfoRow label="SAT Score" value={application.satScore.toString()} />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Eligibility */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <HelpCircle className="h-4 w-4" />
                    Eligibility Responses
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <InfoRow
                    label="First time applying?"
                    value={
                      application.isFirstTimeApplying === undefined
                        ? undefined
                        : application.isFirstTimeApplying
                        ? "Yes"
                        : "No"
                    }
                    icon={HelpCircle}
                  />
                  <InfoRow
                    label="Previous recipient?"
                    value={
                      application.isPreviousRecipient === undefined
                        ? undefined
                        : application.isPreviousRecipient
                        ? "Yes"
                        : "No"
                    }
                    icon={HelpCircle}
                  />
                  <InfoRow
                    label="Full-time student?"
                    value={
                      application.isFullTimeStudent === undefined
                        ? undefined
                        : application.isFullTimeStudent
                        ? "Yes"
                        : "No"
                    }
                    icon={HelpCircle}
                  />
                  <InfoRow
                    label="Michigan resident?"
                    value={
                      application.isMichiganResident === undefined
                        ? undefined
                        : application.isMichiganResident
                        ? "Yes"
                        : "No"
                    }
                    icon={HelpCircle}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Applicant Photo */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarFallback className="bg-amber-100 text-amber-800 text-2xl">
                        {application.firstName?.[0] || "?"}
                        {application.lastName?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold">
                      {application.firstName} {application.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {application.collegeName || "No college listed"}
                    </p>
                    {application.gpa && (
                      <Badge variant="secondary" className="mt-2">
                        GPA: {application.gpa.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* AI Summary */}
              <AISummaryCard
                summary={application.aiSummary}
                highlights={application.aiHighlights}
              />

              {/* Application Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Application Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(application.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(application.updatedAt)}
                      </p>
                    </div>
                  </div>
                  {application.submittedAt && (
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Submitted</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(application.submittedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documents
              </CardTitle>
              <CardDescription>
                Uploaded files and essay content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Transcript</p>
                      <p className="text-xs text-muted-foreground">
                        {application.transcriptFileId ? "Uploaded" : "Not uploaded"}
                      </p>
                    </div>
                    {application.transcriptFileId && (
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    )}
                  </div>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Essay</p>
                      <p className="text-xs text-muted-foreground">
                        {application.essayText
                          ? `${application.essayWordCount || 0} words`
                          : application.essayFileId
                          ? "File uploaded"
                          : "Not uploaded"}
                      </p>
                    </div>
                    {(application.essayText || application.essayFileId) && (
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {application.essayText && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Essay Content</h4>
                  <div className="p-4 rounded-lg bg-muted/50 max-h-96 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">{application.essayText}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Recommendations
              </CardTitle>
              <CardDescription>
                Letters of recommendation status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No recommendations requested yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((rec) => (
                    <RecommendationCard key={rec._id} recommendation={rec} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Committee Evaluations
              </CardTitle>
              <CardDescription>
                Ratings and notes from committee members
              </CardDescription>
            </CardHeader>
            <CardContent>
              {evaluations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <GraduationCap className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No evaluations yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {evaluations.map((eval_) => {
                    const ratingInfo = ratingOptions.find(
                      (r) => r.value === eval_.rating
                    );
                    return (
                      <div
                        key={eval_._id}
                        className="p-4 rounded-lg border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{(eval_ as any).evaluatorName}</p>
                          <span className={`font-semibold ${ratingInfo?.color || ""}`}>
                            {ratingInfo?.label || eval_.rating}
                          </span>
                        </div>
                        {eval_.notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {eval_.notes}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Evaluated on {formatDateTime(eval_.createdAt)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activity Log
              </CardTitle>
              <CardDescription>
                Recent actions on this application
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activityLog.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No activity recorded yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activityLog.map((log) => (
                    <div key={log._id} className="flex items-start gap-3 py-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500 mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium capitalize">
                          {log.action.replace("_", " ")}
                        </p>
                        {log.details && (
                          <p className="text-sm text-muted-foreground">
                            {log.details}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDateTime(log.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
