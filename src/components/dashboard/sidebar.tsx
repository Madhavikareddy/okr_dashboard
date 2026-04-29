"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Target,
  ListTodo,
  CalendarDays,
  Users,
  LineChart,
  Settings,
  Sparkles,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/okrs", label: "OKRs", icon: Target },
  { href: "/dashboard/tasks", label: "Tasks", icon: ListTodo },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/dashboard/teams", label: "Teams", icon: Users },
  { href: "/dashboard/reports", label: "Reports", icon: LineChart },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  user,
}: {
  user: { email?: string | null; full_name?: string | null; department?: string | null };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r bg-card/70 backdrop-blur-xl">
      <Link href="/dashboard" className="flex items-center gap-2 h-16 px-5 border-b font-semibold">
        <span className="grid place-items-center h-8 w-8 rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </span>
        Quarterly Nexus
      </Link>

      <nav className="flex-1 p-3 space-y-1">
        {NAV.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {active && (
                <motion.span
                  layoutId="active-pill"
                  className="absolute inset-0 rounded-lg bg-accent"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <item.icon className="relative h-4 w-4" />
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3 space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground">Appearance</span>
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-3 rounded-lg p-2">
          <div className="grid place-items-center h-8 w-8 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {(user.full_name || user.email || "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{user.full_name || user.email}</div>
            <div className="text-xs text-muted-foreground truncate">{user.department}</div>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
