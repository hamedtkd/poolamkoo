export const LEGACY_SCHEMA6_NATIVE_VERSION: number;
export const CURRENT_SCHEMA8_NATIVE_VERSION: number;
export const CURRENT_SCHEMA9_NATIVE_VERSION: number;
export const SCHEMA6_STORES: Record<string, string>;

export function legacySchema6SeedExpression(now: string): string;
export function migratedSchema9InspectionExpression(): string;
export function providerCollisionInsertExpression(now: string): string;
