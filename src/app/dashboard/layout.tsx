import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { PageTransition } from "@/components/dashboard/page-transition";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, department")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen flex">
      <Sidebar
        user={{
          email: user.email,
          full_name: profile?.full_name ?? user.email,
          department: profile?.department ?? "—",
        }}
      />
      <main className="flex-1 min-w-0">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
