"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock3,
  ListChecks,
  Megaphone,
  Plus,
  Sparkles,
  StickyNote,
  Target,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { DEPARTMENTS } from "@/lib/utils";
import { QuarterSelector } from "@/components/dashboard/quarter-selector";

type Stat = {
  label: string;
  value: string | number;
  icon: any;
  iconClass: string;
};

export function OverviewClient({
  displayName,
  tasks,
  objectives: allObjectives,
  announcements: initialAnnouncements,
  stickies: initialStickies,
  quarter: initialQuarter,
  year: initialYear,
}: {
  displayName: string;
  tasks: any[];
  objectives: any[];
  announcements: any[];
  stickies: any[];
  quarter: number;
  year: number;
}) {
  const supabase = createClient();
  const [announcements, setAnnouncements] = useState<any[]>(initialAnnouncements);
  const [stickies, setStickies] = useState<any[]>(initialStickies);
  const [postOpen, setPostOpen] = useState(false);
  const [post, setPost] = useState({ title: "", body: "", department: "All" });
  const [stickyText, setStickyText] = useState("");
  const [quarter, setQuarter] = useState(initialQuarter);
  const [year, setYear] = useState(initialYear);

  const objectives = useMemo(
    () => allObjectives.filter((o) => o.quarter === quarter && o.year === year),
    [allObjectives, quarter, year]
  );

  const totalTasks = tasks.length;
  const completed = tasks.filter((t) => t.status === "done").length;
  const pending = totalTasks - completed;
  const okrPct = objectives.length
    ? Math.round(objectives.reduce((s, o) => s + (o.progress || 0), 0) / objectives.length)
    : 0;
  const efficiency = totalTasks ? Math.round((completed / totalTasks) * 100) : 0;
  const productivity = Math.min(100, Math.round((completed * 1.2 + okrPct * 0.5) / 2));

  const stats: Stat[] = [
    { label: "Total Tasks", value: totalTasks || "—", icon: ListChecks, iconClass: "text-slate-500" },
    { label: "Completed", value: completed || "—", icon: CheckCircle2, iconClass: "text-emerald-500" },
    { label: "Pending", value: pending || "—", icon: Clock3, iconClass: "text-amber-500" },
    { label: "OKR %", value: objectives.length ? `${okrPct}%` : "—", icon: Target, iconClass: "text-violet-500" },
    { label: "Efficiency", value: totalTasks ? `${efficiency}%` : "—", icon: Sparkles, iconClass: "text-pink-500" },
    { label: "Productivity", value: totalTasks ? `${productivity}%` : "—", icon: TrendingUp, iconClass: "text-sky-500" },
  ];

  const deptCounts = DEPARTMENTS.map((d) => ({
    name: d,
    objectives: objectives.filter((o) => o.department === d).length,
    tasks: tasks.filter((t) => t.department === d).length,
  }));

  async function createAnnouncement() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const payload: any = {
      user_id: user.id,
      title: post.title,
      body: post.body,
      department: post.department === "All" ? null : post.department,
    };
    const { data, error } = await supabase.from("announcements").insert(payload).select().single();
    if (error) return toast.error(error.message);
    setAnnouncements([data, ...announcements]);
    setPostOpen(false);
    setPost({ title: "", body: "", department: "All" });
    toast.success("Posted");
  }

  async function removeAnnouncement(id: string) {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setAnnouncements(announcements.filter((a) => a.id !== id));
  }

  async function addSticky() {
    if (!stickyText.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("sticky_notes")
      .insert({ user_id: user.id, body: stickyText.trim() })
      .select()
      .single();
    if (error) return toast.error(error.message);
    setStickies([data, ...stickies]);
    setStickyText("");
  }

  async function removeSticky(id: string) {
    const { error } = await supabase.from("sticky_notes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setStickies(stickies.filter((s) => s.id !== id));
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Welcome back</p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            {displayName}{" "}
            <span className="text-muted-foreground/70 font-normal text-2xl">· Overview</span>
          </h1>
        </div>
        <QuarterSelector quarter={quarter} year={year} onChange={(q, y) => { setQuarter(q); setYear(y); }} />
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-10">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
          >
            <Card className="h-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
                    {s.label}
                  </p>
                  <s.icon className={`h-3.5 w-3.5 ${s.iconClass}`} />
                </div>
                <div className="mt-3 text-2xl font-semibold">
                  {s.value === "—" ? <span className="text-muted-foreground/40">—</span> : s.value}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold">Departments</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 mb-10">
        {deptCounts.map((d, i) => (
          <motion.div
            key={d.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium">{d.name}</div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{d.objectives} OKRs</span>
                  <span>{d.tasks} tasks</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-semibold">
                <Megaphone className="h-4 w-4" /> Team Announcements
              </div>
              <Dialog open={postOpen} onOpenChange={setPostOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4" /> Post
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New announcement</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>Title</Label>
                      <Input value={post.title} onChange={(e) => setPost({ ...post, title: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Message</Label>
                      <Textarea value={post.body} onChange={(e) => setPost({ ...post, body: e.target.value })} rows={4} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Audience</Label>
                      <Select value={post.department} onValueChange={(v) => setPost({ ...post, department: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All departments</SelectItem>
                          {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={createAnnouncement} disabled={!post.title}>Post</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {announcements.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-10">No announcements yet.</p>
            ) : (
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div key={a.id} className="rounded-lg border p-3 group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{a.department || "All"}</span>
                          <span>·</span>
                          <span>{format(new Date(a.created_at), "d MMM yyyy")}</span>
                        </div>
                        <div className="font-medium mt-0.5">{a.title}</div>
                        {a.body && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{a.body}</p>}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100"
                        onClick={() => removeAnnouncement(a.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 font-semibold mb-4">
              <StickyNote className="h-4 w-4" /> Sticky Notes
            </div>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Quick note..."
                value={stickyText}
                onChange={(e) => setStickyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSticky()}
              />
              <Button size="icon" onClick={addSticky}><Plus className="h-4 w-4" /></Button>
            </div>
            {stickies.length === 0 ? (
              <p className="text-xs text-center text-muted-foreground py-6">
                Capture quick thoughts here.
              </p>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-auto pr-1">
                {stickies.map((s) => (
                  <div
                    key={s.id}
                    className="group flex items-start justify-between gap-2 rounded-md bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 p-2.5 text-sm"
                  >
                    <p className="whitespace-pre-wrap break-words flex-1">{s.body}</p>
                    <button
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                      onClick={() => removeSticky(s.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-10">Q{quarter} {year}</p>
    </div>
  );
}
