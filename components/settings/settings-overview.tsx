import Link from "next/link";
import { RiArrowLeftLine } from "react-icons/ri";
import { settingsCategories } from "@/components/settings/settings-navigation-model";

export function SettingsOverview() {
  return <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
    {settingsCategories.map((category) => {
      const Icon = category.icon;
      return <Link key={category.id} href={category.href} className="group flex min-h-48 flex-col justify-between rounded-2xl border bg-card p-4 transition hover:border-primary/30 hover:bg-primary/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <div>
          <span className="grid size-10 place-items-center rounded-2xl bg-primary/8 text-primary"><Icon className="size-5" /></span>
          <h2 className="mt-3 type-card-title">{category.label}</h2>
          <p className="mt-1.5 type-caption leading-6 text-muted-foreground">{category.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">{category.highlights.map((highlight) => <span key={highlight} className="rounded-full bg-muted px-2 py-1 text-[10px] text-muted-foreground">{highlight}</span>)}</div>
        </div>
        <span className="mt-4 flex items-center gap-1 type-caption type-body-strong text-primary">باز کردن <RiArrowLeftLine className="transition-transform group-hover:-translate-x-1" /></span>
      </Link>;
    })}
  </section>;
}
