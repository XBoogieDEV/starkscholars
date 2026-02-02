"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  FileCheck,
  FileClock,
  MailWarning,
  ArrowRight,
  TrendingUp,
  Clock,
  BarChart3,
} from "lucide-react";

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  trend,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  href?: string;
  trend?: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-md bg-amber-100 flex items-center justify-center">
          <Icon className="h-4 w-4 text-amber-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
            <TrendingUp className="h-3 w-3" />
            <span>{trend}</span>
          </div>
        )}
        {href && (
          <Button variant="ghost" size="sm" className="mt-3 -ml-2 h-8" asChild>
            <Link href={href}>
              View all
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function MetricCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

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
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminDashboardPage() {
  const metrics = useQuery(api.admin.getDashboardMetrics);

  if (metrics === undefined) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your scholarship program
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your scholarship program
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Accounts"
          value={metrics.totalAccounts}
          description="Registered users in the system"
          icon={Users}
          href="/admin/committee"
        />
        <MetricCard
          title="Submitted Applications"
          value={metrics.submittedApplications}
          description="Complete applications received"
          icon={FileCheck}
          href="/admin/applications?status=submitted"
        />
        <MetricCard
          title="Draft Applications"
          value={metrics.draftApplications}
          description="Applications in progress"
          icon={FileClock}
          href="/admin/applications?status=draft"
        />
        <MetricCard
          title="Pending Recommendations"
          value={metrics.pendingRecommendations}
          description="Awaiting recommender response"
          icon={MailWarning}
          href="/admin/applications"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/applications">
                <FileCheck className="mr-2 h-4 w-4" />
                Review Applications
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/committee">
                <Users className="mr-2 h-4 w-4" />
                Manage Committee
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/settings">
                <Clock className="mr-2 h-4 w-4" />
                Configure Deadline
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest application submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.recentApplications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {metrics.recentApplications.map((app) => (
                  <div
                    key={app._id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                        {app.firstName?.[0] || "?"}
                        {app.lastName?.[0] || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {app.firstName} {app.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {app.submittedAt
                            ? `Submitted on ${formatDate(app.submittedAt)}`
                            : `Created on ${formatDate(app.createdAt)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(app.status)}>
                        {getStatusLabel(app.status)}
                      </Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/applications/${app._id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
