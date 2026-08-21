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
                    <option value="">Select City</option>
                    {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="cf-group">
                  <label>Neighbourhood *</label>
                  <select required value={form.neighbourhood} onChange={(e) => setForm({ ...form, neighbourhood: e.target.value })} disabled={!form.city}>
                    <option value="">Select Neighbourhood</option>
                    {(NEIGHBOURHOODS[form.city] || []).map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div className="cf-row cf-row-3">
                <div className="cf-group">
                  <label>Rental Period</label>
                  <input value={form.rentalPeriod} onChange={(e) => setForm({ ...form, rentalPeriod: e.target.value })} placeholder="e.g. 3 days, 1 week" />
                </div>
                <div className="cf-group">
                  <label>Budget (ETB)</label>
                  <input type="number" min="0" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="e.g. 500" />
                </div>
                <div className="cf-group">
                  <label>Tags (comma-separated)</label>
                  <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="camera, dslr, photography" />
                </div>
              </div>
              <div className="cf-actions">
                <button type="button" className="btn-cf-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-cf-submit" disabled={submitting}>
                  {submitting ? <><i className="bi bi-hourglass-split"></i> Posting...</> : <><i className="bi bi-send"></i> Post</>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="community-filters">
          <div className="community-filter-group">
            <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)}>
              <option value="">All Cities</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
          </div>
          <span className="community-count">
            {loading ? "Loading..." : `${posts.length} post${posts.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        {/* Posts */}
        <div className="community-posts-grid">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="community-post-skeleton">
                <div className="skeleton-line skeleton-title"></div>
                <div className="skeleton-line skeleton-body"></div>
                <div className="skeleton-line skeleton-body short"></div>
                <div className="skeleton-meta"></div>
              </div>
            ))
          ) : posts.length === 0 ? (
            <div className="community-empty">
              <i className="bi bi-inbox community-empty-icon"></i>
              <p>No posts yet in this section.</p>
              {isAuthenticated && (
                <button className="btn-community-post small" onClick={() => setShowForm(true)}>
                  <i className="bi bi-plus-circle"></i> Be the first to post
                </button>
              )}
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="community-post-card">
                <div className="post-card-header">
                  <span className={`post-category-badge cat-${post.category}`}>
                    <i className={`bi ${CATEGORY_ICONS[post.category] || "bi-tag"}`}></i>
                    {CATEGORY_LABELS[post.category] || post.category}
                  </span>
                  <span className={`post-status-badge status-${post.status?.toLowerCase()}`}>{post.status}</span>
                </div>
                <h3 className="post-card-title">{post.title}</h3>
                <p className="post-card-desc">{post.description}</p>
                <div className="post-card-meta">
                  <span><i className="bi bi-geo-alt"></i> {post.city} – {post.neighbourhood}</span>
                  {post.rentalPeriod && <span><i className="bi bi-clock"></i> {post.rentalPeriod}</span>}
                  {post.budget && <span><i className="bi bi-cash"></i> ETB {post.budget}</span>}
                </div>
                {post.tags?.length > 0 && (
                  <div className="post-card-tags">
                    {post.tags.map((tag) => <span key={tag} className="post-tag">#{tag}</span>)}
                  </div>
                )}
                <div className="post-card-footer">
                  <span className="post-date"><i className="bi bi-calendar3"></i> {new Date(post.createdAt).toLocaleDateString()}</span>
                  <div className="post-actions">
                    <button className="post-action-btn"><i className="bi bi-heart"></i> {post.likes?.length || 0}</button>
                    <button className="post-action-btn"><i className="bi bi-chat"></i> {post.comments?.length || 0}</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .community-page { min-height: 100vh; background: var(--bg-primary, #f8f9fa); }

        .community-hero {
          background: linear-gradient(135deg, #c0392b 0%, #8e1a10 60%, #1a0a08 100%);
          padding: 60px 0 50px;
          color: #fff;
        }
        .community-hero-inner { text-align: center; }
        .community-hero-title { font-size: 2.4rem; font-weight: 800; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; gap: 14px; }
        .community-hero-sub { font-size: 1.1rem; opacity: 0.85; margin-bottom: 28px; }

        .btn-community-post {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; color: #c0392b; border: none;
          padding: 12px 28px; border-radius: 50px; font-weight: 700; font-size: 1rem;
          cursor: pointer; text-decoration: none; transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
        .btn-community-post:hover { background: #fff3f0; transform: translateY(-2px); }
        .btn-community-post.small { font-size: 0.9rem; padding: 9px 20px; margin-top: 12px; }

        .community-container { padding-top: 32px; padding-bottom: 60px; }

        .community-tabs {
          display: flex; gap: 4px; background: var(--bg-card, #fff);
          border-radius: 14px; padding: 6px; margin-bottom: 24px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.07); flex-wrap: wrap;
        }
        .community-tab-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 16px; border: none; border-radius: 10px; background: transparent;
          color: var(--text-secondary, #666); font-weight: 600; font-size: 0.9rem; cursor: pointer;
          transition: all 0.2s; white-space: nowrap;
        }
        .community-tab-btn.active { background: #c0392b; color: #fff; box-shadow: 0 2px 10px rgba(192,57,43,0.3); }
        .community-tab-btn:hover:not(.active) { background: #fff3f0; color: #c0392b; }

        .community-form-card {
          background: var(--bg-card, #fff); border-radius: 16px; padding: 28px;
          margin-bottom: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          border-left: 4px solid #c0392b;
        }
        .community-form-title { font-size: 1.2rem; font-weight: 700; color: #c0392b; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
        .community-form { display: flex; flex-direction: column; gap: 16px; }
        .cf-row { display: flex; gap: 16px; }
        .cf-row-3 > .cf-group { flex: 1; }
        .cf-group { display: flex; flex-direction: column; gap: 6px; flex: 1; }
        .cf-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary, #555); }
        .cf-group input, .cf-group select, .cf-group textarea {
          padding: 10px 14px; border: 1.5px solid var(--border-color, #e0e0e0);
          border-radius: 8px; font-size: 0.95rem; background: var(--bg-input, #f9f9f9);
          color: var(--text-primary, #222); transition: border 0.2s;
          font-family: inherit;
        }
        .cf-group input:focus, .cf-group select:focus, .cf-group textarea:focus {
          outline: none; border-color: #c0392b; background: var(--bg-primary, #fff);
        }
        .cf-group textarea { resize: vertical; }
        .cf-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 4px; }
        .btn-cf-cancel {
          padding: 10px 24px; border: 1.5px solid var(--border-color, #ddd);
          border-radius: 8px; background: transparent; color: var(--text-secondary, #666);
          font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .btn-cf-cancel:hover { background: var(--bg-hover, #f5f5f5); }
        .btn-cf-submit {
          padding: 10px 28px; background: #c0392b; color: #fff;
          border: none; border-radius: 8px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; gap: 8px; transition: all 0.2s;
        }
        .btn-cf-submit:hover:not(:disabled) { background: #a93226; }
        .btn-cf-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .form-error-alert { background: #fef2f2; color: #c0392b; border: 1px solid #fca5a5; padding: 10px 16px; border-radius: 8px; margin-bottom: 8px; font-size: 0.9rem; }
        .form-success-alert { background: #f0fdf4; color: #16a34a; border: 1px solid #86efac; padding: 10px 16px; border-radius: 8px; margin-bottom: 8px; font-size: 0.9rem; }

        .community-filters {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
        }
        .community-filter-group { display: flex; gap: 10px; flex-wrap: wrap; }
        .community-filter-group select {
          padding: 9px 16px; border: 1.5px solid var(--border-color, #e0e0e0);
          border-radius: 8px; background: var(--bg-card, #fff); color: var(--text-primary, #222);
          font-size: 0.9rem; cursor: pointer; transition: border 0.2s;
        }
        .community-filter-group select:focus { outline: none; border-color: #c0392b; }
        .community-count { font-size: 0.9rem; color: var(--text-secondary, #888); font-weight: 600; }

        .community-posts-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .community-post-card {
          background: var(--bg-card, #fff); border-radius: 14px; padding: 22px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.07); transition: all 0.25s;
          border: 1.5px solid transparent; cursor: pointer;
        }
        .community-post-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(0,0,0,0.12); border-color: #c0392b22; }

        .post-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .post-category-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 700;
          background: #fff3f0; color: #c0392b;
        }
        .post-status-badge { font-size: 0.75rem; font-weight: 600; padding: 3px 10px; border-radius: 20px; background: #f0fdf4; color: #16a34a; }
        .post-status-badge.status-pending { background: #fffbeb; color: #d97706; }
        .post-status-badge.status-resolved { background: #f0fdf4; color: #16a34a; }
        .post-status-badge.status-expired { background: #fef2f2; color: #dc2626; }

        .post-card-title { font-size: 1.05rem; font-weight: 700; color: var(--text-primary, #1a1a1a); margin-bottom: 8px; line-height: 1.4; }
        .post-card-desc { font-size: 0.9rem; color: var(--text-secondary, #555); line-height: 1.6; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .post-card-meta { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 10px; }
        .post-card-meta span { font-size: 0.82rem; color: var(--text-secondary, #666); display: flex; align-items: center; gap: 4px; }
        .post-card-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
        .post-tag { background: var(--bg-hover, #f0f4ff); color: #3b5bdb; font-size: 0.77rem; font-weight: 600; padding: 3px 10px; border-radius: 20px; }

        .post-card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid var(--border-color, #f0f0f0); }
        .post-date { font-size: 0.8rem; color: var(--text-secondary, #aaa); display: flex; align-items: center; gap: 5px; }
        .post-actions { display: flex; gap: 8px; }
        .post-action-btn { display: flex; align-items: center; gap: 5px; background: var(--bg-hover, #f5f5f5); border: none; padding: 5px 12px; border-radius: 20px; font-size: 0.82rem; color: var(--text-secondary, #666); cursor: pointer; transition: all 0.2s; }
        .post-action-btn:hover { background: #fff3f0; color: #c0392b; }

        .community-empty { grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-secondary, #aaa); }
        .community-empty-icon { font-size: 3.5rem; display: block; margin-bottom: 16px; }
        .community-empty p { font-size: 1.1rem; }

        .community-post-skeleton { background: var(--bg-card, #fff); border-radius: 14px; padding: 22px; animation: pulse 1.5s infinite; }
        .skeleton-line { background: var(--bg-hover, #f0f0f0); border-radius: 6px; margin-bottom: 10px; }
        .skeleton-title { height: 20px; width: 70%; }
        .skeleton-body { height: 14px; width: 90%; }
        .skeleton-body.short { width: 55%; }
        .skeleton-meta { height: 12px; width: 40%; background: var(--bg-hover, #f0f0f0); border-radius: 6px; margin-top: 16px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

        @media (max-width: 768px) {
          .community-hero-title { font-size: 1.6rem; }
          .community-tab-btn span { display: none; }
          .community-tab-btn { padding: 12px; }
          .cf-row, .cf-row-3 { flex-direction: column; }
          .community-posts-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
