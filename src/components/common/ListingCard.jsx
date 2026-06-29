export default function ListingCard({ listing }) {
  return (
    <div
      className="card h-100"
      style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #dee2e6)" }}
    >
      <div className="card-body d-flex flex-column">
        <h5 className="card-title fw-bold">{listing?.title || "Listing"}</h5>
        <p className="card-text text-muted flex-grow-1">
          {listing?.description || "No description available."}
        </p>
        {listing?.startDate && (
          <small className="text-muted">
            {listing.startDate} — {listing.endDate || "ongoing"}
          </small>
        )}
      </div>
    </div>
  );
}
