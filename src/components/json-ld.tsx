/**
 * Renders a JSON-LD structured-data block.
 *
 * Follows the pattern in Next's own guide (node_modules/next/dist/docs/
 * 01-app/02-guides/json-ld.md): a native <script> tag, not next/script,
 * because this is data rather than executable code — and `<` is escaped to
 * < so a stray HTML tag inside any content string can't break out of
 * the script element.
 *
 * Undefined/empty values are stripped before serialising. Schema is a set
 * of factual claims to a search engine, so an absent field is always
 * better than a placeholder one.
 */
type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

function prune(value: Json): Json | undefined {
  if (Array.isArray(value)) {
    const items = value.map(prune).filter((v): v is Json => v !== undefined);
    return items.length ? items : undefined;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value)
      .map(([k, v]) => [k, prune(v)] as const)
      .filter((pair): pair is readonly [string, Json] => pair[1] !== undefined);
    return entries.length ? Object.fromEntries(entries) : undefined;
  }

  if (typeof value === "string" && value.trim() === "") return undefined;

  return value ?? undefined;
}

export function JsonLd({ data }: { data: Record<string, Json> }) {
  const pruned = prune(data);
  if (!pruned) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(pruned).replace(/</g, "\\u003c"),
      }}
    />
  );
}
