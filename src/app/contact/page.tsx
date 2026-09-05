import type { Metadata } from "next";
import { canonical } from "@/lib/site";
import { Mail, Phone, Clock } from "lucide-react";
import { InstagramIcon } from "@/components/instagram-icon";
import { Section } from "@/components/section";
import { ContactForm } from "@/components/contact-form";
import {
  EMAIL,
  PHONE_DISPLAY,
  TEL_HREF,
  INSTAGRAM,
  bookingMailto,
} from "@/lib/contact";

export const metadata: Metadata = {
  title: "Book a Session",
  description:
    "Book a senior, family, nature or custom photography session with Ryan Petersen, local to Frederick, Colorado. Sessions are free while he builds his portfolio — call, text or email.",
  alternates: { canonical: canonical("contact") },
};

export default function ContactPage() {
  return (
    <Section data-theme="cocoa" className="pt-16 pb-20 sm:pt-20">
      <div className="mx-auto max-w-2xl rounded-2xl border-2 border-primary bg-primary px-8 py-10 text-center shadow-[0_0_60px_-15px_var(--color-primary)]">
        <h1 className="text-4xl font-medium italic tracking-tight text-primary-foreground sm:text-5xl">
          Let&apos;s Talk
        </h1>
        <p className="mt-4 text-primary-foreground/80">
          Send a message with what you have in mind, and I&apos;ll respond
          personally to work out the details.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-10 md:grid-cols-[1fr_1.3fr]">
        <div className="space-y-6">
          {/* Solid, button-shaped actions rather than quiet link tiles.
              The email one opens a compose window with the subject and
              questions already written — a blank window is where most
              people stop, and a pre-filled one usually arrives as an
              already-bookable enquiry. */}
          <a
            href={bookingMailto()}
            className="flex w-full items-center gap-3 rounded-xl bg-primary px-5 py-4 font-medium text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
              <Mail className="size-4" aria-hidden="true" />
            </span>
            <span className="text-left">
              <span className="block text-sm font-semibold">
                Email me — draft ready
              </span>
              <span className="block text-sm text-primary-foreground/75">
                {EMAIL}
              </span>
            </span>
          </a>
          <a
            href={TEL_HREF}
            className="flex w-full items-center gap-3 rounded-xl border-2 border-primary bg-card px-5 py-4 font-medium text-foreground transition-transform hover:-translate-y-0.5"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Phone className="size-4" aria-hidden="true" />
            </span>
            <span className="text-left">
              <span className="block text-sm font-semibold">Call or text</span>
              <span className="block text-sm text-muted-foreground">
                {PHONE_DISPLAY}
              </span>
            </span>
          </a>
          <a
            href={INSTAGRAM}
            target="_blank"
            rel="me noopener noreferrer"
            className="flex w-full items-center gap-3 rounded-xl border-2 border-primary/60 bg-card px-5 py-4 font-medium text-foreground transition-transform hover:-translate-y-0.5 hover:border-primary"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <InstagramIcon className="size-4" />
            </span>
            <span className="text-left">
              <span className="block text-sm font-semibold">
                Message on Instagram
              </span>
              <span className="block text-sm text-muted-foreground">
                @photography_ryn18_
              </span>
            </span>
          </a>
          <div className="flex items-start gap-3 rounded-xl border-2 border-primary/60 bg-secondary/40 p-5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Clock className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">
                Response time
              </p>
              <p className="text-sm text-muted-foreground">
                Every inquiry gets a personal reply — no automated
                responses.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border-2 border-primary/50 bg-card p-6 shadow-[0_0_40px_-20px_var(--color-primary)] sm:p-8">
          <ContactForm />
        </div>
      </div>
    </Section>
  );
}
