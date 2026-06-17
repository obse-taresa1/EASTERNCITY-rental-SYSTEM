import { Link, useParams } from "react-router-dom";
import ItemGrid from "../../components/listings/ItemGrid.jsx";
import SectionHeader from "../../components/common/SectionHeader.jsx";
import { categories } from "../../data/items.js";
import { getItemsByCategory } from "../../services/itemService.js";

export default function CategoryPage() {
  const { categoryId } = useParams();

  const category = categories.find((item) => item.id === categoryId);

  if (!category) {
    return (
      <main className="container py-5">
        <div className="alert alert-danger p-5 text-center">
          <h4 className="mb-3">Category Not Found</h4>

          <p className="mb-4">
            The category "{categoryId}" you're looking for doesn't exist.
          </p>

          <Link to="/items" className="btn btn-primary">
            <i className="bi bi-arrow-left me-2" />
            Browse All Items
          </Link>
        </div>
      </main>
    );
  }

  const items = getItemsByCategory(categoryId);

  return (
    <main className="container py-5">
      <SectionHeader
        eyebrow="Category"
        // Error 1: Fixed missing || operator
        title={category?.name || "Category"}
        // Error 2: Fixed missing || operator
        description={category?.description || "Browse available rental items."}
      />

      <div className="mb-4">
        <Link to="/items" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left" /> All Items
        </Link>
      </div>

      <ItemGrid items={items || []} />
    </main>
  );
}