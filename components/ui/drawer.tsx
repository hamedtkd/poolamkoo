"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;

export function DrawerContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[105] bg-black/45 backdrop-blur-sm" />
      <DialogPrimitive.Content
        dir="rtl"
        className={cn("mobile-glass-panel fixed inset-x-0 bottom-0 z-[110] max-h-[88svh] overflow-y-auto rounded-t-[30px] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] outline-none", className)}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted-foreground/25" />
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DrawerTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <DialogPrimitive.Title className={cn("mb-3 text-center text-sm font-bold", className)}>{children}</DialogPrimitive.Title>;
}
