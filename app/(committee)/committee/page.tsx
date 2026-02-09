"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CandidateCard } from "@/components/committee/candidate-card";
import {
  Users,
  ClipboardCheck,
  Clock,
  Star,
  ArrowRight,
} from "lucide-react";

export default function CommitteeDashboardPage() {
  const user = useQuery(api.users.getCurrentUser);
  const stats = useQuery(api.evaluations.getEvaluationStats);
  const candidates = useQuery(api.evaluations.getCandidatesForEvaluation);

  if (stats === undefined || candidates === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  // Filter candidates that need evaluation (not yet evaluated by current user)
  const candidatesToReview = candidates
    .filter((c) => !c.myEvaluation)
    .slice(0, 4);

  // Get top candidates (already evaluated, sorted by average)
  const topCandidates = candidates
    .filter((c) => c.evaluationCount > 0)
    .sort((a, b) => (b.evaluationCount || 0) - (a.evaluationCount || 0))
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back{user?.name ? `, ${user.name}` : ""}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Thank you for serving on the <span className="font-serif">Stark Scholars</span> selection committee.
          </p>
        </div>
        <Link href="/committee/candidates">
          <Button className="bg-primary hover:bg-primary/90">
            Start Evaluating
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Applications
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {stats.totalApplications}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    My Evaluations
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {stats.myEvaluationsCompleted}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <ClipboardCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Remaining to Evaluate
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {stats.remainingToEvaluate}
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress Overview */}
      {stats && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Your Progress</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You&apos;ve evaluated {stats.myEvaluationsCompleted} of{" "}
                  {stats.totalApplications} applications
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-primary">
                  {stats.totalApplications > 0
                    ? Math.round(
                        (stats.myEvaluationsCompleted / stats.totalApplications) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{
                  width: `${
                    stats.totalApplications > 0
                      ? (stats.myEvaluationsCompleted / stats.totalApplications) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Candidates to Review */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            Candidates to Review
          </h2>
          <Link
            href="/committee/candidates"
            className="text-sm text-primary hover:text-primary/90 font-medium"
          >
            View All
          </Link>
        </div>

        {candidatesToReview.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {candidatesToReview.map((candidate) => (
              <CandidateCard
                key={candidate._id}
                candidate={candidate}
                showEvaluateButton
              />
            ))}
          </div>
        ) : (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">
                    All Caught Up!
                  </h3>
                  <p className="text-sm text-green-700">
                    You&apos;ve evaluated all available candidates. Check back later for
                    new applications.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Candidates Preview */}
      {topCandidates.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Top Candidates
            </h2>
            <Link
              href="/committee/results"
              className="text-sm text-primary hover:text-primary/90 font-medium"
            >
              View Rankings
            </Link>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {topCandidates.map((candidate, index) => (
                  <div
                    key={candidate._id}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {candidate.firstName} {candidate.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {candidate.collegeName} • {candidate.major}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {candidate.evaluationCount} evaluations
                        </p>
                        <p className="text-sm text-muted-foreground">
                          GPA: {candidate.gpa?.toFixed(2) || "N/A"}
                        </p>
                      </div>
                      <Link href={`/committee/candidates/${candidate._id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
