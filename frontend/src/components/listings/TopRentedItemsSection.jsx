import { useState, useEffect } from 'react';
import ListingCard from '../cards/ListingCard.jsx';
import { getPublicListings } from '../../services/listingApiService.js';

export default function TopRentedItemsSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPublicListings()
      .then((listings) => {
        if (!cancelled) {
          // Pick one listing per category (for variety on homepage)
          const seen = new Set();
          const unique = [];
          for (const item of listings) {
            const key = item.category || item.categoryName || 'other';
            if (!seen.has(key)) {
              seen.add(key);
              unique.push(item);
            }
          }
          setItems(unique.slice(0, 8));
        }
      })
      .catch((err) => console.error('Failed to load listings:', err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <section className="top-rented-items py-5 bg-light">
        <div className="container text-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </section>
    );
  }

  if (!items.length) return null;

  return (
    <section className="top-rented-items py-5 bg-light">
      <div className="container">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <span
              className="section-label"
              style={{
                color: 'var(--motorx-red)',
                fontWeight: 800,
                letterSpacing: '2px',
                fontSize: '0.85rem',
              }}
            >
              TRENDING
            </span>
            <h2
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                marginTop: '0.5rem',
                color: 'var(--motorx-navy)',
              }}
            >
              Top Rented Items
            </h2>
          </div>
          <a
            href="/items"
            className="text-decoration-none fw-bold"
            style={{ color: '#2b6cb0' }}
          >
            View All <i className="bi bi-arrow-right" />
          </a>
        </div>

        <div className="row g-4">
          {items.map((item) => (
            <div className="col-sm-6 col-md-4 col-lg-3" key={item.id}>
              <ListingCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
