"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Trophy,
  Users,
  ClipboardCheck,
  TrendingUp,
  Star,
  CheckCircle2,
  Lock,
  Loader2,
} from "lucide-react";
import {
  ratingLabels,
  ratingEmojis,
  ratingColors,
  ratingPoints,
} from "@/convex/evaluations";
import Link from "next/link";

export default function ResultsPage() {
  const data = useQuery(api.evaluations.getRankings);
  const user = useQuery(api.users.getCurrentUser);
  const myMembership = useQuery(api.committeeMembers.getMyMembership);
  const maxSetting = useQuery(api.settings.get, { key: "max_scholarship_recipients" });
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(
    new Set()
  );
  const [isFinalizing, setIsFinalizing] = useState(false);
  const finalizeSelection = useMutation(api.admin.finalizeSelection);

  const isAdmin = user?.role === "admin";
  const isChair = myMembership?.isChairman === true;
  const canFinalize = isAdmin || isChair;
  const maxRecipients = maxSetting?.value ? parseInt(maxSetting.value) : 2;

  if (data === undefined || user === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-lg">Loading rankings...</div>
      </div>
    );
  }

  const { rankings, committeeMembers, totalApplications, totalEvaluations } = data;

  // Calculate progress
  const totalPossibleEvaluations = totalApplications * committeeMembers.length;
  const progressPercentage =
    totalPossibleEvaluations > 0
      ? Math.round((totalEvaluations / totalPossibleEvaluations) * 100)
      : 0;

  // Toggle recipient selection (admin or committee chair only)
  const toggleRecipient = (applicationId: string) => {
    if (!canFinalize) return;

    const newSelected = new Set(selectedRecipients);
    if (newSelected.has(applicationId)) {
      newSelected.delete(applicationId);
    } else {
      if (newSelected.size < maxRecipients) {
        newSelected.add(applicationId);
      }
    }
    setSelectedRecipients(newSelected);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Results & Rankings
          </h1>
          <p className="text-muted-foreground mt-1">
            Committee evaluation results and candidate rankings
          </p>
        </div>
        {canFinalize && (
          <Badge className="bg-purple-100 text-purple-800 px-3 py-1">
            <Lock className="h-3 w-3 mr-1" />
            {isAdmin ? "Admin" : "Chair"} Access
          </Badge>
        )}
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">
                Evaluation Progress
              </h3>
              <p className="text-sm text-muted-foreground">
                {totalEvaluations} of {totalPossibleEvaluations} evaluations
                completed across {committeeMembers.length} committee members
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-primary">
                {progressPercentage}%
              </span>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalApplications}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Evaluations</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalEvaluations}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <ClipboardCheck className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Committee Members</p>
                <p className="text-2xl font-bold text-foreground">
                  {committeeMembers.length}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg per Candidate</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalApplications > 0
                    ? (totalEvaluations / totalApplications).toFixed(1)
                    : "0"}
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rankings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary/80" />
            Candidate Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Avg Rating</TableHead>
                  <TableHead># Evals</TableHead>
                  {committeeMembers.map((member) => (
                    <TableHead key={member._id} className="text-center">
                      <span className="text-xs">
                        {member.name?.split(" ")[0] || "Member"}
                      </span>
                    </TableHead>
                  ))}
                  {canFinalize && (
                    <TableHead className="text-center">Select</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankings.map((ranking, index) => {
                  const app = ranking.application;
                  const avgRating = ranking.averageRating;

                  // Build evaluation map by committee member
                  const evalMap = new Map();
                  ranking.evaluations.forEach((e: any) => {
                    evalMap.set(e.evaluatorId, e);
                  });

                  return (
                    <TableRow key={app._id}>
                      <TableCell>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                            index < 3
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-foreground/80"
                          }`}
                        >
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <Link
                            href={`/committee/candidates/${app._id}`}
                            className="font-medium text-foreground hover:text-primary"
                          >
                            {app.firstName} {app.lastName}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {app.collegeName}
                            {app.major && ` • ${app.major}`}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-primary/80 fill-primary/80" />
                          <span className="font-semibold">
                            {avgRating.toFixed(2)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            / 5.0
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {ranking.evaluationCount}
                        </Badge>
                      </TableCell>
                      {committeeMembers.map((member) => {
                        const evalData = evalMap.get(member._id);
                        return (
                          <TableCell key={member._id} className="text-center">
                            {evalData ? (
                              <span
                                className="text-lg"
                                title={
                                  ratingLabels[
                                    evalData.rating as keyof typeof ratingLabels
                                  ]
                                }
                              >
                                {
                                  ratingEmojis[
                                    evalData.rating as keyof typeof ratingEmojis
                                  ]
                                }
                              </span>
                            ) : (
                              <span className="text-muted-foreground/50">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                      {canFinalize && (
                        <TableCell className="text-center">
                          <Checkbox
                            checked={selectedRecipients.has(app._id)}
                            onCheckedChange={() => toggleRecipient(app._id)}
                            disabled={
                              !selectedRecipients.has(app._id) &&
                              selectedRecipients.size >= maxRecipients
                            }
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium text-foreground/80 mb-2">
              Rating Legend
            </h4>
            <div className="flex flex-wrap gap-4">
              {Object.entries(ratingEmojis).map(([key, emoji]) => (
                <div key={key} className="flex items-center gap-1 text-sm">
                  <span>{emoji}</span>
                  <span className="text-muted-foreground">
                    {ratingLabels[key as keyof typeof ratingLabels]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selection Panel (admin or committee chair) */}
      {canFinalize && (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <CheckCircle2 className="h-5 w-5" />
              Final Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-800 mb-4">
              Select {maxRecipients} scholarship recipient{maxRecipients === 1 ? "" : "s"}. Current selection: {" "}
              <strong>
                {selectedRecipients.size}/{maxRecipients}
              </strong>
            </p>

            {selectedRecipients.size > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-purple-900 mb-2">
                  Selected Recipients:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedRecipients).map((id) => {
                    const recipient = rankings.find(
                      (r) => r.application._id === id
                    );
                    return recipient ? (
                      <Badge
                        key={id}
                        className="bg-purple-100 text-purple-800"
                      >
                        {recipient.application.firstName}{" "}
                        {recipient.application.lastName}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={selectedRecipients.size !== maxRecipients || isFinalizing}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isFinalizing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Confirm Selection
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Final Selection</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will mark the selected candidates as scholarship recipients and notify all applicants. This action cannot be easily undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={async () => {
                    setIsFinalizing(true);
                    try {
                      await finalizeSelection({
                        selectedIds: Array.from(selectedRecipients) as any[],
                      });
                      toast.success("Selection finalized successfully!");
                    } catch (error) {
                      toast.error("Failed to finalize selection");
                    } finally {
                      setIsFinalizing(false);
                    }
                  }}>
                    Confirm & Notify
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {selectedRecipients.size !== maxRecipients && (
              <p className="text-sm text-purple-600 mt-2">
                Please select exactly {maxRecipients} recipient{maxRecipients === 1 ? "" : "s"} to confirm.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
