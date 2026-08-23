"use client";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
export const Tabs = TabsPrimitive.Root;
export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) { return <TabsPrimitive.List className={cn("inline-flex h-10 items-center rounded-xl bg-muted p-1 text-muted-foreground", className)} {...props} />; }
export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) { return <TabsPrimitive.Trigger className={cn("rounded-lg px-3 py-1.5 text-xs font-semibold outline-none data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm", className)} {...props} />; }
export const TabsContent = TabsPrimitive.Content;
