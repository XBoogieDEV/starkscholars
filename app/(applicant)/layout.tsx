export const dynamic = "force-dynamic";

import { requireAuth } from "@/lib/auth-guard";

export default async function ApplicantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth(["applicant"]);
  return <>{children}</>;
}
