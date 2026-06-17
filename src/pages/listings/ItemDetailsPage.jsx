import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getItemById } from "../../services/itemService.js";
import { formatDailyPrice } from "../../utils/currency.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { canRentItem, getRentalRestrictionMessage } from "../../services/rentalAccessService.js";

export default function ItemDetailsPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [restrictionMessage, setRestrictionMessage] = useState("");

  const item = useMemo(() => getItemById(itemId), [itemId]);

  function handleRentNow() {
    // Error 1: Fixed missing backtick
    const currentItemUrl = `/items/${itemId}`;
    localStorage.setItem("pendingRentalUrl", currentItemUrl);

    if (!user) {
      navigate("/login");
      return;
    }

    if (!canRentItem(user.role)) {
      setRestrictionMessage(getRentalRestrictionMessage(user.role));
      return;
    }

    // Error 2: Fixed missing backtick
    navigate(`/booking/${itemId}`);
  }

  if (!item) {
    return (
      <main className="container py-5">
        <h1 className="h4">{t("itemNotFound")}</h1>
        <Link to="/items" className="btn btn-accent-custom mt-3">
          {t("browseItems")}
        </Link>
      </main>
    );
  }

  return (
    <main className="container py-5">
      <div className="row g-5">
        <div className="col-lg-6">
          <div className="item-detail-image">
            <img src={item.image} alt={item.title} className="img-fluid" />
          </div>
        </div>

        <div className="col-lg-6">
          <span className="section-label">{item.category}</span>
          <h1 className="mb-3">{item.title}</h1>

          <p className="text-muted">
            <i className="bi bi-geo-alt" /> {item.location}
          </p>

          <div className="d-flex align-items-center gap-3 mb-3">
            <strong className="h4 mb-0">{formatDailyPrice(item.pricePerDay)}</strong>
            <span className="rating">
              <i className="bi bi-star-fill" /> {item.rating}
            </span>
          </div>

          <p>{item.description}</p>

          <h2 className="h5 mt-4">{t("features")}</h2>
          <ul className="feature-list">
            {item.features?.map((feature) => (
              <li key={feature}>
                <i className="bi bi-check-circle" /> {feature}
              </li>
            ))}
          </ul>

          {restrictionMessage && (
            <div className="alert alert-warning mt-4">{restrictionMessage}</div>
          )}

          <button className="btn btn-accent-custom btn-lg mt-4" onClick={handleRentNow}>
            {t("rentNow")}
          </button>
        </div>
      </div>
    </main>
  );
}
