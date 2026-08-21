import { useState, useEffect, useCallback, useRef } from 'react';
import './ListingImageGallery.css';

export default function ListingImageGallery({ images = [], fallbackImage }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const containerRef = useRef(null);

  const galleryImages = Array.isArray(images) && images.length 
    ? images 
    : [{ imageUrl: fallbackImage || '/placeholder-image.png' }];

  const currentImage = galleryImages[currentIndex]?.imageUrl || galleryImages[currentIndex];

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [currentIndex]);

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
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) handleNext();
    if (distance < -minSwipeDistance) handlePrevious();
  };

  const toggleZoom = () => setIsZoomed(!isZoomed);

  // If there's only one image, don't show the gallery interface
  if (galleryImages.length <= 1) {
    return (
      <div className="listing-image-gallery single-image">
        <div className="gallery-main-image-container">
          {isLoading && !hasError && <div className="gallery-skeleton-loader"></div>}
          <img 
            src={currentImage} 
            alt="Listing main image" 
            className={`gallery-main-image ${isLoading ? 'loading' : 'loaded'}`}
            onLoad={() => setIsLoading(false)}
            onError={() => { setIsLoading(false); setHasError(true); }}
            style={{ display: hasError ? 'none' : 'block', cursor: 'zoom-in' }}
            onClick={toggleZoom}
          />
          {hasError && (
            <div className="gallery-error-state">
              <i className="bi bi-image text-muted fs-1"></i>
              <p>Image not available</p>
            </div>
          )}
        </div>
        {isZoomed && !hasError && (
          <div className="gallery-zoom-modal" onClick={toggleZoom}>
            <button className="gallery-close-zoom"><i className="bi bi-x-lg"></i></button>
            <img src={currentImage} alt="Zoomed view" className="gallery-zoomed-image" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="listing-image-gallery multi-image">
      <div 
        className="gallery-main-image-container"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        ref={containerRef}
      >
        {isLoading && !hasError && <div className="gallery-skeleton-loader"></div>}
        
        <img 
          key={currentImage} // Force remount on change for animation
          src={currentImage} 
          alt={`Image ${currentIndex + 1} of ${galleryImages.length}`} 
          className={`gallery-main-image fade-in ${isLoading ? 'loading' : 'loaded'}`}
          onLoad={() => setIsLoading(false)}
          onError={() => { setIsLoading(false); setHasError(true); }}
          style={{ display: hasError ? 'none' : 'block', cursor: 'zoom-in' }}
          onClick={toggleZoom}
        />

        {hasError && (
          <div className="gallery-error-state">
            <i className="bi bi-image text-muted fs-1"></i>
            <p>Image not available</p>
          </div>
        )}

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
      </div>

      <div className="gallery-thumbnail-strip">
        {galleryImages.map((img, index) => (
          <button
            key={index}
            className={`gallery-thumbnail ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`View image ${index + 1}`}
          >
            <img 
              src={img.imageUrl || img} 
              alt={`Thumbnail ${index + 1}`}
              onError={(e) => { e.target.src = '/placeholder-image.png'; }}
            />
          </button>
        ))}
      </div>

      {isZoomed && !hasError && (
        <div className="gallery-zoom-modal" onClick={toggleZoom}>
          <button className="gallery-close-zoom"><i className="bi bi-x-lg"></i></button>
          <img src={currentImage} alt="Zoomed view" className="gallery-zoomed-image" />
        </div>
      )}
    </div>
  );
}
