import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function MainLayout({ children }: LayoutProps<"/">) {
  const currentUser = await getCurrentUser();

  // 未ログインは proxy.ts で弾かれるが、プロフィールが未作成の場合はここで気づける
  if (currentUser === null) {
    redirect("/login");
  }

  return <AppShell currentUser={currentUser}>{children}</AppShell>;
}
