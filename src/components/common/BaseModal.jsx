export default function BaseModal({
  isOpen,
  title,
  children,
  onClose,
  className = "",
}) {
  if (!isOpen) return null;

  return (
    <div className="review-modal-backdrop">
      <div className={`review-modal-card ${className}`.trim()}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">{title}</h5>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            aria-label="Close modal"
            onClick={onClose}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
