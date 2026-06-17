import { Link, useParams } from "react-router-dom";
import ItemGrid from "../../components/listings/ItemGrid.jsx";
import SectionHeader from "../../components/common/SectionHeader.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { categories } from "../../data/items.js";
import { getItemsByCategory } from "../../services/itemService.js";

export default function CategoryPage() {
  const { categoryId } = useParams();
  const { t } = useLanguage();

  const category = categories.find((item) => item.id === categoryId);

  if (!category) {
    return (
      <main className="container py-5">
        <div className="alert alert-danger p-5 text-center">
          <h4 className="mb-3">{t("categoryNotFound")}</h4>

          <p className="mb-4">{t("categoryNotFoundMessage")}</p>

          <Link to="/items" className="btn btn-primary">
            <i className="bi bi-arrow-left me-2" />
            {t("browseAllItems")}
          </Link>
        </div>
      </main>
    );
  }

  const items = getItemsByCategory(categoryId);

  return (
    <main className="container py-5">
      <SectionHeader
        eyebrow={t("category")}
        title={category?.id ? t(category.id) : t("category")}
        description={category?.description || t("browseAvailableRentalItems")}
      />

      <div className="mb-4">
        <Link to="/items" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left" /> {t("allItems")}
        </Link>
      </div>

      <ItemGrid items={items || []} />
    </main>
  );
}
