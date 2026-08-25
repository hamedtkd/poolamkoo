export function backgroundPushFeatureEnabled(value = process.env.NEXT_PUBLIC_EXPERIMENTAL_BACKGROUND_PUSH) {
  return value === "1" || value === "true";
}

export const BACKGROUND_PUSH_EXPERIMENT_ENABLED = backgroundPushFeatureEnabled();
