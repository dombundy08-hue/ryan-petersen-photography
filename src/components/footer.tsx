import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { InstagramIcon } from "@/components/instagram-icon";
import { EMAIL, PHONE_DISPLAY, TEL_HREF, INSTAGRAM } from "@/lib/contact";
import { LogoMark } from "@/components/logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="flex items-center gap-2 font-heading text-base font-semibold text-foreground">
            <LogoMark className="size-6 shrink-0" />
            Ryan<span className="text-primary">Shutter</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Senior &middot; Family &middot; Nature &middot; Custom photography
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:gap-6">
          <a
            href={`mailto:${EMAIL}`}
            className="flex items-center gap-2 transition-colors hover:text-foreground"
          >
            <Mail className="size-4" />
            {EMAIL}
          </a>
          <a
            href={TEL_HREF}
            className="flex items-center gap-2 transition-colors hover:text-foreground"
          >
            <Phone className="size-4" />
            {PHONE_DISPLAY}
          </a>
          {/* Also feeds sameAs in the schema — a linked, matching profile
              is how Google ties the site and the Instagram account to one
              identity. */}
          <a
            href={INSTAGRAM}
            target="_blank"
            rel="me noopener noreferrer"
            className="flex items-center gap-2 transition-colors hover:text-foreground"
          >
            <InstagramIcon className="size-4" />
            @photography_ryn18_
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
