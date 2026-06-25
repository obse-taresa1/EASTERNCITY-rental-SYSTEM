import ExploreItemsSection from "../../components/listings/ExploreItemsSection.jsx";
import HomeHeroSlider from "../../components/listings/HomeHeroSlider.jsx";
import HowItWorksSection from "./HowItWorksSection.jsx";
import MarketplaceSections from "../../components/listings/MarketplaceSections.jsx";
import TopRentedItemsSection from "../../components/listings/TopRentedItemsSection.jsx";

export default function HomePage() {
  return (
    <main className="motorx-home">
      <HomeHeroSlider />
      
      <ExploreItemsSection />

      <MarketplaceSections />
      
      <TopRentedItemsSection />
      
      <HowItWorksSection />
    </main>
  );
}
