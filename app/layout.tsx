import { ConvexClientProvider } from "@/components/convex-provider";
import { CookieConsent } from "@/components/cookie-consent";
import { getToken } from "@/lib/auth-server";
import { cn } from "@/lib/utils";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await getToken();
  
  return (
    <html lang="en" className="scroll-smooth">
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-amber-600 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          Skip to main content
        </a>
        <ConvexClientProvider initialToken={token}>
          <main id="main-content" className="relative">
            {children}
          </main>
        </ConvexClientProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
