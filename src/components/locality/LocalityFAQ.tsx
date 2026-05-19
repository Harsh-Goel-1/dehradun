'use client';

import { useState } from 'react';
import { FAQ } from '@/types';

export default function LocalityFAQ({ items }: { items: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="faq-section">
      <h2>Frequently Asked Questions</h2>
      {items.map((item, i) => (
        <div key={i} className="faq-item">
          <button
            className="faq-question"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            aria-expanded={openIndex === i}
          >
            {item.question}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ transform: openIndex === i ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {openIndex === i && <div className="faq-answer">{item.answer}</div>}
        </div>
      ))}
    </div>
  );
}
