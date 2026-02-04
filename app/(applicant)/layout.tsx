export const dynamic = "force-dynamic";

// NOTE: Server-side auth guard removed to allow async user sync to complete
// Client-side auth guard in apply/layout.tsx handles authentication with grace period

export default function ApplicantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
