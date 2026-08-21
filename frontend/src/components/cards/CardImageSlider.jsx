import { useState, useEffect, useRef, useCallback } from "react";
import { getCategoryFallbackImage } from "../../utils/categoryFallbacks.js";

const SLIDE_INTERVAL_MS = 3500;

/**
 * Normalise an image entry that can be:
 *  - a plain string URL
 *  - an object with imageUrl, url, or src
 */
function toUrl(img) {
  if (!img) return "";
  if (typeof img === "string") return img;
  return img.imageUrl || img.url || img.src || "";
}

/**
 * CardImageSlider
 * Renders the card image area with an automatic multi-image crossfade slideshow.
 * When only one image is available it renders as a plain static image.
 */
export default function CardImageSlider({
  images = [],
  coverImage = "",
  fallbackKey = "",
  title = "",
  isFeatured = false,
  city = "",
  sefar = "",
  condition = "",   // "new" | "used" | "" (empty = don't show badge)
}) {
  const fallback = getCategoryFallbackImage(fallbackKey) || "";

  // Build a clean, deduplicated list of valid image URLs
  const allUrls = (() => {
    const seen = new Set();
    const out = [];
    const candidates = [coverImage, ...(Array.isArray(images) ? images : [])];
    for (const entry of candidates) {
      const url = toUrl(entry);
      if (url && !seen.has(url)) {
        seen.add(url);
        out.push(url);
      }
    }
    return out.length > 0 ? out : [fallback];
  })();

  const isMultiple = allUrls.length > 1;
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const brokenRef = useRef(new Set());
  const touchStartX = useRef(null);

  const goNext = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setActiveIdx((cur) => (cur + 1) % allUrls.length);
  };

  const goPrev = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setActiveIdx((cur) => (cur - 1 + allUrls.length) % allUrls.length);
  };

  const goTo = (idx, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setActiveIdx((idx + allUrls.length) % allUrls.length);
  };

  // Auto-advance
  useEffect(() => {
    if (!isMultiple || paused) return;
    const timer = window.setInterval(() => {
      setActiveIdx((cur) => (cur + 1) % allUrls.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [isMultiple, paused, allUrls.length]);

  // Touch swipe
  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) delta < 0 ? goNext(null) : goPrev(null);
    touchStartX.current = null;
  }

  return (
    <div
      className="card-img-wrapper card-img-slider-root"
      onMouseEnter={() => isMultiple && setPaused(true)}
      onMouseLeave={() => isMultiple && setPaused(false)}
      onTouchStart={isMultiple ? handleTouchStart : undefined}
      onTouchEnd={isMultiple ? handleTouchEnd : undefined}
    >
      {allUrls.map((url, idx) => (
        <img
          key={url}
          src={url}
          alt={idx === 0 ? title : title + " — image " + (idx + 1)}
          className={"card-img card-img-slide" + (idx === activeIdx ? " is-active" : "")}
          loading={idx === 0 ? "eager" : "lazy"}
          onError={(e) => {
            if (!brokenRef.current.has(url)) {
              brokenRef.current.add(url);
              e.currentTarget.src = fallback;
            }
          }}
        />
      ))}

      {isMultiple && (
        <>
          <button
            type="button"
            className="card-img-nav card-img-nav-prev"
            aria-label="Previous image"
            onClick={goPrev}
          >
            <i className="bi bi-chevron-left" />
          </button>
          <button
            type="button"
            className="card-img-nav card-img-nav-next"
            aria-label="Next image"
            onClick={goNext}
          >
            <i className="bi bi-chevron-right" />
          </button>
        </>
      )}

      <div className="card-badges">
        {condition && (
          <span
            className={`badge-condition badge-condition--${condition}`}
          >
            {condition === "new" ? "NEW" : "USED"}
          </span>
        )}
        {city && (
          <span className="badge-city">
            <i className="bi bi-geo-alt-fill badge-city-icon" />
            <span className="badge-city-text">
              {city}{sefar ? ` • ${sefar}` : ""}
            </span>
          </span>
        )}
        {isFeatured && (
          <span className="badge-featured">
            <span className="badge-featured-star">★</span>
            Featured
          </span>
        )}
      </div>

      {isMultiple && (
        <div className="card-img-dots" aria-label="Image indicators">
          {allUrls.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={"card-img-dot" + (idx === activeIdx ? " is-active" : "")}
              aria-label={"Show image " + (idx + 1)}
              onClick={(e) => goTo(idx, e)}
            />
          ))}
        </div>
      )}

      {isMultiple && (
        <span className="badge-photos">
          <i className="bi bi-images" /> {activeIdx + 1}/{allUrls.length}
        </span>
      )}
    </div>
  );
}
