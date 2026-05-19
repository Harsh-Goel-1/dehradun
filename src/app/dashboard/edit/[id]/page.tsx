'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { generateSlug } from '@/lib/utils';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Property } from '@/types';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { getCurrentUser } from '@/lib/firebase/auth';

const PROPERTY_TYPES = [
  { value: 'flat', label: 'Flat / Apartment' },
  { value: 'house', label: 'Independent House' },
  { value: 'villa', label: 'Villa' },
  { value: 'plot', label: 'Plot / Land' },
  { value: 'farmhouse', label: 'Farmhouse' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'pg', label: 'PG / Co-living' },
  { value: 'other', label: 'Other' },
];

const FURNISHING_OPTIONS = [
  { value: 'unfurnished', label: 'Unfurnished' },
  { value: 'semi-furnished', label: 'Semi-Furnished' },
  { value: 'furnished', label: 'Furnished' },
];

const LOCALITIES = [
  'Rajpur Road', 'Sahastradhara Road', 'GMS Road', 'Premnagar',
  'Clement Town', 'Doiwala', 'Mussoorie Road', 'Vasant Vihar',
  'Raipur', 'Paltan Bazaar', 'Race Course', 'Ballupur',
  'Majra', 'Nehru Colony', 'Dalanwala', 'Other',
];

