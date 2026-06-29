import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../../components/forms/FormInput.jsx";
import FormSelect from "../../components/forms/FormSelect.jsx";
import FormTextarea from "../../components/forms/FormTextarea.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { categories } from "../../data/items.js";
import { saveOwnerListing } from "../../services/itemService.js";

const cities = ["Jigjiga", "Harar", "Dire Dawa"];
const priceTypes = ["Per Hour", "Per Day", "Per Week", "Per Month"];
const documents = [
  "National ID",
  "Driving License",
  "Student ID",
  "Passport",
  "Work ID",
  "Other",
];
const rentalPeriods = ["1 Hour", "1 Day", "3 Days", "1 Week", "Custom"];
const ageOptions = ["18+", "21+", "No Restriction"];
const pickupOptions = ["Pickup Only", "Delivery Available", "Both"];
const contactMethods = [
  "EasternCity Messaging",
  "Phone Call",
  "WhatsApp",
  "All Methods",
];

const initialFormData = {
  title: "",
  category: "",
  subcategory: "",
  city: "",
  area: "",
  description: "",
  rentalPrice: "",
  priceType: "Per Day",
  securityDeposit: "",
  availableFrom: "",
  availableUntil: "",
  quantity: "1",
  requiredDocuments: ["National ID"],
  otherDocument: "",
  minimumRentalPeriod: "1 Day",
  customRentalPeriod: "",
  ageRequirement: "18+",
  securityConditions:
    "Deposit required.\nItem inspection before handoff.\nLate return penalties apply.\nReplacement responsibility for damages.",
  additionalRequirements: "",
  pickupOption: "Both",
  deliveryFee: "",
  deliveryCoverage: "",
  contactPreference: "EasternCity Messaging",
};

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ListItemPage() {
  const navigate = useNavigate();
  const { currentUser, user } = useAuth();
  const activeUser = user || currentUser;
  const [formData, setFormData] = useState(initialFormData);
  const [images, setImages] = useState([]);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isPaymentStep, setIsPaymentStep] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Telebirr");
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [notice, setNotice] = useState("");

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === formData.category),
    [formData.category],
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function toggleDocument(documentName) {
    setFormData((current) => {
      const exists = current.requiredDocuments.includes(documentName);
      return {
        ...current,
        requiredDocuments: exists
          ? current.requiredDocuments.filter(
              (document) => document !== documentName,
            )
          : [...current.requiredDocuments, documentName],
      };
    });
  }

  async function addFiles(fileList) {
    const acceptedFiles = Array.from(fileList).filter((file) =>
      ["image/jpeg", "image/jpg", "image/png"].includes(file.type),
    );
    const availableSlots = 10 - images.length;
    const filesToAdd = acceptedFiles.slice(0, availableSlots);
    const nextFiles = await Promise.all(
      filesToAdd.map(async (file) => ({
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID?.() || Date.now()}`,
        name: file.name,
        size: file.size,
        preview: await fileToDataUrl(file),
      })),
    );

    setImages((current) => [...current, ...nextFiles]);
    if (acceptedFiles.length !== fileList.length) {
      setNotice("Only JPG, JPEG, and PNG images are supported.");
    } else if (acceptedFiles.length > availableSlots) {
      setNotice("Maximum 10 images allowed.");
    } else {
      setNotice("");
    }
  }

  function handleImageUpload(event) {
    addFiles(event.target.files);
    event.target.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();
    addFiles(event.dataTransfer.files);
  }

  function removeImage(imageId) {
    setImages((current) => current.filter((image) => image.id !== imageId));
  }

  function moveImage(index, direction) {
    setImages((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  function validateBeforePreview(event) {
    event.preventDefault();
    if (images.length < 3) {
      setNotice(
        "Please upload at least 3 high-quality images before previewing.",
      );
      return;
    }
    setNotice("");
    setIsPreviewing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function buildListing(status, screenshot) {
    const selectedCategoryName = selectedCategory?.name || formData.category;
    return {
      title: formData.title || "Untitled rental listing",
      category: formData.category || "construction-diy",
      subcategory: formData.subcategory,
      city: formData.city || "Jigjiga",
      location: [formData.area, formData.city].filter(Boolean).join(", "),
      description: formData.description,
      pricePerDay: Number(formData.rentalPrice || 0),
      priceType: formData.priceType,
      securityDeposit: formData.securityDeposit,
      availableFrom: formData.availableFrom,
      availableUntil: formData.availableUntil,
      quantity: Number(formData.quantity || 1),
      image: images[0]?.preview,
      coverImage: images[0]?.preview,
      images,
      status: status,
      available: status === "PUBLISHED" || status === "active",
      featured: false,
      owner:
        activeUser?.businessName || activeUser?.name || "EasternCity Owner",
      ownerName:
        activeUser?.businessName || activeUser?.name || "EasternCity Owner",
      subscriptionPlan: "Free Plan",
      verificationStatus: activeUser?.verified ? "verified" : "pending",
      contactPreference: formData.contactPreference,
      pickupOption: formData.pickupOption,
      deliveryFee: formData.deliveryFee,
      deliveryCoverage: formData.deliveryCoverage,
      requirements: {
        documents: [
          ...formData.requiredDocuments.filter(
            (document) => document !== "Other",
          ),
          ...(formData.otherDocument ? [formData.otherDocument] : []),
        ],
        minimumPeriod:
          formData.customRentalPeriod || formData.minimumRentalPeriod,
        age: formData.ageRequirement,
        conditions:
          formData.additionalRequirements || formData.securityConditions,
      },
      specs: [
        { icon: "bi-tags", label: selectedCategoryName },
        { icon: "bi-geo-alt", label: formData.city || "Jigjiga" },
      ],
      paymentScreenshot: screenshot?.preview,
      createdAt: new Date().toISOString()
    };
  }

  function finishListing(status, screenshot = null) {
    const listingStatus = status === "draft" ? "draft" : "UNDER_REVIEW";
    saveOwnerListing(buildListing(listingStatus, screenshot));
    setNotice(
      status === "draft"
        ? "Listing saved as draft."
        : "Listing submitted. Waiting for admin review after payment verification.",
    );
    setTimeout(() => navigate("/dashboard"), 500);
  }

  async function handleScreenshotUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setPaymentScreenshot({ name: file.name, preview: dataUrl });
  }

  function handlePaymentSubmit(e) {
    e.preventDefault();
    if (!paymentScreenshot) {
      setNotice("Please upload a payment screenshot before submitting.");
      return;
    }
    finishListing("publish", paymentScreenshot);
  }

  if (isPreviewing) {
    return (
      <main className="dashboard-content listing-form-page">
        <div className="listing-form-header">
          <div>
            <span className="section-label">Listing Preview</span>
            <h1>Review Before Publishing</h1>
            <p>
              Confirm images, description, rental requirements, pricing,
              availability, and contact methods.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline-dark"
            onClick={() => setIsPreviewing(false)}
          >
            <i className="bi bi-pencil" /> Edit Listing
          </button>
        </div>

        <section className="listing-preview-grid">
          <div className="listing-preview-gallery premium-glass-card">
            <img src={images[0]?.preview} alt="Cover preview" />
            <div>
              {images.slice(1, 5).map((image) => (
                <img src={image.preview} alt={image.name} key={image.id} />
              ))}
            </div>
          </div>

          <article className="listing-preview-card premium-glass-card">
            <span className="owner-featured-badge">Pending Approval</span>
            <h2>{formData.title}</h2>
            <p>{formData.description}</p>
            <dl>
              <dt>Category</dt>
              <dd>
                {selectedCategory?.name} · {formData.subcategory}
              </dd>
              <dt>Location</dt>
              <dd>
                {formData.city}, {formData.area}
              </dd>
              <dt>Pricing</dt>
              <dd>
                {formData.rentalPrice} ETB · {formData.priceType}
              </dd>
              <dt>Availability</dt>
              <dd>
                {formData.availableFrom} to {formData.availableUntil} · Qty{" "}
                {formData.quantity}
              </dd>
              <dt>Contact</dt>
              <dd>{formData.contactPreference}</dd>
            </dl>
          </article>
        </section>

        <section className="dashboard-section mt-4">
          <h2 className="h4">Rental Requirements</h2>
          <div className="preview-pill-row">
            {formData.requiredDocuments.map((document) => (
              <span className="preview-pill" key={document}>
                {document}
              </span>
            ))}
            {formData.otherDocument && (
              <span className="preview-pill">{formData.otherDocument}</span>
            )}
            <span className="preview-pill">
              Minimum{" "}
              {formData.customRentalPeriod || formData.minimumRentalPeriod}
            </span>
            <span className="preview-pill">Age {formData.ageRequirement}</span>
          </div>
          <p className="owner-muted mt-3 mb-0">
            {formData.additionalRequirements || formData.securityConditions}
          </p>
        </section>

      <div className="listing-form-actions">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => finishListing("draft")}
          >
            <i className="bi bi-file-earmark" /> Save Draft
          </button>
          {!isPaymentStep ? (
            <button
              type="button"
              className="btn btn-accent-custom btn-shine"
              onClick={() => { setIsPaymentStep(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            >
              <i className="bi bi-credit-card" /> Proceed to Payment
            </button>
          ) : (
            <div style={{ width: "100%" }}>
              {/* ── Listing Fee Payment Step ─────────────────────────── */}
              <div className="listing-form-section" style={{ border: "2px solid var(--primary-color)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1rem" }}>
                <h2 style={{ color: "var(--primary-color)" }}>
                  <i className="bi bi-credit-card me-2" />Listing Fee Payment
                </h2>
                <p className="text-muted mb-3">
                  Your listing becomes visible after payment verification and admin approval.
                </p>

                <div className="bg-light p-3 rounded mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-bold">Listing Fee</span>
                    <span>500 ETB</span>
                  </div>
                  <div className="d-flex justify-content-between fw-bold" style={{ borderTop: "1px solid #dee2e6", paddingTop: "0.5rem" }}>
                    <span>Total</span>
                    <span style={{ color: "var(--primary-color)" }}>500 ETB</span>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Payment Method</label>
                  <div className="d-flex gap-3">
                    {["Telebirr", "CBE Birr", "Bank Transfer"].map(method => (
                      <label key={method} className="d-flex align-items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method}
                          checked={paymentMethod === method}
                          onChange={e => setPaymentMethod(e.target.value)}
                        />
                        <span>{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Upload Payment Screenshot</label>
                  <label className="btn btn-outline-danger d-block">
                    <i className="bi bi-upload me-2" />
                    {paymentScreenshot ? paymentScreenshot.name : "Choose Screenshot (JPG, PNG)"}
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      hidden
                      onChange={handleScreenshotUpload}
                    />
                  </label>
                  {paymentScreenshot && (
                    <img
                      src={paymentScreenshot.preview}
                      alt="Payment screenshot"
                      style={{ maxHeight: "150px", marginTop: "0.5rem", borderRadius: "8px", border: "1px solid #dee2e6" }}
                    />
                  )}
                </div>

                <div className="alert alert-info mb-0">
                  <i className="bi bi-info-circle me-2" />
                  After submission your listing will be reviewed by our team. You will be notified once approved.
                </div>
              </div>

              <div className="listing-form-actions" style={{ padding: 0 }}>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setIsPaymentStep(false)}
                >
                  <i className="bi bi-arrow-left" /> Back to Preview
                </button>
                <button
                  type="button"
                  className="btn btn-accent-custom btn-shine"
                  onClick={handlePaymentSubmit}
                >
                  <i className="bi bi-send-check" /> Submit &amp; Await Review
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-content listing-form-page">
      <div className="listing-form-header">
        <div>
          <span className="section-label">Create Listing</span>
          <h1>List an Item for Rent</h1>
          <p>Complete the details renters need before contacting you.</p>
        </div>
        <div className="free-listing-note">
          You have used 2 of your 3 free listings.
        </div>
      </div>

      {notice && <div className="listing-form-notice">{notice}</div>}

      <form className="listing-form-shell" onSubmit={validateBeforePreview}>
        <section className="listing-form-section">
          <h2>Basic Information</h2>
          <div className="row g-3">
            <div className="col-md-6">
              <FormInput
                label="Item Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: Toyota RAV4"
                required
              />
            </div>
            <div className="col-md-3">
              <FormSelect
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Choose category"
                options={categories.map((category) => ({
                  value: category.id,
                  label: category.name,
                }))}
                required
              />
            </div>
            <div className="col-md-3">
              <FormInput
                label="Subcategory"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                placeholder="SUV, DSLR, Drill kit"
                required
              />
            </div>
            <div className="col-md-4">
              <FormSelect
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Choose city"
                options={cities.map((city) => ({ value: city, label: city }))}
                required
              />
            </div>
            <div className="col-md-8">
              <FormInput
                label="Specific Area/Neighbourhood"
                name="area"
                value={formData.area}
                onChange={handleChange}
                placeholder="Example: University Road, Jigjiga"
                required
              />
            </div>
            <div className="col-12">
              <FormTextarea
                label="Item Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe condition, included accessories, rules, and best use cases."
                rows={5}
                required
              />
            </div>
          </div>
        </section>

        <section className="listing-form-section">
          <h2>Pricing Information</h2>
          <div className="row g-3">
            <div className="col-md-4">
              <FormInput
                label="Rental Price"
                name="rentalPrice"
                type="number"
                value={formData.rentalPrice}
                onChange={handleChange}
                placeholder="Example: 2500"
                required
              />
            </div>
            <div className="col-md-4">
              <FormSelect
                label="Price Type"
                name="priceType"
                value={formData.priceType}
                onChange={handleChange}
                options={priceTypes.map((type) => ({
                  value: type,
                  label: type,
                }))}
                required
              />
            </div>
            <div className="col-md-4">
              <FormInput
                label="Security Deposit Amount (Optional)"
                name="securityDeposit"
                type="number"
                value={formData.securityDeposit}
                onChange={handleChange}
                placeholder="Example: 2000"
              />
            </div>
          </div>
        </section>

        <section className="listing-form-section">
          <h2>Availability</h2>
          <div className="row g-3">
            <div className="col-md-4">
              <FormInput
                label="Available From"
                name="availableFrom"
                type="date"
                value={formData.availableFrom}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <FormInput
                label="Available Until"
                name="availableUntil"
                type="date"
                value={formData.availableUntil}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <FormInput
                label="Quantity Available"
                name="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </section>

        <section className="listing-form-section">
          <h2>Images</h2>
          <div
            className="image-dropzone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          >
            <i className="bi bi-cloud-arrow-up" />
            <strong>Drag and drop JPG, JPEG, or PNG images</strong>
            <span>Minimum 3, maximum 10. First image becomes the cover.</span>
            <label className="btn btn-outline-danger mt-3">
              Choose Images
              <input
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                multiple
                hidden
                onChange={handleImageUpload}
              />
            </label>
          </div>
          <div className="image-preview-grid">
            {images.map((image, index) => (
              <div className="image-preview-card" key={image.id}>
                <img src={image.preview} alt={image.name} />
                {index === 0 && <span>Cover</span>}
                <div className="image-preview-actions">
                  <button
                    type="button"
                    onClick={() => moveImage(index, -1)}
                    aria-label="Move image left"
                  >
                    <i className="bi bi-arrow-left" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(index, 1)}
                    aria-label="Move image right"
                  >
                    <i className="bi bi-arrow-right" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    aria-label="Remove image"
                  >
                    <i className="bi bi-x-lg" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="listing-form-section">
          <h2>Rental Requirements</h2>
          <label className="form-label">Required Documents</label>
          <div className="checkbox-pill-grid">
            {documents.map((document) => (
              <label className="checkbox-pill" key={document}>
                <input
                  type="checkbox"
                  checked={formData.requiredDocuments.includes(document)}
                  onChange={() => toggleDocument(document)}
                />
                <span>{document}</span>
              </label>
            ))}
          </div>
          {formData.requiredDocuments.includes("Other") && (
            <FormInput
              label="Other Document"
              name="otherDocument"
              value={formData.otherDocument}
              onChange={handleChange}
              placeholder="Example: Business permit"
            />
          )}
          <div className="row g-3">
            <div className="col-md-4">
              <FormSelect
                label="Minimum Rental Period"
                name="minimumRentalPeriod"
                value={formData.minimumRentalPeriod}
                onChange={handleChange}
                options={rentalPeriods.map((period) => ({
                  value: period,
                  label: period,
                }))}
              />
            </div>
            <div className="col-md-4">
              <FormSelect
                label="Age Requirement"
                name="ageRequirement"
                value={formData.ageRequirement}
                onChange={handleChange}
                options={ageOptions.map((age) => ({
                  value: age,
                  label: age === "No Restriction" ? age : `Minimum Age: ${age}`,
                }))}
              />
            </div>
            {formData.minimumRentalPeriod === "Custom" && (
              <div className="col-md-4">
                <FormInput
                  label="Custom Period"
                  name="customRentalPeriod"
                  value={formData.customRentalPeriod}
                  onChange={handleChange}
                  placeholder="Example: 10 days"
                />
              </div>
            )}
          </div>
          <FormTextarea
            label="Security Conditions"
            name="securityConditions"
            value={formData.securityConditions}
            onChange={handleChange}
            rows={4}
          />
          <FormTextarea
            label="Additional Requirements"
            name="additionalRequirements"
            value={formData.additionalRequirements}
            onChange={handleChange}
            placeholder="Example: Renter must provide a valid National ID and refundable 2,000 ETB deposit before collecting the generator."
            rows={4}
          />
        </section>

        <section className="listing-form-section">
          <h2>Pickup and Delivery Options</h2>
          <FormSelect
            label="Pickup Options"
            name="pickupOption"
            value={formData.pickupOption}
            onChange={handleChange}
            options={pickupOptions.map((option) => ({
              value: option,
              label: option,
            }))}
          />
          {(formData.pickupOption === "Delivery Available" ||
            formData.pickupOption === "Both") && (
            <div className="row g-3">
              <div className="col-md-4">
                <FormInput
                  label="Delivery Fee"
                  name="deliveryFee"
                  type="number"
                  value={formData.deliveryFee}
                  onChange={handleChange}
                  placeholder="Example: 300"
                />
              </div>
              <div className="col-md-8">
                <FormInput
                  label="Delivery Coverage Area"
                  name="deliveryCoverage"
                  value={formData.deliveryCoverage}
                  onChange={handleChange}
                  placeholder="Example: Jigjiga city center and nearby kebeles"
                />
              </div>
            </div>
          )}
        </section>

        <section className="listing-form-section">
          <h2>Contact Preferences</h2>
          <div className="contact-method-grid">
            {contactMethods.map((method) => (
              <label className="contact-method" key={method}>
                <input
                  type="radio"
                  name="contactPreference"
                  value={method}
                  checked={formData.contactPreference === method}
                  onChange={handleChange}
                />
                <span>{method}</span>
              </label>
            ))}
          </div>
        </section>

        <div className="listing-form-actions">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => finishListing("draft")}
          >
            <i className="bi bi-file-earmark" /> Save Draft
          </button>
          <button type="submit" className="btn btn-accent-custom btn-shine">
            <i className="bi bi-eye" /> Preview Listing
          </button>
        </div>
      </form>
    </main>
  );
}
