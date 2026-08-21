import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import './ListingImageGallery.css';

/**
 * Extracts a URL string from a gallery image entry.
 * Handles: { imageUrl: "..." }, plain strings, and null/undefined.
 */
function getUrl(imgEntry) {
  if (!imgEntry) return '';
  if (typeof imgEntry === 'string') return imgEntry;
  return imgEntry.imageUrl || '';
}

export default function ListingImageGallery({ images = [], fallbackImage }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const containerRef = useRef(null);

  // Build list of valid images (with real URLs), falling back to placeholder only
  // when there are genuinely zero images.
  const galleryImages = useMemo(() => {
    const valid = Array.isArray(images)
      ? images.filter((img) => getUrl(img).trim())
      : [];
    return valid.length
      ? valid
      : fallbackImage
        ? [{ imageUrl: fallbackImage }]
        : [];
  }, [images, fallbackImage]);

  const currentUrl = getUrl(galleryImages[currentIndex]) || fallbackImage || '';

  // Reset error flag whenever the displayed image changes
  useEffect(() => {
    setHasError(false);
  }, [currentIndex]);

  // Preload adjacent images to minimise perceived latency
  useEffect(() => {
    const toPreload = [];
    if (currentIndex > 0) toPreload.push(currentIndex - 1);
    if (currentIndex < galleryImages.length - 1) toPreload.push(currentIndex + 1);
    toPreload.forEach((i) => {
      const url = getUrl(galleryImages[i]);
      if (!url) return;
      const img = new Image();
      img.src = url;
      img.decoding = 'async';
    });
  }, [currentIndex, galleryImages]);

  // Preload first two images on mount
  useEffect(() => {
    galleryImages.slice(0, 2).forEach((entry) => {
      const url = getUrl(entry);
      if (!url) return;
      const img = new Image();
      img.src = url;
      img.decoding = 'async';
    });
  }, [galleryImages]);

  const handlePrevious = useCallback((e) => {
    e?.preventDefault();
    setCurrentIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  }, [galleryImages.length]);

  const handleNext = useCallback((e) => {
    e?.preventDefault();
    setCurrentIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  }, [galleryImages.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape' && isZoomed) setIsZoomed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrevious, isZoomed]);

  // Mobile swipe
  const touchStartX = useRef(null);

  const onTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (delta > 50) handleNext();
    if (delta < -50) handlePrevious();
    touchStartX.current = null;
  };

  const toggleZoom = () => setIsZoomed((z) => !z);

  // Empty state
  if (galleryImages.length === 0) {
    return (
      <div className="listing-image-gallery single-image">
        <div className="gallery-main-image-container">
          <div className="gallery-error-state">
            <i className="bi bi-image" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
            <span style={{ opacity: 0.5, marginTop: '0.5rem', fontSize: '0.9rem' }}>No image available</span>
          </div>
        </div>
      </div>
    );
  }

  const mainSrc = hasError ? (fallbackImage || '') : currentUrl;
  const showNav = galleryImages.length > 1;

  return (
    <div className="listing-image-gallery">
      {/* ── Main image ── */}
      <div
        className="gallery-main-image-container"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        ref={containerRef}
      >
        {mainSrc ? (
          <img
            key={currentUrl} /* remount img on URL change for crisp transition */
            src={mainSrc}
            alt={`Listing image ${currentIndex + 1}`}
            className="gallery-main-image"
            decoding="async"
            fetchPriority="high"
            onError={() => setHasError(true)}
            onClick={toggleZoom}
            style={{ cursor: galleryImages.length > 0 ? 'zoom-in' : 'default' }}
          />
        ) : (
          <div className="gallery-error-state">
            <i className="bi bi-image" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
          </div>
        )}

        {showNav && (
          <>
            <div className="gallery-counter">
              {currentIndex + 1} / {galleryImages.length}
            </div>
            <button
              className="gallery-nav-button gallery-prev-button"
              onClick={handlePrevious}
              aria-label="Previous image"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <button
              className="gallery-nav-button gallery-next-button"
              onClick={handleNext}
              aria-label="Next image"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </>
        )}
      </div>

      {/* ── Thumbnails ── */}
      {showNav && (
        <div className="gallery-thumbnail-strip" role="list">
          {galleryImages.map((img, index) => {
            const thumbUrl = getUrl(img);
            return (
              <button
                key={index}
                role="listitem"
                className={`gallery-thumbnail${index === currentIndex ? ' active' : ''}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`View image ${index + 1}`}
                aria-pressed={index === currentIndex}
              >
                {thumbUrl ? (
                  <img
                    src={thumbUrl}
                    alt={`Thumbnail ${index + 1}`}
                    onError={(e) => {
                      // Only replace if not already the fallback, to prevent loops
                      if (fallbackImage && e.target.src !== fallbackImage) {
                        e.target.src = fallbackImage;
                      }
                    }}
                  />
                ) : (
                  <div className="gallery-thumb-placeholder" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Zoom modal ── */}
      {isZoomed && mainSrc && (
        <div
          className="gallery-zoom-modal"
          onClick={toggleZoom}
          role="dialog"
          aria-label="Zoomed image"
        >
          <button className="gallery-close-zoom" aria-label="Close zoom">
            <i className="bi bi-x-lg"></i>
          </button>
          <img src={mainSrc} alt="Zoomed view" className="gallery-zoomed-image" />
        </div>
      )}
    </div>
  );
}
