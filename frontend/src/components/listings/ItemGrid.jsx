import ListingCard from "../cards/ListingCard.jsx";
import EmptyState from "../common/EmptyState.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function ItemGrid({ items }) {
  const { t } = useLanguage();

  if (!items.length) {
    return (
      <EmptyState
        icon="bi-search"
        title={t("noItemsFound")}
        description={t("tryAnotherCategory")}
      />
    );
  }

  return (
    <div className="row g-4">
      {items.map((item) => (
        <div className="col-md-6 col-lg-4" key={item.id}>
          <ListingCard item={item} />
        </div>
      ))}
    </div>
  );
}
