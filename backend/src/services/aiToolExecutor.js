const { z } = require("zod");
const categoryService = require("./categoryService");
const listingService = require("./listingService");
const bookingService = require("./booking.service");
const dashboardService = require("./dashboard.service");
const userService = require("./userService");
const supportTicketRepository = require("../repositories/supportTicket.repository");

const PUBLIC_TOOLS = [
  "searchListings",
  "searchCategories",
  "searchCities",
  "faq",
  "recommendListings",
];

const ROLE_TOOLS = {
  GUEST: PUBLIC_TOOLS,
  USER: [
    ...PUBLIC_TOOLS,
    "getProfile",
    "getBookings",
    "getSavedItems",
    "createSupportTicket",
    "getOwnerListings",
  ],
  ADMIN: [
    ...PUBLIC_TOOLS,
    "getProfile",
    "getBookings",
    "getPendingListings",
    "dashboardAnalytics",
    "supportTickets",
  ],
  SUPER_ADMIN: [
    ...PUBLIC_TOOLS,
    "getProfile",
    "getBookings",
    "getPendingListings",
    "dashboardAnalytics",
    "supportTickets",
    "platformStatistics",
    "systemHealth",
  ],
};

const cityEnum = ["Harar", "Dire Dawa", "Jigjiga"];
const pageSchema = z.coerce.number().int().min(1).max(20).default(1);
const limitSchema = z.coerce.number().int().min(1).max(20).default(10);

const schemas = {
  searchListings: z.object({
    categorySlug: z.string().trim().min(1).max(80).optional(),
    category: z.string().trim().min(1).max(80).optional(),
    city: z.string().trim().max(80).optional(),
    sefer: z.string().trim().max(80).optional(),
    searchQuery: z.string().trim().max(120).optional(),
    keyword: z.string().trim().max(120).optional(),
    minPrice: z.coerce.number().min(0).max(1000000).optional(),
    maxPrice: z.coerce.number().min(0).max(1000000).optional(),
    page: pageSchema.optional(),
    limit: limitSchema.optional(),
  }),
  searchCategories: z.object({}).passthrough(),
  searchCities: z.object({}).passthrough(),
  faq: z.object({
    topic: z.string().trim().min(1).max(80),
  }),
  recommendListings: z.object({
    city: z.string().trim().max(80).optional(),
    categorySlug: z.string().trim().max(80).optional(),
    limit: limitSchema.optional(),
  }),
  getProfile: z.object({}).passthrough(),
  getBookings: z.object({
    status: z.string().trim().max(40).optional(),
  }).passthrough(),
  getSavedItems: z.object({}).passthrough(),
  createSupportTicket: z.object({
    subject: z.string().trim().min(3).max(120),
    message: z.string().trim().min(5).max(1500),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  }),
  getOwnerListings: z.object({
    status: z.string().trim().max(40).optional(),
  }).passthrough(),
  getPendingListings: z.object({}).passthrough(),
  dashboardAnalytics: z.object({
    range: z.enum(["today", "week", "month", "year", "custom"]).default("month"),
    startDate: z.string().trim().max(40).optional(),
    endDate: z.string().trim().max(40).optional(),
  }).passthrough(),
  supportTickets: z.object({
    status: z.string().trim().max(40).optional(),
  }).passthrough(),
  platformStatistics: z.object({
    range: z.enum(["today", "week", "month", "year", "custom"]).default("month"),
  }).passthrough(),
  systemHealth: z.object({}).passthrough(),
};

