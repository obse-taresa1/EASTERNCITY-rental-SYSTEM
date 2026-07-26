
import HomeHeroSlider from "../../components/listings/HomeHeroSlider.jsx";
import HowItWorksSection from "./HowItWorksSection.jsx";
import MarketplaceSections from "../../components/listings/MarketplaceSections.jsx";
import TopRentedItemsSection from "../../components/listings/TopRentedItemsSection.jsx";
import usePageTitle from "../../hooks/usePageTitle.js";

export default function HomePage() {
  usePageTitle("Home");
  return (
    <main className="motorx-home">
      <HomeHeroSlider />

      <MarketplaceSections />

      <TopRentedItemsSection />

      <HowItWorksSection />
    </main>
  );
}
