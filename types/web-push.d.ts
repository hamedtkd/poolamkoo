declare module "web-push" {
  export interface PushSubscriptionLike {
    endpoint: string;
    expirationTime?: number | null;
    keys: { p256dh: string; auth: string };
  }

  export interface SendNotificationOptions {
    TTL?: number;
    urgency?: "very-low" | "low" | "normal" | "high";
  }

  export class WebPushError extends Error {
    statusCode: number;
    headers: Record<string, string | string[] | undefined>;
    body: string;
  }

  export function setVapidDetails(subject: string, publicKey: string, privateKey: string): void;
  export function sendNotification(subscription: PushSubscriptionLike, payload?: string | null, options?: SendNotificationOptions): Promise<unknown>;
}
