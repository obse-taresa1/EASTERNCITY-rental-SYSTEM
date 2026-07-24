import ListingCard from "../cards/ListingCard.jsx";
import EmptyState from "../common/EmptyState.jsx";

export default function ItemGrid({ items }) {
  if (!items.length) {
    return (
      <EmptyState
        icon="bi-search"
        title="No items found"
        description="Try another category or search keyword."
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