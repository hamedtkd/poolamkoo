"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RiAddLine, RiFundsLine, RiSafe2Line, RiSearch2Line, RiWallet3Line } from "react-icons/ri";
import { appNav } from "@/components/app/navigation";
import { getSettingsCategoryLabel, settingsSearchItems } from "@/components/settings/settings-navigation-model";
import { useAppRuntime } from "@/components/app/app-runtime";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "@/hooks/use-media-query";
import { moveSearchSelection, normalizeSearchText } from "@/lib/search";
import { cn } from "@/lib/utils";

type SearchItem = {
  id: string;
  title: string;
  subtitle: string;
  keywords: string;
  icon: React.ReactNode;
  action: () => void;
};

export function GlobalSearch({ open, onOpenChange, onNewMoney }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewMoney: () => void;
}) {
  const router = useRouter();
  const { data } = useAppRuntime();
  const mobile = useMediaQuery("(max-width: 767px)");
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  const items = useMemo<SearchItem[]>(() => {
    const closeAndRoute = (href: string) => () => {
      onOpenChange(false);
      router.push(href);
    };
    const navItems = appNav.map((item) => {
      const Icon = item.icon;
      return {
        id: `nav:${item.href}`,
        title: item.label,
        subtitle: "بخش برنامه",
        keywords: `${item.label} ${item.shortLabel} navigation page`,
        icon: <Icon className="size-5" />,
        action: closeAndRoute(item.href),
      } satisfies SearchItem;
    });
    const settingItems = settingsSearchItems.map((item) => {
      const Icon = item.icon;
      return {
        id: `setting:${item.id}`,
        title: item.title,
        subtitle: `تنظیم · ${getSettingsCategoryLabel(item.categoryId)}`,
        keywords: `${item.description} ${item.keywords} settings preference`,
        icon: <Icon className="size-5" />,
        action: closeAndRoute(item.href),
      } satisfies SearchItem;
    });
    const incomes = data.incomes.slice(0, 30).map((income) => ({
      id: `income:${income.id ?? income.createdAt}`,
      title: income.title,
      subtitle: "پول ورودی",
      keywords: `${income.title} ${income.amountToman} income money`,
      icon: <RiWallet3Line className="size-5" />,
      action: closeAndRoute("/income"),
    }));
    const funds = data.funds.slice(0, 30).map((fund) => ({
      id: `fund:${fund.id ?? fund.createdAt}`,
      title: fund.name,
      subtitle: "صندوق",
      keywords: `${fund.name} ${fund.category} fund goal`,
      icon: <RiSafe2Line className="size-5" />,
      action: closeAndRoute("/funds"),
    }));
    const assets = data.assets.slice(0, 30).map((asset) => ({
      id: `asset:${asset.id ?? asset.createdAt}`,
      title: asset.name,
      subtitle: asset.symbol ? `دارایی · ${asset.symbol}` : "دارایی",
      keywords: `${asset.name} ${asset.symbol ?? ""} ${asset.kind} investment`,
      icon: <RiFundsLine className="size-5" />,
      action: closeAndRoute("/investments"),
    }));
    return [{
      id: "action:new-money",
      title: "پول جدید دارم",
      subtitle: "ثبت پول ورودی و ساخت برنامه",
      keywords: "پول جدید درآمد new money income add",
      icon: <RiAddLine className="size-5" />,
      action: () => {
        onOpenChange(false);
        onNewMoney();
      },
    }, ...navItems, ...settingItems, ...incomes, ...funds, ...assets];
  }, [data.assets, data.funds, data.incomes, onNewMoney, onOpenChange, router]);

  const normalized = normalizeSearchText(query);
  const quickItems = useMemo(() => {
    const ids = new Set(["action:new-money", "nav:/activity", "nav:/reports", "nav:/settings"]);
    return items.filter((item) => ids.has(item.id));
  }, [items]);
  const results = useMemo(() => {
    if (!normalized) return [];
    return items.filter((item) => normalizeSearchText(`${item.title} ${item.subtitle} ${item.keywords}`).includes(normalized)).slice(0, 12);
  }, [items, normalized]);
  const visibleItems = normalized ? results : quickItems;
  const safeActiveIndex = visibleItems.length ? Math.min(Math.max(activeIndex, 0), visibleItems.length - 1) : -1;

  useEffect(() => {
    resultsRef.current?.querySelector<HTMLElement>("[data-search-active='true']")?.scrollIntoView({ block: "nearest" });
  }, [safeActiveIndex]);

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => moveSearchSelection(current, visibleItems.length, event.key === "ArrowDown" ? 1 : -1));
      return;
    }
    if (event.key === "Home" && visibleItems.length) {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (event.key === "End" && visibleItems.length) {
      event.preventDefault();
      setActiveIndex(visibleItems.length - 1);
      return;
    }
    if (event.key === "Enter" && visibleItems[safeActiveIndex]) {
      event.preventDefault();
      visibleItems[safeActiveIndex].action();
    }
  }

  function setOpen(next: boolean) {
    onOpenChange(next);
    if (!next) setQuery("");
    setActiveIndex(0);
  }

  const panel = (
    <SearchPanel
      query={query}
      onQueryChange={(value) => { setQuery(value); setActiveIndex(0); }}
      onInputKeyDown={onInputKeyDown}
      items={visibleItems}
      searching={Boolean(normalized)}
      activeIndex={safeActiveIndex}
      onActiveIndexChange={setActiveIndex}
      resultsRef={resultsRef}
    />
  );

  if (mobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="px-4 pt-0">
          <DrawerTitle className="mb-1 text-start type-card-title">جست‌وجوی پولم‌کو</DrawerTitle>
          <DrawerDescription className="mb-4">اسم یک بخش، تنظیم، پول ورودی، صندوق یا دارایی را بنویس.</DrawerDescription>
          {panel}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:w-[min(100%,38rem)] sm:p-5">
        <DialogHeader className="mb-4">
          <DialogTitle>جست‌وجوی پولم‌کو</DialogTitle>
          <DialogDescription>اسم یک بخش، تنظیم، پول ورودی، صندوق یا دارایی را بنویس.</DialogDescription>
        </DialogHeader>
        {panel}
      </DialogContent>
    </Dialog>
  );
}

