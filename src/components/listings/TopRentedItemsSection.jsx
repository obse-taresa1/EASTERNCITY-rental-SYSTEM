import ListingCard from '../cards/ListingCard.jsx';

import { homeListings } from '../../data/homeListings.js';

export default function TopRentedItemsSection() {
  // Get top 4 items
  const topItems = homeListings.slice(0, 4);

  return (
    <section className="top-rented-items py-5 bg-light">
      <div className="container">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <span className="section-label" style={{ color: 'var(--motorx-red)', fontWeight: 800, letterSpacing: '2px', fontSize: '0.85rem' }}>TRENDING</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--motorx-navy)' }}>Top Rented Items</h2>
          </div>
          <a href="/items" className="text-decoration-none fw-bold" style={{ color: '#2b6cb0' }}>View All <i className="bi bi-arrow-right"></i></a>
        </div>

        <div className="row g-4">
          {topItems.map((item) => (
            <div className="col-sm-6 col-lg-3" key={item.id}>
              <ListingCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
