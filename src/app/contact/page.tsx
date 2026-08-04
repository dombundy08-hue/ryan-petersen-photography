import type { Metadata } from "next";
import { Mail, Phone, Clock } from "lucide-react";
import { Section } from "@/components/section";
import { ContactForm } from "@/components/contact-form";
import { ContactPhotoMarquee } from "@/components/contact-photo-marquee";
import { samplePhotos } from "@/lib/shoots";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch to book a senior, family, or nature photography session with Ryan Petersen.",
};

export default function ContactPage() {
  const marqueePhotos = samplePhotos(14);

  return (
    <Section className="relative overflow-hidden pt-16 pb-20 sm:pt-20">
      <ContactPhotoMarquee photos={marqueePhotos} />
      <div className="relative mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-medium italic tracking-tight text-foreground sm:text-5xl">
          Let&apos;s Talk
        </h1>
        <p className="mt-4 text-muted-foreground">
          Send a message with what you have in mind, and I&apos;ll respond
          personally to work out the details.
        </p>
      </div>

      <div className="relative mx-auto mt-12 grid max-w-4xl gap-10 md:grid-cols-[1fr_1.3fr]">
        <div className="space-y-6">
          <a
            href="mailto:rpetersen2008@gmail.com"
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <Mail className="mt-0.5 size-5 text-primary" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-foreground">Email</p>
              <p className="text-sm text-muted-foreground">
                rpetersen2008@gmail.com
              </p>
            </div>
          </a>
          <a
            href="tel:+17206008854"
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <Phone className="mt-0.5 size-5 text-primary" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-foreground">Phone</p>
              <p className="text-sm text-muted-foreground">
                (720) 600-8854
              </p>
            </div>
          </a>
          <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/40 p-5">
            <Clock className="mt-0.5 size-5 text-primary" aria-hidden="true" />
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

        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <ContactForm />
        </div>
      </div>
    </Section>
  );
}
