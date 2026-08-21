import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { communityService } from "../../services/communityService.js";
import { resolveAssetUrl } from "../../services/apiClient.js";

const CITIES = ["Jigjiga", "Harar", "Dire Dawa"];

// BUSINESS_ANNOUNCEMENT intentionally excluded from user-facing categories.
const CATEGORIES = [
  { value: "LOOKING_FOR_ITEM", label: "Looking For", icon: "bi-search" },
  { value: "EMERGENCY_REQUEST", label: "Emergency Request", icon: "bi-lightning-charge" },
];

const categoryByValue = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]));
const initialForm = { title: "", description: "", category: "LOOKING_FOR_ITEM", city: "" };

function statusColor(status) {
  switch (String(status).toUpperCase()) {
    case "APPROVED": return "success";
    case "REJECTED": return "danger";
    case "RESOLVED": return "secondary";
    default: return "warning";
  }
}

export default function CommunityPage() {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMine, setShowMine] = useState(false);
  const [filterCity, setFilterCity] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await communityService.getPosts({
        ...(filterCity ? { city: filterCity } : {}),
        ...(filterCategory ? { category: filterCategory } : {}),
        // When showing own posts, pass authorId so backend returns all statuses for the author
        ...(showMine && currentUser?.id ? { authorId: currentUser.id } : {}),
        limit: 24,
      });
      setPosts(response?.posts || response?.data?.posts || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, filterCategory, filterCity, showMine]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const postCountText = useMemo(
    () => posts.length + " post" + (posts.length === 1 ? "" : "s"),
    [posts.length],
  );

  async function submitPost(event) {
    event.preventDefault();
    if (!form.city) { setFeedback("Please select a city."); return; }
    setFeedback("");
    setSubmitting(true);
    const payload = new FormData();
    payload.append("type", "COMMUNITY_FEED");
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    files.slice(0, 5).forEach((file) => payload.append("media", file));
    try {
      await communityService.createPost(payload);
      setForm(initialForm);
      setFiles([]);
      setShowForm(false);
      setFeedback("Your community post was submitted for review. It will appear publicly once approved.");
      loadPosts();
    } catch (error) {
      setFeedback(error?.response?.data?.message || error?.message || "Unable to create post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMarkDone(postId) {
  if (!window.confirm("Mark this post as done? This will change its status to RESOLVED and remove it from the public feed.")) {
    return;
  }
  setResolvingId(postId);
  try {
    await communityService.resolvePost(postId);
    loadPosts();
  } catch {
    // silently fail — backend returns error if not author
  } finally {
    setResolvingId(null);
  }
}

  return (
    <main className="community-page">
      {/* Hero */}
      <section className="community-hero">
        <div className="container community-hero-inner">
          <h1><i className="bi bi-people-fill" /> EasternCities Community</h1>
          <p>Connect around rental needs, local rental services, and urgent marketplace support.</p>
          {isAuthenticated ? (
            <button className="btn-community-post" type="button" onClick={() => setShowForm((open) => !open)}>
              <i className="bi bi-plus-circle" /> Post to Community
            </button>
          ) : (
            <Link className="btn-community-post" to="/login">
              <i className="bi bi-box-arrow-in-right" /> Login to Post
            </Link>
          )}
        </div>
      </section>

      <section className="container community-container">
        {/* Tabs */}
        <div className="community-tabs" role="tablist" aria-label="Community posts">
          <button
            className={showMine ? "community-tab-btn" : "community-tab-btn active"}
            onClick={() => setShowMine(false)}
            type="button"
          >
            <i className="bi bi-people" /> Community Posts
          </button>
          {isAuthenticated && (
            <button
              className={showMine ? "community-tab-btn active" : "community-tab-btn"}
              onClick={() => setShowMine(true)}
              type="button"
            >
              <i className="bi bi-person-lines-fill" /> My Posts
            </button>
          )}
        </div>

        {/* New Post Form */}
        {showForm && isAuthenticated && (
          <section className="community-form-card">
            <h2><i className="bi bi-plus-circle" /> New Community Post</h2>
            <p>Use Community for rental-related requests or urgent service needs in Eastern Ethiopia.</p>
            <form className="community-form" onSubmit={submitPost}>
              <label>
                Title *
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Urgent: Water tanker needed in Harar"
                />
              </label>
              <label>
                Description *
                <textarea
                  required
                  rows="4"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe what you need, availability, and how to reach you."
                />
              </label>
              <div className="community-form-row">
                <label>
                  Category *
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  City *
                  <select required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
                    <option value="">Select city</option>
                    {CITIES.map((city) => <option key={city}>{city}</option>)}
                  </select>
                </label>
                <label>
                  Images (optional, up to 5)
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 5))}
                  />
                </label>
              </div>
              <div className="community-form-actions">
                <button className="btn btn-outline-secondary" type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button className="btn-community-submit" type="submit" disabled={submitting}>
                  {submitting ? "Posting..." : "Post"}
                </button>
              </div>
            </form>
          </section>
        )}

        {feedback && <div className="community-feedback" role="status">{feedback}</div>}

        {/* Filters */}
        {!showMine && (
          <div className="community-filters">
            <div>
              <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)}>
                <option value="">All Cities</option>
                {CITIES.map((city) => <option key={city}>{city}</option>)}
              </select>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <span>{loading ? "Loading..." : postCountText}</span>
          </div>
        )}

        {/* Posts grid */}
        <div className="community-posts-grid">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <div className="community-post-skeleton" key={i} />)
          ) : posts.length === 0 ? (
            <div className="community-empty">
              <i className="bi bi-inbox" />
              <p>
                {showMine
                  ? "You haven't posted anything yet."
                  : "No approved community posts found."}
              </p>
              {isAuthenticated && (
                <button type="button" className="btn-community-post small" onClick={() => setShowForm(true)}>
                  Create the first post
                </button>
              )}
            </div>
          ) : (
            posts.map((post) => {
              const cat = categoryByValue[post.category] || {
                label: String(post.category || "Community").replaceAll("_", " "),
                icon: "bi-tag",
              };
              const image = post.media?.[0]?.url ? resolveAssetUrl(post.media[0].url) : "";
              const postStatus = String(post.status || "").toUpperCase();

              return (
                <article
                  className={"community-post-card " + (image ? "has-image" : "no-image")}
                  key={post.id}
                  onClick={() => navigate("/community/request/" + post.id)}
                  style={{ cursor: "pointer" }}
                >
                  {image && (
                    <img
                      className="community-post-image"
                      src={image}
                      alt=""
                      loading="lazy"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  )}
                  <div className="community-post-body">
                    <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                      <span className="post-category-badge">
                        <i className={"bi " + cat.icon} /> {cat.label}
                      </span>
                      {/* Show status badge in "My Posts" tab */}
                      {showMine && postStatus && (
                        <span className={`badge bg-${statusColor(postStatus)}`} style={{ fontSize: "0.7rem" }}>
                          {postStatus === "PENDING" ? "PENDING REVIEW" : postStatus}
                        </span>
                      )}
                    </div>
                    <h3>{post.title}</h3>
                    <p>{post.description}</p>
                    <div className="post-card-meta">
                      <span><i className="bi bi-geo-alt" /> {post.city}</span>
                    </div>
                    <footer>
                      <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}</span>
                      <span>
                        <i className="bi bi-heart" /> {post.likeCount || 0}
                        <i className="bi bi-chat ms-2" /> {post.commentCount || 0}
                      </span>
                    </footer>

                    {/* Mark as Done button removed from list view; it now only appears on the post details page. */}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
