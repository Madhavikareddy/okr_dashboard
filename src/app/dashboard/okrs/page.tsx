import { createClient } from "@/lib/supabase/server";
import { OKRsClient } from "./client";

export default async function OKRsPage() {
  const supabase = createClient();
  const year = new Date().getFullYear();
  // Default to Q1 of the current year; user can switch via the quarter selector.
  const q = 1;

  const [{ data: objectives }, { data: krs }] = await Promise.all([
    supabase.from("objectives").select("*").order("created_at", { ascending: false }),
    supabase.from("key_results").select("*").order("created_at"),
  ]);

  return <OKRsClient initial={objectives ?? []} keyResults={krs ?? []} quarter={q} year={year} />;
}
