import type { Metadata } from "next";
import Link from "next/link";
import { canonical } from "@/lib/site";
import { EMAIL, PHONE_DISPLAY, TEL_HREF } from "@/lib/contact";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How RyanShutter Photography handles the details you send through the booking form, what the site measures with Google Analytics, and how to ask for deletion.",
  alternates: { canonical: canonical("privacy") },
};

// Describes only what the site really does: Netlify hosting + Netlify
// Forms, Google Analytics, and outbound links. Update it if any of those
// change (a new form field, a newsletter, a booking tool).
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 24, 2026">
      <p>
        This website, ryanshutter.com, is run by Ryan Petersen (RyanShutter
        Photography) in Frederick, Colorado. This page explains what
        information the site collects, why, and what you can ask me to do
        with it.
      </p>

      <h2>What you send me</h2>
      <p>
        When you use the <Link href="/contact">booking form</Link>, you give
        me your name, email address, phone number (optional), the type of
        session you are interested in, and your message. The form is
        processed by Netlify, the company that hosts this site, and
        forwarded to me by email. If you email, call or text me directly,
        I receive whatever you choose to send.
      </p>
      <p>
        I use these details only to reply to you and to plan and deliver
        your session. I do not sell them, rent them, or add you to a mailing
        list.
      </p>

      <h2>What the site measures</h2>
      <p>
        The site uses Google Analytics to count visits and see which pages
        are viewed, roughly where visitors are (city level, worked out from
        the IP address), and what kind of device and browser they use.
        Google Analytics sets cookies in your browser to do this. The
        numbers help me see which photos and pages people find useful.
      </p>
      <p>
        You can block these cookies in your browser settings, or install
        Google&apos;s{" "}
        <a
          href="https://tools.google.com/dlpage/gaoptout"
          target="_blank"
          rel="noopener noreferrer"
        >
          Analytics opt-out add-on
        </a>
        . The site works the same either way. Netlify also keeps standard
        server logs (such as IP address and pages requested) to run and
        secure the site.
      </p>

      <h2>Photos</h2>
      <p>
        Photos in the portfolio are shown with the permission of the people
        in them. If you appear in a photo on this site and would like it
        removed, contact me and I will take it down.
      </p>

      <h2>Other sites</h2>
      <p>
        Links to Instagram and other sites take you to services with their
        own privacy policies. This site does not control what they collect.
      </p>

      <h2>Children</h2>
      <p>
        This site is not directed at children under 13, and I do not
        knowingly collect information from them. Senior sessions for
        students under 18 are arranged with a parent or guardian.
      </p>

      <h2>Your choices</h2>
      <p>
        You can ask me what information I hold about you, or ask me to
        correct or delete it. Email{" "}
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a> or call{" "}
        <a href={TEL_HREF}>{PHONE_DISPLAY}</a>.
      </p>

      <h2>Changes</h2>
      <p>
        If this policy changes, the new version will be posted on this page
        with a new &ldquo;Last updated&rdquo; date.
      </p>
    </LegalPage>
  );
}
