"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Award, Users, Star, CheckCircle2, Trophy, Loader2, Send,
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export default function SelectionPage() {
  const rankings = useQuery(api.evaluations.getRankings);
  const maxRecipientsSetting = useQuery(api.settings.get, { key: "max_scholarship_recipients" });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [result, setResult] = useState<{ selectedCount: number; notSelectedCount: number } | null>(null);

  const finalizeSelection = useMutation(api.admin.finalizeSelection);
  const sendNotification = useAction(api.emails.sendSelectionNotification);

  const maxRecipients = maxRecipientsSetting?.value ? parseInt(maxRecipientsSetting.value) : 2;

  const toggleRecipient = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else if (newSelected.size < maxRecipients) {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleFinalize = async () => {
    setIsFinalizing(true);
    try {
      const ids = Array.from(selectedIds) as Id<"applications">[];
      const res = await finalizeSelection({ selectedIds: ids });
      setResult(res);
      setIsFinalized(true);
      toast.success(`Selection finalized! ${res.selectedCount} selected, ${res.notSelectedCount} not selected.`);

      // Send notification emails
      if (rankings) {
        for (const ranking of rankings.rankings) {
          const isSelected = selectedIds.has(ranking.application._id);
          if (isSelected || ranking.application.status === "submitted" || ranking.application.status === "under_review" || ranking.application.status === "finalist") {
            try {
              await sendNotification({
                applicationId: ranking.application._id as Id<"applications">,
                isSelected,
              });
            } catch (e) {
              console.error(`Failed to send notification for ${ranking.application._id}:`, e);
            }
          }
        }
        toast.success("Notification emails sent!");
      }
    } catch (error) {
      toast.error("Failed to finalize selection");
      console.error(error);
    } finally {
      setIsFinalizing(false);
    }
  };

  if (rankings === undefined) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Selection</h2>
          <p className="text-muted-foreground">Select scholarship recipients</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <Skeleton className="h-8 w-48" />
        </div>
      </div>
    );
  }

  const { rankings: rankedApps, totalApplications, totalEvaluations, committeeMembers } = rankings;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Selection</h2>
        <p className="text-muted-foreground">
          Review rankings and select scholarship recipients
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Candidates</p>
                <p className="text-2xl font-bold">{totalApplications}</p>
              </div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Evaluations</p>
                <p className="text-2xl font-bold">{totalEvaluations}</p>
              </div>
              <Star className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Selected</p>
                <p className="text-2xl font-bold">{selectedIds.size} / {maxRecipients}</p>
              </div>
              <Award className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Post-finalization summary */}
      {isFinalized && result && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">Selection Finalized</h3>
                <p className="text-sm text-green-700">
                  {result.selectedCount} recipient(s) selected. {result.notSelectedCount} applicant(s) marked as not selected. Notification emails have been queued.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rankings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary/80" />
            Candidate Rankings
          </CardTitle>
          <CardDescription>
            Select up to {maxRecipients} recipients based on committee evaluations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Select</TableHead>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>Candidate</TableHead>
                  <TableHead>College</TableHead>
                  <TableHead>GPA</TableHead>
                  <TableHead>Avg Rating</TableHead>
                  <TableHead># Evals</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankedApps.map((ranking, index) => {
                  const app = ranking.application;
                  return (
                    <TableRow key={app._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(app._id)}
                          onCheckedChange={() => toggleRecipient(app._id)}
                          disabled={
                            isFinalized ||
                            (!selectedIds.has(app._id) && selectedIds.size >= maxRecipients)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          index < 3 ? "bg-primary/10 text-primary" : "bg-muted text-foreground/80"
                        }`}>
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {app.firstName} {app.lastName}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{app.collegeName || "N/A"}</p>
                          {app.major && <p className="text-xs text-muted-foreground">{app.major}</p>}
                        </div>
                      </TableCell>
                      <TableCell>{app.gpa?.toFixed(2) || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-primary/80 fill-primary/80" />
                          {ranking.averageRating.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>{ranking.evaluationCount}</TableCell>
                      <TableCell>
                        <Badge variant={app.status === "selected" ? "default" : app.status === "not_selected" ? "destructive" : "secondary"}>
                          {app.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Finalize Panel */}
      {!isFinalized && (
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Finalize Selection</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedIds.size === maxRecipients
                    ? "Ready to finalize. This will notify all applicants."
                    : `Select ${maxRecipients - selectedIds.size} more recipient(s) to continue.`}
                </p>
                {selectedIds.size > 0 && (
                  <div className="flex gap-2 mt-2">
                    {Array.from(selectedIds).map(id => {
                      const r = rankedApps.find(r => r.application._id === id);
                      return r ? (
                        <Badge key={id} variant="secondary">
                          {r.application.firstName} {r.application.lastName}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={selectedIds.size !== maxRecipients || isFinalizing}
                  >
                    {isFinalizing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Finalize & Notify
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Selection</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will mark {maxRecipients} applicant(s) as selected and all other submitted applicants as not selected. Notification emails will be sent to all applicants. This action cannot be easily undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleFinalize}>
                      Confirm & Send Notifications
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
