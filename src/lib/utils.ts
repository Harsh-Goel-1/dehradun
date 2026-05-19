import { type Property, type PropertyFilters, type PaginatedResult } from '@/types';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL !== 'http://localhost:3000'
    ? process.env.NEXT_PUBLIC_SITE_URL
    : 'https://dehradunghar.com';
export const SITE_NAME = 'DehradunGhar';
export const SITE_TAGLINE = 'Find Your Dream Property in Dehradun';
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';

export function formatPrice(price: number): string {
  if (price >= 10000000) {
    const crore = price / 10000000;
    return `₹${crore % 1 === 0 ? crore : crore.toFixed(2)} Cr`;
  }
  if (price >= 100000) {
    const lakh = price / 100000;
    return `₹${lakh % 1 === 0 ? lakh : lakh.toFixed(2)} Lac`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
}

export function formatArea(sqft: number): string {
  return `${sqft.toLocaleString('en-IN')} sq.ft.`;
}

export function generateWhatsAppLink(property?: Property, customMessage?: string): string {
  const phone = property?.owner_phone || property?.contact_phone || WHATSAPP_NUMBER;
  const message = customMessage
    ? customMessage
    : property
      ? `Hi, I'm interested in "${property.title}" listed at ${formatPrice(property.price)} in ${property.locality}. Please share more details. Link: ${SITE_URL}/properties/${property.slug}`
      : `Hi, I'm looking for properties in Dehradun. Please help me find suitable options.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getPropertyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    flat: 'Flat / Apartment',
    house: 'Independent House',
    villa: 'Villa',
    plot: 'Plot / Land',
    commercial: 'Commercial',
    pg: 'PG / Co-living',
    farmhouse: 'Farmhouse',
    industrial: 'Industrial',
    other: 'Other',
  };
  return labels[type] || type;
}

export function buildFilterParams(filters: PropertyFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.locality) params.set('locality', filters.locality);
  if (filters.property_type) params.set('type', filters.property_type);
  if (filters.min_price) params.set('min', filters.min_price.toString());
  if (filters.max_price) params.set('max', filters.max_price.toString());
  if (filters.bedrooms) params.set('bhk', filters.bedrooms.toString());
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.page) params.set('page', filters.page.toString());
  return params;
}

export function paginateResults<T>(
  data: T[],
  count: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  return {
    data,
    count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trimEnd() + '...';
}
