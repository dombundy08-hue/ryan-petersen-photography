/**
 * RyanShutter mark.
 *
 * A shutter aperture: six blades struck from the same centre, drawn open
 * rather than closed so it reads as a lens letting light in. It is built
 * from one rotated triangle repeated six times, which is what a real
 * leaf shutter is — no decorative flourish invented on top.
 *
 * Colour comes from `currentColor` and the accent token, so the mark
 * re-skins with the section it sits in: bronze on the light grounds,
 * gold on the dark ones, without a second asset.
 */
export function LogoMark({ className }: { className?: string }) {
  const blades = [0, 60, 120, 180, 240, 300];

  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="RyanShutter"
      focusable="false"
    >
      {/* barrel */}
      <circle
        cx="16"
        cy="16"
        r="14.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.55"
      />
      {/* blades — each is the same wedge, rotated about the centre */}
      <g fill="var(--color-primary)">
        {blades.map((deg) => (
          <path
            key={deg}
            d="M16 4.6 L26.1 10.4 L22.7 12.4 Z"
            transform={`rotate(${deg} 16 16)`}
          />
        ))}
      </g>
      {/* the opening */}
      <circle cx="16" cy="16" r="3.4" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

/**
 * The full lockup: mark plus wordmark. "Ryan" in the running text colour,
 * "Shutter" in the accent, so the two halves separate without a second
 * weight or a colour that has to be redefined per theme.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark className="size-6 shrink-0" />
      <span className="font-heading text-base font-semibold tracking-tight">
        Ryan<span className="text-primary">Shutter</span>
      </span>
    </span>
  );
}
