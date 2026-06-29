const fs = require("fs");
const path = require("path");

function createPage(dir, name, title, role) {
  const content = `import AdminDataTable from "../../components/admin/AdminDataTable.jsx";\n\nexport default function ${name}() {\n  return (\n    <main className="dashboard-content">\n      <div className="d-flex justify-content-between align-items-end mb-4">\n        <div>\n          <span className="section-label">${role}</span>\n          <h1 className="h3 mb-0">${title}</h1>\n        </div>\n      </div>\n      <div className="admin-table-container">\n        <h2 className="h5 mb-3 d-flex align-items-center gap-2">\n          <i className="bi bi-table text-primary-custom"></i> ${title} Data\n        </h2>\n        <AdminDataTable\n          columns={[{ key: "id", label: "ID" }, { key: "name", label: "Name" }, { key: "status", label: "Status" } ]}\n          rows={[{ id: 1, name: "Sample Data", status: "Active" }]}\n        />\n      </div>\n    </main>\n  );\n}\n`;
  fs.writeFileSync(path.join("src/pages", dir, name + ".jsx"), content);
}

const adminPages = [
  ["AdminOwnersPage", "Owners"],
  ["AdminRentersPage", "Renters"],
  ["AdminCategoriesPage", "Categories"],
  ["AdminBookingsPage", "Bookings"],
  ["AdminPaymentsPage", "Payments"],
  ["AdminVerificationPage", "Verification Requests"],
  ["AdminReviewsPage", "Reviews"],
  ["AdminSupportTicketsPage", "Support Tickets"],
  ["AdminNotificationsPage", "Notifications"],
  ["AdminAnalyticsPage", "Analytics"]
];

const superAdminPages = [
  ["PlatformOverviewPage", "Platform Overview"],
  ["SuperCategoriesManagementPage", "Categories Management"],
  ["SuperPaymentsRevenuePage", "Payments & Revenue"],
  ["SuperVerificationCenterPage", "Verification Center"],
  ["SuperReportsComplaintsPage", "Reports & Complaints"],
  ["SuperSupportCenterPage", "Support Center"],
  ["SuperPlatformMonitoringPage", "Platform Monitoring"],
  ["SecurityCenterPage", "Security Center"]
];

adminPages.forEach(([name, title]) => createPage("admin", name, title, "ADMIN DASHBOARD"));
superAdminPages.forEach(([name, title]) => createPage("super-admin", name, title, "SUPER ADMIN DASHBOARD"));
