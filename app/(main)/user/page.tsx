import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProfilePageContent } from "@/components/user/ProfilePageContent";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getCompletionCounts } from "@/lib/kanryo/completion-counts";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "マイページ | 限界突破塾 マイページ",
};

export default async function UserPage() {
  const currentUser = await getCurrentUser();

  if (currentUser === null) {
    redirect("/login");
  }

  const supabase = await createClient();
  const counts = await getCompletionCounts(supabase, currentUser.id);

  return <ProfilePageContent profile={currentUser} counts={counts} />;
}
