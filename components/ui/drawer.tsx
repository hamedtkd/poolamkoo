"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;

const DRAG_CLOSE_MIN_PX = 76;
const DRAG_CLOSE_RATIO = 0.17;

export function DrawerContent({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const dragPointer = React.useRef<number | null>(null);
  const startY = React.useRef(0);
  const dragYRef = React.useRef(0);
  const [dragY, setDragY] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);

  function setDrag(value: number) {
    const next = Math.max(0, value);
    dragYRef.current = next;
    setDragY(next);
  }

  function beginDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragPointer.current = event.pointerId;
    startY.current = event.clientY;
    setDrag(0);
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function moveDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (dragPointer.current !== event.pointerId) return;
    setDrag(event.clientY - startY.current);
  }

  function finishDrag(event: React.PointerEvent<HTMLButtonElement>, cancelled = false) {
    if (dragPointer.current !== event.pointerId) return;
    const completedDragY = dragYRef.current;
    dragPointer.current = null;
    try { event.currentTarget.releasePointerCapture?.(event.pointerId); } catch {}
    setDragging(false);

    if (cancelled) {
      setDrag(0);
      return;
    }

    const height = contentRef.current?.getBoundingClientRect().height ?? 0;
    const threshold = Math.max(DRAG_CLOSE_MIN_PX, height * DRAG_CLOSE_RATIO);
    if (completedDragY >= threshold) {
      closeRef.current?.click();
      window.setTimeout(() => setDrag(0), 180);
      return;
    }
    setDrag(0);
  }

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[105] bg-black/50 backdrop-blur-[3px] data-[state=open]:animate-fade data-[state=open]:animate-duration-200 data-[state=open]:animate-once data-[state=closed]:animate-fade data-[state=closed]:animate-reverse data-[state=closed]:animate-duration-150 data-[state=closed]:animate-once motion-reduce:animate-none" />
      <DialogPrimitive.Content
        ref={contentRef}
        id={id}
        dir="rtl"
        data-drawer-content="true"
        data-dragging={dragging ? "true" : "false"}
        style={{ "--drawer-drag-y": `${dragY}px` } as React.CSSProperties}
        className={cn(
          "drawer-drag-surface mobile-glass-panel fixed inset-x-0 bottom-0 z-[110] max-h-[88svh] overflow-y-auto overscroll-contain rounded-t-[30px] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] outline-none will-change-transform",
          "safe-drawer-motion",
          !dragging && "transition-[translate] duration-200 ease-out",
          className,
        )}
      >
        <button
          type="button"
          data-drawer-drag-handle="true"
          className="-mx-2 -mt-2 mb-1 flex h-11 w-[calc(100%+1rem)] cursor-grab touch-none select-none items-center justify-center active:cursor-grabbing"
          onPointerDown={beginDrag}
          onPointerMove={moveDrag}
          onPointerUp={(event) => finishDrag(event)}
          onPointerCancel={(event) => finishDrag(event, true)}
          onLostPointerCapture={() => {
            if (dragPointer.current !== null) {
              dragPointer.current = null;
              setDragging(false);
              setDrag(0);
            }
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            closeRef.current?.click();
          }}
          aria-label="بستن پنجره؛ به پایین بکشید"
        >
          <span className={cn("h-1.5 rounded-full bg-muted-foreground/35 transition-[width,background-color]", dragging ? "w-16 bg-muted-foreground/55" : "w-12")} />
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

export function DrawerDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <DialogPrimitive.Description className={cn("type-caption text-muted-foreground", className)}>{children}</DialogPrimitive.Description>;
}
