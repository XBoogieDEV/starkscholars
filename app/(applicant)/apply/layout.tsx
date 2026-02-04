"use client"; \n\nimport { useEffect, useState, useMemo } from \"react\";\nimport { useRouter } from \"next/navigation\";\nimport { useQuery, useConvexAuth } from \"convex/react\";\nimport { api } from \"@/convex/_generated/api\";\nimport { AppHeader } from \"@/components/apply/app-header\";\nimport { Alert, AlertTitle, AlertDescription } from \"@/components/ui/alert\";\nimport { XCircle, AlertTriangle } from \"lucide-react\";\n\nfunction DeadlineBanner() {\n  const deadline = useQuery(api.settings.getDeadline);\n  const isDeadlinePassed = useQuery(api.settings.isDeadlinePassed);\n  const now = useMemo(() => Date.now(), []);\n\n  if (deadline === undefined || isDeadlinePassed === undefined) return null;\n\n  const daysRemaining = Math.max(0, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)));\n  const isPassed = isDeadlinePassed;\n  const isUrgent = daysRemaining <= 7 && daysRemaining > 0;

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
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.getCurrentUser);
  const application = useQuery(api.applications.getMyApplication);

  // Track how long we've been waiting for user sync (for grace period)
  const [syncWaitTime, setSyncWaitTime] = useState(0);
  const SYNC_GRACE_PERIOD_MS = 5000; // Wait up to 5 seconds for user sync


  useEffect(() => {
    // If authenticated but user is null, it might be syncing - wait with grace period
    if (!isAuthLoading && isAuthenticated && user === null) {

      if (syncWaitTime < SYNC_GRACE_PERIOD_MS) {
        const timeout = setTimeout(() => {
          setSyncWaitTime(prev => prev + 500);
        }, 500);
        return () => clearTimeout(timeout);
      } else {
        // Grace period expired, user truly doesn't exist
        router.push("/login?redirect=/apply");
      }
    }

    // Not authenticated at all - redirect immediately
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login?redirect=/apply");
    }
  }, [isAuthLoading, isAuthenticated, user, router, syncWaitTime]);

  // Show loading while auth is initializing OR queries are loading OR waiting for sync
  const shouldShowLoading = isAuthLoading || user === undefined || application === undefined ||
    (isAuthenticated && user === null && syncWaitTime < SYNC_GRACE_PERIOD_MS);

  console.log("[APPLY-LAYOUT] shouldShowLoading:", shouldShowLoading, {
    isAuthLoading,
    userUndefined: user === undefined,
    appUndefined: application === undefined,
    waitingForSync: isAuthenticated && user === null && syncWaitTime < SYNC_GRACE_PERIOD_MS
  });

  if (shouldShowLoading) {
    console.log("[APPLY-LAYOUT] Rendering Loading screen");
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    console.log("[APPLY-LAYOUT] User is falsy, returning null");
    return null;
  }

  console.log("[APPLY-LAYOUT] Rendering main content");

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
