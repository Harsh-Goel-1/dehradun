import type { Metadata } from 'next';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'DehradunGhar is a free property listing platform connecting buyers and sellers directly in Dehradun, Uttarakhand.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <Breadcrumbs items={[{ label: 'About Us' }]} />
          <h1>About DehradunGhar</h1>
          <p>A free platform for property listings in Dehradun</p>
        </div>
      </div>

      <section className="content-page">
        <div className="container">
          <div className="seo-content">
            <h2>What We Do</h2>
            <p>
              DehradunGhar is a free property listing platform focused exclusively on Dehradun
              and its surrounding areas. We connect property owners directly with interested buyers —
              no middlemen, no brokerage, no hidden charges.
            </p>
            <p>
              Anyone can list their property for free. Buyers can browse listings and contact
              owners directly via WhatsApp or email. It&apos;s that simple.
            </p>

            <h3>How It Works</h3>
            <ul>
              <li><strong>For Sellers:</strong> Sign up, fill in your property details, and your listing goes live instantly. Buyers contact you directly.</li>
              <li><strong>For Buyers:</strong> Browse properties by locality, type, and budget. Contact owners directly via WhatsApp or email — no intermediaries.</li>
            </ul>

            <h3>Our Coverage</h3>
            <p>
              We cover all major localities in Dehradun including Rajpur Road, Sahastradhara Road,
              GMS Road, Clement Town, Premnagar, Doiwala, Mussoorie Road, Vasant Vihar, Raipur, and more.
              Whether you are looking for a budget-friendly 1 BHK or a luxury villa, you&apos;ll find
              listings across every price range.
            </p>

            <h3>Why Dehradun?</h3>
            <p>
              Dehradun is rapidly emerging as one of North India&apos;s most livable cities. With its pleasant
              year-round climate, excellent educational institutions, growing IT sector, and upcoming
              Delhi-Dehradun Expressway, the city offers an unbeatable combination for homebuyers
              and investors alike.
            </p>

            <h3>Why Use DehradunGhar?</h3>
            <ul>
              <li>Free to list — no charges, ever</li>
              <li>Direct buyer-seller contact — no brokerage</li>
              <li>Simple, fast listing process</li>
              <li>Manage your listings from your dashboard</li>
              <li>Contact owners instantly via WhatsApp</li>
            </ul>

            <div style={{ marginTop: '2rem' }}>
              <Link href="/list-property" className="btn btn--primary btn--lg">
                List Your Property — Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
