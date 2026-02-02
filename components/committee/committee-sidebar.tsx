"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Trophy,
  Settings,
} from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/motion";

interface CommitteeSidebarProps {
  userRole: string;
  onNavigate?: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/committee", icon: LayoutDashboard },
  { name: "Candidates", href: "/committee/candidates", icon: Users },
  { name: "My Evaluations", href: "/committee/my-evaluations", icon: ClipboardCheck },
  { name: "Results", href: "/committee/results", icon: Trophy },
];

const adminNavigation = [
  { name: "Settings", href: "/committee/settings", icon: Settings },
];

export function CommitteeSidebar({ userRole, onNavigate }: CommitteeSidebarProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  const navItems = userRole === "admin" 
    ? [...navigation, ...adminNavigation]
    : navigation;

  return (
    <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-1">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <motion.div
              key={item.name}
              initial={shouldReduceMotion ? {} : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[40px]",
                  isActive
                    ? "bg-amber-50 text-amber-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-amber-600" : "text-gray-400")} />
                {item.name}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p className="font-medium">Evaluation Period</p>
          <p>Open until April 30, 2026</p>
        </div>
      </div>
    </aside>
  );
}

// Mobile navigation component
interface MobileCommitteeNavProps {
  userRole: string;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileCommitteeNav({ userRole, isOpen, onClose }: MobileCommitteeNavProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  const navItems = userRole === "admin" 
    ? [...navigation, ...adminNavigation]
    : navigation;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, x: "-100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={shouldReduceMotion ? {} : { opacity: 0, x: "-100%" }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-40 lg:hidden"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.nav
        initial={shouldReduceMotion ? {} : { x: "-100%" }}
        animate={{ x: 0 }}
        exit={shouldReduceMotion ? {} : { x: "-100%" }}
        transition={{ type: "tween", duration: 0.2 }}
        className="absolute left-0 top-0 h-full w-72 bg-white border-r border-gray-200 shadow-xl"
      >
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
        </div>
        <div className="p-4 space-y-1">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <motion.div
                key={item.name}
                initial={shouldReduceMotion ? {} : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors min-h-[44px]",
                    isActive
                      ? "bg-amber-50 text-amber-700"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-amber-600" : "text-gray-400")} />
                  {item.name}
                </Link>
              </motion.div>
            );
          })}
        </div>
        <div className="absolute bottom-0 w-72 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <p className="font-medium">Evaluation Period</p>
            <p>Open until April 30, 2026</p>
          </div>
        </div>
      </motion.nav>
    </motion.div>
  );
}
