"use client";

import { cn } from "@/lib/utils";

interface LiveRegionProps {
  children: React.ReactNode;
  assertive?: boolean;
  className?: string;
  id?: string;
}

/**
 * LiveRegion component announces content changes to screen readers.
 * 
 * Use polite for non-critical updates (default).
 * Use assertive for important alerts that need immediate attention.
 * 
 * Usage:
 * <LiveRegion>
 *   {saveStatus && `Application saved at ${saveStatus}`}
 * </LiveRegion>
 */
export function LiveRegion({ 
  children, 
  assertive = false,
  className,
  id
}: LiveRegionProps) {
  return (
    <div 
      role={assertive ? "alert" : "status"}
      aria-live={assertive ? "assertive" : "polite"}
      aria-atomic="true"
      id={id}
      className={cn(
        "sr-only",
        className
      )}
    >
      {children}
    </div>
  );
}

interface AnnouncementProps {
  message: string;
  type?: "polite" | "assertive";
}

/**
 * Announcement component for dynamic status messages.
 * Mount this component when you need to announce something to screen readers.
 */
export function Announcement({ message, type = "polite" }: AnnouncementProps) {
  return (
    <div 
      role={type === "assertive" ? "alert" : "status"}
      aria-live={type}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
