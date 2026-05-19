import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/utils';
import { getAllLocalitySlugs, LOCALITIES } from '@/lib/data/localities';

const PROPERTY_TYPES = ['flat', 'house', 'villa', 'plot', 'commercial', 'pg', 'farmhouse', 'industrial'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const localitySlugs = getAllLocalitySlugs();

  let propertySlugs: string[] = [];
  try {
    const { getAllPropertySlugs } = await import('@/lib/data/properties');
    propertySlugs = await getAllPropertySlugs();
  } catch {
    // Supabase not configured
  }

  // Core pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/properties`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/properties?listing=rent`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/list-property`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  // Locality pages (high value for local SEO)
  const localityPages: MetadataRoute.Sitemap = localitySlugs.map((slug) => ({
    url: `${SITE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Programmatic: /properties?type=X (property-type landing pages)
  const typePages: MetadataRoute.Sitemap = PROPERTY_TYPES.map((type) => ({
    url: `${SITE_URL}/properties?type=${type}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.75,
  }));

  // Programmatic: type × locality cross pages
  const crossPages: MetadataRoute.Sitemap = [];
  for (const locality of LOCALITIES) {
    for (const type of locality.property_types) {
      crossPages.push({
        url: `${SITE_URL}/properties?type=${type}&locality=${encodeURIComponent(locality.name)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  // Individual property pages
  const propertyPages: MetadataRoute.Sitemap = propertySlugs.map((slug) => ({
    url: `${SITE_URL}/properties/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.65,
  }));

  return [...staticPages, ...localityPages, ...typePages, ...crossPages, ...propertyPages];
}
