'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Property } from '@/types';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { onAuthChange, signOut, type User } from '@/lib/firebase/auth';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login');
        return;
      }

      setUser(firebaseUser);

      // Fetch user's properties from Supabase using Firebase UID
      const supabase = createClient();
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', firebaseUser.uid)
        .order('created_at', { ascending: false });

      setProperties((data as Property[]) || []);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    const supabase = createClient();
    await supabase.from('properties').delete().eq('id', id);
    setProperties(properties.filter((p) => p.id !== id));
  }

  async function handleLogout() {
    await signOut();
    router.push('/');
  }

  if (loading) {
    return (
      <section className="content-page">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p style={{ color: '#666' }}>Loading your dashboard...</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Dashboard' }]} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1>My Dashboard</h1>
              <p>{user?.phoneNumber}</p>
            </div>
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <Link href="/list-property" className="btn btn--primary">+ List New Property</Link>
              <button onClick={handleLogout} className="btn btn--outline">Log Out</button>
            </div>
          </div>
        </div>
      </div>

      <section className="content-page">
        <div className="container">
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="contact-card" style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: '#1a5632' }}>{properties.length}</p>
              <p style={{ fontSize: '.85rem', color: '#666' }}>Total Listings</p>
            </div>
            <div className="contact-card" style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: '#1a5632' }}>
                {properties.filter(p => p.status === 'available').length}
              </p>
              <p style={{ fontSize: '.85rem', color: '#666' }}>Active</p>
            </div>
            <div className="contact-card" style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: '#1a5632' }}>
                {properties.filter(p => p.status === 'sold').length}
              </p>
              <p style={{ fontSize: '.85rem', color: '#666' }}>Sold</p>
            </div>
          </div>

          {/* Listings */}
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>My Listings</h2>

          {properties.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: 12 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" style={{ marginBottom: '.75rem' }}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <p style={{ color: '#666', marginBottom: '1rem' }}>You haven&apos;t listed any properties yet.</p>
              <Link href="/list-property" className="btn btn--primary">List Your First Property</Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Locality</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Listed On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <Link href={`/properties/${p.slug}`} style={{ color: '#1a5632', fontWeight: 500 }}>
                          {p.title}
                        </Link>
                      </td>
                      <td>{p.locality}</td>
                      <td>{formatPrice(p.price)}</td>
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
                      <td style={{ fontSize: '.85rem', color: '#666' }}>
                        {new Date(p.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <Link href={`/dashboard/edit/${p.id}`} style={{ color: '#1a5632', marginRight: '.75rem', fontSize: '.85rem' }}>Edit</Link>
                        <button onClick={() => handleDelete(p.id)} style={{ color: '#b91c1c', background: 'none', border: 'none', cursor: 'pointer', fontSize: '.85rem' }}>Delete</button>
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
