import { Code2, DollarSign, Megaphone, Briefcase, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEPARTMENTS } from "@/lib/utils";

const META: Record<
  string,
  { icon: any; tint: string; border: string; description: string }
> = {
  IT: {
    icon: Code2,
    tint: "bg-blue-500",
    border: "from-blue-500 to-indigo-500",
    description: "Website, automation, technical issues, new builds.",
  },
  Finance: {
    icon: DollarSign,
    tint: "bg-emerald-500",
    border: "from-emerald-500 to-teal-500",
    description: "Revenue logs, expenses, payments, monthly reports.",
  },
  Marketing: {
    icon: Megaphone,
    tint: "bg-fuchsia-500",
    border: "from-fuchsia-500 to-rose-500",
    description: "Campaigns, posts, leads, reach & engagement.",
  },
  Sales: {
    icon: Briefcase,
    tint: "bg-orange-500",
    border: "from-orange-500 to-amber-500",
    description: "Closes, revenue, conversion rate, follow-ups.",
  },
  HR: {
    icon: UserRound,
    tint: "bg-violet-500",
    border: "from-violet-500 to-purple-500",
    description: "People, onboarding, culture, and performance.",
  },
};

export default async function TeamsPage() {
  const supabase = createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, department")
    .order("full_name");

  const grouped: Record<string, any[]> = Object.fromEntries(DEPARTMENTS.map((d) => [d, []]));
  (profiles ?? []).forEach((p: any) => {
    if (p.department && grouped[p.department]) grouped[p.department].push(p);
  });

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="space-y-1 mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Teams</p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          {DEPARTMENTS.length} Departments
        </h1>
      </div>

      <div className="space-y-4">
        {DEPARTMENTS.map((dept) => {
          const meta = META[dept];
          const members = grouped[dept];
          return (
            <Card key={dept} className="overflow-hidden">
              <div className={`h-1 bg-gradient-to-r ${meta.border}`} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`grid place-items-center h-10 w-10 rounded-lg ${meta.tint} text-white shrink-0`}>
                      <meta.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold">{dept}</h3>
                      <p className="text-xs text-muted-foreground">{meta.description}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {members.length} {members.length === 1 ? "member" : "members"}
                  </Badge>
                </div>

                {members.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">No members yet.</p>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {members.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-2 rounded-full border bg-background pl-1 pr-3 py-1"
                      >
                        <div className="grid place-items-center h-6 w-6 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                          {(m.full_name || m.email || "U").slice(0, 1).toUpperCase()}
                        </div>
                        <span className="text-xs truncate max-w-[160px]">
                          {m.full_name || m.email}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
