import { formatPrice } from "../../../utils/priceUtils.js";

function HeroCardPreview({ listing, discountPercent, customSpecs }) {
  if (!listing) return null;

  const originalPrice = Number(String(listing.price || listing.pricePerDay || "0").replace(/[^0-9.]/g, ""));
  const hasDiscount = discountPercent > 0;
  const discountedPrice = hasDiscount
    ? Math.round(originalPrice * (1 - discountPercent / 100) / 50) * 50
    : null;

  const imageUrl =
    (listing.images && listing.images[0]?.url) ||
    listing.image ||
    "";

  const specs = customSpecs && customSpecs.length > 0 
    ? customSpecs 
    : [listing.category, listing.city, listing.transmission || listing.priceType || "Day"].filter(Boolean);

  return (
    <div
      className="hero-float-card hero-product-card d-flex flex-column position-relative animate-fade-in-up"
      style={{ maxWidth: 300, cursor: "default", margin: "20px auto 0" }}
    >
      {hasDiscount && (
        <span
          className="hero-discount-badge d-flex flex-column justify-content-center align-items-center text-white text-center fw-bold"
          style={{
            position: "absolute",
            zIndex: 2,
            top: "-20px",
            right: "-20px",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "var(--motorx-red, #e31e24)",
            boxShadow: "0 8px 16px rgba(227, 30, 36, 0.38)",
            lineHeight: 1
          }}
        >
          <span className="discount-pct" style={{ fontSize: "0.88rem" }}>{discountPercent}%</span>
          <span className="discount-off text-uppercase" style={{ fontSize: "0.48rem" }}> OFF</span>
        </span>
      )}

      <div className="hero-card-main d-flex align-items-center">
        <img
          src={imageUrl}
          alt={listing.title}
          className="hero-product-image"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/64x64?text=No+Image";
          }}
        />
        <div className="flex-grow-1">
          <div className="hero-float-card-rating">
            <i className="bi bi-star-fill text-warning me-1" style={{ fontSize: "0.7rem" }} />
            <span>{listing.rating || "4.9"}</span>
            <span className="text-muted" style={{ fontSize: "0.65rem", marginLeft: '4px' }}>
              ({listing.reviewsCount || 12})
            </span>
          </div>
          <h6 className="hero-product-title m-0 fw-bold text-start">{listing.title}</h6>
        </div>
      </div>

      <div className="hero-float-card-specs text-start mt-1">
        {specs.filter(Boolean).map((spec, i) => (
          <span key={i} className="hero-float-card-spec-tag me-1">
            {spec}
          </span>
        ))}
      </div>

      <div className="hero-card-price-row d-flex justify-content-between align-items-center mt-auto border-top pt-2">
        <div className="text-start">
          <span className="hero-price-label">day</span>
          {hasDiscount && (
            <span className="hero-original-price">{formatPrice(originalPrice)}</span>
          )}
          <span className="hero-current-price">
            {formatPrice(hasDiscount ? discountedPrice : originalPrice)}
          </span>
        </div>
        <div className="hero-card-location">
          <i className="bi bi-geo-alt-fill text-danger me-1" />
          {listing.location || listing.city || ""}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";

