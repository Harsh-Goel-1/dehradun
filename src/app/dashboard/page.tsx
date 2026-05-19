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
  const [isAdmin, setIsAdmin] = useState(false);
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

      // Check if admin
      if (firebaseUser.phoneNumber) {
        try {
          const res = await fetch(`/api/admin/properties?phone=${encodeURIComponent(firebaseUser.phoneNumber)}`);
          setIsAdmin(res.ok);
        } catch { setIsAdmin(false); }
      }
    });

    return () => unsubscribe();
  }, [router]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    if (!user) return;

    const res = await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id, data: { user_id: user.uid } }),
    });

    if (res.ok) {
      setProperties(properties.filter((p) => p.id !== id));
    }
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
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
              {isAdmin && (
                <Link href="/admin" className="btn" style={{ background: '#1e40af', color: '#fff', border: 'none' }}>
                  🛡 Admin Panel
                </Link>
              )}
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
                        {p.listed_by === 'dehradunghar' && (
                          <span style={{ marginLeft: '.35rem', fontSize: '.6rem', background: '#dbeafe', color: '#1e40af', padding: '.1rem .35rem', borderRadius: 4, fontWeight: 700 }}>
                            OFFICIAL
                          </span>
                        )}
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

          {/* Admin hint */}
          {isAdmin && (
            <div style={{
              marginTop: '2rem', padding: '1rem 1.25rem',
              background: '#f0f9ff', border: '1.5px solid #93c5fd',
              borderRadius: 10, display: 'flex', alignItems: 'center', gap: '.75rem',
            }}>
              <span style={{ fontSize: '1.25rem' }}>🛡</span>
              <div>
                <p style={{ fontWeight: 600, color: '#1e40af', fontSize: '.9rem', margin: 0 }}>You have admin access</p>
                <p style={{ fontSize: '.8rem', color: '#3b82f6', margin: 0 }}>
                  Go to <Link href="/admin" style={{ fontWeight: 700, textDecoration: 'underline' }}>Admin Panel</Link> to manage all listings, delete spam, and toggle featured properties.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
