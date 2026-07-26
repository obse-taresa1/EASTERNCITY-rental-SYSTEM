const axios = require('axios');
const API_URL = 'http://localhost:5000/api';
const SUPER_ADMIN = { email: 'superadmin@example.com', password: 'password123' };

async function login(email, password) {
  const res = await axios.post(`${API_URL}/auth/login`, { email, password });
  return res.data.data.accessToken;
}

async function approveListings() {
  const token = await login(SUPER_ADMIN.email, SUPER_ADMIN.password);
  
  const res = await axios.get(`${API_URL}/admin-management/listings`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const allListings = res.data.data.listings || res.data.data || [];
  let pending;
  
  if (Array.isArray(allListings)) {
    pending = allListings.filter(l => l.status === 'PENDING');
  } else {
    // If it's paginated or something
    console.log(allListings);
    return;
  }
  
  console.log(`Found ${pending.length} pending listings to approve.`);

  for (const l of pending) {
    try {
      await axios.patch(`${API_URL}/listings/${l.id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`Approved: ${l.title}`);
    } catch(e) {
      console.error(`Failed to approve ${l.id}:`, e.response?.data || e.message);
    }
  }
}

approveListings().then(() => console.log('Done.')).catch(console.error);
