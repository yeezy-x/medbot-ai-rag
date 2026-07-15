import { requireUser } from "@/lib/auth-utils";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return children
}