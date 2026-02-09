"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Scale } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

function CompareRow({ label, left, right }: { label: string; left?: string | number | null; right?: string | number | null }) {
  const leftStr = left?.toString() || "N/A";
  const rightStr = right?.toString() || "N/A";
  const isDiff = leftStr !== rightStr;

  return (
    <div className={`grid grid-cols-3 py-2 px-3 rounded ${isDiff ? "bg-primary/5" : ""}`}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{leftStr}</span>
      <span className="text-sm font-medium">{rightStr}</span>
    </div>
  );
}

function CompareGPA({ label, left, right }: { label: string; left?: number; right?: number }) {
  const leftStr = left?.toFixed(2) || "N/A";
  const rightStr = right?.toFixed(2) || "N/A";
  const leftHigher = left && right && left > right;
  const rightHigher = left && right && right > left;

  return (
    <div className="grid grid-cols-3 py-2 px-3 rounded bg-primary/5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${leftHigher ? "text-green-600" : ""}`}>{leftStr}</span>
      <span className={`text-sm font-medium ${rightHigher ? "text-green-600" : ""}`}>{rightStr}</span>
    </div>
  );
}

export default function ComparePage() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids");
  const ids = idsParam?.split(",") || [];

  const data1 = useQuery(
    api.admin.getApplicationDetails,
    ids[0] ? { id: ids[0] as Id<"applications"> } : "skip"
  );
  const data2 = useQuery(
    api.admin.getApplicationDetails,
    ids[1] ? { id: ids[1] as Id<"applications"> } : "skip"
  );

  if (ids.length !== 2) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/applications"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h2 className="text-2xl font-bold">Compare Applications</h2>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Select exactly 2 applications to compare.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (data1 === undefined || data2 === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/applications"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h2 className="text-2xl font-bold">Compare Applications</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <Skeleton className="h-8 w-48" />
        </div>
      </div>
    );
  }

  const app1 = data1.application;
  const app2 = data2.application;

  // Calculate avg evaluation ratings
  const avgRating = (evaluations: Array<{ rating: string }>) => {
    if (evaluations.length === 0) return null;
    const points: Record<string, number> = { strong_yes: 5, yes: 4, maybe: 3, no: 2, strong_no: 1 };
    const total = evaluations.reduce((sum, e) => sum + (points[e.rating] || 0), 0);
    return (total / evaluations.length).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/applications"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Compare Applications</h2>
        </div>
      </div>

      {/* Name Header Row */}
      <div className="grid grid-cols-3 gap-4">
        <div />
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="font-semibold text-lg">{app1.firstName} {app1.lastName}</h3>
            <Badge variant="secondary">{app1.status.replace("_", " ")}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="font-semibold text-lg">{app2.firstName} {app2.lastName}</h3>
            <Badge variant="secondary">{app2.status.replace("_", " ")}</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Personal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <CompareRow label="City" left={app1.city} right={app2.city} />
          <CompareRow label="State" left={app1.state} right={app2.state} />
          <CompareRow label="Phone" left={app1.phone} right={app2.phone} />
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Education</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <CompareRow label="High School" left={app1.highSchoolName} right={app2.highSchoolName} />
          <CompareGPA label="GPA" left={app1.gpa} right={app2.gpa} />
          <CompareRow label="ACT" left={app1.actScore} right={app2.actScore} />
          <CompareRow label="SAT" left={app1.satScore} right={app2.satScore} />
          <CompareRow label="College" left={app1.collegeName} right={app2.collegeName} />
          <CompareRow label="Year" left={app1.yearInCollege} right={app2.yearInCollege} />
          <CompareRow label="Major" left={app1.major} right={app2.major} />
        </CardContent>
      </Card>

      {/* Evaluations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evaluations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <CompareRow label="# Evaluations" left={data1.evaluations.length} right={data2.evaluations.length} />
          <CompareRow label="Avg Rating" left={avgRating(data1.evaluations)} right={avgRating(data2.evaluations)} />
          <CompareRow label="# Recommendations" left={data1.recommendations.length} right={data2.recommendations.length} />
          <CompareRow
            label="Recs Received"
            left={data1.recommendations.filter(r => r.status === "submitted").length}
            right={data2.recommendations.filter(r => r.status === "submitted").length}
          />
        </CardContent>
      </Card>

      {/* Eligibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Eligibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <CompareRow label="First Time" left={app1.isFirstTimeApplying ? "Yes" : "No"} right={app2.isFirstTimeApplying ? "Yes" : "No"} />
          <CompareRow label="Full Time Student" left={app1.isFullTimeStudent ? "Yes" : "No"} right={app2.isFullTimeStudent ? "Yes" : "No"} />
          <CompareRow label="MI Resident" left={app1.isMichiganResident ? "Yes" : "No"} right={app2.isMichiganResident ? "Yes" : "No"} />
        </CardContent>
      </Card>
    </div>
  );
}
