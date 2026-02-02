"use client";

import Link from "next/link";
import { GraduationCap, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <title>Error - Stark Scholars</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f9fafb;
            color: #111827;
            line-height: 1.5;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          .header {
            border-bottom: 1px solid #e5e7eb;
            background-color: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(8px);
            position: sticky;
            top: 0;
            z-index: 50;
          }
          .header-content {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 1rem;
            height: 4rem;
            display: flex;
            align-items: center;
          }
          .brand {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            text-decoration: none;
            color: inherit;
          }
          .brand-icon {
            width: 2rem;
            height: 2rem;
            background-color: #d97706;
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .brand-text {
            font-size: 1.125rem;
            font-weight: 600;
            color: #111827;
          }
          .main {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 3rem 1rem;
          }
          .container {
            max-width: 42rem;
            text-align: center;
          }
          .error-icon {
            width: 6rem;
            height: 6rem;
            background-color: #fef3c7;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 2rem;
          }
          .error-icon svg {
            width: 3rem;
            height: 3rem;
            color: #d97706;
          }
          h1 {
            font-size: 1.875rem;
            font-weight: 700;
            color: #111827;
            margin-bottom: 1rem;
          }
          @media (min-width: 640px) {
            h1 {
              font-size: 2.25rem;
            }
          }
          p {
            font-size: 1.125rem;
            color: #4b5563;
            margin-bottom: 2rem;
          }
          .buttons {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            align-items: center;
          }
          @media (min-width: 640px) {
            .buttons {
              flex-direction: row;
              justify-content: center;
            }
          }
          .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 2rem;
            font-size: 1rem;
            font-weight: 500;
            text-decoration: none;
            border-radius: 0.5rem;
            cursor: pointer;
            border: none;
            transition: background-color 0.2s;
          }
          .btn-primary {
            background-color: #d97706;
            color: white;
            width: 100%;
          }
          @media (min-width: 640px) {
            .btn-primary {
              width: auto;
            }
          }
          .btn-primary:hover {
            background-color: #b45309;
          }
          .btn-secondary {
            background-color: transparent;
            color: #374151;
            border: 1px solid #d1d5db;
            width: 100%;
          }
          @media (min-width: 640px) {
            .btn-secondary {
              width: auto;
            }
          }
          .btn-secondary:hover {
            background-color: #f9fafb;
          }
          .footer {
            border-top: 1px solid #e5e7eb;
            background-color: white;
            padding: 1.5rem 1rem;
            text-align: center;
          }
          .footer-text {
            font-size: 0.875rem;
            color: #6b7280;
          }
          .error-details {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 0.5rem;
            padding: 1rem;
            margin-bottom: 2rem;
            text-align: left;
          }
          .error-details p {
            font-size: 0.875rem;
            margin: 0;
            color: #dc2626;
            font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
            word-break: break-all;
          }
        `}</style>
      </head>
      <body>
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <Link href="/" className="brand">
              <div className="brand-icon">
                <GraduationCap size={20} color="white" />
              </div>
              <span className="brand-text">Stark Scholars</span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="main">
          <div className="container">
            {/* Error Icon */}
            <div className="error-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>

            {/* Heading */}
            <h1>Critical Error</h1>

            {/* Message */}
            <p>
              We&apos;re experiencing a technical issue. Please refresh the page or try again later.
            </p>

            {/* Error Details (development only) */}
            {process.env.NODE_ENV === "development" && (
              <div className="error-details">
                <p>Error: {error.message || "Unknown error"}</p>
                {error.digest && <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#991b1b" }}>ID: {error.digest}</p>}
              </div>
            )}

            {/* Action Buttons */}
            <div className="buttons">
              <button onClick={reset} className="btn btn-primary">
                <RefreshCw size={18} />
                Refresh Page
              </button>
              <Link href="/" className="btn btn-secondary">
                <Home size={18} />
                Return Home
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="footer">
          <p className="footer-text">
            © {new Date().getFullYear()} Stark Scholars Platform. All rights reserved.
          </p>
        </footer>
      </body>
    </html>
  );
}
