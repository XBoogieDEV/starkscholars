"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AdminLayoutClient from "./layout.client";

export default function AdminLayout({
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
      router.push("/login?redirect=/admin");
      return;
    }

    if (!isAuthLoading && isAuthenticated && user === null) {
      if (syncWaitTime < SYNC_GRACE_PERIOD_MS) {
        const timeout = setTimeout(() => {
          setSyncWaitTime((prev) => prev + 500);
        }, 500);
        return () => clearTimeout(timeout);
      } else {
        router.push("/login?redirect=/admin");
      }
    }

    if (user && user.role !== "admin") {
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

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <AdminLayoutClient user={{ name: user.name, email: user.email, role: user.role ?? "admin" }}>
      {children}
    </AdminLayoutClient>
  );
}
