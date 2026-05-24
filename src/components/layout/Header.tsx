'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { onAuthChange, type User } from '@/lib/firebase/auth';
import InstallButton from '@/components/ui/InstallButton';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/properties', label: 'Properties' },
  { href: '/about', label: 'About' },
];

const LOCALITY_LINKS = [
  { href: '/property-in-rajpur-road', label: 'Rajpur Road' },
  { href: '/flats-in-sahastradhara-road', label: 'Sahastradhara Road' },
  { href: '/plots-in-premnagar', label: 'Premnagar' },
  { href: '/properties-in-doiwala', label: 'Doiwala' },
  { href: '/property-in-gms-road', label: 'GMS Road' },
  { href: '/property-in-clement-town', label: 'Clement Town' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [localityOpen, setLocalityOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  return (
    <header className="header">
      <div className="header-inner container">
        <Link href="/" className="logo" aria-label="Home">
          <Image
            src="/images/logo.png"
            alt="DehradunGhar"
            width={220}
            height={48}
            style={{ height: 44, width: 'auto' }}
            priority
          />
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
          <div
            className="nav-dropdown"
            onMouseEnter={() => setLocalityOpen(true)}
            onMouseLeave={() => setLocalityOpen(false)}
          >
            <button className="nav-link nav-dropdown-trigger" aria-expanded={localityOpen}>
              Localities
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {localityOpen && (
              <div className="nav-dropdown-menu">
                {LOCALITY_LINKS.map((link) => (
                  <Link key={link.href} href={link.href} className="nav-dropdown-item">
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* User icon */}
          {user ? (
            <Link href="/dashboard" className="nav-user-icon" aria-label="My Dashboard" title="My Dashboard">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <circle cx="12" cy="8" r="4" />
                <path d="M20 21a8 8 0 0 0-16 0" />
              </svg>
            </Link>
          ) : (
            <Link href="/login" className="nav-user-icon" aria-label="Log In" title="Log In">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          )}

          <InstallButton />
        </nav>

        <div className="mobile-header-right">
          <InstallButton />
          {/* Mobile user icon */}
          {user ? (
            <Link href="/dashboard" className="nav-user-icon" aria-label="My Dashboard">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <circle cx="12" cy="8" r="4" />
                <path d="M20 21a8 8 0 0 0-16 0" />
              </svg>
            </Link>
          ) : (
            <Link href="/login" className="nav-user-icon" aria-label="Log In">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          )}

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="mobile-nav-link"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <Link href="/dashboard" className="mobile-nav-link" onClick={() => setMobileOpen(false)} style={{ fontWeight: 600 }}>
              My Dashboard
            </Link>
          ) : (
            <Link href="/login" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
              Log In
            </Link>
          )}
          <div className="mobile-nav-section-label">Localities</div>
          {LOCALITY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="mobile-nav-link mobile-nav-link--sub"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
