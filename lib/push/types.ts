import type { MarketAlertKind } from "@/lib/types";

export interface WebPushSubscriptionData {
  endpoint: string;
  expirationTime?: number | null;
  keys: { p256dh: string; auth: string };
}

export interface RemoteMarketAlert {
  id: number;
  marketId: string;
  symbol: string;
  kind: MarketAlertKind;
  threshold: number;
  enabled: boolean;
  armed: boolean;
  lastTriggeredAt?: string;
  updatedAt: string;
}

export interface PushDeviceRecord {
  version: 1;
  subscription: WebPushSubscriptionData;
  alerts: RemoteMarketAlert[];
  syncedAt: string;
}

export interface PushAlertState {
  id: number;
  armed: boolean;
  lastTriggeredAt?: string;
  updatedAt: string;
}
