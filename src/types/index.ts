export interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  locality: string;
  city: string;
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  images: string[];
  featured: boolean;
  status: 'available' | 'sold' | 'rented';
  furnishing: 'furnished' | 'semi-furnished' | 'unfurnished';
  facing: string;
  floor: string;
  total_floors: number;
  amenities: string[];
  contact_phone: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  youtube_url: string | null;
  listed_by: 'owner' | 'dealer' | 'builder' | 'dehradunghar';
  brochure_url: string | null;
  map_url: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export type PropertyType = 'flat' | 'house' | 'villa' | 'plot' | 'commercial' | 'pg' | 'farmhouse' | 'industrial' | 'other';

export interface PropertyFilters {
  locality?: string;
  property_type?: PropertyType;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'oldest';
  page?: number;
  limit?: number;
}

export interface Locality {
  slug: string;
  name: string;
  description: string;
  meta_title: string;
  meta_description: string;
  hero_text: string;
  amenities: string[];
  faqs: FAQ[];
  property_types: string[];
  avg_price_range: string;
  pin_code: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  property_id?: string;
}

export interface SEOData {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  keywords?: string[];
}
