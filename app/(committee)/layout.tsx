"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CommitteeSidebar } from "@/components/committee/committee-sidebar";
import { CommitteeHeader } from "@/components/committee/committee-header";
import { motion, useReducedMotion } from "framer-motion";
import { pageTransition } from "@/lib/motion";

export default function CommitteeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useQuery(api.users.getCurrentUser);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (user === null) {
      router.push("/login?redirect=/committee");
    } else if (user && user.role !== "committee" && user.role !== "admin") {
      router.push("/apply/dashboard");
    }
  }, [user, router]);

  if (user === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || (user.role !== "committee" && user.role !== "admin")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CommitteeHeader user={user} />
      <div className="flex">
        <CommitteeSidebar userRole={user.role} />
        <motion.main
          initial={shouldReduceMotion ? {} : "initial"}
          animate="animate"
          exit="exit"
          variants={pageTransition}
          className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
