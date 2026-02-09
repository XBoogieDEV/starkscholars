"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ratingLabels,
  ratingEmojis,
  ratingColors,
} from "@/convex/evaluations";
import {
  ClipboardCheck,
  Calendar,
  ArrowRight,
  GraduationCap,
  Star,
} from "lucide-react";

export default function MyEvaluationsPage() {
  const evaluations = useQuery(api.evaluations.getMyEvaluationsWithDetails);

  if (evaluations === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-lg">Loading evaluations...</div>
      </div>
    );
  }

  // Sort by most recent first
  const sortedEvaluations = [...evaluations].sort(
    (a, b) => b.updatedAt - a.updatedAt
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Evaluations</h1>
          <p className="text-muted-foreground mt-1">
            Review and update your candidate evaluations
          </p>
        </div>
        <Link href="/committee/candidates">
          <Button className="bg-primary hover:bg-primary/90">
            Evaluate More
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Evaluations</p>
            <p className="text-2xl font-bold text-foreground">
              {sortedEvaluations.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Strong Yes</p>
            <p className="text-2xl font-bold text-green-600">
              {sortedEvaluations.filter((e) => e.rating === "strong_yes").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Yes</p>
            <p className="text-2xl font-bold text-emerald-600">
              {sortedEvaluations.filter((e) => e.rating === "yes").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Maybe / No</p>
            <p className="text-2xl font-bold text-primary">
              {sortedEvaluations.filter((e) =>
                ["maybe", "no", "strong_no"].includes(e.rating)
              ).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Evaluations List */}
      {sortedEvaluations.length > 0 ? (
        <div className="space-y-4">
          {sortedEvaluations.map((evaluation) => {
            const app = evaluation.application;
            const rating = evaluation.rating as keyof typeof ratingLabels;
            const evaluatedDate = new Date(evaluation.updatedAt).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "short",
                day: "numeric",
              }
            );

            const initials = `${app?.firstName?.[0] || ""}${
              app?.lastName?.[0] || ""
            }`.toUpperCase();

            return (
              <Card key={evaluation._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {app?.firstName} {app?.lastName}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            {app?.collegeName && (
                              <span className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3" />
                                {app.collegeName}
                              </span>
                            )}
                            {app?.gpa && (
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                GPA: {app.gpa.toFixed(2)}
                              </span>
                            )}
                          </div>
                          {evaluation.notes && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              &quot;{evaluation.notes}&quot;
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Evaluated on {evaluatedDate}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <Badge className={ratingColors[rating]}>
                            {ratingEmojis[rating]} {ratingLabels[rating]}
                          </Badge>
                          <Link
                            href={`/committee/candidates/${app?._id}`}
                          >
                            <Button variant="outline" size="sm">
                              View / Update
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Evaluations Yet
            </h3>
            <p className="text-muted-foreground mb-6">
              You haven&apos;t evaluated any candidates yet. Start reviewing
              applications to help select scholarship recipients.
            </p>
            <Link href="/committee/candidates">
              <Button className="bg-primary hover:bg-primary/90">
                Start Evaluating
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
