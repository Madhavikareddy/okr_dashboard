import { createClient } from "@/lib/supabase/server";
import { TasksClient } from "./client";

export default async function TasksPage() {
  const supabase = createClient();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });
  return <TasksClient initial={tasks ?? []} />;
}
