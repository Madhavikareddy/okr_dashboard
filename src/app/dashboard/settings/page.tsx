import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "./client";

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, department")
    .eq("id", user!.id)
    .single();
  return <SettingsClient initial={profile ?? { full_name: "", email: user?.email ?? "", department: "IT" }} />;
}
