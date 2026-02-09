"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

// Dynamic import to avoid SSR issues with @react-pdf/renderer
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

interface PDFDownloadButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  document: React.ReactElement<any>;
  filename: string;
  children?: React.ReactNode;
}

export function PDFDownloadButton({ document, filename, children }: PDFDownloadButtonProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  return (
    <PDFDownloadLink document={document} fileName={filename}>
      {({ loading }) => (
        <Button variant="outline" size="sm" disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {loading ? "Generating..." : children || "Download PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