export default function EditMyPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [property, setProperty] = useState<Property | null>(null);
  const [listedBy, setListedBy] = useState<'owner' | 'dealer' | 'builder' | 'dehradunghar'>('owner');
  const [areaUnit, setAreaUnit] = useState<'sqft' | 'sqm' | 'gaj'>('sqft');

  useEffect(() => {
    async function load() {
      const firebaseUser = getCurrentUser();
      if (!firebaseUser) { router.push('/login'); return; }

      const supabase = createClient();
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .eq('user_id', firebaseUser.uid)
        .single();

      if (error || !data) { setError('Property not found or access denied.'); setLoading(false); return; }
      setProperty(data as Property);
      setListedBy((data as Property).listed_by || 'owner');
      setLoading(false);
    }
    load();
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const title = form.get('title') as string;
    const owner_phone = (form.get('owner_phone') as string).replace(/\s+/g, '');

    const updates = {
      title,
      slug: generateSlug(title) + '-' + id.slice(0, 8),
      description: form.get('description') as string || '',
      price: parseInt(form.get('price') as string) || 0,
      locality: form.get('locality') as string,
      property_type: form.get('property_type') as string,
      bedrooms: parseInt(form.get('bedrooms') as string) || 0,
      bathrooms: parseInt(form.get('bathrooms') as string) || 0,
      area_sqft: Math.round((parseInt(form.get('area_sqft') as string) || 0) * (areaUnit === 'sqm' ? 10.764 : areaUnit === 'gaj' ? 9 : 1)),
      status: form.get('status') as string,
      furnishing: form.get('furnishing') as string || 'unfurnished',
      facing: form.get('facing') as string || '',
      floor: form.get('floor') as string || '',
      total_floors: parseInt(form.get('total_floors') as string) || 0,
      amenities: (form.get('amenities') as string || '').split(',').map(s => s.trim()).filter(Boolean),
      owner_name: form.get('owner_name') as string,
      owner_phone: owner_phone.startsWith('91') ? owner_phone : `91${owner_phone}`,
      owner_email: form.get('owner_email') as string || '',
      contact_phone: owner_phone.startsWith('91') ? owner_phone : `91${owner_phone}`,
      youtube_url: (form.get('youtube_url') as string || '').trim() || null,
      listed_by: listedBy,
    };

    try {
      const firebaseUser = getCurrentUser();
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id,
          data: { ...updates, user_id: firebaseUser?.uid },
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to update.');
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <section className="content-page"><div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}><p style={{ color: '#666' }}>Loading...</p></div></section>;
  if (!property) return <section className="content-page"><div className="container"><p style={{ color: 'red' }}>{error}</p><Link href="/dashboard" className="btn btn--outline" style={{ marginTop: '1rem' }}>Back to Dashboard</Link></div></section>;

  return (
    <>
      <div className="page-header">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Edit Listing' }]} />
          <h1>Edit Listing</h1>
          <p>Update your property details</p>
        </div>
      </div>
      <section className="content-page">
        <div className="container" style={{ maxWidth: 650 }}>
          {error && (
            <div style={{ padding: '.75rem 1rem', background: '#fef2f2', color: '#b91c1c', borderRadius: 8, marginBottom: '1rem', fontSize: '.85rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Contact Details */}
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '.75rem', paddingBottom: '.5rem', borderBottom: '1px solid #e5e7eb' }}>
              Your Contact Details
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Your Name *</label>
                <input name="owner_name" className="form-input" required defaultValue={property.owner_name} />
              </div>
              <div className="form-group">
                <label className="form-label">WhatsApp Number *</label>
                <input name="owner_phone" type="tel" className="form-input" required defaultValue={property.owner_phone} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email (optional)</label>
              <input name="owner_email" type="email" className="form-input" defaultValue={property.owner_email} />
            </div>
            <div className="form-group">
              <label className="form-label">I am a *</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '.35rem' }}>
                {(['owner', 'dealer', 'builder'] as const).map((type) => (
                  <label
                    key={type}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '.4rem',
                      padding: '.5rem 1rem',
                      borderRadius: 8,
                      border: listedBy === type ? '2px solid var(--color-primary)' : '1.5px solid #d1d5db',
                      background: listedBy === type ? '#e8f5e9' : '#fff',
                      cursor: 'pointer',
                      fontSize: '.9rem',
                      fontWeight: listedBy === type ? 600 : 400,
                      transition: 'all .15s',
                    }}
                  >
                    <input
                      type="radio"
                      name="listed_by"
                      value={type}
                      checked={listedBy === type}
                      onChange={() => setListedBy(type)}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            {/* Property Details */}
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '1.5rem 0 .75rem', paddingBottom: '.5rem', borderBottom: '1px solid #e5e7eb' }}>
              Property Details
            </h2>
            <div className="form-group">
              <label className="form-label">Property Title *</label>
              <input name="title" className="form-input" required defaultValue={property.title} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Property Type *</label>
                <select name="property_type" className="form-input" required defaultValue={property.property_type}>
                  {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Locality *</label>
                <select name="locality" className="form-input" required defaultValue={property.locality}>
                  {LOCALITIES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input name="price" type="number" className="form-input" required defaultValue={property.price} />
              </div>
              <div className="form-group">
                <label className="form-label">Bedrooms</label>
                <select name="bedrooms" className="form-input" defaultValue={property.bedrooms}>
                  <option value="0">N/A</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4 BHK</option>
                  <option value="5">5+ BHK</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Bathrooms</label>
                <select name="bathrooms" className="form-input" defaultValue={property.bathrooms}>
                  <option value="0">N/A</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4+</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Area</label>
                <div style={{ display: 'flex', gap: '.5rem' }}>
                  <input name="area_sqft" type="number" className="form-input" defaultValue={property.area_sqft} style={{ flex: 1 }} />
                  <select value={areaUnit} onChange={(e) => setAreaUnit(e.target.value as 'sqft' | 'sqm' | 'gaj')} className="form-input" style={{ width: 'auto', minWidth: 80 }}>
                    <option value="sqft">sq.ft.</option>
                    <option value="sqm">sq.m.</option>
                    <option value="gaj">Gaj</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Furnishing</label>
                <select name="furnishing" className="form-input" defaultValue={property.furnishing}>
                  {FURNISHING_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Facing</label>
                <input name="facing" className="form-input" defaultValue={property.facing} />
              </div>
              <div className="form-group">
                <label className="form-label">Floor</label>
                <input name="floor" className="form-input" defaultValue={property.floor} />
              </div>
              <div className="form-group">
                <label className="form-label">Total Floors</label>
                <input name="total_floors" type="number" className="form-input" defaultValue={property.total_floors} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" className="form-input" defaultValue={property.status}>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-textarea" placeholder="Describe your property — features, nearby landmarks, why it's a great choice..." rows={4} defaultValue={property.description} />
            </div>
            <div className="form-group">
              <label className="form-label">Amenities (comma separated)</label>
              <input name="amenities" className="form-input" placeholder="Parking, Lift, Power Backup, Garden" defaultValue={property.amenities?.join(', ')} />
            </div>

            {/* Media */}
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '1.5rem 0 .75rem', paddingBottom: '.5rem', borderBottom: '1px solid #e5e7eb' }}>
              Media
            </h2>
            <div className="form-group">
              <label className="form-label">YouTube Video Link (optional)</label>
              <input name="youtube_url" className="form-input" placeholder="https://www.youtube.com/watch?v=..." defaultValue={property.youtube_url || ''} />
              <p style={{ fontSize: '.75rem', color: '#999', marginTop: '.25rem' }}>Add a property walkthrough video</p>
            </div>

            <button type="submit" className="btn btn--primary btn--lg" style={{ width: '100%', marginTop: '.5rem' }} disabled={saving}>
              {saving ? 'Saving...' : 'Update Listing'}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
