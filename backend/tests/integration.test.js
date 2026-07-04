const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const app = require('../src/app');

const prisma = new PrismaClient();
const password = 'Password123!';

function listen(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({ server, base: `http://127.0.0.1:${port}` });
    });
  });
}

async function api(base, method, path, { token, body, form } = {}) {
  const headers = {};
  let payload;

  if (token) headers.Authorization = `Bearer ${token}`;
  if (form) payload = form;
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const response = await fetch(`${base}${path}`, {
    method,
    headers,
    body: payload,
  });
  const text = await response.text();
  const json = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(`${method} ${path} failed: ${response.status} ${json.message || text}`);
  }

  return json.data ?? json;
}

async function ensureSuperAdmin() {
  const hash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email: 'superadmin@example.com' },
    update: { name: 'Super Admin', password: hash, role: 'SUPER_ADMIN' },
    create: {
      name: 'Super Admin',
      email: 'superadmin@example.com',
      password: hash,
      role: 'SUPER_ADMIN',
    },
  });
}

test('core rental marketplace backend flow works against configured database', async (t) => {
  const { server, base } = await listen(app);
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await prisma.$disconnect();
  });

  const stamp = Date.now();
  await ensureSuperAdmin();

  const superLogin = await api(base, 'POST', '/api/auth/login', {
    body: { email: 'superadmin@example.com', password },
  });
  assert.ok(superLogin.accessToken);

  const adminEmail = `admin-test-${stamp}@example.com`;
  const admin = await api(base, 'POST', '/api/users/admins', {
    token: superLogin.accessToken,
    body: {
      name: 'Integration Admin',
      email: adminEmail,
      password,
      role: 'ADMIN',
    },
  });
  assert.equal(admin.role, 'ADMIN');

  const adminLogin = await api(base, 'POST', '/api/auth/login', {
    body: { email: adminEmail, password },
  });
  assert.ok(adminLogin.accessToken);

  const contactUserLogin = await api(base, 'POST', '/api/auth/register', {
    body: { name: 'Integration Contact User', email: `contact-test-${stamp}@example.com`, password },
  });

  const contactMessage = await api(base, 'POST', '/api/contact-messages', {
    token: contactUserLogin.accessToken,
    body: {
      name: 'Integration Contact User',
      email: `contact-test-${stamp}@example.com`,
      subject: 'Integration contact subject',
      message: 'Integration contact message body',
    },
  });
  assert.ok(contactMessage.id);

  const contactMessages = await api(base, 'GET', '/api/contact-messages', {
    token: adminLogin.accessToken,
  });
  assert.ok(contactMessages.some((message) => message.id === contactMessage.id));

  const repliedContactMessage = await api(base, 'PATCH', `/api/contact-messages/${contactMessage.id}/reply`, {
    token: adminLogin.accessToken,
    body: { adminReply: 'Integration admin reply.' },
  });
  assert.equal(repliedContactMessage.status, 'REPLIED');

  const contactNotifications = await api(base, 'GET', '/api/notifications', {
    token: contactUserLogin.accessToken,
  });
  assert.ok(contactNotifications.some((notification) => notification.referenceId === contactMessage.id));

  const supportTicket = await api(base, 'POST', '/api/support-tickets', {
    token: contactUserLogin.accessToken,
    body: {
      subject: 'Integration support subject',
      message: 'Integration support message body',
      priority: 'MEDIUM',
    },
  });
  assert.ok(supportTicket.id);

  const supportTickets = await api(base, 'GET', '/api/support-tickets', {
    token: adminLogin.accessToken,
  });
  assert.ok(supportTickets.some((ticket) => ticket.id === supportTicket.id));

  const supportReply = await api(base, 'POST', `/api/support-tickets/${supportTicket.id}/replies`, {
    token: adminLogin.accessToken,
    body: { message: 'Integration support reply.' },
  });
  assert.equal(supportReply.status, 'REPLIED');

  const supportNotifications = await api(base, 'GET', '/api/notifications', {
    token: contactUserLogin.accessToken,
  });
  assert.ok(supportNotifications.some((notification) => notification.referenceId === supportTicket.id));

  const resolvedSupportTicket = await api(base, 'PATCH', `/api/support-tickets/${supportTicket.id}/resolve`, {
    token: adminLogin.accessToken,
  });
  assert.equal(resolvedSupportTicket.status, 'RESOLVED');

  const ownerLogin = await api(base, 'POST', '/api/auth/register', {
    body: { name: 'Integration Owner', email: `owner-test-${stamp}@example.com`, password },
  });
  const renterLogin = await api(base, 'POST', '/api/auth/register', {
    body: { name: 'Integration Renter', email: `renter-test-${stamp}@example.com`, password },
  });
  assert.equal(ownerLogin.user.role, 'USER');
  assert.equal(renterLogin.user.role, 'USER');

  const category = await api(base, 'POST', '/api/categories', {
    token: adminLogin.accessToken,
    body: {
      name: `Integration Category ${stamp}`,
      slug: `integration-category-${stamp}`,
      description: 'Integration category',
    },
  });
  assert.ok(category.id);

  const listingForm = new FormData();
  listingForm.append('title', `Integration Listing ${stamp}`);
  listingForm.append('description', 'Integration listing description');
  listingForm.append('categoryId', category.id);
  listingForm.append('city', 'Jigjiga');
  listingForm.append('location', 'City Center');
  listingForm.append('pricePerDay', '500');
  listingForm.append('paymentMethod', 'CASH');
  listingForm.append('paymentProof', new Blob(['proof'], { type: 'image/png' }), 'proof.png');

  const listing = await api(base, 'POST', '/api/listings', {
    token: ownerLogin.accessToken,
    form: listingForm,
  });
  assert.equal(listing.status, 'PENDING');

  const approvedListing = await api(base, 'PATCH', `/api/listings/${listing.id}/approve`, {
    token: adminLogin.accessToken,
  });
  assert.equal(approvedListing.status, 'APPROVED');

  const booking = await api(base, 'POST', '/api/bookings', {
    token: renterLogin.accessToken,
    body: {
      listingId: listing.id,
      ownerId: ownerLogin.user.id,
      startDate: '2026-08-01',
      endDate: '2026-08-03',
      subtotal: 1000,
      serviceFee: 100,
      totalAmount: 1100,
      agreementAccepted: true,
    },
  });
  assert.equal(booking.status, 'PENDING');

  const accepted = await api(base, 'PATCH', `/api/bookings/${booking.id}/accept`, {
    token: ownerLogin.accessToken,
  });
  assert.equal(accepted.status, 'ACCEPTED');

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'COMPLETED', completedAt: new Date() },
  });

  const review = await api(base, 'POST', '/api/reviews', {
    token: renterLogin.accessToken,
    body: { listingId: listing.id, bookingId: booking.id, rating: 5, comment: 'Great rental.' },
  });
  assert.ok(review.id);

  const myReviews = await api(base, 'GET', '/api/reviews/my', {
    token: renterLogin.accessToken,
  });
  assert.ok(myReviews.some((item) => item.id === review.id));

  const promotionForm = new FormData();
  promotionForm.append('listingId', listing.id);
  promotionForm.append('packageType', 'Featured Package');
  promotionForm.append('placement', 'FEATURED');
  promotionForm.append('amount', '250');
  promotionForm.append('paymentProof', new Blob(['proof'], { type: 'image/png' }), 'promo-proof.png');

  const promotion = await api(base, 'POST', '/api/promotions', {
    token: ownerLogin.accessToken,
    form: promotionForm,
  });
  assert.equal(promotion.status, 'PENDING');

  const approvedPromotion = await api(base, 'PATCH', `/api/promotions/${promotion.id}/approve`, {
    token: adminLogin.accessToken,
  });
  assert.equal(approvedPromotion.status, 'APPROVED');

  const conversation = await api(base, 'POST', '/api/conversations', {
    token: renterLogin.accessToken,
    body: { participantTwoId: ownerLogin.user.id, listingId: listing.id },
  });
  assert.ok(conversation.id);

  const message = await api(base, 'POST', '/api/messages', {
    token: renterLogin.accessToken,
    body: { conversationId: conversation.id, body: 'Hello from automated test.' },
  });
  assert.ok(message.id);

  const notifications = await api(base, 'GET', '/api/notifications', {
    token: ownerLogin.accessToken,
  });
  assert.ok(Array.isArray(notifications));
  assert.ok(notifications.length > 0);
});


