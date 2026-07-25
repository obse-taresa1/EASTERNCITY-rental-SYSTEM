export function seedMockData() {
  if (localStorage.getItem("mock_data_seeded")) {
    return; // Already seeded
  }

  const USERS_KEY = "motorx_users";
  const LISTINGS_KEY = "motorx_listings";
  const BOOKINGS_KEY = "motorx_bookings";
  const MESSAGES_KEY = "motorx_messages";
  const REVIEWS_KEY = "motorx_reviews";

  // Existing data
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  const listings = JSON.parse(localStorage.getItem(LISTINGS_KEY) || "[]");
  const bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
  const messages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || "[]");
  const reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY) || "[]");

  // Create Users
  const newUsers = [
    {
      id: "user-rahma",
      name: "Rahma",
      email: "rahma@example.com",
      password: "password123",
      city: "Jigjiga",
      verificationStatus: "approved",
      createdAt: new Date().toISOString(),
    },
    {
      id: "user-obse",
      name: "Obse",
      email: "obse@example.com",
      password: "password123",
      city: "Dire Dawa",
      verificationStatus: "approved",
      createdAt: new Date().toISOString(),
    },
    {
      id: "user-mahhi",
      name: "Mahhi",
      email: "mahhi@example.com",
      password: "password123",
      city: "Harar",
      verificationStatus: "approved",
      createdAt: new Date().toISOString(),
    },
  ];

  // Add them if they don't exist
  newUsers.forEach((u) => {
    if (!users.find((existing) => existing.email === u.email)) {
      users.push(u);
    }
  });

  // Create Listings (3 for each)
  const newListings = [
    // Rahma's listings
    { id: "list-r1", ownerId: "user-rahma", title: "Rahma's Wedding Dress", category: "fashion-accessories", pricePerDay: 2000, city: "Jigjiga", status: "published", image: "https://images.unsplash.com/photo-1596450514735-307998ce4f5e?w=400&h=300&fit=crop" },
    { id: "list-r2", ownerId: "user-rahma", title: "Rahma's Gold Jewelry", category: "fashion-accessories", pricePerDay: 1500, city: "Jigjiga", status: "published", image: "https://images.unsplash.com/photo-1515562141589-67f0d569b6d2?w=400&h=300&fit=crop" },
    { id: "list-r3", ownerId: "user-rahma", title: "Rahma's HD Camera", category: "electronics-cameras", pricePerDay: 800, city: "Jigjiga", status: "published", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop" },
    
    // Obse's listings
    { id: "list-o1", ownerId: "user-obse", title: "Obse's Party Tent", category: "party-wedding", pricePerDay: 5000, city: "Dire Dawa", status: "published", image: "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=400&h=300&fit=crop" },
    { id: "list-o2", ownerId: "user-obse", title: "Obse's Sound System", category: "music-audio", pricePerDay: 3000, city: "Dire Dawa", status: "published", image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=300&fit=crop" },
    { id: "list-o3", ownerId: "user-obse", title: "Obse's DJ Gear", category: "music-audio", pricePerDay: 2500, city: "Dire Dawa", status: "published", image: "https://images.unsplash.com/photo-1571327073757-71d13c24de30?w=400&h=300&fit=crop" },

    // Mahhi's listings
    { id: "list-m1", ownerId: "user-mahhi", title: "Mahhi's SUV 2024", category: "vehicles", pricePerDay: 8000, city: "Harar", status: "published", image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&h=300&fit=crop" },
    { id: "list-m2", ownerId: "user-mahhi", title: "Mahhi's Camping Gear", category: "travel-camping", pricePerDay: 1200, city: "Harar", status: "published", image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop" },
    { id: "list-m3", ownerId: "user-mahhi", title: "Mahhi's Drone", category: "electronics-cameras", pricePerDay: 4000, city: "Harar", status: "published", image: "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=400&h=300&fit=crop" },
  ];

  newListings.forEach((l) => {
    if (!listings.find((existing) => existing.id === l.id)) {
      listings.push(l);
    }
  });

  // Create Bookings
  const newBookings = [
    { id: "book-1", listingId: "list-r1", ownerId: "user-rahma", renterId: "user-obse", status: "ACTIVE", itemTitle: "Rahma's Wedding Dress", startDate: "2026-08-01", endDate: "2026-08-03", totalPrice: 6000, createdAt: new Date().toISOString() },
    { id: "book-2", listingId: "list-o1", ownerId: "user-obse", renterId: "user-mahhi", status: "COMPLETED", itemTitle: "Obse's Party Tent", startDate: "2026-07-01", endDate: "2026-07-02", totalPrice: 5000, createdAt: new Date().toISOString() },
    { id: "book-3", listingId: "list-m1", ownerId: "user-mahhi", renterId: "user-rahma", status: "PENDING", itemTitle: "Mahhi's SUV 2024", startDate: "2026-08-10", endDate: "2026-08-15", totalPrice: 40000, createdAt: new Date().toISOString() },
  ];

  newBookings.forEach((b) => {
    if (!bookings.find((existing) => existing.id === b.id)) {
      bookings.push(b);
    }
  });

  // Create Messages (Conversations)
  const newMessages = [
    {
      id: "conv-1",
      participantOneId: "user-rahma",
      participantTwoId: "user-obse",
      participantOneName: "Rahma",
      participantTwoName: "Obse",
      subject: "Regarding the Wedding Dress",
      messages: [
        { senderId: "user-obse", text: "Hi Rahma, is the dress available?", timestamp: new Date().toISOString() },
        { senderId: "user-rahma", text: "Yes Obse, it is!", timestamp: new Date().toISOString() }
      ],
      updatedAt: new Date().toISOString()
    },
    {
      id: "conv-2",
      participantOneId: "user-obse",
      participantTwoId: "user-mahhi",
      participantOneName: "Obse",
      participantTwoName: "Mahhi",
      subject: "Party Tent Booking",
      messages: [
        { senderId: "user-mahhi", text: "Thanks for the tent, Obse. It was great.", timestamp: new Date().toISOString() },
        { senderId: "user-obse", text: "You're welcome, Mahhi!", timestamp: new Date().toISOString() }
      ],
      updatedAt: new Date().toISOString()
    }
  ];

  newMessages.forEach((m) => {
    if (!messages.find((existing) => existing.id === m.id)) {
      messages.push(m);
    }
  });

  // Create Reviews
  const newReviews = [
    { id: "rev-1", bookingId: "book-2", listingId: "list-o1", reviewerId: "user-mahhi", targetUserId: "user-obse", rating: 5, comment: "Amazing tent, very spacious!", itemTitle: "Obse's Party Tent", createdAt: new Date().toISOString() },
    { id: "rev-2", bookingId: "book-2", listingId: "list-o1", reviewerId: "user-obse", targetUserId: "user-mahhi", rating: 5, comment: "Mahhi was a great renter.", itemTitle: "Obse's Party Tent", createdAt: new Date().toISOString() },
  ];

  newReviews.forEach((r) => {
    if (!reviews.find((existing) => existing.id === r.id)) {
      reviews.push(r);
    }
  });

  // Save everything
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));

  localStorage.setItem("mock_data_seeded", "true");
  console.log("Mock data for Rahma, Obse, and Mahhi seeded successfully.");
}
