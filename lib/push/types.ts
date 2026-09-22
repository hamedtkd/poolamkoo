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

export interface RemoteLoanReminder {
  loanId: number;
  installmentNo: number;
  dueAt: string;
  reminderDays: number[];
  timeZone: string;
  enabled: boolean;
  sentKeys: string[];
  updatedAt: string;
}

export interface RemoteLoanRiskAlert {
  id: number;
  loanId: number;
  assetId: number;
  marketId: string;
  thresholdHours: number;
  rearmHours: number;
  enabled: boolean;
  armed: boolean;
  lastTriggeredAt?: string;
  updatedAt: string;
}

export interface PushDeviceRecord {
  version: 1 | 2 | 3;
  subscription: WebPushSubscriptionData;
  alerts: RemoteMarketAlert[];
  loanReminders?: RemoteLoanReminder[];
  loanRiskAlerts?: RemoteLoanRiskAlert[];
  syncedAt: string;
}

export interface PushAlertState {
  id: number;
  armed: boolean;
  lastTriggeredAt?: string;
  updatedAt: string;
}
