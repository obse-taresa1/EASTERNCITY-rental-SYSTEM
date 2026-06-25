import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getBookingsByUser, getReviewsByUser } from '../../services/bookingService.js';

function getInitials(name) {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

export default function DashboardSidebar() {
  const { currentUser, user, logout } = useAuth();
  const { language } = useLanguage();
  const activeUser = user || currentUser;
  const role = String(activeUser?.role || '').toLowerCase();
  
  const memberSince = activeUser?.createdAt
    ? new Date(activeUser.createdAt).getFullYear()
    : new Date().getFullYear();

  // Get statistics
  const bookings = activeUser ? getBookingsByUser(activeUser.id) : [];
  const activeBookings = bookings.filter(b => ['pending', 'awaiting_verification', 'confirmed', 'active'].includes(b.status)).length;
  const finishedRentals = bookings.filter(b => b.status === 'completed').length;
  const reviews = activeUser ? getReviewsByUser(activeUser.id).length : 0;

  // Render different Dashboard links based on role
  let dashboardLink = '/both-dashboard';
  if (role === 'admin' || role === 'supervisor') dashboardLink = '/admin';
  if (role === 'superadmin' || role === 'super-admin') dashboardLink = '/super-admin';

  return (
    <aside className="dashboard-sidebar">
      <NavLink to="/" className="dashboard-brand" style={{ marginBottom: '1.5rem', textAlign: 'center', display: 'block' }}>
        <h3 className="m-0 fw-bold text-dark">EASTERN<span className="text-danger">CITY</span></h3>
      </NavLink>

      {/* 1. Left Profile Card (Always Visible) */}
      <div className="premium-glass-card bg-white p-3 mb-4 text-center rounded-4 shadow-sm border">
        <div className="position-relative d-inline-block mb-3 mt-2">
          {activeUser?.profileImage ? (
             <img src={activeUser.profileImage} alt="Profile" className="rounded-circle shadow-sm" style={{ width: '80px', height: '80px', objectFit: 'cover', border: '3px solid var(--motorx-red)' }} />
          ) : (
             <div className="rounded-circle shadow-sm d-flex align-items-center justify-content-center text-white fw-bold mx-auto" style={{ width: '80px', height: '80px', fontSize: '2rem', background: 'var(--motorx-red)' }}>
                {getInitials(activeUser?.name)}
             </div>
          )}
          <span className="position-absolute bottom-0 end-0 bg-success text-white rounded-circle d-flex align-items-center justify-content-center border border-white" style={{ width: '24px', height: '24px', title: 'Verified User' }}>
            <i className="bi bi-check" style={{ fontSize: '1rem' }}></i>
          </span>
        </div>
        
        <h5 className="fw-bold m-0 mb-1">{activeUser?.name || 'Verified User'}</h5>
        <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
           <span className="badge bg-light text-dark border small">Since {memberSince}</span>
           <span className="badge bg-light text-dark border small"><i className="bi bi-geo-alt text-danger"></i> {activeUser?.city || 'Jigjiga'}</span>
           <span className="badge bg-light text-dark border small"><i className="bi bi-globe text-primary"></i> {language.toUpperCase()}</span>
        </div>

        <div className="text-start border-top pt-3 text-muted small">
           <div className="d-flex align-items-center gap-2 mb-2 text-truncate" title={activeUser?.email || 'user@example.com'}>
              <i className="bi bi-envelope text-danger"></i> {activeUser?.email || 'user@example.com'}
           </div>
           <div className="d-flex align-items-center gap-2 text-truncate">
              <i className="bi bi-telephone text-danger"></i> {activeUser?.phone || '+251 900 000 000'}
           </div>
        </div>
      </div>

      {/* 2. Static Summary Cards */}
      <div className="sidebar-summary-grid mb-4">
         <div className="premium-glass-card bg-white p-2 rounded-3 border text-center shadow-sm summary-stat-card">
            <h6 className="fw-bold m-0 fs-5 text-danger">{activeBookings}</h6>
            <span className="text-muted" style={{ fontSize: '0.7rem' }}><i className="bi bi-calendar-event"></i> Active Bookings</span>
         </div>
         <div className="premium-glass-card bg-white p-2 rounded-3 border text-center shadow-sm summary-stat-card">
            <h6 className="fw-bold m-0 fs-5 text-danger">0</h6>
            <span className="text-muted" style={{ fontSize: '0.7rem' }}><i className="bi bi-heart"></i> Saved Items</span>
         </div>
         <div className="premium-glass-card bg-white p-2 rounded-3 border text-center shadow-sm summary-stat-card">
            <h6 className="fw-bold m-0 fs-5 text-danger">0</h6>
            <span className="text-muted" style={{ fontSize: '0.7rem' }}><i className="bi bi-chat-dots"></i> Messages</span>
         </div>
         <div className="premium-glass-card bg-white p-2 rounded-3 border text-center shadow-sm summary-stat-card">
            <h6 className="fw-bold m-0 fs-5 text-danger">{reviews}</h6>
            <span className="text-muted" style={{ fontSize: '0.7rem' }}><i className="bi bi-star"></i> Reviews</span>
         </div>
      </div>
      <div className="premium-glass-card bg-white p-2 mb-4 rounded-3 border text-center shadow-sm summary-stat-card">
         <div className="d-flex justify-content-between align-items-center px-2">
            <span className="text-muted fw-bold" style={{ fontSize: '0.85rem' }}><i className="bi bi-flag-fill text-success me-2"></i>Finished Rentals</span>
            <h5 className="fw-bold m-0 text-dark">{finishedRentals}</h5>
         </div>
      </div>

      {/* 3. Navigation Links */}
      <nav className="dashboard-nav">
        <NavLink to={dashboardLink} className="rounded-3 mb-1"><i className="bi bi-speedometer2" /> <span>Dashboard</span></NavLink>
        {(role === 'lessor' || role === 'both') && (
          <NavLink to="/lessor-dashboard" className="rounded-3 mb-1"><i className="bi bi-card-checklist" /> <span>My Listings</span></NavLink>
        )}
        {(role === 'lessor' || role === 'both') && (
          <NavLink to="/list-item" className="rounded-3 mb-1"><i className="bi bi-plus-circle" /> <span>Add New Listing</span></NavLink>
        )}
        <NavLink to="/my-bookings" className="rounded-3 mb-1"><i className="bi bi-calendar-check" /> <span>My Bookings</span></NavLink>
        <NavLink to="/wishlist" className="rounded-3 mb-1"><i className="bi bi-heart" /> <span>Wishlist / Saved Items</span></NavLink>
        <NavLink to="/messages" className="rounded-3 mb-1"><i className="bi bi-chat-dots" /> <span>Messages</span></NavLink>
        <NavLink to="/contact-owner" className="rounded-3 mb-1"><i className="bi bi-person-lines-fill" /> <span>Contact Owner</span></NavLink>
        
        <div className="mt-4 mb-2 ps-3 text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Support</div>
        <NavLink to="/help-center" className="rounded-3 mb-1"><i className="bi bi-question-circle" /> <span>Help Center</span></NavLink>
      </nav>

      <div className="mt-auto pt-4">
        <button type="button" className="dashboard-logout w-100 rounded-pill fw-bold" onClick={logout}>
          <i className="bi bi-box-arrow-right" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
