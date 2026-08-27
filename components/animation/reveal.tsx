import { Children } from "react";
import { cn } from "@/lib/utils";

export type RevealDirection = "up" | "down" | "left" | "right" | "fade";

const directionClasses: Record<RevealDirection, string> = {
  up: "animate-fade-up",
  down: "animate-fade-down",
  left: "animate-fade-left",
  right: "animate-fade-right",
  fade: "animate-fade",
};

const delayClasses = [
  "animate-delay-none",
  "animate-delay-[55ms]",
  "animate-delay-[110ms]",
  "animate-delay-[165ms]",
  "animate-delay-[220ms]",
  "animate-delay-[275ms]",
  "animate-delay-[330ms]",
  "animate-delay-[385ms]",
  "animate-delay-[440ms]",
] as const;

export function Reveal({ children, className, direction = "up", step = 0, hover = false }: {
  children: React.ReactNode;
  className?: string;
  direction?: RevealDirection;
  step?: number;
  hover?: boolean;
}) {
  const delay = delayClasses[Math.min(Math.max(step, 0), delayClasses.length - 1)];
  return (
    <div
      className={cn(
        "min-w-0 animate-once animate-duration-[480ms] animate-ease-out animate-fill-both motion-reduce:animate-none",
        directionClasses[direction],
        delay,
        hover && "transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function RevealGrid({ children, className, startStep = 0, flow = "up" }: {
  children: React.ReactNode;
  className?: string;
  startStep?: number;
  flow?: "up" | "sides";
}) {
  const items = Children.toArray(children);
  return (
    <div className={className}>
      {items.map((child, index) => (
        <Reveal
          key={index}
          step={startStep + index}
          direction={flow === "sides" ? (index % 2 === 0 ? "right" : "left") : "up"}
          className="h-full"
        >
          {child}
        </Reveal>
      ))}
    </div>
  );
}
