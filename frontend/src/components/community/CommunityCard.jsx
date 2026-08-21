import { useNavigate } from 'react-router-dom';
import { resolveAssetUrl } from '../../services/apiClient.js';
import './CommunityCard.css';

/**
 * Premium community card displayed in the feed.
 * Shows cover image, title, category, location, and interaction counters.
 * Clicking the card navigates to the post details page.
 */
export default function CommunityCard({ post }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/community/request/${post.id}`);
  };

  const coverImage = post.media && post.media.length > 0 ? resolveAssetUrl(post.media[0].url) : null;
  const extraCount = post.media && post.media.length > 1 ? post.media.length - 1 : 0;

  return (
    <div className={`community-card ${coverImage ? "has-image" : "no-image"}`} onClick={handleClick} role="button" tabIndex={0}>
      {coverImage && (
        <div className="card-image-wrapper">
          <img src={coverImage} alt={post.title} className="card-image" />
          {extraCount > 0 && (
            <div className="image-counter">+{extraCount}</div>
          )}
        </div>
      )}
      <div className="card-content">
        <div className="card-header">
          <span className={`post-category-badge cat-${post.category}`}>{String(post.category || '').replaceAll('_', ' ')}</span>
        </div>
        <h3 className="card-title">{post.title}</h3>
        <p className="card-description">{post.description}</p>
        <div className="card-meta">
          <span><i className="bi bi-geo-alt" /> {post.city}</span>
          {post.rentalPeriod && (<span><i className="bi bi-clock" /> {post.rentalPeriod}</span>)}
        </div>
        <div className="card-footer">
          <span className="post-date"><i className="bi bi-calendar3" /> {new Date(post.createdAt).toLocaleDateString()}</span>
          <div className="post-actions">
            <button type="button" className="post-action-btn" onClick={(event) => { event.stopPropagation(); handleClick(); }}><i className="bi bi-heart" /> {post.likeCount || 0}</button>
            <button type="button" className="post-action-btn" onClick={(event) => { event.stopPropagation(); handleClick(); }}><i className="bi bi-chat" /> {post.commentCount || 0}</button>
            <button className="post-action-btn"><i className="bi bi-share" /> {post.shares || 0}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
