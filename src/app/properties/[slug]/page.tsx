import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPropertyBySlug, getSimilarProperties } from '@/lib/data/properties';
import type { Property } from '@/types';
import { formatPrice, formatArea, getPropertyTypeLabel, SITE_URL } from '@/lib/utils';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import PropertyGallery from '@/components/property/PropertyGallery';
import PropertyGrid from '@/components/property/PropertyGrid';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { PropertyJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let property;
  try { property = await getPropertyBySlug(slug); } catch { return {}; }
  if (!property) return {};

  const title = `${property.title} - ${formatPrice(property.price)} | ${property.locality}`;
  const description = `${property.title} in ${property.locality}, Dehradun. ${property.bedrooms} BHK, ${formatArea(property.area_sqft)}. ${property.description.slice(0, 150)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/properties/${slug}`,
      images: property.images.map((img) => ({ url: img })),
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title, description },
    alternates: { canonical: `/properties/${slug}` },
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params;
  let property;
  try { property = await getPropertyBySlug(slug); } catch { notFound(); }
  if (!property) notFound();

  let similar: Property[] = [];
  try { similar = await getSimilarProperties(property); } catch { /* empty */ }

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Properties', url: '/properties' },
    { name: property.title, url: `/properties/${slug}` },
  ];

  return (
    <>
      <PropertyJsonLd property={property} />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <div className="container">
        <Breadcrumbs items={[
          { label: 'Properties', href: '/properties' },
          { label: property.title },
        ]} />
      </div>

      <section className="property-detail">
        <div className="container">
          <div className="property-detail-grid">
            <div>
              <PropertyGallery images={property.images} title={property.title} />

              <div className="property-info" style={{ marginTop: '1.5rem' }}>
                <h1>{property.title}</h1>
                {property.listed_by === 'dehradunghar' && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '.35rem',
                    background: '#e8f5e9', border: '1.5px solid #1a5632',
                    padding: '.3rem .7rem', borderRadius: 6, marginBottom: '.5rem',
                    fontSize: '.8rem', fontWeight: 700, color: '#1a5632',
                  }}>
                    ✓ DehradunGhar Official Listing
                  </div>
                )}
                <p className="property-card-location" style={{ fontSize: '.95rem', marginBottom: '.5rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {property.locality}, {property.city}
                </p>
                <div className="property-price-tag">{formatPrice(property.price)}</div>

                <div className="property-specs-grid">
                  {property.bedrooms > 0 && <div className="property-spec-row"><span>Bedrooms</span><span>{property.bedrooms} BHK</span></div>}
                  {property.bathrooms > 0 && <div className="property-spec-row"><span>Bathrooms</span><span>{property.bathrooms}</span></div>}
                  {property.area_sqft > 0 && <div className="property-spec-row"><span>Area</span><span>{formatArea(property.area_sqft)}</span></div>}
                  <div className="property-spec-row"><span>Type</span><span>{getPropertyTypeLabel(property.property_type)}</span></div>
                  {property.furnishing && <div className="property-spec-row"><span>Furnishing</span><span style={{ textTransform: 'capitalize' }}>{property.furnishing}</span></div>}
                  {property.facing && <div className="property-spec-row"><span>Facing</span><span>{property.facing}</span></div>}
                  {property.floor && <div className="property-spec-row"><span>Floor</span><span>{property.floor}</span></div>}
                  {property.total_floors > 0 && <div className="property-spec-row"><span>Total Floors</span><span>{property.total_floors}</span></div>}
                </div>

                <div className="property-description">
                  <h2>Description</h2>
                  <p>{property.description}</p>
                </div>

                {property.amenities && property.amenities.length > 0 && (
                  <div className="property-amenities">
                    <h2>Amenities</h2>
                    <div className="amenities-list">
                      {property.amenities.map((a) => (
                        <span key={a} className="amenity-tag">{a}</span>
                      ))}
                    </div>
                  </div>
                )}

                {property.youtube_url && (() => {
                  const match = property.youtube_url!.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
                  const videoId = match?.[1];
                  if (!videoId) return null;
                  return (
                    <div style={{ marginTop: '1.5rem' }}>
                      <h2>Property Video</h2>
                      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 8, overflow: 'hidden', marginTop: '.75rem' }}>
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title="Property video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {property.map_url && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <h2>Location</h2>
                    <a
                      href={property.map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                        marginTop: '.75rem', padding: '.65rem 1.25rem',
                        background: '#f0f4f0', border: '1.5px solid var(--color-primary)',
                        borderRadius: 8, color: 'var(--color-primary)',
                        fontSize: '.9rem', fontWeight: 600,
                        transition: 'all .2s',
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      View on Google Maps
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="property-sidebar">
              {/* Builder Project / Official Badge */}
              {(property.listed_by === 'builder' || property.listed_by === 'dehradunghar') && (
                <div style={{
                  padding: '1rem 1.25rem', borderRadius: 10, marginBottom: '1rem',
                  background: property.listed_by === 'dehradunghar'
                    ? 'linear-gradient(135deg, #e8f5e9, #f0fdf4)'
                    : 'linear-gradient(135deg, #e3f2fd, #f0f9ff)',
                  border: property.listed_by === 'dehradunghar'
                    ? '1.5px solid #1a5632'
                    : '1.5px solid #1565c0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.35rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>{property.listed_by === 'dehradunghar' ? '✓' : '🏗'}</span>
                    <span style={{
                      fontWeight: 700, fontSize: '.85rem',
                      color: property.listed_by === 'dehradunghar' ? '#1a5632' : '#1565c0',
                    }}>
                      {property.listed_by === 'dehradunghar' ? 'DehradunGhar Official Listing' : 'Builder Project'}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '.78rem', margin: 0,
                    color: property.listed_by === 'dehradunghar' ? '#15803d' : '#1976d2',
                  }}>
                    {property.listed_by === 'dehradunghar'
                      ? 'This listing has been verified by DehradunGhar.'
                      : 'This property is listed by a builder/developer.'}
                  </p>
                </div>
              )}

              {/* Brochure Download */}
              {property.brochure_url && (
                <div style={{
                  padding: '1rem 1.25rem', borderRadius: 10, marginBottom: '1rem',
                  background: '#fffbeb', border: '1.5px solid #fbbf24',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span style={{ fontWeight: 700, fontSize: '.85rem', color: '#92400e' }}>Project Brochure</span>
                  </div>
                  <a
                    href={property.brochure_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--lg"
                    style={{
                      width: '100%', textAlign: 'center',
                      background: '#d97706', color: '#fff', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download Brochure (PDF)
                  </a>
                </div>
              )}

              <div className="contact-card">
                <h3>
                  {property.listed_by === 'dehradunghar' ? 'Contact DehradunGhar' 
                    : property.listed_by === 'builder' ? 'Contact Builder'
                    : 'Contact Owner'}
                </h3>
                {property.owner_name && (
                  <p style={{ fontSize: '.95rem', fontWeight: 600, marginBottom: '.5rem' }}>
                    {property.owner_name}
                    {property.listed_by === 'dehradunghar' && (
                      <span style={{ marginLeft: '.35rem', fontSize: '.65rem', background: '#e8f5e9', color: '#1a5632', padding: '.1rem .35rem', borderRadius: 4, fontWeight: 700 }}>
                        ✓ Verified
                      </span>
                    )}
                  </p>
                )}
                <p style={{ fontSize: '.85rem', color: '#666', marginBottom: '1rem', lineHeight: 1.6 }}>
                  {property.listed_by === 'builder'
                    ? 'Get project details directly from the builder.'
                    : property.listed_by === 'dehradunghar'
                      ? 'Reach out to DehradunGhar for verified details.'
                      : 'Reach out directly to the property owner.'}
                </p>
                <div style={{ display: 'flex', gap: '.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <WhatsAppButton property={property} size="lg" variant="primary" label="WhatsApp" />
                  </div>
                  {(property.owner_phone || property.contact_phone) && (
                    <a
                      href={`tel:+${property.owner_phone || property.contact_phone}`}
                      className="btn btn--outline btn--lg"
                      style={{ flex: 1, textAlign: 'center' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      Call
                    </a>
                  )}
                </div>
                {(() => {
                  if (!property.owner_email) return null;
                  const subject = encodeURIComponent(`Inquiry: ${property.title}`);
                  const body = encodeURIComponent(`Hi, I'm interested in "${property.title}" listed at ${formatPrice(property.price)} in ${property.locality}. Please share more details.`);
                  const gmailHref = `https://mail.google.com/mail/?view=cm` + `&to=${encodeURIComponent(property.owner_email)}` + `&su=${subject}` + `&body=${body}`;
                  return (
                    <a
                      href={gmailHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--outline btn--lg"
                      style={{ width: '100%', marginTop: '.5rem', textAlign: 'center' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="M22 4l-10 8L2 4" />
                      </svg>
                      Email
                    </a>
                  );
                })()}
              </div>
            </div>
          </div>

          {similar && similar.length > 0 && (
            <div className="similar-section">
              <h2 className="section-title">Similar Properties</h2>
              <div style={{ marginTop: '1rem' }}>
                <PropertyGrid properties={similar} />
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
