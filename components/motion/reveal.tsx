"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type MotionRevealDirection = "up" | "down" | "left" | "right" | "fade";

const ease = [0.22, 1, 0.36, 1] as const;
const spring = { type: "spring", stiffness: 92, damping: 18, mass: 0.62 } as const;
const offsets: Record<MotionRevealDirection, { x: number; y: number }> = {
  up: { x: 0, y: 26 },
  down: { x: 0, y: -18 },
  left: { x: 12, y: 20 },
  right: { x: -12, y: 20 },
  fade: { x: 0, y: 14 },
};

export function MotionReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  hover = false,
  amount = 0.16,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: MotionRevealDirection;
  hover?: boolean;
  amount?: number;
}) {
  const reduced = useReducedMotion();
  const offset = offsets[direction];
  const initial = reduced ? false : {
    x: offset.x,
    y: offset.y,
    opacity: 0.72,
    scale: 0.982,
    filter: "blur(7px)",
  };

  return (
    <motion.div
      className={cn("min-w-0", className)}
      initial={initial}
      whileInView={{ x: 0, y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount }}
      whileHover={!reduced && hover ? { y: -2 } : undefined}
      transition={reduced ? { duration: 0 } : {
        x: { ...spring, delay },
        y: { ...spring, delay },
        scale: { ...spring, delay },
        opacity: { duration: 0.42, delay, ease },
        filter: { duration: 0.46, delay, ease },
      }}
    >
      {children}
    </motion.div>
  );
}
