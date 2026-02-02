"use client";

import { cn } from "@/lib/utils";

interface VisuallyHiddenProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * VisuallyHidden component hides content visually while keeping it
 * accessible to screen readers.
 * 
 * Usage:
 * <button>
 *   <VisuallyHidden>Close dialog</VisuallyHidden>
 *   <XIcon />
 * </button>
 */
export function VisuallyHidden({ children, className }: VisuallyHiddenProps) {
  return (
    <span
      className={cn(
        "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0",
        className
      )}
      style={{
        clipPath: "inset(50%)",
      }}
    >
      {children}
    </span>
  );
}

/**
 * SkipLink component provides a skip-to-content link for keyboard navigation
 */
interface SkipLinkProps {
  href: string;
  children?: React.ReactNode;
}

export function SkipLink({ href, children = "Skip to main content" }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50",
        "focus:px-4 focus:py-2 focus:bg-amber-600 focus:text-white focus:rounded-md",
        "focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
      )}
    >
      {children}
    </a>
  );
}
