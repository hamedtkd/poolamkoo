"use client";

import { m, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export function RouteTransition({ routeKey, children }: { routeKey: string; children: React.ReactNode }) {
  return <div data-route-content={routeKey}>{children}</div>;
}

export function MotionReveal({ children, className, delay = 0, hover = false }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}) {
  const reduced = useReducedMotion();
  return (
    <m.div
      className={cn("min-w-0", className)}
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!reduced && hover ? { y: -2 } : undefined}
      transition={{ duration: reduced ? 0 : 0.24, delay: reduced ? 0 : delay, ease }}
    >
      {children}
    </m.div>
  );
}
