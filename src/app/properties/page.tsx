import type { Metadata } from 'next';
import { getProperties } from '@/lib/data/properties';
import PropertyGrid from '@/components/property/PropertyGrid';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import SearchBar from '@/components/ui/SearchBar';
import Link from 'next/link';
import { PropertyType } from '@/types';
import { SITE_URL, SITE_NAME, getPropertyTypeLabel } from '@/lib/utils';
import { BreadcrumbJsonLd, ItemListJsonLd } from '@/components/seo/JsonLd';
import { LOCALITIES } from '@/lib/data/localities';

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const listing = params.listing;
  const type = params.type;
  const locality = params.locality;

  let title = 'Properties for Sale in Dehradun';
  let description = 'Browse all available flats, houses, villas, and plots for sale in Dehradun. Filter by locality, budget, and property type.';

  if (listing === 'rent') {
    title = 'Properties for Rent in Dehradun';
    description = 'Find flats, houses, and PGs for rent in Dehradun. Affordable monthly rentals with direct owner contact.';
  }

  if (type) {
    const typeLabel = getPropertyTypeLabel(type);
    title = listing === 'rent'
      ? `${typeLabel} for Rent in Dehradun`
      : `${typeLabel} for Sale in Dehradun`;
    description = `Browse verified ${typeLabel.toLowerCase()} ${listing === 'rent' ? 'for rent' : 'for sale'} in Dehradun. Compare prices, view photos, contact owners directly.`;
  }

  if (locality) {
    title += ` — ${locality}`;
    description = `Find ${type ? getPropertyTypeLabel(type).toLowerCase() : 'properties'} in ${locality}, Dehradun. ${listing === 'rent' ? 'Monthly rentals' : 'Best prices'}, direct from owners.`;
  }

  return {
    title,
    description,
    openGraph: { title, description, url: `${SITE_URL}/properties`, type: 'website' },
    alternates: { canonical: '/properties' },
  };
}

export default async function PropertiesPage({ searchParams }: Props) {
  const params = await searchParams;
  const listingType = params.listing as 'sale' | 'rent' | undefined;
  const type = params.type;
  const locality = params.locality;

  let result;
  try {
    result = await getProperties({
      locality: params.locality,
      property_type: params.type as PropertyType | undefined,
      listing_type: listingType || undefined,
      min_price: params.min ? parseInt(params.min) : undefined,
      max_price: params.max ? parseInt(params.max) : undefined,
      bedrooms: params.bhk ? parseInt(params.bhk) : undefined,
      sort: (params.sort as 'price_asc' | 'price_desc' | 'newest') || 'newest',
      page: params.page ? parseInt(params.page) : 1,
    });
  } catch {
    result = { data: [], count: 0, page: 1, limit: 12, totalPages: 0 };
  }

  // Build dynamic page title
  let pageTitle = listingType === 'rent'
    ? 'Properties for Rent in Dehradun'
    : 'Properties for Sale in Dehradun';

  if (type) {
    const typeLabel = getPropertyTypeLabel(type);
    pageTitle = `${typeLabel} ${listingType === 'rent' ? 'for Rent' : 'for Sale'} in Dehradun`;
  }
  if (locality) {
    pageTitle = pageTitle.replace('in Dehradun', `in ${locality}, Dehradun`);
  }

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Properties', url: '/properties' },
        ...(type ? [{ name: getPropertyTypeLabel(type), url: `/properties?type=${type}` }] : []),
      ]} />
      <ItemListJsonLd properties={result.data} title={pageTitle} />

      <div className="page-header">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Properties' }]} />
          <h1>{pageTitle}</h1>
          <p>{result.count} properties found</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <SearchBar variant="compact" />
          <div style={{ marginTop: '1.5rem' }}>
            <PropertyGrid properties={result.data} />
          </div>
          {result.totalPages > 1 && (
            <nav className="pagination" aria-label="Property listing pages">
              {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => {
                const newParams = new URLSearchParams(params as Record<string, string>);
                newParams.set('page', String(p));
                return (
                  <Link
                    key={p}
                    href={`/properties?${newParams.toString()}`}
                    className={p === result.page ? 'active' : ''}
                  >
                    {p}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Internal linking: locality quick-links for SEO */}
          <nav aria-label="Browse by locality" style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '.75rem', color: '#374151' }}>Browse by Locality</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
              {LOCALITIES.map((l) => (
                <Link
                  key={l.slug}
                  href={`/${l.slug}`}
                  style={{ fontSize: '.8rem', padding: '.3rem .7rem', borderRadius: 4, border: '1px solid #d1d5db', color: '#1a5632', textDecoration: 'none' }}
                >
                  {l.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </section>
    </>
  );
}
