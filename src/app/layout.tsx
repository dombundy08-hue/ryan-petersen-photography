import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { SITE_URL, SITE_DESCRIPTION, IS_LIVE_DOMAIN } from "@/lib/site";
import { businessSchema, personSchema } from "@/lib/schema";

const fraunces = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Belt and braces with robots.txt: a disallowed page can still be
  // indexed if something links to it, whereas noindex in the page itself
  // cannot. Both come off together when the domain goes live.
  robots: IS_LIVE_DOMAIN
    ? undefined
    : { index: false, follow: false, nocache: true },
  // NO `alternates.canonical` here. Metadata is inherited, so a canonical
  // set on the root layout is applied to every page that doesn't override
  // it — which made /about, /contact and /portfolio all declare themselves
  // duplicates of the home page. Each page sets its own.
  // "RyanShutter" alone is a brand nobody is searching for yet. The title
  // has to carry what he does and where, or it can only ever be found by
  // people who already know the name.
  title: {
    default: "RyanShutter | Senior, Family & Nature Photographer in Frederick, CO",
    template: "%s | RyanShutter — Frederick, CO Photographer",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: "RyanShutter | Photographer in Frederick, Colorado",
    description: SITE_DESCRIPTION,
    siteName: "RyanShutter",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RyanShutter | Photographer in Frederick, Colorado",
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Site-wide structured data. Rendered once here rather than per
            page so the business and photographer entities have a single
            @id everything else can reference. */}
        <JsonLd data={businessSchema()} />
        <JsonLd data={personSchema()} />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
