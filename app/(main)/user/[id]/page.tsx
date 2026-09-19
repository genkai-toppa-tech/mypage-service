import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProfilePageContent } from "@/components/user/ProfilePageContent";
import { getProfileById } from "@/lib/auth/current-user";
import { getCompletionCounts } from "@/lib/kanryo/completion-counts";
import { createClient } from "@/lib/supabase/server";

type UserByIdPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: UserByIdPageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await getProfileById(id);

  return {
    title:
      profile === null
        ? "マイページ | 限界突破塾 マイページ"
        : `${profile.displayName} | 限界突破塾 マイページ`,
  };
}

export default async function UserByIdPage({ params }: UserByIdPageProps) {
  const { id } = await params;
  const profile = await getProfileById(id);

  if (profile === null) {
    notFound();
  }

  const supabase = await createClient();
  const counts = await getCompletionCounts(supabase, profile.id);

  return <ProfilePageContent profile={profile} counts={counts} />;
}
