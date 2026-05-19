import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLocalityBySlug, LOCALITIES } from '@/lib/data/localities';
import { getPropertiesByLocality } from '@/lib/data/properties';
import type { Property } from '@/types';
import { SITE_URL, SITE_NAME, getPropertyTypeLabel } from '@/lib/utils';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import PropertyGrid from '@/components/property/PropertyGrid';
import LocalityFAQ from '@/components/locality/LocalityFAQ';
import { FAQJsonLd, BreadcrumbJsonLd, ItemListJsonLd } from '@/components/seo/JsonLd';

interface Props {
  params: Promise<{ locality: string }>;
}

export async function generateStaticParams() {
  return LOCALITIES.map((l) => ({ locality: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locality: slug } = await params;
  const locality = getLocalityBySlug(slug);
  if (!locality) return {};

  return {
    title: locality.meta_title,
    description: locality.meta_description,
    openGraph: {
      title: locality.meta_title,
      description: locality.meta_description,
      url: `${SITE_URL}/${slug}`,
      type: 'website',
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title: locality.meta_title,
      description: locality.meta_description,
    },
    alternates: { canonical: `/${slug}` },
  };
}

export default async function LocalityPage({ params }: Props) {
  const { locality: slug } = await params;
  const locality = getLocalityBySlug(slug);
  if (!locality) notFound();

  let properties: Property[] = [];
  try { properties = await getPropertiesByLocality(locality.name); } catch { /* empty */ }

  // Other localities for internal linking
  const otherLocalities = LOCALITIES.filter((l) => l.slug !== slug);

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Properties', url: '/properties' },
        { name: locality.name, url: `/${slug}` },
      ]} />
      <FAQJsonLd items={locality.faqs} />
      {properties.length > 0 && (
        <ItemListJsonLd properties={properties} title={`Properties in ${locality.name}`} />
      )}

      <section className="locality-hero">
        <div className="container">
          <Breadcrumbs items={[
            { label: 'Properties', href: '/properties' },
            { label: locality.name },
          ]} />
          <h1>{locality.hero_text}</h1>
          <p>{locality.avg_price_range} • Pin: {locality.pin_code}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* About section with rich content */}
          <article className="locality-content">
            <h2>About {locality.name}</h2>
            <p>{locality.description}</p>

            {/* Property type quick links for this locality */}
            {locality.property_types.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h3 style={{ fontSize: '.95rem', fontWeight: 600, marginBottom: '.5rem' }}>
                  Available Property Types in {locality.name}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                  {locality.property_types.map((type) => (
                    <Link
                      key={type}
                      href={`/properties?type=${type}&locality=${encodeURIComponent(locality.name)}`}
                      style={{
                        fontSize: '.8rem', padding: '.3rem .7rem', borderRadius: 4,
                        border: '1px solid #1a5632', color: '#1a5632', textDecoration: 'none',
                        fontWeight: 600,
                      }}
                    >
                      {getPropertyTypeLabel(type)} in {locality.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Amenities */}
          <div className="amenities-section">
            <h2>Nearby Amenities & Landmarks in {locality.name}</h2>
            <div className="amenities-list">
              {locality.amenities.map((a) => (
                <span key={a} className="amenity-tag">{a}</span>
              ))}
            </div>
          </div>

          {/* Property listings */}
          <div style={{ margin: '2rem 0' }}>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>
              Properties in {locality.name}
            </h2>
            <PropertyGrid
              properties={properties}
              emptyMessage={`No properties currently listed in ${locality.name}. Check back soon or list your property for free.`}
            />
            {properties.length > 0 && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <Link
                  href={`/properties?locality=${encodeURIComponent(locality.name)}`}
                  className="btn btn--outline"
                >
                  View All Properties in {locality.name} →
                </Link>
              </div>
            )}
          </div>

          {/* FAQ Section */}
          <LocalityFAQ items={locality.faqs} />

          {/* Internal linking to other localities */}
          <nav aria-label="Other localities" style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '.75rem', color: '#374151' }}>
              Explore Other Localities in Dehradun
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
              {otherLocalities.map((l) => (
                <Link
                  key={l.slug}
                  href={`/${l.slug}`}
                  style={{
                    fontSize: '.8rem', padding: '.3rem .7rem', borderRadius: 4,
                    border: '1px solid #d1d5db', color: '#1a5632', textDecoration: 'none',
                  }}
                >
                  {l.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* CTA */}
          <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1.5rem', background: '#f0fdf4', borderRadius: 8 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '.5rem' }}>
              Have a Property in {locality.name}?
            </h3>
            <p style={{ fontSize: '.85rem', color: '#666', marginBottom: '1rem' }}>
              List it for free on {SITE_NAME} and reach thousands of buyers in Dehradun.
            </p>
            <Link href="/list-property" className="btn btn--primary">
              List Property — Free
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
