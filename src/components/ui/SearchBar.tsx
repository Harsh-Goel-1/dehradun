'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getAllLocalityNames } from '@/lib/data/localities';

const PROPERTY_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'flat', label: 'Flat / Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'plot', label: 'Plot / Land' },
  { value: 'farmhouse', label: 'Farmhouse' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'pg', label: 'PG / Co-living' },
  { value: 'other', label: 'Other' },
];

const BUDGET_RANGES = [
  { value: '', label: 'Any Budget' },
  { value: '0-2500000', label: 'Under ₹25 Lac' },
  { value: '2500000-5000000', label: '₹25 Lac – ₹50 Lac' },
  { value: '5000000-10000000', label: '₹50 Lac – ₹1 Cr' },
  { value: '10000000-30000000', label: '₹1 Cr – ₹3 Cr' },
  { value: '30000000-0', label: 'Above ₹3 Cr' },
];

export default function SearchBar({ variant = 'hero' }: { variant?: 'hero' | 'compact' }) {
  const router = useRouter();
  const [listingType, setListingType] = useState<'sale' | 'rent'>('sale');
  const [locality, setLocality] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [budget, setBudget] = useState('');

  const localities = getAllLocalityNames();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (locality) params.set('locality', locality);
    if (propertyType) params.set('type', propertyType);
    params.set('listing', listingType);
    if (budget) {
      const [min, max] = budget.split('-');
      if (min && min !== '0') params.set('min', min);
      if (max && max !== '0') params.set('max', max);
    }
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`search-bar search-bar--${variant}`}
      role="search"
      aria-label="Search properties"
    >
      {/* Buy / Rent toggle */}
      <div style={{ display: 'flex', gap: 0, marginBottom: variant === 'hero' ? '.75rem' : '.5rem' }}>
        <button type="button" onClick={() => setListingType('sale')}
          style={{
            flex: 1, padding: '.5rem 1rem', border: '1.5px solid var(--color-primary)',
            borderRadius: '6px 0 0 6px', fontWeight: 700, fontSize: '.85rem', cursor: 'pointer',
            background: listingType === 'sale' ? 'var(--color-primary)' : '#fff',
            color: listingType === 'sale' ? '#fff' : 'var(--color-primary)',
            transition: 'all .2s',
          }}>
          Buy
        </button>
        <button type="button" onClick={() => setListingType('rent')}
          style={{
            flex: 1, padding: '.5rem 1rem', border: '1.5px solid var(--color-primary)',
            borderLeft: 'none',
            borderRadius: '0 6px 6px 0', fontWeight: 700, fontSize: '.85rem', cursor: 'pointer',
            background: listingType === 'rent' ? 'var(--color-primary)' : '#fff',
            color: listingType === 'rent' ? '#fff' : 'var(--color-primary)',
            transition: 'all .2s',
          }}>
          Rent
        </button>
      </div>
      <div className="search-bar-fields">
        <div className="search-field">
          <label htmlFor="search-locality" className="search-label">Location</label>
          <select
            id="search-locality"
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
            className="search-select"
          >
            <option value="">All Localities</option>
            {localities.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div className="search-field">
          <label htmlFor="search-type" className="search-label">Property Type</label>
          <select
            id="search-type"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="search-select"
          >
            {PROPERTY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div className="search-field">
          <label htmlFor="search-budget" className="search-label">Budget</label>
          <select
            id="search-budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="search-select"
          >
            {BUDGET_RANGES.map((range) => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
        </div>
      </div>

      <button type="submit" className="btn btn--primary search-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        Search
      </button>
    </form>
  );
}
