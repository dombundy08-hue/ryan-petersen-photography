import { SITE_URL, canonical, business, hasLocation } from "@/lib/site";
import type { Shoot } from "@/lib/shoots";

/**
 * Structured data for the site.
 *
 * Everything here is built from content/settings/business.json and the
 * shoot JSON — nothing is invented. Blank fields are dropped by <JsonLd>,
 * so an unconfirmed city simply doesn't appear rather than being guessed.
 */

const ORG_ID = `${SITE_URL}/#business`;
const PERSON_ID = `${SITE_URL}/#ryan`;

/**
 * ProfessionalService rather than LocalBusiness: this is a photographer who
 * travels to sessions, not a storefront customers visit. Without a public
 * street address, LocalBusiness would be claiming a premises that isn't
 * there. `areaServed` carries the local signal instead.
 */
export function businessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": ORG_ID,
    name: business.name,
    legalName: business.legalName,
    additionalType: "https://schema.org/PhotographyBusiness",
    url: canonical(),
    email: business.email,
    telephone: business.telephone,
    priceRange: business.priceRange,
    founder: { "@id": PERSON_ID },
    address: hasLocation
      ? {
          "@type": "PostalAddress",
          addressLocality: business.city,
          addressRegion: business.region,
          addressCountry: business.country,
        }
      : null,
    // The named towns plus the wider state. Ryan travels, so the state
    // entry is the honest upper bound and the towns carry the local signal.
    areaServed: [
      ...business.serviceArea.map((area) => ({
        "@type": "City",
        name: `${area}, ${business.region}`,
      })),
      business.serviceAreaState
        ? { "@type": "State", name: business.serviceAreaState }
        : null,
    ],
    sameAs: business.sameAs,
  };
}

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: business.photographer,
    jobTitle: "Photographer",
    worksFor: { "@id": ORG_ID },
    url: canonical("about"),
  };
}

/**
 * An ImageGallery per shoot. Each photograph becomes an ImageObject
 * carrying its own alt text as the caption, which is how image search
 * reads a gallery page.
 */
export function shootSchema(shoot: Shoot) {
  const url = canonical(`portfolio/${shoot.category}/${shoot.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "@id": `${url}#gallery`,
    name: shoot.title,
    description: shoot.description,
    url,
    provider: { "@id": ORG_ID },
    image: shoot.photos.map((photo) => ({
      "@type": "ImageObject",
      contentUrl: `${SITE_URL}${photo.src}`,
      caption: photo.alt,
      creator: { "@id": PERSON_ID },
      creditText: business.name,
    })),
  };
}

/** Breadcrumbs give search results the Home › Portfolio › Shoot trail. */
export function breadcrumbSchema(
  trail: { name: string; route: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: step.name,
      item: canonical(step.route),
    })),
  };
}
