"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { useTheme } from "next-themes";
import { Maximize2, X } from "lucide-react";

export function Mermaid({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string>("");
  const [open, setOpen] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Re-initialize mermaid when theme changes
    mermaid.initialize({
      startOnLoad: false,
      theme: resolvedTheme === "dark" ? "dark" : "default",
    });

    const renderChart = async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
      } catch (err) {
        console.error("Mermaid parsing error", err);
      }
    };

    renderChart();
  }, [chart, resolvedTheme]);

  if (!svg) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-pulse w-full h-32 bg-muted rounded-lg border border-border/40"></div>
      </div>
    );
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen(true); }}
        title="Click to enlarge"
        className="group relative my-8 flex cursor-zoom-in justify-center overflow-x-auto rounded-xl border border-border/40 bg-muted/50 p-4"
      >
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded bg-background/80 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground opacity-70 transition-opacity group-hover:opacity-100">
          <Maximize2 size={12} /> Click to enlarge
        </span>
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 md:p-10"
          onClick={() => setOpen(false)}
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 z-10 rounded-full bg-background/20 p-2 text-foreground hover:bg-background/40"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <div
            className="max-h-full max-w-full overflow-auto rounded-xl border border-border bg-background p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div dangerouslySetInnerHTML={{ __html: svg }} />
          </div>
        </div>
      )}
    </>
  );
}