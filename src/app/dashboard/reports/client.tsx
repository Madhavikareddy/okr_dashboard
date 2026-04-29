"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { QuarterSelector } from "@/components/dashboard/quarter-selector";
import { DEPARTMENTS } from "@/lib/utils";

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#94a3b8"];

export function ReportsClient({
  objectives: allObjectives,
  tasks,
  quarter: initialQuarter,
  year: initialYear,
}: {
  objectives: any[];
  tasks: any[];
  quarter: number;
  year: number;
}) {
  const [quarter, setQuarter] = useState(initialQuarter);
  const [year, setYear] = useState(initialYear);
  const objectives = useMemo(
    () => allObjectives.filter((o) => o.quarter === quarter && o.year === year),
    [allObjectives, quarter, year]
  );
  const byDept = DEPARTMENTS.map((d) => {
    const list = objectives.filter((o) => o.department === d);
    const avg = list.length
      ? Math.round(list.reduce((s, o) => s + (o.progress || 0), 0) / list.length)
      : 0;
    return { name: d, progress: avg, count: list.length };
  });

  const byStatus = ["on_track", "at_risk", "off_track", "done"].map((s) => ({
    name: s.replace("_", " "),
    value: objectives.filter((o) => o.status === s).length,
  }));

  const taskByStatus = ["todo", "in_progress", "review", "done"].map((s) => ({
    name: s.replace("_", " "),
    value: tasks.filter((t) => t.status === s).length,
  }));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Reports"
        description={`Q${quarter} ${year} performance across departments.`}
        actions={<QuarterSelector quarter={quarter} year={year} onChange={(q, y) => { setQuarter(q); setYear(y); }} />}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>Avg. progress by department</CardTitle>
              <CardDescription>How each team is tracking</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byDept}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="progress" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardHeader>
              <CardTitle>Objectives by status</CardTitle>
              <CardDescription>This quarter's health</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byStatus} dataKey="value" nameKey="name" outerRadius={100} label>
                    {byStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Tasks by status</CardTitle>
              <CardDescription>Workload distribution</CardDescription>
            </CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskByStatus}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
