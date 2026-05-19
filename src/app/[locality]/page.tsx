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

interface Props { params: Promise<{ locality: string }>; }

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
    openGraph: { title: locality.meta_title, description: locality.meta_description, url: `${SITE_URL}/${slug}`, type: 'website', siteName: SITE_NAME },
    twitter: { card: 'summary_large_image', title: locality.meta_title, description: locality.meta_description },
    alternates: { canonical: `/${slug}` },
  };
}

const sectionStyle = { marginBottom: '2.5rem' };
const h2Style: React.CSSProperties = { fontSize: '1.2rem', fontWeight: 700, marginBottom: '.75rem', color: '#1a1a1a', borderBottom: '2px solid #e5e7eb', paddingBottom: '.5rem' };
const h3Style: React.CSSProperties = { fontSize: '.95rem', fontWeight: 600, marginBottom: '.5rem', color: '#374151' };
const tagStyle: React.CSSProperties = { display: 'inline-block', fontSize: '.8rem', padding: '.3rem .7rem', borderRadius: 4, border: '1px solid #d1d5db', color: '#374151', marginRight: '.4rem', marginBottom: '.4rem' };
const highlightTagStyle: React.CSSProperties = { ...tagStyle, border: '1px solid #1a5632', color: '#1a5632', fontWeight: 600 };

