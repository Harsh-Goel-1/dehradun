import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Property, PropertyFilters, PaginatedResult } from '@/types';
import { paginateResults } from '@/lib/utils';

const DEFAULT_LIMIT = 12;

export async function getProperties(
  filters: PropertyFilters = {}
): Promise<PaginatedResult<Property>> {
  const supabase = await createServerSupabaseClient();
  const page = filters.page || 1;
  const limit = filters.limit || DEFAULT_LIMIT;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .eq('status', 'available');

  if (filters.locality) {
    query = query.ilike('locality', `%${filters.locality}%`);
  }
  if (filters.property_type) {
    query = query.eq('property_type', filters.property_type);
  }
  if (filters.min_price) {
    query = query.gte('price', filters.min_price);
  }
  if (filters.max_price) {
    query = query.lte('price', filters.max_price);
  }
  if (filters.bedrooms) {
    query = query.eq('bedrooms', filters.bedrooms);
  }

  // Sorting
  switch (filters.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching properties:', error);
    return paginateResults([], 0, page, limit);
  }

  return paginateResults(data as Property[], count || 0, page, limit);
}

export async function getFeaturedProperties(): Promise<Property[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'available')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) {
    console.error('Error fetching featured properties:', error);
    return [];
  }

  return data as Property[];
}

export async function getRecentProperties(limit = 6): Promise<Property[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'available')
    .not('listed_by', 'in', '("dehradunghar","builder")')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent properties:', error);
    return [];
  }

  return data as Property[];
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching property:', error);
    return null;
  }

  return data as Property;
}

export async function getSimilarProperties(
  property: Property,
  limit = 4
): Promise<Property[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'available')
    .eq('locality', property.locality)
    .neq('id', property.id)
    .limit(limit);

  if (error) {
    console.error('Error fetching similar properties:', error);
    return [];
  }

  // If not enough results from same locality, fetch by type
  if (data.length < limit) {
    const { data: moreData } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'available')
      .eq('property_type', property.property_type)
      .neq('id', property.id)
      .not('id', 'in', `(${data.map((p) => p.id).join(',')})`)
      .limit(limit - data.length);

    return [...data, ...(moreData || [])] as Property[];
  }

  return data as Property[];
}

export async function getPropertiesByLocality(
  localityName: string,
  limit = 12
): Promise<Property[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'available')
    .ilike('locality', `%${localityName}%`)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching locality properties:', error);
    return [];
  }

  return data as Property[];
}

export async function getAllPropertySlugs(): Promise<string[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('properties')
    .select('slug')
    .eq('status', 'available');

  if (error) {
    console.error('Error fetching slugs:', error);
    return [];
  }

  return data.map((p) => p.slug);
}

export async function getPropertyCount(): Promise<number> {
  const supabase = await createServerSupabaseClient();

  const { count, error } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'available');

  if (error) return 0;
  return count || 0;
}

export async function getOfficialListings(limit = 6): Promise<Property[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'available')
    .eq('listed_by', 'dehradunghar')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching official listings:', error);
    return [];
  }

  return data as Property[];
}

export async function getBuilderProjects(limit = 6): Promise<Property[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'available')
    .eq('listed_by', 'builder')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching builder projects:', error);
    return [];
  }

  return data as Property[];
}
