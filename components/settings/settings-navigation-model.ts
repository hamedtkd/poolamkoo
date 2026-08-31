import type { IconType } from "react-icons";
import {
  RiBrush2Line,
  RiDatabase2Line,
  RiDeviceLine,
  RiInformationLine,
  RiInstallLine,
  RiLineChartLine,
  RiPulseLine,
  RiSafe2Line,
  RiShieldCheckLine,
  RiShieldKeyholeLine,
  RiWallet3Line,
} from "react-icons/ri";

export type SettingsCategoryId = "general" | "money" | "market" | "data" | "transfer" | "privacy" | "about";

export type SettingsCategory = {
  id: SettingsCategoryId;
  href: string;
  label: string;
  description: string;
  icon: IconType;
  highlights: string[];
};

export type SettingsSearchItem = {
  id: string;
  title: string;
  categoryId: SettingsCategoryId;
  description: string;
  keywords: string;
  href: string;
  icon: IconType;
};

export const settingsCategories: readonly SettingsCategory[] = [
  {
    id: "general",
    href: "/settings/general",
    label: "عمومی و ظاهر",
    description: "واحد نمایش، حالت روشن و تاریک، رنگ آماده یا سفارشی و حریم نمایش اعداد.",
    icon: RiBrush2Line,
    highlights: ["ظاهر و تم", "واحد پول", "حریم نمایش"],
  },
  {
    id: "money",
    href: "/settings/money",
    label: "برنامه پول",
    description: "قانون تقسیم پول، سبک درآمد، تحمل نوسان و هدف صندوق اضطراری.",
    icon: RiWallet3Line,
    highlights: ["قانون پول", "امنیت مالی", "صندوق اضطراری"],
  },
  {
    id: "market",
    href: "/settings/market",
    label: "بازار و قیمت‌ها",
    description: "وضعیت داده بازار، Providerها، refresh و جزئیات فنی سهمیه.",
    icon: RiPulseLine,
    highlights: ["وضعیت بازار", "Providerها", "Diagnostic"],
  },
  {
    id: "data",
    href: "/settings/data",
    label: "داده و بکاپ",
    description: "سلامت داده محلی، بکاپ رمزنگاری‌شده، بازیابی و Recovery Snapshot.",
    icon: RiDatabase2Line,
    highlights: ["سلامت داده", "بکاپ", "بازیابی"],
  },
  {
    id: "transfer",
    href: "/settings/transfer",
    label: "انتقال دستگاه",
    description: "جابه‌جایی مستقیم اطلاعات بین دو دستگاه بدون دیتابیس مرکزی.",
    icon: RiDeviceLine,
    highlights: ["ارسال داده", "دریافت داده", "WebRTC"],
  },
  {
    id: "privacy",
    href: "/settings/privacy",
    label: "حریم خصوصی و نصب",
    description: "مرز Analytics، نصب PWA و تنظیمات مرتبط با اجرای برنامه روی دستگاه.",
    icon: RiShieldCheckLine,
    highlights: ["Analytics", "حریم خصوصی", "نصب PWA"],
  },
  {
    id: "about",
    href: "/settings/about",
    label: "راهنما و درباره",
    description: "راهنما، GitHub، امنیت، مجوز و مسیرهای اعتماد پروژه.",
    icon: RiInformationLine,
    highlights: ["راهنما", "GitHub", "امنیت و مجوز"],
  },
] as const;

const categoryById = new Map(settingsCategories.map((category) => [category.id, category]));

