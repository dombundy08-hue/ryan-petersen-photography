import type { Ground } from "@/lib/flow";

/**
 * The seam-killer.
 *
 * Sits between two themed sections and fades one ground into the next. Both
 * stops name the neighbouring grounds directly, so the join is exact rather
 * than approximately close — which is the whole difference between colours
 * that flow and colours that cut.
 *
 * Rivian does exactly this: solid sections, with a dedicated gradient
 * element between each pair (#F2F2F2 → #8BA8BD, #000000 → #5D767D). No
 * scroll listeners, no JS, nothing to jank.
 */
export function Bridge({ from, to }: { from: Ground; to: Ground }) {
  return (
    <div
      aria-hidden="true"
      className="bridge"
      style={{
        backgroundImage: `linear-gradient(var(--flow-${from}), var(--flow-${to}))`,
      }}
    />
  );
}
