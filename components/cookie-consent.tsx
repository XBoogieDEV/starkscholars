"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "stark-scholars-cookie-consent";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!hasConsented) {
      // Small delay to show banner after page load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    setIsVisible(false);
  };

  const handleDismiss = () => {
    // Just hide without storing - will show again on next visit
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 100 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 100 }}
          transition={{ 
            duration: shouldReduceMotion ? 0.1 : 0.3, 
            ease: [0.33, 1, 0.68, 1] 
          }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
        >
          <div className="mx-auto max-w-4xl">
            <div className="rounded-lg border border-amber-200 bg-white shadow-lg">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Icon and Content */}
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                      <Cookie className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 text-sm font-semibold text-gray-900 sm:text-base">
                        We value your privacy
                      </h3>
                      <p className="text-xs text-gray-600 sm:text-sm">
                        We use essential cookies to make our platform work. 
                        These cookies are necessary for security, authentication, 
                        and basic functionality. By continuing to use our site, 
                        you accept our use of essential cookies.
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                        <Link 
                          href="/cookie-policy"
                          className="text-xs font-medium text-amber-600 hover:text-amber-700 hover:underline sm:text-sm"
                        >
                          Learn More
                        </Link>
                        <Link 
                          href="/privacy"
                          className="text-xs text-gray-500 hover:text-gray-700 hover:underline sm:text-sm"
                        >
                          Privacy Policy
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    <Button
                      onClick={handleAccept}
                      size="sm"
                      className="bg-amber-600 text-white hover:bg-amber-700"
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={handleDismiss}
                      variant="ghost"
                      size="sm"
                      className="h-auto p-2 text-gray-400 hover:text-gray-600 sm:absolute sm:right-2 sm:top-2"
                      aria-label="Dismiss cookie notice"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to check if user has consented to cookies
export function useCookieConsent(): boolean {
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    setHasConsented(consent === "true");
  }, []);

  return hasConsented;
}

// Utility to set cookie consent programmatically
export function setCookieConsent(consented: boolean): void {
  if (consented) {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
  } else {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
  }
}

// Utility to clear cookie consent (for testing or user preferences)
export function clearCookieConsent(): void {
  localStorage.removeItem(COOKIE_CONSENT_KEY);
}
