
import HomeHeroSlider from "../../components/listings/HomeHeroSlider.jsx";
import AdvertisementCarousel from "../../components/listings/AdvertisementCarousel.jsx";
import HowItWorksSection from "./HowItWorksSection.jsx";
import MarketplaceSections from "../../components/listings/MarketplaceSections.jsx";
import ExploreItemsSection from "../../components/listings/ExploreItemsSection.jsx";
import usePageTitle from "../../hooks/usePageTitle.js";

export default function HomePage() {
  usePageTitle("Home");
  return (
    <main className="motorx-home">
      <HomeHeroSlider />

      <AdvertisementCarousel />

      <MarketplaceSections />

      <ExploreItemsSection />

      <HowItWorksSection />
    </main>
  );
}
