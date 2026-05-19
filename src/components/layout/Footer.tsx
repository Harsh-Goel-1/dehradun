import Link from 'next/link';
import Image from 'next/image';
import { SITE_NAME } from '@/lib/utils';

const FOOTER_LOCALITIES = [
  { href: '/property-in-rajpur-road', label: 'Rajpur Road' },
  { href: '/flats-in-sahastradhara-road', label: 'Sahastradhara Road' },
  { href: '/plots-in-premnagar', label: 'Premnagar' },
  { href: '/properties-in-doiwala', label: 'Doiwala' },
  { href: '/property-in-gms-road', label: 'GMS Road' },
  { href: '/property-in-clement-town', label: 'Clement Town' },
];

const PROPERTY_TYPES = [
  { href: '/properties?type=flat', label: 'Flats & Apartments' },
  { href: '/properties?type=house', label: 'Independent Houses' },
  { href: '/properties?type=villa', label: 'Villas' },
  { href: '/properties?type=plot', label: 'Plots & Land' },
  { href: '/properties?type=farmhouse', label: 'Farmhouses' },
  { href: '/properties?type=commercial', label: 'Commercial' },
  { href: '/properties?type=industrial', label: 'Industrial' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-col">
            <h3 className="footer-brand">
              <Image
                src="/images/logo.png"
                alt={SITE_NAME}
                width={140}
                height={32}
                style={{ height: 38, width: 'auto', filter: 'brightness(0) invert(1)' }}
              />
            </h3>
            <p className="footer-desc">
              A free property listing platform for Dehradun.
              List your property or find flats, houses, villas, and plots
              across all major localities — no brokerage.
            </p>
          </div>

          {/* Localities */}
          <div className="footer-col">
            <h4 className="footer-heading">Popular Localities</h4>
            <ul className="footer-links">
              {FOOTER_LOCALITIES.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Property Types */}
          <div className="footer-col">
            <h4 className="footer-heading">Property Types</h4>
            <ul className="footer-links">
              {PROPERTY_TYPES.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link href="/properties">All Properties</Link></li>
              <li><Link href="/list-property">List Property</Link></li>
              <li><Link href="/about">About Us</Link></li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="footer-disclaimer">
          <div className="footer-disclaimer-inner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>
              <strong>Legal Disclaimer:</strong> {SITE_NAME} is a free property listing platform and is <strong>not liable</strong> for the accuracy, authenticity, or legality of any listing posted by users. All listings are the sole responsibility of the respective property owners / advertisers. {SITE_NAME} does not verify, endorse, or guarantee any property information. If you come across any listing that violates our guidelines or applicable laws, please report it at{' '}
              <a href="mailto:iamgoel@gmail.com" style={{ color: '#f0c040', textDecoration: 'underline' }}>iamgoel@gmail.com</a>.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} {SITE_NAME}. All rights reserved.</p>
          <p>Real estate properties in Dehradun, Uttarakhand, India.</p>
        </div>
      </div>
    </footer>
  );
}
