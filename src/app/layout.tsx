import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

import { OrganizationJsonLd, LocalBusinessJsonLd } from '@/components/seo/JsonLd';
import { SITE_NAME, SITE_URL } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Flats, Houses, Villas & Plots in Dehradun`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Find your dream property in Dehradun. Browse verified flats, houses, villas, and plots across Rajpur Road, Sahastradhara Road, GMS Road & more. Direct from owners.',
  keywords: [
    'property in dehradun', 'flats in dehradun', 'houses in dehradun',
    'villas in dehradun', 'plots in dehradun', 'dehradun real estate',
    'buy property dehradun', 'dehradun property rates',
  ],
  manifest: '/manifest.json',
  themeColor: '#1a5632',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: SITE_NAME,
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-512x512.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Find Your Dream Property in Dehradun`,
    description: 'Browse verified flats, houses, villas, and plots across Dehradun.',
    images: [{ url: '/images/logo.png', width: 1024, height: 1024, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Find Your Dream Property in Dehradun`,
    description: 'Browse verified flats, houses, villas, and plots across Dehradun.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <OrganizationJsonLd />
        <LocalBusinessJsonLd />
        <Header />
        <main>{children}</main>
        <Footer />

      </body>
    </html>
  );
}
