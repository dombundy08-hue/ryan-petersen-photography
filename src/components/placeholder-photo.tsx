import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_STYLES = {
  senior: "from-[#C2410C]/25 via-[#EA580C]/10 to-[#FAFAF9]",
  family: "from-[#78716C]/25 via-[#A8A29E]/10 to-[#FAFAF9]",
  nature: "from-[#166534]/20 via-[#4D7C0F]/10 to-[#FAFAF9]",
} as const;

type Category = keyof typeof CATEGORY_STYLES;

/**
 * No real photography is available yet (see docs/intake.md Open Items).
 * This renders a clearly-labeled placeholder tile instead of a fabricated
 * stock photo, so it never reads as a broken image.
 */
export function PlaceholderPhoto({
  category,
  label,
  className,
}: {
  category: Category;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`${label} — sample photo coming soon`}
      className={cn(
        "relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-xl border border-border bg-gradient-to-br",
        CATEGORY_STYLES[category],
        className
      )}
    >
      <div className="flex flex-col items-center gap-3 px-4 text-center">
        <Camera
          className="size-8 text-foreground/40"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <span className="text-sm font-medium text-foreground/70">
          {label}
        </span>
        <span className="text-xs text-muted-foreground">
          Photo coming soon
        </span>
      </div>
    </div>
  );
}