export default async function LocalityPage({ params }: Props) {
  const { locality: slug } = await params;
  const locality = getLocalityBySlug(slug);
  if (!locality) notFound();

  let properties: Property[] = [];
  try { properties = await getPropertiesByLocality(locality.name); } catch { /* empty */ }

  const otherLocalities = LOCALITIES.filter((l) => l.slug !== slug);

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Home', url: '/' }, { name: 'Properties', url: '/properties' }, { name: locality.name, url: `/${slug}` }]} />
      <FAQJsonLd items={locality.faqs} />
      {properties.length > 0 && <ItemListJsonLd properties={properties} title={`Properties in ${locality.name}`} />}

      {/* Hero */}
      <section className="locality-hero">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Properties', href: '/properties' }, { label: locality.name }]} />
          <h1>{locality.hero_text}</h1>
          <p>{locality.avg_price_range} • Pin: {locality.pin_code}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">

          {/* 1. About & Lifestyle */}
          <article style={sectionStyle}>
            <h2 style={h2Style}>About {locality.name}</h2>
            <p style={{ lineHeight: 1.8, color: '#374151', marginBottom: '1rem' }}>{locality.description}</p>
            <h3 style={h3Style}>Life in {locality.name}</h3>
            <p style={{ lineHeight: 1.8, color: '#555' }}>{locality.lifestyle}</p>
          </article>

          {/* 2. Best For & Target Audience */}
          <div style={sectionStyle}>
            <h2 style={h2Style}>Who is {locality.name} Best For?</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', marginBottom: '1rem' }}>
              {locality.best_for.map((b) => <span key={b} style={highlightTagStyle}>✓ {b}</span>)}
            </div>
            <p style={{ lineHeight: 1.8, color: '#555', fontSize: '.9rem' }}>{locality.target_audience}</p>
          </div>

          {/* 3. Infrastructure */}
          <div style={sectionStyle}>
            <h2 style={h2Style}>Infrastructure & Connectivity</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
              {([
                { icon: '🏫', title: 'Schools', items: locality.infrastructure.schools },
                { icon: '🏥', title: 'Hospitals', items: locality.infrastructure.hospitals },
                { icon: '🛒', title: 'Markets & Shopping', items: locality.infrastructure.markets },
                { icon: '🚌', title: 'Transport & Access', items: locality.infrastructure.transport },
                { icon: '📍', title: 'Landmarks & Attractions', items: locality.infrastructure.landmarks },
              ]).map((section) => (
                <div key={section.title} style={{ background: '#f9fafb', borderRadius: 8, padding: '1rem' }}>
                  <h3 style={{ fontSize: '.85rem', fontWeight: 700, marginBottom: '.5rem' }}>{section.icon} {section.title}</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {section.items.map((item) => (
                      <li key={item} style={{ fontSize: '.82rem', color: '#555', padding: '.2rem 0', borderBottom: '1px solid #f0f0f0' }}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Market Insights */}
          <div style={sectionStyle}>
            <h2 style={h2Style}>Property Market Insights — {locality.name}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {([
                { label: 'Avg. Price / sq.ft.', value: locality.market_insights.avg_price_sqft },
                { label: 'Rent Range', value: locality.market_insights.rent_range },
                { label: 'Appreciation', value: locality.market_insights.appreciation },
                { label: 'Demand', value: locality.market_insights.demand },
              ]).map((stat) => (
                <div key={stat.label} style={{ background: '#f0fdf4', borderRadius: 8, padding: '1rem', borderLeft: '3px solid #1a5632' }}>
                  <div style={{ fontSize: '.75rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>{stat.label}</div>
                  <div style={{ fontSize: '.95rem', fontWeight: 700, color: '#1a5632', marginTop: '.25rem' }}>{stat.value}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1rem' }}>
              <h3 style={h3Style}>Popular Configurations</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                {locality.market_insights.popular_configs.map((c) => <span key={c} style={tagStyle}>{c}</span>)}
              </div>
            </div>
          </div>

          {/* 5. Why Invest */}
          <div style={{ ...sectionStyle, background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)', borderRadius: 12, padding: '1.5rem' }}>
            <h2 style={{ ...h2Style, borderBottom: 'none' }}>💡 Why Invest in {locality.name}?</h2>
            <p style={{ lineHeight: 1.8, color: '#374151' }}>{locality.why_invest}</p>
          </div>

          {/* 6. Property Types Available */}
          {locality.property_types.length > 0 && (
            <div style={sectionStyle}>
              <h2 style={h2Style}>Property Types in {locality.name}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                {locality.property_types.map((type) => (
                  <Link key={type} href={`/properties?type=${type}&locality=${encodeURIComponent(locality.name)}`}
                    style={{ fontSize: '.85rem', padding: '.4rem .8rem', borderRadius: 6, background: '#1a5632', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
                    {getPropertyTypeLabel(type)} in {locality.name} →
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 7. Listings */}
          <div style={sectionStyle}>
            <h2 style={h2Style}>Properties in {locality.name}</h2>
            <PropertyGrid properties={properties} emptyMessage={`No properties currently listed in ${locality.name}. Check back soon or list your property for free.`} />
            {properties.length > 0 && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <Link href={`/properties?locality=${encodeURIComponent(locality.name)}`} className="btn btn--outline">View All Properties in {locality.name} →</Link>
              </div>
            )}
          </div>

          {/* 8. FAQ */}
          <LocalityFAQ items={locality.faqs} />

          {/* 9. Nearby Areas */}
          {locality.nearby_areas.length > 0 && (
            <nav style={sectionStyle} aria-label="Nearby areas">
              <h2 style={h2Style}>Nearby Areas</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                {locality.nearby_areas.map((area) => {
                  const linked = LOCALITIES.find((l) => l.name === area);
                  return linked ? (
                    <Link key={area} href={`/${linked.slug}`} style={{ ...highlightTagStyle, textDecoration: 'none' }}>{area} →</Link>
                  ) : (
                    <span key={area} style={tagStyle}>{area}</span>
                  );
                })}
              </div>
            </nav>
          )}

          {/* 10. Explore Other Localities */}
          <nav aria-label="Other localities" style={{ ...sectionStyle, paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '.75rem', color: '#374151' }}>Explore Other Localities in Dehradun</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
              {otherLocalities.map((l) => (
                <Link key={l.slug} href={`/${l.slug}`} style={{ ...tagStyle, textDecoration: 'none', color: '#1a5632' }}>{l.name}</Link>
              ))}
            </div>
          </nav>

          {/* CTA */}
          <div style={{ textAlign: 'center', padding: '1.5rem', background: '#f0fdf4', borderRadius: 8 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '.5rem' }}>Have a Property in {locality.name}?</h3>
            <p style={{ fontSize: '.85rem', color: '#666', marginBottom: '1rem' }}>List it for free on {SITE_NAME} and reach thousands of buyers in Dehradun.</p>
            <Link href="/list-property" className="btn btn--primary">List Property — Free</Link>
          </div>
        </div>
      </section>
    </>
  );
}
