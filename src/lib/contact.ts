/**
 * Contact details, client-safe.
 *
 * lib/site.ts reads content/settings/business.json with node:fs, which a
 * "use client" component can't import. These mirror the same values for
 * use in client components — if the phone or email changes, change it in
 * business.json AND here.
 */
export const EMAIL = "rpetersen2008@gmail.com";
export const PHONE_DISPLAY = "(720) 600-8854";
export const TEL_HREF = "tel:+17206008854";
export const SMS_HREF = "sms:+17206008854";
export const INSTAGRAM = "https://www.instagram.com/photography_ryn18_/";

/**
 * A mailto: link with the subject and body already written.
 *
 * Opening a blank compose window makes the visitor do the work of
 * starting the message, which is where most of them stop. Pre-filling the
 * questions Ryan needs answered — date, place, type of session — means the
 * first email he receives is usually already a bookable enquiry.
 */
export function bookingMailto(sessionType?: string): string {
  const subject = sessionType
    ? `${sessionType} session enquiry`
    : "Photography session enquiry";

  const body = [
    "Hi Ryan,",
    "",
    `I'd like to book a ${sessionType ? sessionType.toLowerCase() : "photography"} session.`,
    "",
    "Roughly when: ",
    "Where: ",
    "How many people: ",
    "Anything else you should know: ",
    "",
    "Thanks!",
  ].join("\n");

  return `mailto:${EMAIL}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}
