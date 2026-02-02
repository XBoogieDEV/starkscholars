"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { GraduationCap, Home, Mail, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { heroTextContainer, heroTextItem } from "@/lib/motion";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-base sm:text-lg font-semibold text-gray-900 truncate">
              Stark Scholars
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          variants={shouldReduceMotion ? {} : heroTextContainer}
          initial="initial"
          animate="animate"
          className="mx-auto max-w-2xl text-center"
        >
          {/* Error Icon */}
          <motion.div
            variants={shouldReduceMotion ? {} : heroTextItem}
            className="mb-8"
          >
            <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-12 w-12 text-amber-600" />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={shouldReduceMotion ? {} : heroTextItem}
            className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl"
          >
            Something Went Wrong
          </motion.h1>

          {/* Message */}
          <motion.p
            variants={shouldReduceMotion ? {} : heroTextItem}
            className="mb-4 text-lg text-gray-600"
          >
            We&apos;re sorry, but something unexpected happened. Please try again.
          </motion.p>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === "development" && (
            <motion.div
              variants={shouldReduceMotion ? {} : heroTextItem}
              className="mb-8 p-4 rounded-lg bg-red-50 border border-red-200 text-left"
            >
              <p className="text-sm font-medium text-red-800 mb-1">Error Details:</p>
              <p className="text-sm text-red-600 font-mono break-all">
                {error.message || "Unknown error"}
              </p>
              {error.digest && (
                <p className="text-xs text-red-500 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            variants={shouldReduceMotion ? {} : heroTextItem}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              onClick={reset}
              size="lg"
              className="h-12 w-full sm:w-auto bg-amber-600 px-8 text-base hover:bg-amber-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 w-full sm:w-auto px-8 text-base border-gray-300 hover:bg-gray-50"
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Link>
            </Button>
          </motion.div>

          {/* Contact Support */}
          <motion.div
            variants={shouldReduceMotion ? {} : heroTextItem}
            className="mt-8 p-6 rounded-lg bg-white border border-gray-200"
          >
            <h2 className="mb-2 text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Problem persists?
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              If the problem continues, please contact our support team for assistance.
            </p>
            <Button
              asChild
              variant="ghost"
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            >
              <Link href="mailto:blackgoldmine@sbcglobal.net">
                <Mail className="mr-2 h-4 w-4" />
                Contact Support
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Stark Scholars Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
