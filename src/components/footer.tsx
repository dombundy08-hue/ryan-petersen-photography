import Link from "next/link";
import { Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="font-heading text-base font-semibold text-foreground">
            Ryan<span className="text-primary">Shutter</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Senior &middot; Family &middot; Nature photography
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:gap-6">
          <a
            href="mailto:rpetersen2008@gmail.com"
            className="flex items-center gap-2 transition-colors hover:text-foreground"
          >
            <Mail className="size-4" />
            rpetersen2008@gmail.com
          </a>
          <a
            href="tel:+17206008854"
            className="flex items-center gap-2 transition-colors hover:text-foreground"
          >
            <Phone className="size-4" />
            (720) 600-8854
          </a>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} RyanShutter. All rights
        reserved. ·{" "}
        <Link href="/contact" className="hover:text-foreground">
          Get in touch
        </Link>
      </div>
    </footer>
  );
}
