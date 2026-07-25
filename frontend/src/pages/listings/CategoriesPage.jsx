import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { categories } from '../../data/items.js';
import '../../styles/categories-premium.css';

export default function CategoriesPage() {
  const { t } = useLanguage();
  const categoryOptions = categories;

  return (
    <main className="category-page container py-5">
      {/* Header */}
      <div className="category-page-header">
        <h1 className="title">Browse Categories</h1>
        <p className="description">Find the perfect rental category for your needs.</p>
      </div>

      {/* Category Grid */}
      <div className="category-grid row g-4 mt-4">
        {categoryOptions.map((cat) => (
          <div className="col-sm-6 col-md-4 col-lg-3 d-flex" key={cat.id}>
            <Link to={`/categories/${cat.id}`} className="text-decoration-none d-block w-100">
              <div className="category-premium-card">
                <div className="category-icon-wrapper"><i className={`bi ${cat.icon}`}></i></div>
                <h4>{cat.name}</h4>
                <p>{cat.description}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="category-cta-section">
        <h3>Can't find what you're looking for?</h3>
        <p>Become the first to list it in your city.</p>
        <a href="/items" className="btn-primary">Explore Listings</a>
        <a href="/create-listing" className="btn-primary">Create Listing</a>
      </div>
    </main>
  );
}
