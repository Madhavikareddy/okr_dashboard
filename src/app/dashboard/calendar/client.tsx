"use client";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { cn, DEPARTMENTS } from "@/lib/utils";

export function CalendarClient({ initial }: { initial: any[] }) {
  const supabase = createClient();
  const [events, setEvents] = useState<any[]>(initial);
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    start_at: "",
    department: "Marketing",
  });

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    const list: Date[] = [];
    let d = start;
    while (d <= end) {
      list.push(d);
      d = new Date(d.getTime() + 24 * 60 * 60 * 1000);
    }
    return list;
  }, [cursor]);

  const selectedEvents = events
    .filter((e) => isSameDay(new Date(e.start_at), selected))
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

  const today = startOfDay(new Date());
  const upcoming = events
    .filter((e) => isAfter(new Date(e.start_at), today) || isSameDay(new Date(e.start_at), today))
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
    .slice(0, 6);

  async function createEvent() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const payload: any = {
      user_id: user.id,
      title: form.title,
      description: form.description || null,
      department: form.department,
      start_at: new Date(form.start_at).toISOString(),
    };
    const { data, error } = await supabase.from("events").insert(payload).select().single();
    if (error) return toast.error(error.message);
    setEvents([...events, data]);
    setOpen(false);
    setForm({ title: "", description: "", start_at: "", department: "Marketing" });
    toast.success("Event added");
  }

  async function removeEvent(id: string) {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setEvents(events.filter((e) => e.id !== id));
  }

  function openNew(date?: Date) {
    const d = date ?? selected;
    setForm({
      title: "",
      description: "",
      start_at: format(d, "yyyy-MM-dd"),
      department: "Marketing",
    });
    setOpen(true);
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Schedule</p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Calendar</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openNew()} className="bg-blue-600 hover:bg-blue-600/90 text-white">
              <Plus className="h-4 w-4" /> New event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New event</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                autoFocus
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={form.start_at}
                  onChange={(e) => setForm({ ...form, start_at: e.target.value })}
                />
                <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                placeholder="Description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button
                onClick={createEvent}
                disabled={!form.title || !form.start_at}
                className="bg-blue-600 hover:bg-blue-600/90 text-white"
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Pick a date</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCursor(addMonths(cursor, -1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm min-w-[120px] text-center">{format(cursor, "MMMM yyyy")}</div>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCursor(addMonths(cursor, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 text-[11px] font-medium text-muted-foreground mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div key={d} className="px-2 py-1 text-center">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const inMonth = isSameMonth(day, cursor);
                const hasEvents = events.some((e) => isSameDay(new Date(e.start_at), day));
                const isSelected = isSameDay(day, selected);
                const isToday = isSameDay(day, new Date());
                return (
                  <motion.button
                    key={day.toISOString()}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSelected(day)}
                    className={cn(
                      "relative h-10 rounded-md text-sm transition-colors",
                      !inMonth && "text-muted-foreground/40",
                      isSelected
                        ? "bg-blue-600 text-white font-medium"
                        : "hover:bg-accent",
                      !isSelected && isToday && "text-blue-600 font-semibold"
                    )}
                  >
                    {format(day, "d")}
                    {hasEvents && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-blue-500" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 font-semibold mb-4">
                <CalendarDays className="h-4 w-4 text-blue-500" />
                Events on {format(selected, "yyyy-MM-dd")}
              </div>
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-6">
                  No events for this day
                </p>
              ) : (
                <ul className="space-y-2">
                  <AnimatePresence initial={false}>
                    {selectedEvents.map((e) => (
                      <motion.li
                        key={e.id}
                        layout
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        className="group flex items-start justify-between gap-2 rounded-md border p-3"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{e.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {e.department ?? "General"} · {format(new Date(e.start_at), "p")}
                          </div>
                          {e.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{e.description}</p>
                          )}
                        </div>
                        <button
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                          onClick={() => removeEvent(e.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="font-semibold mb-4">Upcoming</div>
              {upcoming.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-6">No upcoming events.</p>
              ) : (
                <ul className="space-y-2">
                  {upcoming.map((e) => (
                    <li
                      key={e.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <button
                        onClick={() => {
                          const d = new Date(e.start_at);
                          setCursor(d);
                          setSelected(d);
                        }}
                        className="min-w-0 text-left hover:text-foreground text-muted-foreground"
                      >
                        <span className="text-foreground font-medium">{e.title}</span>
                      </button>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(e.start_at), "MMM d")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
