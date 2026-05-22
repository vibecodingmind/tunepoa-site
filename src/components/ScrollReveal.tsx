"use client";

import { useEffect, useRef, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  animation?: "reveal-up" | "reveal-left" | "reveal-right" | "reveal-scale" | "reveal-fade" | "blur-in";
  stagger?: number;
  className?: string;
  threshold?: number;
}

export function ScrollReveal({
  children,
  animation = "reveal-up",
  stagger,
  className = "",
  threshold = 0.15,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed", animation);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animation, threshold]);

  const staggerClass = stagger ? `stagger-${stagger}` : "";

  return (
    <div ref={ref} className={`scroll-reveal ${staggerClass} ${className}`}>
      {children}
    </div>
  );
}
