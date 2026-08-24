import { cn } from "@/lib/utils";

export function SensitiveValue({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span data-sensitive="true" className={cn("inline-block", className)}>{children}</span>;
}
