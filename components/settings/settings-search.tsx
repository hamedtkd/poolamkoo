"use client";

import { useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { RiSearch2Line } from "react-icons/ri";
import { Input } from "@/components/ui/input";
import { moveSearchSelection, normalizeSearchText } from "@/lib/search";
import { cn } from "@/lib/utils";
import { getSettingsCategoryLabel, settingsSearchItems } from "@/components/settings/settings-navigation-model";

export function SettingsSearch() {
  const router = useRouter();
  const pathname = usePathname() || "/settings";
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);
  const normalized = normalizeSearchText(query);
  const results = useMemo(() => {
    if (!normalized) return [];
    return settingsSearchItems.filter((item) => normalizeSearchText(`${item.title} ${item.description} ${getSettingsCategoryLabel(item.categoryId)} ${item.keywords}`).includes(normalized)).slice(0, 8);
  }, [normalized]);
  const safeActiveIndex = results.length ? Math.min(activeIndex, results.length - 1) : -1;

  function openResult(index: number) {
    const item = results[index];
    if (!item) return;
    setQuery("");
    setActiveIndex(0);
    const [targetPath, hash] = item.href.split("#");
    if (targetPath === pathname && hash) {
      window.history.pushState(null, "", item.href);
      const target = document.getElementById(hash);
      if (target instanceof HTMLDetailsElement) target.open = true;
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    router.push(item.href);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => moveSearchSelection(current, results.length, event.key === "ArrowDown" ? 1 : -1));
      requestAnimationFrame(() => resultsRef.current?.querySelector<HTMLElement>("[data-settings-search-active='true']")?.scrollIntoView({ block: "nearest" }));
      return;
    }
    if (event.key === "Enter" && safeActiveIndex >= 0) {
      event.preventDefault();
      openResult(safeActiveIndex);
    }
    if (event.key === "Escape") {
      setQuery("");
      setActiveIndex(0);
    }
  }

  return <div className="relative z-30 w-full max-w-2xl">
    <RiSearch2Line className="pointer-events-none absolute end-3 top-1/2 z-10 size-5 -translate-y-1/2 text-muted-foreground" />
    <Input
      value={query}
      onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }}
      onKeyDown={onKeyDown}
      placeholder="مثلاً بکاپ، قانون پول، تم یا TSETMC..."
      aria-label="جست‌وجو در تنظیمات"
      aria-expanded={Boolean(normalized)}
      aria-controls="settings-search-results"
      role="combobox"
      className="h-11 bg-background pe-10"
    />
    {normalized ? <div id="settings-search-results" ref={resultsRef} role="listbox" className="absolute inset-x-0 top-[calc(100%+0.5rem)] max-h-[22rem] overflow-y-auto rounded-2xl border bg-popover p-1.5 shadow-xl">
      {results.length ? results.map((item, index) => {
        const Icon = item.icon;
        const active = index === safeActiveIndex;
        return <button
          key={item.id}
          type="button"
          role="option"
          aria-selected={active}
          data-settings-search-active={active}
          onMouseEnter={() => setActiveIndex(index)}
          onFocus={() => setActiveIndex(index)}
          onClick={() => openResult(index)}
          className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition", active ? "bg-accent" : "hover:bg-accent")}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-primary"><Icon className="size-4.5" /></span>
          <span className="min-w-0 flex-1">
            <span className="block type-label text-foreground">{item.title}</span>
            <span className="mt-0.5 block truncate type-caption text-muted-foreground">{getSettingsCategoryLabel(item.categoryId)} · {item.description}</span>
          </span>
        </button>;
      }) : <div className="p-5 text-center type-body text-muted-foreground">تنظیمی با این عبارت پیدا نشد.</div>}
    </div> : null}
  </div>;
}
