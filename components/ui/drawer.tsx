"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;

export function DrawerContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const startY = React.useRef(0);
  const [dragY, setDragY] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);

  function beginDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    startY.current = event.clientY;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (!dragging) return;
    setDragY(Math.max(0, event.clientY - startY.current));
  }

  function endDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (!dragging) return;
    setDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (dragY > 92) closeRef.current?.click();
    else setDragY(0);
  }

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[105] bg-black/50 backdrop-blur-[3px] data-[state=open]:animate-in data-[state=closed]:animate-out" />
      <DialogPrimitive.Content
        dir="rtl"
        style={{ transform: `translate3d(0, ${dragY}px, 0)` }}
        className={cn(
          "mobile-glass-panel fixed inset-x-0 bottom-0 z-[110] max-h-[88svh] overflow-y-auto overscroll-contain rounded-t-[30px] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] outline-none will-change-transform",
          !dragging && "transition-transform duration-200 ease-out",
          className,
        )}
      >
        <button
          type="button"
          className="-mx-2 -mt-2 mb-2 flex h-9 w-[calc(100%+1rem)] cursor-grab touch-none items-center justify-center active:cursor-grabbing"
          onPointerDown={beginDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          aria-label="برای بستن به پایین بکشید"
        >
          <span className="h-1.5 w-12 rounded-full bg-muted-foreground/35" />
        </button>
        {children}
        <DialogPrimitive.Close asChild>
          <button ref={closeRef} type="button" className="sr-only" tabIndex={-1}>بستن</button>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DrawerTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <DialogPrimitive.Title className={cn("mb-3 text-center type-label", className)}>{children}</DialogPrimitive.Title>;
}
