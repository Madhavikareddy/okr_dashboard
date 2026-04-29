import { createClient } from "@/lib/supabase/server";
import { OverviewClient } from "./overview-client";

export default async function OverviewPage() {
  const supabase = createClient();
  const year = new Date().getFullYear();
  // Default to Q1 — user can switch quarters from the overview header.
  const q = 1;

  const [
    { data: { user } },
    { data: profile },
  ] = await Promise.all([supabase.auth.getUser(), supabase.from("profiles").select("full_name, email, department").single()]);

  // Load ALL objectives so the client can filter by selected quarter without a refetch.
  const [
    { data: tasks },
    { data: objectives },
    { data: announcements },
    { data: stickies },
  ] = await Promise.all([
    supabase.from("tasks").select("*"),
    supabase.from("objectives").select("*"),
    supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(20),
    supabase.from("sticky_notes").select("*").order("created_at", { ascending: false }).limit(50),
  ]);

  return (
    <OverviewClient
      displayName={profile?.full_name || user?.email?.split("@")[0] || "there"}
      tasks={tasks ?? []}
      objectives={objectives ?? []}
      announcements={announcements ?? []}
      stickies={stickies ?? []}
      quarter={q}
      year={year}
    />
  );
}