const TOOL_DECLARATIONS = [
  {
    name: "searchListings",
    description: "Search approved rental listings by keyword, category, city, sefer/neighborhood, and price. Returns at most 20 listings.",
    parameters: {
      type: "OBJECT",
      properties: {
        categorySlug: { type: "STRING", description: "Rental category slug, such as cars-bikes or electronics-cameras." },
        city: { type: "STRING", description: "City name, such as Harar, Dire Dawa, or Jigjiga." },
        sefer: { type: "STRING", description: "Neighborhood/sefer name." },
        searchQuery: { type: "STRING", description: "Keyword, such as camera, laptop, car, tent, or drill." },
        minPrice: { type: "NUMBER", description: "Minimum ETB price per day." },
        maxPrice: { type: "NUMBER", description: "Maximum ETB price per day." },
        limit: { type: "NUMBER", description: "Maximum results, capped at 20." },
      },
    },
  },
  {
    name: "searchCategories",
    description: "Fetch the available rental categories.",
  },
  {
    name: "searchCities",
    description: "Fetch supported EasternCities marketplace cities.",
  },
  {
    name: "recommendListings",
    description: "Return recently approved listings, optionally filtered by city or category.",
    parameters: {
      type: "OBJECT",
      properties: {
        city: { type: "STRING" },
        categorySlug: { type: "STRING" },
        limit: { type: "NUMBER" },
      },
    },
  },
  {
    name: "faq",
    description: "Answer platform policy and workflow questions using approved knowledge-base topics.",
    parameters: {
      type: "OBJECT",
      properties: {
        topic: { type: "STRING", description: "Topic: payment, listing-fee, promotion, verification, booking, cancellation, support, safety." },
      },
      required: ["topic"],
    },
  },
  {
    name: "getProfile",
    description: "Fetch the authenticated user's safe profile summary.",
  },
  {
    name: "getBookings",
    description: "Fetch bookings visible to the authenticated user.",
  },
  {
    name: "getSavedItems",
    description: "Explain saved items availability. The current backend does not expose a database saved-items model.",
  },
  {
    name: "createSupportTicket",
    description: "Create a support ticket for the authenticated user after they ask for help.",
    parameters: {
      type: "OBJECT",
      properties: {
        subject: { type: "STRING" },
        message: { type: "STRING" },
        priority: { type: "STRING", enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] },
      },
      required: ["subject", "message"],
    },
  },
  {
    name: "getOwnerListings",
    description: "Fetch listings owned by the authenticated user.",
  },
  {
    name: "getPendingListings",
    description: "Admin only: fetch listings waiting for review.",
  },
  {
    name: "dashboardAnalytics",
    description: "Admin only: fetch dashboard analytics for a date range.",
  },
  {
    name: "supportTickets",
    description: "Admin only: fetch support tickets.",
  },
  {
    name: "platformStatistics",
    description: "Super Admin only: fetch platform statistics.",
  },
  {
    name: "systemHealth",
    description: "Super Admin only: fetch basic system health.",
  },
];

function normalizeRole(role) {
  const value = String(role || "GUEST").toUpperCase();
  return ROLE_TOOLS[value] ? value : "GUEST";
}

function getToolsForRole(role = "GUEST") {
  const allowedNames = ROLE_TOOLS[normalizeRole(role)] || ROLE_TOOLS.GUEST;
  return TOOL_DECLARATIONS.filter((tool) => allowedNames.includes(tool.name));
}

function assertAllowed(toolName, user) {
  const role = normalizeRole(user?.role);
  const allowed = ROLE_TOOLS[role] || ROLE_TOOLS.GUEST;
  if (!allowed.includes(toolName)) {
    return {
      allowed: false,
      result: {
        success: false,
        error: "Forbidden. You do not have permission to use this assistant tool.",
      },
    };
  }
  return { allowed: true };
}

function requireAuth(toolName, user) {
  if (!PUBLIC_TOOLS.includes(toolName) && !user?.id) {
    return {
      authenticated: false,
      result: {
        success: false,
        error: "Authentication required for this assistant tool.",
      },
    };
  }
  return { authenticated: true };
}