function SearchPanel({ query, onQueryChange, onInputKeyDown, items, searching, activeIndex, onActiveIndexChange, resultsRef }: {
  query: string;
  onQueryChange: (value: string) => void;
  onInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  items: SearchItem[];
  searching: boolean;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  resultsRef: React.RefObject<HTMLDivElement | null>;
}) {
  const activeOptionId = activeIndex >= 0 ? `global-search-result-${activeIndex}` : undefined;
  return (
    <>
      <div className="relative">
        <RiSearch2Line className="pointer-events-none absolute end-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          role="combobox"
          aria-label="جست‌وجوی پولم‌کو"
          aria-controls="global-search-results"
          aria-expanded="true"
          aria-autocomplete="list"
          aria-activedescendant={activeOptionId}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder="مثلاً طلا، بکاپ، قانون پول یا گزارش‌ها..."
          className="h-12 pe-10"
        />
      </div>
      <div className="sr-only" aria-live="polite">{searching ? (items.length ? `${items.length} نتیجه پیدا شد` : "نتیجه‌ای پیدا نشد") : `${items.length} میانبر پیشنهادی`}</div>

      <div className="mt-3 flex items-center justify-between type-caption text-muted-foreground">
        <span>{searching ? "نتایج" : "میانبرها"}</span>
        {!searching ? <span>برای نتیجه دقیق‌تر شروع به تایپ کن</span> : null}
      </div>
      <div id="global-search-results" ref={resultsRef} role="listbox" aria-label={searching ? "نتایج جست‌وجو" : "میانبرهای جست‌وجو"} className="mt-2 max-h-[min(48svh,26rem)] space-y-1 overflow-y-auto">
        {items.length ? items.map((item, index) => (
          <button
            id={`global-search-result-${index}`}
            key={item.id}
            type="button"
            role="option"
            aria-selected={activeIndex === index}
            data-search-active={activeIndex === index}
            onMouseEnter={() => onActiveIndexChange(index)}
            onFocus={() => onActiveIndexChange(index)}
            onClick={item.action}
            className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", activeIndex === index ? "bg-accent text-foreground" : "hover:bg-accent")}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">{item.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate type-label text-foreground">{item.title}</span>
              <span className="mt-0.5 block truncate type-caption text-muted-foreground">{item.subtitle}</span>
            </span>
          </button>
        )) : (
          <div className="rounded-xl border border-dashed p-7 text-center type-body text-muted-foreground">نتیجه‌ای پیدا نشد.</div>
        )}
      </div>
      <div className="mt-3 hidden items-center justify-between border-t pt-3 type-caption text-muted-foreground sm:flex">
        <span>↑ ↓ انتخاب · Enter باز کردن</span>
        <span>Ctrl / ⌘ + K</span>
      </div>
    </>
  );
}
