/**
 * Instagram glyph.
 *
 * lucide-react removed its brand icons, so there is no `Instagram` export
 * to import — this is the plain outline mark (rounded square, lens, flash
 * dot), drawn to the same 24x24 grid as the lucide icons it sits beside so
 * the stroke weights and sizing match.
 */
export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 8.7A3.3 3.3 0 1 0 12 15.3 3.3 3.3 0 0 0 12 8.7Zm0 5.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2Zm4.2-5.5a.8.8 0 1 1-1.6 0 .8.8 0 0 1 1.6 0ZM8.4 3.5h7.2a4.9 4.9 0 0 1 4.9 4.9v7.2a4.9 4.9 0 0 1-4.9 4.9H8.4a4.9 4.9 0 0 1-4.9-4.9V8.4a4.9 4.9 0 0 1 4.9-4.9Zm0 1.7A3.2 3.2 0 0 0 5.2 8.4v7.2a3.2 3.2 0 0 0 3.2 3.2h7.2a3.2 3.2 0 0 0 3.2-3.2V8.4a3.2 3.2 0 0 0-3.2-3.2H8.4Z" />
    </svg>
  );
}
