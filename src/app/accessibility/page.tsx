import type { Metadata } from "next";
import { canonical } from "@/lib/site";
import { EMAIL, PHONE_DISPLAY, TEL_HREF } from "@/lib/contact";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description:
    "RyanShutter's commitment to an accessible website: what has been done to meet WCAG 2.2 AA, known limits, and how to get help or report a problem with any page.",
  alternates: { canonical: canonical("accessibility") },
};

export default function AccessibilityPage() {
  return (
    <LegalPage title="Accessibility Statement" updated="September 24, 2026">
      <p>
        I want everyone to be able to use ryanshutter.com, including people
        who use screen readers, keyboards, magnification or other assistive
        technology. The site aims to meet the Web Content Accessibility
        Guidelines (WCAG) 2.2, level AA.
      </p>

      <h2>What has been done</h2>
      <ul>
        <li>Every photo has a text description (alt text).</li>
        <li>Text and buttons are checked for colour contrast.</li>
        <li>Every page can be used with a keyboard alone.</li>
        <li>
          The moving photo strip on the home page has a pause button, and
          all motion stops if your device is set to reduce motion.
        </li>
        <li>Form fields have visible labels and clear error messages.</li>
      </ul>

      <h2>Known limits</h2>
      <p>
        New gallery photos are added often. Their descriptions are written
        automatically from the session and category, so they are general
        rather than a detailed description of each picture.
      </p>

      <h2>Need help or found a problem?</h2>
      <p>
        If any part of the site is hard to use, tell me and I will help you
        get what you need another way and work on a fix. Email{" "}
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a> or call{" "}
        <a href={TEL_HREF}>{PHONE_DISPLAY}</a>.
      </p>
    </LegalPage>
  );
}
