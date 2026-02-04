import { requireAuth } from "@/lib/auth-guard";
import CommitteeLayoutClient from "./layout.client";

export default async function CommitteeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAuth(["committee", "admin"]);

  return (
    <CommitteeLayoutClient user={user}>
      {children}
    </CommitteeLayoutClient>
  );
}
