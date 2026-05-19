'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { generateSlug } from '@/lib/utils';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Property } from '@/types';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { getCurrentUser } from '@/lib/firebase/auth';

const PROPERTY_TYPES = ['flat', 'house', 'villa', 'plot', 'commercial', 'pg'];
const FURNISHING_OPTIONS = ['unfurnished', 'semi-furnished', 'furnished'];

export default function EditMyPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [property, setProperty] = useState<Property | null>(null);

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

    const updates = {
      title,
      slug: generateSlug(title) + '-' + id.slice(0, 8),
      description: form.get('description') as string,
      price: parseInt(form.get('price') as string),
      locality: form.get('locality') as string,
      property_type: form.get('property_type') as string,
      bedrooms: parseInt(form.get('bedrooms') as string) || 0,
      bathrooms: parseInt(form.get('bathrooms') as string) || 0,
      area_sqft: parseInt(form.get('area_sqft') as string) || 0,
      images: (form.get('images') as string).split('\n').filter(Boolean),
      status: form.get('status') as string,
      furnishing: form.get('furnishing') as string,
      facing: form.get('facing') as string,
      floor: form.get('floor') as string,
      total_floors: parseInt(form.get('total_floors') as string) || 0,
      amenities: (form.get('amenities') as string).split(',').map(s => s.trim()).filter(Boolean),
      owner_name: form.get('owner_name') as string,
      owner_phone: form.get('owner_phone') as string,
      owner_email: form.get('owner_email') as string,
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

  if (loading) return <section className="content-page"><div className="container"><p>Loading...</p></div></section>;
  if (!property) return <section className="content-page"><div className="container"><p style={{ color: 'red' }}>{error}</p><Link href="/dashboard" className="btn btn--outline" style={{ marginTop: '1rem' }}>Back to Dashboard</Link></div></section>;

  return (
    <>
      <div className="page-header">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Edit Listing' }]} />
          <h1>Edit Listing</h1>
        </div>
      </div>
      <section className="content-page">
        <div className="container" style={{ maxWidth: 600 }}>
          {error && <p style={{ color: 'red', marginBottom: '1rem', fontSize: '.85rem' }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label className="form-label">Your Name</label><input name="owner_name" className="form-input" defaultValue={property.owner_name} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">WhatsApp</label><input name="owner_phone" className="form-input" defaultValue={property.owner_phone} /></div>
              <div className="form-group"><label className="form-label">Email</label><input name="owner_email" className="form-input" defaultValue={property.owner_email} /></div>
            </div>
            <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
            <div className="form-group"><label className="form-label">Title *</label><input name="title" className="form-input" required defaultValue={property.title} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Price (₹) *</label><input name="price" type="number" className="form-input" required defaultValue={property.price} /></div>
              <div className="form-group"><label className="form-label">Locality *</label><input name="locality" className="form-input" required defaultValue={property.locality} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Type</label><select name="property_type" className="form-input" defaultValue={property.property_type}>{PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Bedrooms</label><input name="bedrooms" type="number" className="form-input" defaultValue={property.bedrooms} /></div>
              <div className="form-group"><label className="form-label">Bathrooms</label><input name="bathrooms" type="number" className="form-input" defaultValue={property.bathrooms} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Area (sq.ft.)</label><input name="area_sqft" type="number" className="form-input" defaultValue={property.area_sqft} /></div>
              <div className="form-group"><label className="form-label">Furnishing</label><select name="furnishing" className="form-input" defaultValue={property.furnishing}>{FURNISHING_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}</select></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Facing</label><input name="facing" className="form-input" defaultValue={property.facing} /></div>
              <div className="form-group"><label className="form-label">Floor</label><input name="floor" className="form-input" defaultValue={property.floor} /></div>
              <div className="form-group"><label className="form-label">Total Floors</label><input name="total_floors" type="number" className="form-input" defaultValue={property.total_floors} /></div>
            </div>
            <div className="form-group"><label className="form-label">Status</label><select name="status" className="form-input" defaultValue={property.status}><option value="available">Available</option><option value="sold">Sold</option><option value="rented">Rented</option></select></div>
            <div className="form-group"><label className="form-label">Description</label><textarea name="description" className="form-textarea" defaultValue={property.description} /></div>
            <div className="form-group"><label className="form-label">Image URLs (one per line)</label><textarea name="images" className="form-textarea" defaultValue={property.images?.join('\n')} /></div>
            <div className="form-group"><label className="form-label">Amenities (comma separated)</label><input name="amenities" className="form-input" defaultValue={property.amenities?.join(', ')} /></div>
            <button type="submit" className="btn btn--primary btn--lg" style={{ width: '100%' }} disabled={saving}>
              {saving ? 'Saving...' : 'Update Listing'}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
