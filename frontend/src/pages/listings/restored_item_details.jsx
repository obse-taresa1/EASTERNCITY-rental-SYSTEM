import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SimilarListingsCarousel from "../../components/listings/SimilarListingsCarousel.jsx";
import ListingImageGallery from "../../components/listings/ListingImageGallery.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { categories } from "../../data/items.js";
import { getListingById } from "../../services/listingApiService.js";
import { getReviewsByListing } from "../../services/reviewApiService.js";
import { startListingConversation } from "../../services/messageApiService.js";
import { formatDailyPrice } from "../../utils/currency.js";

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
  const { t } = useLanguage();
  const activeUser = user || currentUser;
  const [notice, setNotice] = useState(
    location.state?.contactReadyMessage || "",
  );
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState("");

  const { data: item, isLoading: loading } = useQuery({
    queryKey: ["listing", itemId],
    queryFn: () => getListingById(itemId),
    staleTime: 5 * 60 * 1000,
  });

  const { data: rawReviews } = useQuery({
    queryKey: ["reviews", itemId],
    queryFn: () => getReviewsByListing(itemId),
    enabled: !!itemId,
    staleTime: 2 * 60 * 1000,
  });
  const reviews = Array.isArray(rawReviews) ? rawReviews : [];

  if (loading) {
    return (
      <main className="container py-5 text-center">
        <h1 className="h4 text-muted">{t("loadingItem")}</h1>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="container py-5 text-center">
        <h1 className="h4 text-muted">{t("itemNotFoundMessage")}</h1>
        <button
          className="btn btn-danger mt-3"
          onClick={() => navigate("/items")}
        >
          {t("browseItemsBtn")}
        </button>
      </main>
    );
  }

  const category =
    categories.find((entry) => entry.id === item.category) || item.categoryData;
  const displayPrice = item.price || formatDailyPrice(item.pricePerDay || 0);
  const features =
    item.features ||
    item.specs?.map((spec) => spec.labelKey ? t(spec.labelKey) : spec.label).filter(Boolean) ||
    [];
  const requirements = item.requirements || {};
  const averageRating = reviews.length
    ? (
        reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
        reviews.length
      ).toFixed(1)
    : t("noReviewsYet");

  async function handleContactOwner() {
    setContactError("");

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

    setContactLoading(true);
    try {
      const conversation = await startListingConversation({
        renter: activeUser,
        item,
      });
      navigate(`/messages?conversation=${conversation.id}`);
    } catch (error) {
      setContactError(error.message || t("couldNotOpenConversation"));
    } finally {
      setContactLoading(false);
    }
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
          <ListingImageGallery images={item.images || [item.image]} fallbackImage={item.image} />

          <aside className="details-contact-card premium-glass-card">
            <span className="section-label">
              {category?.nameKey ? t(category.nameKey) : (category?.name || item.categoryName || item.category)}
            </span>
            <h1>{item.title}</h1>
            <p className="details-location">
              <i className="bi bi-geo-alt-fill"></i> {item.location}
            </p>
            <div className="details-price-row">
              <strong>{displayPrice}</strong>
              <span>{t("perDayLabel")}</span>
            </div>
            <div className="details-rating-row">
              <span>{averageRating === t("noReviewsYet") ? "" : averageRating}</span>
              <div>
                {averageRating === t("noReviewsYet")
                  ? t("noReviewsYet")
                  : renderStars(Math.round(Number(averageRating)))}
              </div>
            </div>
            <div className="alert alert-info py-2">
              {t("rentalPaymentNotice")}
            </div>
            <button
              type="button"
              className="btn btn-accent-custom btn-shine details-contact-button"
              onClick={() => navigate(`/booking/${item.id}`)}
            >
              <i className="bi bi-calendar-check"></i> {t("requestBooking")}
            </button>
            <button
              type="button"
              className="btn btn-accent-custom btn-shine details-contact-button mt-3"
              onClick={handleContactOwner}
              disabled={contactLoading}
            >
              <i className="bi bi-chat-dots"></i>{" "}
              {contactLoading ? t("opening") : t("contactOwner")}
            </button>
            {contactError && (
              <div className="alert alert-danger py-2 mt-2" role="alert">
                {contactError}
              </div>
            )}
            <p className="details-contact-helper mt-3">
              {t("contactOwnerHelper")}
            </p>
          </aside>
        </section>

        <section className="details-content-grid">
          <article className="details-info-card premium-glass-card">
            <span className="section-label">{t("listingInformationLabel")}</span>
            <h2>{t("description")}</h2>
            <p>
              {item.description || t("fallbackDescription")}
            </p>
          </article>

          <article className="details-info-card premium-glass-card">
            <span className="section-label">{t("featuresLabel")}</span>
            <h2>{t("featuresTitle")}</h2>
            <div className="details-feature-grid">
              {(features.length
                ? features
                : [
                    t("featureVerified"),
                    t("featureOwnerManaged"),
                    t("featureRentalReady"),
                    t("featureContactFirst"),
                  ]
              ).map((feature) => (
                <span className="details-feature-pill" key={feature}>
                  <i className="bi bi-check2-circle"></i> {feature}
                </span>
              ))}
            </div>
          </article>

          <article className="details-info-card premium-glass-card">
            <span className="section-label">{t("requirementsLabel")}</span>
            <h2>{t("beforeYouCollect")}</h2>
            <div className="details-requirement-grid">
              <div>
                <strong>{t("reqDocuments")}</strong>
                <span>
                  {requirements.documents?.join(", ") || t("reqNationalId")}
                </span>
              </div>
              <div>
                <strong>{t("reqMinPeriod")}</strong>
                <span>
                  {requirements.minimumPeriod || t("reqDiscussOwner")}
                </span>
              </div>
              <div>
                <strong>{t("reqAge")}</strong>
                <span>{requirements.age || t("reqNoRestriction")}</span>
              </div>
              <div>
                <strong>{t("reqConditions")}</strong>
                <span>
                  {requirements.conditions || t("reqConfirmDeposit")}
                </span>
              </div>
            </div>
          </article>
        </section>

        <section className="details-reviews-section">
          <div className="listings-header">
            <div>
              <span className="section-label">{t("reviewsLabel")}</span>
              <h2>{t("whatRentersSay")}</h2>
            </div>
          </div>
          <div className="details-review-carousel">
            {reviews.map((review) => (
              <article
                className="details-review-card premium-glass-card"
                key={review.id}
              >
                <div className="details-review-top">
                  <strong>{review.userName || t("verifiedRenter")}</strong>
                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="details-review-stars">
                  {renderStars(Number(review.rating || 5))}
                </div>
                <p>
                  {review.comment || t("fallbackReview")}
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
        </section>
      </div>
    </main>
  );
}
