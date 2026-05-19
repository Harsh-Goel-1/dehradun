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
              </div>
            </div>

            <div className="property-sidebar">
              <div className="contact-card">
                <h3>Contact Owner</h3>
                {property.owner_name && (
                  <p style={{ fontSize: '.95rem', fontWeight: 600, marginBottom: '.5rem' }}>
                    {property.owner_name}
                  </p>
                )}
                <p style={{ fontSize: '.85rem', color: '#666', marginBottom: '1rem', lineHeight: 1.6 }}>
                  Reach out directly to the property owner.
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
