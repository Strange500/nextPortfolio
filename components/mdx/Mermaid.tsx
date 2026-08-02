"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { useTheme } from "next-themes";

export function Mermaid({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string>("");
  const { resolvedTheme } = useTheme();
  
  useEffect(() => {
    // Re-initialize mermaid when theme changes
    mermaid.initialize({ 
      startOnLoad: false, 
      theme: resolvedTheme === "dark" ? "dark" : "default" 
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
    <div 
      className="mermaid-container flex justify-center my-8 p-4 bg-muted/50 rounded-xl border border-border/40 overflow-x-auto" 
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
}
