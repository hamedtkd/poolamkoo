import {
  RiBarChartBoxLine,
  RiFundsLine,
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
  { href: "/reports", label: "گزارش‌ها", shortLabel: "گزارش", icon: RiBarChartBoxLine, tour: "reports" },
  { href: "/settings", label: "تنظیمات", shortLabel: "تنظیمات", icon: RiSettings3Line, tour: "settings" },
] as const;
