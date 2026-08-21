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

  useEffect(() => {
    let mounted = true;
    fetchActiveBannerAds().then((data) => {
      if (!mounted) return;
      setAds(data || []);
      setActiveIndex(0);
    }).catch(() => mounted && setAds([]));
    return () => { mounted = false; };
  }, [refreshToken]);

  useEffect(() => {
    if (activeAd?.id) trackBannerAdView(activeAd.id).catch(() => null);
  }, [activeAd?.id]);

  useEffect(() => {
    if (!hasMultiple || paused) return undefined;
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % ads.length), ROTATION_MS);
    return () => window.clearInterval(timer);
  }, [ads.length, hasMultiple, paused]);

  useEffect(() => {
    function onKeyDown(event) {
      if (!hasMultiple) return;
      if (event.key === "ArrowLeft") setActiveIndex((index) => (index - 1 + ads.length) % ads.length);
      if (event.key === "ArrowRight") setActiveIndex((index) => (index + 1) % ads.length);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [ads.length, hasMultiple]);

  function goTo(index) { setActiveIndex((index + ads.length) % ads.length); }
  function handleClick() { if (activeAd?.id) trackBannerAdClick(activeAd.id).catch(() => null); }
  if (!ads.length) return null;

  return (
    <section className="external-advertisements" aria-label="Sponsored advertisements">
      <div className="container" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }} onTouchEnd={(event) => { const start = touchStart.current; const end = event.changedTouches[0]?.clientX; if (hasMultiple && start !== null && Math.abs(start - end) > 45) goTo(start > end ? activeIndex + 1 : activeIndex - 1); touchStart.current = null; }}>
        <article className="external-ad-carousel" key={activeAd.id}>
          <img className="external-ad-image" src={activeAd.mobileImageUrl || activeAd.imageUrl} alt={activeAd.title} loading="eager" fetchPriority="high" />
          <div className="external-ad-scrim" />
          <div className="external-ad-copy">
            <span className="external-ad-sponsored">Sponsored</span>
            <div className="external-ad-brand">{activeAd.logoUrl && <img src={activeAd.logoUrl} alt="" />}<span>{activeAd.companyName}</span></div>
            <h2>{activeAd.title}</h2>
            {activeAd.subtitle && <p>{activeAd.subtitle}</p>}
            <a href={activeAd.ctaUrl || "#"} target="_blank" rel="noreferrer" onClick={handleClick} className="btn external-ad-cta">{activeAd.ctaLabel || "Learn more"} <i className="bi bi-arrow-up-right" /></a>
          </div>
          {hasMultiple && <><button className="external-ad-arrow external-ad-prev" type="button" aria-label="Previous advertisement" onClick={() => goTo(activeIndex - 1)}><i className="bi bi-chevron-left" /></button><button className="external-ad-arrow external-ad-next" type="button" aria-label="Next advertisement" onClick={() => goTo(activeIndex + 1)}><i className="bi bi-chevron-right" /></button><div className="external-ad-dots" aria-label="Advertisement navigation">{ads.map((ad, index) => <button key={ad.id} type="button" className={index === activeIndex ? "is-active" : ""} aria-label={`Show advertisement ${index + 1}`} aria-current={index === activeIndex} onClick={() => goTo(index)} />)}</div></>}
        </article>
      </div>
    </section>
  );
}