function parseArgs(toolName, args = {}) {
  const schema = schemas[toolName] || z.object({}).passthrough();
  const parsed = schema.safeParse(args || {});
  if (!parsed.success) {
    return {
      ok: false,
      result: {
        success: false,
        error: "Invalid assistant tool parameters.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
    };
  }
  return { ok: true, data: parsed.data };
}

function safeListing(listing) {
  return {
    id: listing.id,
    title: listing.title,
    description: String(listing.description || "").slice(0, 180),
    pricePerDay: Number(listing.pricePerDay || 0),
    city: listing.city,
    sefer: listing.location || null,
    status: listing.status,
    category: listing.category
      ? {
          id: listing.category.id,
          name: listing.category.name,
          slug: listing.category.slug,
        }
      : null,
    imageUrl: listing.images?.[0]?.imageUrl || null,
    createdAt: listing.createdAt,
  };
}

function safeBooking(booking) {
  return {
    id: booking.id,
    listingTitle: booking.listing?.title || "Listing",
    startDate: booking.startDate,
    endDate: booking.endDate,
    status: booking.status,
    totalAmount: Number(booking.totalAmount || 0),
    userRole: booking.ownerId === booking.renterId ? "participant" : undefined,
  };
}

function safeTicket(ticket) {
  return {
    id: ticket.id,
    subject: ticket.subject,
    priority: ticket.priority,
    status: ticket.status,
    createdAt: ticket.createdAt,
  };
}

async function searchListings(args) {
  const limit = Math.min(args.limit || 10, 20);
  const listings = await listingService.listPublic({
    search: args.searchQuery || args.keyword,
    category: args.categorySlug || args.category,
    city: args.city,
    sefar: args.sefer,
    minPrice: args.minPrice,
    maxPrice: args.maxPrice,
  });
  return {
    success: true,
    count: Math.min(listings.length, limit),
    listings: listings.slice(0, limit).map(safeListing),
  };
}

async function executeTool(name, args, user) {
  const auth = requireAuth(name, user);
  if (!auth.authenticated) return auth.result;

  const authorization = assertAllowed(name, user);
  if (!authorization.allowed) return authorization.result;

  const parsed = parseArgs(name, args);
  if (!parsed.ok) return parsed.result;
  const payload = parsed.data;

  try {
    switch (name) {
      case "searchListings":
        return searchListings(payload);

      case "searchCategories": {
        const categories = await categoryService.list();
        return {
          success: true,
          categories: categories.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description || "",
          })),
        };
      }

      case "searchCities":
        return { success: true, cities: cityEnum };

      case "recommendListings":
        return searchListings({
          categorySlug: payload.categorySlug,
          city: payload.city,
          limit: payload.limit || 6,
        });

      case "faq":
        return {
          success: true,
          answer: getFaqAnswer(payload.topic),
        };

      case "getProfile": {
        const profile = await userService.getUserById(user.id);
        return {
          success: true,
          profile: {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            status: profile.status,
            phone: profile.phone,
            city: profile.city,
            verificationStatus: profile.verificationStatus,
            createdAt: profile.createdAt,
          },
        };
      }

      case "getBookings": {
        const bookings = await bookingService.getMyBookings(user);
        return {
          success: true,
          count: Math.min(bookings.length, 10),
          bookings: bookings.slice(0, 10).map(safeBooking),
        };
      }

      case "getSavedItems":
        return {
          success: true,
          message: "Saved items are available in the user dashboard. This backend does not currently expose a database saved-items tool for the assistant.",
          savedItems: [],
        };

      case "createSupportTicket": {
        const ticket = await supportTicketRepository.create({
          userId: user.id,
          subject: payload.subject,
          message: payload.message,
          priority: payload.priority,
        });
        return {
          success: true,
          message: "Support ticket created.",
          ticket: safeTicket(ticket),
        };
      }

      case "getOwnerListings": {
        const listings = await listingService.listMy(user.id);
        return {
          success: true,
          count: Math.min(listings.length, 10),
          listings: listings.slice(0, 10).map(safeListing),
        };
      }

      case "getPendingListings": {
        const listings = await listingService.listManage();
        const pending = listings.filter((listing) =>
          ["PENDING", "UNDER_REVIEW", "PENDING_APPROVAL"].includes(String(listing.status || "").toUpperCase()),
        );
        return {
          success: true,
          count: Math.min(pending.length, 20),
          listings: pending.slice(0, 20).map(safeListing),
        };
      }

      case "dashboardAnalytics":
        return {
          success: true,
          dashboard: await dashboardService.getAdminDashboard(payload),
        };

      case "supportTickets": {
        const tickets = await supportTicketRepository.findAll();
        const status = String(payload.status || "").toUpperCase();
        const filtered = status
          ? tickets.filter((ticket) => String(ticket.status || "").toUpperCase() === status)
          : tickets;
        return {
          success: true,
          count: Math.min(filtered.length, 20),
          tickets: filtered.slice(0, 20).map(safeTicket),
        };
      }

      case "platformStatistics":
        return {
          success: true,
          dashboard: await dashboardService.getSuperAdminDashboard(payload),
        };

      case "systemHealth":
        return {
          success: true,
          status: "ok",
          service: "EasternCity Rental System API",
          timestamp: new Date().toISOString(),
        };

      default:
        return { success: false, error: `Tool ${name} is not implemented.` };
    }
  } catch (error) {
    return {
      success: false,
      error: "Assistant tool execution failed.",
      detail: error.message,
    };
  }
}

function getFaqAnswer(topicValue) {
  const topic = String(topicValue || "").toLowerCase();
  if (topic.includes("payment") || topic.includes("pay") || topic.includes("booking")) {
    return "Rental booking payments are not handled by the platform. Renters and owners arrange rental payment physically or in person. Platform payments are only for listing fees and promotions.";
  }
  if (topic.includes("listing")) {
    return "Users create listings, upload the listing-fee payment screenshot, and wait for admin review. Approved listings become visible in the marketplace.";
  }
  if (topic.includes("promotion")) {
    return "Users can request promotion for a listing, upload a promotion payment screenshot, and wait for admin approval. Approved promotions activate featured placement.";
  }
  if (topic.includes("verification")) {
    return "Users submit city, sefer, optional address, and front/back National ID images. Admin reviews the request and approves or rejects it.";
  }
  if (topic.includes("cancel")) {
    return "Booking cancellation depends on the agreement between renter and owner. The platform does not process rental refunds because rental payments happen outside the platform.";
  }
  if (topic.includes("support") || topic.includes("help")) {
    return "Users can create support tickets from the Help Center or dashboard. Admins review and reply to support tickets.";
  }
  return "I couldn't find that information. Please use the Help Center or create a support ticket for more help.";
}

module.exports = {
  getToolsForRole,
  executeTool,
  normalizeRole,
};
