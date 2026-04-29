import { createClient } from "@/lib/supabase/server";
import { ReportsClient } from "./client";

export default async function ReportsPage() {
  const supabase = createClient();
  const year = new Date().getFullYear();
  const q = 1;
  const [{ data: objectives = [] }, { data: tasks = [] }] = await Promise.all([
    supabase.from("objectives").select("*"),
    supabase.from("tasks").select("*"),
  ]);
  return <ReportsClient objectives={objectives ?? []} tasks={tasks ?? []} quarter={q} year={year} />;
}
