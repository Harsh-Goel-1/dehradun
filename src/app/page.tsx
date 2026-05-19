import Hero from '@/components/home/Hero';
import SEOContent from '@/components/home/SEOContent';
import { getRecentProperties } from '@/lib/data/properties';
import PropertyGrid from '@/components/property/PropertyGrid';
import Link from 'next/link';

export default async function HomePage() {
  let recent: Awaited<ReturnType<typeof getRecentProperties>> = [];

  try {
    recent = await getRecentProperties(6);
  } catch {
    // Supabase not configured yet — render without data
  }

  return (
    <>
      <Hero />

      {/* Builder Projects */}
      <section className="section section--alt" id="builder-projects">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Builder Projects</h2>
            <p className="section-subtitle">
              Premium projects from top builders &amp; developers in Dehradun
            </p>
          </div>
          <div className="coming-soon-card">
            <div className="coming-soon-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="6" width="22" height="16" rx="2" />
                <path d="M1 10h22" />
                <path d="M8 6V2" />
                <path d="M16 6V2" />
              </svg>
            </div>
            <h3>Coming Soon</h3>
            <p>Verified builder projects with floor plans, pricing &amp; virtual tours will be listed here shortly.</p>
          </div>
        </div>
      </section>

      {/* DehradunGhar Official Listings */}
      <section className="section" id="official-listings">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">DehradunGhar Official Listings</h2>
            <p className="section-subtitle">
              Curated &amp; verified properties handpicked by the DehradunGhar team
            </p>
          </div>
          <div className="coming-soon-card">
            <div className="coming-soon-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h3>Coming Soon</h3>
            <p>Exclusive, personally verified listings by the DehradunGhar team — guaranteed quality &amp; authenticity.</p>
          </div>
        </div>
      </section>

      {/* Recent Free Listings */}
      {recent.length > 0 && (
        <section className="section section--alt" id="recent-listings">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Recent Free Listings</h2>
              <p className="section-subtitle">Newly added properties by owners in Dehradun</p>
            </div>
            <PropertyGrid properties={recent} />
            <div className="section-cta">
              <Link href="/properties" className="btn btn--outline btn--lg">
                Browse All Properties →
              </Link>
            </div>
          </div>
        </section>
      )}
      <SEOContent />
    </>
  );
}
