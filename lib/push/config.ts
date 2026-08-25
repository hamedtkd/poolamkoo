import { backgroundPushFeatureEnabled } from "@/lib/push/feature";

export function pushServerConfig() {
  const featureEnabled = backgroundPushFeatureEnabled();
  const publicKey = process.env.WEB_PUSH_VAPID_PUBLIC_KEY?.trim() ?? "";
  const privateKey = process.env.WEB_PUSH_VAPID_PRIVATE_KEY?.trim() ?? "";
  const subject = process.env.WEB_PUSH_VAPID_SUBJECT?.trim() ?? "";
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim() ?? "";
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ?? "";
  const cronSecret = process.env.CRON_SECRET?.trim() ?? "";
  const marketToken = process.env.TINDEX_API_TOKEN?.trim() ?? "";
  const validSubject = subject.startsWith("mailto:") || subject.startsWith("https://");
  return {
    featureEnabled,
    publicKey,
    privateKey,
    subject,
    redisUrl,
    redisToken,
    cronSecret,
    marketToken,
    configured: Boolean(featureEnabled && publicKey && privateKey && validSubject && redisUrl && redisToken && cronSecret && marketToken),
  };
}
