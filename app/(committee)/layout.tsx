"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import CommitteeLayoutClient from "./layout.client";

const ALLOWED_ROLES = ["committee", "admin"];

export default function CommitteeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.getCurrentUser);
  const [syncWaitTime, setSyncWaitTime] = useState(0);
  const SYNC_GRACE_PERIOD_MS = 5000;

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login?redirect=/committee");
      return;
    }

    if (!isAuthLoading && isAuthenticated && user === null) {
      if (syncWaitTime < SYNC_GRACE_PERIOD_MS) {
        const timeout = setTimeout(() => {
          setSyncWaitTime((prev) => prev + 500);
        }, 500);
        return () => clearTimeout(timeout);
      } else {
        router.push("/login?redirect=/committee");
      }
    }

    if (user && !ALLOWED_ROLES.includes(user.role ?? "")) {
      router.push("/unauthorized");
    }
  }, [isAuthLoading, isAuthenticated, user, router, syncWaitTime]);

  const shouldShowLoading =
    isAuthLoading ||
    user === undefined ||
    (isAuthenticated && user === null && syncWaitTime < SYNC_GRACE_PERIOD_MS);

  if (shouldShowLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !ALLOWED_ROLES.includes(user.role ?? "")) {
    return null;
  }

  return (
    <CommitteeLayoutClient user={user}>
      {children}
    </CommitteeLayoutClient>
  );
}
