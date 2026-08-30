"use client";

import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

export function AlertDialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm data-[state=open]:animate-fade data-[state=open]:animate-duration-200 data-[state=open]:animate-once data-[state=closed]:animate-fade data-[state=closed]:animate-reverse data-[state=closed]:animate-duration-150 data-[state=closed]:animate-once motion-reduce:animate-none" />
      <div className="pointer-events-none fixed inset-0 z-[90] grid items-end sm:place-items-center sm:p-4">
        <AlertDialogPrimitive.Content
          dir="rtl"
          className={cn(
            "mobile-glass-panel pointer-events-auto relative w-full rounded-t-[30px] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl outline-none",
            "sm:w-[min(100%,28rem)] sm:rounded-2xl sm:bg-background sm:p-6",
            "safe-modal-motion",
            className,
          )}
        >
          {children}
        </AlertDialogPrimitive.Content>
      </div>
    </AlertDialogPrimitive.Portal>
  );
}

export function AlertDialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}

export function AlertDialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <AlertDialogPrimitive.Title className={cn("type-section-title", className)}>{children}</AlertDialogPrimitive.Title>;
}

export function AlertDialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <AlertDialogPrimitive.Description className={cn("type-body text-muted-foreground", className)}>{children}</AlertDialogPrimitive.Description>;
}

export function AlertDialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}>{children}</div>;
}

export function AlertDialogCancel({ children = "انصراف" }: { children?: React.ReactNode }) {
  return (
    <AlertDialogPrimitive.Cancel asChild>
      <Button variant="outline">{children}</Button>
    </AlertDialogPrimitive.Cancel>
  );
}

export function AlertDialogAction({ children, onClick, destructive = false, disabled = false }: { children: React.ReactNode; onClick?: () => void; destructive?: boolean; disabled?: boolean }) {
  return (
    <AlertDialogPrimitive.Action asChild>
      <Button className={destructive ? "bg-destructive text-white hover:bg-destructive/90" : undefined} disabled={disabled} onClick={onClick}>
        {children}
      </Button>
    </AlertDialogPrimitive.Action>
  );
}
