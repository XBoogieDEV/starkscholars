"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { tableRowAnimation } from "@/lib/motion";

// Wrapper for tables that adds horizontal scroll on mobile
interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className = "" }: ResponsiveTableProps) {
  return (
    <div className={`w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 ${className}`}>
      <div className="min-w-[640px]">{children}</div>
    </div>
  );
}

// Card-based mobile table alternative
interface MobileTableCardProps {
  children: ReactNode;
  index?: number;
}

export function MobileTableCard({ children, index = 0 }: MobileTableCardProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={tableRowAnimation}
      transition={{ delay: index * 0.05 }}
      className="bg-white border rounded-lg p-4 space-y-3 shadow-sm"
    >
      {children}
    </motion.div>
  );
}

// Mobile table row item
interface MobileTableRowProps {
  label: string;
  value: ReactNode;
  className?: string;
}

export function MobileTableRow({ label, value, className = "" }: MobileTableRowProps) {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

// Touch-friendly pagination controls
interface MobilePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  startIndex: number;
}

export function MobilePagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  startIndex,
}: MobilePaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t">
      <p className="text-sm text-muted-foreground order-2 sm:order-1">
        {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} of{" "}
        {totalItems}
      </p>
      <div className="flex items-center gap-2 order-1 sm:order-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="h-11 w-11 min-w-[44px] flex items-center justify-center rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed active:bg-gray-100 touch-manipulation"
          aria-label="Previous page"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <span className="text-sm min-w-[80px] text-center">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="h-11 w-11 min-w-[44px] flex items-center justify-center rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed active:bg-gray-100 touch-manipulation"
          aria-label="Next page"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Responsive table container that switches between table and cards
interface AdaptiveTableProps {
  headers: { key: string; label: string; className?: string }[];
  rows: Record<string, ReactNode>[];
  keyExtractor: (row: Record<string, ReactNode>, index: number) => string;
  renderMobileCard: (row: Record<string, ReactNode>, index: number) => ReactNode;
  isLoading?: boolean;
}

export function AdaptiveTable({
  headers,
  rows,
  keyExtractor,
  renderMobileCard,
  isLoading = false,
}: AdaptiveTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 sm:space-y-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-100 rounded-lg sm:rounded-none sm:h-12" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden sm:block rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50/50">
              {headers.map((header) => (
                <th
                  key={header.key}
                  className={`px-4 py-3 text-left text-sm font-medium text-gray-500 ${
                    header.className || ""
                  }`}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <motion.tr
                key={keyExtractor(row, index)}
                initial="initial"
                animate="animate"
                variants={tableRowAnimation}
                transition={{ delay: index * 0.03 }}
                className="border-b last:border-0 hover:bg-gray-50/50"
              >
                {headers.map((header) => (
                  <td key={header.key} className="px-4 py-3">
                    {row[header.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {rows.map((row, index) => (
          <MobileTableCard key={keyExtractor(row, index)} index={index}>
            {renderMobileCard(row, index)}
          </MobileTableCard>
        ))}
      </div>
    </>
  );
}
