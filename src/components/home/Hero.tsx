import SearchBar from '@/components/ui/SearchBar';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true" />
      <div className="container hero-content">
        <div className="hero-split">
          {/* Left — Buyers */}
          <div className="hero-left">
            <h1 className="hero-title">
              Find Your Dream Property<br />
              <span className="hero-highlight">in Dehradun</span>
            </h1>
            <p className="hero-subtitle">
              Browse verified flats, houses, villas, and plots across Dehradun&apos;s best localities.
              Direct from owners and trusted builders.
            </p>
            <SearchBar variant="hero" />
            <div className="hero-stats">
              <div className="hero-stat">
                <strong>200+</strong>
                <span>Properties</span>
              </div>
              <div className="hero-stat">
                <strong>15+</strong>
                <span>Localities</span>
              </div>
              <div className="hero-stat">
                <strong>500+</strong>
                <span>Happy Clients</span>
              </div>
            </div>
          </div>

          {/* Right — Sellers */}
          <div className="hero-right">
            <div className="hero-sell-card">
              <div className="hero-sell-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <line x1="12" y1="9" x2="12" y2="15" />
                  <line x1="9" y1="12" x2="15" y2="12" />
                </svg>
              </div>
              <h2 className="hero-sell-title">
                Have a Property<br />to Sell?
              </h2>
              <p className="hero-sell-desc">
                List your property for <strong>FREE</strong> and reach thousands of genuine buyers. No brokerage, no hidden charges.
              </p>
              <ul className="hero-sell-perks">
                <li>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  Free listing, forever
                </li>
                <li>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  Direct buyer enquiries
                </li>
                <li>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  WhatsApp & call leads
                </li>
                <li>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  Upload photos, videos & brochures
                </li>
              </ul>
              <Link href="/list-property" className="hero-sell-btn">
                List Your Property — Free
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
