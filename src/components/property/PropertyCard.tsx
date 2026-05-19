import Link from 'next/link';
import Image from 'next/image';
import { Property } from '@/types';
import { formatPrice, formatArea, getPropertyTypeLabel } from '@/lib/utils';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

export default function PropertyCard({ property }: { property: Property }) {
  const mainImage = property.images?.[0] || '/images/placeholder.jpg';

  return (
    <article className="property-card" itemScope itemType="https://schema.org/RealEstateListing">
      <Link href={`/properties/${property.slug}`} className="property-card-image-wrapper">
        <Image
          src={mainImage}
          alt={property.title}
          width={400}
          height={260}
          className="property-card-image"
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {property.featured && (
          <span className="property-card-badge">Featured</span>
        )}
        {property.listed_by === 'dehradunghar' && (
          <span style={{
            position: 'absolute', top: property.featured ? '2.25rem' : '.75rem', left: '.75rem',
            background: 'rgba(26, 86, 50, 0.9)', color: '#fff',
            fontSize: '.65rem', fontWeight: 700, padding: '.2rem .5rem',
            borderRadius: 4, backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', gap: '.25rem',
          }}>
            ✓ DehradunGhar Official
          </span>
        )}
        {property.listed_by === 'builder' && (
          <span style={{
            position: 'absolute', top: property.featured ? '2.25rem' : '.75rem', left: '.75rem',
            background: 'rgba(21, 101, 192, 0.9)', color: '#fff',
            fontSize: '.65rem', fontWeight: 700, padding: '.2rem .5rem',
            borderRadius: 4, backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', gap: '.25rem',
          }}>
            🏗 Builder Project
          </span>
        )}
        <span className="property-card-type">{getPropertyTypeLabel(property.property_type)}</span>
      </Link>

      <div className="property-card-body">
        <div className="property-card-price" itemProp="offers" itemScope itemType="https://schema.org/Offer">
          <span itemProp="price" content={String(property.price)}>
            {formatPrice(property.price)}
          </span>
          <meta itemProp="priceCurrency" content="INR" />
        </div>

        <h3 className="property-card-title" itemProp="name">
          <Link href={`/properties/${property.slug}`}>{property.title}</Link>
        </h3>

        <p className="property-card-location" itemProp="address">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {property.locality}, {property.city}
        </p>

        <div className="property-card-specs">
          {property.bedrooms > 0 && (
            <span className="spec">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7v11m0-4h18m0 4V8a2 2 0 0 0-2-2H5" />
                <path d="M7 11V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" />
              </svg>
              {property.bedrooms} BHK
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="spec">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z" />
                <path d="M6 12V5a2 2 0 0 1 2-2h1" />
              </svg>
              {property.bathrooms} Bath
            </span>
          )}
          {property.area_sqft > 0 && (
            <span className="spec">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 3v18" />
              </svg>
              {formatArea(property.area_sqft)}
            </span>
          )}
        </div>

        <div className="property-card-actions">
          <Link href={`/properties/${property.slug}`} className="btn btn--outline btn--sm">
            View Details
          </Link>
          <WhatsAppButton property={property} size="sm" variant="primary" />
        </div>
      </div>
    </article>
  );
}
