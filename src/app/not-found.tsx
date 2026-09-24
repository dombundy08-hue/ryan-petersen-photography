import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";

// Without this, the 404 inherited the home page's title and description,
// so every dead URL looked like a copy of /.
export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "That page doesn't exist. Browse the portfolio or book a session with RyanShutter.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Section data-theme="night" className="pt-16 sm:pt-20">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-4xl font-medium italic tracking-tight text-foreground sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-4 text-muted-foreground">
          That page has moved or never existed. The photos are all still here.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" nativeButton={false} render={<Link href="/portfolio" />}>
            See the Portfolio
          </Button>
          <Button
            size="lg"
            variant="secondary"
            nativeButton={false}
            render={<Link href="/contact" />}
          >
            Book a Session
          </Button>
        </div>
      </div>
    </Section>
  );
}
