"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { slideInLeft } from "@/lib/motion";

interface MobileNavProps {
  children: React.ReactNode;
  title?: string;
}

export function MobileNav({ children, title = "Menu" }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-11 w-11 touch-manipulation"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetTitle className="sr-only">{title}</SheetTitle>
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={slideInLeft}
          className="h-full"
        >
          {children}
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}

// Mobile navigation link with active state
interface MobileNavLinkProps {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

export function MobileNavLink({
  href,
  icon,
  children,
  isActive = false,
  onClick,
}: MobileNavLinkProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors min-h-[44px] ${
        isActive
          ? "bg-amber-50 text-amber-700"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {icon && <span className="h-5 w-5">{icon}</span>}
      {children}
    </a>
  );
}

// Mobile menu section divider
export function MobileNavSection({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-2">
      {title && (
        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </div>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
}
