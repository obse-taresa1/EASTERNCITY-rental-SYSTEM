# Community Page & Details Page Overhaul

**Goal**: Transform the public Community page into a modern, Facebook‑Marketplace‑style rental‑request marketplace with image uploads, rich post cards, a dedicated post‑details page, and full social interactions (views, shares, likes, comments, saves). All data is stored in the database via the newly added Prisma fields.

## User Review Required

> [!IMPORTANT]
> The frontend will introduce new routes, components, and CSS. Review the proposed component hierarchy and routing changes before we merge them.

## Open Questions

> [!WARNING]
> 1. **Image upload limit** – Do we cap uploads at 5 images per post? (default: 5)\n> 2. **Comment pagination** – Preferred page size (default: 20).\n> 3. **Share handling** – Use native `navigator.share` when available, otherwise copy URL to clipboard?\n> 4. **UI theme** – Should we keep the existing dark/light theme or adopt a new premium palette? (suggestion: dark background with accent teal).\n> 5. **Authorization** – All interaction endpoints require the user to be logged in. Is the existing `authenticate` middleware sufficient for the new routes?

## Proposed Changes

---
### Frontend Services

#### [NEW] `frontend/src/services/communityService.js`
- Wrapper functions that call the new backend endpoints via `apiClient`:
  - `getPosts(params)` – list posts with optional filters.
  - `getPost(id)` – fetch a single post with media, likes, comments.
  - `incrementViews(id)`
  - `incrementShares(id)`
  - `likePost(id)`, `unlikePost(id)`
  - `addComment(id, content)`, `getComments(id, page, limit)`, `editComment(commentId, content)`, `deleteComment(commentId)`
  - `savePost(id)`, `unsavePost(id)`, `getSavedPosts()`
  - `uploadMedia(id, files)` – wrapper around the existing `/media` endpoint.

---
### Routing

#### Update `frontend/src/routes/AppRouter.jsx`
- Add a **protected** route for the post‑details page:
  ```jsx
  <Route path="/community/:postId" element={<CommunityRequestDetailsPage />} />
  ```
- No new top‑level public route is needed; the details page lives under the existing `/community` path.

---
### Pages & Components

#### 1. `CommunityPage.jsx` (public)
- Fetch posts via `communityService.getPosts()`.
- Render a **premium card grid** using a new `CommunityCard` component.
- Card layout:
  * Cover image (first media item) with optional `+N` badge for extra images.
  * Title, budget, location, category, posted‑date.
  * Badges for **views**, **likes**, **comments**, **savedCount**, **shares**.
  * Hover effect – subtle lift and shadow.
  * Entire card clickable → `navigate(`/community/${post.id}`)`.
- Add a **filter toolbar** (city, neighbourhood, category) using existing UI primitives.
- Implement **infinite scroll** or “Load More” button.

#### 2. `CommunityRequestDetailsPage.jsx` (protected – visible to all users but requires auth for actions)
- On mount: fetch post details (`getPost(id)`) and immediately call `incrementViews(id)`.
- **Image Gallery**:
  * Large main image.
  * Left/right arrows or swipe gestures.
  * Thumbnail strip below the main image (max 5 thumbnails).\n  * Use CSS‑based transition (fade/slide) for premium feel.
- **Post Info Section**:
  * Title, description, budget, rental period, tags, location map (optional).
  * Owner card: avatar, name, verified badge, phone button (`tel:`) and **Start Conversation** button (link to `/messages?userId=ownerId`).
- **Interaction Bar** (horizontal):
  * Like/Unlike button (heart icon) – shows current like count.
  * Comment toggle – expands comment list.
  * Save/Unsave toggle (bookmark icon) – shows savedCount.
  * Share button – uses `navigator.share` if available, else copies URL & increments shares.
- **Comments Section**:
  * Paginated list (`getComments`) with author avatar, timestamp, content.
  * Current user can edit/delete their own comments inline.
  * New comment input with auto‑focus.
- **Related Posts** carousel at page bottom (optional, fetch by same category).

#### 3. Reusable UI Components (new files under `frontend/src/components/community`)
- `CommunityCard.jsx`
- `ImageGallery.jsx`
- `OwnerInfoCard.jsx`
- `InteractionBar.jsx`
- `CommentItem.jsx`
- `CommentForm.jsx`
- `SavedPostsSidebar.jsx` (optional quick access from dashboard).

---
### Styles

- Add a new **CSS module** `community.module.css` (or extend existing global stylesheet) with:
  * Dark‑mode friendly colors (e.g., `--bg-main: #121212; --accent: #0ea5e9;`).
  * Glass‑morphism card background (`backdrop-filter: blur(8px); background: rgba(255,255,255,0.12);`).
  * Smooth micro‑animations for hover, like pulse, image slide.
  * Responsive grid: 4‑col on xl, 2‑col on md, 1‑col on sm.

---
### Backend Adjustments (already done)
- Endpoints added in `communityController.js` and routes in `communityRoutes.js`.
- Ensure `authenticate` middleware is applied to all interaction routes.
- No further backend changes needed.

---
### Verification Plan

**Automated Tests**
- Add/extend Jest‑React tests for `CommunityCard` rendering, interaction button callbacks, and `ImageGallery` navigation.
- Run existing API integration tests to confirm new routes return expected JSON.

**Manual Verification**
- Start the dev server (`npm run dev`).
- Visit `/community` – confirm cards show images, counters, and hover effect.
- Click a card – ensure details page loads, view count increments, gallery works, and actions (like, save, comment) update UI and persist after refresh.
- Test share on desktop (fallback clipboard) and mobile (navigator.share).
- Verify saved posts appear in the dashboard’s Saved Items page.
- Check notifications are created for likes/comments.

---
### Timeline (rough)
| Step | Estimate |
|------|----------|
| Create `communityService.js` | 30 min |
| Update `AppRouter.jsx` & add route | 15 min |
| Build `CommunityCard` & style grid | 1 h |
| Implement `CommunityPage` with filters | 45 min |
| Build `ImageGallery` component | 45 min |
| Implement `CommunityRequestDetailsPage` (layout, fetch, view increment) | 1 h |
| Add `InteractionBar` (like, save, share) | 45 min |
| Add comment system UI & pagination | 1 h |
| Styling, responsive tweaks, micro‑animations | 45 min |
| Write tests & manual QA | 1 h |
| **Total** | **≈7 hours** |

---
**Next Action**: Await your approval or any adjustments to the above plan before I start committing code.
