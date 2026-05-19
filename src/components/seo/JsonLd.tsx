import { Property } from '@/types';
import { SITE_URL, SITE_NAME, formatPrice, getPropertyTypeLabel } from '@/lib/utils';

export function PropertyJsonLd({ property }: { property: Property }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: `${SITE_URL}/properties/${property.slug}`,
    datePosted: property.created_at,
    image: property.images,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'INR',
      availability: property.status === 'available'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/SoldOut',
      ...(property.listing_type === 'rent' && {
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: property.price,
          priceCurrency: 'INR',
          unitText: 'MONTH',
        },
      }),
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.locality,
      addressRegion: 'Uttarakhand',
      addressCountry: 'IN',
      name: `${property.locality}, ${property.city}`,
    },
    ...(property.area_sqft > 0 && {
      floorSize: {
        '@type': 'QuantitativeValue',
        value: property.area_sqft,
        unitCode: 'FTK',
        unitText: 'sq.ft.',
      },
    }),
    ...(property.bedrooms > 0 && { numberOfRooms: property.bedrooms }),
    ...(property.bathrooms > 0 && { numberOfBathroomsTotal: property.bathrooms }),
    additionalType: property.listing_type === 'rent'
      ? 'https://schema.org/RentAction'
      : 'https://schema.org/BuyAction',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function FAQJsonLd({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  if (!items || items.length === 0) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    image: `${SITE_URL}/images/logo.png`,
    description:
      'Find your dream property in Dehradun. Browse verified flats, houses, villas, and plots across all major localities. Direct from owners.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dehradun',
      addressRegion: 'Uttarakhand',
      postalCode: '248001',
      addressCountry: 'IN',
    },
    areaServed: {
      '@type': 'City',
      name: 'Dehradun',
      containedIn: {
        '@type': 'State',
        name: 'Uttarakhand',
      },
    },
    knowsAbout: [
      'Real Estate', 'Property in Dehradun', 'Flats in Dehradun',
      'Houses in Dehradun', 'Plots in Dehradun', 'Villas in Dehradun',
    ],
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function LocalBusinessJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#localbusiness`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    image: `${SITE_URL}/images/logo.png`,
    telephone: '+919876543210',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rajpur Road',
      addressLocality: 'Dehradun',
      addressRegion: 'Uttarakhand',
      postalCode: '248001',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 30.3165,
      longitude: 78.0322,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '19:00',
    },
    priceRange: '₹₹',
    areaServed: 'Dehradun',
    serviceType: 'Real Estate Listings',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// WebSite schema with SearchAction (enables Google Sitelinks Search Box)
export function WebSiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/properties?locality={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ItemList schema for collection pages (properties listing, search results)
export function ItemListJsonLd({ properties, title }: { properties: Property[]; title: string }) {
  if (!properties || properties.length === 0) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    numberOfItems: properties.length,
    itemListElement: properties.slice(0, 10).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/properties/${p.slug}`,
      name: p.title,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
