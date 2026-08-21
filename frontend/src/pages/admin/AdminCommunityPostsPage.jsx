import { useState, useEffect, useCallback } from "react";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { adminApi, formatDate } from "../../services/adminManagementService.js";
import { resolveAssetUrl } from "../../services/apiClient.js";

const STATUS_FILTERS = ["all", "PENDING", "APPROVED", "REJECTED", "RESOLVED"];
const CATEGORY_LABELS = {
  LOOKING_FOR_ITEM: "Looking For",
  EMERGENCY_REQUEST: "Emergency Request",
  OFFERING_RENTAL: "Offering Rental",
  EQUIPMENT_NEEDED: "Equipment Needed",
  EVENT_PLANNING: "Event Planning",
  RECOMMENDATION: "Recommendation",
  LOST_FOUND: "Lost & Found",
};

function ViewModal({ post, onClose }) {
  if (!post) return null;
  const image = post.media?.[0]?.url ? resolveAssetUrl(post.media[0].url) : null;
  return (
    <div
      className="modal fade show"
      style={{ display: "block", background: "rgba(0,0,0,0.55)", zIndex: 9999, position: "fixed", top: 0, left: 0, width: "100%", height: "100%" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-people-fill me-2 text-primary" />
              Community Post #{post.id}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            {image && (
              <img
                src={image}
                alt="Post media"
                className="img-fluid rounded mb-3"
                style={{ maxHeight: 280, width: "100%", objectFit: "cover" }}
              />
            )}
            <div className="d-flex flex-wrap gap-2 mb-3">
              <span className="badge bg-secondary">{CATEGORY_LABELS[post.category] || post.category}</span>
              <span className="badge bg-info text-dark">{post.city}</span>
              <StatusBadge status={post.status} />
              {post.media?.length > 0 ? (
                <span className="badge bg-success"><i className="bi bi-image me-1" />Has Image</span>
              ) : (
                <span className="badge bg-light text-muted border"><i className="bi bi-image me-1" />No Image</span>
              )}
            </div>
            <h4 className="mb-2">{post.title}</h4>
            <p className="text-muted mb-4" style={{ lineHeight: 1.7 }}>{post.description}</p>
            <div className="row g-3 border-top pt-3">
              <div className="col-sm-6">
                <small className="text-muted d-block">Author</small>
                <strong>{post.author?.name || "—"}</strong>
              </div>
              <div className="col-sm-6">
                <small className="text-muted d-block">Author Email</small>
                <strong>{post.author?.email || "—"}</strong>
              </div>
              <div className="col-sm-6">
                <small className="text-muted d-block">Submitted</small>
                <strong>{formatDate(post.createdAt)}</strong>
              </div>
              <div className="col-sm-6">
                <small className="text-muted d-block">Type</small>
                <strong>{post.type}</strong>
              </div>
              <div className="col-sm-6">
                <small className="text-muted d-block">Comments</small>
                <strong>{post._count?.comments ?? 0}</strong>
              </div>
              <div className="col-sm-6">
                <small className="text-muted d-block">Likes</small>
                <strong>{post._count?.likes ?? 0}</strong>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminCommunityPostsPage() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("PENDING");
  const [notice, setNotice] = useState({ text: "", type: "warning" });
  const [isLoading, setIsLoading] = useState(true);
  const [viewPost, setViewPost] = useState(null);
  const [deletePost, setDeletePost] = useState(null);
  const [actionId, setActionId] = useState(null);

  const refreshPosts = useCallback(async () => {
    setIsLoading(true);
    setNotice({ text: "", type: "warning" });
    try {
      const data = await adminApi.communityPosts({
        search: search || undefined,
        status: filter === "all" ? undefined : filter,
      });
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      setNotice({ text: error.response?.data?.message || "Failed to load community posts.", type: "danger" });
    } finally {
      setIsLoading(false);
    }
  }, [search, filter]);

  useEffect(() => { refreshPosts(); }, [refreshPosts]);

  const handleStatusChange = async (id, newStatus) => {
    setActionId(id);
    try {
      await adminApi.updateCommunityPost(id, { status: newStatus });
      setNotice({ text: `Post #${id} updated to ${newStatus}.`, type: "success" });
      await refreshPosts();
      // If viewing this post, close the modal
      if (viewPost?.id === id) setViewPost(null);
    } catch (error) {
      setNotice({ text: error.response?.data?.message || "Failed to update post.", type: "danger" });
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletePost) return;
    setActionId(deletePost.id);
    try {
      await adminApi.deleteCommunityPost(deletePost.id);
      setNotice({ text: `Post #${deletePost.id} deleted successfully.`, type: "success" });
      setDeletePost(null);
      await refreshPosts();
    } catch (error) {
      setNotice({ text: error.response?.data?.message || "Failed to delete post.", type: "danger" });
    } finally {
      setActionId(null);
    }
  };

  const pendingCount = posts.filter((p) => String(p.status).toUpperCase() === "PENDING").length;

  return (
    <main className="dashboard-content">
      {viewPost && <ViewModal post={viewPost} onClose={() => setViewPost(null)} />}
      
      {deletePost && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.55)", zIndex: 9999, position: "fixed", top: 0, left: 0, width: "100%", height: "100%" }}
          onClick={(e) => e.target === e.currentTarget && setDeletePost(null)}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger"><i className="bi bi-exclamation-triangle-fill me-2" />Confirm Deletion</h5>
                <button type="button" className="btn-close" onClick={() => setDeletePost(null)} />
              </div>
              <div className="modal-body">
                <p>Are you sure you want to permanently delete community post <strong>#{deletePost.id} ({deletePost.title})</strong>?</p>
                <p className="text-muted small">This is a moderative action and will permanently remove this post from the database along with all its media and comments. This cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setDeletePost(null)}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={actionId === deletePost.id}>
                  {actionId === deletePost.id ? <span className="spinner-border spinner-border-sm" /> : <><i className="bi bi-trash me-1" />Delete Permanently</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <span className="section-label">ADMIN</span>
          <h1 className="h3 mb-1">Community Management</h1>
          <p className="text-muted mb-0">Review, approve, or reject community posts submitted by users.</p>
        </div>
        {pendingCount > 0 && (
          <span className="badge bg-warning text-dark fs-6 px-3 py-2 align-self-center">
            <i className="bi bi-clock me-1" />{pendingCount} pending review
          </span>
        )}
      </div>

      {notice.text && (
        <div className={`alert alert-${notice.type} alert-dismissible`} role="alert">
          {notice.text}
          <button type="button" className="btn-close" onClick={() => setNotice({ text: "", type: "warning" })} />
        </div>
      )}

      <div className="admin-table-container">
        {/* Filters */}
        <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
          <div className="d-flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`btn btn-sm ${filter === opt ? "btn-accent-custom" : "btn-outline-secondary"}`}
                onClick={() => setFilter(opt)}
              >
                {opt === "all" ? "All" : opt.charAt(0) + opt.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div style={{ maxWidth: 280, width: "100%" }}>
            <input
              type="text"
              placeholder="Search by title or description..."
              className="form-control form-control-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Category</th>
                <th>City</th>
                <th>Author</th>
                <th>Email</th>
                <th>Submitted</th>
                <th>Image</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-secondary me-2" />
                    Loading posts...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center text-muted py-5">
                    <i className="bi bi-inbox fs-3 d-block mb-2" />
                    No community posts found matching your criteria.
                  </td>
                </tr>
              ) : (
                posts.map((item) => {
                  const status = String(item.status || "PENDING").toUpperCase();
                  const hasImage = (item.media?.length ?? 0) > 0;
                  const isActing = actionId === item.id;
                  return (
                    <tr key={item.id}>
                      <td className="text-muted small">{item.id}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-start fw-semibold"
                          style={{ textDecoration: "none", color: "inherit" }}
                          onClick={() => setViewPost(item)}
                        >
                          {item.title}
                        </button>
                      </td>
                      <td>
                        <span className="badge bg-secondary">
                          {CATEGORY_LABELS[item.category] || item.category}
                        </span>
                      </td>
                      <td>{item.city}</td>
                      <td>{item.author?.name || "—"}</td>
                      <td>
                        <small className="text-muted">{item.author?.email || "—"}</small>
                      </td>
                      <td>
                        <small>{formatDate(item.createdAt)}</small>
                      </td>
                      <td className="text-center">
                        {hasImage ? (
                          <img src={resolveAssetUrl(item.media?.[0]?.url)} alt="Post" style={{ maxHeight: "40px", objectFit: "cover" }} />
                        ) : (
                          <i className="bi bi-image text-muted fs-5 opacity-25" title="No image" />
                        )}
                      </td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          {/* View */}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setViewPost(item)}
                            disabled={isActing}
                            title="View details"
                          >
                            <i className="bi bi-eye" />
                          </button>

                          {/* Approve */}
                          {["PENDING", "REJECTED"].includes(status) && (
                            <button
                              type="button"
                              className="btn btn-sm btn-success"
                              onClick={() => handleStatusChange(item.id, "APPROVED")}
                              disabled={isActing}
                              title="Approve post"
                            >
                              {isActing ? <span className="spinner-border spinner-border-sm" /> : <><i className="bi bi-check-lg me-1" />Approve</>}
                            </button>
                          )}

                          {/* Reject */}
                          {["PENDING", "APPROVED"].includes(status) && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleStatusChange(item.id, "REJECTED")}
                              disabled={isActing}
                              title="Reject post"
                            >
                              {isActing ? <span className="spinner-border spinner-border-sm" /> : <><i className="bi bi-x-lg me-1" />Reject</>}
                            </button>
                          )}

                          {/* Mark as Done (RESOLVED) */}
                          {status === "APPROVED" && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleStatusChange(item.id, "RESOLVED")}
                              disabled={isActing}
                              title="Mark as resolved/done"
                            >
                              <i className="bi bi-check2-all me-1" />Done
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            type="button"
                            className="btn btn-sm btn-danger ms-2"
                            onClick={() => setDeletePost(item)}
                            disabled={isActing}
                            title="Delete post permanently"
                          >
                            <i className="bi bi-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        {!isLoading && posts.length > 0 && (
          <p className="text-muted small mt-2">
            Showing {posts.length} post{posts.length !== 1 ? "s" : ""}.
          </p>
        )}
      </div>
    </main>
  );
}
