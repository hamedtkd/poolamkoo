"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type MotionRevealDirection = "up" | "down" | "left" | "right" | "fade";

const ease = [0.22, 1, 0.36, 1] as const;
const offsets: Record<MotionRevealDirection, { x: number; y: number }> = {
  up: { x: 0, y: 22 },
  down: { x: 0, y: -18 },
  left: { x: 22, y: 0 },
  right: { x: -22, y: 0 },
  fade: { x: 0, y: 0 },
};

export function MotionReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  hover = false,
  amount = 0.22,
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
    opacity: direction === "fade" ? 0.78 : 0.86,
    filter: "blur(3px)",
  };

  return (
    <motion.div
      className={cn("min-w-0", className)}
      initial={initial}
      whileInView={{ x: 0, y: 0, opacity: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount }}
      whileHover={!reduced && hover ? { y: -2 } : undefined}
      transition={{ duration: reduced ? 0 : 0.48, delay: reduced ? 0 : delay, ease }}
    >
      {children}
    </motion.div>
  );
}
