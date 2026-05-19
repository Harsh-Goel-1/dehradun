import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/utils';
import { getAllLocalitySlugs } from '@/lib/data/localities';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const localitySlugs = getAllLocalitySlugs();

  let propertySlugs: string[] = [];
  try {
    const { getAllPropertySlugs } = await import('@/lib/data/properties');
    propertySlugs = await getAllPropertySlugs();
  } catch {
    // Supabase not configured
  }

  const staticPages = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${SITE_URL}/properties`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${SITE_URL}/list-property`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
  ];

  const localityPages = localitySlugs.map((slug) => ({
    url: `${SITE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const propertyPages = propertySlugs.map((slug) => ({
    url: `${SITE_URL}/properties/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...localityPages, ...propertyPages];
}
