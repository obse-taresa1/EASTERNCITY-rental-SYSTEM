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
}) {
  const packageRate =
    packages.find((item) => item.id === selectedPackage)?.baseRate || 100;
  const totalAmount = packageRate * selectedDuration;

  if (!listing) return null;

  return (
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
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body p-4">
            <p className="text-muted mb-4">
              Boost visibility for <strong>{listing.title}</strong> by
              selecting a promotion package.
            </p>
            <form onSubmit={onSubmit}>
              <div className="mb-4">
                <label className="form-label fw-bold">Select Package</label>
                <div className="row g-3">
                  {packages.map((pkg) => (
                    <div className="col-12" key={pkg.id}>
                      <label
                        className={`d-flex align-items-center p-3 rounded-3 cursor-pointer border ${selectedPackage === pkg.id ? "border-danger bg-danger bg-opacity-10" : "border-light"}`}
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
                          className={`bi ${pkg.icon} fs-4 me-3 ${selectedPackage === pkg.id ? "text-danger" : "text-secondary"}`}
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
                <label className="form-label fw-bold">Duration (Days)</label>
                <select
                  className="form-select form-select-lg"
                  value={selectedDuration}
                  onChange={(event) =>
                    setSelectedDuration(Number(event.target.value))
                  }
                >
                  {durationOptions.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration} Days - {packageRate * duration} ETB
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold">Payment Upload</label>
                <div className="p-3 bg-light rounded-3">
                  <p className="small text-muted mb-2">
                    Please pay <strong>{totalAmount} ETB</strong> via Telebirr
                    or CBE Birr and upload the receipt.
                  </p>
                  <label className="btn btn-outline-danger w-100 d-flex justify-content-center align-items-center gap-2">
                    <i className="bi bi-upload"></i>
                    {screenshot
                      ? screenshot.name
                      : "Upload Payment Screenshot"}
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
  );
}
