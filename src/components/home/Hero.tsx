import SearchBar from '@/components/ui/SearchBar';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true" />
      <div className="container hero-content">
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

        <Link href="/list-property" className="hero-list-cta">
          <div className="hero-list-cta-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <line x1="12" y1="9" x2="12" y2="15" />
              <line x1="9" y1="12" x2="15" y2="12" />
            </svg>
          </div>
          <div>
            <span className="hero-list-cta-title">Have a property to sell?</span>
            <span className="hero-list-cta-sub">List it for free — reach thousands of buyers in Dehradun</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="hero-list-cta-arrow">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
