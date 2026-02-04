"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppHeader } from "@/components/apply/app-header";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { XCircle, AlertTriangle, Clock } from "lucide-react";

function DeadlineBanner() {
  const deadline = useQuery(api.settings.getDeadline);
  const isDeadlinePassed = useQuery(api.settings.isDeadlinePassed);

  if (deadline === undefined || isDeadlinePassed === undefined) return null;

  const daysRemaining = Math.max(0, Math.ceil((deadline - Date.now()) / (1000 * 60 * 60 * 24)));
  const isPassed = isDeadlinePassed;
  const isUrgent = daysRemaining <= 7 && daysRemaining > 0;

  if (isPassed) {
    return (
      <Alert variant="destructive" className="rounded-none border-x-0 border-t-0 border-red-500 bg-red-50 py-2">
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-900 text-sm font-semibold">
          Applications Closed
        </AlertTitle>
        <AlertDescription className="text-red-700 text-xs">
          The application deadline has passed (April 15, 2026). You can no longer submit or edit your application.
        </AlertDescription>
      </Alert>
    );
  }

  if (isUrgent) {
    return (
      <Alert className="rounded-none border-x-0 border-t-0 border-amber-500 bg-amber-50 py-2">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-900 text-sm font-semibold">
          Deadline Approaching
        </AlertTitle>
        <AlertDescription className="text-amber-700 text-xs">
          Only {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining until April 15, 2026 deadline.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useQuery(api.users.getCurrentUser);
  const application = useQuery(api.applications.getMyApplication);

  useEffect(() => {
    if (user === null) {
      router.push("/login?redirect=/apply");
    }
  }, [user, router]);

  if (user === undefined || application === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <DeadlineBanner />
      <AppHeader user={{ ...user, role: user.role ?? "applicant" }} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
