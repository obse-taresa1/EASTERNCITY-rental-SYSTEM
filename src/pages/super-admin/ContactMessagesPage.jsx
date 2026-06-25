import AdminDataTable from "../../components/admin/AdminDataTable.jsx";

const contactMessages = [
  {
    id: "msg-1",
    name: "Customer Support",
    email: "customer@example.com",
    subject: "Booking help",
    message: "I need help with my booking.",
  },
  {
    id: "msg-2",
    name: "Lessor Partner",
    email: "partner@example.com",
    subject: "Listing approval",
    message: "Please review my rental listing.",
  },
];

export default function ContactMessagesPage() {
  return (
    <main className="dashboard-content">
      <span className="section-label">SUPER ADMIN</span>
      <h1>Contact Messages</h1>

      <AdminDataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "subject", label: "Subject" },
          { key: "message", label: "Message" },
        ]}
        rows={contactMessages}
      />
    </main>
  );
}
