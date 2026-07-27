import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories } from '../../services/categoryApiService';
import usePageTitle from '../../hooks/usePageTitle.js';
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
  usePageTitle('Categories');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalListings = categories.reduce((sum, cat) => sum + (cat.listingsCount || 0), 0);

  return (
    <div className="premium-categories-page">
      {/* Hero Section */}
      <section className="categories-hero">
        <div className="hero-content text-center">
          <div className="breadcrumb-pill">Home → Categories</div>
          <h1 className="hero-title">Browse Categories</h1>
          <p className="hero-subtitle">
            Find rental items across Eastern Cities.<br />
            Explore hundreds of verified rental items available in Jigjiga, Harar and Dire Dawa.
          </p>
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
              placeholder="Search Categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="stats-wrapper">
            <div className="stat-item">
              <strong>{categories.length}</strong> Categories
            </div>
            <div className="stat-item">
              <strong>{totalListings}</strong> Listings
            </div>
            <div className="stat-item">
              <strong>3</strong> Cities
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
              <h3>No categories found</h3>
              <p>Be the first user to add an item!</p>
              <Link to="/dashboard/list-item" className="btn btn-accent-custom mt-3">List Item</Link>
            </div>
          ) : (
            filteredCategories.map((cat) => {
              const iconClass = iconMap[cat.slug] || 'bi-box-seam';
              return (
                <Link to={`/categories/${cat.id}`} key={cat.id} className="premium-category-card">
                  <div className="premium-card-icon">
                    <i className={`bi ${iconClass}`} />
                  </div>
                  <h3 className="premium-card-title">{cat.name}</h3>
                  <p className="premium-card-desc">
                    {cat.description || "Explore verified rentals in this category."}
                  </p>
                  <div className="premium-card-footer">
                    <span className="listing-count">{cat.listingsCount || 0} Listings</span>
                    <span className="explore-text">Explore →</span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
        
        {/* Bottom CTA Section */}
        <div className="bottom-cta-section mt-5 text-center">
          <div className="bottom-cta-section-inner">
            <h2>Can't find what you're looking for?</h2>
            <p>List your item today.</p>
            <Link to="/dashboard/list-item" className="btn btn-primary-custom mt-3">List an Item</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
