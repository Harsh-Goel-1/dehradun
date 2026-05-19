'use client';

import Image from 'next/image';
import { useState } from 'react';

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="gallery-placeholder">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <p>No images available</p>
      </div>
    );
  }

  return (
    <>
      <div className="gallery">
        <div className="gallery-main">
          <Image
            src={images[activeIndex]}
            alt={`${title} - Image ${activeIndex + 1}`}
            width={800}
            height={500}
            className="gallery-main-image"
            priority
            sizes="(max-width: 768px) 100vw, 60vw"
            onClick={() => setLightboxOpen(true)}
          />
          <span className="gallery-counter">
            {activeIndex + 1} / {images.length}
          </span>
        </div>

        {images.length > 1 && (
          <div className="gallery-thumbs">
            {images.map((img, i) => (
              <button
                key={i}
                className={`gallery-thumb ${i === activeIndex ? 'gallery-thumb--active' : ''}`}
                onClick={() => setActiveIndex(i)}
                aria-label={`View image ${i + 1}`}
              >
                <Image
                  src={img}
                  alt={`${title} thumbnail ${i + 1}`}
                  width={120}
                  height={80}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div className="lightbox" onClick={() => setLightboxOpen(false)}>
          <button
            className="lightbox-close"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close lightbox"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="lightbox-controls">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
              }}
              aria-label="Previous image"
              className="lightbox-nav"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <Image
              src={images[activeIndex]}
              alt={`${title} - Image ${activeIndex + 1}`}
              width={1200}
              height={800}
              className="lightbox-image"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
              }}
              aria-label="Next image"
              className="lightbox-nav"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
