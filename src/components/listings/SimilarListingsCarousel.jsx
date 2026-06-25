import { useMemo } from 'react';
import { getAllItems } from '../../services/itemService.js';
import ListingCard from '../cards/ListingCard.jsx';

export default function SimilarListingsCarousel({ category, currentItemId }) {
  const similarItems = useMemo(() => {
    return getAllItems()
      .filter((item) => item.id !== currentItemId && (!category || item.category === category))
      .filter((item) => !['draft', 'rejected', 'expired'].includes(String(item.status || '').toLowerCase()))
      .slice(0, 8);
  }, [category, currentItemId]);

  if (similarItems.length === 0) return null;

  return (
    <section className="similar-listings-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold" style={{color: 'var(--motorx-navy)'}}>Similar Rentals You Might Like</h3>
      </div>
      
      <div className="similar-listings-track">
        {similarItems.map(item => (
          <div key={item.id} className="similar-listing-item">
            <ListingCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
