import { useState } from "react";

export default function AdminNotificationsPage() {
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [targetUser, setTargetUser] = useState("");
  const [notifText, setNotifText] = useState("");
  const [notifTitle, setNotifTitle] = useState("");

  const handleSendAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementText.trim()) return;
    alert(`Global Announcement Broadcasted successfully!\nTitle: ${announcementTitle}\nBody: ${announcementText}`);
    setAnnouncementTitle("");
    setAnnouncementText("");
  };

  const handleSendDirect = (e) => {
    e.preventDefault();
    if (!targetUser.trim() || !notifTitle.trim() || !notifText.trim()) return;
    alert(`Direct Notification sent to User ${targetUser} successfully!\nTitle: ${notifTitle}\nBody: ${notifText}`);
    setTargetUser("");
    setNotifTitle("");
    setNotifText("");
  };

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">ADMIN</span>
          <h1 className="h3 mb-0">Notifications Center</h1>
          <p className="text-muted mb-0">
            Publish system announcements or push alerts directly to user accounts.
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="admin-table-container">
            <h2 className="h5 mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-megaphone text-primary-custom" /> Broadcast Platform Announcement
            </h2>
            <form onSubmit={handleSendAnnouncement}>
              <div className="mb-3">
                <label className="form-label">Announcement Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={announcementTitle}
                  onChange={e => setAnnouncementTitle(e.target.value)}
                  placeholder="e.g. Scheduled Maintenance"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Message Content</label>
                <textarea
                  rows="4"
                  className="form-control"
                  value={announcementText}
                  onChange={e => setAnnouncementText(e.target.value)}
                  placeholder="Type announcement message visible to all users..."
                  required
                />
              </div>
              <button type="submit" className="btn btn-accent-custom w-100">
                Send Global Announcement
              </button>
            </form>
          </div>
        </div>

        <div className="col-lg-6 mb-4">
          <div className="admin-table-container">
            <h2 className="h5 mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-person-bell text-primary-custom" /> Send Direct Notification
            </h2>
            <form onSubmit={handleSendDirect}>
              <div className="mb-3">
                <label className="form-label">Recipient User Email or ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={targetUser}
                  onChange={e => setTargetUser(e.target.value)}
                  placeholder="e.g. almaz@example.com"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Notification Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={notifTitle}
                  onChange={e => setNotifTitle(e.target.value)}
                  placeholder="e.g. ID Approved"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Message Content</label>
                <textarea
                  rows="3"
                  className="form-control"
                  value={notifText}
                  onChange={e => setNotifText(e.target.value)}
                  placeholder="Type direct notification body message..."
                  required
                />
              </div>
              <button type="submit" className="btn btn-outline-danger w-100">
                Send Direct Notification
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
