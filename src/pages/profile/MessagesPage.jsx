import EmptyState from "../../components/common/EmptyState.jsx";

export default function MessagesPage() {
  return (
    <main className="container py-5">
      <h1 className="h3 mb-4">Messages</h1>

      <EmptyState
        icon="bi-chat-dots"
        title="No messages"
        description="Your rental conversations will appear here."
      />
    </main>
  );
}