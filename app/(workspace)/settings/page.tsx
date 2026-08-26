"use client";

import { SettingsSection } from "@/components/sections/settings";
import { useAppRuntime } from "@/components/app/app-runtime";

export default function SettingsPage() {
  const { data } = useAppRuntime();
  return <SettingsSection settings={data.settings} rule={data.rule} />;
}
