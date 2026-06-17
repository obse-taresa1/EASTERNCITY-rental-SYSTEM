import EmptyState from "../../components/common/EmptyState.jsx";

export default function NotificationsPage() {
  return (
    <main className="container py-5">
      <h1 className="h3 mb-4">Notifications</h1>

      <EmptyState
        icon="bi-bell"
        title="No notifications"
        description="Important account and booking updates will appear here."
      />
    </main>
  );
}