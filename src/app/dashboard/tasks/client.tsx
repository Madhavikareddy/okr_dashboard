"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { DEPARTMENTS, cn } from "@/lib/utils";

const COLUMNS = [
  { key: "todo", label: "To Do", dot: "bg-slate-400" },
  { key: "in_progress", label: "In Progress", dot: "bg-blue-500" },
  { key: "review", label: "Review", dot: "bg-amber-500" },
  { key: "done", label: "Done", dot: "bg-emerald-500" },
] as const;

const PRIORITIES = ["low", "medium", "high"] as const;
const PRIORITY_VARIANT: Record<string, any> = {
  low: "secondary",
  medium: "warning",
  high: "danger",
};

type TaskForm = {
  id?: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  department: string;
  due_date: string;
};

const EMPTY: TaskForm = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  department: "Marketing",
  due_date: "",
};

export function TasksClient({ initial }: { initial: any[] }) {
  const supabase = createClient();
  const [tasks, setTasks] = useState<any[]>(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TaskForm>(EMPTY);
  const editing = Boolean(form.id);

  function openNew() {
    setForm(EMPTY);
    setOpen(true);
  }

  function openEdit(t: any) {
    setForm({
      id: t.id,
      title: t.title ?? "",
      description: t.description ?? "",
      status: t.status ?? "todo",
      priority: t.priority ?? "medium",
      department: t.department ?? "Marketing",
      due_date: t.due_date ? String(t.due_date).slice(0, 10) : "",
    });
    setOpen(true);
  }

  async function save() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const payload: any = {
      title: form.title,
      description: form.description || null,
      status: form.status,
      priority: form.priority,
      department: form.department,
      due_date: form.due_date || null,
    };
    if (editing) {
      const { data, error } = await supabase
        .from("tasks")
        .update(payload)
        .eq("id", form.id!)
        .select()
        .single();
      if (error) return toast.error(error.message);
      setTasks(tasks.map((t) => (t.id === data.id ? data : t)));
      toast.success("Task updated");
    } else {
      const { data, error } = await supabase
        .from("tasks")
        .insert({ ...payload, user_id: user.id })
        .select()
        .single();
      if (error) return toast.error(error.message);
      setTasks([data, ...tasks]);
      toast.success("Task created");
    }
    setOpen(false);
    setForm(EMPTY);
  }

  async function remove(id: string) {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setTasks(tasks.filter((t) => t.id !== id));
  }

  async function move(id: string, status: string) {
    const { data, error } = await supabase
      .from("tasks")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (error) return toast.error(error.message);
    setTasks(tasks.map((t) => (t.id === id ? data : t)));
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Workspace</p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Tasks</h1>
        </div>
        <Button onClick={openNew} className="bg-blue-600 hover:bg-blue-600/90 text-white">
          <Plus className="h-4 w-4" /> New task
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = tasks.filter((t) => t.status === col.key);
          return (
            <Card key={col.key} className="bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4 px-1">
                  <span className={cn("h-2 w-2 rounded-full", col.dot)} />
                  <h3 className="font-semibold text-sm">{col.label}</h3>
                  <span className="text-xs text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-2 min-h-[140px]">
                  <AnimatePresence>
                    {items.map((t) => (
                      <motion.div
                        key={t.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                      >
                        <div className="group rounded-lg border bg-background p-3 hover:shadow-sm transition-shadow">
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-medium text-sm leading-snug min-w-0">{t.title}</div>
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(t)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(t.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          {t.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
                          )}
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge variant={PRIORITY_VARIANT[t.priority] ?? "secondary"}>{t.priority}</Badge>
                              {t.department && <Badge variant="outline">{t.department}</Badge>}
                            </div>
                            {t.due_date && (
                              <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                {format(new Date(t.due_date), "d MMM yyyy")}
                              </span>
                            )}
                          </div>
                          <Select value={t.status} onValueChange={(v) => move(t.id, v)}>
                            <SelectTrigger className="h-7 mt-2 text-[11px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {COLUMNS.map((c) => (
                                <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {items.length === 0 && (
                    <div className="text-xs text-muted-foreground/70 p-6 text-center">
                      <span className="opacity-60">⊘</span> Drop tasks here
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit task" : "New task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Textarea
              placeholder="Description"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COLUMNS.map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save} disabled={!form.title} className="bg-blue-600 hover:bg-blue-600/90 text-white">
              {editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
