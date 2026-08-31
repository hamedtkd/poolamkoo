import { SettingsOverview } from "@/components/settings/settings-overview";

// Compatibility export for older imports. The live /settings route now uses the categorized settings shell.
export function SettingsSection() {
  return <SettingsOverview />;
}
