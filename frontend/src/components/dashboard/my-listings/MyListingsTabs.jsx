const tabs = [
  { key: "all", label: "All Listings" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "requests", label: "Booking Requests" },
  { key: "promotions", label: "Promotion Requests" },
];

export default function MyListingsTabs({ activeTab, onChange }) {
  return (
    <div className="d-flex gap-2 mb-4 overflow-auto pb-2 border-bottom details-tab-system">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`btn rounded-pill fw-bold px-4 filter-tab ${activeTab === tab.key ? "active" : ""}`}
          onClick={() => onChange(tab.key)}
          style={{ transition: "all 0.2s ease", whiteSpace: "nowrap" }}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
