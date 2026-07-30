import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categories as rentalCategories } from '../../data/items.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import usePageTitle from '../../hooks/usePageTitle.js';
import { getPublicListings } from '../../services/listingApiService.js';
import { getCanonicalRentalCategoryId, listingMatchesRentalCategory } from '../../utils/categoryMapping.js';
import '../../styles/categories-premium.css';

const iconMap = {
  'electronics-cameras': 'bi-camera',
  'party-wedding': 'bi-stars',
  'vehicles': 'bi-car-front',
  'cars-bikes': 'bi-bicycle',
  'events': 'bi-calendar-event',
  'furniture': 'bi-lamp',
  'sports-outdoor': 'bi-dribbble',
  'construction-diy': 'bi-hammer',
  'gadgets': 'bi-controller',
  'home-appliances': 'bi-house-gear',
  'fashion-accessories': 'bi-bag',
  'travel-camping': 'bi-backpack',
  'tools': 'bi-wrench',
};

export default function CategoriesPage() {
  const { t } = useLanguage();
  usePageTitle(t('categories'));
  const [listingCounts, setListingCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;

    async function loadListingCounts() {
      try {
        const listings = await getPublicListings();
        if (!active) return;

        const counts = rentalCategories.reduce((current, category) => {
          current[category.id] = listings.filter((listing) =>
            listingMatchesRentalCategory(listing, category.id),
          ).length;
          return current;
        }, {});

        setListingCounts(counts);
      } catch (err) {
        console.error("Failed to load category listing counts", err);
        if (active) setListingCounts({});
      } finally {
        if (active) setLoading(false);
      }
    }

    loadListingCounts();
    return () => {
      active = false;
    };
  }, []);

  const filteredCategories = rentalCategories.filter((cat) =>
    `${t(cat.nameKey) || cat.name} ${t(cat.descriptionKey) || cat.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalListings = Object.values(listingCounts).reduce(
    (sum, count) => sum + Number(count || 0),
    0,
  );

  return (
    <div className="premium-categories-page">
      {/* Hero Section */}
      <section className="categories-hero">
        <div className="hero-content text-center">
          <div className="breadcrumb-pill">{t("home")} &rarr; {t("categories")}</div>
          <h1 className="hero-title">{t("browseCategories")}</h1>
          <p className="hero-subtitle">{t("categoriesHeroSubtitle")}</p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container py-5">
        
        {/* Search & Stats Bar */}
        <div className="search-stats-container mb-5">
          <div className="search-wrapper">
            <i className="bi bi-search search-icon" />
            <input 
              type="text" 
              className="premium-search-input" 
              placeholder={t("searchCategories")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="stats-wrapper">
            <div className="stat-item">
              <strong>{rentalCategories.length}</strong> {t("categories")}
            </div>
            <div className="stat-item">
              <strong>{totalListings}</strong> {t("listings")}
            </div>
            <div className="stat-item">
              <strong>3</strong> {t("cities")}
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="categories-premium-grid">
          {loading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="category-card-skeleton">
                <div className="skeleton-icon"></div>
                <div className="skeleton-title"></div>
                <div className="skeleton-desc"></div>
                <div className="skeleton-footer"></div>
              </div>
            ))
          ) : filteredCategories.length === 0 ? (
            <div className="empty-categories-state">
              <h3>{t("noCategoriesFound")}</h3>
              <p>{t("addFirstItem")}</p>
              <Link to="/dashboard/list-item" className="btn btn-accent-custom mt-3">{t("listItem")}</Link>
            </div>
          ) : (
            filteredCategories.map((cat) => {
              const iconClass = iconMap[cat.id] || cat.icon || 'bi-box-seam';
              const routeParam = getCanonicalRentalCategoryId(cat.id);
              return (
                <Link to={`/categories/${routeParam}`} key={cat.id} className="premium-category-card">
                  <div className="premium-card-icon">
                    <i className={`bi ${iconClass}`} />
                  </div>
                  <h3 className="premium-card-title">{t(cat.nameKey) || cat.name}</h3>
                  <p className="premium-card-desc">
                    {t(cat.descriptionKey) || cat.description || t("exploreVerifiedRentals")}
                  </p>
                  <div className="premium-card-footer">
                    <span className="listing-count">{listingCounts[cat.id] || 0} {t("listings")}</span>
                    <span className="explore-text">{t("explore")} &rarr;</span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
        
        {/* Bottom CTA Section */}
        <div className="bottom-cta-section mt-5 text-center">
          <div className="bottom-cta-section-inner">
            <h2>{t("categoryCtaTitle")}</h2>
            <p>{t("categoryCtaBody")}</p>
            <Link to="/dashboard/list-item" className="btn btn-primary-custom mt-3">{t("listAnItem")}</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