export const settingsSearchItems: readonly SettingsSearchItem[] = [
  {
    id: "appearance",
    title: "ظاهر و رنگ تم",
    categoryId: "general",
    description: "حالت روشن، تاریک یا مطابق سیستم و رنگ آماده یا سفارشی رابط.",
    keywords: "ظاهر تم رنگ سفارشی hex رنگ دلخواه روشن تاریک سیستم theme dark light palette custom color appearance",
    href: "/settings/general#appearance",
    icon: RiBrush2Line,
  },
  {
    id: "display-unit",
    title: "واحد نمایش پول",
    categoryId: "general",
    description: "انتخاب نمایش تومان یا ریال بدون تغییر داده ذخیره‌شده.",
    keywords: "واحد پول تومان ریال currency display unit",
    href: "/settings/general#appearance",
    icon: RiWallet3Line,
  },
  {
    id: "financial-visibility",
    title: "مخفی کردن اعداد مالی",
    categoryId: "general",
    description: "محو کردن اعداد مالی در کل برنامه برای حریم نمایش.",
    keywords: "اعداد مالی مخفی محو چشم حریم نمایش hide privacy financial numbers",
    href: "/settings/general#appearance",
    icon: RiShieldCheckLine,
  },
  {
    id: "allocation-rule",
    title: "قانون تقسیم پول",
    categoryId: "money",
    description: "درصد زندگی، امنیت و رشد برای پول جدید.",
    keywords: "قانون پول تقسیم درصد زندگی امنیت رشد تخصیص allocation rule money split",
    href: "/settings/money#allocation-rule",
    icon: RiWallet3Line,
  },
  {
    id: "financial-safety",
    title: "امنیت مالی و صندوق اضطراری",
    categoryId: "money",
    description: "ثبات درآمد، تحمل نوسان و تعداد ماه‌های ذخیره اضطراری.",
    keywords: "امنیت مالی اضطراری درآمد ریسک نوسان هزینه ضروری emergency risk income safety",
    href: "/settings/money#financial-safety",
    icon: RiShieldKeyholeLine,
  },
  {
    id: "market-status",
    title: "وضعیت بازار و قیمت‌ها",
    categoryId: "market",
    description: "آخرین refresh، پوشش داده و سلامت دریافت قیمت‌ها.",
    keywords: "بازار قیمت refresh بروزرسانی وضعیت market price status quote",
    href: "/settings/market#market-status",
    icon: RiPulseLine,
  },
  {
    id: "market-providers",
    title: "Providerهای بازار و Diagnostic",
    categoryId: "market",
    description: "BrsApi، TSETMC، Tindex، سهمیه و Diagnostic امن.",
    keywords: "provider brsapi tsetmc tindex diagnostic سهمیه quota cooldown بازار",
    href: "/settings/market#market-details",
    icon: RiLineChartLine,
  },
  {
    id: "data-health",
    title: "سلامت داده محلی",
    categoryId: "data",
    description: "بررسی سازگاری داده‌ها و موارد قابل ترمیم روی همین دستگاه.",
    keywords: "سلامت داده دیتابیس بررسی تعمیر repair database local data health",
    href: "/settings/data#data-health",
    icon: RiDatabase2Line,
  },
  {
    id: "backup-restore",
    title: "بکاپ و بازیابی",
    categoryId: "data",
    description: "ساخت Backup، رمزنگاری، Restore و Recovery Snapshot.",
    keywords: "بکاپ بازیابی پشتیبان رمز backup restore recovery snapshot فایل داده",
    href: "/settings/data#backup-restore",
    icon: RiSafe2Line,
  },
  {
    id: "device-transfer",
    title: "انتقال بین دستگاه‌ها",
    categoryId: "transfer",
    description: "انتقال مستقیم داده به موبایل یا کامپیوتر جدید.",
    keywords: "انتقال دستگاه موبایل کامپیوتر ارسال دریافت webrtc transfer device sync",
    href: "/settings/transfer#device-transfer",
    icon: RiDeviceLine,
  },
  {
    id: "analytics-privacy",
    title: "Analytics و مرز داده",
    categoryId: "privacy",
    description: "وضعیت آمار استفاده و چیزهایی که هرگز وارد Analytics نمی‌شوند.",
    keywords: "analytics حریم خصوصی آمار داده privacy telemetry cloudflare",
    href: "/settings/privacy#analytics-privacy",
    icon: RiShieldCheckLine,
  },
  {
    id: "pwa-install",
    title: "نصب پولم‌کو روی دستگاه",
    categoryId: "privacy",
    description: "نصب PWA روی Home Screen و اجرای مستقل برنامه.",
    keywords: "نصب برنامه اپ pwa home screen install app device",
    href: "/settings/privacy#pwa-install",
    icon: RiInstallLine,
  },
  {
    id: "open-source",
    title: "راهنما، GitHub و اطلاعات پروژه",
    categoryId: "about",
    description: "راهنما، امنیت، مجوز MIT، کد منبع و راه‌های اعتماد.",
    keywords: "راهنما درباره github گیت هاب امنیت مجوز license open source help about",
    href: "/settings/about#open-source",
    icon: RiInformationLine,
  },
] as const;

export function getSettingsCategory(id: SettingsCategoryId) {
  return categoryById.get(id) ?? settingsCategories[0];
}

export function getSettingsCategoryForPath(pathname: string) {
  return settingsCategories.find((category) => pathname === category.href) ?? null;
}

export function getSettingsCategoryLabel(id: SettingsCategoryId) {
  return getSettingsCategory(id).label;
}
