"use client";

import { useEffect, useRef } from "react";

export function ScrollReveal({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    node.classList.add("scroll-reveal-pending");
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.classList.add("scroll-revealed");
        observer.unobserve(node);
      }
    }, { threshold: 0.08, rootMargin: "0px 0px -36px 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <section ref={ref} id={id} className={className}>{children}</section>;
}
