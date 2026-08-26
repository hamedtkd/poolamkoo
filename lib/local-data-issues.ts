export const LOCAL_DATA_TIMEOUT_CODE = "local-storage-timeout";
export const LOCAL_DATA_BLOCKED_CODE = "local-storage-blocked";
export const LOCAL_DATA_VERSION_CHANGE_CODE = "local-storage-versionchange";
export const LOCAL_DATA_BLOCKED_EVENT = "poolamkoo:local-data-blocked";
export const LOCAL_DATA_VERSION_CHANGE_EVENT = "poolamkoo:local-data-versionchange";

export type LocalDataIssue = {
  kind: "timeout" | "blocked" | "outdated" | "generic";
  action: "retry" | "reload";
  message?: string;
};

export function classifyLocalDataIssue(error: unknown): LocalDataIssue {
  const message = error instanceof Error ? error.message : "";
  const name = error instanceof Error ? error.name : "";

  if (message === LOCAL_DATA_TIMEOUT_CODE) {
    return {
      kind: "timeout",
      action: "retry",
      message: "مرورگر در زمان مناسب به فضای داده محلی پاسخ نداد. ممکن است IndexedDB مسدود شده باشد یا مرورگر در حالت خصوصی محدودیت اعمال کرده باشد.",
    };
  }
  if (message === LOCAL_DATA_BLOCKED_CODE) {
    return {
      kind: "blocked",
      action: "retry",
      message: "یک تب قدیمی پولم‌کو جلوی آماده‌شدن ساختار جدید داده را گرفته است. تب‌های دیگر پولم‌کو را ببند یا تازه‌سازی کن و بعد دوباره تلاش کن.",
    };
  }
  if (message === LOCAL_DATA_VERSION_CHANGE_CODE || name === "VersionError") {
    return {
      kind: "outdated",
      action: "reload",
      message: "ساختار داده محلی با نسخه جدیدتری از پولم‌کو باز شده است. برای جلوگیری از نوشتن با نسخه قدیمی، این تب متوقف شده؛ صفحه را تازه‌سازی کن.",
    };
  }
  return { kind: "generic", action: "retry" };
}
