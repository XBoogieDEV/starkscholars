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
  Trophy,
  Users,
  ClipboardCheck,
  TrendingUp,
  Star,
  CheckCircle2,
  Lock,
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
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(
    new Set()
  );

  const isAdmin = user?.role === "admin";

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

  // Toggle recipient selection (admin only)
  const toggleRecipient = (applicationId: string) => {
    if (!isAdmin) return;

    const newSelected = new Set(selectedRecipients);
    if (newSelected.has(applicationId)) {
      newSelected.delete(applicationId);
    } else {
      if (newSelected.size < 2) {
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
          <h1 className="text-3xl font-bold text-gray-900">
            Results & Rankings
          </h1>
          <p className="text-gray-600 mt-1">
            Committee evaluation results and candidate rankings
          </p>
        </div>
        {isAdmin && (
          <Badge className="bg-purple-100 text-purple-800 px-3 py-1">
            <Lock className="h-3 w-3 mr-1" />
            Admin Access
          </Badge>
        )}
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">
                Evaluation Progress
              </h3>
              <p className="text-sm text-gray-600">
                {totalEvaluations} of {totalPossibleEvaluations} evaluations
                completed across {committeeMembers.length} committee members
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-amber-600">
                {progressPercentage}%
              </span>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-600 transition-all duration-500"
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
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">
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
                <p className="text-sm text-gray-600">Total Evaluations</p>
                <p className="text-2xl font-bold text-gray-900">
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
                <p className="text-sm text-gray-600">Committee Members</p>
                <p className="text-2xl font-bold text-gray-900">
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
                <p className="text-sm text-gray-600">Avg per Candidate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalApplications > 0
                    ? (totalEvaluations / totalApplications).toFixed(1)
                    : "0"}
                </p>
              </div>
              <div className="p-2 bg-amber-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rankings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
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
                  {isAdmin && (
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
                              ? "bg-amber-100 text-amber-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <Link
                            href={`/committee/candidates/${app._id}`}
                            className="font-medium text-gray-900 hover:text-amber-600"
                          >
                            {app.firstName} {app.lastName}
                          </Link>
                          <p className="text-xs text-gray-500">
                            {app.collegeName}
                            {app.major && ` • ${app.major}`}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          <span className="font-semibold">
                            {avgRating.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500">
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
                              <span className="text-gray-300">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                      {isAdmin && (
                        <TableCell className="text-center">
                          <Checkbox
                            checked={selectedRecipients.has(app._id)}
                            onCheckedChange={() => toggleRecipient(app._id)}
                            disabled={
                              !selectedRecipients.has(app._id) &&
                              selectedRecipients.size >= 2
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
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Rating Legend
            </h4>
            <div className="flex flex-wrap gap-4">
              {Object.entries(ratingEmojis).map(([key, emoji]) => (
                <div key={key} className="flex items-center gap-1 text-sm">
                  <span>{emoji}</span>
                  <span className="text-gray-600">
                    {ratingLabels[key as keyof typeof ratingLabels]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Selection Panel */}
      {isAdmin && (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <CheckCircle2 className="h-5 w-5" />
              Final Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-800 mb-4">
              Select 2 scholarship recipients. Current selection: {" "}
              <strong>
                {selectedRecipients.size}/2
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

            <Button
              disabled={selectedRecipients.size !== 2}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirm Selection
            </Button>

            {selectedRecipients.size !== 2 && (
              <p className="text-sm text-purple-600 mt-2">
                Please select exactly 2 recipients to confirm.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
