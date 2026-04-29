"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  LayoutDashboard,
  LineChart,
  ListTodo,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * i, duration: 0.5, ease: "easeOut" as const },
  }),
};

export function LandingHero({ signedIn }: { signedIn?: boolean }) {
  return (
    <section className="relative">
      <div className="container relative py-20 md:py-28 text-center">
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 backdrop-blur px-3 py-1 text-xs text-muted-foreground"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Now in beta · Q1 {new Date().getFullYear()}
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="show"
          custom={1}
          variants={fadeUp}
          className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight"
        >
          Where every department <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            aligns each quarter.
          </span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          custom={2}
          variants={fadeUp}
          className="mt-5 max-w-2xl mx-auto text-lg text-muted-foreground"
        >
          OKRs, tasks, calendar, reports — one shared source of truth for IT, Finance,
          Marketing, Sales and HR.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          custom={3}
          variants={fadeUp}
          className="mt-8 flex items-center justify-center gap-3"
        >
          {signedIn ? (
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-95 text-white shadow-lg shadow-blue-500/20">
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4" /> Open dashboard
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-95 text-white shadow-lg shadow-blue-500/20">
              <Link href="/auth?mode=signup">
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
          <Button asChild size="lg" variant="outline" className="bg-background/60 backdrop-blur">
            <Link href="#features">See features</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="mt-16 mx-auto max-w-5xl rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl shadow-2xl shadow-blue-500/10 overflow-hidden"
        >
          <div className="flex items-center gap-1.5 border-b border-border/60 px-4 py-2.5 bg-muted/30">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-3 text-xs text-muted-foreground">app.quarterly-nexus / dashboard</span>
          </div>
          <div className="grid md:grid-cols-3 gap-4 p-6">
            {[
              { label: "Objectives on track", value: "12/15", tone: "text-emerald-600 dark:text-emerald-400", from: "from-emerald-500/10" },
              { label: "Tasks due this week", value: "23", tone: "text-amber-600 dark:text-amber-400", from: "from-amber-500/10" },
              { label: "Avg. progress", value: "68%", tone: "text-blue-600 dark:text-blue-400", from: "from-blue-500/10" },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border border-border/60 bg-gradient-to-br ${s.from} to-transparent p-4 text-left`}>
                <div className="text-[10px] uppercase tracking-[0.18em] font-medium text-muted-foreground">{s.label}</div>
                <div className={`mt-2 text-3xl font-semibold ${s.tone}`}>{s.value}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: Target, title: "OKRs", desc: "Objectives & key results, tracked per quarter and department.", from: "from-blue-500", to: "to-indigo-500" },
  { icon: ListTodo, title: "Tasks", desc: "Lightweight task management linked to your objectives.", from: "from-emerald-500", to: "to-teal-500" },
  { icon: CalendarDays, title: "Calendar", desc: "Cross-team events and deadlines in one shared view.", from: "from-violet-500", to: "to-fuchsia-500" },
  { icon: Users, title: "Teams", desc: "See who owns what across IT, Finance, Marketing, Sales, HR.", from: "from-orange-500", to: "to-amber-500" },
  { icon: LineChart, title: "Reports", desc: "Beautiful, real-time dashboards on quarterly performance.", from: "from-rose-500", to: "to-pink-500" },
  { icon: CheckCircle2, title: "Status at a glance", desc: "On-track, at-risk and off-track signals everywhere.", from: "from-cyan-500", to: "to-sky-500" },
];

export function LandingFeatures() {
  return (
    <section id="features" className="container py-20">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Features</p>
        <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
          Everything your quarter needs
        </h2>
        <p className="mt-3 text-muted-foreground">
          A single home for goals, work, and reporting — no more scattered docs.
        </p>
      </div>
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            custom={i}
            variants={fadeUp}
            className="group relative rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <div className={`grid place-items-center h-11 w-11 rounded-xl bg-gradient-to-br ${f.from} ${f.to} text-white shadow-lg shadow-black/5`}>
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function LandingCTA({ signedIn }: { signedIn?: boolean }) {
  return (
    <section id="cta" className="container pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-border/60 p-10 md:p-16 text-center"
      >
        {/* glow blobs inside the CTA */}
        <div className="pointer-events-none absolute -top-32 -left-20 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-20 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-card/80 via-card/60 to-card/80 backdrop-blur-xl" />

        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 backdrop-blur px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" /> Free during beta
        </div>
        <h3 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight">
          Start tracking your team's quarter
        </h3>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          No credit card required. Set up your workspace in under a minute.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {signedIn ? (
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-95 text-white shadow-lg shadow-blue-500/20">
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4" /> Open dashboard
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-95 text-white shadow-lg shadow-blue-500/20">
              <Link href="/auth?mode=signup">
                Create your workspace <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </motion.div>
    </section>
  );
}
