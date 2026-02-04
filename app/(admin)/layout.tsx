import { requireAuth } from "@/lib/auth-guard";
import AdminLayoutClient from "./layout.client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAuth(["admin"]);

  return (
    <AdminLayoutClient user={user as any}>
      {children}
    </AdminLayoutClient>
  );
}
