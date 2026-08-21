import { useEffect, useRef, useState } from "react";
import { fetchActiveBannerAds, trackBannerAdClick, trackBannerAdView } from "../../services/bannerAdsApiService.js";
import { useRefreshToken } from "../../context/RefreshContext.jsx";

const ROTATION_MS = 6500;

export default function AdvertisementCarousel() {
  const [ads, setAds] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef(null);
  const refreshToken = useRefreshToken("banner-ads");
  const activeAd = ads[activeIndex];
  const hasMultiple = ads.length > 1;

  // Fetch active banner ads
  useEffect(() => {
    let mounted = true;
    fetchActiveBannerAds()
      .then(data => {
        if (!mounted) return;
        setAds(data || []);
        setActiveIndex(0);
      })
      .catch(() => mounted && setAds([]));
    return () => { mounted = false; };
  }, [refreshToken]);

  // Track view of the currently active ad
  useEffect(() => {
    if (activeAd?.id) trackBannerAdView(activeAd.id).catch(() => null);
  }, [activeAd?.id]);

  // Auto‑rotate when more than one ad and not paused
  useEffect(() => {
    if (!hasMultiple || paused) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex(i => (i + 1) % ads.length);
    }, ROTATION_MS);
    return () => window.clearInterval(timer);
  }, [ads.length, hasMultiple, paused]);

  // Keyboard navigation
  useEffect(() => {
    if (!hasMultiple) return;
    const onKeyDown = e => {
      if (e.key === "ArrowLeft") setActiveIndex(i => (i - 1 + ads.length) % ads.length);
      if (e.key === "ArrowRight") setActiveIndex(i => (i + 1) % ads.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [ads.length, hasMultiple]);

  const goTo = index => setActiveIndex((index + ads.length) % ads.length);

  // Prevent control clicks from triggering the ad link
  const stopPropagation = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (!ads.length) return null;

  return (
    <section className="external-advertisements" aria-label="Sponsored advertisements">
      <div
        className="container"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={e => { touchStart.current = e.touches[0]?.clientX ?? null; }}
        onTouchEnd={e => {
          const start = touchStart.current;
          const end = e.changedTouches[0]?.clientX;
          if (hasMultiple && start !== null && Math.abs(start - end) > 45) {
            goTo(start > end ? activeIndex + 1 : activeIndex - 1);
          }
          touchStart.current = null;
        }}
      >
        <div className="external-ad-carousel-viewport">
          <div
            className="external-ad-carousel-track"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {ads.map((ad, index) => {
              const safeUrl = (() => {
                let url = ad.ctaUrl || "#";
                if (url !== "#" && !/^(https?:\/\/)/i.test(url) && !url.startsWith("/")) {
                  url = "#";
                }
                return url;
              })();
              const isExternal = /^https?:\/\//i.test(safeUrl);
              const isActive = index === activeIndex;

              return (
                <article
                  className={`external-ad-slide ${isActive ? "is-active" : ""}`}
                  key={ad.id}
                  aria-hidden={!isActive}
                >
                  <a
                    href={safeUrl}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    onClick={e => {
                      if (!isActive) { e.preventDefault(); return; }
                      if (ad.id) trackBannerAdClick(ad.id).catch(() => null);
                    }}
                    className="external-ad-link"
                    aria-label={ad.companyName ? `Visit ${ad.companyName}` : "Visit sponsor"}
                    tabIndex={isActive ? 0 : -1}
                  >
                    {/* Image – full advertisement */}
                    <img
                      className="external-ad-image"
                      src={ad.mobileImageUrl || ad.imageUrl}
                      alt={ad.title || ad.companyName || "Sponsored"}
                      loading={index === 0 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "auto"}
                    />
                    {/* Tiny Sponsored badge – placed outside the image area via CSS */}
                    <span className="external-ad-sponsored">Sponsored</span>
                  </a>
                </article>
              );
            })}
          </div>

          {/* Navigation controls – click propagation stopped */}
          {hasMultiple && (
            <>
              <button
                className="external-ad-arrow external-ad-prev"
                type="button"
                aria-label="Previous advertisement"
                onClick={e => { stopPropagation(e); goTo(activeIndex - 1); }}
              >
                <i className="bi bi-chevron-left" />
              </button>
              <button
                className="external-ad-arrow external-ad-next"
                type="button"
                aria-label="Next advertisement"
                onClick={e => { stopPropagation(e); goTo(activeIndex + 1); }}
              >
                <i className="bi bi-chevron-right" />
              </button>
              <div className="external-ad-dots" aria-label="Advertisement navigation" onClick={stopPropagation}>
                {ads.map((ad, idx) => (
                  <button
                    key={ad.id}
                    type="button"
                    className={idx === activeIndex ? "is-active" : ""}
                    aria-label={`Show advertisement ${idx + 1}`}
                    aria-current={idx === activeIndex}
                    onClick={e => { stopPropagation(e); goTo(idx); }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}