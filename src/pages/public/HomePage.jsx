import ExploreItemsSection from "../../components/listings/ExploreItemsSection.jsx";
import HomeHeroSlider from "../../components/listings/HomeHeroSlider.jsx";

export default function HomePage() {
  return (
    <main className="motorx-home">
      <HomeHeroSlider />
      <ExploreItemsSection />
    </main>
  );
}
