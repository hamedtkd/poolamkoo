import {
  RiBarChartBoxLine,
  RiFundsLine,
  RiHistoryLine,
  RiHome5Line,
  RiSafe2Line,
  RiSettings3Line,
  RiWallet3Line,
} from "react-icons/ri";

export const appNav = [
  { href: "/dashboard", label: "خانه", shortLabel: "خانه", icon: RiHome5Line, tour: "home" },
  { href: "/income", label: "پول‌های ورودی", shortLabel: "ورودی‌ها", icon: RiWallet3Line, tour: "income" },
  { href: "/investments", label: "سرمایه‌گذاری", shortLabel: "سرمایه", icon: RiFundsLine, tour: "investments" },
  { href: "/funds", label: "صندوق‌ها", shortLabel: "صندوق‌ها", icon: RiSafe2Line, tour: "funds" },
  { href: "/activity", label: "تاریخچه", shortLabel: "تاریخچه", icon: RiHistoryLine, tour: "activity" },
  { href: "/reports", label: "گزارش‌ها", shortLabel: "گزارش", icon: RiBarChartBoxLine, tour: "reports" },
  { href: "/settings", label: "تنظیمات", shortLabel: "تنظیمات", icon: RiSettings3Line, tour: "settings" },
] as const;

// Mobile keeps the four highest-frequency money flows visible; activity/reports/settings stay one tap away in More.
export const mobilePrimaryNav = [appNav[0], appNav[1], appNav[2], appNav[3]] as const;

export function isAppNavActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}
