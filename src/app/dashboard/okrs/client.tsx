"use client";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import { DEPARTMENTS } from "@/lib/utils";
import { QuarterSelector } from "@/components/dashboard/quarter-selector";

const STATUSES = [
  { value: "on_track", label: "On track", variant: "success" as const },
  { value: "at_risk", label: "At risk", variant: "warning" as const },
  { value: "off_track", label: "Off track", variant: "danger" as const },
  { value: "done", label: "Done", variant: "secondary" as const },
];

type KR = { id?: string; title: string; target: number; current: number; unit: string };

type Form = {
  id?: string;
  title: string;
  description: string;
  department: string;
  due_date: string;
  quarter: number;
  year: number;
  key_results: KR[];
};

function emptyForm(quarter: number, year: number): Form {
  return {
    title: "",
    description: "",
    department: "Marketing",
    due_date: "",
    quarter,
    year,
    key_results: [{ title: "", target: 100, current: 0, unit: "%" }],
  };
}

export function OKRsClient({
  initial,
  keyResults,
  quarter: initialQuarter,
  year: initialYear,
}: {
  initial: any[];
  keyResults: any[];
  quarter: number;
  year: number;
}) {
  const supabase = createClient();
  const [objs, setObjs] = useState<any[]>(initial);
  const [krsByObj, setKrsByObj] = useState<Record<string, any[]>>(() => {
    const map: Record<string, any[]> = {};
    for (const kr of keyResults) {
      (map[kr.objective_id] ??= []).push(kr);
    }
    return map;
  });
  const [quarter, setQuarter] = useState(initialQuarter);
  const [year, setYear] = useState(initialYear);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(emptyForm(quarter, year));
  const editing = Boolean(form.id);

  const filtered = useMemo(
    () => objs.filter((o) => o.quarter === quarter && o.year === year),
    [objs, quarter, year]
  );

  function openNew() {
    setForm(emptyForm(quarter, year));
    setOpen(true);
  }

  function openEdit(o: any) {
    const krs = krsByObj[o.id] ?? [];
    setForm({
      id: o.id,
      title: o.title,
      description: o.description ?? "",
      department: o.department,
      due_date: o.due_date ? String(o.due_date).slice(0, 10) : "",
      quarter: o.quarter,
      year: o.year,
      key_results: krs.length ? krs.map((k) => ({ id: k.id, title: k.title, target: k.target, current: k.current, unit: k.unit ?? "%" })) : [{ title: "", target: 100, current: 0, unit: "%" }],
    });
    setOpen(true);
  }

  function addKR() {
    setForm({ ...form, key_results: [...form.key_results, { title: "", target: 100, current: 0, unit: "%" }] });
  }
  function updateKR(i: number, patch: Partial<KR>) {
    const next = [...form.key_results];
    next[i] = { ...next[i], ...patch };
    setForm({ ...form, key_results: next });
  }
  function removeKRRow(i: number) {
    setForm({ ...form, key_results: form.key_results.filter((_, idx) => idx !== i) });
  }

  async function save() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const objPayload: any = {
      title: form.title,
      description: form.description || null,
      department: form.department,
      quarter: form.quarter,
      year: form.year,
      due_date: form.due_date || null,
    };
    let objId = form.id;

    if (editing) {
      const { data, error } = await supabase
        .from("objectives")
        .update(objPayload)
        .eq("id", form.id!)
        .select()
        .single();
      if (error) return toast.error(error.message);
      setObjs(objs.map((o) => (o.id === data.id ? data : o)));
      objId = data.id;
    } else {
      const { data, error } = await supabase
        .from("objectives")
        .insert({ ...objPayload, user_id: user.id })
        .select()
        .single();
      if (error) return toast.error(error.message);
      setObjs([data, ...objs]);
      objId = data.id;
    }

    if (!objId) return;
    const validKRs = form.key_results.filter((k) => k.title.trim());
    if (validKRs.length) {
      // Replace strategy: delete existing then insert all (simple + idempotent for editing).
      if (editing) {
        await supabase.from("key_results").delete().eq("objective_id", objId);
      }
      const insert = validKRs.map((k) => ({
        objective_id: objId!,
        user_id: user.id,
        title: k.title,
        target: Number(k.target) || 100,
        current: Number(k.current) || 0,
        unit: k.unit || "%",
      }));
      const { data: newKRs, error } = await supabase.from("key_results").insert(insert).select();
      if (error) return toast.error(error.message);
      setKrsByObj({ ...krsByObj, [objId!]: newKRs ?? [] });
      const progress = computeProgress(newKRs ?? []);
      const { data: updated } = await supabase
        .from("objectives")
        .update({ progress })
        .eq("id", objId!)
        .select()
        .single();
      if (updated) setObjs((prev) => prev.map((o) => (o.id === objId ? updated : o)));
    } else if (editing) {
      await supabase.from("key_results").delete().eq("objective_id", objId);
      setKrsByObj({ ...krsByObj, [objId!]: [] });
      const { data: updated } = await supabase
        .from("objectives")
        .update({ progress: 0 })
        .eq("id", objId!)
        .select()
        .single();
      if (updated) setObjs((prev) => prev.map((o) => (o.id === objId ? updated : o)));
    }

    toast.success(editing ? "Objective updated" : "Objective created");
    setOpen(false);
    setForm(emptyForm(quarter, year));
  }

  async function remove(id: string) {
    const { error } = await supabase.from("objectives").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setObjs(objs.filter((o) => o.id !== id));
  }

  async function patch(id: string, p: any) {
    const { data, error } = await supabase.from("objectives").update(p).eq("id", id).select().single();
    if (error) return toast.error(error.message);
    setObjs(objs.map((o) => (o.id === id ? data : o)));
  }

  function computeProgress(krs: any[]) {
    if (!krs.length) return 0;
    const sum = krs.reduce((s, k) => {
      const t = Number(k.target) || 0;
      const c = Number(k.current) || 0;
      if (t <= 0) return s;
      return s + Math.min(100, Math.max(0, (c / t) * 100));
    }, 0);
    return Math.round(sum / krs.length);
  }

  async function updateKRCurrent(objId: string, krId: string, value: number) {
    const krs = krsByObj[objId] ?? [];
    const nextKRs = krs.map((k) => (k.id === krId ? { ...k, current: value } : k));
    setKrsByObj({ ...krsByObj, [objId]: nextKRs });

    const { error } = await supabase.from("key_results").update({ current: value }).eq("id", krId);
    if (error) {
      toast.error(error.message);
      return;
    }

    const progress = computeProgress(nextKRs);
    const obj = objs.find((o) => o.id === objId);
    if (obj && obj.progress !== progress) {
      const { data, error: e2 } = await supabase
        .from("objectives")
        .update({ progress })
        .eq("id", objId)
        .select()
        .single();
      if (e2) return toast.error(e2.message);
      setObjs(objs.map((o) => (o.id === objId ? data : o)));
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Objectives · Q{quarter} {year}
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">OKRs</h1>
        </div>
        <div className="flex items-center gap-2">
          <QuarterSelector quarter={quarter} year={year} onChange={(q, y) => { setQuarter(q); setYear(y); }} />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-blue-600 hover:bg-blue-600/90 text-white">
              <Plus className="h-4 w-4" /> New objective
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit OKR" : "New OKR"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Objective"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
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

              <div className="pt-2">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium mb-2">
                  Key Results
                </p>
                <div className="space-y-2">
                  {form.key_results.map((kr, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        placeholder="Title"
                        className="flex-1"
                        value={kr.title}
                        onChange={(e) => updateKR(i, { title: e.target.value })}
                      />
                      <Input
                        type="number"
                        className="w-20"
                        value={kr.target}
                        onChange={(e) => updateKR(i, { target: Number(e.target.value) })}
                      />
                      <Input
                        placeholder="%"
                        className="w-16"
                        value={kr.unit}
                        onChange={(e) => updateKR(i, { unit: e.target.value })}
                      />
                      {form.key_results.length > 1 && (
                        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => removeKRRow(i)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="mt-2" onClick={addKR}>
                  <Plus className="h-3.5 w-3.5" /> Add KR
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={save}
                disabled={!form.title}
                className="bg-blue-600 hover:bg-blue-600/90 text-white"
              >
                {editing ? "Save" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-24 text-center text-sm text-muted-foreground">
          No objectives yet. Create your first OKR for Q{quarter} {year}.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence>
            {filtered.map((o) => {
              const status = STATUSES.find((s) => s.value === o.status);
              const krs = krsByObj[o.id] ?? [];
              return (
                <motion.div
                  key={o.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Q{o.quarter} {o.year}</span>
                            <span>·</span>
                            <span>{o.department}</span>
                            {o.due_date && (
                              <>
                                <span>·</span>
                                <span>due {format(new Date(o.due_date), "d MMM yyyy")}</span>
                              </>
                            )}
                          </div>
                          <h3 className="mt-1 text-lg font-semibold truncate">{o.title}</h3>
                          {o.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{o.description}</p>
                          )}
                        </div>
                        <Badge variant={status?.variant ?? "secondary"}>{status?.label}</Badge>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span>{o.progress || 0}%</span>
                        </div>
                        <Progress value={o.progress || 0} />
                      </div>

                      {krs.length > 0 && (
                        <ul className="mt-3 space-y-1.5">
                          {krs.map((kr) => {
                            const unit = kr.unit ?? "";
                            const isPct = unit.trim() === "%";
                            return (
                              <li
                                key={kr.id}
                                className="flex items-center justify-between text-sm gap-2"
                              >
                                <span className="text-muted-foreground truncate pr-2">
                                  • {kr.title}
                                </span>
                                <span className="text-xs text-muted-foreground whitespace-nowrap inline-flex items-center font-medium">
                                  <input
                                    type="number"
                                    min={0}
                                    value={kr.current ?? 0}
                                    onChange={(e) => {
                                      const v = Number(e.target.value);
                                      setKrsByObj({
                                        ...krsByObj,
                                        [o.id]: (krsByObj[o.id] ?? []).map((k) =>
                                          k.id === kr.id ? { ...k, current: v } : k
                                        ),
                                      });
                                    }}
                                    onBlur={(e) =>
                                      updateKRCurrent(
                                        o.id,
                                        kr.id,
                                        Number(e.target.value)
                                      )
                                    }
                                    className="w-12 text-right bg-transparent rounded px-1 py-0.5 hover:bg-accent focus:bg-accent focus:outline-none focus:ring-1 focus:ring-primary text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                  {isPct && <span>%</span>}
                                  <span className="mx-1">/</span>
                                  <span>
                                    {kr.target}
                                    {unit}
                                  </span>
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      )}

                      <div className="mt-4 flex items-center justify-between gap-2">
                        <Select value={o.status} onValueChange={(v) => patch(o.id, { status: v })}>
                          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <div className="flex items-center">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(o)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(o.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
