import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getMyListings } from "../../services/listingApiService.js";
import { getMyBookings } from "../../services/bookingApiService.js";
import ListingManagementTable from "../../components/dashboard/ListingManagementTable.jsx";
import BookingTable from "../../components/dashboard/BookingTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
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
  const { currentUser, user } = useAuth();
  const activeUser = user || currentUser;
  const [activeTab, setActiveTab] = useState("all");
  const [refresh, setRefresh] = useState(0);
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
    const handleUpdate = () => setRefresh((r) => r + 1);
    window.addEventListener("easterncity:listings-updated", handleUpdate);
    window.addEventListener("easterncity:bookings-updated", handleUpdate);
    window.addEventListener("easterncity:promotions-updated", handleUpdate);
    return () => {
      window.removeEventListener("easterncity:listings-updated", handleUpdate);
      window.removeEventListener("easterncity:bookings-updated", handleUpdate);
      window.removeEventListener(
        "easterncity:promotions-updated",
        handleUpdate,
      );
    };
  }, []);

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
  }, [activeUser, refresh]);

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
  }, [activeUser, refresh]);

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
  }, [activeUser, refresh]);

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
    setRefresh((value) => value + 1);
  }

  return (
    <main className="dashboard-content my-bookings-page pb-5">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <span
            className="text-danger fw-bold"
            style={{
              letterSpacing: "1px",
              fontSize: "0.8rem",
              textTransform: "uppercase",
            }}
          >
            Management
          </span>
          <h1 className="fw-bold m-0" style={{ fontSize: "2.5rem" }}>
            My Listings
          </h1>
        </div>
        <Link
          to="/list-item"
          className="btn btn-danger rounded-pill fw-bold px-4 py-2 shadow-sm"
        >
          <i className="bi bi-plus-circle-fill me-2" /> Add Listing
        </Link>
      </div>

      {notice && <div className="alert alert-info">{notice}</div>}

      <div className="d-flex gap-2 mb-4 overflow-auto pb-2 border-bottom details-tab-system">
        <button
          className={`btn rounded-pill fw-bold px-4 ${activeTab === "all" ? "btn-danger" : "btn-outline-secondary bg-white"}`}
          onClick={() => setActiveTab("all")}
        >
          All Listings
        </button>
        <button
          className={`btn rounded-pill fw-bold px-4 ${activeTab === "pending" ? "btn-danger" : "btn-outline-secondary bg-white"}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending Listings
        </button>
        <button
          className={`btn rounded-pill fw-bold px-4 ${activeTab === "approved" ? "btn-danger" : "btn-outline-secondary bg-white"}`}
          onClick={() => setActiveTab("approved")}
        >
          Approved Listings
        </button>
        <button
          className={`btn rounded-pill fw-bold px-4 ${activeTab === "rejected" ? "btn-danger" : "btn-outline-secondary bg-white"}`}
          onClick={() => setActiveTab("rejected")}
        >
          Rejected Listings
        </button>
        <button
          className={`btn rounded-pill fw-bold px-4 ${activeTab === "requests" ? "btn-danger" : "btn-outline-secondary bg-white"}`}
          onClick={() => setActiveTab("requests")}
        >
          Booking Requests
        </button>
        <button
          className={`btn rounded-pill fw-bold px-4 ${activeTab === "promotions" ? "btn-danger" : "btn-outline-secondary bg-white"}`}
          onClick={() => setActiveTab("promotions")}
        >
          Promotion Requests
        </button>
      </div>

      {activeTab === "requests" ? (
        ownerBookings.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 shadow-sm border border-light">
            <div className="mb-3">
              <i
                className="bi bi-calendar-x text-danger opacity-50"
                style={{ fontSize: "4rem" }}
              ></i>
            </div>
            <h3 className="fw-bold">No booking requests available</h3>
            <p className="text-muted">
              You haven't received any booking requests yet.
            </p>
          </div>
        ) : (
          <div className="premium-glass-card bg-white p-4">
            <BookingTable bookings={ownerBookings} />
          </div>
        )
      ) : activeTab === "promotions" ? (
        ownerPromotions.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 shadow-sm border border-light">
            <div className="mb-3">
              <i
                className="bi bi-megaphone text-danger opacity-50"
                style={{ fontSize: "4rem" }}
              ></i>
            </div>
            <h3 className="fw-bold">No promotion requests available</h3>
            <p className="text-muted">
              Submitted listing promotion requests will appear here.
            </p>
          </div>
        ) : (
          <div className="premium-glass-card bg-white p-4">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Listing</th>
                    <th>Promotion Type</th>
                    <th>Request Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ownerPromotions.map((promotion) => (
                    <tr key={promotion.id}>
                      <td className="fw-bold">{promotion.listingTitle}</td>
                      <td>{promotion.promotionType}</td>
                      <td>{promotion.requestDate}</td>
                      <td>
                        <StatusBadge status={promotion.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : isLoadingListings ? (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm border border-light">
          <div className="spinner-border text-danger" role="status" />
          <p className="mt-3 text-muted mb-0">Loading your listings...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm border border-light">
          <div className="mb-3">
            <i
              className="bi bi-card-list text-danger opacity-50"
              style={{ fontSize: "4rem" }}
            ></i>
          </div>
          <h3 className="fw-bold">No listings found</h3>
          <p className="text-muted">
            You don't have any listings in this category.
          </p>
          {activeTab === "all" && (
            <Link
              to="/list-item"
              className="btn btn-outline-danger rounded-pill fw-bold mt-3 px-4"
            >
              Create your first listing
            </Link>
          )}
        </div>
      ) : (
        <div className="premium-glass-card bg-white p-4">
          <ListingManagementTable
            items={filteredItems}
            onPromote={handlePromote}
          />
        </div>
      )}

      {promotionListing && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-light border-0 py-3">
                <h5 className="modal-title fw-bold">Promote Listing</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setPromotionListing(null);
                    setPromotionScreenshot(null);
                  }}
                ></button>
              </div>
              <div className="modal-body p-4">
                <p className="text-muted mb-4">
                  Boost visibility for <strong>{promotionListing.title}</strong>{" "}
                  by selecting a promotion package.
                </p>
                <form onSubmit={submitPromotionRequest}>
                  <div className="mb-4">
                    <label className="form-label fw-bold">Select Package</label>
                    <div className="row g-3">
                      {promotionPackages.map((pkg) => (
                        <div className="col-12" key={pkg.id}>
                          <label
                            className={`d-flex align-items-center p-3 rounded-3 cursor-pointer border ${selectedPromotionPackage === pkg.id ? "border-danger bg-danger bg-opacity-10" : "border-light"}`}
                          >
                            <input
                              type="radio"
                              name="promotionPackage"
                              value={pkg.id}
                              checked={selectedPromotionPackage === pkg.id}
                              onChange={() =>
                                setSelectedPromotionPackage(pkg.id)
                              }
                              className="form-check-input me-3 mt-0"
                            />
                            <i
                              className={`bi ${pkg.icon} fs-4 me-3 ${selectedPromotionPackage === pkg.id ? "text-danger" : "text-secondary"}`}
                            ></i>
                            <div className="flex-grow-1">
                              <h6 className="mb-0 fw-bold">{pkg.label}</h6>
                              <small className="text-muted">
                                {pkg.baseRate} ETB / day
                              </small>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      Duration (Days)
                    </label>
                    <select
                      className="form-select form-select-lg"
                      value={selectedPromotionDuration}
                      onChange={(e) =>
                        setSelectedPromotionDuration(Number(e.target.value))
                      }
                    >
                      {durationOptions.map((d) => (
                        <option key={d} value={d}>
                          {d} Days -{" "}
                          {(promotionPackages.find(
                            (p) => p.id === selectedPromotionPackage,
                          )?.baseRate || 100) * d}{" "}
                          ETB
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold">Payment Upload</label>
                    <div className="p-3 bg-light rounded-3">
                      <p className="small text-muted mb-2">
                        Please pay{" "}
                        <strong>
                          {(promotionPackages.find(
                            (p) => p.id === selectedPromotionPackage,
                          )?.baseRate || 100) * selectedPromotionDuration}{" "}
                          ETB
                        </strong>{" "}
                        via Telebirr or CBE Birr and upload the receipt.
                      </p>
                      <label className="btn btn-outline-danger w-100 d-flex justify-content-center align-items-center gap-2">
                        <i className="bi bi-upload"></i>
                        {promotionScreenshot
                          ? promotionScreenshot.name
                          : "Upload Payment Screenshot"}
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                          hidden
                          onChange={handlePromotionScreenshot}
                        />
                      </label>
                      {promotionScreenshot && (
                        <div className="mt-3 text-center">
                          <img
                            src={promotionScreenshot.preview}
                            alt="Payment receipt preview"
                            className="img-thumbnail"
                            style={{ maxHeight: "150px" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="d-grid mt-4">
                    <button
                      type="submit"
                      className="btn btn-danger btn-lg rounded-pill fw-bold"
                    >
                      Submit Promotion Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
