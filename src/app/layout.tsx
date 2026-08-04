import type { Metadata } from "next";
import { Archivo, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const archivo = Archivo({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ryanpetersenphotography.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RP Photography",
    template: "%s | RP Photography",
  },
  description:
    "Senior, family, and nature photography by Ryan Petersen. Honest, local, and focused on capturing moments you'll want to look back on.",
  openGraph: {
    title: "RP Photography",
    description:
      "Senior, family, and nature photography by Ryan Petersen. Honest, local, and focused on capturing moments you'll want to look back on.",
    siteName: "RP Photography",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RP Photography",
    description:
      "Senior, family, and nature photography by Ryan Petersen. Honest, local, and focused on capturing moments you'll want to look back on.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
