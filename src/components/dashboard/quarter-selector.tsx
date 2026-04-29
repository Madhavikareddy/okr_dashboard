"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function QuarterSelector({
  quarter,
  year,
  onChange,
}: {
  quarter: number;
  year: number;
  onChange: (q: number, y: number) => void;
}) {
  const years = [year - 1, year, year + 1];
  return (
    <div className="flex items-center gap-1 rounded-lg border bg-card p-1">
      {[1, 2, 3, 4].map((q) => (
        <Button
          key={q}
          size="sm"
          variant="ghost"
          onClick={() => onChange(q, year)}
          className={cn(
            "h-7 px-3 text-xs",
            q === quarter && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
          )}
        >
          Q{q}
        </Button>
      ))}
      <select
        value={year}
        onChange={(e) => onChange(quarter, Number(e.target.value))}
        className="h-7 rounded-md border-0 bg-transparent text-xs px-2 outline-none"
      >
        {years.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );
}
