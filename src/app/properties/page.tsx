import type { Metadata } from 'next';
import { getProperties } from '@/lib/data/properties';
import PropertyGrid from '@/components/property/PropertyGrid';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import SearchBar from '@/components/ui/SearchBar';
import Link from 'next/link';
import { PropertyType } from '@/types';

export const metadata: Metadata = {
  title: 'Properties for Sale in Dehradun',
  description: 'Browse all available flats, houses, villas, and plots for sale in Dehradun. Filter by locality, budget, and property type.',
  alternates: { canonical: '/properties' },
};

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function PropertiesPage({ searchParams }: Props) {
  const params = await searchParams;
  const listingType = params.listing as 'sale' | 'rent' | undefined;
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

  const pageTitle = listingType === 'rent'
    ? 'Properties for Rent in Dehradun'
    : 'Properties for Sale in Dehradun';

  return (
    <>
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
            <div className="pagination">
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
            </div>
          )}
        </div>
      </section>
    </>
  );
}
