import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Stark Scholars | William R. Stark Financial Assistance Program",
  description:
    "Apply for the Stark Scholars scholarship — awarding prestigious scholarships to Michigan students committed to academic excellence and community impact. $500 awards available.",
  openGraph: {
    title: "Stark Scholars | William R. Stark Financial Assistance Program",
    description:
      "Apply for the Stark Scholars scholarship — awarding prestigious scholarships to Michigan students committed to academic excellence and community impact.",
    url: "https://starkscholars.com",
    siteName: "Stark Scholars",
    images: [
      {
        url: "/images/og-banner.png",
        width: 1200,
        height: 630,
        alt: "Stark Scholars — The William R. Stark Financial Assistance Program",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stark Scholars | William R. Stark Financial Assistance Program",
    description:
      "Apply for the Stark Scholars scholarship — awarding prestigious scholarships to Michigan students committed to academic excellence and community impact.",
    images: ["/images/og-banner.png"],
  },
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
