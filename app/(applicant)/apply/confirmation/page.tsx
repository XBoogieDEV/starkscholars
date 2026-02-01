"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileText, Clock, Mail, ArrowRight } from "lucide-react";

export default function ConfirmationPage() {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <Card className="border-green-200">
        <CardContent className="p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Application Submitted!
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8">
            Thank you for applying to the William R. Stark Financial Assistance Program.
            Your application has been received and is now under review.
          </p>

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-lg p-6 text-left mb-8">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              What Happens Next?
            </h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>
                  The scholarship committee will review your application
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>
                  All committee members will evaluate your qualifications
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>
                  Selections will be announced after April 15, 2026
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>
                  You will receive an email notification of the decision
                </span>
              </li>
            </ul>
          </div>

          {/* Important Info */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span>
                A confirmation email has been sent to your registered email address
              </span>
            </div>
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
              <Clock className="mr-1 h-3 w-3" />
              Decisions by April 15, 2026
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline">
              <Link href="/apply/status">
                <FileText className="mr-2 h-4 w-4" />
                View Application Status
              </Link>
            </Button>
            <Button asChild className="bg-amber-600 hover:bg-amber-700">
              <Link href="/apply/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="text-center text-sm text-gray-500 mt-8">
        Questions? Contact the scholarship committee at{" "}
        <a
          href="mailto:blackgoldmine@sbcglobal.net"
          className="text-amber-600 hover:underline"
        >
          blackgoldmine@sbcglobal.net
        </a>
      </p>
    </div>
  );
}
