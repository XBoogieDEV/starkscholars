"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Users,
  FileCheck,
  FileClock,
  TrendingUp,
  Clock,
  GraduationCap,
  MapPin,
  CheckCircle2,
  MailWarning,
  BarChart3,
  Activity,
} from "lucide-react";

const COLORS = ["#d97706", "#f59e0b", "#fbbf24", "#fcd34d", "#fde68a", "#fef3c7", "#fffbeb"];

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string;
  value: number | string;
  description: string;
  icon: React.ElementType;
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
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
            <TrendingUp className="h-3 w-3" />
            <span>{trend}</span>
          </div>
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

export default function AnalyticsDashboardPage() {
  const metrics = useQuery(api.analytics.getDashboardMetrics);
  const realTimeStats = useQuery(api.analytics.getRealTimeStats);

  if (metrics === undefined) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into your scholarship program
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const { summary, applicationsByDay, stepCompletionRates, topCities, topColleges, gpaDistribution, recommendationStats, evaluationProgress, statusBreakdown, userStats } = metrics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <p className="text-muted-foreground">
          Comprehensive insights into your scholarship program
        </p>
      </div>

      {/* Real-time Stats */}
      {realTimeStats && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-900">Today&apos;s Activity</span>
            </div>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <div>
                <p className="text-2xl font-bold text-amber-700">{realTimeStats.applicationsToday}</p>
                <p className="text-xs text-amber-600">New Applications</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">{realTimeStats.submissionsToday}</p>
                <p className="text-xs text-amber-600">Submissions</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">{realTimeStats.pendingRecommendations}</p>
                <p className="text-xs text-amber-600">Pending Recommendations</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">{realTimeStats.pendingSubmissions}</p>
                <p className="text-xs text-amber-600">Draft Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Applications"
          value={summary.totalApplications}
          description="All applications in the system"
          icon={FileCheck}
        />
        <MetricCard
          title="Submitted"
          value={summary.submittedApplications}
          description={`${summary.completionRate}% completion rate`}
          icon={CheckCircle2}
          trend={`${summary.completionRate}% of total`}
        />
        <MetricCard
          title="In Progress"
          value={summary.draftApplications}
          description="Draft applications"
          icon={FileClock}
        />
        <MetricCard
          title="Avg Time to Submit"
          value={`${summary.avgTimeToSubmitDays} days`}
          description="From start to submission"
          icon={Clock}
        />
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Applications
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="demographics" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Demographics
          </TabsTrigger>
          <TabsTrigger value="committee" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Committee
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Applications Over Time (Last 30 Days)</CardTitle>
              <CardDescription>Daily application submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={applicationsByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(label) => new Date(label).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    />
                    <Line type="monotone" dataKey="count" stroke="#d97706" strokeWidth={2} dot={{ fill: "#d97706" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>Current state of all applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(statusBreakdown).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(status) }} />
                        <span className="text-sm capitalize">{status.replace(/_/g, " ")}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{count}</span>
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${summary.totalApplications > 0 ? (count / summary.totalApplications) * 100 : 0}%`,
                              backgroundColor: getStatusColor(status)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>GPA Distribution</CardTitle>
                <CardDescription>Academic performance breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={gpaDistribution.filter(d => d.count > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="range"
                      >
                        {gpaDistribution.filter(d => d.count > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Step Completion Rates</CardTitle>
              <CardDescription>Percentage of applicants completing each step</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stepCompletionRates}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(value) => [`${value}%`, "Completion Rate"]} />
                    <Bar dataKey="rate" fill="#d97706" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations Status</CardTitle>
              <CardDescription>Overview of recommendation letters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-gray-900">{recommendationStats.total}</p>
                  <p className="text-sm text-gray-600">Total Requested</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-700">{recommendationStats.submitted}</p>
                  <p className="text-sm text-green-600">Submitted</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-3xl font-bold text-yellow-700">{recommendationStats.pending}</p>
                  <p className="text-sm text-yellow-600">Pending</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-700">{recommendationStats.viewed}</p>
                  <p className="text-sm text-blue-600">Viewed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-amber-600" />
                  Top Cities
                </CardTitle>
                <CardDescription>Most common applicant locations</CardDescription>
              </CardHeader>
              <CardContent>
                {topCities.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No city data available</p>
                ) : (
                  <div className="space-y-3">
                    {topCities.map((city, index) => (
                      <div key={city.city} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant={index < 3 ? "default" : "secondary"} className="w-6 justify-center">
                            {index + 1}
                          </Badge>
                          <span className="text-sm">{city.city}</span>
                        </div>
                        <span className="text-sm font-medium">{city.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-amber-600" />
                  Top Colleges
                </CardTitle>
                <CardDescription>Most common educational institutions</CardDescription>
              </CardHeader>
              <CardContent>
                {topColleges.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No college data available</p>
                ) : (
                  <div className="space-y-3">
                    {topColleges.map((college, index) => (
                      <div key={college.college} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant={index < 3 ? "default" : "secondary"} className="w-6 justify-center">
                            {index + 1}
                          </Badge>
                          <span className="text-sm truncate max-w-[200px]">{college.college}</span>
                        </div>
                        <span className="text-sm font-medium">{college.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Statistics</CardTitle>
              <CardDescription>Breakdown of system users by role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-gray-900">{userStats.totalUsers}</p>
                  <p className="text-sm text-gray-600">Total Users</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-700">{userStats.applicants}</p>
                  <p className="text-sm text-blue-600">Applicants</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <p className="text-3xl font-bold text-amber-700">{userStats.committee}</p>
                  <p className="text-sm text-amber-600">Committee</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-700">{userStats.admins}</p>
                  <p className="text-sm text-purple-600">Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="committee" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Committee Evaluation Progress</CardTitle>
              <CardDescription>Tracking evaluator completion rates</CardDescription>
            </CardHeader>
            <CardContent>
              {evaluationProgress.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MailWarning className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>No committee members found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {evaluationProgress.map((member) => (
                    <div key={member.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{member.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {member.completed} of {member.total} ({member.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            member.percentage >= 80 ? "bg-green-500" :
                            member.percentage >= 50 ? "bg-amber-500" : "bg-red-500"
                          }`}
                          style={{ width: `${member.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evaluation Summary</CardTitle>
              <CardDescription>Overall evaluation statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-gray-900">{summary.totalEvaluations}</p>
                  <p className="text-sm text-gray-600">Total Evaluations</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <p className="text-3xl font-bold text-amber-700">{summary.totalRecommendations}</p>
                  <p className="text-sm text-amber-600">Total Recommendations</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-700">
                    {summary.submittedApplications > 0 
                      ? Math.round((summary.totalEvaluations / summary.submittedApplications) * 10) / 10
                      : 0}
                  </p>
                  <p className="text-sm text-green-600">Avg Evals per App</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "#6b7280",
    in_progress: "#9ca3af",
    pending_recommendations: "#f59e0b",
    submitted: "#3b82f6",
    under_review: "#6366f1",
    finalist: "#8b5cf6",
    selected: "#22c55e",
    not_selected: "#ef4444",
    withdrawn: "#78716c",
  };
  return colors[status] || "#6b7280";
}
