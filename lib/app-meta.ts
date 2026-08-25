import { db } from "@/lib/db";

export async function setAppMeta(key: string, value: string) {
  await db.appMeta.put({ key, value, updatedAt: new Date().toISOString() });
}

export async function deleteAppMeta(key: string) {
  await db.appMeta.delete(key);
}
