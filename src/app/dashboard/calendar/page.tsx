import { createClient } from "@/lib/supabase/server";
import { CalendarClient } from "./client";

export default async function CalendarPage() {
  const supabase = createClient();
  const { data: events } = await supabase.from("events").select("*").order("start_at");
  return <CalendarClient initial={events ?? []} />;
}
