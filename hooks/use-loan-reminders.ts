"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "@/components/ui/toast";
import { db } from "@/lib/db";
import { formatMoney, toPersianDate } from "@/lib/format";
import {
  buildLoanPaymentReminders,
  loanReminderLeadText,
  loanReminderNotificationMetaKey,
  type LoanPaymentReminder,
} from "@/lib/loans/reminders";
import type { Loan, LoanPayment } from "@/lib/types";

export type LoanNotificationPermission = NotificationPermission | "unsupported";

function currentPermission(): LoanNotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

function notificationBody(reminder: LoanPaymentReminder) {
  return `${reminder.loanName} · ${loanReminderLeadText(reminder)} · ${formatMoney(reminder.amountToman, "toman", true)}`;
}

async function showSystemNotification(reminder: LoanPaymentReminder) {
  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification("یادآوری قسط پولم‌کو", {
      body: notificationBody(reminder),
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: `poolamkoo-${reminder.key}`,
      data: { url: `/loans/${reminder.loanId}`, reminderKey: reminder.key },
    });
    return;
  }
  new Notification("یادآوری قسط پولم‌کو", { body: notificationBody(reminder), tag: `poolamkoo-${reminder.key}` });
}

async function notifyOnce(reminder: LoanPaymentReminder) {
  const metaKey = loanReminderNotificationMetaKey(reminder.key);
  if (await db.appMeta.get(metaKey)) return;
  await showSystemNotification(reminder);
  await db.appMeta.put({ key: metaKey, value: new Date().toISOString(), updatedAt: new Date().toISOString() });
}

export function useLoanReminders(loans: Loan[], payments: LoanPayment[], runtimeReady = true) {
  const [permission, setPermission] = useState<LoanNotificationPermission>(() => currentPermission());
  const sessionToasts = useRef(new Set<string>());
  const pendingNotifications = useRef(new Set<string>());
  const reminders = useMemo(() => runtimeReady ? buildLoanPaymentReminders(loans, payments) : [], [loans, payments, runtimeReady]);
  const remindersKey = useMemo(() => reminders.map((reminder) => reminder.key).join("|"), [reminders]);

  useEffect(() => {
    if (!runtimeReady || !reminders.length) return;
    const reminder = reminders.find((item) => !sessionToasts.current.has(item.key));
    if (reminder) {
      sessionToasts.current.add(reminder.key);
      toast({
        id: `loan-reminder-${reminder.key}`,
        tone: reminder.urgency === "overdue" ? "error" : "info",
        title: reminder.urgency === "overdue" ? "قسط عقب‌افتاده" : "یادآوری قسط",
        description: `${reminder.loanName} · ${loanReminderLeadText(reminder)} · سررسید ${toPersianDate(reminder.dueAt)}`,
        duration: 10_000,
      });
    }

    if (currentPermission() !== "granted") return;
    for (const item of reminders.filter((entry) => entry.notifyBrowser)) {
      if (pendingNotifications.current.has(item.key)) continue;
      pendingNotifications.current.add(item.key);
      void notifyOnce(item).finally(() => pendingNotifications.current.delete(item.key));
    }
  }, [reminders, remindersKey, runtimeReady]);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return "unsupported" as const;
    }
    const next = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    setPermission(next);
    if (next === "granted") {
      for (const reminder of reminders.filter((item) => item.notifyBrowser)) await notifyOnce(reminder).catch(() => undefined);
    }
    return next;
  }, [reminders]);

  const forLoan = useCallback((loanId?: number) => reminders.find((reminder) => reminder.loanId === loanId) ?? null, [reminders]);
  return { reminders, urgent: reminders[0] ?? null, permission, requestPermission, forLoan };
}

export type LoanReminderControls = ReturnType<typeof useLoanReminders>;
