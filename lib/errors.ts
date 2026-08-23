const PERSIAN_TEXT = /[\u0600-\u06ff]/;

export function toPersianUiError(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback;
  if (PERSIAN_TEXT.test(error.message)) return error.message;

  if (error.name === "SyntaxError") return "ساختار فایل معتبر نیست یا فایل ناقص است.";
  if (error.name === "OperationError" || /decrypt|operation failed|operation-specific/i.test(error.message)) {
    return "رمز بکاپ نادرست است یا فایل بکاپ آسیب دیده است.";
  }
  if (/network|fetch|failed to fetch|timeout/i.test(error.message)) return "ارتباط با سرویس برقرار نشد. دوباره تلاش کن.";

  return fallback;
}
