import Script from "next/script";
import { IS_LIVE_DOMAIN } from "@/lib/site";

/**
 * Google Analytics 4 (property "ryanshutter.com", account "Ryan Petersen Photography", linked to Search Console).
 * Production domain only, so previews and local builds never count as
 * visits. lazyOnload keeps it off the critical path for LCP.
 * Disclosed on /privacy — remove that section if this ever comes out.
 */
export const GA_MEASUREMENT_ID = "G-0YWQPLEMGC";

export function Analytics() {
  if (!IS_LIVE_DOMAIN) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="lazyOnload"
      />
      <Script id="ga4" strategy="lazyOnload">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  );
}
