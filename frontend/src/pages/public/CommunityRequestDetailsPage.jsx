import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { communityService } from "../../services/communityService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { resolveAssetUrl } from "../../services/apiClient.js";
import { createConversation, sendMessage } from "../../services/messageApiService.js";
import "./CommunityRequestDetailsPage.css";

export default function CommunityRequestDetailsPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, currentUser } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setCurrentImgIdx(0);
    setImgFailed(false);
    let cancelled = false;
    async function fetchPost() {
      try {
        const data = await communityService.getPost(postId);
        if (!cancelled) {
          setPost(data && data.post ? data.post : data);
          const viewKey = "community-viewed-" + postId;
          if (!sessionStorage.getItem(viewKey)) {
            communityService.incrementViews(postId)
              .then(() => sessionStorage.setItem(viewKey, "1"))
              .catch(() => {});
          }
        }
      } catch (e) {
        console.error("Community post fetch error:", e);
        if (!cancelled) setError("Failed to load post.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPost();
    return () => { cancelled = true; };
  }, [postId]);

  const viewer = user || currentUser;
  const hasLiked = Boolean(post && post.userLiked);
  const isSaved  = Boolean(post && post.saved);
  const isAuthor = Boolean(viewer && post && viewer.id === (post.author && post.author.id));

  function getImgUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== "string") return null;
    if (/^(https?:|blob:|data:)/i.test(rawUrl)) return rawUrl;
    return resolveAssetUrl(rawUrl);
  }

  async function handleLike() {
    if (!isAuthenticated) return navigate("/login");
    try {
      if (hasLiked) {
        await communityService.unlikePost(postId);
        setPost(prev => ({ ...prev, userLiked: false, likeCount: Math.max((prev.likeCount || 0) - 1, 0) }));
      } else {
        await communityService.likePost(postId);
        setPost(prev => ({ ...prev, userLiked: true, likeCount: (prev.likeCount || 0) + 1 }));
      }
    } catch (e) { console.error(e); }
  }

  async function handleSave() {
    if (!isAuthenticated) return navigate("/login");
    try {
      if (isSaved) {
        await communityService.unsavePost(postId);
        setPost(prev => ({ ...prev, saved: false }));
      } else {
        await communityService.savePost(postId);
        setPost(prev => ({ ...prev, saved: true }));
      }
    } catch (e) { console.error(e); }
  }

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: post ? post.title : "", url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied!");
      }
      communityService.incrementShares(postId).catch(() => {});
    } catch (e) { console.error("Share failed", e); }
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await communityService.addComment(postId, newComment.trim());
      const updated = await communityService.getPost(postId);
      setPost(updated && updated.post ? updated.post : updated);
      setNewComment("");
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  }

  async function startConversation() {
    if (!isAuthenticated) return navigate("/login");
    if (!post || !post.author || !post.author.id) return;
    if (post.author.id === (viewer && viewer.id)) return;
    try {
      const conversation = await createConversation({ participantTwoId: post.author.id });
      if (conversation && conversation.isNew) {
        await sendMessage({
          conversationId: conversation.id,
          body: "Hello " + (post.author.name || "") + ", I am interested in your community request: " + (post.title || "") + "."
        });
      }
      navigate("/messages" + (conversation && conversation.id ? "?conversation=" + conversation.id : ""));
    } catch (err) {
      setError(err.message || "Unable to open a conversation right now.");
    }
  }

  async function markCompleted() {
    if (!window.confirm("Mark this request as completed? It will be archived.")) return;
    try {
      await communityService.resolvePost(post.id);
      setPost(prev => ({ ...prev, status: "RESOLVED" }));
    } catch (err) {
      setError(err.message || "Unable to archive this request.");
    }
  }

  function nextImage() {
    if (!post || !Array.isArray(post.media) || post.media.length === 0) return;
    setCurrentImgIdx(i => (i + 1) % post.media.length);
    setImgFailed(false);
  }

  function prevImage() {
    if (!post || !Array.isArray(post.media) || post.media.length === 0) return;
    setCurrentImgIdx(i => (i - 1 + post.media.length) % post.media.length);
    setImgFailed(false);
  }

  if (loading) {
    return (
      <div className="cdp-page">
        <div className="cdp-card">
          <div className="cdp-inner" style={{ textAlign: "center", color: "#888", padding: "60px 32px" }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cdp-page">
        <div className="cdp-card">
          <div className="cdp-inner" style={{ textAlign: "center", padding: "60px 32px" }}>
            <p style={{ color: "#c0392b", marginBottom: "16px" }}>{error}</p>
            <button className="cdp-btn cdp-btn-outline" onClick={() => navigate(-1)}>Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  const authorName  = (post.author && post.author.name) ? post.author.name : "EasternCities member";
  const authorCity  = post.city || "";
  const authorInit  = authorName.charAt(0).toUpperCase();
  const avatarUrl   = getImgUrl(post.author && post.author.profileImageUrl);

  const media       = Array.isArray(post.media) ? post.media : [];
  const hasMedia    = media.length > 0;
  const currentItem = hasMedia ? media[Math.min(currentImgIdx, media.length - 1)] : null;
  const currentSrc  = currentItem ? getImgUrl(currentItem.url || currentItem.imageUrl || currentItem.path) : null;

  const comments    = Array.isArray(post.comments) ? post.comments : [];
  const category    = post.category ? String(post.category).replace(/_/g, " ") : "";

  return (
    <div className="cdp-page">
      <div className="cdp-card">
        <div className="cdp-inner">

          {/* Back */}
          <button className="cdp-back" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left" /> Back
          </button>

          {/* Title */}
          <h1 className="cdp-title">{post.title || "Community Post"}</h1>

          {/* Meta */}
          <div className="cdp-meta">
            {authorCity && (
              <span className="cdp-meta-item">
                <i className="bi bi-geo-alt-fill" /> {authorCity}
              </span>
            )}
            {post.rentalPeriod && (
              <span className="cdp-meta-item">
                <i className="bi bi-clock" /> {post.rentalPeriod}
              </span>
            )}
            {post.status === "RESOLVED" && (
              <span className="cdp-resolved-badge">
                <i className="bi bi-check-circle-fill" /> Resolved
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="cdp-actions">
            <button
              className={"cdp-btn " + (hasLiked ? "cdp-btn-active" : "cdp-btn-outline")}
              onClick={handleLike}
            >
              <i className={"bi " + (hasLiked ? "bi-heart-fill" : "bi-heart")} />
              {post.likeCount || 0}
            </button>
            <button
              className={"cdp-btn " + (isSaved ? "cdp-btn-active" : "cdp-btn-outline")}
              onClick={handleSave}
            >
              <i className={"bi " + (isSaved ? "bi-bookmark-fill" : "bi-bookmark")} />
              {isSaved ? "Saved" : "Save"}
            </button>
            <button className="cdp-btn cdp-btn-outline" onClick={handleShare}>
              <i className="bi bi-share" /> Share
            </button>
          </div>

          {/* Divider */}
          <hr className="cdp-divider" />

          {/* Author */}
          <div className="cdp-author">
            <div className="cdp-avatar">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={authorName}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              ) : (
                <span>{authorInit}</span>
              )}
            </div>
            <div className="cdp-author-info">
              <div className="cdp-author-label">Posted by</div>
              <div className="cdp-author-name">{authorName}</div>
              {authorCity ? <div className="cdp-author-city">{authorCity}</div> : null}
            </div>
          </div>

          {/* Owner actions */}
          {isAuthor ? (
            <div className="cdp-owner-actions">
              <button className="cdp-btn cdp-btn-secondary" onClick={() => navigate("/messages")}>
                <i className="bi bi-inbox" /> View Inbox
              </button>
              {post.status !== "RESOLVED" ? (
                <button className="cdp-btn cdp-btn-success" onClick={markCompleted}>
                  <i className="bi bi-check2-circle" /> Mark as Done
                </button>
              ) : null}
            </div>
          ) : (
            isAuthenticated && post.author && post.author.id ? (
              <div className="cdp-owner-actions">
                <button className="cdp-btn cdp-btn-outline" onClick={startConversation}>
                  <i className="bi bi-chat-dots" /> Contact Poster
                </button>
              </div>
            ) : null
          )}

          {/* Gallery */}
          {hasMedia && currentSrc && !imgFailed ? (
            <div className="cdp-gallery">
              <div className="cdp-gallery-img-wrap">
                <img
                  src={currentSrc}
                  alt="Post image"
                  onError={() => setImgFailed(true)}
                />
              </div>
              {media.length > 1 ? (
                <>
                  <button className="cdp-gallery-nav cdp-gallery-nav-prev" onClick={prevImage} aria-label="Previous">
                    <i className="bi bi-chevron-left" />
                  </button>
                  <button className="cdp-gallery-nav cdp-gallery-nav-next" onClick={nextImage} aria-label="Next">
                    <i className="bi bi-chevron-right" />
                  </button>
                  <div className="cdp-gallery-dots">
                    {media.map((_, idx) => (
                      <button
                        key={idx}
                        className={"cdp-gallery-dot" + (idx === currentImgIdx ? " active" : "")}
                        onClick={() => { setCurrentImgIdx(idx); setImgFailed(false); }}
                        aria-label={"Image " + (idx + 1)}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          ) : null}

          {/* Description */}
          <div style={{ marginBottom: "24px" }}>
            <h2 className="cdp-section-heading">Description</h2>
            <p className="cdp-description">{post.description || "No description provided."}</p>
          </div>

          {/* Tags */}
          <div className="cdp-tags">
            {category ? (
              <span className="cdp-tag">
                <i className="bi bi-tag" /> {category}
              </span>
            ) : null}
            <span className="cdp-tag">
              <i className="bi bi-eye" /> {post.views || 0} views
            </span>
          </div>

          {/* Comments */}
          <div className="cdp-comments-section">
            <h2 className="cdp-section-heading">
              Comments ({comments.length})
            </h2>

            {comments.length > 0 ? (
              comments.map((c) => (
                <div key={c.id || Math.random()} className="cdp-comment-item">
                  <div className="cdp-comment-header">
                    <span className="cdp-comment-author">
                      {(c.author && c.author.name) ? c.author.name : "Anonymous"}
                    </span>
                    <span className="cdp-comment-date">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <p className="cdp-comment-body">{c.content || ""}</p>
                </div>
              ))
            ) : (
              <div className="cdp-comments-empty">
                <i className="bi bi-chat-left" />
                <span>No comments yet. Be the first to comment!</span>
              </div>
            )}

            {isAuthenticated ? (
              <form className="cdp-comment-form" onSubmit={submitComment}>
                <textarea
                  className="cdp-comment-textarea"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  required
                />
                <div className="cdp-comment-submit">
                  <button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className="cdp-btn cdp-btn-active"
                  >
                    {submitting ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="cdp-login-prompt">
                Please{" "}
                <button type="button" onClick={() => navigate("/login")}>
                  login
                </button>{" "}
                to leave a comment.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}