import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Home, Mail } from "lucide-react";

export const metadata = {
  title: "Unauthorized Access | Stark Scholars",
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
            <ShieldAlert className="h-10 w-10 text-red-600" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Unauthorized Access
        </h1>

        {/* Description */}
        <p className="text-muted-foreground mb-8">
          You don&apos;t have the necessary permissions to access this page. 
          This area is restricted to authorized users only.
        </p>

        {/* Action buttons */}
        <div className="space-y-3">
          <Button
            asChild
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Back Home
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full"
          >
            <Link href="mailto:scholarship@williamrstark.org">
              <Mail className="mr-2 h-4 w-4" />
              Contact Administrator
            </Link>
          </Button>
        </div>

        {/* Additional help text */}
        <p className="text-sm text-muted-foreground mt-8">
          If you believe this is an error, please contact the scholarship 
          committee for assistance.
        </p>
      </div>
    </div>
  );
}
