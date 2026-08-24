"use client";

import { Label } from "@/components/ui/label";

export function SettingsField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-2"><Label>{label}</Label>{children}</div>;
}
