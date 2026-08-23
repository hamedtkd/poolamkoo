"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { PlanItem } from "@/lib/types";

export function PlanDeleteDialog({
  item,
  onOpenChange,
  onConfirm,
}: {
  item: PlanItem | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
}) {
  return (
    <AlertDialog open={!!item} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>حذف کارت «{item?.label}»؟</AlertDialogTitle>
          <AlertDialogDescription>
            این کارت از برنامه حذف می‌شود و سهم آن دوباره آزاد خواهد شد. خریدها یا موجودی واقعی قبلی حذف نمی‌شوند؛ فقط ارتباطشان با این کارت برنامه برداشته می‌شود.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>انصراف</AlertDialogCancel>
          <AlertDialogAction destructive onClick={() => void onConfirm()}>حذف کارت</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
