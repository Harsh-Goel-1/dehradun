'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { onAuthChange, type User } from '@/lib/firebase/auth';
import { formatPrice } from '@/lib/utils';
import { Property } from '@/types';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  // Fetch all properties once user is authenticated
  useEffect(() => {
    if (!authChecked || !user?.phoneNumber) return;

    async function fetchProperties() {
      try {
        const res = await fetch(`/api/admin/properties?phone=${encodeURIComponent(user!.phoneNumber!)}`);
        if (res.status === 403) {
          setError('ACCESS_DENIED');
          setLoading(false);
          return;
        }
        const result = await res.json();
        if (!res.ok) throw new Error(result.error);
        setProperties(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load properties.');
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, [authChecked, user]);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    if (!user?.phoneNumber) return;

    const res = await fetch('/api/admin/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', phone: user.phoneNumber, id }),
    });

    if (res.ok) {
      setProperties(properties.filter((p) => p.id !== id));
    }
  }

  async function handleToggleFeatured(id: string) {
    if (!user?.phoneNumber) return;

    const res = await fetch('/api/admin/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_featured', phone: user.phoneNumber, id }),
    });

    if (res.ok) {
      const result = await res.json();
      setProperties(properties.map((p) =>
        p.id === id ? { ...p, featured: result.featured } : p
      ));
    }
  }

  // Not logged in
  if (authChecked && !user) {
    return (
      <>
        <div className="page-header">
          <div className="container">
            <Breadcrumbs items={[{ label: 'Admin' }]} />
            <h1>Admin Panel</h1>
          </div>
        </div>
        <section className="content-page">
          <div className="container" style={{ maxWidth: 500, textAlign: 'center' }}>
            <div style={{ padding: '2.5rem', background: '#f9fafb', borderRadius: 12 }}>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>Please log in to access the admin panel.</p>
              <Link href="/login?next=/admin" className="btn btn--primary">Log In</Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Access denied
  if (error === 'ACCESS_DENIED') {
    return (
      <>
        <div className="page-header">
          <div className="container">
            <Breadcrumbs items={[{ label: 'Admin' }]} />
            <h1>Access Denied</h1>
          </div>
        </div>
        <section className="content-page">
          <div className="container" style={{ maxWidth: 500, textAlign: 'center' }}>
            <div style={{ padding: '2.5rem', background: '#fef2f2', borderRadius: 12 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="1.5" style={{ marginBottom: '.75rem' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#b91c1c', marginBottom: '.5rem' }}>Not Authorized</h2>
              <p style={{ color: '#666', fontSize: '.9rem', marginBottom: '1.5rem' }}>
                Your phone number does not have admin access.
              </p>
              <Link href="/" className="btn btn--outline">Go Home</Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Loading
  if (loading) {
    return <section className="content-page"><div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}><p style={{ color: '#666' }}>Loading admin panel...</p></div></section>;
  }

  // Filter and search
  const filtered = properties.filter((p) => {
    if (filter === 'featured' && !p.featured) return false;
    if (filter === 'available' && p.status !== 'available') return false;
    if (filter === 'sold' && p.status !== 'sold') return false;
    if (search) {
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q)
        || p.locality.toLowerCase().includes(q)
        || p.owner_name?.toLowerCase().includes(q)
        || p.owner_phone?.includes(q);
    }
    return true;
  });

  return (
    <>
      <div className="page-header">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Admin Panel' }]} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1>Admin Panel</h1>
              <p>Manage all property listings</p>
            </div>
            <Link href="/dashboard" className="btn btn--outline">My Dashboard</Link>
          </div>
        </div>
      </div>

      <section className="content-page">
        <div className="container">
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total', count: properties.length, color: '#1a5632' },
              { label: 'Available', count: properties.filter(p => p.status === 'available').length, color: '#16a34a' },
              { label: 'Sold', count: properties.filter(p => p.status === 'sold').length, color: '#b91c1c' },
              { label: 'Featured', count: properties.filter(p => p.featured).length, color: '#d97706' },
            ].map((stat) => (
              <div key={stat.label} className="contact-card" style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: stat.color }}>{stat.count}</p>
                <p style={{ fontSize: '.85rem', color: '#666' }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search by title, locality, owner, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ flex: 1, minWidth: 200, maxWidth: 400 }}
            />
            <div style={{ display: 'flex', gap: '.5rem' }}>
              {['all', 'available', 'sold', 'featured'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '.4rem .85rem',
                    borderRadius: 6,
                    border: 'none',
                    fontSize: '.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: filter === f ? '#1a5632' : '#f3f4f6',
                    color: filter === f ? '#fff' : '#666',
                    transition: 'all .15s',
                  }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <p style={{ fontSize: '.85rem', color: '#999', marginBottom: '1rem' }}>
            Showing {filtered.length} of {properties.length} listings
          </p>

          {/* Table */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: 12 }}>
              <p style={{ color: '#666' }}>No listings found.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Locality</th>
                    <th>Price</th>
                    <th>Listed By</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <Link href={`/properties/${p.slug}`} style={{ color: '#1a5632', fontWeight: 500 }}>
                          {p.title}
                        </Link>
                        {p.featured && (
                          <span style={{ marginLeft: '.35rem', fontSize: '.65rem', background: '#fef3c7', color: '#d97706', padding: '.1rem .35rem', borderRadius: 4, fontWeight: 700 }}>
                            ★ FEATURED
                          </span>
                        )}
                      </td>
                      <td>{p.locality}</td>
                      <td>{formatPrice(p.price)}</td>
                      <td>
                        <span style={{
                          fontSize: '.75rem',
                          fontWeight: 600,
                          padding: '.15rem .45rem',
                          borderRadius: 4,
                          background: p.listed_by === 'owner' ? '#e8f5e9' : p.listed_by === 'builder' ? '#e3f2fd' : '#f3e8ff',
                          color: p.listed_by === 'owner' ? '#1a5632' : p.listed_by === 'builder' ? '#1565c0' : '#7c3aed',
                        }}>
                          {p.listed_by || 'owner'}
                        </span>
                      </td>
                      <td style={{ fontSize: '.85rem' }}>
                        <div>{p.owner_name || '—'}</div>
                        <div style={{ color: '#999', fontSize: '.75rem' }}>{p.owner_phone || ''}</div>
                      </td>
                      <td>
                        <span style={{
                          padding: '.15rem .5rem',
                          borderRadius: 4,
                          fontSize: '.75rem',
                          fontWeight: 600,
                          background: p.status === 'available' ? '#e8f5e9' : p.status === 'sold' ? '#fef2f2' : '#f3f4f6',
                          color: p.status === 'available' ? '#1a5632' : p.status === 'sold' ? '#b91c1c' : '#666',
                        }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '.8rem', color: '#666', whiteSpace: 'nowrap' }}>
                        {new Date(p.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                          <button
                            onClick={() => handleToggleFeatured(p.id)}
                            title={p.featured ? 'Remove from featured' : 'Mark as featured'}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              padding: '.2rem',
                            }}
                          >
                            {p.featured ? '⭐' : '☆'}
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.title)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#b91c1c',
                              fontSize: '.8rem',
                              fontWeight: 600,
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
