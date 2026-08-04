import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

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

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ryanpetersenphotography.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RyanShutter",
    template: "%s | RyanShutter",
  },
  description:
    "Senior, family, and nature photography by Ryan Petersen. Honest, local, and focused on capturing moments you'll want to look back on.",
  openGraph: {
    title: "RyanShutter",
    description:
      "Senior, family, and nature photography by Ryan Petersen. Honest, local, and focused on capturing moments you'll want to look back on.",
    siteName: "RyanShutter",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RyanShutter",
    description:
      "Senior, family, and nature photography by Ryan Petersen. Honest, local, and focused on capturing moments you'll want to look back on.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
