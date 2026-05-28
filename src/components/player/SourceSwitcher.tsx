"use client";
import type { StreamingSource } from "@/services/streamingSources";
import { cn } from "@/lib/utils";

interface Props {
  sources: StreamingSource[];
  active: string;
  onChange: (id: string) => void;
}

export function SourceSwitcher({ sources, active, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs uppercase tracking-widest text-white/50 mr-2">
        Source
      </span>
      {sources.map((s) => (
        <button
          type="button"
          key={s.id}
          onClick={() => onChange(s.id)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs border transition",
            active === s.id
              ? "bg-primary text-white border-primary glow-primary"
              : "glass hover:bg-white/10 border-white/10",
          )}
        >
          {s.label}
          {s.quality && (
            <span className="ml-1 text-white/50">· {s.quality}</span>
          )}
        </button>
      ))}
    </div>
  );
}
