import { db } from "@/lib/db";
import { assetUsesManualPrice } from "@/lib/assets";
import type { InvestmentTransaction } from "@/lib/types";

export interface OpeningHoldingInput {
  assetId: number;
  quantity: number;
  unitPriceToman: number;
  happenedAt: string;
  note?: string;
}

export function openingHoldingTransaction(input: OpeningHoldingInput, createdAt = new Date().toISOString()): InvestmentTransaction {
  return {
    assetId: input.assetId,
    type: "buy",
    amountToman: Math.round(input.quantity * input.unitPriceToman),
    quantity: input.quantity,
    unitPriceToman: input.unitPriceToman,
    happenedAt: input.happenedAt,
    note: input.note ?? "موجودی اولیه / دارایی قبلی",
    createdAt,
  };
}

export async function saveOpeningHolding(input: OpeningHoldingInput) {
  const asset = await db.assets.get(input.assetId);
  if (!asset) throw new Error("دارایی انتخاب‌شده پیدا نشد.");
  const now = new Date().toISOString();
  await db.transaction("rw", db.transactions, db.assets, async () => {
    await db.transactions.add(openingHoldingTransaction(input, now));
    if (assetUsesManualPrice(asset.kind)) {
      await db.assets.update(asset.id!, { manualPriceToman: input.unitPriceToman, updatedAt: now });
    }
  });
}
