import { ConvexClientProvider } from "@/components/convex-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexClientProvider>
      {children}
    </ConvexClientProvider>
  );
}
