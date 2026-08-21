import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const TABS = [
  { key: "RENTAL_REQUEST", label: "Rental Requests", icon: "bi-search-heart" },
  { key: "COMMUNITY_FEED", label: "Community Feed", icon: "bi-rss" },
  { key: "OWNER_ANNOUNCEMENT", label: "Owner Announcements", icon: "bi-megaphone" },
  { key: "DISCUSSION", label: "Discussions", icon: "bi-chat-dots" },
];

const CITIES = ["Jigjiga", "Harar", "Dire Dawa"];

const NEIGHBOURHOODS = {
  Jigjiga: [
    "Kebele 01","Kebele 02","Kebele 03","Kebele 04","Kebele 05",
    "Kebele 06","Kebele 07","Kebele 08","Kebele 09","Kebele 10",
    "Taiwan Market Area","Stadium Area","Shebele Area","Gode Road Area","Fafan Area",
  ],
  Harar: ["Shenkor","Amir Nur","Aboker","Arategna","Jenela","Hakim","Sofi","Gidir Magala","Piassa"],
  "Dire Dawa": ["Kezira","Sabian","Megala"],
};

const CATEGORIES = [
  "LOOKING_FOR_ITEM","OFFERING_RENTAL","EQUIPMENT_NEEDED","EVENT_PLANNING",
  "BUSINESS_ANNOUNCEMENT","RECOMMENDATION","LOST_FOUND","EMERGENCY_REQUEST",
];

const CATEGORY_LABELS = {
  LOOKING_FOR_ITEM: "Looking for Item",
  OFFERING_RENTAL: "Offering Rental",
  EQUIPMENT_NEEDED: "Equipment Needed",
  EVENT_PLANNING: "Event Planning",
  BUSINESS_ANNOUNCEMENT: "Business Announcement",
  RECOMMENDATION: "Recommendation",
  LOST_FOUND: "Lost & Found",
  EMERGENCY_REQUEST: "Emergency Request",
};

const CATEGORY_ICONS = {
  LOOKING_FOR_ITEM: "bi-search",
  OFFERING_RENTAL: "bi-tag",
  EQUIPMENT_NEEDED: "bi-tools",
  EVENT_PLANNING: "bi-calendar-event",
  BUSINESS_ANNOUNCEMENT: "bi-megaphone",
  RECOMMENDATION: "bi-star",
  LOST_FOUND: "bi-exclamation-triangle",
  EMERGENCY_REQUEST: "bi-lightning-charge",
};

export default function CommunityPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("RENTAL_REQUEST");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCity, setFilterCity] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: "", description: "", category: "LOOKING_FOR_ITEM",
    city: "", neighbourhood: "", rentalPeriod: "", budget: "", tags: "",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [activeTab, filterCity, filterCategory]);

  async function fetchPosts() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: activeTab });
      if (filterCity) params.append("city", filterCity);
      if (filterCategory) params.append("category", filterCategory);
      const res = await fetch(`/api/community?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      } else {
        setPosts([]);
      }
    } catch {
      setPosts([]);
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      console.log('Submitting post to /api/community');
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: activeTab,
          ...form,
          tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : [],
          budget: form.budget ? parseFloat(form.budget) : null,
        }),
      });
      if (res.ok) {
        setFormSuccess('Post created successfully!');
        setForm({ title: '', description: '', category: 'LOOKING_FOR_ITEM', city: '', neighbourhood: '', rentalPeriod: '', budget: '', tags: '' });
        setShowForm(false);
        fetchPosts();
      } else {
        const data = await res.json();
        console.error('Post submission error', res.status, data);
        setFormError(data.error || `Failed to create post (status ${res.status}).`);
      }
    } catch {
      setFormError("Network error. Please try again.");
    }
    setSubmitting(false);
  }

  const tabConfig = TABS.find((t) => t.key === activeTab);

  return (
    <div className="community-page">
      {/* Hero */}
      <div className="community-hero">
        <div className="community-hero-inner container">
          <h1 className="community-hero-title">
            <i className="bi bi-people-fill"></i> EasternCities Community
          </h1>
          <p className="community-hero-sub">
            Connect, request, and share rentals across Jigjiga, Harar &amp; Dire Dawa
          </p>
          {isAuthenticated ? (
            <button className="btn-community-post" onClick={() => setShowForm((v) => !v)}>
              <i className="bi bi-plus-circle"></i> Post a Request
            </button>
          ) : (
            <Link to="/login" className="btn-community-post">
              <i className="bi bi-box-arrow-in-right"></i> Login to Post
            </Link>
          )}
        </div>
      </div>

      <div className="container community-container">
        {/* Tabs */}
        <div className="community-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`community-tab-btn ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => { setActiveTab(tab.key); setShowForm(false); }}
            >
              <i className={`bi ${tab.icon}`}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Create Post Form */}
        {showForm && isAuthenticated && (
          <div className="community-form-card">
            <h3 className="community-form-title">
              <i className={`bi ${tabConfig?.icon}`}></i> New {tabConfig?.label.replace(/s$/, "")}
            </h3>
            {formError && <div className="form-error-alert">{formError}</div>}
            {formSuccess && <div className="form-success-alert">{formSuccess}</div>}
            <form onSubmit={handleSubmit} className="community-form">
              <div className="cf-row">
                <div className="cf-group">
                  <label>Title *</label>
                  <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Looking for Canon DSLR in Jigjiga" />
                </div>
              </div>
              <div className="cf-row">
                <div className="cf-group">
                  <label>Description *</label>
                  <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe what you need in detail..." />
                </div>
              </div>
              <div className="cf-row cf-row-3">
                <div className="cf-group">
                  <label>Category *</label>
                  <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                  </select>
                </div>
                <div className="cf-group">
                  <label>City *</label>
                  <select required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value, neighbourhood: "" })}>