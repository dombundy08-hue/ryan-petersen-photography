import { Section } from "@/components/section";

/**
 * Shared shell for the plain-text policy pages (privacy, accessibility).
 * Long-form reading, so one narrow column in the light room.
 */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <Section data-theme="hearth" className="pt-16 sm:pt-20">
      <article className="mx-auto max-w-2xl text-base leading-relaxed text-foreground/90 [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:text-foreground [&_li]:mt-2 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6">
        <h1 className="text-4xl font-medium italic tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">Last updated {updated}</p>
        {children}
      </article>
    </Section>
  );
}
