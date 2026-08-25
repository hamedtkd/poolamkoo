"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import { m, useReducedMotion } from "motion/react";
import { RiCloseLine } from "react-icons/ri";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
      <div className="pointer-events-none fixed inset-0 z-[60] grid items-end sm:place-items-center sm:p-4">
        <DialogPrimitive.Content
          dir="rtl"
          className={cn(
            "mobile-glass-panel pointer-events-auto relative max-h-[90svh] w-full overflow-y-auto rounded-t-[30px] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl outline-none",
            "sm:max-h-[min(90svh,760px)] sm:w-[min(100%,32rem)] sm:rounded-2xl sm:bg-background sm:p-6",
            className,
          )}
        >
          <m.div data-motion-dialog-body initial={reduced ? false : { opacity: 0, y: 8, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: reduced ? 0 : 0.2 }}>
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted-foreground/20 sm:hidden" />
            {children}
          </m.div>
          <DialogPrimitive.Close className="absolute left-4 top-4 rounded-lg p-2 text-muted-foreground transition hover:bg-accent">
            <RiCloseLine className="size-5" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </div>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mb-5 space-y-1 pe-9", className)}>{children}</div>;
}

export function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <DialogPrimitive.Title className={cn("type-section-title", className)}>{children}</DialogPrimitive.Title>;
}

export function DialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <DialogPrimitive.Description className={cn("type-body type-muted", className)}>{children}</DialogPrimitive.Description>;
}
