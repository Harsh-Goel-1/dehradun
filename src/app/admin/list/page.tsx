'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { generateSlug } from '@/lib/utils';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthChange, type User } from '@/lib/firebase/auth';

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

export default function AdminListPropertyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState('');
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  // Verify admin access
  useEffect(() => {
    if (!authChecked || !user?.phoneNumber) return;

    async function checkAdmin() {
      const res = await fetch(`/api/admin/properties?phone=${encodeURIComponent(user!.phoneNumber!)}`);
      setIsAdmin(res.ok);
    }
    checkAdmin();
  }, [authChecked, user]);

  function handleCoverSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB.'); return; }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setError('');
  }

  function handleBrochureSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { setError('Brochure must be a PDF file.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Brochure PDF must be under 10MB.'); return; }
    setBrochureFile(file);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    const form = new FormData(e.currentTarget);
    const title = form.get('title') as string;
    const owner_phone = (form.get('owner_phone') as string).replace(/\s+/g, '');

    if (!owner_phone || owner_phone.length < 10) {
      setError('Please enter a valid phone number.');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    let coverUrl = '';
    let brochureUrl = '';

    // Upload cover photo
    if (coverFile) {
      setUploadProgress('Uploading cover photo...');
      const ext = coverFile.name.split('.').pop();
      const path = `admin/${Date.now()}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(path, coverFile, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        setLoading(false);
        setUploadProgress('');
        return;
      }

      const { data: urlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(uploadData.path);
      coverUrl = urlData.publicUrl;
    }

    // Upload brochure
    if (brochureFile) {
      setUploadProgress('Uploading brochure...');
      const brochurePath = `admin/brochure-${Date.now()}.pdf`;

      const { data: brochureData, error: brochureError } = await supabase.storage
        .from('property-images')
        .upload(brochurePath, brochureFile, { cacheControl: '3600', upsert: false });

      if (brochureError) {
        setError(`Brochure upload failed: ${brochureError.message}`);
        setLoading(false);
        setUploadProgress('');
        return;
      }

      const { data: brochureUrlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(brochureData.path);
      brochureUrl = brochureUrlData.publicUrl;
    }

    setUploadProgress('Saving listing...');

    const property = {
      title,
      slug: generateSlug(title) + '-' + Date.now().toString(36),
      description: form.get('description') as string || '',
      price: parseInt(form.get('price') as string) || 0,
      locality: form.get('locality') as string,
      city: 'Dehradun',
      property_type: form.get('property_type') as string,
      bedrooms: parseInt(form.get('bedrooms') as string) || 0,
      bathrooms: parseInt(form.get('bathrooms') as string) || 0,
      area_sqft: parseInt(form.get('area_sqft') as string) || 0,
      images: coverUrl ? [coverUrl] : [],
      featured: (form.get('featured') as string) === 'on',
      status: 'available',
      furnishing: form.get('furnishing') as string || 'unfurnished',
      facing: form.get('facing') as string || '',
      floor: form.get('floor') as string || '',
      total_floors: parseInt(form.get('total_floors') as string) || 0,
      amenities: (form.get('amenities') as string || '').split(',').map(s => s.trim()).filter(Boolean),
      owner_name: 'DehradunGhar',
      owner_phone: owner_phone.startsWith('91') ? owner_phone : `91${owner_phone}`,
      owner_email: form.get('owner_email') as string || '',
      contact_phone: owner_phone.startsWith('91') ? owner_phone : `91${owner_phone}`,
      youtube_url: (form.get('youtube_url') as string || '').trim() || null,
      listed_by: 'dehradunghar',
      brochure_url: brochureUrl || null,
      user_id: user.uid,
    };

    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'insert', data: property }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to submit listing.');
      setSuccess(true);
      setCoverFile(null);
      setCoverPreview(null);
      setBrochureFile(null);
      setUploadProgress('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit listing.');
      setUploadProgress('');
    } finally {
      setLoading(false);
    }
  }

  function handleListAnother() {
    setSuccess(false);
    setError('');
    setCoverFile(null);
    setCoverPreview(null);
    setBrochureFile(null);
    formRef.current?.reset();
  }

  if (!authChecked) return <section className="content-page"><div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}><p style={{ color: '#666' }}>Loading...</p></div></section>;

  if (authChecked && !user) {
    return (
      <>
        <div className="page-header"><div className="container"><Breadcrumbs items={[{ label: 'Admin', href: '/admin' }, { label: 'New Listing' }]} /><h1>Admin — New Listing</h1></div></div>
        <section className="content-page"><div className="container" style={{ maxWidth: 500, textAlign: 'center' }}>
          <div style={{ padding: '2.5rem', background: '#f9fafb', borderRadius: 12 }}>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>Please log in as admin.</p>
            <Link href="/login?next=/admin/list" className="btn btn--primary">Log In</Link>
          </div>
        </div></section>
      </>
    );
  }

  if (authChecked && !isAdmin) {
    return (
      <>
        <div className="page-header"><div className="container"><h1>Access Denied</h1></div></div>
        <section className="content-page"><div className="container" style={{ maxWidth: 500, textAlign: 'center' }}>
          <div style={{ padding: '2.5rem', background: '#fef2f2', borderRadius: 12 }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#b91c1c', marginBottom: '.5rem' }}>Not Authorized</h2>
            <p style={{ color: '#666', fontSize: '.9rem', marginBottom: '1.5rem' }}>Your phone number does not have admin access.</p>
            <Link href="/" className="btn btn--outline">Go Home</Link>
          </div>
        </div></section>
      </>
    );
  }

  if (success) {
    return (
      <>
        <div className="page-header"><div className="container"><Breadcrumbs items={[{ label: 'Admin', href: '/admin' }, { label: 'New Listing' }]} /><h1>Official Listing Created!</h1></div></div>
        <section className="content-page"><div className="container" style={{ maxWidth: 600, textAlign: 'center' }}>
          <div style={{ padding: '2rem', background: '#e8f5e9', borderRadius: 12, marginBottom: '1.5rem' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1a5632" strokeWidth="2" style={{ marginBottom: '.75rem' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a5632', marginBottom: '.5rem' }}>DehradunGhar Official Listing Created!</h2>
            <p style={{ fontSize: '.9rem', color: '#444' }}>This listing will show the official verified badge.</p>
          </div>
          <button onClick={handleListAnother} className="btn btn--primary" style={{ marginRight: '.75rem' }}>List Another</button>
          <Link href="/admin" className="btn btn--outline">Back to Admin</Link>
        </div></section>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Admin', href: '/admin' }, { label: 'New Official Listing' }]} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1>New Official Listing</h1>
              <p>This listing will carry the DehradunGhar verified badge</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.4rem .85rem', background: '#e8f5e9', borderRadius: 8, border: '1.5px solid #1a5632' }}>
              <span style={{ fontSize: '1rem' }}>✓</span>
              <span style={{ fontSize: '.8rem', fontWeight: 700, color: '#1a5632' }}>OFFICIAL LISTING</span>
            </div>
          </div>
        </div>
      </div>

      <section className="content-page">
        <div className="container" style={{ maxWidth: 650 }}>
          {error && (
            <div style={{ padding: '.75rem 1rem', background: '#fef2f2', color: '#b91c1c', borderRadius: 8, marginBottom: '1rem', fontSize: '.85rem' }}>
              {error}
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit}>
            {/* Contact for this listing */}
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '.75rem', paddingBottom: '.5rem', borderBottom: '1px solid #e5e7eb' }}>
              Contact Details for this Listing
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Contact Phone *</label>
                <input name="owner_phone" type="tel" className="form-input" required placeholder="9911443255" />
              </div>
              <div className="form-group">
                <label className="form-label">Email (optional)</label>
                <input name="owner_email" type="email" className="form-input" placeholder="admin@dehradunghar.com" />
              </div>
            </div>

            {/* Property Details */}
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '1.5rem 0 .75rem', paddingBottom: '.5rem', borderBottom: '1px solid #e5e7eb' }}>
              Property Details
            </h2>
            <div className="form-group">
              <label className="form-label">Property Title *</label>
              <input name="title" className="form-input" required placeholder="e.g. 3 BHK Flat in Rajpur Road" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Property Type *</label>
                <select name="property_type" className="form-input" required>
                  {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Locality *</label>
                <select name="locality" className="form-input" required>
                  {LOCALITIES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input name="price" type="number" className="form-input" required placeholder="5000000" />
              </div>
              <div className="form-group">
                <label className="form-label">Bedrooms</label>
                <select name="bedrooms" className="form-input">
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
                <select name="bathrooms" className="form-input">
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
                <label className="form-label">Area (sq.ft.)</label>
                <input name="area_sqft" type="number" className="form-input" placeholder="1200" />
              </div>
              <div className="form-group">
                <label className="form-label">Furnishing</label>
                <select name="furnishing" className="form-input">
                  {FURNISHING_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Facing</label>
                <input name="facing" className="form-input" placeholder="North" />
              </div>
              <div className="form-group">
                <label className="form-label">Floor</label>
                <input name="floor" className="form-input" placeholder="3rd" />
              </div>
              <div className="form-group">
                <label className="form-label">Total Floors</label>
                <input name="total_floors" type="number" className="form-input" placeholder="7" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-textarea" placeholder="Describe the property..." rows={4} />
            </div>
            <div className="form-group">
              <label className="form-label">Amenities (comma separated)</label>
              <input name="amenities" className="form-input" placeholder="Parking, Lift, Power Backup, Garden" />
            </div>

            {/* Admin-only: Mark as featured */}
            <div className="form-group" style={{ marginTop: '.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="featured" style={{ accentColor: 'var(--color-primary)', width: 18, height: 18 }} />
                <span className="form-label" style={{ margin: 0 }}>⭐ Mark as Featured Listing</span>
              </label>
            </div>

            {/* Media */}
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '1.5rem 0 .75rem', paddingBottom: '.5rem', borderBottom: '1px solid #e5e7eb' }}>
              Media
            </h2>
            <div className="form-group">
              <label className="form-label">Cover Photo</label>
              {coverPreview ? (
                <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', marginBottom: '.5rem' }}>
                  <img src={coverPreview} alt="Cover preview" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
                  <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(null); }}
                    style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,.6)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>×</button>
                </div>
              ) : (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', border: '2px dashed #d1d5db', borderRadius: 8, cursor: 'pointer', background: '#f9fafb' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                  <span style={{ fontSize: '.85rem', color: '#666', marginTop: '.5rem' }}>Click to upload cover photo</span>
                  <span style={{ fontSize: '.75rem', color: '#999', marginTop: '.25rem' }}>JPG, PNG or WebP · Max 5MB</span>
                  <input type="file" accept="image/*" onChange={handleCoverSelect} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            {/* Brochure */}
            <div className="form-group">
              <label className="form-label">Brochure PDF (optional)</label>
              {brochureFile ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.75rem 1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
                  <span style={{ fontSize: '.85rem', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{brochureFile.name}</span>
                  <button type="button" onClick={() => setBrochureFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c', fontSize: '.85rem', fontWeight: 600 }}>Remove</button>
                </div>
              ) : (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', border: '2px dashed #d1d5db', borderRadius: 8, cursor: 'pointer', background: '#f9fafb' }}>
                  <span style={{ fontSize: '.85rem', color: '#666' }}>Click to upload brochure PDF</span>
                  <span style={{ fontSize: '.75rem', color: '#999', marginTop: '.25rem' }}>PDF only · Max 10MB</span>
                  <input type="file" accept="application/pdf" onChange={handleBrochureSelect} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            {/* YouTube */}
            <div className="form-group">
              <label className="form-label">YouTube Video Link (optional)</label>
              <input name="youtube_url" className="form-input" placeholder="https://www.youtube.com/watch?v=..." />
            </div>

            <button type="submit" className="btn btn--primary btn--lg" style={{ width: '100%', marginTop: '.5rem' }} disabled={loading}>
              {loading ? (uploadProgress || 'Publishing...') : '🏛 Publish as DehradunGhar Official'}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
