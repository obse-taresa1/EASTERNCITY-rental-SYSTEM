import { useEffect, useState } from "react";
import EmptyState from "../../components/common/EmptyState.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  fetchNotifications,
  markNotificationRead,
} from "../../services/notificationService.js";

export default function NotificationsPage() {
  const { currentUser, user } = useAuth();
  const activeUser = user || currentUser;
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const refreshNotifications = () => {
      fetchNotifications(activeUser?.id)
        .then((items) => {
          if (isMounted) setNotifications(items || []);
        })
        .catch(() => {
          if (isMounted) setNotifications([]);
        });
    };

    refreshNotifications();
    window.addEventListener("easterncity:notifications-updated", refreshNotifications);
    return () => {
      isMounted = false;
      window.removeEventListener(
        "easterncity:notifications-updated",
        refreshNotifications,
      );
    };
  }, [activeUser?.id]);

  async function handleMarkRead(id) {
    await markNotificationRead(id);
    const items = await fetchNotifications(activeUser?.id);
    setNotifications(items || []);
  }

  return (
    <main className="container py-5">
      <h1 className="h3 mb-4">Notifications</h1>

      {notifications.length === 0 ? (
        <EmptyState
          icon="bi-bell"
          title="No notifications"
          description="Important account and booking updates will appear here."
        />
      ) : (
        <div className="list-group">
          {notifications.map((notification) => (
            <button
              className={`list-group-item list-group-item-action text-start ${notification.isRead ? "" : "fw-bold"}`}
              key={notification.id}
              onClick={() => handleMarkRead(notification.id)}
              type="button"
            >
              <div className="d-flex w-100 justify-content-between gap-3">
                <span>{notification.title}</span>
                <small className="text-muted">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </small>
              </div>
              <p className="mb-1 text-muted">{notification.body}</p>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
