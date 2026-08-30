export const LEGACY_SCHEMA6_NATIVE_VERSION: number;
export const CURRENT_SCHEMA7_NATIVE_VERSION: number;
export const SCHEMA6_STORES: Record<string, string>;

export function legacySchema6SeedExpression(now: string): string;
export function migratedSchema7InspectionExpression(): string;
export function providerCollisionInsertExpression(now: string): string;
