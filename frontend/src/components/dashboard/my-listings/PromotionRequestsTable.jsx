const PACKAGE_META = {
  "Homepage Promotion": { icon: "bi-star-fill", color: "#e31e24", bg: "#fff0f0" },
  "Hero Section Promotion": { icon: "bi-star-fill", color: "#e31e24", bg: "#fff0f0" },
  "HERO_PROMOTION": { icon: "bi-star-fill", color: "#e31e24", bg: "#fff0f0" },
  "Featured Listing": { icon: "bi-lightning-charge-fill", color: "#f59e0b", bg: "#fffbeb" },
  "FEATURED": { icon: "bi-lightning-charge-fill", color: "#f59e0b", bg: "#fffbeb" },
  "Homepage Banner": { icon: "bi-gem", color: "#6366f1", bg: "#f0f0ff" },
  "HOME_BANNER": { icon: "bi-gem", color: "#6366f1", bg: "#f0f0ff" },
};

const STATUS_STYLE = {
  Pending:  { color: "#92400e", bg: "#fef3c7", icon: "bi-clock-history" },
  Approved: { color: "#065f46", bg: "#d1fae5", icon: "bi-check-circle-fill" },
  Rejected: { color: "#991b1b", bg: "#fee2e2", icon: "bi-x-circle-fill" },
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function PromotionRequestsTable({ promotions }) {
  if (!promotions || promotions.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-megaphone" style={{ fontSize: "3rem", color: "#e31e24", opacity: 0.3 }} />
        <p className="mt-3 fw-semibold" style={{ color: "var(--text-muted, #6c757d)" }}>No Promotion Requests</p>
        <p className="small" style={{ color: "var(--text-muted, #6c757d)" }}>Submitted listing promotion requests will appear here.</p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {promotions.map((promo) => {
        const listing = promo.listing || {};
        const image =
          listing.image ||
          listing.coverImage ||
          (listing.images && listing.images[0]?.imageUrl) ||
          "";
        const title = listing.title || promo.listingTitle || "Listing";
        const type = promo.promotionType || promo.packageType || "Promotion";
        const pkg = PACKAGE_META[type] || PACKAGE_META["Featured Listing"];
        const status = promo.status || "Pending";
        const st = STATUS_STYLE[status] || STATUS_STYLE["Pending"];
        const discount = promo.discount ? Number(promo.discount) : 0;

        return (
          <div
            key={promo.id}
            className="d-flex align-items-center gap-3 p-3 rounded-4"
            style={{
              background: "var(--bg-card, #fff)",
              border: "1px solid var(--border-color, #f0f0f0)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            {/* Listing thumbnail */}
            <div
              className="rounded-3 flex-shrink-0 overflow-hidden"
              style={{ width: 64, height: 64, background: "#f3f4f6" }}
            >
              {image ? (
                <img
                  src={image}
                  alt={title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100">
                  <i className="bi bi-image text-muted" style={{ fontSize: "1.5rem" }} />
                </div>
              )}
            </div>

            {/* Main info */}
            <div className="flex-grow-1 min-w-0">
              <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                <span className="fw-bold text-truncate" style={{ color: "var(--text-main, #1a1a2e)", maxWidth: 220 }}>
                  {title}
                </span>
                {discount > 0 && (
                  <span
                    className="badge rounded-pill px-2"
                    style={{ fontSize: "0.7rem", background: "#fee2e2", color: "#991b1b" }}
                  >
                    {discount}% OFF
                  </span>
                )}
              </div>

              {/* Package type pill */}
              <span
                className="d-inline-flex align-items-center gap-1 rounded-pill px-2 py-1 me-2"
                style={{ fontSize: "0.75rem", background: pkg.bg, color: pkg.color, fontWeight: 600 }}
              >
                <i className={`bi ${pkg.icon}`} />
                {type}
              </span>

              <span className="small" style={{ color: "var(--text-muted, #6c757d)" }}>
                <i className="bi bi-calendar3 me-1" />
                {formatDate(promo.requestDate)}
              </span>
            </div>

            {/* Status badge */}
            <div className="flex-shrink-0 text-end">
              <span
                className="d-inline-flex align-items-center gap-1 rounded-pill px-3 py-1"
                style={{ fontSize: "0.78rem", fontWeight: 700, background: st.bg, color: st.color }}
              >
                <i className={`bi ${st.icon}`} />
                {status}
              </span>
              {promo.amount > 0 && (
                <div className="small mt-1" style={{ color: "var(--text-muted, #6c757d)" }}>
                  {promo.amount} ETB
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
