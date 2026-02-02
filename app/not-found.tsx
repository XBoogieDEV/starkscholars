"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { GraduationCap, Home, Mail, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { heroTextContainer, heroTextItem } from "@/lib/motion";

export default function NotFoundPage() {
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
          {/* 404 Display */}
          <motion.div
            variants={shouldReduceMotion ? {} : heroTextItem}
            className="relative mb-8"
          >
            <div className="text-8xl sm:text-9xl font-bold text-amber-200 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-amber-100">
                <Search className="h-10 w-10 sm:h-12 sm:w-12 text-amber-600" />
              </div>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={shouldReduceMotion ? {} : heroTextItem}
            className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl"
          >
            Page Not Found
          </motion.h1>

          {/* Message */}
          <motion.p
            variants={shouldReduceMotion ? {} : heroTextItem}
            className="mb-8 text-lg text-gray-600"
          >
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            variants={shouldReduceMotion ? {} : heroTextItem}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              asChild
              size="lg"
              className="h-12 w-full sm:w-auto bg-amber-600 px-8 text-base hover:bg-amber-700"
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 w-full sm:w-auto px-8 text-base border-gray-300 hover:bg-gray-50"
            >
              <Link href="mailto:blackgoldmine@sbcglobal.net">
                <Mail className="mr-2 h-4 w-4" />
                Contact Support
              </Link>
            </Button>
          </motion.div>

          {/* Additional Help */}
          <motion.div
            variants={shouldReduceMotion ? {} : heroTextItem}
            className="mt-12 p-6 rounded-lg bg-white border border-gray-200"
          >
            <h2 className="mb-2 text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Looking for something else?
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Try these popular pages:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                href="/"
                className="text-sm text-amber-600 hover:text-amber-700 hover:underline"
              >
                Home
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/login"
                className="text-sm text-amber-600 hover:text-amber-700 hover:underline"
              >
                Sign In
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/register"
                className="text-sm text-amber-600 hover:text-amber-700 hover:underline"
              >
                Apply Now
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/terms"
                className="text-sm text-amber-600 hover:text-amber-700 hover:underline"
              >
                Terms of Service
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/privacy"
                className="text-sm text-amber-600 hover:text-amber-700 hover:underline"
              >
                Privacy Policy
              </Link>
            </div>
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
