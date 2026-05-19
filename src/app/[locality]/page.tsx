import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocalityBySlug, LOCALITIES } from '@/lib/data/localities';
import { getPropertiesByLocality } from '@/lib/data/properties';
import type { Property } from '@/types';
import { SITE_URL } from '@/lib/utils';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import PropertyGrid from '@/components/property/PropertyGrid';
import LocalityFAQ from '@/components/locality/LocalityFAQ';

import { FAQJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

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

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: '/' },
        { name: locality.name, url: `/${slug}` },
      ]} />
      <FAQJsonLd items={locality.faqs} />

      <section className="locality-hero">
        <div className="container">
          <Breadcrumbs items={[{ label: locality.name }]} />
          <h1>{locality.hero_text}</h1>
          <p>{locality.avg_price_range} • Pin: {locality.pin_code}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="locality-content">
            <h2>About {locality.name}</h2>
            <p>{locality.description}</p>
          </div>

          <div className="amenities-section">
            <h2>Nearby Amenities & Landmarks</h2>
            <div className="amenities-list">
              {locality.amenities.map((a) => (
                <span key={a} className="amenity-tag">{a}</span>
              ))}
            </div>
          </div>

          <div style={{ margin: '2rem 0' }}>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>
              Properties in {locality.name}
            </h2>
            <PropertyGrid
              properties={properties}
              emptyMessage={`No properties currently listed in ${locality.name}. Contact us for upcoming options.`}
            />
          </div>



          <LocalityFAQ items={locality.faqs} />
        </div>
      </section>
    </>
  );
}
