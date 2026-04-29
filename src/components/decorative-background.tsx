export function DecorativeBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Soft base gradient — light by default, deeper in dark */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-blue-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.45] dark:opacity-[0.25]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      {/* Gradient blobs for that premium glow */}
      <div className="absolute -top-40 -right-32 h-[520px] w-[520px] rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-500/15" />
      <div className="absolute top-[35%] -left-32 h-[460px] w-[460px] rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-500/15" />
      <div className="absolute -bottom-40 right-1/4 h-[420px] w-[420px] rounded-full bg-fuchsia-300/15 blur-3xl dark:bg-fuchsia-500/10" />
    </div>
  );
}