export default function PromotionRequestModal({
  durationOptions,
  listing,
  onClose,
  onScreenshotChange,
  onSubmit,
  packages,
  screenshot,
  selectedDuration,
  selectedPackage,
  setSelectedDuration,
  setSelectedPackage,
  discountPercent = 0,
  onDiscountChange,
}) {
  const [spec1, setSpec1] = useState(listing?.category || "");
  const [spec2, setSpec2] = useState(listing?.city || "");
  const [spec3, setSpec3] = useState(listing?.transmission || listing?.priceType || "Day");

  const customSpecs = [spec1, spec2, spec3];

  // Hide Homepage Banner — it has its own separate flow. Assuming package id 3 is Homepage Banner.
  const visiblePackages = packages.filter((p) => p.id !== 3);

  const packageRate =
    visiblePackages.find((item) => item.id === selectedPackage)?.baseRate || 100;
  const totalAmount = packageRate * selectedDuration;
  const isHeroPromotion = selectedPackage === 2;

  if (!listing) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden" style={{ background: 'var(--bg-panel, #fff)' }}>
          <div className="modal-header border-bottom py-3" style={{ background: 'var(--bg-card, #f8f9fa)' }}>
            <h5 className="modal-title fw-bold" style={{ color: 'var(--text-main, #212529)' }}>Promote Listing</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body p-4 text-start" style={{ color: 'var(--text-main, #212529)' }}>
            <div className="row g-4">
              {/* ── LEFT: form ── */}
              <div className={isHeroPromotion ? "col-md-6" : "col-12"}>
                <p className="text-muted mb-4">
                  Boost visibility for <strong>{listing.title}</strong> by selecting a promotion package.
                </p>

                <form onSubmit={onSubmit}>
                  {/* Package selection */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">Select Package</label>
                    <div className="row g-3">
                      {visiblePackages.map((pkg) => (
                        <div className="col-12" key={pkg.id}>
                          <label
                            className={`d-flex align-items-center p-3 rounded-3 cursor-pointer border ${
                              selectedPackage === pkg.id
                                ? "border-danger bg-danger bg-opacity-10"
                                : "border-light"
                            }`}
                          >
                            <input
                              type="radio"
                              name="promotionPackage"
                              value={pkg.id}
                              checked={selectedPackage === pkg.id}
                              onChange={() => setSelectedPackage(pkg.id)}
                              className="form-check-input me-3 mt-0"
                            />
                            <i
                              className={`bi ${pkg.icon} fs-4 me-3 ${
                                selectedPackage === pkg.id ? "text-danger" : "text-secondary"
                              }`}
                            />
                            <div className="flex-grow-1">
                              <h6 className="mb-0 fw-bold">{pkg.label}</h6>
                              <small className="text-muted">{pkg.baseRate} ETB / day</small>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">Duration (Days)</label>
                    <select
                      className="form-select form-select-lg"
                      value={selectedDuration}
                      onChange={(e) => setSelectedDuration(Number(e.target.value))}
                    >
                      {durationOptions.map((duration) => (
                        <option key={duration} value={duration}>
                          {duration} Days — {packageRate * duration} ETB
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Discount input — Hero Promotion only */}
                  {isHeroPromotion && (
                    <>
                      <div className="mb-4">
                        <label className="form-label fw-bold">
                          Discount %{" "}
                          <span className="text-muted fw-normal">(Optional)</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          max="100"
                          value={discountPercent === 0 ? "" : discountPercent}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === "") {
                              onDiscountChange(0);
                            } else {
                              const val = Math.max(0, Math.min(100, Number(raw) || 0));
                              onDiscountChange(val);
                            }
                          }}
                          placeholder="Enter discount percent (optional)"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="form-label fw-bold">Card Features (Specs)</label>
                        <p className="small text-muted mb-2">You can customize up to 3 tags shown on your card.</p>
                        <div className="row g-2">
                          <div className="col-4">
                            <input
                              type="text"
                              name="spec1"
                              className="form-control form-control-sm"
                              placeholder="e.g. Automatic"
                              value={spec1}
                              onChange={(e) => setSpec1(e.target.value)}
                            />
                          </div>
                          <div className="col-4">
                            <input
                              type="text"
                              name="spec2"
                              className="form-control form-control-sm"
                              placeholder="e.g. Petrol"
                              value={spec2}
                              onChange={(e) => setSpec2(e.target.value)}
                            />
                          </div>
                          <div className="col-4">
                            <input
                              type="text"
                              name="spec3"
                              className="form-control form-control-sm"
                              placeholder="e.g. 5 Seats"
                              value={spec3}
                              onChange={(e) => setSpec3(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="form-label fw-bold">Hero Display Text</label>
                        <p className="small text-muted mb-2">Custom text shown on the main hero slider. If left empty, listing title and description will be used.</p>
                        <div className="mb-2">
                          <input
                            type="text"
                            name="customTitle"
                            className="form-control"
                            placeholder="Custom Hero Title"
                            defaultValue={listing?.title || ""}
                          />
                        </div>
                        <div>
                          <textarea
                            name="customSubtitle"
                            className="form-control"
                            placeholder="Custom Hero Subtitle (keep it short)"
                            rows="2"
                            defaultValue={listing?.description || ""}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Payment upload */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">Payment Upload</label>
                    <div className="p-3 rounded-3 border" style={{ background: 'var(--bg-card, #f8f9fa)', borderColor: 'var(--border-color, #dee2e6)' }}>
                      <p className="small mb-2" style={{ color: 'var(--text-muted, #6c757d)' }}>
                        Please pay <strong>{totalAmount} ETB</strong> via Telebirr or CBE Birr and
                        upload the receipt.
                      </p>
                      <label className="btn btn-outline-danger w-100 d-flex justify-content-center align-items-center gap-2">
                        <i className="bi bi-upload" />
                        {screenshot ? screenshot.name : "Upload Payment Screenshot"}
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                          hidden
                          onChange={onScreenshotChange}
                        />
                      </label>
                      {screenshot && (
                        <div className="mt-3 text-center">
                          <img
                            src={screenshot.preview}
                            alt="Payment receipt preview"
                            className="img-thumbnail"
                            style={{ maxHeight: 150 }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="d-grid mt-4">
                    <button
                      type="submit"
                      className="btn btn-danger btn-lg rounded-pill fw-bold"
                      disabled={!screenshot}
                    >
                      {screenshot ? "Submit Promotion Request" : "Please Upload Receipt to Submit"}
                    </button>
                  </div>
                </form>
              </div>

              {/* ── RIGHT: live hero card preview ── */}
              {isHeroPromotion && (
                <div className="col-md-6 d-flex flex-column align-items-center justify-content-center">
                  <p className="text-muted small mb-3 text-center">
                    <strong>Card Preview</strong>
                    <br />
                    This is how your listing will appear on the homepage hero slider.
                  </p>
                  <HeroCardPreview listing={listing} discountPercent={discountPercent} customSpecs={customSpecs} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
