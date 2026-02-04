"use client";

import { CommitteeSidebar } from "@/components/committee/committee-sidebar";
import { CommitteeHeader } from "@/components/committee/committee-header";
import { motion, useReducedMotion } from "framer-motion";
import { pageTransition } from "@/lib/motion";

interface CommitteeLayoutClientProps {
    children: React.ReactNode;
    user: any;
}

export default function CommitteeLayoutClient({
    children,
    user,
}: CommitteeLayoutClientProps) {
    const shouldReduceMotion = useReducedMotion();

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
