import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getStorageItem, setStorageItem } from "../../services/storageService.js";

const SAVED_KEY = "saved_items";

function getSavedItemsForUser(userId) {
  return getStorageItem(SAVED_KEY, []).filter(
    (item) => String(item.userId || "") === String(userId || ""),
  );
}

export default function SavedItemsPage() {
  const { currentUser, user } = useAuth();
  const activeUser = user || currentUser;
  const [savedItems, setSavedItems] = useState(() =>
    getSavedItemsForUser(activeUser?.id),
  );

  useEffect(() => {
    function refreshSavedItems() {
      setSavedItems(getSavedItemsForUser(activeUser?.id));
    }

    refreshSavedItems();
    window.addEventListener("easterncity:saved-items-updated", refreshSavedItems);
    return () => {
      window.removeEventListener(
        "easterncity:saved-items-updated",
        refreshSavedItems,
      );
    };
  }, [activeUser?.id]);

  function handleRemove(itemId) {
    const allSavedItems = getStorageItem(SAVED_KEY, []);
    const updated = allSavedItems.filter(
      (item) =>
        !(
          item.id === itemId &&
          String(item.userId || "") === String(activeUser?.id || "")
        ),
    );
    setStorageItem(SAVED_KEY, updated);
    setSavedItems(getSavedItemsForUser(activeUser?.id));
    window.dispatchEvent(new Event("easterncity:saved-items-updated"));
  }

  return (
    <div className="ud-page">
      <div className="ud-page-header">
        <div>
          <span className="ud-label">WISHLIST</span>
          <h1 className="ud-page-title">Saved Items</h1>
          <p className="ud-page-sub">Items you've saved for later.</p>
        </div>
        <div className="ud-summary-chips">
          <div className="ud-chip ud-chip-pink">
            <i className="bi bi-heart-fill" />
            <div>
              <strong>{savedItems.length}</strong>
              <span>Saved</span>
            </div>
          </div>
        </div>
      </div>

      {savedItems.length === 0 ? (
        <div className="ud-empty-state ud-empty-state-lg">
          <i className="bi bi-heart" />
          <h3>No saved items yet</h3>
          <p>Browse the marketplace and tap the heart icon to save items you like.</p>
          <Link to="/items" className="ud-btn-red">
            <i className="bi bi-search" /> Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="saved-items-grid">
          {savedItems.map((item) => (
            <div className="ud-glass-card saved-item-card" key={item.id}>
              {item.image && (
                <div className="saved-item-img-wrap">
                  <img src={item.image} alt={item.title} />
                </div>
              )}
              <div className="saved-item-body">
                <h4 className="saved-item-title">{item.title || "Rental Item"}</h4>
                {item.location && (
                  <span className="saved-item-location">
                    <i className="bi bi-geo-alt" /> {item.location}
                  </span>
                )}
                {(item.price || item.pricePerDay) && (
                  <span className="saved-item-price">
                    {item.price || `ETB ${item.pricePerDay}/day`}
                  </span>
                )}
              </div>
              <div className="saved-item-actions">
                <Link to={`/items/${item.id}`} className="ud-btn-outline ud-btn-sm">
                  <i className="bi bi-eye" /> View
                </Link>
                <Link to={`/booking/${item.id}`} className="ud-btn-red ud-btn-sm">
                  <i className="bi bi-calendar-plus" /> Book
                </Link>
                <button
                  type="button"
                  className="ud-btn-ghost ud-btn-sm"
                  onClick={() => handleRemove(item.id)}
                >
                  <i className="bi bi-trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
