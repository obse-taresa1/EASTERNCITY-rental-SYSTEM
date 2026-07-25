// backend/scripts/approve-listings.js
// Approve all pending listings using the admin API.
// Using built‑in fetch (Node >=18) – no external package needed
const BASE_URL = "http://localhost:5000/api";

async function req(path, method = "GET", body = null, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "API error");
  return data;
}

async function main() {
  console.log("🔐 Logging in as Super‑Admin …");
  const superLogin = await req("/auth/login", "POST", { email: "superadmin@example.com", password: "password123" });
  const superToken = superLogin.data?.token || superLogin.data?.accessToken;

  // Create admin if not exists
  const adminEmail = "rahmasala663@gmail.com";
  const adminPassword = "Password123!";
  try {
    console.log(`👤 Creating admin ${adminEmail} …`);
    await req("/users/admins", "POST", { name: "Rahma", email: adminEmail, password: adminPassword }, superToken);
    console.log("✅ Admin created.");
  } catch (e) {
    console.warn(`⚠️  Admin creation skipped: ${e.message}`);
  }

  // Login as the new admin
  console.log(`🔐 Logging in as admin ${adminEmail} …`);
  const adminLogin = await req("/auth/login", "POST", { email: adminEmail, password: adminPassword });
  const adminToken = adminLogin.data?.token || adminLogin.data?.accessToken;

  console.log("📥 Fetching pending listings …");
  const pending = await req("/admin-management/listings?status=PENDING", "GET", null, adminToken);
  const listings = pending.data?.listings || pending.data;
  if (!Array.isArray(listings) || listings.length === 0) {
    console.log("✅ No pending listings found.");
    return;
  }
  console.log(`🗂️  Approving ${listings.length} listings …`);
  for (const l of listings) {
    try {
      await req(`/admin-management/listings/${l.id}/status`, "PATCH", { status: "PUBLISHED" }, adminToken);
      console.log(`✅ Approved ${l.id}`);
    } catch (e) {
      console.error(`❌ Failed ${l.id}: ${e.message}`);
    }
  }
  console.log("🎉 All done.");
}

main().catch(err => console.error("💥 Unexpected error:", err));
