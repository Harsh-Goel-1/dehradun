import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/utils';
import { getAllLocalitySlugs } from '@/lib/data/localities';

// Force dynamic — regenerate sitemap on every request so new/removed
// listings are immediately reflected
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const localitySlugs = getAllLocalitySlugs();

  // Fetch live property slugs from database
  let propertySlugs: string[] = [];
  try {
    const { getAllPropertySlugs } = await import('@/lib/data/properties');
    propertySlugs = await getAllPropertySlugs();
  } catch {
    // Supabase not configured
  }

  // Core pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), priority: 1.0 },
    { url: `${SITE_URL}/properties`, lastModified: new Date(), priority: 0.9 },
    { url: `${SITE_URL}/list-property`, lastModified: new Date(), priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), priority: 0.4 },
  ];

  // Locality pages
  const localityPages: MetadataRoute.Sitemap = localitySlugs.map((slug) => ({
    url: `${SITE_URL}/${slug}`,
    lastModified: new Date(),
    priority: 0.85,
  }));

  // Individual property pages (live from DB)
  const propertyPages: MetadataRoute.Sitemap = propertySlugs.map((slug) => ({
    url: `${SITE_URL}/properties/${slug}`,
    lastModified: new Date(),
    priority: 0.7,
  }));

  return [...staticPages, ...localityPages, ...propertyPages];
}
