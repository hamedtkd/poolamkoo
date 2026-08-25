"use client";

import { RiSearch2Line } from "react-icons/ri";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { WatchlistFilter, WatchlistSort } from "@/lib/market/watchlist";

const filterOptions = [
  { value: "all", label: "همه نمادها" },
  { value: "unowned", label: "هنوز در سبد نیست" },
  { value: "owned", label: "در سبد من" },
  { value: "discount", label: "زیر NAV" },
  { value: "premium", label: "بالای NAV" },
];

const sortOptions = [
  { value: "newest", label: "جدیدترین" },
  { value: "gain", label: "بیشترین رشد امروز" },
  { value: "loss", label: "بیشترین افت امروز" },
  { value: "discount", label: "بیشترین تخفیف NAV" },
  { value: "premium", label: "بیشترین حباب NAV" },
  { value: "symbol", label: "نام نماد" },
];

export function MarketWatchlistToolbar({ query, onQueryChange, filter, onFilterChange, sort, onSortChange }: {
  query: string;
  onQueryChange: (value: string) => void;
  filter: WatchlistFilter;
  onFilterChange: (value: WatchlistFilter) => void;
  sort: WatchlistSort;
  onSortChange: (value: WatchlistSort) => void;
}) {
  return <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_180px_210px]">
    <div className="relative">
      <RiSearch2Line className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="جست‌وجو در دیده‌بان…" className="pe-9" />
    </div>
    <Select value={filter} onValueChange={(value) => onFilterChange(value as WatchlistFilter)} options={filterOptions} />
    <Select value={sort} onValueChange={(value) => onSortChange(value as WatchlistSort)} options={sortOptions} />
  </div>;
}
