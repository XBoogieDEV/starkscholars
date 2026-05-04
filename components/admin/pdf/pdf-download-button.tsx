"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

interface PDFDownloadButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  document: React.ReactElement<any>;
  filename: string;
  children?: React.ReactNode;
}

// Generates the PDF imperatively on user click instead of mounting
// <PDFDownloadLink> on render. The mounted-on-render path triggers
// PDFDownloadLinkBase.useEffect → usePDF.update → updateContainer in
// @react-pdf/reconciler, which fails under React 19 ("su is not a
// function"). Calling pdf().toBlob() inside the click handler avoids
// the broken effect entirely; the user gets the same .pdf download.
export function PDFDownloadButton({ document, filename, children }: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleClick() {
    setIsGenerating(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const blob = await pdf(document).toBlob();
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = filename;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("PDF generation failed:", e);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={isGenerating}>
      {isGenerating ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {isGenerating ? "Generating..." : children || "Download PDF"}
    </Button>
  );
}
