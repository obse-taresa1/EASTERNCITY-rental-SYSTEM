import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SimilarListingsCarousel from "../../components/listings/SimilarListingsCarousel.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { categories, items as seededItems } from "../../data/items.js";
import { getListingById } from "../../services/listingApiService.js";
import { getReviewsByListing } from "../../services/reviewApiService.js";
import { startListingConversation } from "../../services/messageApiService.js";
import { formatDailyPrice } from "../../utils/currency.js";

const fallbackReviews = [
  {
    id: "review-seed-1",
    userName: "Hassan Ali",
    rating: 5,
    comment:
      "The listing matched the photos, pickup was smooth, and the item worked perfectly.",
    createdAt: "2026-05-18T10:00:00.000Z",
  },
  {
    id: "review-seed-2",
    userName: "Amina Yusuf",
    rating: 4,
    comment:
      "Clear requirements and quick communication. I would rent from EasternCity again.",
    createdAt: "2026-04-28T10:00:00.000Z",
  },
];

function renderStars(rating) {
  return Array.from({ length: 5 }, (_, index) => (
    <i
      className={`bi ${index < rating ? "bi-star-fill" : "bi-star"}`}
      key={index}
    ></i>
  ));
}

export default function ItemDetailsPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, user } = useAuth();
  const activeUser = user || currentUser;
  const [notice, setNotice] = useState(
    location.state?.contactReadyMessage || "",
  );
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadItem() {
      setLoading(true);
      try {
        const data = await getListingById(itemId);
        if (active) setItem(data);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadItem();

    return () => {
      active = false;
    };
  }, [itemId]);

  useEffect(() => {
    let active = true;

    async function loadReviews() {
      try {
        const data = await getReviewsByListing(itemId);
        if (!active) return;
        setReviews(data.length ? data : fallbackReviews);
      } catch {
        if (!active) return;
        setReviews(fallbackReviews);
      }
    }

    loadReviews();

    return () => {
      active = false;
    };
  }, [itemId]);

  if (loading) {
    return (
      <main className="container py-5 text-center">
        <h1 className="h4 text-muted">Loading item...</h1>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="container py-5 text-center">
        <h1 className="h4 text-muted">Item not found</h1>
        <button
          className="btn btn-danger mt-3"
          onClick={() => navigate("/items")}
        >
          Browse Items
        </button>
      </main>
    );
  }

  const category =
    categories.find((entry) => entry.id === item.category) || item.categoryData;
  const displayPrice = item.price || formatDailyPrice(item.pricePerDay || 0);
  const features =
    item.features ||
    item.specs?.map((spec) => spec.label || spec.labelKey).filter(Boolean) ||
    [];
  const requirements = item.requirements || {};
  const averageRating = reviews.length
    ? (
        reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
        reviews.length
      ).toFixed(1)
    : "New";

  async function handleContactOwner() {
    if (!activeUser) {
      const { setStorageItem } =
        await import("../../services/storageService.js");
      setStorageItem("pendingContactUrl", `/items/${item.id}`);
      navigate("/login", {
        state: {
          from: { pathname: `/items/${item.id}` },
          contactReturn: true,
        },
      });
      return;
    }

    const conversation = await startListingConversation({
      renter: activeUser,
      item,
    });
    navigate(`/messages?conversation=${conversation.id}`);
  }

  return (
    <main className="details-contact-page">
      <div className="container">
        {notice && (
          <div className="listing-form-notice details-contact-notice">
            {notice}
            <button
              type="button"
              className="btn-close"
              aria-label="Dismiss"
              onClick={() => setNotice("")}
            ></button>
          </div>
        )}

        <section className="details-hero-grid">
          <div className="details-gallery premium-glass-card">
            <img src={item.image} alt={item.title} />
          </div>

          <aside className="details-contact-card premium-glass-card">
            <span className="section-label">
              {category?.name || item.categoryName || item.category}
            </span>
            <h1>{item.title}</h1>
            <p className="details-location">
              <i className="bi bi-geo-alt-fill"></i> {item.location}
            </p>
            <div className="details-price-row">
              <strong>{displayPrice}</strong>
              <span>/ day</span>
            </div>
            <div className="details-rating-row">
              <span>{averageRating}</span>
              <div>
                {averageRating === "New"
                  ? "No reviews yet"
                  : renderStars(Math.round(Number(averageRating)))}
              </div>
            </div>
            <div className="alert alert-info py-2">
              Rental payments are handled directly between users.
            </div>
            <button
              type="button"
              className="btn btn-accent-custom btn-shine details-contact-button"
              onClick={() => navigate(`/booking/${item.id}`)}
            >
              <i className="bi bi-calendar-check"></i> Request Booking
            </button>
            <button
              type="button"
              className="btn btn-outline-danger details-contact-button"
              onClick={handleContactOwner}
            >
              <i className="bi bi-chat-dots"></i> Contact Owner
            </button>
            <p className="details-contact-helper">
              Discuss availability, rental duration, pickup, delivery, pricing,
              and payment arrangements directly with the owner.
            </p>
          </aside>
        </section>

        <section className="details-content-grid">
          <article className="details-info-card premium-glass-card">
            <span className="section-label">LISTING INFORMATION</span>
            <h2>Description</h2>
            <p>
              {item.description ||
                "This rental listing is available through EasternCity. Contact the owner to confirm current availability and handoff details."}
            </p>
          </article>

          <article className="details-info-card premium-glass-card">
            <span className="section-label">FEATURES</span>
            <h2>Features & Specifications</h2>
            <div className="details-feature-grid">
              {(features.length
                ? features
                : [
                    "Verified listing",
                    "Owner managed",
                    "Rental ready",
                    "Contact first",
                  ]
              ).map((feature) => (
                <span className="details-feature-pill" key={feature}>
                  <i className="bi bi-check2-circle"></i> {feature}
                </span>
              ))}
            </div>
          </article>

          <article className="details-info-card premium-glass-card">
            <span className="section-label">RENTAL REQUIREMENTS</span>
            <h2>Before You Collect</h2>
            <div className="details-requirement-grid">
              <div>
                <strong>Documents</strong>
                <span>
                  {requirements.documents?.join(", ") || "National ID"}
                </span>
              </div>
              <div>
                <strong>Minimum Period</strong>
                <span>
                  {requirements.minimumPeriod || "Discuss with owner"}
                </span>
              </div>
              <div>
                <strong>Age Requirement</strong>
                <span>{requirements.age || "No restriction listed"}</span>
              </div>
              <div>
                <strong>Conditions</strong>
                <span>
                  {requirements.conditions ||
                    "Confirm deposit, delivery, and handoff terms by message."}
                </span>
              </div>
            </div>
          </article>
        </section>

        <section className="details-reviews-section">
          <div className="listings-header">
            <div>
              <span className="section-label">REVIEWS</span>
              <h2>What renters say</h2>
            </div>
          </div>
          <div className="details-review-carousel">
            {reviews.map((review) => (
              <article
                className="details-review-card premium-glass-card"
                key={review.id}
              >
                <div className="details-review-top">
                  <strong>{review.userName || "Verified renter"}</strong>
                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="details-review-stars">
                  {renderStars(Number(review.rating || 5))}
                </div>
                <p>
                  {review.comment ||
                    "A smooth rental experience through EasternCity."}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="details-similar-section">
          <SimilarListingsCarousel
            category={item.category}
            currentItemId={item.id}
          />
          {!seededItems.some(
            (entry) => entry.category === item.category && entry.id !== item.id,
          ) && (
            <p className="owner-muted text-center mt-3">
              More listings in this category will appear as owners publish them.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
