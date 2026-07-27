import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useRefreshToken } from "../../context/RefreshContext.jsx";
import { getMyListings, deleteListing } from "../../services/listingApiService.js";
import { getMyBookings } from "../../services/bookingApiService.js";
import ListingManagementTable from "../../components/dashboard/ListingManagementTable.jsx";
import BookingTable from "../../components/dashboard/BookingTable.jsx";
import MyListingsEmptyState from "../../components/dashboard/my-listings/MyListingsEmptyState.jsx";
import MyListingsTabs from "../../components/dashboard/my-listings/MyListingsTabs.jsx";
import PromotionRequestModal from "../../components/dashboard/my-listings/PromotionRequestModal.jsx";
import PromotionRequestsTable from "../../components/dashboard/my-listings/PromotionRequestsTable.jsx";
import {
  fetchOwnerPromotions,
  requestPromotion,
} from "../../services/promotionApiService.js";

const promotionPackages = [
  {
    id: 1,
    label: "Featured Listing",
    baseRate: 100,
    icon: "bi-lightning-charge",
  },
  { id: 2, label: "Top Listing", baseRate: 200, icon: "bi-stars" },
  { id: 3, label: "Homepage Banner", baseRate: 500, icon: "bi-gem" },
];
const durationOptions = [3, 7, 15, 30];

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function MyListingsPage() {
  const navigate = useNavigate();
  const { currentUser, user } = useAuth();
  const activeUser = user || currentUser;
  const [activeTab, setActiveTab] = useState("all");
  const refreshToken = useRefreshToken(["listings", "bookings", "promotions"]);
  const [listings, setListings] = useState([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [ownerBookings, setOwnerBookings] = useState([]);
  const [ownerPromotions, setOwnerPromotions] = useState([]);
  const [notice, setNotice] = useState("");
  const [promotionListing, setPromotionListing] = useState(null);
  const [selectedPromotionPackage, setSelectedPromotionPackage] = useState(1);
  const [selectedPromotionDuration, setSelectedPromotionDuration] = useState(7);
  const [promotionScreenshot, setPromotionScreenshot] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadListings() {
      if (!activeUser) {
        setListings([]);
        setIsLoadingListings(false);
        return;
      }

      setIsLoadingListings(true);
      try {
        const data = await getMyListings();
        if (!active) return;
        setListings(data);
      } catch (error) {
        if (!active) return;
        setNotice(error.message || "Unable to load your listings.");
        setListings([]);
      } finally {
        if (active) setIsLoadingListings(false);
      }
    }

    loadListings();

    return () => {
      active = false;
    };
  }, [activeUser, refreshToken]);

  const ownedItems = useMemo(() => listings, [listings]);

  useEffect(() => {
    let active = true;

    async function loadOwnerBookings() {
      if (!activeUser) {
        setOwnerBookings([]);
        return;
      }

      try {
        const data = await getMyBookings();
        const ownerBookingsData = data.filter(
          (booking) => String(booking.ownerId || "") === String(activeUser.id),
        );
        if (active) {
          setOwnerBookings(
            ownerBookingsData.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            ),
          );
        }
      } catch (error) {
        if (active) {
          setNotice(error.message || "Unable to load bookings.");
          setOwnerBookings([]);
        }
      }
    }

    loadOwnerBookings();

    return () => {
      active = false;
    };
  }, [activeUser, refreshToken]);

  useEffect(() => {
    let active = true;

    async function loadOwnerPromotions() {
      if (!activeUser) {
        setOwnerPromotions([]);
        return;
      }

      try {
        const data = await fetchOwnerPromotions(
          activeUser.id || activeUser.name || activeUser.businessName,
        );
        if (active) {
          setOwnerPromotions(data);
        }
      } catch {
        if (active) {
          setOwnerPromotions([]);
        }
      }
    }

    loadOwnerPromotions();

    return () => {
      active = false;
    };
  }, [activeUser, refreshToken]);

  const getFilteredItems = () => {
    switch (activeTab) {
      case "pending":
        return ownedItems.filter((i) =>
          [
            "pending",
            "draft",
            "under review",
            "under_review",
            "payment pending",
          ].includes(String(i.status || "").toLowerCase()),
        );
      case "approved":
        return ownedItems.filter((i) =>
          ["approved", "published", "active", "featured", "renewed"].includes(
            String(i.status || "").toLowerCase(),
          ),
        );
      case "rejected":
        return ownedItems.filter((i) =>
          ["rejected"].includes(String(i.status || "").toLowerCase()),
        );
      case "all":
      default:
        return ownedItems;
    }
  };

  const filteredItems = getFilteredItems();

  function handlePromote(item) {
    setPromotionListing(item);
    setSelectedPromotionPackage(1);
    setSelectedPromotionDuration(7);
    setPromotionScreenshot(null);
  }

  async function handlePromotionScreenshot(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      setNotice("Promotion payment screenshot must be JPG, JPEG, or PNG.");
      return;
    }

    const preview = await fileToDataUrl(file);
    setPromotionScreenshot({
      name: file.name,
      preview,
      file,
    });
  }

  async function submitPromotionRequest(event) {
    event.preventDefault();
    if (!promotionListing || !promotionScreenshot) {
      setNotice("Please upload a promotion payment screenshot.");
      return;
    }

    const selectedPackage = promotionPackages.find(
      (p) => p.id === selectedPromotionPackage,
    );
    const amount =
      (selectedPackage?.baseRate || 100) * selectedPromotionDuration;

    await requestPromotion(
      promotionListing.id,
      selectedPromotionPackage,
      promotionScreenshot,
      {
        listingTitle: promotionListing.title,
        ownerId: activeUser?.id || activeUser?.name || activeUser?.businessName,
        userId: activeUser?.id || activeUser?.name || activeUser?.businessName,
        userName: activeUser?.businessName || activeUser?.name || "User",
        ownerName:
          activeUser?.businessName ||
          activeUser?.name ||
          promotionListing.ownerName,
        packageName: selectedPackage?.label,
        promotionType: selectedPackage?.label,
        durationDays: selectedPromotionDuration,
        amount,
      },
    );
    setNotice(
      `${promotionListing.title} promotion request was submitted for review.`,
    );
    setPromotionListing(null);
    setPromotionScreenshot(null);
  }

  function handleEdit(item) {
    navigate(`/list-item?edit=${item.id}`);
  }

  async function handleDelete(item) {
    if (!window.confirm(`Are you sure you want to delete "${item.title}"?`)) return;
    try {
      await deleteListing(item.id);
      setNotice(`Listing "${item.title}" deleted successfully.`);
    } catch (error) {
      setNotice(error.message || "Failed to delete listing.");
    }
  }

  return (
    <main className="dashboard-content my-bookings-page pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span
            className="text-danger fw-bold"
            style={{
              letterSpacing: "1px",
              fontSize: "0.8rem",
              textTransform: "uppercase",
            }}
          >
            Listings
          </span>
          <h1 className="fw-bold m-0" style={{ fontSize: "2.5rem" }}>
            My Listings
          </h1>
        </div>
        <Link
          to="/list-item"
          className="btn btn-danger rounded-pill fw-bold px-4 py-2 shadow-sm"
        >
          <i className="bi bi-plus-circle me-2" /> Add Listing
        </Link>
      </div>

      {notice && <div className="alert alert-info">{notice}</div>}

      <MyListingsTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "requests" ? (
        ownerBookings.length === 0 ? (
          <MyListingsEmptyState
            icon="bi-calendar-x"
            title="No Booking Requests"
            description="You haven't received any booking requests yet."
          />
        ) : (
          <div className="premium-glass-card bg-white p-4">
            <BookingTable bookings={ownerBookings} />
          </div>
        )
      ) : activeTab === "promotions" ? (
        ownerPromotions.length === 0 ? (
          <MyListingsEmptyState
            icon="bi-megaphone"
            title="No Promotion Requests"
            description="Submitted listing promotion requests will appear here."
          />
        ) : (
          <PromotionRequestsTable promotions={ownerPromotions} />
        )
      ) : isLoadingListings ? (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm border border-light">
          <div className="spinner-border text-danger" role="status" />
          <p className="mt-3 text-muted">Loading your listings...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <MyListingsEmptyState
          icon="bi-card-list"
          title="You haven't created any listings yet."
          showAddButton={activeTab === "all"}
        />
      ) : (
        <ListingManagementTable
          items={filteredItems}
          onPromote={handlePromote}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {promotionListing && (
        <PromotionRequestModal
          durationOptions={durationOptions}
          listing={promotionListing}
          onClose={() => {
            setPromotionListing(null);
            setPromotionScreenshot(null);
          }}
          onScreenshotChange={handlePromotionScreenshot}
          onSubmit={submitPromotionRequest}
          packages={promotionPackages}
          screenshot={promotionScreenshot}
          selectedDuration={selectedPromotionDuration}
          selectedPackage={selectedPromotionPackage}
          setSelectedDuration={setSelectedPromotionDuration}
          setSelectedPackage={setSelectedPromotionPackage}
        />
      )}
    </main>
  );
}
