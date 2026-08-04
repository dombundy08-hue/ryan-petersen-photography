import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_STYLES = {
  senior: "from-[#D3A054]/25 via-[#8A6A3A]/15 to-[#1B1712]",
  family: "from-[#B7AA98]/20 via-[#5C4F3E]/15 to-[#1B1712]",
  nature: "from-[#5C7A4E]/25 via-[#3A4D30]/15 to-[#1B1712]",
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
